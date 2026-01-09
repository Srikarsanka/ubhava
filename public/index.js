// Navbar scroll shadow
window.addEventListener("scroll", function () {
  const navbar = document.querySelector(".navbar");
  if (window.scrollY > 50) {
    navbar.classList.add("scrolled");
  } else {
    navbar.classList.remove("scrolled");
  }
});

// Scroll Animation Observer
const observerOptions = {
      threshold: 0.1,
      rootMargin: "0px 0px -50px 0px"
};

const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
            if (entry.isIntersecting) {
                  entry.target.classList.add("active");
                  observer.unobserve(entry.target);
            }
      });
}, observerOptions);

document.addEventListener("DOMContentLoaded", () => {
      const scrollElements = document.querySelectorAll(".scroll-reveal");
      scrollElements.forEach((el) => observer.observe(el));
});

// --------------------------------------------------------
// NEW: Profile & Auth Integration (Matches shop.js)
// --------------------------------------------------------

// Profile trigger (User Name in Navbar)
const profileTrigger = document.querySelector("#nav-user-display"); 
if (profileTrigger) {
    profileTrigger.addEventListener("click", function () {
        if (Auth.user) {
            displayprofile();
        }
    });
}

// Helper: Remove existing modals
function removeModalContainers() {
  const existingProfile = document.querySelector("#profilePopup");
  if (existingProfile) {
    existingProfile.remove();
  }
  // Also remove overlay if distinct, but usually handled in displayprofile
  const overlays = document.querySelectorAll('div[style*="position: fixed"][style*="z-index: 9998"]');
  overlays.forEach(o => o.remove());
}

async function displayprofile() {
  removeModalContainers();

  let userData = Auth.user;
  // Fetch latest data if possible
  try {
      const userRes = await fetch('/api/auth/me');
      if(userRes.ok) userData = await userRes.json();
  } catch(e) { console.error(e); }

  // Fetch orders (Optional for Home Page, but good consistency)
  let orders = [];
  try {
      const orderRes = await fetch('/api/orders/myorders');
      if(orderRes.ok) orders = await orderRes.json();
  } catch(e) {}

  const body = document.querySelector("body");
  body.style.overflow = "hidden";
  
  const overlay = document.createElement("div");
  overlay.style.position = "fixed";
  overlay.style.top = 0;
  overlay.style.left = 0;
  overlay.style.width = "100vw";
  overlay.style.height = "100vh";
  overlay.style.backgroundColor = "rgba(0, 0, 0, 0.4)";
  overlay.style.backdropFilter = "blur(10px)";
  overlay.style.zIndex = "9998";
  
  const profilePopup = document.createElement("div");
  profilePopup.id = "profilePopup";
  profilePopup.style.position = "fixed";
  profilePopup.style.top = "9vh";
  profilePopup.style.right = "0";
  profilePopup.style.width = "45vw";
  profilePopup.style.height = "95vh";
  profilePopup.style.backgroundColor = "#fffaf0";
  profilePopup.style.borderTopLeftRadius = "2rem";
  profilePopup.style.borderBottomLeftRadius = "2rem";
  profilePopup.style.boxShadow = "0 0 10px rgba(0, 0, 0, 0.5)";
  profilePopup.style.padding = "1rem";
  profilePopup.style.zIndex = "10000";
  profilePopup.style.overflowY = "auto";

  // Header
  const headerDiv = document.createElement("div");
  headerDiv.style.display = "flex";
  headerDiv.style.justifyContent = "space-between";
  headerDiv.style.alignItems = "center";
  headerDiv.style.marginBottom = "1rem";

  const headerTitle = document.createElement("h2");
  headerTitle.textContent = "Profile";
  headerTitle.style.fontFamily = "sans-serif"; // Fallback
  headerTitle.style.color = "#2c0665";
  headerTitle.style.margin = "0";

  const closeBtn = document.createElement("button");
  closeBtn.textContent = "X";
  closeBtn.style.background = "transparent";
  closeBtn.style.border = "none";
  closeBtn.style.color = "#800000";
  closeBtn.style.fontSize = "1.5rem";
  closeBtn.style.cursor = "pointer";
  closeBtn.addEventListener("click", () => {
    profilePopup.remove();
    overlay.remove();
    document.body.style.overflow = 'auto';
  });

  headerDiv.appendChild(headerTitle);
  headerDiv.appendChild(closeBtn);

  // Body Content
  let ordersHTML = `<p style="margin: 0.3rem 0 0 1.5rem;">No orders yet.</p>`;
  if(orders.length > 0) {
      ordersHTML = orders.map(order => `
        <div style="margin: 10px 0; padding: 10px; border: 1px solid #ddd; border-radius: 5px; background: #fff;">
            <strong>Order ID:</strong> ${order._id.substring(0, 10)}... <br>
            <strong>Date:</strong> ${new Date(order.createdAt).toLocaleDateString()} <br>
            <strong>Total:</strong> ₹${order.totalAmount}
        </div>
      `).join('');
  }

  const bodyDiv = document.createElement("div");
  bodyDiv.style.marginTop = "1rem";
  bodyDiv.innerHTML = `
        <div id="dashboard" style="padding: 2rem; font-family: 'Segoe UI', sans-serif;">
          <h2 style="color:#2c0665; text-align:center; font-size: 2.5vw;">
              Welcome back, <span style="color: orange;">${userData.fullName}</span> 👋
          </h2>
          <p style="text-align: center; color: #4a0101; font-size: 1.2vw;">
              ${userData.email} | ${userData.phoneNumber || 'No phone'}
          </p>
          <hr style="margin: 1.5rem 0; border-color: #800000;">

          <div style="display: flex; flex-direction: column; gap: 1rem; font-size: 1.2vw; color: #333;">
              <div>
                  <strong>🛍️ Wishlist:</strong>
                  <p style="margin: 0.3rem 0 0 1.5rem; font-size: 1vw; color: gray;">
                    (Wishlist feature coming soon)
                  </p>
              </div>
              <div>
                  <strong>📦 Your Orders:</strong>
                  <div style="max-height: 300px; overflow-y: auto; margin-left: 1.5rem;">
                      ${ordersHTML}
                  </div>
              </div>
          </div>
        </div>
  `;

  // Logout Button
  const logoutBtn = document.createElement("button");
  logoutBtn.textContent = "Logout";
  logoutBtn.style.backgroundColor = "#800000";
  logoutBtn.style.color = "#fff";
  logoutBtn.style.border = "none";
  logoutBtn.style.padding = "0.5rem 1rem";
  logoutBtn.style.borderRadius = "5px";
  logoutBtn.style.marginTop = "1rem";
  logoutBtn.style.display = "block";
  logoutBtn.style.marginLeft = "auto";
  logoutBtn.style.marginRight = "auto";
  logoutBtn.style.cursor = "pointer";
  logoutBtn.addEventListener("click", () => {
    Auth.logout();
    profilePopup.remove();
    overlay.remove();
  });

  profilePopup.appendChild(headerDiv);
  profilePopup.appendChild(bodyDiv);
  profilePopup.appendChild(logoutBtn);
  
  document.body.appendChild(overlay);
  document.body.appendChild(profilePopup);
}



/* ----------------------------- */
/*      New: displayprofile()    */
/* ----------------------------- */
// * ----------------------------- */
function displayprofile() {
  // Remove any existing modals or popups first
  removeModalContainers();

  
      // Remove existing modal (if any) and then create the popup container
      removeModalContainers();
      const body = document.querySelector("body");
      body.style.overflow = "hidden";
      const overlay = document.createElement("div");
      overlay.style.position = "fixed";
      overlay.style.top = 0;
      overlay.style.left = 0;
      overlay.style.width = "100vw";
      overlay.style.height = "100vh";
      overlay.style.backgroundColor = "rgba(67, 64, 64, 0.08)";
      overlay.style.backdropFilter = "blur(10px)";
      overlay.style.zIndex = "9998";
      const profilePopup = document.createElement("div");
      profilePopup.id = "profilePopup";
      profilePopup.style.position = "fixed";
      profilePopup.style.top = "9vh";
      profilePopup.style.right = "0";
      profilePopup.style.width = "45vw";
      profilePopup.style.height = "95vh";
      profilePopup.style.backgroundColor = "#fffaf0";
      profilePopup.style.borderTopLeftRadius = "2rem";
      profilePopup.style.borderBottomLeftRadius = "2rem";
      profilePopup.style.boxShadow = "0 0 10px rgba(0, 0, 0, 0.5)";
      profilePopup.style.padding = "1rem";
      profilePopup.style.zIndex = "10000";
      profilePopup.style.scrollbarWidth = 'none';
      profilePopup.style.msOverflowStyle = 'none';
      profilePopup.style.WebkitOverflowScrolling = 'touch';
      profilePopup.style.overflowY = "auto";

      // Create header with title and close button (ensuring the close button is at the top)
      const headerDiv = document.createElement("div");
      headerDiv.style.position = "relative";
      headerDiv.style.width = "100%";
      headerDiv.style.display = "flex";
      headerDiv.style.justifyContent = "space-between";
      headerDiv.style.alignItems = "center";
      headerDiv.style.marginBottom = "1rem";

      const headerTitle = document.createElement("h2");
      headerTitle.textContent = "Profile";
      headerTitle.style.fontFamily = "'MyCustomFont', sans-serif";
      headerTitle.style.color = "#2c0665";
      headerTitle.style.margin = "0";

      // The close button placed in the header
      const closeBtn = document.createElement("button");
      closeBtn.textContent = "X";
      closeBtn.style.background = "transparent";
      closeBtn.style.border = "none";
      closeBtn.style.color = "#800000";
      closeBtn.style.fontSize = "1.5rem";
      closeBtn.style.cursor = "pointer";
      closeBtn.addEventListener("click", () => {
        profilePopup.remove();
      });

      headerDiv.appendChild(headerTitle);
      headerDiv.appendChild(closeBtn);

      // Create body with user info and profile details
      const bodyDiv = document.createElement("div");
      bodyDiv.style.marginTop = "1rem";

      // Retrieve user data (with an optional address property)
      const userData = JSON.parse(localStorage.getItem("user")) ||
                       { name: "", email: "", contact: "", address: "" };

      // Build the profile contents without any duplicate close button.
      bodyDiv.innerHTML = `
        <div id="dashboard" style="padding: 2rem; font-family: 'Segoe UI', sans-serif;">
          <h2 style="color:#2c0665; text-align:center; font-size: 2.5vw;">
              Welcome back, <span style="color: orange;">${userData.name}</span> 👋
          </h2>
          <p style="text-align: center; color: #4a0101; font-size: 1.2vw;">
              Explore your profile details and manage your personal preferences here.
          </p>
          <hr style="margin: 1.5rem 0; border-color: #800000;">

          <div style="display: flex; flex-direction: column; gap: 1rem; font-size: 1.2vw; color: #333;">
              <p><strong>📧 Email:</strong> ${userData.email}</p>
              <p><strong>📞 Contact:</strong> ${userData.contact}</p>

              <div>
                  <strong>🛍️ Wishlist:</strong>
                  <p style="margin: 0.3rem 0 0 1.5rem;">You haven't added any items yet.</p>
                  <p style="margin: 0 0 0 1.5rem; font-size: 1vw; color: gray;">
                    You can save your favorite products here for quick access later.
                  </p>
              </div>

              <div>
                  <strong>📦 Your Orders:</strong>
                  <p style="margin: 0.3rem 0 0 1.5rem;">No orders yet.</p>
                  <p style="margin: 0 0 0 1.5rem; font-size: 1vw; color: gray;">
                    Track your future purchases and delivery here.
                  </p>
              </div>

              <div>
                  <strong>🏠 Address:</strong>
                  <p id="addressText" style="margin: 0.3rem 0 0 1.5rem;">
                      ${userData.address ? userData.address : "Not Provided"}
                  </p>
                  <button id="editAddressBtn" style="margin-left: 1.5rem; margin-top: 0.5rem;
                          background-color: maroon; color: white; padding: 0.4rem 0.8rem;
                          border: none; border-radius: 5px;">
                    Edit Address
                  </button>
              </div>
          </div>

          <div id="addressForm" style="display: none; margin-top: 1.5rem;">
              <textarea id="addressInput" rows="4" style="width: 100%; padding: 0.5rem; 
                        font-size: 1.1vw; border-radius: 8px; border: 1px solid #ccc;"
                        placeholder="Enter your full address here..."></textarea>
              <br>
              <button id="saveAddressBtn" style="margin-top: 0.5rem; background-color: orange;
                        color: white; padding: 0.5rem 1rem; border: none; border-radius: 5px;">
                Save Address
              </button>
          </div>
        </div>
      `;

      // Set up the address editing functionality
      const editAddressBtn = bodyDiv.querySelector("#editAddressBtn");
      const saveAddressBtn = bodyDiv.querySelector("#saveAddressBtn");
      const addressText = bodyDiv.querySelector("#addressText");
      const addressInput = bodyDiv.querySelector("#addressInput");
      const addressForm = bodyDiv.querySelector("#addressForm");

      editAddressBtn.addEventListener("click", () => {
        if (addressForm.style.display === "none") {
          addressForm.style.display = "block";
          addressInput.value = addressText.innerText !== "Not Provided" ? addressText.innerText : "";
        } else {
          addressForm.style.display = "none";
        }
      });

      saveAddressBtn.addEventListener("click", () => {
        const newAddress = addressInput.value.trim();
        if (newAddress !== "") {
          addressText.innerText = newAddress;
          userData.address = newAddress;
          localStorage.setItem("user", JSON.stringify(userData));
        }
        addressForm.style.display = "none";
      });

      // Create and style the logout button
      const logoutBtn = document.createElement("button");
      logoutBtn.textContent = "Logout";
      logoutBtn.style.backgroundColor = "#800000";
      logoutBtn.style.color = "#fff";
      logoutBtn.style.border = "none";
      logoutBtn.style.padding = "0.5rem 1rem";
      logoutBtn.style.borderRadius = "5px";
      logoutBtn.style.marginTop = "1rem";
      logoutBtn.style.marginBottom = "2rem";
      logoutBtn.style.cursor = "pointer";
      logoutBtn.style.display = "block";
      logoutBtn.style.marginLeft = "auto";
      logoutBtn.style.marginRight = "auto";
      logoutBtn.addEventListener("click", () => {
        localStorage.removeItem("user");
        profilePopup.remove();
      });

      // Assemble and append the modal: header, body, then logout button
      profilePopup.appendChild(headerDiv);
      profilePopup.appendChild(bodyDiv);
      profilePopup.appendChild(logoutBtn);
      document.body.appendChild(profilePopup);
    }
  

   