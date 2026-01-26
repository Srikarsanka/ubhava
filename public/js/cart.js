
// Import auth to ensure we have the token
// Assumes auth.js is loaded in the HTML

const cartContainer = document.getElementById('cart-container');
const cartSummary = document.getElementById('cart-summary');

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    loadCart();
});

async function loadCart() {
    // Wait for Auth check to confirm login status via Cookie
    const user = await Auth.checkAuth();
    
    if (!user) {
        showEmptyState("Please login to view your cart.", true);
        return;
    }

    try {
        // No need for Bearer token, Cookie is sent automatically
        const res = await fetch('/api/cart');
        
        if (res.status === 401) {
             showEmptyState("Session expired. Please login again.", true);
             return;
        }
        
        if (!res.ok) throw new Error('Failed to fetch cart');
        
        const cart = await res.json();
        renderCart(cart);
    } catch (err) {
        console.error("Cart Load Error:", err);
        showEmptyState("Could not load your cart. Please try again.", false);
    }
}

function renderCart(cart) {
    if (!cart || !cart.items || cart.items.length === 0) {
        showEmptyState("Your cart is empty.", false);
        // Reset summary
        if(cartSummary) cartSummary.innerHTML = '';
        return;
    }

    // Build Table HTML
    let itemsHTML = cart.items.map(item => {
        const product = item.product;
        // Check if product still exists (it might have been deleted)
        if(!product) return ''; 
        
        const totalItemPrice = item.quantity * product.price;

        return `
            <tr class="cart-item-row">
                <td class="product-col">
                    <div class="product-info-flex">
                        <img src="${product.images[0] || 'assets/placeholder.png'}" alt="${product.name}">
                        <div class="product-text">
                            <h4>${product.name}</h4>
                            <span class="meta">Size: ${item.selectedSize || 'Standard'}</span>
                        </div>
                    </div>
                </td>
                <td class="price-col">₹${product.price}</td>
                <td class="qty-col">
                    <div class="qty-controls">
                        <button onclick="updateCartItem('${product._id}', -1, '${item.selectedSize}')">-</button>
                        <span>${item.quantity}</span>
                        <button onclick="updateCartItem('${product._id}', 1, '${item.selectedSize}')">+</button>
                    </div>
                </td>
                <td class="total-col">₹${totalItemPrice}</td>
                <td class="action-col">
                    <button class="remove-btn" onclick="removeCartItem('${product._id}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `;
    }).join('');

    // Table Structure
    cartContainer.innerHTML = `
        <table class="cart-table">
            <thead>
                <tr>
                    <th>Product</th>
                    <th>Price</th>
                    <th>Quantity</th>
                    <th>Total</th>
                    <th>Action</th>
                </tr>
            </thead>
            <tbody>
                ${itemsHTML}
            </tbody>
        </table>
    `;

    // Calculate Totals
    const subtotal = cart.items.reduce((acc, item) => {
        return item.product ? acc + (item.quantity * item.product.price) : acc;
    }, 0);

    renderSummary(subtotal, cart.items.length, cart.appliedCoupon, cart.discountTotal);
}

function renderSummary(subtotal, count, appliedCoupon, discountTotal) {
    if(!cartSummary) return;
    
    const shipping = 0;
    const total = subtotal + shipping - (discountTotal || 0);

    cartSummary.innerHTML = `
        <h3>Order Summary</h3>
        <div class="summary-row">
            <span>Subtotal (${count} items)</span>
            <span>₹${subtotal}</span>
        </div>
        ${appliedCoupon ? `
        <div class="summary-row" style="color: #2e7d32; font-weight: 600;">
            <span>Discount (${appliedCoupon.code} - ${appliedCoupon.discountPercentage}%)</span>
            <span>-₹${discountTotal}</span>
            <button onclick="removeCoupon()" style="background:none; border:none; color:red; cursor:pointer; font-size:0.8rem; margin-left:5px;">(Remove)</button>
        </div>
        ` : ''}
        <div class="summary-row">
            <span>Shipping</span>
            <span>Free</span>
        </div>
        
        <!-- Coupon Section -->
        <div class="coupon-section">
            <div id="available-toggle" class="available-coupons-title" onclick="showAvailableCoupons()">
                <i class="fas fa-ticket-alt"></i> View Available Offers
            </div>
            ${!appliedCoupon ? `
            <div class="coupon-input-group">
                <input type="text" id="coupon-input" placeholder="ENTER CODE">
                <button class="apply-coupon-btn" onclick="applyCoupon()">APPLY</button>
            </div>
            ` : '<p style="color:green; font-size:0.9rem; margin-top:10px;">Coupon Applied Successfully!</p>'}
            <div id="coupon-feedback" class="coupon-feedback"></div>
        </div>

        <hr>
        <div class="summary-row total">
            <span>Total</span>
            <span>₹${total}</span>
        </div>
        <button id="checkout-btn" class="checkout-btn" onclick="proceedToCheckout(${total})">
            PROCEED TO CHECKOUT
        </button>
    `;
}

async function showAvailableCoupons() {
    try {
        // Fetch active coupons from Admin API (public read-only needed?) or Festival Context
        // For now, let's stick to Festival Context as it's public
        const res = await fetch('/api/festival-context');
        if (!res.ok) return;
        const context = await res.json();
        
        if (context.special_offers && context.special_offers.length > 0) {
            const feedback = document.getElementById('coupon-feedback');
            feedback.innerHTML = context.special_offers.map(offer => `
                <div style="border: 1px dashed var(--secondary-color); padding: 10px; margin-top: 10px; border-radius: 4px; cursor:pointer;" onclick="document.getElementById('coupon-input').value = '${offer.discount_code}'">
                    <strong style="color: var(--primary-color);">${offer.discount_code}</strong>: 
                    ${offer.discount_percentage}% OFF (Min ₹${offer.min_spend || 0})
                    <br><small>Click to use</small>
                </div>
            `).join('');
            feedback.className = 'coupon-feedback success';
            feedback.style.display = 'block';
        } else {
            showToast("No active festival coupons today. Check back soon!", "info");
        }
    } catch (e) { console.error(e); }
}

async function applyCoupon() {
    const input = document.getElementById('coupon-input');
    const feedback = document.getElementById('coupon-feedback');
    const code = input.value.trim();

    if (!code) return;

    try {
        const res = await fetch('/api/cart/coupon', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ code })
        });

        const result = await res.json();

        if (res.ok) {
            showToast(result.message, "success");
            renderCart(result); 
        } else {
            showToast(result.message, "error");
        }
    } catch (e) {
        showToast("Error applying coupon.", "error");
    }
}

async function removeCoupon() {
    if(!confirm("Remove applied coupon?")) return;
    try {
        const res = await fetch('/api/cart/coupon', { method: 'DELETE' });
        if(res.ok) {
            const cart = await res.json();
            renderCart(cart);
        }
    } catch(e) { console.error(e); }
}


function showEmptyState(msg, showLoginBtn = false) {
    let html = `
        <div class="empty-cart-state">
            <i class="fas fa-shopping-bag"></i>
            <h3>${msg}</h3>
    `;
    
    if (showLoginBtn) {
        html += `<a href="shop.html" class="continue-btn" onclick="event.preventDefault(); Auth.showLoginModal();">Login to Shop</a> <br><br>`;
    }
    
    html += `
            <a href="shop.html" class="continue-btn">Continue Shopping</a>
        </div>
    `;

    cartContainer.innerHTML = html;
    if(cartSummary) cartSummary.innerHTML = '';
}

// Action: Update Quantity
async function updateCartItem(productId, change, size) {
    try {
        const res = await fetch('/api/cart', {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json'
                // Cookie sent automatically
            },
            body: JSON.stringify({
                productId: productId,
                quantity: change,
                size: size 
            })
        });

        if (res.ok) {
            const updatedCart = await res.json();
            renderCart(updatedCart); // Re-render with new data
        } else {
            console.error("Update failed");
        }
    } catch (e) {
        console.error("Network Error", e);
    }
}

// Action: Remove Item completely
async function removeCartItem(productId) {
    if(!confirm('Remove this item from cart?')) return;

    try {
        const res = await fetch(`/api/cart/${productId}`, {
            method: 'DELETE'
            // Cookie sent automatically
        });

        if (res.ok) {
            const updatedCart = await res.json();
            renderCart(updatedCart);
            showToast("Item removed", "success");
        }
    } catch (e) {
        console.error("Remove Error", e);
    }
}

function proceedToCheckout(grandTotal) {
    window.location.href = 'checkout.html';
}
