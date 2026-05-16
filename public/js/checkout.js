
// Import auth to ensure we have the token

const checkoutContainer = document.getElementById('checkout-items');
const checkoutTotal = document.getElementById('checkout-total');
const orderForm = document.getElementById('order-form');

let currentCart = null;

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    loadCheckoutData();
});

async function loadCheckoutData() {
    // Wait for auth check via cookie
    const user = await Auth.checkAuth();

    if (!user) {
        alert("Please login to proceed.");
        window.location.href = 'shop.html';
        return;
    }

    // Pre-fill Shipping Form from Cloud DB or LocalStorage
    if (user) {
        document.getElementById('fullName').value = user.fullName || '';
        document.getElementById('phone').value = user.phoneNumber || localStorage.getItem('user_phone') || '';
        
        // Fetch from Cloud DB
        try {
            const addrRes = await fetch('/api/address');
            if (addrRes.ok) {
                const addrData = await addrRes.json();
                if (addrData.length > 0) {
                    const ad = addrData[0];
                    document.getElementById('pincode').value = ad.pincode || '';
                    document.getElementById('city').value = ad.city || '';
                    document.getElementById('state').value = ad.state || '';
                    document.getElementById('street').value = ad.street || '';
                } else {
                    // Fallback to localstorage if no DB address exists
                    document.getElementById('pincode').value = localStorage.getItem('user_pincode') || '';
                    document.getElementById('city').value = localStorage.getItem('user_city') || '';
                    document.getElementById('state').value = localStorage.getItem('user_state') || '';
                    document.getElementById('street').value = localStorage.getItem('user_street') || '';
                }
            }
        } catch (err) { console.error("Checkout Address Fetch Error:", err); }
    }

    try {
        // No Bearer token needed
        const res = await fetch('/api/cart');
        
        if (res.status === 401) {
            alert("Session expired.");
            window.location.href = 'shop.html';
            return;
        }

        if (!res.ok) throw new Error('Failed to fetch cart');
        
        currentCart = await res.json();
        renderCheckoutSummary(currentCart);
    } catch (err) {
        console.error("Cart Load Error:", err);
        checkoutContainer.innerHTML = "<p>Error loading order summary.</p>";
    }
}

function renderCheckoutSummary(cart) {
    if (!cart || !cart.items || cart.items.length === 0) {
        checkoutContainer.innerHTML = "<p>Your cart is empty.</p>";
        return;
    }

    let itemsHTML = cart.items.map(item => {
        const product = item.product;
        if(!product) return '';
        const total = item.quantity * product.price;

        return `
            <div class="summary-item">
                <div class="summary-img">
                    <img src="${product.images[0] || 'assets/placeholder.png'}" alt="${product.name}">
                </div>
                <div class="summary-details">
                    <h4>${product.name}</h4>
                    <p>Size: ${item.selectedSize || 'Std'} | Qty: ${item.quantity}</p>
                    <p class="price">₹${total}</p>
                </div>
            </div>
        `;
    }).join('');

    checkoutContainer.innerHTML = itemsHTML;

    // Calculate Total
    const subtotal = cart.items.reduce((acc, item) => {
        return item.product ? acc + (item.quantity * item.product.price) : acc;
    }, 0);

    checkoutTotal.innerHTML = `
        <div class="total-row">
            <span>Total Payable:</span>
            <span>₹${subtotal}</span>
        </div>
    `;
    
    // Store total for submission
    orderForm.dataset.totalAmount = subtotal;
}

// Payment Method Toggle Logic
const paymentRadios = document.querySelectorAll('input[name="paymentMethod"]');
const cardDetails = document.getElementById('card-details');
const upiDetails = document.getElementById('upi-details');

if(paymentRadios) {
    paymentRadios.forEach(radio => {
        radio.addEventListener('change', (e) => {
            const val = e.target.value;
            // Reset
            if(cardDetails) cardDetails.style.display = 'none';
            if(upiDetails) upiDetails.style.display = 'none';

            if(val === 'Card') {
                if(cardDetails) cardDetails.style.display = 'block';
            } else if (val === 'UPI') {
                if(upiDetails) {
                    upiDetails.style.display = 'block';
                    generateUPIQRCode(); // Generate QR when UPI is selected
                }
            }
        });
    });
}

function generateUPIQRCode() {
    // Get total from form dataset (populated by renderCheckoutSummary)
    let totalAmount = orderForm.dataset.totalAmount || "0";
    
    // Ensure it's a valid number string
    const amountVal = parseFloat(totalAmount);
    if (!amountVal || amountVal <= 0) return;

    // UPI Config
    // Format: upi://pay?pa=ADDRESS&pn=NAME&am=AMOUNT&cu=INR
    const vpa = "863915772@ybl"; 
    const name = "Udbhava Enterprise";
    
    // Construct URI
    const upiUri = `upi://pay?pa=${vpa}&pn=${encodeURIComponent(name)}&am=${amountVal.toFixed(2)}&cu=INR`;
    
    // Generate QR Code via API
    // Using 200x200 size
    const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(upiUri)}`;
    
    // Update UI
    const qrImage = document.querySelector('#upi-details img');
    if (qrImage) {
        qrImage.src = qrApiUrl;
    }
    
    // Optional: Add amount display below QR
    const instructionP = document.querySelector('#upi-details p');
    if(instructionP) {
        instructionP.innerHTML = `Scan to Pay <strong style="color: #800000;">₹${amountVal}</strong>`;
    }
}


// Handle Order Submission
if (orderForm) {
    orderForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const btn = document.getElementById('place-order-btn');
        btn.disabled = true;
        btn.textContent = "Processing...";

        // Collect Address Data
        const addressData = {
            fullName: document.getElementById('fullName').value,
            phone: document.getElementById('phone').value,
            street: document.getElementById('street').value,
            city: document.getElementById('city').value,
            state: document.getElementById('state').value,
            pincode: document.getElementById('pincode').value
        };

        // Get Payment Method
        const selectedPayment = document.querySelector('input[name="paymentMethod"]:checked');
        const paymentMethod = selectedPayment ? selectedPayment.value : "COD";

        // Prepare Order Payload
        if (!currentCart || !currentCart.items) return;

        const orderItems = currentCart.items.map(item => ({
            product: item.product._id,
            quantity: item.quantity,
            priceAtPurchase: item.product.price,
            selectedSize: item.selectedSize
        }));

        const payload = {
            orderItems: orderItems,
            deliveryAddress: addressData,
            paymentMethod: paymentMethod,
            totalAmount: Number(orderForm.dataset.totalAmount)
        };

        try {
            const res = await fetch('/api/orders', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                    // Cookie Auth
                },
                body: JSON.stringify(payload)
            });

            const data = await res.json();

            if (res.ok) {
                // Auto-save this address as their default profile address
                try {
                    await fetch('/api/address', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(addressData)
                    });
                } catch(addrErr) { console.error("Could not save address to profile:", addrErr); }

                window.location.href = `order-success.html?orderId=${data._id}&total=${payload.totalAmount}`;
            } else {
                alert(`Order Failed: ${data.message}`);
                btn.disabled = false;
                btn.textContent = "Place Order";
            }
        } catch (err) {
            console.error("Order Submit Error:", err);
            alert("Network error. Please try again.");
            btn.disabled = false;
            btn.textContent = "Place Order";
        }
    });
}

// Add Auto-fetch for Pincode in Checkout Form
const checkoutPinInput = document.getElementById('pincode');
if (checkoutPinInput) {
    checkoutPinInput.addEventListener('input', async (e) => {
        const pin = e.target.value;
        if (pin.length === 6) {
            try {
                const res = await fetch(`https://api.postalpincode.in/pincode/${pin}`);
                const data = await res.json();
                if (data[0].Status === 'Success') {
                    const postOffice = data[0].PostOffice[0];
                    document.getElementById('city').value = postOffice.Name || postOffice.Block;
                    document.getElementById('state').value = postOffice.State;
                }
            } catch (err) { console.error("PIN API Error:", err); }
        }
    });
}
