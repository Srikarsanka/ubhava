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
  

   