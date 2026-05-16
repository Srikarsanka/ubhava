document.addEventListener('DOMContentLoaded', async () => {
    // 1. Get Product ID from URL
    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get('id');

    if (!productId) {
        document.getElementById('product-details-main').innerHTML = `
            <div style="text-align:center; padding: 100px;">
                <h2>Product Not Found</h2>
                <a href="shop.html" style="color: #800000; text-decoration: underline;">Return to Shop</a>
            </div>
        `;
        return;
    }

    // 2. Load Products (from products_data.js)
    if (typeof products === 'undefined' || products.length === 0) {
        document.getElementById('product-details-main').innerHTML = `
            <div style="text-align:center; padding: 100px;">
                <h2>Error Loading Products</h2>
                <a href="shop.html" style="color: #800000; text-decoration: underline;">Return to Shop</a>
            </div>
        `;
        return;
    }

    // 3. Find the Specific Product
    // We check either string or number for ID matching
    let product = products.find(p => p.id == productId || p._id == productId);

    if (!product) {
        try {
            const res = await fetch(`/api/products/${productId}`);
            if (res.ok) {
                product = await res.json();
            }
        } catch(e) {
            console.log("Could not fetch from DB", e);
        }
    }

    if (!product) {
        document.getElementById('product-details-main').innerHTML = `
            <div style="text-align:center; padding: 100px;">
                <h2>Product Not Found</h2>
                <a href="shop.html" style="color: #800000; text-decoration: underline;">Return to Shop</a>
            </div>
        `;
        return;
    }

    // 4. Extract Data (Similar to shop.js modal logic)
    const name = product.name || "Unnamed Product";
    const img = product.images && product.images.length > 0 ? product.images[0] : (product.img || product.image || "/images/moansson/summer_cotton_shirt.png");
    const description = product.description || "Experience the timeless elegance of our handcrafted collections.";
    const price = parseInt(product.price || 0);
    const discountAmount = product.discount || 0;
    
    const orgprice = price + 1000; 
    const disprice = orgprice - (orgprice * 0.1);
    const cat = product.category || "General";
    const subCategory = product.subCategory || "";
    const parentCat = subCategory || "Collection";

    // Format Description
    let descriptionHTML = "";
    if (description.includes("•")) {
        let parts = description.split("•").filter(p => p.trim() !== "");
        descriptionHTML = `<p>${parts[0]}</p><ul>` + 
            parts.slice(1).map(p => `<li>${p.trim()}</li>`).join('') +
            `</ul>`;
    } else {
        descriptionHTML = `<p>${description}</p>`;
    }

    // Sizes
    let sizeOptionsHTML = "";
    let chartDisplayBtn = "";
    let chartDisplayContainer = "";
    
    if (["women", "men", "kids"].includes(cat) && subCategory !== 'saree' && cat !== 'toys') {
        sizeOptionsHTML = `
            <div class="size-selector-container">
                <div style="display:flex; justify-content:space-between; align-items:center;">
                    <strong style="color:#111; font-weight:600;">Select Size:</strong>
                    <button class="size-chart-btn" onclick="document.getElementById('sizeChartContainer').classList.toggle('hidden')" style="background:none; border:none; color:#800000; text-decoration:underline; cursor:pointer;">View Size Chart</button>
                </div>
                <div class="size-options-grid">
                    ${['XS', 'S', 'M', 'L', 'XL', 'XXL'].map(size => {
                        // Check sizeStock array first
                        const sizeEntry = product.sizeStock ? product.sizeStock.find(s => s.size === size) : null;
                        const isAvailable = sizeEntry ? sizeEntry.stock > 0 : (product.sizes && product.sizes.includes(size));
                        
                        if (isAvailable) {
                            return `<button class="size-btn" data-size="${size}">${size}</button>`;
                        } else {
                            return `<button class="size-btn out-of-stock" disabled title="Out of stock" style="opacity:0.4; text-decoration:line-through; cursor:not-allowed;">${size}</button>`;
                        }
                    }).join('')}
                </div>
                <div id="selectedSizeStockInfo" style="margin-top:12px; font-size:0.9rem; font-weight:500; min-height:20px;"></div>
            </div>
        `;

        chartDisplayContainer = `
            <div id="sizeChartContainer" class="size-chart-container hidden">
                <table class="size-chart-table">
                    <thead>
                        <tr>
                            <th>Size</th><th>Bust (in)</th><th>Waist (in)</th><th>Hips (in)</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr><td>XS</td><td>32</td><td>26</td><td>34</td></tr>
                        <tr><td>S</td><td>34</td><td>28</td><td>36</td></tr>
                        <tr><td>M</td><td>36</td><td>30</td><td>38</td></tr>
                        <tr><td>L</td><td>38</td><td>32</td><td>40</td></tr>
                        <tr><td>XL</td><td>40</td><td>34</td><td>42</td></tr>
                    </tbody>
                </table>
            </div>
        `;
    } else if (subCategory === 'saree') {
        sizeOptionsHTML = `
            <div class="size-selector-container">
                <strong style="color:#111; font-weight:600;">Size:</strong>
                <div style="margin-top:10px;">
                    <button class="size-btn active" style="width:auto; padding:0 20px;">Free Size</button>
                </div>
                <p style="font-size:0.8rem; color:#666; margin-top:8px;">This product is one-size-fits-all.</p>
            </div>
        `;
    }

    // Care Instructions
    let careInstructionsHTML = "";
    if (cat === "women" || cat === "saree") {
        careInstructionsHTML = `
            <div style="margin-top:20px; padding-top:20px; border-top:1px solid #eee;">
                <h4 style="margin-bottom:10px; color:#111;">Care Instructions</h4>
                <p style="color:#666; font-size:0.9rem;">Dry clean only. Do not bleach. Keep away from direct sunlight.</p>
            </div>
        `;
    }

    // Wishlist Logic - Sync with DB if logged in
    let wishlistItems = [];
    const pId = String(product.id || product._id);

    if (Auth && Auth.user) {
        try {
            const res = await fetch('/api/wishlist');
            if (res.ok) {
                const data = await res.json();
                wishlistItems = data.products || [];
            }
        } catch (err) { console.error("Wishlist Fetch Error:", err); }
    } else {
        let wishlistStr = localStorage.getItem('wishlistItems');
        wishlistItems = wishlistStr ? JSON.parse(wishlistStr) : [];
    }

    const isWishlisted = wishlistItems.some(item => String(item.id || item._id || item) === pId);
    const wishlistBtnClass = isWishlisted ? "btn-secondary active" : "btn-secondary";

    // Similar Products
    const similarProducts = products.filter(p => p.subCategory === product.subCategory && (p.id !== pId && p._id !== pId)).slice(0, 4);
    let similarProductsHTML = "";
    if (similarProducts.length > 0) {
        similarProductsHTML = `
            <div class="similar-products-section">
                <h3 class="similar-title">You May Also Like</h3>
                <div class="similar-products-grid">
                    ${similarProducts.map(sp => {
                        const spOrgPrice = parseInt(sp.price || 0) + 1000;
                        const spDisPrice = spOrgPrice - (spOrgPrice * 0.1);
                        const spId = sp.id || sp._id;
                        return `
                        <div class="similar-card" onclick="window.location.href='product-details.html?id=${spId}'">
                            <div class="similar-img-wrapper">
                                <img src="${sp.img || (sp.images && sp.images[0])}" alt="${sp.name}">
                            </div>
                            <div class="similar-info">
                                <p class="brand-subtitle">RECOMMENDED</p>
                                <h4>${sp.name}</h4>
                                <div class="similar-price">
                                  <span class="current-price">₹${spDisPrice.toFixed(0)}</span>
                                  <span class="original-price">₹${spOrgPrice}</span>
                                </div>
                            </div>
                        </div>
                    `}).join('')}
                </div>
            </div>
        `;
    }

    // Inject HTML
    document.getElementById('product-details-main').innerHTML = `
        <div class="page-layout-wrapper">
            <div class="product-split-view">
                <div class="product-image-side">
                    <div class="product-gallery">
                        <div class="thumbnail-list">
                            <img src="${img}" class="thumbnail active" onmouseover="document.getElementById('mainProductImage').src=this.src" />
                            <img src="${img}" class="thumbnail" onmouseover="document.getElementById('mainProductImage').src=this.src" />
                            <img src="${img}" class="thumbnail" onmouseover="document.getElementById('mainProductImage').src=this.src" />
                        </div>
                        <div class="main-image-container">
                            <img src="${img}" alt="${name}" class="main-product-image" id="mainProductImage"/>
                        </div>
                    </div>
                </div>
                <div class="product-info-side">
                    <div class="breadcrumb">Home / ${parentCat} / ${cat}</div>
                    <h2 class="product-title-detail">${name}</h2>
                    
                    <div class="reviews-summary">
                        <div class="stars">
                            <i class="fas fa-star"></i>
                            <i class="fas fa-star"></i>
                            <i class="fas fa-star"></i>
                            <i class="fas fa-star"></i>
                            <i class="fas fa-star-half-alt"></i>
                        </div>
                        <span class="review-count">4.8 (124 Reviews)</span>
                    </div>

                    <div class="product-price-row">
                        <span class="current-price">₹${disprice.toFixed(0)}</span>
                        <span class="original-price">₹${orgprice}</span>
                        <span class="discount-badge">${Math.round(((orgprice-disprice)/orgprice)*100)}% OFF</span>
                    </div>
                    
                    <div class="product-desc-area">
                        <div class="product-description">${descriptionHTML}</div>
                        ${careInstructionsHTML}
                    </div>

                    <div class="selectors-wrapper">
                        ${sizeOptionsHTML}
                        <div class="quantity-selector-container">
                            <strong style="color:#111; display:block; margin-bottom:12px; font-weight:600;">Quantity:</strong>
                            <div class="quantity-controls">
                                <button class="qty-btn" onclick="let q=document.getElementById('productQty'); if(q.value>1)q.value--">-</button>
                                <input type="number" id="productQty" value="1" min="1" max="10" readonly>
                                <button class="qty-btn" onclick="let q=document.getElementById('productQty'); if(q.value<10)q.value++">+</button>
                            </div>
                        </div>
                    </div>
                    
                    ${chartDisplayContainer}

                    <div class="delivery-info" style="flex-direction: column;">
                        <div style="display: flex; align-items: flex-start; gap: 15px; width: 100%;">
                            <i class="fas fa-map-marker-alt" style="margin-top: 5px;"></i>
                            <div class="delivery-text" style="width: 100%;">
                                <strong>Delivery Information</strong>
                                <div style="font-size: 0.85rem; color: #555; margin-top: 8px; margin-bottom: 8px; padding: 10px; background: #f9f9f9; border-radius: 4px; border: 1px solid #eee;">
                                    <strong style="color: #111;">Deliver to:</strong><br>
                                    ${localStorage.getItem('user_address') || '<span style="color: #999;">No address saved. Please update in your profile.</span>'}
                                </div>
                                <span style="font-size: 0.8rem; color: #777;">Dispatches from Chennai Storage Hub</span>
                                <div style="display: flex; gap: 10px; margin-top: 10px;">
                                    <input type="text" id="pincode-input" placeholder="Enter PIN Code" maxlength="6" style="padding: 8px; border: 1px solid #ccc; border-radius: 4px; flex-grow: 1;">
                                    <button onclick="estimateDelivery()" style="background: #111; color: #fff; border: none; padding: 0 15px; border-radius: 4px; cursor: pointer;">Check</button>
                                </div>
                                <div id="delivery-estimation-result" style="margin-top: 8px; font-weight: 500; font-size: 0.9rem; display: none;"></div>
                            </div>
                        </div>
                    </div>

                    <div class="action-buttons">
                        <button class="btn-primary" id="addToCartPageBtn">Add to Bag</button>
                        <button class="${wishlistBtnClass}" id="addToWishlistPageBtn">
                            <i class="${isWishlisted ? 'fas' : 'far'} fa-heart"></i> ${isWishlisted ? 'Wishlisted' : 'Wishlist'}
                        </button>
                    </div>
                </div>
            </div>
            ${similarProductsHTML}
        </div>
    `;
    
    // 6. Setup Size Selection Interactivity
    const sizeBtns = document.querySelectorAll('.size-btn:not(.out-of-stock)');
    const stockInfo = document.getElementById('selectedSizeStockInfo');
    const addToCartBtn = document.getElementById('addToCartPageBtn');

    sizeBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            sizeBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            const selectedSize = btn.getAttribute('data-size');
            const sizeEntry = product.sizeStock ? product.sizeStock.find(s => s.size === selectedSize) : null;
            
            if (sizeEntry) {
                if (sizeEntry.stock <= 5 && sizeEntry.stock > 0) {
                    stockInfo.innerHTML = `<span style="color:#d32f2f;"><i class="fas fa-fire"></i> Hurry! Only ${sizeEntry.stock} left in size ${selectedSize}</span>`;
                    addToCartBtn.disabled = false;
                } else if (sizeEntry.stock > 5) {
                    stockInfo.innerHTML = `<span style="color:#2e7d32;"><i class="fas fa-check-circle"></i> Size ${selectedSize} is In Stock</span>`;
                    addToCartBtn.disabled = false;
                } else {
                    stockInfo.innerHTML = `<span style="color:#d32f2f;">Size ${selectedSize} is Out of Stock</span>`;
                    addToCartBtn.disabled = true;
                }
            } else {
                stockInfo.innerHTML = ""; // Fallback for products without sizeStock data
                addToCartBtn.disabled = false;
            }
        });
    });

    // Define Delivery Estimator
    window.estimateDelivery = async (autoPin = null) => {
        const pinInput = document.getElementById('pincode-input');
        const pin = autoPin || pinInput.value;
        const resultDiv = document.getElementById('delivery-estimation-result');
        
        if(pin && pin.length === 6 && !isNaN(pin)) {
            resultDiv.style.display = 'block';
            resultDiv.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Checking location...';
            
            let city = 'your location';
            
            // If it's the saved pin, we already know the city
            if (pin === localStorage.getItem('user_pincode')) {
                city = localStorage.getItem('user_city') || 'your location';
            } else {
                // Fetch city for this new pin
                try {
                    const res = await fetch(`https://api.postalpincode.in/pincode/${pin}`);
                    const data = await res.json();
                    if (data[0].Status === 'Success') {
                        city = data[0].PostOffice[0].Name || data[0].PostOffice[0].Block;
                    }
                } catch (e) { console.error(e); }
            }

            // Smart Estimation Logic: Distance from Chennai Hub
            let days = 5;
            const startDigit = pin.charAt(0);
            if(startDigit === '6') days = 2;
            else if(startDigit === '5') days = 3;
            else if(['4', '3'].includes(startDigit)) days = 4;
            else days = 6;

            const today = new Date();
            today.setDate(today.getDate() + days);
            const dateStr = today.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });
            
            resultDiv.style.color = '#2e7d32';
            resultDiv.innerHTML = `
                <div style="background: #e8f5e9; padding: 10px; border-radius: 8px; border-left: 4px solid #2e7d32;">
                    <i class="fas fa-shipping-fast"></i> Estimated Delivery to <strong>${city}</strong> by <br>
                    <span style="font-size: 1.1rem; color: #111;">${dateStr}</span>
                </div>
            `;
        } else {
            resultDiv.style.display = 'block';
            resultDiv.style.color = '#d32f2f';
            resultDiv.innerHTML = '<i class="fas fa-exclamation-circle"></i> Please enter a valid 6-digit PIN code.';
        }
    };

    // Auto-run if PIN is saved
    const savedPin = localStorage.getItem('user_pincode');
    if (savedPin) {
        document.getElementById('pincode-input').value = savedPin;
        window.estimateDelivery(savedPin);
    }

    // Setup Add to Cart Event
    document.getElementById('addToCartPageBtn').addEventListener('click', async () => {
        let size = "S";
        const sizeBtns = document.querySelectorAll('.size-btn');
        if(sizeBtns.length > 0) {
            let selected = false;
            sizeBtns.forEach(b => {
                if(b.classList.contains('active')) {
                    size = b.textContent;
                    selected = true;
                }
            });
            if(!selected) {
                if(window.showToast) window.showToast("Please select a size first!", "error");
                else alert("Please select a size first!");
                return;
            }
        }

        const qty = parseInt(document.getElementById('productQty').value) || 1;
        const btn = document.getElementById('addToCartPageBtn');
        const originalText = btn.innerHTML;
        
        btn.disabled = true;
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Adding...';

        try {
            // Check if user is logged in (using Auth object)
            if (Auth && Auth.user) {
                // SEND TO BACKEND
                const res = await fetch('/api/cart', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        productId: pId,
                        quantity: qty,
                        size: size
                    })
                });

                if (res.ok) {
                    const cart = await res.json();
                    if(window.showToast) window.showToast("Added to your Bag!", "success");
                    
                    // Update cart count in header
                    const cartCountElement = document.getElementById('cart-count');
                    if (cartCountElement) {
                        cartCountElement.textContent = cart.items.reduce((sum, item) => sum + item.quantity, 0);
                    }
                } else {
                    const err = await res.json();
                    throw new Error(err.message || "Failed to add to cart");
                }
            } else {
                // FALLBACK TO LOCALSTORAGE for guests
                let cartItems = JSON.parse(localStorage.getItem('cartItems')) || [];
                const existing = cartItems.find(item => item.id === pId && item.size === size);
                if (existing) existing.quantity += qty;
                else {
                    cartItems.push({
                        id: pId, name: product.name, price: disprice, img: img,
                        quantity: qty, size: size
                    });
                }
                localStorage.setItem('cartItems', JSON.stringify(cartItems));
                if(window.showToast) window.showToast("Added to guest bag!", "success");
            }

            // SUCCESS UI: Show "Go to Cart" button at bottom
            showGoToCartBar();
            
            btn.innerHTML = '<i class="fas fa-check"></i> Added';
            setTimeout(() => {
                btn.innerHTML = originalText;
                btn.disabled = false;
            }, 2000);

        } catch (e) {
            console.error(e);
            if(window.showToast) window.showToast(e.message || "Error adding to bag", "error");
            btn.innerHTML = originalText;
            btn.disabled = false;
        }
    });

    function showGoToCartBar() {
        // Remove existing if any
        const existing = document.getElementById('go-to-cart-bar');
        if (existing) existing.remove();

        const bar = document.createElement('div');
        bar.id = 'go-to-cart-bar';
        Object.assign(bar.style, {
            position: 'fixed', bottom: '20px', left: '50%', transform: 'translateX(-50%)',
            width: '90%', maxWidth: '500px', background: '#111', color: '#fff',
            padding: '15px 25px', borderRadius: '50px', display: 'flex',
            justifyContent: 'space-between', alignItems: 'center',
            boxShadow: '0 10px 30px rgba(0,0,0,0.3)', zIndex: '9999',
            animation: 'slideUp 0.4s ease-out'
        });

        bar.innerHTML = `
            <div style="display:flex; align-items:center; gap:12px;">
                <i class="fas fa-shopping-bag" style="color:#800000;"></i>
                <span style="font-weight:500; font-size:0.95rem;">Product added to your bag</span>
            </div>
            <a href="cart.html" style="background:#fff; color:#111; padding:8px 20px; border-radius:20px; text-decoration:none; font-weight:700; font-size:0.85rem;">GO TO BAG &rarr;</a>
        `;
        document.body.appendChild(bar);
        
        // Add animation style if not exists
        if (!document.getElementById('cart-bar-style')) {
            const style = document.createElement('style');
            style.id = 'cart-bar-style';
            style.innerHTML = `
                @keyframes slideUp {
                    from { transform: translate(-50%, 100px); opacity: 0; }
                    to { transform: translate(-50%, 0); opacity: 1; }
                }
            `;
            document.head.appendChild(style);
        }
    }

    // Setup Wishlist Event
    const wishlistBtn = document.getElementById('addToWishlistPageBtn');
    wishlistBtn.addEventListener('click', async function() {
        // Use pId from line 146
        const currentId = pId;

        // DB Mode (Logged In)
        if (Auth && Auth.user) {
            const isCurrentlyWishlisted = this.classList.contains('active');
            const method = isCurrentlyWishlisted ? 'DELETE' : 'POST';
            const url = isCurrentlyWishlisted ? `/api/wishlist/${currentId}` : '/api/wishlist';

            try {
                const res = await fetch(url, {
                    method: method,
                    headers: { 'Content-Type': 'application/json' },
                    body: isCurrentlyWishlisted ? null : JSON.stringify({ productId: currentId })
                });

                if (res.ok) {
                    if (isCurrentlyWishlisted) {
                        this.innerHTML = `<i class="far fa-heart"></i> Wishlist`;
                        this.classList.remove('active');
                        this.className = "btn-secondary";
                        if(window.showToast) window.showToast("Removed from Cloud Wishlist", "info");
                    } else {
                        this.innerHTML = `<i class="fas fa-heart"></i> Wishlisted`;
                        this.classList.add('active');
                        this.className = "btn-secondary active";
                        if(window.showToast) window.showToast("Saved to Cloud Wishlist!", "success");
                    }
                }
            } catch (err) { console.error("Wishlist API Error:", err); }
        } else {
            // LocalStorage Fallback (Guest)
            let items = JSON.parse(localStorage.getItem('wishlistItems')) || [];
            const index = items.findIndex(item => String(item.id || item._id) === currentId);
            
            if (index > -1) {
                items.splice(index, 1);
                this.innerHTML = `<i class="far fa-heart"></i> Wishlist`;
                this.className = "btn-secondary";
                if(window.showToast) window.showToast("Removed from guest wishlist", "info");
            } else {
                items.push(product);
                this.innerHTML = `<i class="fas fa-heart"></i> Wishlisted`;
                this.className = "btn-secondary active";
                if(window.showToast) window.showToast("Added to guest wishlist!", "success");
            }
            localStorage.setItem('wishlistItems', JSON.stringify(items));
        }
    });

    // Setup Size Selection
    document.querySelectorAll('.size-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            document.querySelectorAll('.size-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
        });
    });

});
