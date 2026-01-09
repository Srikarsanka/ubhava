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
        });
    });

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
                    <td><span class="status-badge status-paid">${order.isPaid ? 'Paid' : 'Unpaid (COD)'}</span></td>
                    <td>${new Date(order.createdAt).toLocaleDateString()}</td>
                    <td>
                        <button class="btn-small" onclick="viewOrderDetails('${order._id}')">Details</button>
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
                    ${addr.state} - ${addr.postalCode}<br>
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
        `;

        modal.style.display = 'block';

        // Close logic
        modal.querySelector('.close-modal').onclick = () => modal.style.display = 'none';
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

            tbody.innerHTML = allProducts.map(p => `
                <tr>
                    <td><img src="${p.images[0]}" style="width:40px; height:40px; object-fit:cover; border-radius:4px;"></td>
                    <td>${p.name}</td>
                    <td>${p.category} > ${p.subCategory}</td>
                    <td>₹${p.price}</td>
                    <td class="${p.stockAvailable <= 5 ? 'stock-low' : 'stock-ok'}">
                        ${p.stockAvailable}
                    </td>
                    <td>
                        ${p.stockAvailable > 0 ? 
                            '<span class="status-badge status-paid">In Stock</span>' : 
                            '<span class="status-badge status-failed">Out of Stock</span>'}
                    </td>
                    <td>
                        <button class="btn-small" onclick="editProduct('${p._id}')" style="background-color:#fbc02d; color:#333; margin-right:5px;">Edit</button>
                    </td>
                </tr>
            `).join('');
            
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
    });

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
        document.getElementById('size').value = product.sizes ? product.sizes.join(', ') : '';
        document.getElementById('isTrending').checked = product.isTrending;

        // Handle Cascading Selects
        document.getElementById('category').value = product.category;
        populateSubCategories(product.category, product.subCategory);
    }

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
            size: document.getElementById('size').value
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
                messageEl.textContent = editingProductId ? 'Product Updated Successfully!' : 'Product Added Successfully!';
                messageEl.className = 'message success';
                
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
            messageEl.textContent = 'Error: ' + error.message;
            messageEl.className = 'message error';
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

});
