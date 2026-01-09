// User variable is managed by Auth class in auth.js
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
// Profile icon click event (Now attached to User Name)
const profileTrigger = document.querySelector("#nav-user-display"); 
if (profileTrigger) {
    profileTrigger.addEventListener("click", function () {
        // Only opens if user is clicked (which implies they are logged in)
        if (Auth.user) {
            displayprofile();
        }
    });
}

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

// Note: Old display() function removed as it is replaced by Auth.showLoginModal() in auth.js

/* ----------------------------- */
/*      New: displayprofile()    */
/*      Fetches data from API    */
/* ----------------------------- */
async function displayprofile() {
  // Remove any existing modals or popups first
  removeModalContainers();

  // Fetch latest user data and orders
  let userData = Auth.user;
  let orders = [];
  
  try {
      // Refresh user data
      const userRes = await fetch('/api/auth/me', {
          headers: { 'Authorization': `Bearer ${Auth.token}` } 
      });
      if(userRes.ok) {
          userData = await userRes.json();
      }

      // Fetch orders
      const orderRes = await fetch('/api/orders/myorders');
      if(orderRes.ok) {
          orders = await orderRes.json();
      }
  } catch (err) {
      console.error("Error fetching profile data:", err);
  }

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
  headerTitle.style.fontFamily = "'MyCustomFont', sans-serif";
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

  // Body
  const bodyDiv = document.createElement("div");
  bodyDiv.style.marginTop = "1rem";

  // Address logic 
  const addressDisplay = "Manage addresses in Cart (coming soon)";

  // Orders HTML
  let ordersHTML = `<p style="margin: 0.3rem 0 0 1.5rem;">No orders yet.</p>`;
  if(orders.length > 0) {
      ordersHTML = orders.map(order => `
        <div style="margin: 10px 0; padding: 10px; border: 1px solid #ddd; border-radius: 5px; background: #fff;">
            <strong>Order ID:</strong> ${order._id.substring(0, 10)}... <br>
            <strong>Date:</strong> ${new Date(order.createdAt).toLocaleDateString()} <br>
            <strong>Total:</strong> ₹${order.totalAmount} <br>
            <strong>Status:</strong> ${order.orderStatus}
        </div>
      `).join('');
  }


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

              <div>
                  <strong>🏠 Address:</strong>
                  <p id="addressText" style="margin: 0.3rem 0 0 1.5rem;">
                      ${addressDisplay}
                  </p>
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
  logoutBtn.style.marginBottom = "2rem";
  logoutBtn.style.cursor = "pointer";
  logoutBtn.style.display = "block";
  logoutBtn.style.marginLeft = "auto";
  logoutBtn.style.marginRight = "auto";
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

// --------------------------------------------------------
// PRODUCT DATA - Using hardcoded array for now
// --------------------------------------------------------

// Products array will be loaded from products_data.js
// Make sure to include: <script src="products_data.js"></script> in HTML before shop.js

async function initializeProducts() {
    // 1. Fetch Products from Backend API
    try {
        const response = await fetch(`/api/products?t=${new Date().getTime()}`);
        if (response.ok) {
            const backendProducts = await response.json();
             // Map backend data to frontend structure
            if(backendProducts && backendProducts.length > 0) {
                 products = backendProducts.map(p => ({
                    id: p._id, // Critical: MongoDB ObjectId
                    name: p.name,
                    img: p.images && p.images.length > 0 ? p.images[0] : '', 
                    price: p.price,
                    subCategory: p.subCategory,
                    category: p.category,
                    video: p.video,
                    size: p.sizes ? p.sizes.join(', ') : '',
                    description: p.description || '',
                    stock: p.stockAvailable // Mapped from backend
                }));
                console.log("Products loaded from API:", products.length);
            }
        } else {
             console.error("Failed to fetch products from API, using fallback data.");
        }
    } catch (e) {
        console.error("Error fetching products:", e);
    }

    // Products array is now available (either from API or products_data.js fallback)
    if (typeof products === 'undefined' || products.length === 0) {
        console.error('Products array not found! Make sure products_data.js is loaded first.');
        return;
    }
    
    renderproducts();
    attachProductEvents(); 
    initializeFilters();
    
    // Smooth scroll logic
    const hash = window.location.hash;
    if (hash) {
        const target = document.querySelector(hash);
        if (target) {
            setTimeout(() => {
                target.scrollIntoView({ behavior: "smooth" });
            }, 100);
        }
    }
}

// Render Products Logic
function renderproducts() {
  products.forEach((product) => {
    if (!product.subCategory) return;
    
    // Only append if the container exists
    const container = document.getElementById(product.subCategory);
    if(!container) return;

    let div = document.createElement("div");
    div.className = "product-content";
    
    div.setAttribute("data-image", product.img);
    div.setAttribute("data-name", product.name);
    div.setAttribute("data-price", product.price || "Not Available");
    div.setAttribute("subcategory", product.subCategory);
    div.setAttribute("id", product.id);
    div.setAttribute("size", product.size);
    
    // Add explicitly typed category for size chart logic
    // Default to 'women' if missing, but use product.category (men/women/kids)
    const targetAudience = product.category ? product.category.toLowerCase() : 'women';
    div.setAttribute("data-target-audience", targetAudience);

    const orgnialprice = parseInt(product.price || 0) + 1000; 
    const discount = orgnialprice * 0.1;
    const discountedprice = orgnialprice - discount;

    div.setAttribute("data-discounted-price", discountedprice.toFixed(0));
    div.setAttribute("data-original-price", orgnialprice);

    const mediaContent = product.video
      ? `<div class="product-media-wrapper">
           <video class="video-hover" loop poster="${product.img}" src="${product.video}" type="video/mp4" muted></video>
           <div class="sound-toggle-btn" title="Toggle Sound">🔇</div>
         </div>`
      : `<div class="product-media-wrapper"><img src="${product.img}" alt="${product.name}"></div>`;

    div.innerHTML = `
       ${mediaContent}
       <div class="product-details">
          <h3 class="product-title" title="${product.name}">${product.name}</h3>
          <div class="product-price-container">
            <span class="current-price">₹${product.price ? discountedprice.toFixed(0) : "N/A"}</span>
            <span class="original-price">₹${product.price ? orgnialprice : ""}</span>
          </div>
          
          <!-- Stock Warning -->
          ${product.stock > 0 && product.stock <= 5 ? 
            `<div style="color: red; font-size: 0.8rem; font-weight: bold; margin-top: 5px;">🔥 Only ${product.stock} left!</div>` 
            : ''}
          
          ${product.stock === 0 ? 
            `<div style="color: grey; font-size: 0.8rem; font-weight: bold; margin-top: 5px;">Out of Stock</div>` 
            : ''}
      </div>
    `;

    container.appendChild(div);
  });
}

function attachProductEvents() {
  document.querySelectorAll(".product-content").forEach((container) => {
    const video = container.querySelector("video");
    const soundBtn = container.querySelector(".sound-toggle-btn");

    if (soundBtn && video) {
        soundBtn.addEventListener("click", (e) => {
            e.stopPropagation(); // Prevent modal opening
            video.muted = !video.muted;
            soundBtn.textContent = video.muted ? "🔇" : "🔊";
        });
    }

    video?.addEventListener("mouseenter", () => {
      container.style.transform = "scale(1.1)";
      container.style.transition = "transform 0.3s ease";
      
      const playPromise = video.play();
      if (playPromise !== undefined) {
         playPromise.catch(error => {
             console.log("Auto-play prevented:", error);
         });
      }
    });

    video?.addEventListener("mouseleave", () => {
        if(video) {
            video.pause();
            video.currentTime = 0;
            video.load(); 
        }
      container.style.transform = "scale(1)";
    });

    container.addEventListener("click", () => {
      showProductModal(container); 
    });
  });
}

// Modal Logic - Restored & Refactored for Dynamic Data
function showProductModal(container) {
      const productId = container.getAttribute("id");
      
      // Find the full product object from the global 'products' array (loaded from API)
      const product = products.find(p => p.id == productId);

      if (!product) {
          console.error("Product data not found for ID:", productId);
          return;
      }

      const img = product.img; // Use object data, not DOM attributes where possible
      const name = product.name;
      // Calculate prices dynamically if needed, or use stored attributes
      const disprice = parseInt(container.getAttribute("data-discounted-price"));
      const orgprice = parseInt(container.getAttribute("data-original-price"));
      
      // Categories
      const cat = product.subCategory || "";
      const parentCat = product.category || "";
      
      // ---------------------------------------------------------
      // DYNAMIC DESCRIPTION (Fixes "Not Updating" Issue)
      // ---------------------------------------------------------
      // Use the description from the database. 
      // If empty, fallback to the old generic text logic only as a safety net.
      let descriptionHTML = "";
      
      if (product.description && product.description.trim().length > 0) {
          descriptionHTML = `
            <h4 style='color:#800000;margin-bottom:5px'>Description</h4>
            <p class="modal-description" style="white-space: pre-line;">${product.description}</p>
          `;
      } else {
          // Fallback logic if DB has no description (preserving old generic text style)
          descriptionHTML = getFallbackDescription(name, cat, parentCat);
      }


      // ---------------------------------------------------------
      // SIZE SELECTOR LOGIC
      // ---------------------------------------------------------
      const targetAudience = container.getAttribute("data-target-audience");
      const isMens = targetAudience === 'men' || parentCat === 'men';
      const isKids = targetAudience === 'kids' || parentCat === 'kids';
      const isWomen = targetAudience === 'women' || parentCat === 'women'; 
      const nameLower = name.toLowerCase();
      const isSaree = cat === 'saree' || nameLower.includes('saree') || nameLower.includes('sari');

      let sizeOptionsHTML = "";
      
      // Show sizes for Clothing (Men, Women, Kids) but NOT Saree (Free Size)
      const showSizeSelector = (isMens || isKids || isWomen) && !isSaree && !['home', 'HomeDecor', 'jewellary', 'toys'].includes(cat);

      if (showSizeSelector) {
           let sizes = ["XS", "S", "M", "L", "XL", "XXL"];
           let label = "Select Size:";
           
           if (isKids) {
               sizes = ["2-3Y", "3-4Y", "4-5Y", "5-6Y", "6-7Y", "7-8Y", "8-9Y", "9-10Y"];
               label = "Select Age:";
           }

           sizeOptionsHTML = `
            <div class="size-selector-container">
              <strong style="color:#0f346c;">${label}</strong>
              <div class="size-options-grid">
                ${sizes.map(s => `<div class="size-btn">${s}</div>`).join('')}
              </div>
            </div>`;
      }

      // ---------------------------------------------------------
      // CONSTRUCT MODAL
      // ---------------------------------------------------------
      const modalContainer = document.createElement("div");
      modalContainer.className = "product-modal-container";
      
      const overlay = document.createElement("div");
      overlay.style.position = "fixed";
      overlay.style.top = "0"; overlay.style.left = "0";
      overlay.style.width = "100vw"; overlay.style.height = "100vh";
      overlay.style.backgroundColor = "rgba(0, 0, 0, 0.6)";
      overlay.style.zIndex = "9999";
      overlay.style.backdropFilter = "blur(5px)";

      document.body.style.overflow = "hidden";

      // Wishlist State
      const wishlist = JSON.parse(localStorage.getItem("wishlist") || "[]");
      const isWishlisted = wishlist.some(item => item.name === name);
      const wishlistBtnText = isWishlisted ? "❤️ Wishlisted" : "♡ Wishlist";
      const wishlistBtnClass = isWishlisted ? "btn-secondary active" : "btn-secondary";

      // Size Chart HTML (Simplified for now, can be expanded if users need it back)
      const showChart = showSizeSelector;
      const chartHTML = showChart ? `<div style="margin-top:10px; font-size:0.9rem; color:#0f346c; cursor:pointer; text-decoration:underline;">View Size Chart (Standard)</div>` : '';


      modalContainer.innerHTML = `
        <button class="close-modal-btn" id="closeModal">✕</button>
        <div class="modal-split-view">
            <div class="modal-image-side">
                <img src="${img}" alt="${name}" />
            </div>
            <div class="modal-info-side">
                <h2 class="modal-title">${name}</h2>
                <div class="modal-price-row">
                    <span class="current-price" style="font-size:1.8rem;">₹${disprice}</span>
                    <span class="original-price" style="font-size:1.2rem;">₹${orgprice}</span>
                    <span style="color:green; font-weight:600; font-size:0.9rem;">${Math.round(((orgprice-disprice)/orgprice)*100)}% OFF</span>
                </div>
                
                <div class="modal-desc-scroll-area" style="max-height: 200px; overflow-y: auto; margin-bottom: 15px; padding-right: 5px;">
                    ${descriptionHTML}
                </div>

                ${sizeOptionsHTML}

                <div class="action-buttons" style="margin-top: 20px;">
                    <button class="btn-primary" id="addToCart">Add to Cart</button>
                    <button class="${wishlistBtnClass}" id="addToWishlist">${wishlistBtnText}</button>
                </div>
            </div>
        </div>
      `;

      document.body.appendChild(overlay);
      document.body.appendChild(modalContainer);

      // ---------------------------------------------------------
      // EVENT LISTENERS
      // ---------------------------------------------------------
      const closeValues = () => {
          modalContainer.remove();
          overlay.remove();
          document.body.style.overflow = "auto";
      };
      
      modalContainer.querySelector("#closeModal").addEventListener("click", closeValues);
      overlay.addEventListener("click", closeValues);

      // Size Selection
      let selectedSize = null;
      modalContainer.querySelectorAll(".size-btn").forEach(btn => {
          btn.addEventListener("click", () => {
              modalContainer.querySelectorAll(".size-btn").forEach(b => b.classList.remove("active"));
              btn.classList.add("active");
              selectedSize = btn.textContent;
          });
      });

      // Add to Cart
      modalContainer.querySelector("#addToCart").addEventListener("click", async () => {
          if (!Auth.user) {
             alert("Please login to add items to cart.");
             closeValues();
             Auth.showLoginModal();
             return;
          }

          if (showSizeSelector && !selectedSize) {
              alert("Please select a size first.");
              return;
          }
         
          const cartSize = selectedSize || (isSaree ? 'Free Size' : 'Standard');
          const btn = modalContainer.querySelector("#addToCart");
          const originalText = btn.textContent;
          btn.textContent = "Adding...";
          btn.disabled = true;

         try {
             const response = await fetch('/api/cart/add', {
                 method: 'POST',
                 headers: { 'Content-Type': 'application/json' },
                 body: JSON.stringify({ productId: productId, quantity: 1, size: cartSize })
             });

             if (response.ok) {
                 btn.textContent = "Added ✓";
                 btn.style.backgroundColor = "#2e7d32";
                 setTimeout(() => { closeValues(); }, 500);
             } else {
                const err = await response.json();
                alert(`Error: ${err.message || 'Failed'}`);
                btn.textContent = originalText;
                btn.disabled = false;
             }
         } catch (error) {
             console.error(error);
             alert("Network error.");
             btn.textContent = originalText;
             btn.disabled = false;
         }
      });
      
      // Wishlist
      modalContainer.querySelector("#addToWishlist").addEventListener("click", (e) => {
          // ... (Existing wishlist logic logic, keeping it simple for now)
          const btn = e.target;
          let currentWishlist = JSON.parse(localStorage.getItem("wishlist") || "[]");
          const existsIndex = currentWishlist.findIndex(item => item.name === name);

          if (existsIndex > -1) {
              currentWishlist.splice(existsIndex, 1);
              btn.textContent = "♡ Wishlist";
              btn.classList.remove("active");
              alert("Removed from Wishlist");
          } else {
              currentWishlist.push({ name, img, disprice, id: productId });
              btn.textContent = "❤️ Wishlisted";
              btn.classList.add("active");
              alert("Added to Wishlist!");
          }
          localStorage.setItem("wishlist", JSON.stringify(currentWishlist));
      });
}

// Fallback Description Helper (Restoring the 'feeling' of the old descriptions if DB is empty)
function getFallbackDescription(name, cat, parentCat) {
    const nameLower = name.toLowerCase();
    
    if (cat === 'saree' || nameLower.includes('saree')) {
        return `<p>Traditional Indian Saree matching the style of ${name}. Elegant, timeless, and perfect for special occasions.</p>`;
    }
    if (parentCat === 'men' || targetAudience === 'men') {
        return `<p>Premium Men's wear. Crafted for comfort and style, suitable for festive and casual events.</p>`;
    }
    return `<p>High quality ${name}. Authentic Indian craftsmanship.</p>`;
}



// --------------------------------------------------------
// FILTER LOGIC
// --------------------------------------------------------

let currentCategory = "all";
let currentMinPrice = 0;
let currentMaxPrice = 50000;

function filterProducts(category, minPrice = 0, maxPrice = 50000) {
  currentCategory = category;
  currentMinPrice = minPrice;
  currentMaxPrice = maxPrice;

  const allProductContainers = document.querySelectorAll(".product-content");
  const defaultContent = document.getElementById("defaultContent");
  let visibleCount = 0;

  if (category === "all") {
    if (defaultContent) defaultContent.style.display = "block";
  } else {
    if (defaultContent) defaultContent.style.display = "none";
  }

  allProductContainers.forEach((container) => {
    const productCategory = container.getAttribute("subcategory");
    const productId = container.getAttribute("id");
    const product = products.find((p) => p.id == productId);
    const productMainCategory = product?.category;
    const productPrice = parseInt(product?.price || 0);

    let categoryMatch = false;
    if (category === "all") {
      categoryMatch = true;
    } else if (category === "women" && productMainCategory === "women") {
      categoryMatch = true;
    } else if (category === "men" && productMainCategory === "men") {
      categoryMatch = true;
    } else if (category === "kids" && productMainCategory === "kids") {
      categoryMatch = true;
    } else if (
      category === "HomeDecor" &&
      (productMainCategory === "HomeDecor" || productMainCategory === "home")
    ) {
      categoryMatch = true;
    } else if (
      category === "jewellary" &&
      productMainCategory === "jewellary"
    ) {
      categoryMatch = true;
    } else if (category === "toys" && productCategory === "toys") {
      categoryMatch = true;
    }

    const priceMatch = productPrice >= minPrice && productPrice <= maxPrice;

    if (categoryMatch && priceMatch) {
      container.style.display = "block";
      visibleCount++;
    } else {
      container.style.display = "none";
    }
  });

  updateCategoryHeading(category, visibleCount);
  // Highlight button
  setActiveButton(document.getElementById(getButtonIdByCategory(category)));
}

function updateCategoryHeading(category, count = 0) {
  const categoryTitle = document.getElementById("categoryTitle");
  let headingText = "";

  switch (category) {
    case "all": headingText = "All Products"; break;
    case "women": headingText = "Women's Wear Collection"; break;
    case "men": headingText = "Men's Wear Collection"; break;
    case "kids": headingText = "Kid's Wear Collection"; break;
    case "HomeDecor": headingText = "Home Decor Collection"; break;
    case "jewellary": headingText = "Jewelry Collection"; break;
    case "toys": headingText = "Toys Collection"; break;
    default: headingText = "Our Products";
  }

  if (categoryTitle) {
    categoryTitle.textContent = `${headingText} (${count} items)`;
    categoryTitle.style.animation = "fadeIn 0.5s ease-in-out";
  }
}

function getButtonIdByCategory(category) {
    // Map category to button ID
    if(category === "all") return "a";
    if(category === "HomeDecor") return "b";
    if(category === "jewellary") return "c";
    if(category === "women") return "d";
    if(category === "men") return "e";
    if(category === "kids") return "f";
    if(category === "toys") return "e1";
    return "a";
}

function setActiveButton(activeBtn) {
  if(!activeBtn) return;
  const filterButtons = ["a", "b", "c", "d", "e", "f", "e1"];
  filterButtons.forEach((id) => {
    const btn = document.getElementById(id);
    if (btn) {
      btn.style.backgroundColor = "transparent";
      btn.style.color = "#ff7b00";
    }
  });

  activeBtn.style.backgroundColor = "#ffa500";
  activeBtn.style.color = "white";
}

function initializeFilters() {
    const allButton = document.getElementById("a");
    const homeDecorButton = document.getElementById("b");
    const jewelryButton = document.getElementById("c");
    const womenButton = document.getElementById("d");
    const menButton = document.getElementById("e");
    const kidsButton = document.getElementById("f");
    const toysButton = document.getElementById("e1");

    if (allButton) allButton.addEventListener("click", () => filterProducts("all"));
    if (homeDecorButton) homeDecorButton.addEventListener("click", () => filterProducts("HomeDecor"));
    if (jewelryButton) jewelryButton.addEventListener("click", () => filterProducts("jewellary"));
    if (womenButton) womenButton.addEventListener("click", () => filterProducts("women"));
    if (menButton) menButton.addEventListener("click", () => filterProducts("men"));
    if (kidsButton) kidsButton.addEventListener("click", () => filterProducts("kids"));
    if (toysButton) toysButton.addEventListener("click", () => filterProducts("toys"));

    // Price filter
    const applyPriceBtn = document.getElementById("applyPriceFilter");
    if (applyPriceBtn) {
      applyPriceBtn.addEventListener("click", () => {
          const min = parseInt(document.getElementById("minPrice").value) || 0;
          const max = parseInt(document.getElementById("maxPrice").value) || 50000;
          filterProducts(currentCategory, min, max);
      });
    }
}

// Initial Load - Initialize products from hardcoded array
document.addEventListener("DOMContentLoaded", initializeProducts);
