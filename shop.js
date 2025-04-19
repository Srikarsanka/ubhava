// Set user value from localStorage (if exists) or null
let user = JSON.parse(localStorage.getItem("user")) || null;

// Navbar scroll shadow code...
window.addEventListener("scroll", function () {
  const navbar = document.querySelector(".navbar");
  if (window.scrollY > 50) {
    navbar.classList.add("shadow");
  } else {
    navbar.classList.remove("shadow");
  }
});

// Profile icon click event
const profileIcon = document.querySelector("#profile");
profileIcon.addEventListener("click", function () {
  if (user === null) {
    display();
    // alert("the user is null");
  } else {
    // alert("the user is not null");
    
    displayprofile();
  }
});

// Helper: Remove existing modals or popups (if any)
function removeModalContainers() {
  const existingModal = document.querySelector("#modalContainer");
  if (existingModal) {
    existingModal.remove();
  }
  const existingProfile = document.querySelector("#profilePopup");
  if (existingProfile) {
    existingProfile.remove();
  }
}

/* ----------------------------- */
/*          display()            */
/* ----------------------------- */
function display() {
  // Disable body scroll and create overlay
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

  // Create modal container (ls) and assign an id for removal
  const ls = document.createElement("div");
  ls.id = "modalContainer";
  ls.style.width = "80vw";
  ls.style.height = "90vh";
  ls.style.position = "fixed";
  ls.style.top = "5vh";
  ls.style.left = "10vw";
  ls.style.backgroundColor = "#fffaf0";
  ls.style.zIndex = "9999";
  ls.style.borderRadius = "10px";
  ls.style.boxSizing = "border-box";
  ls.style.display = "flex";
  ls.style.justifyContent = "center";
  ls.style.borderTopLeftRadius = "5rem";
  ls.style.borderBottomRightRadius = "5rem";
  ls.style.boxShadow = "0 0 10px rgba(0, 0, 0, 0.5)";

  // Create left pane (div1) & dynamic right pane (div2)
  ls.innerHTML = `
    <div id="div1" style="width: 40vw; height: 90vh; border: 1px solid red; border-top-left-radius: 5rem; padding: 2rem; box-sizing: border-box; display: flex; flex-direction: column; align-items: center; justify-content: start;">
        <!-- Logo, Title and Tagline -->
        <div style="display: flex; align-items: center; gap: 1rem;">
            <img src="https://res.cloudinary.com/dnevq4wek/image/upload/v1744636831/logo_qjwdbn.png" alt="logo" style="width: 8vw; height: 8vw; border-radius: 50%; border: 1px solid black;">
            <div style="display: flex; flex-direction: column; justify-content: center;">
                <h1 style="font-family: 'MyCustomFont', serif; font-size: 3vw; font-weight: 600; color: orange; margin: 0;">UDBHAVA</h1>
                <p style="font-size: 0.9vw; font-family: 'MyCustomFont'; margin: 0; color: #555;">- The Origin of Indian Handicraft</p>
            </div>
        </div>
        <div style="height: 3rem;"></div>
        <h2 style="text-align: center; font-family: 'MyCustomFont', serif; font-size: 1.5vw; font-weight: 400;">
            Join the Ubhaava Family and Unlock Exclusive Perks!
        </h2>
        <div style="height: 2rem;"></div>
        <div style="display: flex; flex-direction: column; align-items: center; gap: 1rem;">
            <button id="signup" style="text-transform: uppercase; color: white; background-color: #800000; width: 14vw; height: 8vh; border: 1px solid maroon; font-size: 1vw; font-weight: 300; padding: 5px;">
                Join the Ubhaava Family
            </button>
            <button id="signin" style="text-transform: uppercase; color: white; background-color: #800000; width: 14vw; height: 8vh; border: 1px solid maroon; font-size: 1vw; font-weight: 300; padding: 5px;">
                Welcome Back
            </button>
        </div>
    </div>
    <div id="div2" style="width: 40vw; height: 90vh; border: 1px solid black; border-bottom-right-radius: 5rem; padding: 2rem; box-sizing: border-box;">
         ${getSignupForm()}
    </div>
  `;

  // Append modal and overlay to DOM
  document.body.appendChild(overlay);
  document.body.appendChild(ls);

  // Input focus effects
  const inputs = ls.querySelectorAll("input");
  inputs.forEach(input => {
      input.addEventListener("focus", () => {
          input.style.borderColor = "#ff6347";
          input.style.boxShadow = "0 0 5px maroon";
          input.style.transition = "box-shadow 0.3s ease-in-out";
      });
      input.addEventListener("blur", () => {
          input.style.borderColor = "#ccc";
          input.style.boxShadow = "none";
      });
  });

  // Close button for modal
  const closeBtn = document.createElement("button");
  closeBtn.innerText = "X";
  closeBtn.style.position = "absolute";
  closeBtn.style.top = "10px";
  closeBtn.style.right = "20px";
  closeBtn.style.fontSize = "2rem";
  closeBtn.style.border = "none";
  closeBtn.style.background = "transparent";
  closeBtn.style.cursor = "pointer";
  closeBtn.style.color = "#800000";
  ls.appendChild(closeBtn);
  closeBtn.addEventListener("click", () => {
      ls.remove();
      overlay.remove();
      document.body.style.overflow = "auto";
  });

  // Get references to div2 and the left pane buttons.
  let div2 = ls.querySelector("#div2");
  const signinBtn = ls.querySelector("#signin");
  const signupBtn = ls.querySelector("#signup");

  // Helper functions returning form markup.
  function getSignupForm() {
    return `
      <center>
          <h2 style="color:#2c0665; font-family: 'MyCustomFont', serif;">
              Join the Ubhaava Family and Unlock Exclusive Perks!
          </h2>
      </center>
      <label for="name" style="font-size: 1.5vw; font-weight: 500; color: #4a0101; margin-left: 1em;">Name:</label><br>
      <input type="text" id="name" name="name" placeholder="Enter your name, Artizen" required style="width: 80%; padding: 10px; margin-bottom: 20px; border: 1px solid #ccc; border-radius: 5px; font-size: 1.2vw; margin-left: 1.5em; display: block;">
      <label for="email" style="font-size: 1.5vw; font-weight: 500; color: #4a0101; margin-left: 1em;">Email:</label><br>
      <input type="email" id="email" name="email" placeholder="Enter your email, Artizen" required style="width: 80%; padding: 10px; margin-bottom: 20px; border: 1px solid #ccc; border-radius: 5px; font-size: 1.2vw; margin-left: 1.5em; display: block;">
      <label for="contact" style="font-size: 1.5vw; font-weight: 500; color: #4a0101; margin-left: 1em;">Contact No:</label><br>
      <input type="tel" id="contact" name="contact" placeholder="Enter your contact" required style="width: 80%; padding: 10px; margin-bottom: 20px; border: 1px solid #ccc; border-radius: 5px; font-size: 1.2vw; margin-left: 1.5em; display: block;">
      <label for="password" style="font-size: 1.5vw; font-weight: 500; color: #4a0101; margin-left: 1em;">Password:</label><br>
      <input type="password" id="password" name="password" placeholder="Enter your password" required style="width: 80%; padding: 10px; margin-bottom: 20px; border: 1px solid #ccc; border-radius: 5px; font-size: 1.2vw; margin-left: 1.5em; display: block;">
      <label for="confirm-password" style="font-size: 1.5vw; font-weight: 500; color: #4a0101; margin-left: 1em;">Confirm Password:</label><br>
      <input type="password" id="confirm-password" name="confirm-password" placeholder="Re-enter your password" required style="width: 80%; padding: 10px; margin-bottom: 20px; border: 1px solid #ccc; border-radius: 5px; font-size: 1.2vw; margin-left: 1.5em; display: block;">
      <center>
          <input type="submit" value="Submit" style="width: 10vw; height: 5vh; border: 1px solid #ccc; border-radius: 5px; font-size: 1.2vw; background-color: #4a0101; color: white;">
      </center>
    `;
  }
  
  function getLoginForm() {
    return `
      <center>
          <h2 style="color:#2c0665; font-family: 'MyCustomFont', serif;">
              WELCOME BACK! You're not just a buyer… You're an <strong style="color:orange">ARTIZEN</strong>
          </h2>
      </center>
      <label for="name1" style="font-size: 2.5vw; font-weight: 500; color: #4a0101; margin-left: 1em;">Name:</label>
      <br>
      <input type="text" id="name1" name="name1" placeholder="Enter your name, Artizen" required style="width: 80%; padding: 10px; margin-bottom: 20px; border: 1px solid #ccc; border-radius: 5px; font-size: 1.2vw; margin-left: 1.5em;">
      <br><br>
      <label for="email1" style="font-size: 2.5vw; font-weight: 500; color: #4a0101; margin-left: 1em;">Email:</label>
      <br>
      <input type="email" id="email1" name="email1" placeholder="Enter your email, Artizen" required style="width: 80%; padding: 10px; margin-bottom: 20px; border: 1px solid #ccc; border-radius: 5px; font-size: 1.2vw; margin-left: 1.5em;">
      <br><br>
      <label for="password1" style="font-size: 2.5vw; font-weight: 500; color: #4a0101; margin-left: 1em;">Password:</label>
      <br>
      <input type="password" id="password1" name="password1" placeholder="Enter your password, Artizen" required style="width: 80%; padding: 10px; margin-bottom: 20px; border: 1px solid #ccc; border-radius: 5px; font-size: 1.2vw; margin-left: 1.5em;">
      <br><br>
      <center>
          <input type="submit" value="Submit" style="width: 10vw; height: 5vh; border: 1px solid #ccc; border-radius: 5px; font-size: 1.2vw; background-color: #4a0101; color: white;">
      </center>
    `;
  }
  
  // Attach listener for signup form submission
  function attachSignupSubmit() {
    const submitBtn = div2.querySelector("input[type='submit']");
    if (submitBtn) {
      submitBtn.addEventListener("click", function(event) {
        event.preventDefault();
        const name = div2.querySelector("#name").value;
        const email = div2.querySelector("#email").value;
        const contact = div2.querySelector("#contact").value;
        const password = div2.querySelector("#password").value;
        const confirmPassword = div2.querySelector("#confirm-password").value;
  
        if (password !== confirmPassword) {
          alert("Passwords do not match!");
          return;
        } else {
          localStorage.setItem("name", name);
          localStorage.setItem("email", email);
          localStorage.setItem("contact", contact);
          localStorage.setItem("password", password);
  
          const userDetails = { name, email, contact, password };
          localStorage.setItem("user", JSON.stringify(userDetails));
  
          alert("Registration successful");
          // Switch to the login form after registration
          div2.innerHTML = getLoginForm();
          attachLoginSubmit();
        }
      });
    }
  }
  
  // Attach listener for login form submission
  function attachLoginSubmit() {
    const submitBtn = div2.querySelector("input[type='submit']");
    if (submitBtn) {
      submitBtn.addEventListener("click", function(event) {
        event.preventDefault();
        const storedName = localStorage.getItem("name");
        const storedEmail = localStorage.getItem("email");
        const storedPassword = localStorage.getItem("password");
        const name1 = div2.querySelector("#name1").value;
        const email1 = div2.querySelector("#email1").value;
        const password1 = div2.querySelector("#password1").value;
  
        if (name1 === storedName && email1 === storedEmail && password1 === storedPassword) {
          alert("Login successful");
          // Update the global user variable
          user = JSON.parse(localStorage.getItem("user"));
          // Call displayprofile() for a standalone profile popup
          displayprofile();
        } else {
          alert("Login failed. Please check your credentials.");
        }
      });
    }
  }
  
  // Initially attach signup listener (signup form loaded by default)
  attachSignupSubmit();
  
  // Switch forms on clicking left pane buttons
  signupBtn.addEventListener("click", () => {
    div2.innerHTML = getSignupForm();
    attachSignupSubmit();
  });
  
  signinBtn.addEventListener("click", () => {
    div2.innerHTML = getLoginForm();
    attachLoginSubmit();
  });
  
  /* --- End of display() function --- */
}

/* ----------------------------- */
/*      New: displayprofile()    */
/* ----------------------------- */
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
                  ${wishlist}
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
  
   
// the below code is for the fillters to apply
    const filter = document.getElementById("fill");

filter.addEventListener('click', () => {
  const filtersContainer = document.createElement('div');
  filtersContainer.id = "filters";

  const body = document.querySelector("body");
  body.style.overflow = "hidden";

  // Create the overlay
  const overlay = document.createElement("div");
  overlay.style.position = "fixed";
  overlay.style.top = 0;
  overlay.style.left = 0;
  overlay.style.width = "100vw";
  overlay.style.height = "100vh";
  overlay.style.backgroundColor = "rgba(0, 0, 0, 0.1)"; // Semi-transparent overlay
  overlay.style.backdropFilter = "blur(1px)"; // Blur effect
  overlay.style.zIndex = "9998";

  Object.assign(filtersContainer.style, {
    padding: "30px",
    fontFamily: "'MyCustomFont', sans-serif",
    color: "#383838",
    backgroundColor: "#fff",
    boxShadow: "0 2px 10px rgba(0, 0, 0, 0.05)",
    borderRadius: "10px",
    width: "30vw",
    height: "100vh",
    display: "block",
    left: '0',
    position: 'fixed',
    top: '7vh',
    zIndex: "9999", // Ensure it appears above the overlay
  });

  const heading = document.createElement("h2");
  heading.textContent = "Apply Filters";
  Object.assign(heading.style, {
    fontSize: "1.7rem",
    marginBottom: "25px",
    color: "#ff7b00",
    borderBottom: "2px solid #ffa500",
    display: "inline-block",
    paddingBottom: "5px"
  });
  filtersContainer.appendChild(heading);

  const filterGroup = document.createElement("div");
  filterGroup.className = "filter-group";
  Object.assign(filterGroup.style, {
    display: "flex",
    flexDirection: "column",
    gap: "18px"
  });

  const options = [
    { value: "low", label: "Low to High" },
    { value: "high", label: "High to Low" },
    { value: "below5000", label: "Below ₹5000" },
    { value: "below1000", label: "Below ₹1000" },
    { value: "below15000", label: "Below ₹15000" }
  ];

  options.forEach(opt => {
    const label = document.createElement("label");
    Object.assign(label.style, {
      display: "flex",
      alignItems: "center",
      gap: "10px",
      cursor: "pointer",
      fontSize: "2vw",
      marginTop: "2rem",
      color: "#383838",
      transition: "all 0.3s ease"
    });

    label.addEventListener("mouseover", () => {
      label.style.color = "#ff7b00";
    });
    label.addEventListener("mouseout", () => {
      label.style.color = "#383838";
    });

    const input = document.createElement("input");
    input.type = "radio";
    input.name = "price";
    input.value = opt.value;
    Object.assign(input.style, {
      width: "18px",
      height: "18px",
      accentColor: "#ff7b00",
      cursor: "pointer"
    });

    const span = document.createElement("span");
    span.textContent = opt.label;

    label.appendChild(input);
    label.appendChild(span);
    filterGroup.appendChild(label);
  });

  filtersContainer.appendChild(filterGroup);

  const center = document.createElement("center");
  const btn = document.createElement("button");
  btn.textContent = "Close";

  Object.assign(btn.style, {
    width: "10vw",
    height: "5vh",
    border: "1px solid #800000",
    boxShadow: "#242323",
    backgroundColor: "transparent",
    marginTop: "5vh",
    color: "orange",
    transition: "0.5s ease-in-out"
  });

  // Close button logic
  btn.addEventListener("click", () => {
    body.removeChild(filtersContainer); // Remove the filters container
    document.body.removeChild(overlay); // Remove the overlay
    body.style.overflow = "auto"; // Restore scroll behavior
  });

  center.appendChild(btn);
  filtersContainer.appendChild(center);

  // Add overlay to the page
  document.body.appendChild(overlay);

  // Add filters container to the page
  document.body.appendChild(filtersContainer);
});

const products = [
  {
    category: 'women',
    id:'1',
    subCategory: 'saree',
    img: 'https://res.cloudinary.com/dnevq4wek/image/upload/v1744390707/trendsaree_vbeoxs.avif',
    price: '5000',
    name: 'Sea Green Bel Buti Patterned Saree',
    video: 'https://res.cloudinary.com/dnevq4wek/video/upload/v1744873419/seagreensareevedio_gvynpb.mp4',
  },
  {
    id:'2',
    category: 'women',
    subCategory: 'saree',
    img: 'https://res.cloudinary.com/dnevq4wek/image/upload/v1744390847/pinksaretrend2_saqzxo.avif',
    price: '6000',
    name: 'Cream Beige Floral Embroidered Saree',
    video: 'https://res.cloudinary.com/dnevq4wek/video/upload/v1744873545/creamsareefloral_thxsbm.mp4',
  },
  {
    id:'3',
    category: 'women',
    subCategory: 'saree',
    img: 'https://res.cloudinary.com/dnevq4wek/image/upload/v1744527266/trendwhitesaree_uhkcyb.avif',
    name: 'Dark Cream Bel Buti Stone Embellished Saree',
    price: '7000',
    video: 'https://res.cloudinary.com/dnevq4wek/video/upload/v1744873638/DARK_CREAMsaree_kxsv01.mp4',
  },
  {
    id:'4',
    category: 'women',
    subCategory: 'saree',
    img: 'https://res.cloudinary.com/dnevq4wek/image/upload/v1744391222/geensareetrend_wesada.avif',
    price: '8099',
    name: 'Sea Green Beige Floral Embroidered Saree',
    video: 'https://manyavar.scene7.com/is/content/manyavar/SB17529_436-SEA%20GREEN_301_30-09-2024-08-46-0x900-1500k',
  },
  {
    id:'5',
    category: 'women',
    subCategory: 'saree',
    img: 'https://res.cloudinary.com/dnevq4wek/image/upload/v1744821470/blueleafsaree_qw4sfx.avif',
    price: '2999',
    name: 'Indigo Blue Leaf Patterned Saree',
    video: 'https://manyavar.scene7.com/is/content/manyavar/SB16556_439-INDIGO%20BLUE_201_05-06-2024-11-43-0x900-1500k',
  },
  {
    id:'6',
    category: 'women',
    subCategory: 'saree',
    img: 'https://res.cloudinary.com/dnevq4wek/image/upload/v1744821725/pinkyellowsaree_qepd4e.avif',
    price: '3999',
    name: 'Mustard Yellow Jaal Patterned Saree with Square Motifs',
    video: 'https://res.cloudinary.com/dnevq4wek/video/upload/v1744874287/mustedyellowsaree_ziphfl.mp4',
  },
  {
    id:'7',
    category: 'women',
    subCategory: 'saree',
    img: 'https://res.cloudinary.com/dnevq4wek/image/upload/v1744822341/redrubysaree_h00gdg.avif',
    price: '14999',
    name: 'Ruby Red Floral Zari Work Bridal Saree',
    video: 'https://manyavar.scene7.com/is/content/manyavar/SB16047_422-WINE_201_03-01-2025-05-20-0x900-1500k',
  },
  {
    id:'8',
    category: 'women',
    subCategory: 'saree',
    img: 'https://res.cloudinary.com/dnevq4wek/image/upload/v1744821958/pinknetsaree_tkoc7w.avif',
    price: '11999',
    name: 'Dusty Pink Floral Jaal Embroidered Saree with Rhinestone Work',
    video: 'https://res.cloudinary.com/dnevq4wek/video/upload/v1744874494/dustyfloralpinksaree_iz3iho.mp4',
  },

  {
    id:'9',
    category:'women',
    subCategory:'lehenga',
    img:'https://manyavar.scene7.com/is/image/manyavar/SKT4894_441-D.+PURPLE_101.2579_27-07-2024-23-50:650x900?&dpr=on,2',
    price:'9000',
    name:'Festive Purple Georgette Lehenga',
    video:'https://res.cloudinary.com/dnevq4wek/video/upload/v1744874550/purpulelehanga_eflagt.mp4',

  },
  {
  id:'10',
  category:'women',
  subCategory:'lehenga',
  img:'https://res.cloudinary.com/dnevq4wek/image/upload/v1744874954/purpulepinklehanga_cqkrpe.avif',
  price:'26000',
  name:'Majestic Purple Net Crop Top Lehenga with Thread and Zari Work',
  video:'https://res.cloudinary.com/dnevq4wek/video/upload/v1744874857/purpulepinklehanga.mp4_crqki9.mp4',

},
{
  id:'11',
  category:'women',
  subCategory:'lehenga',
  img:'https://res.cloudinary.com/dnevq4wek/image/upload/v1744885561/bluenetlehangajanhvi_dkaip8.avif',
  price:'29000',
  name:'(SEMI-STITCHED)Ethereal Blue Net Lehenga',
  video:'https://res.cloudinary.com/dnevq4wek/video/upload/v1744885478/lightbluelehangavideo_kqzbzb.mp4',

},
{
  id:'12',
  category:'women',
  subCategory:'lehenga',
  img:'https://res.cloudinary.com/dnevq4wek/image/upload/v1744387946/womenwear_trlaal.avif',
  price:'39000',
  name:'Teal Blue Aari Embroidered Lehenga with Imperial, Floral And Peacock Motifs',
  video:'https://res.cloudinary.com/dnevq4wek/video/upload/v1744885843/peckoklehanga_pqeaeq.mp4',

},
{
  id:'13',
  category:'women',
  subCategory:'weding-w',
  img:'https://res.cloudinary.com/dnevq4wek/image/upload/v1744387946/womenwear_trlaal.avif',
  price:'39000',
  name:'Teal Blue Aari Embroidered Lehenga with Imperial, Floral And Peacock Motifs',
  video:'https://res.cloudinary.com/dnevq4wek/video/upload/v1744885843/peckoklehanga_pqeaeq.mp4',

},
{
  id:'14',
  category:'women',
  subCategory:'weding-w',
  img:'https://res.cloudinary.com/dnevq4wek/image/upload/v1744897971/wedding_sarre1_i4tcwg.avif',
  price:'42000',
  name:'Classic Wine Bel Buti Patterned Bridal Saree',
  video:'https://res.cloudinary.com/dnevq4wek/video/upload/v1744898256/weddingsaree1_xlnmio.mp4'
},
{
  id:'15',
  category:'women',
  subCategory:'weding-w',
  img:'https://res.cloudinary.com/dnevq4wek/image/upload/v1744898424/weddingsaree2_vtyc3x.avif',
  price:'45000',
  name:'Rani Pink Bel Buti Patterned Bridal Saree with Rhinestones',
  video:'https://res.cloudinary.com/dnevq4wek/video/upload/v1744898471/weddingsaree2_wk1pov.mp4'
},
{
  id:'16',
  category:'women',
  subCategory:'weding-w',
  img:'https://res.cloudinary.com/dnevq4wek/image/upload/v1744899232/wedingsaree34_i6ojyi.avif',
  price:'35000',
  name:'Rani Pink Bel Buti Patterned Bridal Saree with Rhinestones',
  video:'https://res.cloudinary.com/dnevq4wek/video/upload/v1744899280/wedingsaree4_lvgsjr.mp4'
},
{
  id:'17',
  category:'women',
  subCategory:'Stitched Suit',
  img:'https://res.cloudinary.com/dnevq4wek/image/upload/v1744900946/MOIW238_409-MEHANDI_301_f9yg98.avif',
  price:'6544',
  name:'Mehandi Green Plain Indo Western with Sequin And Cape Blouse',
  video:'https://res.cloudinary.com/dnevq4wek/video/upload/v1744901786/switcheddress1_kyztak.mp4',
 },
 {
    id:'18',
    category:'women',
    subCategory:'Stitched Suit',
    img:'https://res.cloudinary.com/dnevq4wek/image/upload/v1744902194/switcheddress2_voeeif.avif',
    price:'20000',
    name:'Wine Hued Elegance Indo Western',
    video:'https://res.cloudinary.com/dnevq4wek/video/upload/v1744907635/MOIW184-422-WINE_301_23-09-2024-06-41-0x900-1500k_hk2e2y.mp4',
 },
 {
  id:'19',
  category:'women',
  subCategory:'Stitched Suit',
  img:'https://res.cloudinary.com/dnevq4wek/image/upload/v1744907307/NMSAS6419_404-FAWN_101_swnwpp.avif',
  price:'5500',
  name:'Fawn Bel Buti Patterned Straight Suit',
  video:'https://res.cloudinary.com/dnevq4wek/video/upload/v1744907439/switcheddress3_jnj5yj.mp4',
},
{
  id:'20',
  category:'women',
  subCategory:'Stitched Suit',
  img:'https://res.cloudinary.com/dnevq4wek/image/upload/v1744908131/stitched_suit_4_xosf05.avif',
  price:'14499',
  name:'Fawn Bel Buti Patterned Straight Suit',
  video:'https://res.cloudinary.com/dnevq4wek/video/upload/v1744908116/switcheddress4_ogtg6h.mp4',
},
{
  id: 21,
  category:'men',
  subCategory:'weding-w',
  name: "Cream Elegance Kurta Jacket Set",
  video: "https://manyavar.scene7.com/is/content/manyavar/SHOS368D_304-Fawn_201_03-12-2024-09-15-0x900-1500k",
  img: "https://res.cloudinary.com/dnevq4wek/image/upload/v1744544568/MENSTRENSHERVANI1_rahxfv.avif",
  price:'24499'
},
{
  id: 22,
  category:'men',
  subCategory:'Kurta Jacket',
  name: "Antique White Floral Printed Jacket Set",
  video: "https://manyavar.scene7.com/is/content/manyavar/JOSK017-303_25-05-2023-11-44-0x900-1500k",
  img: "https://res.cloudinary.com/dnevq4wek/image/upload/v1744553270/kurthabiscuttrend_ybrjwh.avif",
  price:'9000'
},

{
  id: 23,
  category:'men',
  subCategory:'Kurta Pajama',
  name: "Light Blue Blended Cotton Kurta Pajama",
  video: "https://manyavar.scene7.com/is/content/manyavar/CPOSK722_341-Light%20Blue_201_14-10-2024-05-27-0x900-1500k",
  img: "https://res.cloudinary.com/dnevq4wek/image/upload/v1744554015/lightbluetrending_tx7zsz.avif",
  price:'4500'
},
{
  id: 24,
  category:'men',
  subCategory:'Kurta Pajama',
  name: "Light pink Blended Cotton Kurta Pajama",
  video: "https://manyavar.scene7.com/is/content/manyavar/SDES873_342-Coral_201_14-08-2024-08-28-0x900-1500k",
  img: "https://res.cloudinary.com/dnevq4wek/image/upload/v1744554149/pinkkurthatrend_b8ll17.webp",
  price:'5000'
},
{
  id: 25,
  category:'men',
  subCategory:'Kurta Pajama',
  name: "Mehndi Green Kurta Set with Abstract & Paisley Print",
  video: "https://res.cloudinary.com/dnevq4wek/video/upload/v1744911342/kurtha1_zrwh5t.mp4",
  img: "https://res.cloudinary.com/dnevq4wek/image/upload/v1744911302/kurthap1_wce0vs.webp",
  price:'6500'
},
{
  id: 26,
  category:'men',
  subCategory:'Kurta Pajama',
  name: "Maroon Red Chikankari Sequinned Kurta Set",
  video: "https://res.cloudinary.com/dnevq4wek/video/upload/v1744911633/kurtha2_yp8tbw.mp4",
  img: "https://res.cloudinary.com/dnevq4wek/image/upload/v1744911643/kurtha2_gvxapq.avif",
  price:'3500'
},
{
  id: 27,
  category:'men',
  subCategory:'Kurta Pajama',
  name: "Purple Buta Diamond Patterned Kurta Set",
  video: "https://res.cloudinary.com/dnevq4wek/video/upload/v1744917182/kurthapaijama3_tyok09.mp4",
  img: "https://res.cloudinary.com/dnevq4wek/image/upload/v1744917073/SDES1058-313-Purple_rnxbtz.avif",
  price:'3000'
},
{
  id: 28,
  category:'men',
  subCategory:'Kurta Pajama',
  name: "Navy Blue Chikankari Sequinned Kurta Set",
  video: "https://res.cloudinary.com/dnevq4wek/video/upload/v1744917326/kurtha_paijama_3_sc97bn.mp4",
  img: "https://res.cloudinary.com/dnevq4wek/image/upload/v1744917348/navy_blue_paijama_4_bdhfhv.avif",
  price:'4499'
},
{
  id: 29,
  category:'men',
  subCategory:'Kurta Pajama',
  name: "Steel Grey Grid Patterned Sequinned Kurta Set",
  video: "https://res.cloudinary.com/dnevq4wek/video/upload/v1744917725/kurtha_paijama_4_evgwhc.mp4",
  img: "https://res.cloudinary.com/dnevq4wek/image/upload/v1744917707/kurthapijama_4_gxtgz1.avif",
  price:'5499'
},
{
  id: 30,
  category:'men',
  subCategory:'Kurta Pajama',
  name: "Warm White and Pink Wave Print Kurta Set with Metallic Buta",
  video: "https://res.cloudinary.com/dnevq4wek/video/upload/v1744918166/kurtha_5_sqjtu1.mp4",
  img: "https://res.cloudinary.com/dnevq4wek/image/upload/v1744918117/SDES1219D_340-315-Warm_White-Pink_101_u8ibx0.avif",
  price:'5499'
},
{
  id: 31,
  category:'men',
  subCategory:'Kurta Jacket',
  name: "Teal Blue Luxe Kurta Jacket Set",
  video: "https://res.cloudinary.com/dnevq4wek/video/upload/v1744915263/kurtha_jacket1_ldtqp6.mp4",
  img: "https://res.cloudinary.com/dnevq4wek/image/upload/v1744915318/kurtha_jacket1_rmn5ch.avif",
  price:'13500'
},
{
  id: 32,
  category:'men',
  subCategory:'Kurta Jacket',
  name: "Bright White Floral Patterned Jacket Set",
  video: "https://res.cloudinary.com/dnevq4wek/video/upload/v1744916280/kurtha_jacket2_xuzpsq.mp4",
  img: "https://res.cloudinary.com/dnevq4wek/image/upload/v1744916234/JAST540_301-LIGHT_CREAM_btaaxc.avif",
  price:'15500'
},
{
  id: 33,
  category:'men',
  subCategory:'Kurta Jacket',
  name: "Cream Light Green Bel Buti Patterned Jacket Set",
  video: "https://res.cloudinary.com/dnevq4wek/video/upload/v1744916900/kurtha_jacket_3_nqvafv.mp4",
  img: "https://res.cloudinary.com/dnevq4wek/image/upload/v1744916852/kurtha_jacket3_py7qpq.avif",
  price:'15500'
},
{
  id: 34,
  category:'men',
  subCategory:'sherwani',
  name: "Cream Beige Jaal Patterned Sherwani Set with Layered Necklace",
  video: "https://res.cloudinary.com/dnevq4wek/video/upload/v1744918722/sherwani1_mkmvs1.mp4",
  img: "https://res.cloudinary.com/dnevq4wek/image/upload/v1744918739/sherwani1_iczd7d.avif",
  price:'25500'
},
{
  id: 34,
  category:'men',
  subCategory:'sherwani',
  name: "Grape Wine Jaal Embroidered Sherwani Set with Stone Work",
  video: "https://res.cloudinary.com/dnevq4wek/video/upload/v1744919315/sherwani2_z9ykab.mp4",
  img: "https://res.cloudinary.com/dnevq4wek/image/upload/v1744919299/sherwani2_csaj10.avif",
  price:'19500'
},
{
  id: 35,
  category:'men',
  subCategory:'sherwani',
  name: "Dusty Pink Medallion Patterned Sherwani Set",
  video: "https://res.cloudinary.com/dnevq4wek/video/upload/v1744919553/sherwani3_zrcpu3.mp4",
  img: "https://res.cloudinary.com/dnevq4wek/image/upload/v1744919571/sherwani3_hwjhop.avif",
  price:'19500'
},
{
  id: 36,
  category:'men',
  subCategory:'sherwani',
  name: "Cream White Jaal Medallion Patterned Sherwani Set with Rhinestone Work",
  video: "https://res.cloudinary.com/dnevq4wek/video/upload/v1744919917/sherwwani4_iit45z.mp4",
  img: "https://res.cloudinary.com/dnevq4wek/image/upload/v1744919875/CPSH328_302-Cream_101_yg12et.avif",
  price:'31499'
},
// wedding collection for men please include the id:21 also comes under the category of weeding men section
{
  id: 37,
  category:'men',
  subCategory:'weding-w',
  name: "Sand Beige Medallion Patterned Indo Western Set",
  video: "https://res.cloudinary.com/dnevq4wek/video/upload/v1744920445/weddingm1_va2u0i.mp4",
  img: "https://res.cloudinary.com/dnevq4wek/image/upload/v1744920461/wedding1m_g0mbsu.avif",
  price:'34499' 
},
{
  id: 38,
  category:'men',
  subCategory:'weding-w',
  name: 'Emerald Green Angrakha Style Indo Western Set',
  video: "https://manyavar.scene7.com/is/content/manyavar/IDES716V-316_04-04-2023-12-53-2-0x900-1500k",
  img:'https://res.cloudinary.com/dnevq4wek/image/upload/v1744921031/wedding3_p5ehqm.avif',
  price:'39999',
},
{
  id: 39,
  category:'men',
  subCategory:'weding-w',
  name: 'Warm White Zari Bordered Traditional South Indian Dhoti Set',
  video: "https://res.cloudinary.com/dnevq4wek/video/upload/v1744921356/weddingm4_sqna7i.mp4",
  img:'https://res.cloudinary.com/dnevq4wek/image/upload/v1744921341/weddinm4_hzsczk.avif',
  price:'9999',
},
{
  id: 40,
  category:'kids',
  subCategory:'kids',
  name: ' Boys Peach Jaal Patterned Kurta Set',
 
  img:'https://res.cloudinary.com/dnevq4wek/image/upload/v1744980006/kids3_d30jvu.avif',
  price:'2499',
},
{
  id: 41,
  category:'kids',
  subCategory:'kids',
  name: 'Boys Grey And Yellow Kurta Jacket Set',
  img:'https://res.cloudinary.com/dnevq4wek/image/upload/v1744980009/kids4_phg60a.avif',
  price:'2999',
},
{
  id: 42,
  category:'kids',
  subCategory:'kids',
  name: 'Boys Sea Green Chikan Kurta Jacket Set',
  img:'https://res.cloudinary.com/dnevq4wek/image/upload/v1744980003/kids2_myi0zj.avif',
  price:'3499',
},
{
  id: 43,
  category:'kids',
  subCategory:'kids',
  name: 'Boys Dark Blue Paisley Patterned Angrakha Jacket Set',
  img:'https://res.cloudinary.com/dnevq4wek/image/upload/v1744980003/kids_iy2ce9.avif',
  price:'3499',
},
{
  id: 44,
  category:'kids',
  subCategory:'kids',
  name: 'Pink Cotton Hand Block Printed 3Pc Lehenga Set',
  img:'https://res.cloudinary.com/dnevq4wek/image/upload/v1745048475/kidw1_tgaxfv.jpg',
  price:'3799',
},
{
  id: 45,
  category:'kids',
  subCategory:'kids',
  name: 'Yellow Cotton Chikankari 3Pc Salwar Set',
  img:'https://res.cloudinary.com/dnevq4wek/image/upload/v1745048638/kidw2_mwpwge.jpg',
  price:'3299',
},
{
  id: 46,
  category:'kids',
  subCategory:'kids',
  name: 'Green Cotton Silk Hand Block Printed 3Pc Lehenga Set',
  img:'https://res.cloudinary.com/dnevq4wek/image/upload/v1745054234/kidw3_unduh1.jpg',
  price:'3099',
},
{
  id: 47,
  category:'kids',
  subCategory:'kids',
  name: 'Blue Cotton Printed 3Pc Lehenga Set',
  img:'https://res.cloudinary.com/dnevq4wek/image/upload/v1745054367/kidw4_kibn1i.jpg',
  price:'3000',
},

  {
    id: 48,
    img: "https://res.cloudinary.com/dnevq4wek/image/upload/v1744616638/homedecor1main_oww9ns.jpg",
    name: "Helios Alton Arvis Bedside Table",
    // size: "Standard",
    category:'HomeDecor',
    subCategory:'home',
    price: 3499
  },
  {
    id: 49,
    img: "https://res.cloudinary.com/dnevq4wek/image/upload/v1744616829/rabithomedecor_uv8s4x.jpg",
    name: "Corsica Malta Ceramic Bunny with Pot Planter",
    size: "Small",
    price: 799,
    category:'HomeDecor',
    subCategory:'home',
  },
  {
    id: 50,
    img: "https://res.cloudinary.com/dnevq4wek/image/upload/v1744616907/homedecor2home_czvfkt.jpg",
    name: "Spinel Decor Artificial Planter in Planter",
    size: "Medium",
    price: 1199,
    category:'HomeDecor',
    subCategory:'home',
  },
  {
    id: 51,
    img: "https://res.cloudinary.com/dnevq4wek/image/upload/v1744617069/claypotdecor_yocxab.jpg",
    name: "Gloria Human Artificial Succulent in Polyresin Pot",
    size: "Small",
    price: 599,
    category:'HomeDecor',
    subCategory:'home',
  },
  {
    id: 52,
    img: "https://res.cloudinary.com/dnevq4wek/image/upload/v1745060228/homedecor1_m2bfun.jpg",
    name: "Alpana Polyresin Standing Krishna Figurine",
    size: "Medium",
    price: 2499,
    category:'HomeDecor',
    subCategory:'home',
  },
  {
    id: 53,
    img: "https://res.cloudinary.com/dnevq4wek/image/upload/v1745060397/1000012970427-1000012970426_01-2100_zslghm.jpg",
    name: "Alpana Polyresin Baby Ganesha Mudra Figurine",
    size: "Medium",
    price: 699,
    category:'HomeDecor',
    subCategory:'home',
  },
  {
    id: 54,
    img: "https://res.cloudinary.com/dnevq4wek/image/upload/v1745060553/wallclock_nmks9v.jpg",
    name: "Casablanca Glass Wall Clock - 35cm",
    size: "Large",
    price: 1299,
    category:'HomeDecor',
    subCategory:'home',
  },
  {
    id: 55,
    img: "https://res.cloudinary.com/dnevq4wek/image/upload/v1745060703/homedecor3_pp9oom.jpg",
    name: "Eternity Vogue Pearl Metal Multi T-Light Holder",
    size: "Medium",
    price: 1499,
    category:'HomeDecor',
    subCategory:'home',
  },
  {
    id: 56,
    img: "https://res.cloudinary.com/dnevq4wek/image/upload/v1745060849/homedecor4_a46avq.jpg",
    name: "Brighton Ceramic Pineapple Table Accent",
    size: "Medium",
    price: 1299,
    category:'HomeDecor',
    subCategory:'home',
  },
  {
    id: 57,
    img: "https://res.cloudinary.com/dnevq4wek/image/upload/v1745061009/homedecor5_sggfap.jpg",
    name: "Mayur Rumi Polyresin Multi Votive Candle Holder",
    size: "Small",
    price: 899,
    category:'HomeDecor',
    subCategory:'home',
  },
  {
    id: 58,
    img: "https://res.cloudinary.com/dnevq4wek/image/upload/v1745063928/homedecor6_i4bepv.jpg",
    name: "Corsica Mystic India Polyresin Owl Figurine",
    size: "Small",
    price: 999,
    category:'HomeDecor',
    subCategory:'home',
  },
  {
    id: 59,
    img: "https://res.cloudinary.com/dnevq4wek/image/upload/v1745064150/homedecor7_yp43u2.jpg",
    name: "Murphy Velvet Ottoman - Grey",
    size: "Large",
    price: 2299,
    category:'HomeDecor',
    subCategory:'home',
  },
  
  {
    "id": 60,
    "category": "home",
    "subCategory": "wallart",
    "name": "Corsica Elephant Wall Accent",
    "img": "https://res.cloudinary.com/dnevq4wek/image/upload/v1744617990/wallelephantpaint_uqtogl.jpg",
    "price": 1799,
    "size": "Medium"
  },
  {
    "id": 61,
    "category": "home",
    "subCategory": "wallart",
    "name": "VEDAS Maanav Metal Ginko Leaf Wall Accent",
    "img": "https://res.cloudinary.com/dnevq4wek/image/upload/v1744618552/wallleafascent_k3xqwi.jpg",
    "price": 2199,
    "size": "Medium"
  },
  {
    "id": 62,
    "category": "home",
    "subCategory": "wallart",
    "name": "VEDAS Reva Metal Tree of Wisdom and Life Wall Accent",
    "img": "https://res.cloudinary.com/dnevq4wek/image/upload/v1744618235/metalteewall_c5brwp.jpg",
    "price": 2499,
    "size": "Medium"
  },
  {
    "id": 63,
    "category": "home",
    "subCategory": "wallart",
    "name": "VEDAS Veda Metal Flower Wall Accent",
    "img": "https://res.cloudinary.com/dnevq4wek/image/upload/v1744618325/flowerart_m0i6s3.jpg",
    "price": 1999,
    "size": "Medium"
  },
  {
    "id": 64,
    "category": "home",
    "subCategory": "wallart",
    "name": "VEDAS Veda Metal Elephant Wall Accent",
    "img": "https://res.cloudinary.com/dnevq4wek/image/upload/v1745065468/wallart3_otlomf.png",
    "price": 3999,
    "size": "Medium"
  }
  




];
function renderproducts() {
  products.forEach((product) => {
    let div = document.createElement('div');
    div.className = 'product-content';
    div.style.width = '20vw';
    div.style.height = '85vh';
    div.style.marginTop = '4vh';
    div.style.position = 'relative';
    div.setAttribute('data-image', product.img);
    div.setAttribute('data-name', product.name);
    div.setAttribute('data-price', product.price || 'Not Available');
    div.setAttribute('subcategory', product.subCategory);
    div.setAttribute('id',product.id)
    div.setAttribute('size',product.size)
    // if (!container) {
    //   console.warn(`Missing container for ${product.subCategory}`);
    //   return;
    // }
    const orgnialprice = parseInt(product.price || 0) + parseInt(Math.random() * 100);
    const discount = orgnialprice * 0.1;
    const discountedprice = orgnialprice - discount;

    div.setAttribute('data-discounted-price', discountedprice.toFixed(0));
    div.setAttribute('data-original-price', orgnialprice);

    const mediaContent = product.video
      ? `<video class="video-hover"  loop poster="${product.img}" src="${product.video}" type="video/mp4"></video>`
      : `<img src="${product.img}" style="width:90%; height:65%; object-fit:cover">`;

    div.innerHTML = `
       ${mediaContent}
      <p><strong>${product.name}</strong></p>
      <p>
        <strong style='color:#ff7b00'>Price:</strong> ₹${product.price ? discountedprice.toFixed(0) : 'N/A'}
        <del style="color:gray"> ₹${product.price ? orgnialprice : ''}</del>
      </p>
    `;

    document.getElementById(product.subCategory).appendChild(div);
  });
}

document.addEventListener('DOMContentLoaded', () => {
  renderproducts();

  document.querySelectorAll('.product-content').forEach((container) => {
    const video = container.querySelector('video');

    container.addEventListener('mouseenter', () => {
      container.style.transform = 'scale(1.1)';
      container.style.transition = 'transform 0.3s ease';
      if (video) video.play();
    });

    container.addEventListener('mouseleave', () => {
      if (video) {
        video.pause();
        video.currentTime = 0;
        video.load();
      }
      container.style.transform = 'scale(1)';
    });

    container.addEventListener('click', () => {
      const img = container.getAttribute('data-image');
      const name = container.getAttribute('data-name');
      const disprice = parseInt(container.getAttribute('data-discounted-price'));
      const orgprice = parseInt(container.getAttribute('data-original-price'));
      const saved = orgprice - disprice;
      const cat = container.getAttribute('subcategory');
      const size = container.getAttribute('size')

      let sizeOptions = '';
      if (cat === 'saree') {
        sizeOptions = `<div><h2 class="size-option">free-size</h2></div>`;
      } else if (['Kurta Pajama', 'pants', 'lehenga', 'sherwani','Stitched Suit','Kurta Jacket',].includes(cat)) {
        sizeOptions = `
          <div class="size-wrapper" style='display:flex;gap:20px;flex-wrap:wrap'>
            <h3 class="size-option">XS</h3>
            <h3 class="size-option">S</h3>
            <h3 class="size-option">M</h3>
            <h3 class="size-option">L</h3>
            <h3 class="size-option">XL</h3>
          </div>`;
      }
      else if(cat === 'kids')
      {
        sizeOptions = `<div class="size-wrapper" style='display:flex;gap:20px;flex-wrap:wrap'>
            <h3 class="size-option">(1-2)Years</h3>
            <h3 class="size-option">(3-4)Years</h3>
            <h3 class="size-option">(5-6)Years</h3>
           
          </div>`
      }
      
      let description = '';
      
      switch(cat) {
        case 'saree':
          description = `
            <h3 style='color:#800000;font-size:1.5vw'>Description:</h3>
            <p>The Saree is the most iconic piece of traditional Indian wear. Made with soft fabric like silk, cotton, or georgette...</p>
            <h3 style='color:#800000'>Key Features:</h3>
            <ul  style='color:#0f346c;font-weight:500'>
              <li>Fabric: Silk, cotton, georgette, chiffon</li>
              <li>Fit: Flattering and graceful drape</li>
              <li>Design: Vibrant prints, embroidery, or traditional patterns</li>
              <li>Occasions: Perfect for weddings, parties, and cultural events</li>
            </ul>`
          ;
          break;
      
        case 'Kurta Pajama':
          description = `
            <h3 style='color:#800000>Description:</h3>
            <p>A traditional yet contemporary choice for men, our Boys' Kurta offers the perfect balance of comfort and style...</p>
            <h3 style='color:#800000'>Key Features:</h3>
            <ul  style='color:#0f346c;font-weight:500'>
              <li>Fabric: Soft cotton for maximum comfort</li>
              <li>Fit: Relaxed and breathable</li>
              <li>Design: Elegant embroidery or plain design options</li>
              <li>Occasions: Ideal for festivals, weddings, and casual gatherings</li>
            </ul>`
          ;
          break;

          case 'Kurta Jacket':
            description = `
              <h3 style='color:#800000'>Description:</h3>
              <p>The Kurta Jacket Set combines timeless elegance with a modern twist. Perfect for festive and formal occasions, this outfit makes a bold yet classy style statement.</p>
              <h3 style='color:#800000'>Key Features:</h3>
              <ul style='color:#0f346c;font-weight:500'>
                <li>Fabric: Premium silk, cotton, or brocade blend</li>
                <li>Fit: Tailored for a sharp and flattering look</li>
                <li>Design: Stylish short/long jackets with embroidery or subtle patterns</li>
                <li>Occasions: Best for weddings, receptions, festive functions, and celebrations</li>
              </ul>`
            ;
            break;
          
      
        case 'Stitched Suit':
          description = `
          <h3 style="color:#800000;">Description:</h3>
<p>Our Women's Matter Stitched Suit (Marchura) is designed to reflect the grace and beauty of traditional attire with a modern twist. Perfect for those who seek elegance with comfort.</p>

<h3 style="color:#800000;">Key Features:</h3>
<ul style="color:#0f346c; font-weight:500;">
  <li>Fabric: Soft cotton or linen blend</li>
  <li>Fit: Comfortable and stylish</li>
  <li>Design: Vibrant prints, embroidery, or plain options</li>
  <li>Occasions: Great for festivals, parties, and casual outings</li>
</ul>`

          
          break;
      
        case 'sherwani':
          description = `
            <h3 style='color:#800000'>Description:</h3>
            <p>A Sherwani is the epitome of elegance and tradition, and this one is designed to make a statement...</p>
            <h3 style='color:#800000>Key Features:</h3>
      padding-left: 2vw;
      padding-left: 2vw;
            <ul  style='color:#0f346c;font-weight:500' >
              <li>Fabric: Silk, brocade, or velvet for a royal look</li>
              <li>Fit: Tailored to perfection</li>
              <li>Design: Intricate embroidery and detailing</li>
              <li>Occasions: Perfect for weddings, festivals, and grand events</li>
            </ul>`
          
          break;
      
        case 'lehenga':
          description = `
            <h3 style='color:#800000'>Description:</h3>
            <p>The Lehenga is the perfect blend of tradition and glamour. Designed with intricate embroidery...</p>
            <h3 style='color:#800000>Key Features:</h3>
            <ul style='color:#0f346c;font-weight:500'>
              <li>Fabric: Silk, chiffon, georgette, or net</li>
              <li>Fit: Flared, flattering silhouette</li>
              <li>Design: Detailed embroidery or stonework</li>
              <li>Occasions: Perfect for weddings, celebrations, and festivals</li>
            </ul>`
          
          break;
        case 'weding-w':
          description = `<h3 style='color:#800000'>Description:</h3>
          <p>Our wedding collection is designed to make you feel like royalty...</p>
          <h3 style='color:#800000'>Key Features:</h3>
          <ul style='color:#0f346c;font-weight:500'>
          <li>Fabric: Luxurious fabrics like silk, velvet, or satin</li>
          <li>Fit: Tailored to perfection</li>
          <li>Design: Intricate embroidery, beading, or stonework</li>
          <li>Occasions: Perfect for weddings, grand events, and special occasions</li>
          </ul>;`
          break;
        case 'kids':
            description = `
              <h3 style='color:#800000'>Description:</h3>
              <p>Specially crafted for kids, this Kurta, Jacket, and Pajama set blends traditional charm with modern style. Perfect for giving your little boy a festive and elegant look while ensuring all-day comfort!</p>
          
              <h3 style='color:#800000'>Key Features:</h3>
              <ul style='color:#0f346c; font-weight:500'>
                <li>Fabric: Soft and breathable cotton blend – gentle on kids’ skin</li>
                <li>Fit: Easy-to-wear relaxed fit for free movement and comfort</li>
                <li>Design: Stylish kurta paired with a contrast jacket – available in embroidered, printed, or plain styles</li>
                <li>Occasions: Perfect for festivals, weddings, school functions, and family gatherings</li>
              </ul>`
            
            break;
        case 'home':
            description = `
                <h3 style='color:#800000'>Description:</h3>
                <p>Give your space a touch of elegance and warmth with our beautifully crafted home decor items. Whether it’s for your living room, bedroom, or entryway, each piece adds character and charm to any corner of your home.</p>

                <h3 style='color:#800000'>Key Features:</h3>
                <ul style='color:#0f346c; font-weight:500'>
                  <li>Material: Premium ceramic, polyresin, or wood depending on the item</li>
                  <li>Design: Handcrafted and aesthetically pleasing for modern and traditional setups</li>
                  <li>Usage: Perfect for tabletops, shelves, or gifting purposes</li>
                  <li>Durability: Long-lasting quality with fade-resistant colors</li>
                </ul>
              `
            break;
  
        default:
          description = '<p>Product description not available</p>';
      }
      let size1 = '';
      if(cat ==='home')
      {
        size1 = `<h3 style='color:#800000;font-size:1.5vw'>Size: <strong style='color:#0f346c' > ${size}</strong></h3>`;
      }
      else{
        size1=``
      }
      // Insert the description into your container
    


      const indiv = document.createElement('div');
      indiv.className = 'in-product';
      indiv.style.position = 'fixed';
      indiv.style.top = '54%';
      indiv.style.left = '50%';
      indiv.style.transform = 'translate(-50%, -50%)';
      indiv.style.width = '90vw';
      indiv.style.height = '90vh';
      indiv.style.boxShadow = '0 10px 30px rgba(0, 0, 0, 0.2)';
      indiv.style.backgroundColor = '#fffaf0';
      indiv.style.padding = '20px';
      indiv.style.zIndex = '9999';
      indiv.style.borderRadius = '2em';
      indiv.style.overflowY='scroll';
      indiv.style.scrollbarWidth = 'none'; 
      const overlay = document.createElement("div");
      overlay.style.position = "fixed";
      overlay.style.top = 0;
      overlay.style.left = 0;
      overlay.style.width = "100vw";
      overlay.style.height = "100vh";
      overlay.style.backgroundColor = "rgba(0, 0, 0, 0.6)";
      overlay.style.zIndex = "9998";

      document.querySelector("body").style.overflow = "hidden";

      indiv.innerHTML = `
       <h2 id='close' style="position:absolute;top:15px;right:25px;cursor:pointer;margin:0;font-size:24px;color:#800000;">x</h2>
        <h2 style="color:#0f346c;font-weight:400;display:inline-block;border-bottom:1px solid orange;">Product Details:</h2>
        <br>
        <div style="width:78vw; height:78vh; display:flex;">
          <div style='width:40%; display:flex; a;height:100%'>
            <img style="max-height:80%; max-width:90%; border-radius:1em;margin-top:2rem;margin-left:2rem" src='${img}' alt='Product Image'/>
          </div>
          <div style='width:60%; padding:2rem;'>
            <h3 style="font-size:2.5vw;color:#0f346c;">${name}</h3>
            <p style="font-size:1.7vw; margin-top:1rem;">Price: <strong style='color:#800000'>₹${disprice}</strong></p>
            <p style="font-size:1.5vw; margin-top:0.5rem;">Original Price: <del>₹${orgprice}</del></p>
            <p style="font-size:1.3vw; margin-top:0.5rem;">You Save: <span style="color:green;">₹${saved}</span></p>
            <br>
            ${sizeOptions}
            <br>
            ${description}
            <br>
            ${size1}
            <br>
           
           
            <button id="addToCart" style="padding:1rem 2rem; background:#800000; color:white; border:none; font-size:1rem; border-radius:0.5em;">Add to Cart</button>
            <button id="addToWishlist" style="padding:1rem 2rem; margin-left:1rem; background:transparent; border:1px solid #800000; color:#800000; font-size:1rem; border-radius:0.5em;">♡ Add to Wishlist</button>
            <br>
            <br>
             <button id="chart" style="padding:1rem 2rem; background:transparent; border:1px solid #800000; color:#800000; font-size:1rem; border-radius:0.5em;">Size-Chart</button>
          </div>
          <div id='display'></div>
        </div>
      `;

      document.body.appendChild(indiv);
      document.body.appendChild(overlay);

      let selectedSize = null;

      indiv.querySelectorAll('.size-option').forEach(option => {
        option.style.border = '1px solid #800000';
        option.style.padding = '5px 10px';
        option.style.cursor = 'pointer';
        option.style.color='#0f346c';
        option.style.backgroundColor='white';
        option.addEventListener('click', () => {
          selectedSize = option.textContent;
          indiv.querySelectorAll('.size-option').forEach(opt => opt.style.backgroundColor = '');
          option.style.backgroundColor = 'orange'
          // option.style.color='#ff7b00';
        });
      });
      
      indiv.querySelector('#close').addEventListener('click', () => {
        document.body.removeChild(indiv);
        document.body.removeChild(overlay);
        document.body.style.overflow = "auto";
      });

      indiv.querySelector('#addToCart').addEventListener('click', () => {
        if (!selectedSize) {
          alert("Please select a size.");
          return;
        }
        // the below code is for the size chart to be displayed
      
        const cart = JSON.parse(localStorage.getItem('cart') || '[]');
        cart.push({
          name,
          img,
          disprice,
          orgprice,
          saved,
          size: selectedSize
        });
        localStorage.setItem('cart', JSON.stringify(cart));
        window.location.href = "cart.html";
      });
      indiv.querySelector('#chart').addEventListener('click', () => {
        // alert('hello')
      let dis = indiv.querySelector('#display'); // Element for displaying the size chart
      dis.innerHTML = ``;
    
      switch (cat) {
        case 'lehenga':
        case 'Stitched Suit':
          dis.innerHTML = `
            <div style="max-width: 800px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px; background: #fff;">
              <h3 style="text-align: center; color: #222;">${cat} Size Chart (Ladies)</h3>
              <table style="width: 100%; border-collapse: collapse; margin-top: 15px;">
                <thead>
                  <tr style="background: #222; color: #fff;">
                    <th style="padding: 10px;border: 1px solid #ddd;">Size</th>
                    <th style="padding: 10px;border: 1px solid #ddd;">Bust (in)</th>
                    <th style="padding: 10px;border: 1px solid #ddd;">Waist (in)</th>
                    <th style="padding: 10px;border: 1px solid #ddd;">Hip (in)</th>
                    <th style="padding: 10px;border: 1px solid #ddd;">Length (in)</th>
                  </tr>
                </thead>
                <tbody>
                  <tr><td style="padding:10px;border: 1px solid #ddd;">XS</td><td style="padding:10px;border: 1px solid #ddd;">32</td><td style="padding:10px;border: 1px solid #ddd;">26</td><td style="padding:10px;border: 1px solid #ddd;">34</td><td style="padding:10px;border: 1px solid #ddd;">40-42</td></tr>
                  <tr><td style="padding:10px;border: 1px solid #ddd;">S</td><td style="padding:10px;border: 1px solid #ddd;">34</td><td style="padding:10px;border: 1px solid #ddd;">28</td><td style="padding:10px;border: 1px solid #ddd;">36</td><td style="padding:10px;border: 1px solid #ddd;">41-43</td></tr>
                  <tr><td style="padding:10px;border: 1px solid #ddd;">M</td><td style="padding:10px;border: 1px solid #ddd;">36</td><td style="padding:10px;border: 1px solid #ddd;">30</td><td style="padding:10px;border: 1px solid #ddd;">38</td><td style="padding:10px;border: 1px solid #ddd;">42-44</td></tr>
                  <tr><td style="padding:10px;border: 1px solid #ddd;">L</td><td style="padding:10px;border: 1px solid #ddd;">38</td><td style="padding:10px;border: 1px solid #ddd;">32</td><td style="padding:10px;border: 1px solid #ddd;">40</td><td style="padding:10px;border: 1px solid #ddd;">43-45</td></tr>
                  <tr><td style="padding:10px;border: 1px solid #ddd;">XL</td><td style="padding:10px;border: 1px solid #ddd;">40</td><td style="padding:10px;border: 1px solid #ddd;">34</td><td style="padding:10px;border: 1px solid #ddd;">42</td><td style="padding:10px;border: 1px solid #ddd;">44-46</td></tr>
                  <tr><td style="padding:10px;border: 1px solid #ddd;">XXL</td><td style="padding:10px;border: 1px solid #ddd;">42</td><td style="padding:10px;border: 1px solid #ddd;">36</td><td style="padding:10px;border: 1px solid #ddd;">44</td><td style="padding:10px;border: 1px solid #ddd;">45-47</td></tr>
                </tbody>
              </table>
            </div>
          `;
          break;
    
        case 'Kurta Pajama':
          dis.innerHTML = `
            <div style="max-width: 800px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px; background: #fff;display:block">
              <h3 style="text-align: center; color: #222;">${cat} Size Chart (Men)</h3>
              <table style="width: 100%; border-collapse: collapse; margin-top: 15px;">
                <thead>
                  <tr style="background: #222; color: #fff;">
                    <th style="padding: 10px;border: 1px solid #ddd;">Size</th>
                    <th style="padding: 10px;border: 1px solid #ddd;">Chest (in)</th>
                    <th style="padding: 10pxborder: 1px solid #ddd;Waist (in)</th>
                    <th style="padding: 10px;border: 1px solid #ddd;">Shoulder (in)</th>
                    <th style="padding: 10px;border: 1px solid #ddd;">Kurta Length</th>
                    <th style="padding: 10px;border: 1px solid #ddd;"row-span:2>Pajama Waist</th>
                  </tr>
                </thead>
                <tbody>
                  <tr><td style="padding:10px;border: 1px solid #ddd;">XS</td><td style="padding:10px;border: 1px solid #ddd;">36</td><td style="padding:10px;border: 1px solid #ddd;">30</td><td style="padding:10px;border: 1px solid #ddd;">16</td><td style="padding:10px;border: 1px solid #ddd;">38-40</td><td style="padding:10px;border: 1px solid #ddd;">28-30</td></tr>
                  <tr><td style="padding:10px;border: 1px solid #ddd;">S</td><td style="padding:10px;border: 1px solid #ddd;">38</td><td style="padding:10px;border: 1px solid #ddd;">32</td><td style="padding:10px;border: 1px solid #ddd;">17</td><td style="padding:10px;border: 1px solid #ddd;">40-42</td><td style="padding:10px;border: 1px solid #ddd;">30-32</td></tr>
                  <tr><td style="padding:10px;border: 1px solid #ddd;">M</td><td style="padding:10px;border: 1px solid #ddd;">40</td><td style="padding:10px;border: 1px solid #ddd;">34</td><td style="padding:10px;border: 1px solid #ddd;">18</td><td style="padding:10px;border: 1px solid #ddd;">42-44</td><td style="padding:10px;border: 1px solid #ddd;">32-34</td></tr>
                  <tr><td style="padding:10px;border: 1px solid #ddd;">L</td><td style="padding:10px;border: 1px solid #ddd;">42</td><td style="padding:10px;border: 1px solid #ddd;">36</td><td style="padding:10px;border: 1px solid #ddd;">19</td><td style="padding:10px;border: 1px solid #ddd;">44-46</td><td style="padding:10px;border: 1px solid #ddd;">34-36</td></tr>
                  <tr><td style="padding:10px;border: 1px solid #ddd;">XL</td><td style="padding:10px;border: 1px solid #ddd;">44</td><td style="padding:10px;border: 1px solid #ddd;">38</td><td style="padding:10px;border: 1px solid #ddd;">20</td><td style="padding:10px;border: 1px solid #ddd;">46-48</td><td style="padding:10px;border: 1px solid #ddd;">36-38</td></tr>
                  <tr><td style="padding:10px;border: 1px solid #ddd;">XXL</td><td>46</td><td style="padding:10px;border: 1px solid #ddd;">40</td><td style="padding:10px;border: 1px solid #ddd;">21</td><td style="padding:10px;border: 1px solid #ddd;">48-50</td><td style="padding:10px;border: 1px solid #ddd;">38-40</td></tr>
                </tbody>
              </table>
            </div>
          `;
          break;
        case 'Kurta Jacket':
          dis.innerHTML = `
            <div style="max-width: 800px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px; background: #fff;display:block">
              <h3 style="text-align: center; color: #222;">${cat} Size Chart (Men)</h3>
              <table style="width: 100%; border-collapse: collapse; margin-top: 15px;">
                <thead>
                  <tr style="background: #222; color: #fff;">
                    <th style="padding: 10px;border: 1px solid #ddd;">Size</th>
                    <th style="padding: 10px;border: 1px solid #ddd;">Chest (in)</th>
                    <th style="padding: 10pxborder: 1px solid #ddd;Waist (in)</th>
                    <th style="padding: 10px;border: 1px solid #ddd;">Shoulder (in)</th>
                    <th style="padding: 10px;border: 1px solid #ddd;">Kurta Length</th>
                    <th style="padding: 10px;border: 1px solid #ddd;"row-span:2>Pajama Waist</th>
                  </tr>
                </thead>
                <tbody>
                  <tr><td style="padding:10px;border: 1px solid #ddd;">XS</td><td style="padding:10px;border: 1px solid #ddd;">36</td><td style="padding:10px;border: 1px solid #ddd;">30</td><td style="padding:10px;border: 1px solid #ddd;">16</td><td style="padding:10px;border: 1px solid #ddd;">38-40</td><td style="padding:10px;border: 1px solid #ddd;">28-30</td></tr>
                  <tr><td style="padding:10px;border: 1px solid #ddd;">S</td><td style="padding:10px;border: 1px solid #ddd;">38</td><td style="padding:10px;border: 1px solid #ddd;">32</td><td style="padding:10px;border: 1px solid #ddd;">17</td><td style="padding:10px;border: 1px solid #ddd;">40-42</td><td style="padding:10px;border: 1px solid #ddd;">30-32</td></tr>
                  <tr><td style="padding:10px;border: 1px solid #ddd;">M</td><td style="padding:10px;border: 1px solid #ddd;">40</td><td style="padding:10px;border: 1px solid #ddd;">34</td><td style="padding:10px;border: 1px solid #ddd;">18</td><td style="padding:10px;border: 1px solid #ddd;">42-44</td><td style="padding:10px;border: 1px solid #ddd;">32-34</td></tr>
                  <tr><td style="padding:10px;border: 1px solid #ddd;">L</td><td style="padding:10px;border: 1px solid #ddd;">42</td><td style="padding:10px;border: 1px solid #ddd;">36</td><td style="padding:10px;border: 1px solid #ddd;">19</td><td style="padding:10px;border: 1px solid #ddd;">44-46</td><td style="padding:10px;border: 1px solid #ddd;">34-36</td></tr>
                  <tr><td style="padding:10px;border: 1px solid #ddd;">XL</td><td style="padding:10px;border: 1px solid #ddd;">44</td><td style="padding:10px;border: 1px solid #ddd;">38</td><td style="padding:10px;border: 1px solid #ddd;">20</td><td style="padding:10px;border: 1px solid #ddd;">46-48</td><td style="padding:10px;border: 1px solid #ddd;">36-38</td></tr>
                  <tr><td style="padding:10px;border: 1px solid #ddd;">XXL</td><td>46</td><td style="padding:10px;border: 1px solid #ddd;">40</td><td style="padding:10px;border: 1px solid #ddd;">21</td><td style="padding:10px;border: 1px solid #ddd;">48-50</td><td style="padding:10px;border: 1px solid #ddd;">38-40</td></tr>
                </tbody>
              </table>
            </div>
          `
          break;
        case 'sherwani' :
          dis.innerHTML = `
            <div style="max-width: 800px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px; background: #fff;display:block">
              <h3 style="text-align: center; color: #222;">${cat} Size Chart (Men)</h3>
              <table style="width: 100%; border-collapse: collapse; margin-top: 15px;">
                <thead>
                  <tr style="background: #222; color: #fff;">
                    <th style="padding: 10px;border: 1px solid #ddd;">Size</th>
                    <th style="padding: 10px;border: 1px solid #ddd;">Chest (in)</th>
                    <th style="padding: 10pxborder: 1px solid #ddd;Waist (in)</th>
                    <th style="padding: 10px;border: 1px solid #ddd;">Shoulder (in)</th>
                    <th style="padding: 10px;border: 1px solid #ddd;">Kurta Length</th>
                    <th style="padding: 10px;border: 1px solid #ddd;"row-span:2>Pajama Waist</th>
                  </tr>
                </thead>
                <tbody>
                  <tr><td style="padding:10px;border: 1px solid #ddd;">XS</td><td style="padding:10px;border: 1px solid #ddd;">36</td><td style="padding:10px;border: 1px solid #ddd;">30</td><td style="padding:10px;border: 1px solid #ddd;">16</td><td style="padding:10px;border: 1px solid #ddd;">38-40</td><td style="padding:10px;border: 1px solid #ddd;">28-30</td></tr>
                  <tr><td style="padding:10px;border: 1px solid #ddd;">S</td><td style="padding:10px;border: 1px solid #ddd;">38</td><td style="padding:10px;border: 1px solid #ddd;">32</td><td style="padding:10px;border: 1px solid #ddd;">17</td><td style="padding:10px;border: 1px solid #ddd;">40-42</td><td style="padding:10px;border: 1px solid #ddd;">30-32</td></tr>
                  <tr><td style="padding:10px;border: 1px solid #ddd;">M</td><td style="padding:10px;border: 1px solid #ddd;">40</td><td style="padding:10px;border: 1px solid #ddd;">34</td><td style="padding:10px;border: 1px solid #ddd;">18</td><td style="padding:10px;border: 1px solid #ddd;">42-44</td><td style="padding:10px;border: 1px solid #ddd;">32-34</td></tr>
                  <tr><td style="padding:10px;border: 1px solid #ddd;">L</td><td style="padding:10px;border: 1px solid #ddd;">42</td><td style="padding:10px;border: 1px solid #ddd;">36</td><td style="padding:10px;border: 1px solid #ddd;">19</td><td style="padding:10px;border: 1px solid #ddd;">44-46</td><td style="padding:10px;border: 1px solid #ddd;">34-36</td></tr>
                  <tr><td style="padding:10px;border: 1px solid #ddd;">XL</td><td style="padding:10px;border: 1px solid #ddd;">44</td><td style="padding:10px;border: 1px solid #ddd;">38</td><td style="padding:10px;border: 1px solid #ddd;">20</td><td style="padding:10px;border: 1px solid #ddd;">46-48</td><td style="padding:10px;border: 1px solid #ddd;">36-38</td></tr>
                  <tr><td style="padding:10px;border: 1px solid #ddd;">XXL</td><td>46</td><td style="padding:10px;border: 1px solid #ddd;">40</td><td style="padding:10px;border: 1px solid #ddd;">21</td><td style="padding:10px;border: 1px solid #ddd;">48-50</td><td style="padding:10px;border: 1px solid #ddd;">38-40</td></tr>
                </tbody>
              </table>
            </div>
          `;
          break;
    
        case 'kids':
          dis.innerHTML = `
            <div style="max-width: 800px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px; background: #fff;">
              <h3 style="text-align: center; color: #222;">${cat} Size Chart (Kids)</h3>
              <table style="width: 100%; border-collapse: collapse; margin-top: 15px;">
                <thead>
                  <tr style="background: #f2f2f2; ;">
                    <th style="padding: 10px;border: 1px solid #ddd">Age</th>
                    <th style="padding: 10px;border: 1px solid #ddd">Height (in)</th>
                    <th style="padding: 10px;border: 1px solid #ddd">Chest (in)</th>
                    <th style="padding: 10px;border: 1px solid #ddd">Waist (in)</th>
                  </tr>
                </thead>
                <tbody>
                  <tr><td style="padding:10px;border: 1px solid #ddd;">2–3Y</td><td style="padding:10px;border: 1px solid #ddd;">33–36</td><td style="padding:10px;border: 1px solid #ddd;">20–21</td><td style="padding:10px;border: 1px solid #ddd;">19–20</td></tr>
                  <tr><td style="padding:10px;border: 1px solid #ddd;">3–4Y</td><td style="padding:10px;border: 1px solid #ddd;">36–39</td><td style="padding:10px;border: 1px solid #ddd;">21–22</td><td style="padding:10px;border: 1px solid #ddd;">20–21</td></tr>
                  <tr><td style="padding:10px;border: 1px solid #ddd;">4–5Y</td><td style="padding:10px;border: 1px solid #ddd;">39–42</td><td style="padding:10px;border: 1px solid #ddd;">22–23</td><td style="padding:10px;border: 1px solid #ddd;">21–22</td></tr>
                  <tr><td style="padding:10px;border: 1px solid #ddd;">5–6Y</td><td style="padding:10px;border: 1px solid #ddd;">42–45</td><td style="padding:10px;border: 1px solid #ddd;">23–24</td><td style="padding:10px;border: 1px solid #ddd;">22–23</td></tr>
                  <tr><td style="padding:10px;border: 1px solid #ddd;">6–7Y</td><td style="padding:10px;border: 1px solid #ddd;">45–48</td><td style="padding:10px;border: 1px solid #ddd;">24–25</td><td style="padding:10px;border: 1px solid #ddd;">23–24</td></tr>
                  <tr><td style="padding:10px;border: 1px solid #ddd;">7–8Y</td><td style="padding:10px;border: 1px solid #ddd;">48–51</td><td style="padding:10px;border: 1px solid #ddd;">25–26</td><td style="padding:10px;border: 1px solid #ddd;">24–25</td></tr>
                  <tr><td style="padding:10px;border: 1px solid #ddd;">8–9Y</td><td style="padding:10px;border: 1px solid #ddd;">51–54</td><td style="padding:10px;border: 1px solid #ddd;">26–27</td><td style="padding:10px;border: 1px solid #ddd;">25–26</td></tr>
                  <tr><td style="padding:10px;border: 1px solid #ddd;">9–10Y</td><td style="padding:10px;border: 1px solid #ddd;">54–57</td><td style="padding:10px;border: 1px solid #ddd;">27–28</td><td style="padding:10px;border: 1px solid #ddd;">26–27</td></tr>
                </tbody>
              </table>
            </div>
          `;
          break;
        case 'home':
          dis.innerHTML = `  <div style="max-width: 800px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px; background: #fff;"> <h3 style='color:#800000'>Size Chart:</h3>
  <table style="width: 100%; border-collapse: collapse; margin-top: 15px;">
    <thead>
      <tr style="background-color: #f2f2f2;">
        <th style="border: 1px solid #ddd; padding: 8px;">Size</th>
        <th style="border: 1px solid #ddd; padding: 8px;">Height (cm)</th>
        <th style="border: 1px solid #ddd; padding: 8px;">Width (cm)</th>
        <th style="border: 1px solid #ddd; padding: 8px;">Depth (cm)</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td style="border: 1px solid #ddd; padding: 8px;">Small</td>
        <td style="border: 1px solid #ddd; padding: 8px;">10 - 15</td>
        <td style="border: 1px solid #ddd; padding: 8px;">8 - 12</td>
        <td style="border: 1px solid #ddd; padding: 8px;">5 - 8</td>
      </tr>
      <tr>
        <td style="border: 1px solid #ddd; padding: 8px;">Medium</td>
        <td style="border: 1px solid #ddd; padding: 8px;">16 - 25</td>
        <td style="border: 1px solid #ddd; padding: 8px;">13 - 20</td>
        <td style="border: 1px solid #ddd; padding: 8px;">9 - 12</td>
      </tr>
      <tr>
        <td style="border: 1px solid #ddd; padding: 8px;">Large</td>
        <td style="border: 1px solid #ddd; padding: 8px;">26 - 35</td>
        <td style="border: 1px solid #ddd; padding: 8px;">21 - 30</td>
        <td style="border: 1px solid #ddd; padding: 8px;">13 - 18</td>
      </tr>
    </tbody>
  </table>
  </div>`
  break;
    
        default:
          dis.innerHTML = `<p style="text-align:center; color:red;">Size chart not available for "${cat}"</p>`;
      }
    });

      indiv.querySelector('#addToWishlist').addEventListener('click', () => {
        const wishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
        wishlist.push({ name, img, disprice });
        localStorage.setItem('wishlist', JSON.stringify(wishlist));
        alert("Added to wishlist!");
      });
    });
  });
});
// the below code is for the smoth trsnsition when clicked the image in the home.html it will go to shop.html

  window.addEventListener("load", function () {
    const hash = window.location.hash;
    if (hash) {
      const target = document.querySelector(hash);
      if (target) {
        setTimeout(() => {
          target.scrollIntoView({ behavior: "smooth" });
        }, 100); // delay for smooth load
      }
    }
  });


