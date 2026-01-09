

document.addEventListener('DOMContentLoaded', async () => {
    
    // Get Order ID from URL
    const urlParams = new URLSearchParams(window.location.search);
    const orderId = urlParams.get('orderId');

    if (!orderId) {
        alert('No Order ID found. Redirecting to shop.');
        window.location.href = 'shop.html';
        return;
    }

    // Wait for Auth check via Cookie
    const user = await Auth.checkAuth();
    if (!user) {
         alert('Please login to view invoice.');
         window.location.href = 'shop.html';
         return;
    }

    try {
        // No Bearer token needed
        const res = await fetch(`/api/orders/${orderId}`);

        if (res.status === 401) {
             alert('Session expired.');
             window.location.href = 'shop.html';
             return;
        }

        if (!res.ok) throw new Error('Order not found');

        const order = await res.json();
        renderInvoice(order);

    } catch (err) {
        console.error("Invoice Error:", err);
        document.getElementById('invoice-container').innerHTML = "<p style='text-align:center; color:red'>Error loading invoice.</p>";
    }
});

function renderInvoice(order) {
    const { deliveryAddress, items, totalAmount, createdAt } = order;

    // 1. Customer Info (Using Shipping Address for now)
    document.getElementById('customer-name').textContent = `Name: ${deliveryAddress.fullName || 'N/A'}`;
    document.getElementById('customer-phone').textContent = `Phone: ${deliveryAddress.phone || 'N/A'}`;
    document.getElementById('customer-address').textContent = `Email: ${order.user.email || 'N/A'}`; // User email from populate

    // 2. Shipping Info
    const fullAddress = `${deliveryAddress.street}, ${deliveryAddress.city}, ${deliveryAddress.state} - ${deliveryAddress.pincode}`;
    document.getElementById('ship-name').textContent = deliveryAddress.fullName;
    document.getElementById('ship-phone').textContent = deliveryAddress.phone;
    document.getElementById('ship-address').textContent = fullAddress;

    // 3. Items
    const itemsContainer = document.getElementById('cart-items');
    let itemsHTML = `
        <table style="width:100%; border-collapse:collapse; text-align:left;">
            <thead>
                <tr style="border-bottom:2px solid #ddd;">
                    <th style="padding:10px;">Item</th>
                    <th style="padding:10px;">Qty</th>
                    <th style="padding:10px;">Price</th>
                    <th style="padding:10px;">Total</th>
                </tr>
            </thead>
            <tbody>
    `;

    // Note: In real backend, items might populate 'product' details fully, or store snapshots.
    // Our Order model stores product ID. We might need to handle populated or snapshot data.
    // Wait, Order schema stores snapshots: priceAtPurchase. But product name isn't stored in item array explicitly in schema?
    // Actually, schema has: product: { type: ObjectId, ref: 'Product' }. 
    // We haven't populated 'items.product' in getOrderById yet!
    // FIX: I need to update getOrderById to populate items.product as well.
    // Assuming I will fix controller next or now.
    
    // Fallback if product name missing (if not populated)
    itemsHTML += items.map(item => {
        // If populated
        const name = item.product ? (item.product.name || 'Product') : 'Product';
        const price = item.priceAtPurchase;
        const total = price * item.quantity;
        
        return `
            <tr style="border-bottom:1px solid #eee;">
                <td style="padding:10px;">
                    ${name} <br>
                    <small style="color:#666">Size: ${item.selectedSize || 'Std'}</small>
                </td>
                <td style="padding:10px;">${item.quantity}</td>
                <td style="padding:10px;">₹${price}</td>
                <td style="padding:10px;">₹${total}</td>
            </tr>
        `;
    }).join('');

    itemsHTML += `</tbody></table>`;
    itemsContainer.innerHTML = itemsHTML;

    // 4. Total
    const dateStr = new Date(createdAt).toLocaleDateString();
    document.getElementById('total-price').innerHTML = `
        <div style="text-align:right; margin-top:20px;">
            <p>Date: ${dateStr}</p>
            <p>Payment Mode: ${order.paymentStatus === 'Paid' ? 'Paid' : 'COD / Pending'}</p>
            <h3 style="color:#800000; font-size:1.5rem; margin-top:10px;">Total: ₹${totalAmount}</h3>
        </div>
    `;
    
    // PDF Download Logic
    document.getElementById('download-invoice').addEventListener('click', () => {
         window.print();
    });
}
