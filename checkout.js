
// Add shadow effect on scroll
window.addEventListener("scroll", function () {
  const navbar = document.querySelector(".navbar");
  navbar.classList.toggle("shadow", window.scrollY > 50);
});

// Parse cart from localStorage
let cart = JSON.parse(localStorage.getItem('cart') || '[]');
const container = document.getElementById('cart');

// Render cart items
function renderCart() {
  let tprice = 0;
  container.innerHTML = '';

  cart.forEach((item, index) => {
    if (!item.quantity) item.quantity = 1;

    const div = document.createElement('div');
    div.style = `
      height: auto;
      width: 95vw;
      margin: 1rem auto;
      border-bottom: 1px solid black;
      padding: 1rem 0;
    `;

    div.innerHTML = `
      <div style="display:flex; gap:20px; flex-wrap:wrap;">
        <div style="width:25vw;">
          <img src="${item.img}" style="width:100%; height:35vh; border-radius:0.8em;">
        </div>
        <div style="display:flex; flex-direction:column; width:65vw;">
          <h3 style="color: #3b0a45; font-size:1.5vw;">${item.name}</h3>
          <p style="font-size:1.2vw; color:#005f73;">Size: <strong style="color:#ff6f61;">${item.size}</strong></p>
          <p style="font-size:1.2vw; color:#005f73;">Price: ₹${item.disprice}</p>
          <p style="font-size:1.2vw; color:#005f73;">
            Quantity:
            <button onclick="updateQuantity(${index}, -1)" style="padding:0.2rem 0.6rem; border-radius:0.5rem; background:#ff6f61; color:white;">-</button>
            ${item.quantity}
            <button onclick="updateQuantity(${index}, 1)" style="padding:0.2rem 0.6rem; border-radius:0.5rem; background:#ff6f61; color:white;">+</button>
          </p>
          <p style="font-size:1.2vw; color:#005f73;">Total: ₹${item.quantity * item.disprice}</p>
          <button onclick="removeItem(${index})" style="margin-top:0.5rem; padding:0.5rem 1rem; background:#005f73; color:white; border-radius:0.5rem;width:10vw">Remove</button>
        </div>
      </div>
    `;

    tprice += item.quantity * item.disprice;
    container.appendChild(div);
  });

  document.getElementById('total').innerHTML = `
    <p style="color:black; font-weight:600; font-size:2.5vw; margin-top:0.5rem">
      Total Price To Be Paid: <strong style="color:#0f346c; font-weight:300">₹${tprice}</strong>
    </p>
    <br>
  `;

  localStorage.setItem('cart', JSON.stringify(cart));
}

function updateQuantity(index, change) {
  if (cart[index].quantity + change >= 1) {
    cart[index].quantity += change;
    renderCart();
  }
}

function removeItem(index) {
  cart.splice(index, 1);
  renderCart();
}

renderCart(); // Initial render

// Order Summary
const summary = document.getElementById('summary');
let total = cart.reduce((acc, item) => acc + (item.quantity * item.disprice), 0);

summary.innerHTML = `
  <p style="font-size:1.2rem;">Total Items: ${cart.length}</p>
  <p style="font-size:1.2rem;">Total Amount: ₹${total}</p>
  <p style="margin-top:1rem;"><strong>Payment Mode: </strong> Cash on Delivery</p>
`;

// Form submit handler
document.getElementById('addressForm').addEventListener('submit', function (e) {
  e.preventDefault();

  const fullName = document.getElementById('name').value.trim();
  const phone = document.getElementById('phone').value.trim();
  const address = document.getElementById('add').value.trim();
  const city = document.getElementById('city').value.trim();
  const state = document.getElementById('state').value.trim();
  const pinCode = document.getElementById('pincode').value.trim();

  if (!fullName || !phone || !address || !city || !state || !pinCode) {
    alert('Please fill in all fields.');
    return;
  }

  const invoiceData = {
    fullName,
    phone,
    address,
    city,
    state,
    pinCode,
    cart,
    total,
    paymentMode: 'Cash on Delivery'
  };

  localStorage.setItem('invoiceData', JSON.stringify(invoiceData));

  // Optional: Clear cart (uncomment below if needed)
  // localStorage.removeItem('cart');

  window.location.href = 'invoice.html'; // Go to invoice
});

