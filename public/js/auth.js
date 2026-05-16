const Auth = {
    user: null,

    async checkAuth() {
        try {
            const response = await fetch('/api/auth/me');
            if (response.ok) {
                this.user = await response.json();
                this.updateUI(true);
                
                // Auto-redirect admin to dashboard if they are on a public page
                if (this.user.role === 'admin' && !window.location.pathname.includes('admin.html')) {
                    window.location.href = 'admin.html';
                }
                
                return this.user;
            } else {
                this.user = null;
                this.updateUI(false);
                // DISABLED: Don't force login on page load - let users browse freely
                // this.openModal('login');
                return null;
            }
        } catch (error) {
            console.error('Auth Check Error:', error);
            this.updateUI(false);
            return null;
        }
    },
    
    // Alias for compatibility with shop.js
    showLoginModal() {
        this.openModal('login');
    },

    async login(email, password) {
        try {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });

            const contentType = response.headers.get("content-type");
            let data;
            
            if (contentType && contentType.includes("application/json")) {
                data = await response.json();
            } else {
                // If backend crashes/returns HTML (500/502), read as text
                const text = await response.text();
                throw new Error(`Server Error: ${response.status} ${response.statusText}\n${text.substring(0, 100)}...`);
            }

            if (response.ok) {
                this.user = data;
                this.updateUI(true);
                this.closeModal();
                showToast('Login Successful!', 'success');
                
                // Admin Redirect
                if (this.user.role === 'admin') {
                    window.location.href = 'admin.html';
                }
                
                return true;
            } else {
                throw new Error(data.message || 'Login failed');
            }
        } catch (error) {
            console.error('Login Error:', error);
            showToast(error.message, 'error');
            return false;
        }
    },

    async register(fullName, email, password, phoneNumber) {
        try {
            const response = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ fullName, email, password, phoneNumber })
            });

            const data = await response.json();

            if (response.ok) {
                this.user = data;
                this.updateUI(true);
                this.closeModal();
                showToast('Registration Successful!', 'success');
                return true;
            } else {
                throw new Error(data.message || 'Registration failed');
            }
        } catch (error) {
            showToast(error.message, 'error');
            return false;
        }
    },

    async logout() {
        try {
            await fetch('/api/auth/logout', { method: 'POST' });
            this.user = null;
            this.updateUI(false);
            showToast('Logged Out', 'info');
            window.location.reload();
        } catch (error) {
            console.error('Logout Error:', error);
        }
    },

    updateUI(isLoggedIn) {
        const loginBtn = document.getElementById('nav-login-btn');
        const logoutBtn = document.getElementById('nav-logout-btn');
        const userDisplay = document.getElementById('nav-user-display');

        if (isLoggedIn && this.user) {
            if (loginBtn) loginBtn.style.display = 'none';
            if (logoutBtn) logoutBtn.style.display = 'inline-block';
            if (userDisplay) {
                userDisplay.textContent = `Hello, ${this.user.fullName}`;
                userDisplay.style.display = 'inline-block';
            }
        } else {
            if (loginBtn) loginBtn.style.display = 'inline-block';
            if (logoutBtn) logoutBtn.style.display = 'none';
            if (userDisplay) userDisplay.style.display = 'none';
        }
    },

    openModal(mode = 'login') {
        const modal = document.getElementById('auth-modal');
        const loginForm = document.getElementById('login-form-container');
        const registerForm = document.getElementById('register-form-container');
        const modalTitle = document.getElementById('auth-modal-title');

        if (modal) {
            modal.style.display = 'flex';
            if (mode === 'login') {
                loginForm.style.display = 'block';
                registerForm.style.display = 'none';
                modalTitle.textContent = 'Login';
            } else {
                loginForm.style.display = 'none';
                registerForm.style.display = 'block';
                modalTitle.textContent = 'Sign Up';
            }
        }
    },

    closeModal() {
        const modal = document.getElementById('auth-modal');
        if (modal) modal.style.display = 'none';
    },

    async displayProfile() {
        // 1. Remove existing popups
        const existingProfile = document.querySelector("#profilePopup");
        if (existingProfile) existingProfile.remove();
        const existingOverlay = document.querySelector("#profileOverlay");
        if (existingOverlay) existingOverlay.remove();

        // 2. Fetch latest user data and orders
        let userData = this.user;
        let orders = [];
        
        try {
            const userRes = await fetch('/api/auth/me');
            if(userRes.ok) {
                userData = await userRes.json();
                this.user = userData;
            }

            const orderRes = await fetch('/api/orders/myorders');
            if(orderRes.ok) {
                orders = await orderRes.json();
            }

            // NEW: Fetch Wishlist from DB
            const wishlistRes = await fetch('/api/wishlist');
            if(wishlistRes.ok) {
                const wishlistData = await wishlistRes.json();
                this.wishlistItems = wishlistData.products || [];
            }

            // NEW: Fetch Address from DB
            const addressRes = await fetch('/api/address');
            if(addressRes.ok) {
                const addressData = await addressRes.json();
                this.addressData = addressData.length > 0 ? addressData[0] : null;
            }
        } catch (err) {
            console.error("Error fetching profile data:", err);
        }

        if (!userData) {
            showToast("Please login to view profile", "error");
            this.openModal('login');
            return;
        }

        // 3. Prepare HTML Content
        let savedAddress = localStorage.getItem('user_address') || '';
        if (this.addressData) {
            const ad = this.addressData;
            savedAddress = `${ad.street}, ${ad.city}, ${ad.state} - ${ad.pincode}`;
            // Update localstorage to keep it synced
            localStorage.setItem('user_address', savedAddress);
            localStorage.setItem('user_pincode', ad.pincode);
            localStorage.setItem('user_city', ad.city);
            localStorage.setItem('user_state', ad.state);
            localStorage.setItem('user_street', ad.street);
        }
        
        // Use DB items if available, otherwise LocalStorage
        const wishlistItems = this.wishlistItems || JSON.parse(localStorage.getItem('wishlistItems') || '[]');

        let wishlistHTML = '<p style="color:#666; font-size: 0.9rem;">No items in wishlist.</p>';
        if(wishlistItems.length > 0) {
            wishlistHTML = wishlistItems.map(item => {
                const itemId = item.id || item._id;
                const itemPrice = item.price || item.disprice || 'N/A';
                const itemImg = item.img || (item.images && item.images[0]);
                
                return `
                    <div style="display:flex; align-items:center; gap:15px; margin-bottom:15px; border-bottom:1px solid #eee; padding-bottom:10px; position:relative;">
                        <div onclick="window.location.href='product-details.html?id=${itemId}'" 
                             style="display:flex; flex:1; align-items:center; gap:15px; cursor:pointer; transition: background 0.2s;"
                             onmouseover="this.style.background='#fcfcfc'" onmouseout="this.style.background='transparent'"
                             title="View Product">
                            <img src="${itemImg}" style="width:50px; height:65px; object-fit:cover; border-radius:4px; border: 1px solid #eee;">
                            <div>
                                <strong style="display:block; font-size:0.9rem; color: #111;">${item.name}</strong>
                                <span style="color:#800000; font-weight:600; font-size:0.85rem;">₹${itemPrice}</span>
                            </div>
                        </div>
                        <button onclick="Auth.removeFromWishlist('${itemId}')" 
                                style="background:none; border:none; color:#d32f2f; cursor:pointer; padding:10px; font-size:1rem; opacity:0.6;"
                                onmouseover="this.style.opacity='1'" onmouseout="this.style.opacity='0.6'">
                            <i class="fas fa-trash-alt"></i>
                        </button>
                    </div>
                `;
            }).join('');
        }

        let ordersHTML = `<p style="color:#666; font-size: 0.9rem; text-align:center; padding:20px;">No orders yet. Start shopping!</p>`;
        if(orders.length > 0) {
            ordersHTML = orders.map(order => {
                let statusColor = '#ff7b00'; // Default Placed
                if(order.orderStatus === 'Order Received') statusColor = '#00bcd4';
                if(order.orderStatus === 'Order Packed') statusColor = '#9c27b0';
                if(order.orderStatus === 'Shipped') statusColor = '#2196f3';
                if(order.orderStatus === 'Delivered') statusColor = '#2e7d32';
                if(order.orderStatus === 'Cancelled') statusColor = '#d32f2f';

                const itemsHTML = order.items.map(item => {
                    const p = item.product || {};
                    const img = p.images && p.images.length > 0 ? p.images[0] : '/images/placeholder.png';
                    const name = p.name || 'Product unavailable';
                    const sizeText = item.selectedSize && item.selectedSize !== 'Std' ? `Size: ${item.selectedSize}` : '';
                    return `
                        <div style="display:flex; align-items:center; gap:10px; margin-top:10px;">
                            <img src="${img}" style="width:40px; height:50px; object-fit:cover; border-radius:4px; border:1px solid #eee;">
                            <div style="flex:1;">
                                <div style="font-size:0.85rem; color:#111; font-weight:500;">${name}</div>
                                <div style="font-size:0.75rem; color:#666;">Qty: ${item.quantity} ${sizeText ? `| ${sizeText}` : ''}</div>
                            </div>
                        </div>
                    `;
                }).join('');

                return `
                    <div style="margin-bottom: 15px; padding: 15px; border: 1px solid #eee; border-radius: 12px; background: #fff; box-shadow: 0 2px 8px rgba(0,0,0,0.02);">
                        <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:10px;">
                            <div>
                                <strong style="display:block; font-size:0.9rem; color:#111;">Order #${order._id.substring(0, 8)}</strong>
                                <small style="color:#888;">${new Date(order.createdAt).toLocaleDateString()}</small>
                            </div>
                            <span style="background:${statusColor}15; color:${statusColor}; padding:4px 10px; border-radius:20px; font-size:0.75rem; font-weight:700; text-transform:uppercase; letter-spacing:0.5px;">
                                ${order.orderStatus}
                            </span>
                        </div>
                        
                        <!-- Order Items -->
                        <div style="margin-top:10px; margin-bottom:10px;">
                            ${itemsHTML}
                        </div>

                        <div style="display:flex; justify-content:space-between; align-items:center; border-top:1px dashed #eee; pt:10px; margin-top:10px; padding-top:10px;">
                            <span style="color:#666; font-size:0.85rem;">Total: <strong>₹${order.totalAmount}</strong></span>
                            <small style="color:#888;">${order.items.length} Items</small>
                        </div>
                    </div>
                `;
            }).join('');
        }

        // 4. Create UI Elements
        document.body.style.overflow = "hidden";
        
        const overlay = document.createElement("div");
        overlay.id = "profileOverlay";
        Object.assign(overlay.style, {
            position: "fixed", top: "0", left: "0", width: "100vw", height: "100vh",
            backgroundColor: "rgba(0, 0, 0, 0.4)", backdropFilter: "blur(8px)", zIndex: "9998"
        });
        
        const profilePopup = document.createElement("div");
        profilePopup.id = "profilePopup";
        Object.assign(profilePopup.style, {
            position: "fixed", top: "0", right: "0", width: "400px", maxWidth: "90vw", height: "100vh",
            backgroundColor: "#fff", boxShadow: "-5px 0 25px rgba(0,0,0,0.1)", padding: "30px",
            zIndex: "10000", overflowY: "auto", fontFamily: "'Inter', sans-serif"
        });

        profilePopup.innerHTML = `
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:30px;">
                <h2 style="margin:0; font-size:1.5rem; color:#111;">Account</h2>
                <button onclick="document.getElementById('profileOverlay').click()" style="background:none; border:none; font-size:1.5rem; cursor:pointer; color:#888;">&times;</button>
            </div>

            <div style="text-align:center; margin-bottom:40px;">
                <div style="width:70px; height:70px; background:#800000; color:#fff; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:1.5rem; font-weight:bold; margin:0 auto 15px;">
                    ${userData.fullName.charAt(0).toUpperCase()}
                </div>
                <h3 style="margin:0; font-size:1.2rem; color:#111;">${userData.fullName}</h3>
                <p style="margin:5px 0 0; color:#666; font-size:0.9rem;">${userData.email}</p>
            </div>

            <div style="display: flex; gap: 15px; margin-bottom: 25px; border-bottom: 1px solid #eee; padding-bottom: 5px;">
                <button onclick="Auth.switchTab('orders')" id="tab-orders" style="background:none; border:none; border-bottom:2px solid #800000; padding:8px 0; font-weight:600; cursor:pointer; font-size:0.9rem;">Orders</button>
                <button onclick="Auth.switchTab('wishlist')" id="tab-wishlist" style="background:none; border:none; padding:8px 0; font-weight:500; color:#666; cursor:pointer; font-size:0.9rem;">Wishlist</button>
                <button onclick="Auth.switchTab('address')" id="tab-address" style="background:none; border:none; padding:8px 0; font-weight:500; color:#666; cursor:pointer; font-size:0.9rem;">Address</button>
                <button onclick="Auth.switchTab('password')" id="tab-password" style="background:none; border:none; padding:8px 0; font-weight:500; color:#666; cursor:pointer; font-size:0.9rem;">Security</button>
            </div>

            <div id="content-orders" class="p-tab-content">${ordersHTML}</div>
            <div id="content-wishlist" class="p-tab-content" style="display:none;">${wishlistHTML}</div>
            <div id="content-address" class="p-tab-content" style="display:none;">
                <p style="font-size:0.85rem; color:#666; margin-bottom:15px;">Smart Delivery Address</p>
                
                <div style="display:grid; grid-template-columns: 1fr 1fr; gap:10px; margin-bottom:12px;">
                    <div>
                        <label style="font-size:0.75rem; color:#888; display:block; margin-bottom:4px;">PIN Code</label>
                        <input type="text" id="p-pincode" maxlength="6" value="${localStorage.getItem('user_pincode') || ''}" 
                               oninput="Auth.handlePincode(this.value)"
                               placeholder="e.g. 600001" style="width:100%; padding:10px; border:1px solid #ddd; border-radius:8px; font-size:0.9rem;">
                    </div>
                    <div>
                        <label style="font-size:0.75rem; color:#888; display:block; margin-bottom:4px;">State</label>
                        <input type="text" id="p-state" value="${localStorage.getItem('user_state') || ''}" readonly
                               style="width:100%; padding:10px; border:1px solid #ddd; border-radius:8px; background:#f9f9f9; font-size:0.9rem; color:#666;">
                    </div>
                </div>

                <div style="margin-bottom:12px;">
                    <label style="font-size:0.75rem; color:#888; display:block; margin-bottom:4px;">City / Village</label>
                    <input type="text" id="p-city" value="${localStorage.getItem('user_city') || ''}" readonly
                           style="width:100%; padding:10px; border:1px solid #ddd; border-radius:8px; background:#f9f9f9; font-size:0.9rem; color:#666;">
                </div>

                <div style="margin-bottom:15px;">
                    <label style="font-size:0.75rem; color:#888; display:block; margin-bottom:4px;">House No / Street Name</label>
                    <textarea id="p-street" style="width:100%; height:80px; padding:12px; border:1px solid #ddd; border-radius:8px; font-family:inherit; font-size:0.9rem; resize:none;">${localStorage.getItem('user_street') || ''}</textarea>
                </div>

                <button onclick="Auth.saveFullAddress()" style="width:100%; background:#111; color:#fff; border:none; padding:12px; border-radius:8px; cursor:pointer; font-weight:600;">Save Smart Address</button>
                <p id="p-status" style="font-size:0.75rem; text-align:center; margin-top:10px; color:#2e7d32; display:none;"></p>
            </div>
            <div id="content-password" class="p-tab-content" style="display:none;">
                <div style="display:flex; flex-direction:column; gap:10px;">
                    <input type="password" placeholder="Current Password" style="padding:12px; border:1px solid #ddd; border-radius:8px;">
                    <input type="password" placeholder="New Password" style="padding:12px; border:1px solid #ddd; border-radius:8px;">
                    <button style="background:#111; color:#fff; border:none; padding:12px; border-radius:8px; cursor:pointer; font-weight:600;">Update Password</button>
                </div>
            </div>

            <button onclick="Auth.logout()" style="width:100%; margin-top:50px; background:none; border:1px solid #eee; color:#d32f2f; padding:12px; border-radius:8px; cursor:pointer; font-weight:600; display:flex; align-items:center; justify-content:center; gap:8px;">
                <i class="fas fa-sign-out-alt"></i> Logout
            </button>
        `;

        overlay.onclick = () => {
            profilePopup.remove();
            overlay.remove();
            document.body.style.overflow = "auto";
        };

        document.body.appendChild(overlay);
        document.body.appendChild(profilePopup);
    },

    switchTab(tabId) {
        ['orders', 'wishlist', 'address', 'password'].forEach(id => {
            const content = document.getElementById('content-' + id);
            const btn = document.getElementById('tab-' + id);
            if (content) content.style.display = 'none';
            if (btn) {
                btn.style.color = '#666';
                btn.style.borderBottom = 'none';
                btn.style.fontWeight = '500';
            }
        });
        const targetContent = document.getElementById('content-' + tabId);
        const targetBtn = document.getElementById('tab-' + tabId);
        if (targetContent) targetContent.style.display = 'block';
        if (targetBtn) {
            targetBtn.style.color = '#111';
            targetBtn.style.borderBottom = '2px solid #800000';
            targetBtn.style.fontWeight = '600';
        }
    },

    async handlePincode(pin) {
        if (pin.length === 6) {
            const status = document.getElementById('p-status');
            if(status) {
                status.style.display = 'block';
                status.style.color = '#777';
                status.textContent = 'Fetching location...';
            }

            try {
                const res = await fetch(`https://api.postalpincode.in/pincode/${pin}`);
                const data = await res.json();
                
                if (data[0].Status === 'Success') {
                    const postOffice = data[0].PostOffice[0];
                    document.getElementById('p-city').value = postOffice.Name || postOffice.Block;
                    document.getElementById('p-state').value = postOffice.State;
                    if(status) {
                        status.style.color = '#2e7d32';
                        status.textContent = 'Location found!';
                    }
                } else {
                    if(status) {
                        status.style.color = '#d32f2f';
                        status.textContent = 'Invalid PIN code.';
                    }
                }
            } catch (err) {
                console.error("PIN API Error:", err);
            }
        }
    },

    async saveFullAddress() {
        const pin = document.getElementById('p-pincode').value;
        const state = document.getElementById('p-state').value;
        const city = document.getElementById('p-city').value;
        const street = document.getElementById('p-street').value;
        const phone = this.user?.phoneNumber || ""; // Get from user context if available

        if(!pin || !street) {
            showToast('Please fill in all fields', 'error');
            return;
        }

        const addressPayload = {
            fullName: this.user?.fullName,
            phone: phone,
            street, city, state, pincode: pin
        };

        // DB Mode
        if (this.user) {
            try {
                const res = await fetch('/api/address', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(addressPayload)
                });
                if (res.ok) showToast('Address saved to Cloud!', 'success');
            } catch (err) { console.error(err); }
        }

        // Always update LocalStorage for UI consistency
        localStorage.setItem('user_pincode', pin);
        localStorage.setItem('user_state', state);
        localStorage.setItem('user_city', city);
        localStorage.setItem('user_street', street);
        
        const combined = `${street}, ${city}, ${state} - ${pin}`;
        localStorage.setItem('user_address', combined);

        showToast('Smart Address saved!', 'success');
        
        if (window.location.pathname.includes('product-details.html')) {
            window.location.reload();
        }
    },

    async removeFromWishlist(id) {
        if (this.user) {
            // DB Mode
            try {
                const res = await fetch(`/api/wishlist/${id}`, { method: 'DELETE' });
                if (res.ok) {
                    showToast("Removed from Cloud Wishlist", "info");
                    this.displayProfile(); // Refresh
                }
            } catch (err) { console.error(err); }
        } else {
            // Local Mode
            let items = JSON.parse(localStorage.getItem('wishlistItems') || '[]');
            items = items.filter(item => (item.id || item._id) !== id);
            localStorage.setItem('wishlistItems', JSON.stringify(items));
            this.displayProfile();
            showToast("Removed from guest wishlist", "info");
        }
    }
};

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    Auth.checkAuth();

    // Event Listeners for Modal
    const modalClose = document.getElementById('auth-modal-close');
    if (modalClose) modalClose.addEventListener('click', () => Auth.closeModal());
    
    // Switch to Register
    const toRegisterBtn = document.getElementById('switch-to-register');
    if(toRegisterBtn) toRegisterBtn.addEventListener('click', (e) => {
        e.preventDefault();
        Auth.openModal('register');
    });

    // Switch to Login
    const toLoginBtn = document.getElementById('switch-to-login');
    if(toLoginBtn) toLoginBtn.addEventListener('click', (e) => {
         e.preventDefault();
         Auth.openModal('login');
    });

    // Login Form Submit
    const loginForm = document.getElementById('auth-login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const email = loginForm.email.value;
            const password = loginForm.password.value;
            Auth.login(email, password);
        });
    }

    // Register Form Submit
    const registerForm = document.getElementById('auth-register-form');
    if (registerForm) {
        registerForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const fullName = registerForm.fullName.value;
            const email = registerForm.email.value;
            const password = registerForm.password.value;
            const phone = registerForm.phone.value;
            Auth.register(fullName, email, password, phone);
        });
    }

    // Nav Button Listeners (Assuming IDs exist in HTML)
    const navLogin = document.getElementById('nav-login-btn');
    if (navLogin) navLogin.addEventListener('click', (e) => {
        e.preventDefault();
        Auth.openModal('login'); 
    });

    const navLogout = document.getElementById('nav-logout-btn');
    if (navLogout) navLogout.addEventListener('click', (e) => {
        e.preventDefault();
        Auth.logout();
    });

    // Profile Trigger (Global)
    const userDisplay = document.getElementById('nav-user-display');
    if (userDisplay) {
        userDisplay.addEventListener('click', (e) => {
            e.preventDefault();
            Auth.displayProfile();
        });
    }
});
