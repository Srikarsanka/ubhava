document.addEventListener('DOMContentLoaded', async () => {
    // 1. Check Admin Authentication
    const user = await Auth.checkAuth();
    if (!user || user.role !== 'admin') {
        alert("Access Denied: Admins only.");
        window.location.href = "shop.html";
        return;
    }

    // Set Date
    const dateEl = document.getElementById('currentDate');
    if(dateEl) dateEl.textContent = new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

    // --- NAVIGATION ---
    const tabs = document.querySelectorAll('.nav-btn[data-tab]');
    const sections = document.querySelectorAll('.content-section');

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            // UI Toggle
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            
            // Section Toggle
            const targetId = tab.getAttribute('data-tab');
            sections.forEach(sec => sec.classList.remove('active'));
            document.getElementById(targetId).classList.add('active');

            // Data Refresh Trigger
            if(targetId === 'dashboard') loadDashboard();
            if(targetId === 'orders') loadOrders();
            if(targetId === 'inventory') loadInventory();
            if(targetId === 'analysis') loadAnalytics();
            if(targetId === 'festivals') loadFestivals();
            if(targetId === 'coupons') { loadCoupons(); loadDeals(); }
        });
    });

    // ... existing initialization ...

    // --- MODULE: COUPONS & DEALS ---
    async function loadCoupons() {
        try {
            const tbody = document.getElementById('couponsTableBody');
            tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;">Loading...</td></tr>';
            
            const res = await fetch('/api/admin/coupons');
            const coupons = await res.json();

            if (coupons.length === 0) {
                tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;">No active coupons.</td></tr>';
                return;
            }

            tbody.innerHTML = coupons.map(c => `
                <tr style="opacity: ${c.isActive ? 1 : 0.5}">
                    <td><strong>${c.code}</strong><br><small>${c.description}</small></td>
                    <td>${c.discountPercentage}%</td>
                    <td>₹${c.minSpend}</td>
                    <td>
                        <span class="status-badge ${c.isActive ? 'status-paid' : 'status-failed'}">
                            ${c.isActive ? 'Active' : 'Inactive'}
                        </span>
                        ${c.isAiGenerated ? '<br><small>🤖 AI</small>' : ''}
                    </td>
                    <td>
                        <button class="btn-small" onclick="toggleCoupon('${c._id}', ${!c.isActive})" style="background:#fbc02d; color:black;">
                            ${c.isActive ? 'Pause' : 'Activate'}
                        </button>
                        <button class="btn-small" onclick="deleteCoupon('${c._id}')" style="background:#e74c3c; color:white; margin-left:5px;">Delete</button>
                    </td>
                </tr>
            `).join('');

        } catch (error) { console.error("Coupons Error:", error); }
    }

    async function loadDeals() {
        try {
            const container = document.getElementById('dealsList');
            container.innerHTML = 'Loading deals...';

            const res = await fetch('/api/products');
            const products = await res.json();
            const dealProducts = products.filter(p => p.festivePrice > 0);

            if (dealProducts.length === 0) {
                container.innerHTML = '<p>No deals active. AI will generate them automatically during festivals.</p>';
                return;
            }

            container.innerHTML = dealProducts.map(p => `
                <div class="list-item" style="border:1px solid #eee; padding:10px; border-radius:8px;">
                    <img src="${p.images[0]}" style="width:50px; height:50px; object-fit:cover; border-radius:4px;">
                    <div class="item-details">
                        <span style="display:block; font-weight:600;">${p.name}</span>
                        <span style="text-decoration:line-through; color:#999;">₹${p.price}</span>
                        <span style="color:#e74c3c; font-weight:bold;"> ₹${p.festivePrice}</span>
                    </div>
                    <div style="display:flex; gap:5px; flex-direction:column;">
                        <button class="btn-small" onclick="updateDealPrice('${p._id}', ${p.festivePrice})" style="background:#3498db; color:white;">Edit Price</button>
                        <button class="btn-small" onclick="removeDeal('${p._id}')" style="background:#e74c3c; color:white;">Remove</button>
                    </div>
                </div>
            `).join('');
            
            // Expose update function
            window.updateDealPrice = async (id, currentPrice) => {
                const newPrice = prompt("Enter new festive price:", currentPrice);
                if(newPrice === null) return;
                
                const priceVal = parseFloat(newPrice);
                if(isNaN(priceVal) || priceVal <= 0) return showToast("Invalid price", "error");

                try {
                    const res = await fetch(`/api/products/${id}`, {
                        method: 'PUT',
                        headers: {'Content-Type': 'application/json'},
                        body: JSON.stringify({ festivePrice: priceVal })
                    });
                    if(res.ok) {
                        showToast("Price updated successfully", "success");
                        loadDeals();
                    } else {
                        showToast("Update failed", "error");
                    }
                } catch(e) { console.error(e); }
            };

        } catch (error) { console.error("Deals Error:", error); }
    }

    // Actions
    window.toggleCoupon = async (id, status) => {
        if(!confirm(`Set coupon status to ${status ? 'Active' : 'Inactive'}?`)) return;
        await fetch(`/api/admin/coupons/${id}`, {
            method: 'PUT',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ isActive: status })
        });
        loadCoupons();
    };

    window.deleteCoupon = async (id) => {
        if(!confirm("Permanently delete this coupon?")) return;
        await fetch(`/api/admin/coupons/${id}`, { method: 'DELETE' });
        loadCoupons();
    };

    window.removeDeal = async (id) => {
        if(!confirm("Remove this deal? The product price will revert to normal.")) return;
        await fetch(`/api/admin/products/${id}/remove-deal`, { method: 'PUT' });
        loadDeals();
    };

    // Modal Logic for Creation
    // Inject Modal HTML once
    if(!document.getElementById('couponModal')) {
        const modalHTML = `
        <div id="couponModal" class="modal">
            <div class="modal-content" style="max-width:400px;">
                <span class="close-modal" onclick="document.getElementById('couponModal').style.display='none'">&times;</span>
                <h2>Create New Coupon</h2>
                <form id="createCouponForm">
                    <div class="form-group"><label>Code (Uppercase)</label><input type="text" id="cCode" required style="text-transform:uppercase"></div>
                    <div class="form-group"><label>Discount (%)</label><input type="number" id="cDisc" required min="1" max="100"></div>
                    <div class="form-group"><label>Min Spend (₹)</label><input type="number" id="cMin" value="0"></div>
                    <div class="form-group"><label>Description</label><input type="text" id="cDesc" required></div>
                    <div class="form-group"><label>Expiry Date</label><input type="date" id="cExp" required></div>
                    <button type="submit" class="btn-submit">Create Coupon</button>
                </form>
            </div>
        </div>`;
        document.body.insertAdjacentHTML('beforeend', modalHTML);

        document.getElementById('createCouponForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            const data = {
                code: document.getElementById('cCode').value.toUpperCase(),
                discountPercentage: document.getElementById('cDisc').value,
                minSpend: document.getElementById('cMin').value,
                description: document.getElementById('cDesc').value,
                expiryDate: document.getElementById('cExp').value
            };
            
            try {
                const res = await fetch('/api/admin/coupons', {
                    method: 'POST',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify(data)
                });
                const json = await res.json();
                if(res.ok) {
                    alert("Coupon Created!");
                    document.getElementById('couponModal').style.display = 'none';
                    e.target.reset();
                    loadCoupons();
                } else {
                    alert(json.message);
                }
            } catch(err) { alert(err.message); }
        });
    }

    window.openCouponModal = () => document.getElementById('couponModal').style.display = 'block';

    document.getElementById('adminLogoutBtn').addEventListener('click', () => Auth.logout());

    // --- INITIAL LOAD ---
    loadDashboard();

    // --- MODULE: DASHBOARD ---
    async function loadDashboard() {
        try {
            const res = await fetch('/api/admin/stats');
            const data = await res.json();

            // 1. Stats
            document.getElementById('statTotalRevenue').textContent = '₹' + data.totalRevenue.toLocaleString();
            document.getElementById('statMonthlyRevenue').textContent = '₹' + data.monthlyRevenue.toLocaleString();
            document.getElementById('statTotalOrders').textContent = data.totalOrders;

            // 2. Best Sellers
            const bestSellersContainer = document.getElementById('bestSellersList');
            if (data.bestSellers.length === 0) {
                bestSellersContainer.innerHTML = '<p style="color:#888;">No sales data yet.</p>';
            } else {
                bestSellersContainer.innerHTML = data.bestSellers.map(item => `
                    <div class="list-item">
                        <img src="${item.img || 'assets/placeholder.png'}" alt="${item.name}">
                        <div class="item-details">
                            <span style="display:block; font-weight:600;">${item.name}</span>
                            <span style="font-size:0.8rem; color:#666;">Sold: ${item.totalSold}</span>
                        </div>
                        <span class="item-val">₹${item.revenue.toLocaleString()}</span>
                    </div>
                `).join('');
            }

            // 3. Low Stock
            const lowStockContainer = document.getElementById('lowStockList');
            if (data.lowStockProducts.length === 0) {
                lowStockContainer.innerHTML = '<p style="color:green;">All stocks are healthy.</p>';
            } else {
                lowStockContainer.innerHTML = data.lowStockProducts.map(p => `
                     <div class="list-item">
                        <img src="${p.img}" alt="${p.name}">
                        <div class="item-details">
                            <span style="display:block; font-weight:600;">${p.name}</span>
                            <span style="font-size:0.8rem; color:red;">Stock: ${p.stockAvailable}</span>
                        </div>
                        <button class="btn-small" onclick="document.querySelector('[data-tab=inventory]').click()">View</button>
                    </div>
                `).join('');
            }

        } catch (error) {
            console.error("Dashboard Load Error:", error);
        }
    }

    // --- MODULE: ORDERS ---
    async function loadOrders() {
        try {
            const tbody = document.getElementById('ordersTableBody');
            tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;">Loading...</td></tr>';

            const res = await fetch('/api/orders'); // Admin route returns all orders with populated data
            const orders = await res.json();

            if (orders.length === 0) {
                tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;">No orders found.</td></tr>';
                return;
            }

            tbody.innerHTML = orders.map(order => `
                <tr>
                    <td>#${order._id.substring(0, 8)}</td>
                    <td>
                        <strong>${order.user ? order.user.fullName : 'Guest'}</strong><br>
                        <small>${order.user ? order.user.email : ''}</small>
                    </td>
                    <td>₹${order.totalAmount}</td>
                    <td>
                        <span class="status-badge" style="background:${order.orderStatus === 'Delivered' ? '#e8f5e9' : '#fff3e0'}; color:${order.orderStatus === 'Delivered' ? '#2e7d32' : '#e65100'}; border: 1px solid currentColor;">
                            ${order.orderStatus}
                        </span>
                    </td>
                    <td>${new Date(order.createdAt).toLocaleDateString()}</td>
                    <td>
                        <button class="btn-small" onclick="viewOrderDetails('${order._id}')">Manage</button>
                    </td>
                </tr>
            `).join('');
            
            // Expose function globally for the button onclick
            window.viewOrderDetails = (orderId) => {
                const order = orders.find(o => o._id === orderId);
                showOrderModal(order);
            };

        } catch (error) {
            console.error("Orders Load Error:", error);
        }
    }

    function showOrderModal(order) {
        const modal = document.getElementById('orderModal');
        const body = document.getElementById('orderModalBody');
        
        // Construct Address String
        const addr = order.deliveryAddress;
        
        body.innerHTML = `
            <h2 style="border-bottom:1px solid #ddd; padding-bottom:10px; margin-top:0;">Order #${order._id}</h2>
            
            <div style="display:grid; grid-template-columns: 1fr 1fr; gap:20px; margin-bottom:20px;">
                <div>
                    <h4>Customer Info</h4>
                    <p><strong>Name:</strong> ${order.user?.fullName}</p>
                    <p><strong>Email:</strong> ${order.user?.email}</p>
                </div>
                <div>
                    <h4>Shipping Address</h4>
                    <p>${addr.fullName}<br>
                    ${addr.street}, ${addr.city}<br>
                    ${addr.state} - ${addr.pincode}<br>
                    ${addr.phone}</p>
                </div>
            </div>

            <h4>Order Items</h4>
            <div style="max-height:200px; overflow-y:auto; border:1px solid #eee; padding:10px;">
                ${order.items.map(item => `
                    <div style="display:flex; align-items:center; gap:10px; border-bottom:1px solid #f5f5f5; padding:5px 0;">
                        <img src="${item.product?.images[0] || ''}" style="width:40px; height:40px; border-radius:4px; object-fit:cover;">
                        <div style="flex:1;">
                            <strong>${item.name || item.product?.name}</strong><br>
                            <small>Qty: ${item.quantity} | Size: ${item.size || 'N/A'}</small>
                        </div>
                        <span>₹${item.price}</span>
                    </div>
                `).join('')}
            </div>

            <div style="text-align:right; margin-top:20px; font-size:1.2rem;">
                <strong>Total: ₹${order.totalAmount}</strong>
            </div>

            <div style="margin-top:30px; padding:15px; background:#f9f9f9; border-radius:8px; border-top: 2px solid #800000;">
                <h4 style="margin-top:0;">Manage Order Process</h4>
                <div style="display:flex; gap:10px; align-items:center;">
                    <select id="updateStatusSelect" style="flex:1; padding:10px; border-radius:4px; border:1px solid #ccc;">
                        <option value="Placed" ${order.orderStatus === 'Placed' ? 'selected' : ''}>Placed (Waiting)</option>
                        <option value="Order Received" ${order.orderStatus === 'Order Received' ? 'selected' : ''}>Order Received</option>
                        <option value="Order Packed" ${order.orderStatus === 'Order Packed' ? 'selected' : ''}>Order Packed</option>
                        <option value="Shipped" ${order.orderStatus === 'Shipped' ? 'selected' : ''}>Shipped</option>
                        <option value="Delivered" ${order.orderStatus === 'Delivered' ? 'selected' : ''}>Delivered</option>
                        <option value="Cancelled" ${order.orderStatus === 'Cancelled' ? 'selected' : ''}>Cancelled</option>
                    </select>
                    <button onclick="saveOrderStatus('${order._id}')" style="background:#800000; color:#fff; border:none; padding:10px 20px; border-radius:4px; cursor:pointer; font-weight:600;">Update Status</button>
                </div>
                <p id="statusUpdateMsg" style="margin-top:10px; font-size:0.85rem; display:none;"></p>
            </div>
        `;

        modal.style.display = 'block';

        // Close logic
        modal.querySelector('.close-modal').onclick = () => modal.style.display = 'none';

        // Save Status logic
        window.saveOrderStatus = async (id) => {
            const newStatus = document.getElementById('updateStatusSelect').value;
            const msg = document.getElementById('statusUpdateMsg');
            
            try {
                const res = await fetch(`/api/orders/${id}/status`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    credentials: 'include',
                    body: JSON.stringify({ orderStatus: newStatus })
                });
                
                if(res.ok) {
                    msg.textContent = "Status updated successfully!";
                    msg.style.color = "green";
                    msg.style.display = "block";
                    loadOrders(); // Refresh table
                    setTimeout(() => { modal.style.display = 'none'; }, 1000);
                } else {
                    msg.textContent = "Update failed.";
                    msg.style.color = "red";
                    msg.style.display = "block";
                }
            } catch (e) { console.error(e); }
        };
        window.onclick = (e) => { if (e.target === modal) modal.style.display = 'none'; }
    }


    // --- MODULE: INVENTORY ---
    let allProducts = []; // Cache for editing

    async function loadInventory() {
        try {
            const tbody = document.getElementById('inventoryTableBody');
            tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;">Loading...</td></tr>';
            
            const res = await fetch('/api/products');
            allProducts = await res.json(); // Cache

            tbody.innerHTML = allProducts.map(p => {
                let stockDisplay = "";
                if (p.sizeStock && p.sizeStock.length > 0 && p.subCategory !== 'saree' && p.category !== 'toys') {
                    stockDisplay = `<div style="font-size:0.75rem; line-height:1.2;">` + 
                        p.sizeStock.map(s => `<span style="color:${s.stock < 5 ? '#e74c3c' : '#555'}; font-weight:${s.stock < 5 ? 'bold' : 'normal'}">${s.size}: ${s.stock}</span>`).join(' | ') +
                        `</div>`;
                } else {
                    stockDisplay = `<span class="${p.stockAvailable <= 5 ? 'stock-low' : 'stock-ok'}">${p.stockAvailable}</span>`;
                }

                return `
                <tr>
                    <td><img src="${p.images[0]}" style="width:40px; height:40px; object-fit:cover; border-radius:4px;"></td>
                    <td>${p.name}</td>
                    <td>${p.category} > ${p.subCategory}</td>
                    <td>₹${p.price}</td>
                    <td>${stockDisplay}</td>
                    <td>
                        ${(p.stockAvailable > 0 || (p.sizeStock && p.sizeStock.some(s => s.stock > 0))) ? 
                            '<span class="status-badge status-paid">In Stock</span>' : 
                            '<span class="status-badge status-failed">Out of Stock</span>'}
                    </td>
                    <td>
                        <button class="btn-small" onclick="editProduct('${p._id}')" style="background-color:#fbc02d; color:#333; margin-right:5px;">Edit</button>
                    </td>
                </tr>
                `;
            }).join('');
            
            // Allow global access
            window.editProduct = editProduct;

        } catch (error) {
            console.error("Inventory Load Error:", error);
        }
    }

    document.getElementById('refreshInventory').addEventListener('click', loadInventory);


    // --- MODULE: ADD / EDIT PRODUCT ---
    let editingProductId = null; // Track if we are editing

    const categorySelect = document.getElementById('category');
    const subCategorySelect = document.getElementById('subCategory');
    const form = document.getElementById('addProductForm');
    const messageEl = document.getElementById('message');
    const submitBtn = form.querySelector('.btn-submit');
    const formTitle = document.querySelector('#add-product h1');

    // Initialize Size Inputs
    function initSizeInputs() {
        const container = document.getElementById('sizeStockInputs');
        if (!container) return;
        const sizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
        container.innerHTML = sizes.map(size => `
            <div class="size-card" style="background: white; padding: 12px; border-radius: 8px; border: 1px solid #e0e6ed; text-align: center; transition: all 0.2s;">
                <label style="display: block; font-weight: 800; color: #800000; font-size: 0.8rem; margin-bottom: 8px;">${size}</label>
                <input type="number" data-size="${size}" class="size-stock-input" value="0" min="0" 
                    style="width: 100%; border: 1px solid #dcdfe6; border-radius: 4px; padding: 6px; text-align: center; font-weight: 600; font-size: 1rem; outline: none;">
            </div>
        `).join('');

        // Add Listeners
        container.querySelectorAll('.size-stock-input').forEach(input => {
            input.addEventListener('input', calculateTotalStock);
            input.addEventListener('focus', function() {
                this.parentElement.style.borderColor = '#800000';
                this.parentElement.style.boxShadow = '0 2px 8px rgba(128,0,0,0.1)';
            });
            input.addEventListener('blur', function() {
                this.parentElement.style.borderColor = '#e0e6ed';
                this.parentElement.style.boxShadow = 'none';
            });
        });
    }

    function calculateTotalStock() {
        let total = 0;
        document.querySelectorAll('.size-stock-input').forEach(i => {
            total += parseInt(i.value) || 0;
        });
        document.getElementById('totalStockBadge').textContent = total;
        document.getElementById('stock').value = total;
    }

    initSizeInputs();

    // Expanded Categories
    const subCategories = {
        'women': [ 
            { value: 'saree', text: 'Saree' }, 
            { value: 'lehenga', text: 'Lehenga' }, 
            { value: 'Stitched Suit', text: 'Stitched Suit' },
            { value: 'weding-w', text: 'Wedding Collection' } 
        ],
        'men': [ 
            { value: 'Kurta Pajama', text: 'Kurta Pajama' }, 
            { value: 'Kurta Jacket', text: 'Kurta Jacket' }, 
            { value: 'sherwani', text: 'Sherwani' }, 
            { value: 'weding-w', text: 'Wedding Collection' } 
        ],
        'kids': [ { value: 'kids', text: 'Kids Wear' } ],
        'HomeDecor': [ 
            { value: 'home', text: 'Home Decor Items' },
            { value: 'wallart', text: 'Wall Accents' } 
        ],
        'jewellary': [ { value: 'jew', text: 'Jewellery' } ],
        'toys': [ { value: 'toys', text: 'Toys' } ]
    };

    categorySelect.addEventListener('change', () => {
        populateSubCategories(categorySelect.value);
        toggleStockUI();
    });

    subCategorySelect.addEventListener('change', toggleStockUI);

    function toggleStockUI() {
        const cat = categorySelect.value;
        const sub = subCategorySelect.value;
        const sizeStockContainer = document.getElementById('sizeStockContainer');
        const generalStockGroup = document.getElementById('generalStockGroup');
        const totalStockPreview = document.getElementById('totalStockPreview');

        // Logic: Clothing (men, women except saree, kids) supports sizes
        const supportsSizes = (['women', 'men', 'kids'].includes(cat) && sub !== 'saree');

        if (supportsSizes) {
            sizeStockContainer.style.display = 'block';
            generalStockGroup.style.display = 'none';
            totalStockPreview.style.display = 'block';
        } else {
            sizeStockContainer.style.display = 'none';
            generalStockGroup.style.display = 'block';
            totalStockPreview.style.display = 'none';
        }
    }

    // Auto-Calculate Total Stock - Handled in initSizeInputs now
    // document.querySelectorAll('.size-stock-input').forEach(input => { ... })

    function populateSubCategories(cat, selectedSub = null) {
        subCategorySelect.innerHTML = '<option value="" disabled selected>Select Sub-Category</option>'; 
        if (subCategories[cat]) {
            subCategories[cat].forEach(sub => {
                const option = document.createElement('option');
                option.value = sub.value;
                option.textContent = sub.text;
                if(selectedSub && sub.value === selectedSub) option.selected = true;
                subCategorySelect.appendChild(option);
            });
        }
    }

    // Edit Logic
    function editProduct(id) {
        const product = allProducts.find(p => p._id === id);
        if(!product) return;

        editingProductId = id;
        
        // Switch Tab Manually (Directly manipulate classes to avoid triggering the 'click' listener which resets the form)
        document.querySelectorAll('.nav-btn').forEach(t => t.classList.remove('active'));
        document.querySelector('[data-tab="add-product"]').classList.add('active');
        
        document.querySelectorAll('.content-section').forEach(sec => sec.classList.remove('active'));
        document.getElementById('add-product').classList.add('active');
        
        // Update UI Text
        formTitle.textContent = "Edit Product";
        submitBtn.textContent = "Update Product";

        // Fill Form
        document.getElementById('name').value = product.name;
        document.getElementById('price').value = product.price;
        document.getElementById('stock').value = product.stockAvailable;
        document.getElementById('image').value = product.images[0] || '';
        document.getElementById('video').value = product.video || '';
        document.getElementById('description').value = product.description || '';
        
        // Handle Size Stock Inputs
        document.querySelectorAll('.size-stock-input').forEach(input => {
            const size = input.getAttribute('data-size');
            const entry = product.sizeStock ? product.sizeStock.find(s => s.size === size) : null;
            input.value = entry ? entry.stock : 0;
        });

        document.getElementById('isTrending').checked = product.isTrending;

        if (product.pricingConstraints) {
            document.getElementById('maxDiscount').value = product.pricingConstraints.maxDiscount || '';
            document.getElementById('maxPriceCap').value = product.pricingConstraints.maxPrice || '';
        }

        // Handle Edit Mode Initial UI
        document.getElementById('category').value = product.category;
        populateSubCategories(product.category, product.subCategory);
        toggleStockUI();
        
        // Update Total Stock Badge and Size Inputs on load
        if (product.sizeStock && product.sizeStock.length > 0) {
            const total = product.sizeStock.reduce((acc, s) => acc + s.stock, 0);
            document.getElementById('totalStockBadge').textContent = total;
            
            // Populate individual size cards
            product.sizeStock.forEach(s => {
                const input = document.querySelector(`.size-stock-input[data-size="${s.size}"]`);
                if(input) input.value = s.stock;
            });
        } else {
            // Reset if no size stock (e.g. saree)
            document.querySelectorAll('.size-stock-input').forEach(i => i.value = 0);
            document.getElementById('totalStockBadge').textContent = '0';
        }
    }
    
    // Automation Trigger
    document.getElementById('runSmartPricing').addEventListener('click', async () => {
        if(!confirm("⚡ Auto-adjust prices for ALL products based on stock rules? (Low Stock = Surge, High Stock = Discount)")) return;
        try {
             const btn = document.getElementById('runSmartPricing');
             btn.disabled = true;
             btn.textContent = "Processing...";
             
             const res = await fetch('/api/products/auto-price', {
                 method: 'POST',
                 headers: {'Content-Type': 'application/json'}
                 // Cookie auth
             });
             const data = await res.json();
             showToast(data.message, "success");
             loadInventory();
        } catch(e) { showToast("Error running automation", "error"); }
        finally {
             document.getElementById('runSmartPricing').disabled = false;
             document.getElementById('runSmartPricing').textContent = "⚡ Run Smart Pricing";
        }
    });

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        messageEl.textContent = editingProductId ? 'Updating...' : 'Submitting...';
        messageEl.className = 'message';

        const formData = {
            name: document.getElementById('name').value,
            category: document.getElementById('category').value,
            subCategory: document.getElementById('subCategory').value,
            price: parseFloat(document.getElementById('price').value),
            image: document.getElementById('image').value, 
            video: document.getElementById('video').value,
            description: document.getElementById('description').value,
            stock: parseInt(document.getElementById('stock').value),
            isTrending: document.getElementById('isTrending').checked,
            sizeStock: Array.from(document.querySelectorAll('.size-stock-input')).map(input => ({
                size: input.getAttribute('data-size'),
                stock: parseInt(input.value) || 0
            })),
            sizes: Array.from(document.querySelectorAll('.size-stock-input'))
                .filter(input => parseInt(input.value) > 0)
                .map(input => input.getAttribute('data-size')),
            pricingConstraints: {
                maxDiscount: parseFloat(document.getElementById('maxDiscount').value) || 0,
                maxPrice: parseFloat(document.getElementById('maxPriceCap').value) || 0
            }
        };

        const url = editingProductId ? `/api/products/${editingProductId}` : '/api/products';
        const method = editingProductId ? 'PUT' : 'POST';

        try {
            const response = await fetch(url, {
                method: method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            if (response.ok) {
                showToast(editingProductId ? 'Product Updated Successfully!' : 'Product Added Successfully!', 'success');
                messageEl.textContent = "";
                messageEl.className = 'message';
                
                if(!editingProductId) form.reset(); // Only reset on add
                
                // Reset Edit Mode
                editingProductId = null;
                formTitle.textContent = "Add New Product";
                submitBtn.textContent = "Add Product";

                // Refresh Inventory if we were editing
                loadInventory();

            } else {
                const err = await response.json();
                throw new Error(err.message || 'Operation Failed');
            }
        } catch (error) {
            showToast('Error: ' + error.message, 'error');
            messageEl.textContent = "";
        }
    });

    // Reset form when clicking "Add Product" tab to clear edit mode
    document.querySelector('[data-tab="add-product"]').addEventListener('click', () => {
        if(editingProductId) {
             editingProductId = null;
             form.reset();
             formTitle.textContent = "Add New Product";
             submitBtn.textContent = "Add Product";
             messageEl.textContent = "";
        }
    });

    // --- MODULE: ANALYSIS ---
    let timeChart, paymentChart, catChart, topProdChart; 
    let analyticsData = {}; // Store for filtering

    async function loadAnalytics() {
        try {
            const res = await fetch('/api/admin/analytics');
            analyticsData = await res.json();
            
            const statsRes = await fetch('/api/admin/stats');
            const statsData = await statsRes.json();
            analyticsData.bestSellers = statsData.bestSellers || [];

            // Initial Render (Default: Daily)
            updateTimeChart();
            
            // 2. Sales by Category (Doughnut)
            const ctxCat = document.getElementById('categoryChart').getContext('2d');
            if(catChart) catChart.destroy();

            catChart = new Chart(ctxCat, {
                type: 'doughnut',
                data: {
                    labels: analyticsData.salesByCategory.map(d => d._id),
                    datasets: [{
                        data: analyticsData.salesByCategory.map(d => d.revenue),
                        backgroundColor: ['#2c0665', '#ff7b00', '#4BC0C0', '#FF6384', '#36A2EB'],
                        borderWidth: 0
                    }]
                },
                options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'right' } } }
            });

            // 3. Payment Methods (Pie)
            const ctxPayment = document.getElementById('paymentChart').getContext('2d');
            if(paymentChart) paymentChart.destroy();

            paymentChart = new Chart(ctxPayment, {
                type: 'pie',
                data: {
                    labels: analyticsData.salesByPayment.map(d => d._id),
                    datasets: [{
                        data: analyticsData.salesByPayment.map(d => d.count),
                        backgroundColor: ['#4BC0C0', '#FFCD56', '#FF6384', '#2c0665']
                    }]
                },
                options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'right' } } }
            });

            // 4. Top Products (Horizontal Bar)
            const ctxTop = document.getElementById('topProductsChart').getContext('2d');
            if(topProdChart) topProdChart.destroy();
            
            topProdChart = new Chart(ctxTop, {
                type: 'bar',
                data: {
                    labels: analyticsData.bestSellers.map(p => p.name.substring(0, 20) + '...'),
                    datasets: [{
                        label: 'Units Sold',
                        data: analyticsData.bestSellers.map(p => p.totalSold),
                        backgroundColor: '#ff7b00',
                        borderRadius: 4
                    }]
                },
                options: { indexAxis: 'y', responsive: true, maintainAspectRatio: false, scales: { x: { beginAtZero: true } } }
            });

        } catch (error) {
            console.error("Analytics Error:", error);
        }
    }

    // Dynamic Time Filter Logic
    function updateTimeChart() {
        const filter = document.getElementById('timeFilter').value;
        const ctxTime = document.getElementById('salesTimeChart').getContext('2d');
        if(timeChart) timeChart.destroy();

        let labels = [];
        let dataValues = [];
        let labelText = '';

        if (filter === 'daily') {
            labels = analyticsData.salesOverTime.map(d => d._id);
            dataValues = analyticsData.salesOverTime.map(d => d.totalSales);
            labelText = 'Daily Revenue (₹)';
        } else if (filter === 'monthly') {
            labels = analyticsData.salesByMonth.map(d => d._id);
            dataValues = analyticsData.salesByMonth.map(d => d.totalSales);
            labelText = 'Monthly Revenue (₹)';
        } else if (filter === 'yearly') {
            labels = analyticsData.salesByYear.map(d => d._id);
            dataValues = analyticsData.salesByYear.map(d => d.totalSales);
            labelText = 'Yearly Revenue (₹)';
        } else if (filter === 'quarterly') {
            // Process Monthly Data into Quarters
            const quarters = {}; 
            analyticsData.salesByMonth.forEach(d => {
                const [year, month] = d._id.split('-'); // 2024-05
                const q = `Q${Math.ceil(parseInt(month) / 3)} ${year}`;
                quarters[q] = (quarters[q] || 0) + d.totalSales;
            });
            labels = Object.keys(quarters).sort(); // Q1 2024, Q2 2024...
            dataValues = labels.map(k => quarters[k]);
            labelText = 'Quarterly Revenue (₹)';
        }

        timeChart = new Chart(ctxTime, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: labelText,
                    data: dataValues,
                    borderColor: '#2c0665',
                    backgroundColor: 'rgba(44, 6, 101, 0.1)',
                    borderWidth: 2,
                    fill: true,
                    tension: 0.3
                }]
            },
            options: { responsive: true, maintainAspectRatio: false }
        });
    }

    // Export Logic
    window.exportReport = (type) => {
        if (type === 'excel') {
            // 1. Prepare Data for Excel
            const wb = XLSX.utils.book_new();
            
            // Sheet 1: Sales Summary
            const ws_data = [
                ["Date/Period", "Total Revenue", "Orders Count"],
                ...analyticsData.salesByMonth.map(d => [d._id, d.totalSales, d.count])
            ];
            const ws = XLSX.utils.aoa_to_sheet(ws_data);
            XLSX.utils.book_append_sheet(wb, ws, "Monthly Sales");

            // Sheet 2: Top Products
            const ws_prod_data = [
                ["Product Name", "Units Sold", "Total Revenue"],
                ...analyticsData.bestSellers.map(p => [p.name, p.totalSold, p.revenue])
            ];
            const ws_prod = XLSX.utils.aoa_to_sheet(ws_prod_data);
            XLSX.utils.book_append_sheet(wb, ws_prod, "Best Sellers");

            XLSX.writeFile(wb, "Business_Report.xlsx");
            
        } else if (type === 'pdf') {
            // PDF Generation
            const { jsPDF } = window.jspdf;
            const doc = new jsPDF();

            doc.setFontSize(20);
            doc.text("Business Analytics Report", 14, 20);
            doc.setFontSize(12);
            doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 30);

            doc.text("Monthly Sales Performance", 14, 45);
            
            // Table
            const tableData = analyticsData.salesByMonth.map(d => [d._id, `Rs ${d.totalSales}`, d.count]);
            
            doc.autoTable({
                head: [['Period', 'Revenue', 'Orders']],
                body: tableData,
                startY: 50,
                theme: 'grid',
                styles: { fontSize: 10 }
            });

            doc.save("Business_Report.pdf");
        }
    };

    // Expose functions globaly
    window.loadAnalytics = loadAnalytics;
    window.updateTimeChart = updateTimeChart;

    // --- MODULE: FESTIVALS ---
    async function loadFestivals() {
        try {
            const forecastContainer = document.getElementById('aiForecastList');
            const tableBody = document.getElementById('festivalsTableBody');
            
            if(forecastContainer) forecastContainer.innerHTML = '<p>Loading AI data...</p>';
            if(tableBody) tableBody.innerHTML = '<tr><td colspan="4" style="text-align:center;">Loading database...</td></tr>';

            const res = await fetch('/api/admin/festivals');
            const data = await res.json();
            const { allFestivals, aiForecast } = data;

            // 1. AI Forecast
            if (forecastContainer) {
                if (aiForecast.length === 0) {
                    forecastContainer.innerHTML = `
                        <div style="padding: 20px; text-align: center; color: #666; background: #f9f9f9; border-radius: 8px;">
                            <i class="fas fa-wind" style="font-size: 2rem; color: #ccc; margin-bottom: 10px;"></i><br>
                            No festivals detected for the next 5 days.<br>
                            <small>AI is monitoring for new events daily.</small>
                        </div>`;
                } else {
                    forecastContainer.innerHTML = aiForecast.map(f => `
                        <div class="list-item" style="border-left: 4px solid #2ecc71; padding: 15px; background: white; box-shadow: 0 2px 5px rgba(0,0,0,0.05);">
                            <div class="item-details">
                                <span style="display:block; font-weight:700; font-size: 1.1rem; color: #2c0665;">
                                    ${f.name} <span style="font-size: 0.8rem; font-weight: normal; color: #666; background: #eee; padding: 2px 6px; border-radius: 4px;">${f.templateType}</span>
                                </span>
                                <span style="display:block; color: #555; margin-top: 5px;">
                                    📅 ${new Date(f.eventDate).toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })}
                                </span>
                                <span style="display:block; color: #777; font-size: 0.9rem; margin-top: 5px;">
                                    📸 ${f.suggestedImages ? f.suggestedImages.length : 0} Assets Ready
                                </span>
                            </div>
                        </div>
                    `).join('');
                }
            }

            // 2. All Festivals Table
            if (tableBody) {
                if (allFestivals.length === 0) {
                    tableBody.innerHTML = '<tr><td colspan="4" style="text-align:center;">Database is empty.</td></tr>';
                } else {
                    tableBody.innerHTML = allFestivals.map(f => `
                        <tr>
                            <td><strong>${f.name}</strong></td>
                            <td>${new Date(f.eventDate).toISOString().split('T')[0]}</td>
                            <td><span class="status-badge" style="background:#e0e0e0; color:#333;">${f.templateType}</span></td>
                            <td><small>${f.suggestedImages && f.suggestedImages.length > 0 ? f.suggestedImages[0].split('/').pop() : 'None'}</small></td>
                        </tr>
                    `).join('');
                }
            }

        } catch (error) {
            console.error("Festivals Load Error:", error);
        }
    }

});
