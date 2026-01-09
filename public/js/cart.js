
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

    renderSummary(subtotal, cart.items.length);
}

function renderSummary(subtotal, count) {
    if(!cartSummary) return;
    
    // Simple summary logic
    const shipping = 0; // Free shipping for now, or logic
    const total = subtotal + shipping;

    cartSummary.innerHTML = `
        <h3>Order Summary</h3>
        <div class="summary-row">
            <span>Subtotal (${count} items)</span>
            <span>₹${subtotal}</span>
        </div>
        <div class="summary-row">
            <span>Shipping</span>
            <span>Free</span>
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
        }
    } catch (e) {
        console.error("Remove Error", e);
    }
}

function proceedToCheckout(grandTotal) {
    window.location.href = 'checkout.html';
}
