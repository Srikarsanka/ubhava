// Fetch cart data and customer details from localStorage
const cart = JSON.parse(localStorage.getItem('cart') || '[]');
const userdata = JSON.parse(localStorage.getItem('user') || '{}');
console.log(userdata); // double check again
// Get DOM elements
const customerNameElement = document.getElementById('customer-name');
const customerPhoneElement = document.getElementById('customer-phone');
const customerAddressElement = document.getElementById('customer-address');
const cartItemsContainer = document.getElementById('cart-items');
const totalPriceContainer = document.getElementById('total-price');

// Display Customer Information
customerNameElement.innerHTML = `<strong>Name:</strong> ${userdata.name}`;
customerPhoneElement.innerHTML = `<strong>Phone:</strong> ${userdata.phone || userdata.contact}`;
customerAddressElement.innerHTML = `<strong>Address:</strong> ${userdata.address}`;

// Display Cart Items
let totalAmount = 0;
cart.forEach(item => {
    const div = document.createElement('div');
    div.innerHTML = `
        <p><strong>${item.name}</strong> (Size: ${item.size}) - ₹${item.disprice} x ${item.quantity}</p>
    `;
    totalAmount += item.quantity * item.disprice;
    cartItemsContainer.appendChild(div);
});

// Display Total Price
totalPriceContainer.innerHTML = `<strong>Total Price:</strong> ₹${totalAmount}`;

// Download Invoice Functionality
document.getElementById('download-invoice').addEventListener('click', function () {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    // Add Title
    doc.setFontSize(18);
    doc.text('UDBHAVA - INVOICE', 105, 20, null, null, 'center');

    // Customer Information
    doc.setFontSize(12);
    doc.text(`Name: ${userdata.name}`, 20, 40);
    doc.text(`Phone: ${userdata.phone || userdata.contact}`, 20, 50);
    doc.text(`Address: ${userdata.address}`, 20, 60);

    // Order Details
    doc.text('Order Summary:', 20, 80);
    let yPosition = 90;
    cart.forEach(item => {
        doc.text(`${item.name} (Size: ${item.size}) - ₹${item.disprice} x ${item.quantity}`, 20, yPosition);
        yPosition += 10;
    });

    // Total Price
    doc.text(`Total Price: ₹${totalAmount}`, 20, yPosition);

    // Save the PDF
    doc.save('invoice.pdf');
});
