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

// Modal Logic
function showProductModal(container) {
      const img = container.getAttribute("data-image");
      const name = container.getAttribute("data-name");
      const disprice = parseInt(container.getAttribute("data-discounted-price"));
      const orgprice = parseInt(container.getAttribute("data-original-price"));
      const cat = container.getAttribute("subcategory");
      const sizeFromdb = container.getAttribute("size");
      const productId = container.getAttribute("id"); // Capture Product ID for API

      // ---------------------------------------------------------
      // DETECT PRODUCT TYPE (Keyword Based)
      // ---------------------------------------------------------
      const nameLower = name.toLowerCase();
      
      const targetAudience = container.getAttribute("data-target-audience");
      
      // ---------------------------------------------------------
      // DETECT PRODUCT TYPE (Using explicit gender category)
      // ---------------------------------------------------------
      
      // 1. Check strict gender categories first
      const isMens = targetAudience === 'men';
      const isKids = targetAudience === 'kids';
      
      // 2. Women's Logic (Saree vs Lehenga vs Standard)
      const isSaree = cat === 'saree' || nameLower.includes('saree') || nameLower.includes('sari');
      const isLehenga = !isMens && !isKids && (cat === 'lehenga' || nameLower.includes('lehenga') || nameLower.includes('choli'));
      const isWomenStandard = targetAudience === 'women' && !isSaree && !isKids; 
      
      const isHomeDecor = ['home', 'wallart', 'HomeDecor'].includes(cat);
      const isToysJewelry = ['toys', 'jew', 'jewellary'].includes(cat);


      // ---------------------------------------------------------
      // 1. SIZE SELECTOR LOGIC
      // ---------------------------------------------------------
      let sizeOptionsHTML = "";
      
      if (isMens || isWomenStandard) {
           sizeOptionsHTML = `
            <div class="size-selector-container">
              <strong style="color:#0f346c;">Select Size:</strong>
              <div class="size-options-grid">
                <div class="size-btn">XS</div>
                <div class="size-btn">S</div>
                <div class="size-btn">M</div>
                <div class="size-btn">L</div>
                <div class="size-btn">XL</div>
                <div class="size-btn">XXL</div>
              </div>
            </div>`;
      } else if (isKids) {
           sizeOptionsHTML = `
            <div class="size-selector-container">
              <strong style="color:#0f346c;">Select Age:</strong>
              <div class="size-options-grid">
                <div class="size-btn">2-3Y</div>
                <div class="size-btn">3-4Y</div>
                <div class="size-btn">4-5Y</div>
                <div class="size-btn">5-6Y</div>
                <div class="size-btn">6-7Y</div>
                <div class="size-btn">7-8Y</div>
                <div class="size-btn">8-9Y</div>
                <div class="size-btn">9-10Y</div>
              </div>
            </div>`;
      } 

      // ---------------------------------------------------------
      // 2. SPECIAL INFO (Length/Dimensions)
      // ---------------------------------------------------------
      let specialInfoHTML = "";
      
      if (isSaree) {
          specialInfoHTML = `<div style="margin-bottom:15px; color:#555; font-size: 0.95rem;"><strong>Length:</strong> 5.5 – 6.3 meters (including blouse piece)</div>`;
      } else if (isHomeDecor) {
           if(sizeFromdb && sizeFromdb !== 'undefined' && sizeFromdb !== 'null') {
                specialInfoHTML = `<div style="margin-bottom:15px; color:#555; font-size: 0.95rem;"><strong>Dimensions:</strong> ${sizeFromdb}</div>`;
           }
      } else if (isToysJewelry) {
            if(sizeFromdb && sizeFromdb !== 'undefined' && sizeFromdb !== 'null') {
                specialInfoHTML = `<div style="margin-bottom:15px; color:#555; font-size: 0.95rem;"><strong>Approx. Dimensions:</strong> ${sizeFromdb}</div>`;
           }
      }

      // ---------------------------------------------------------
      // 3. SIZE CHART BUTTON VISIBILITY
      // ---------------------------------------------------------
      const showChart = (isMens || isWomenStandard || isKids) && !isSaree;


      // ---------------------------------------------------------
      // 4. PRE-GENERATE SIZE CHART HTML
      // ---------------------------------------------------------
      let chartHTML = "";
      if(showChart) {
          if(isKids) {
              chartHTML = `
                <div style="font-weight:bold; margin-bottom:10px; color:#0f346c; font-size:1.1rem; border-bottom:2px solid #0f346c; padding-bottom:5px;">Kids Size Chart</div>
                <table class="size-chart-table">
                  <thead><tr><th>Age</th><th>Height (in)</th><th>Chest</th><th>Waist</th></tr></thead>
                  <tbody>
                    <tr><td>2-3 Y</td><td>33-36</td><td>20-21</td><td>19-20</td></tr>
                    <tr><td>3-4 Y</td><td>36-39</td><td>21-22</td><td>20-21</td></tr>
                    <tr><td>4-5 Y</td><td>39-42</td><td>22-23</td><td>21-22</td></tr>
                    <tr><td>5-6 Y</td><td>42-45</td><td>23-24</td><td>22-23</td></tr>
                    <tr><td>6-7 Y</td><td>45-48</td><td>24-25</td><td>23-24</td></tr>
                    <tr><td>7-8 Y</td><td>48-51</td><td>25-26</td><td>24-25</td></tr>
                    <tr><td>8-9 Y</td><td>51-54</td><td>26-27</td><td>25-26</td></tr>
                    <tr><td>9-10 Y</td><td>54-57</td><td>27-28</td><td>26-27</td></tr>
                  </tbody>
                </table>`;
          } else if(isMens) {
               chartHTML = `
                <div style="font-weight:bold; margin-bottom:10px; color:#0f346c; font-size:1.1rem; border-bottom:2px solid #0f346c; padding-bottom:5px;">Men Size Chart (in inches)</div>
                <table class="size-chart-table">
                  <thead><tr><th>Size</th><th>Chest</th><th>Waist</th><th>Shoulder</th><th>Kurta Length</th><th>Pajama Waist</th></tr></thead>
                  <tbody>
                    <tr><td>XS</td><td>36</td><td>30</td><td>16</td><td>38-40</td><td>28-30</td></tr>
                    <tr><td>S</td><td>38</td><td>32</td><td>17</td><td>40-42</td><td>30-32</td></tr>
                    <tr><td>M</td><td>40</td><td>34</td><td>18</td><td>42-44</td><td>32-34</td></tr>
                    <tr><td>L</td><td>42</td><td>36</td><td>19</td><td>44-46</td><td>34-36</td></tr>
                    <tr><td>XL</td><td>44</td><td>38</td><td>20</td><td>46-48</td><td>36-38</td></tr>
                    <tr><td>XXL</td><td>46</td><td>40</td><td>21</td><td>48-50</td><td>38-40</td></tr>
                  </tbody>
                </table>`;
          } else if(isWomenStandard) {
             chartHTML = `
                <div style="font-weight:bold; margin-bottom:10px; color:#0f346c; font-size:1.1rem; border-bottom:2px solid #0f346c; padding-bottom:5px;">Women Size Chart (in inches)</div>
                <table class="size-chart-table">
                  <thead><tr><th>Size</th><th>Bust</th><th>Waist</th><th>Hip</th><th>Length</th></tr></thead>
                  <tbody>
                    <tr><td>XS</td><td>32</td><td>26</td><td>34</td><td>40-42</td></tr>
                    <tr><td>S</td><td>34</td><td>28</td><td>36</td><td>41-43</td></tr>
                    <tr><td>M</td><td>36</td><td>30</td><td>38</td><td>42-44</td></tr>
                    <tr><td>L</td><td>38</td><td>32</td><td>40</td><td>43-45</td></tr>
                    <tr><td>XL</td><td>40</td><td>34</td><td>42</td><td>44-46</td></tr>
                    <tr><td>XXL</td><td>42</td><td>36</td><td>44</td><td>45-47</td></tr>
                  </tbody>
                </table>`;
          } else {
             if (nameLower.includes("men") || nameLower.includes("kurta") || nameLower.includes("sherwani")) {
                 chartHTML = `
                    <div style="font-weight:bold; margin-bottom:10px; color:#0f346c; font-size:1.1rem; border-bottom:2px solid #0f346c; padding-bottom:5px;">Men Size Chart (Fallback)</div>
                    <table class="size-chart-table">
                      <thead><tr><th>Size</th><th>Chest</th><th>Waist</th><th>Shoulder</th><th>Kurta Length</th><th>Pajama Waist</th></tr></thead>
                      <tbody>
                        <tr><td>XS</td><td>36</td><td>30</td><td>16</td><td>38-40</td><td>28-30</td></tr>
                        <tr><td>S</td><td>38</td><td>32</td><td>17</td><td>40-42</td><td>30-32</td></tr>
                        <tr><td>M</td><td>40</td><td>34</td><td>18</td><td>42-44</td><td>32-34</td></tr>
                        <tr><td>L</td><td>42</td><td>36</td><td>19</td><td>44-46</td><td>34-36</td></tr>
                        <tr><td>XL</td><td>44</td><td>38</td><td>20</td><td>46-48</td><td>36-38</td></tr>
                        <tr><td>XXL</td><td>46</td><td>40</td><td>21</td><td>48-50</td><td>38-40</td></tr>
                      </tbody>
                    </table>`;
             } else {
                 chartHTML = `<div style="color:red; margin-top:10px;">Size chart data not available for this category.</div>`;
             }
          }
      }


      // ---------------------------------------------------------
      // 4. EXTRACT COLOR FROM PRODUCT NAME
      // ---------------------------------------------------------
      const colorMatch = name.match(/^([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)\s+/);
      const extractedColor = colorMatch ? colorMatch[1] : "Multi-color";
      
      // Generate Description (simplified for replacement, but functional)
      let description = "";
       if(isSaree) {
          description = `<h4 style='color:#800000;margin-bottom:5px'>Description</h4><p class="modal-description"><strong style="color:#ff7b00">Product Type:</strong> Traditional Indian Saree<br><strong style="color:#0f346c">Color:</strong> ${extractedColor}<br><strong style="color:#ff7b00">Material Composition:</strong> Premium silk, cotton, or georgette fabric with intricate weaving<br><strong style="color:#0f346c">Length:</strong> 5.5-6.3 meters including blouse piece<br><strong style="color:#ff7b00">Features:</strong> Traditional handloom work, vibrant colors, and elegant borders<br><strong style="color:#0f346c">Occasion:</strong> Perfect for weddings, festivals, and formal events<br><br><strong style="color:#ff7b00">Care Instructions (Detailed):</strong><br>• <strong style="color:#0f346c">Washing:</strong> Dry clean only recommended for silk and embellished sarees. Cotton sarees can be hand washed in cold water with mild detergent.<br>• <strong style="color:#0f346c">Drying:</strong> Line dry in shade. Do not wring. Avoid direct sunlight to prevent color fading.<br>• <strong style="color:#0f346c">Ironing:</strong> Steam iron on reverse side while slightly damp. Use low heat for silk, medium for cotton.<br>• <strong style="color:#0f346c">Bleach:</strong> Do not bleach. Avoid harsh chemicals.<br>• <strong style="color:#0f346c">Storage:</strong> Store folded in a muslin cloth or cotton bag. Keep away from direct sunlight and moisture.<br><br><strong style="color:#ff7b00">Durability & Maintenance:</strong><br>• Silk sarees may develop natural creases; this is normal and adds to the drape.<br>• Cotton sarees may shrink slightly after first wash (1-2%).<br>• Zari work requires gentle handling to maintain shine.<br><br><strong style="color:#ff7b00">Extra Tips:</strong><br>• Wash dark colors separately to prevent color bleeding.<br>• Air the saree after each use before storing.<br>• For stubborn stains, consult a professional dry cleaner.<br><br>For more details and reviews, check mynayar.com, amazon.com, or flipkart.</p>`;
       } else if (isMens) {
           description = `<h4 style='color:#800000;margin-bottom:5px'>Description</h4><p class="modal-description"><strong style="color:#ff7b00">Product Type:</strong> Men's Traditional Kurta Set<br><strong style="color:#0f346c">Color:</strong> ${extractedColor}<br><strong style="color:#ff7b00">Material Composition:</strong> 100% breathable cotton with soft texture<br><strong style="color:#0f346c">Design:</strong> Traditional kurta with modern tailoring<br><strong style="color:#ff7b00">Features:</strong> Comfortable fit, elegant embroidery, durable stitching<br><strong style="color:#0f346c">Occasion:</strong> Festivals, weddings, casual gatherings<br><br><strong style="color:#ff7b00">Care Instructions (Detailed):</strong><br>• <strong style="color:#0f346c">Washing:</strong> Machine washable at 30°C (gentle cycle) OR hand wash recommended for embroidered pieces.<br>• <strong style="color:#0f346c">Drying:</strong> Tumble dry low OR line dry in shade. Do not wring.<br>• <strong style="color:#0f346c">Ironing:</strong> Warm iron while slightly damp. Use steam for stubborn wrinkles. Iron embroidery on reverse side.<br>• <strong style="color:#0f346c">Bleach:</strong> Do not bleach. Use only non-chlorine bleach when absolutely needed.<br>• <strong style="color:#0f346c">Storage:</strong> Hang on padded hanger or store folded. Keep in a cool, dry place.<br><br><strong style="color:#ff7b00">Durability & Maintenance:</strong><br>• Cotton kurtas may shrink 2-3% after first wash. Consider sizing accordingly.<br>• Embroidered areas retain quality better with hand washing.<br>• Color may fade slightly over time with repeated washing; this is natural for cotton.<br><br><strong style="color:#ff7b00">Extra Tips:</strong><br>• Wash dark colors separately to prevent color transfer.<br>• Turn garments inside out before washing to preserve color and embroidery.<br>• Use mild detergent for longevity.<br>• Remove from dryer promptly to minimize wrinkles.<br><br>Crafted for comfort and style. Similar styles and customer reviews can be found on mynayar.com, amazon.com, and flipkart.</p>`;
       } else if (isLehenga || isWomenStandard) {
          description = `<h4 style='color:#800000;margin-bottom:5px'>Description</h4><p class="modal-description"><strong style="color:#ff7b00">Product Type:</strong> Women's Traditional Lehenga Set<br><strong style="color:#0f346c">Color:</strong> ${extractedColor}<br><strong style="color:#ff7b00">Material Composition:</strong> Premium silk, georgette, or net fabric with embellishments<br><strong style="color:#0f346c">Work:</strong> Intricate embroidery, sequins, and zari work<br><strong style="color:#ff7b00">Components:</strong> Lehenga skirt, blouse/choli, and dupatta<br><strong style="color:#0f346c">Occasion:</strong> Weddings, receptions, festive celebrations<br><br><strong style="color:#ff7b00">Care Instructions (Detailed):</strong><br>• <strong style="color:#0f346c">Washing:</strong> Dry clean only. Do not attempt machine or hand wash due to delicate embellishments.<br>• <strong style="color:#0f346c">Drying:</strong> Professional dry cleaning process only. If spot cleaning, blot gently and air dry in shade.<br>• <strong style="color:#0f346c">Ironing:</strong> Steam only on low heat. Do not iron directly on embellishments. Use a pressing cloth.<br>• <strong style="color:#0f346c">Bleach:</strong> Absolutely do not bleach. Avoid all harsh chemicals.<br>• <strong style="color:#0f346c">Storage:</strong> Hang on padded hanger with muslin cover OR store flat with acid-free tissue paper between folds. Keep away from direct sunlight and moisture.<br><br><strong style="color:#ff7b00">Durability & Maintenance:</strong><br>• Embellishments (sequins, beads, zari) require delicate handling to prevent loosening.<br>• Net and georgette fabrics can snag easily; handle with care.<br>• Professional dry cleaning every 2-3 wears recommended for longevity.<br><br><strong style="color:#ff7b00">Extra Tips:</strong><br>• Air the lehenga after each use before storing to prevent odor.<br>• Check for loose threads or embellishments before wearing; secure if needed.<br>• Store in a breathable garment bag, not plastic.<br>• Avoid spraying perfume directly on fabric; spray on skin first.<br><br>Each piece is meticulously crafted to make you look stunning. For styling ideas and reviews, visit mynayar.com, amazon.com, or flipkart.</p>`;
       } else if (isKids) {
          description = `<h4 style='color:#800000;margin-bottom:5px'>Description</h4><p class="modal-description"><strong style="color:#ff7b00">Product Type:</strong> Kids' Traditional Wear<br><strong style="color:#0f346c">Color:</strong> ${extractedColor}<br><strong style="color:#ff7b00">Material Composition:</strong> Soft, skin-friendly cotton blend (60% cotton, 40% polyester for durability)<br><strong style="color:#0f346c">Design:</strong> Comfortable fit with easy movement<br><strong style="color:#ff7b00">Features:</strong> Vibrant colors, playful patterns, durable stitching, easy to wear<br><strong style="color:#0f346c">Occasion:</strong> Festivals, family gatherings, special events<br><br><strong style="color:#ff7b00">Care Instructions (Detailed):</strong><br>• <strong style="color:#0f346c">Washing:</strong> Machine washable at 30°C (gentle cycle). Hand wash recommended for embellished pieces.<br>• <strong style="color:#0f346c">Drying:</strong> Tumble dry low OR line dry. Remove promptly to prevent wrinkles.<br>• <strong style="color:#0f346c">Ironing:</strong> Warm iron if needed. Avoid high heat on prints and embellishments.<br>• <strong style="color:#0f346c">Bleach:</strong> Do not bleach. Safe for kids' sensitive skin without harsh chemicals.<br>• <strong style="color:#0f346c">Storage:</strong> Store folded in drawer or hang on child-sized hanger.<br><br><strong style="color:#ff7b00">Durability & Maintenance:</strong><br>• Cotton-polyester blend resists shrinking and maintains shape better than pure cotton.<br>• Reinforced stitching at stress points ensures durability during active play.<br>• Colors are fade-resistant but may lighten slightly over time with frequent washing.<br><br><strong style="color:#ff7b00">Extra Tips:</strong><br>• Pre-treat stains immediately for best results.<br>• Wash with similar colors to prevent color transfer.<br>• Turn inside out before washing to preserve prints and colors.<br>• Use mild, child-safe detergent.<br><br>Designed for kids' comfort while maintaining traditional aesthetics. Parent reviews and sizing guides available on mynayar.com, amazon.com, and flipkart.</p>`;
       } else if (isHomeDecor) {
          description = `<h4 style='color:#800000;margin-bottom:5px'>Description</h4><p class="modal-description"><strong style="color:#ff7b00">Product Type:</strong> Handcrafted Home Decor<br><strong style="color:#0f346c">Color:</strong> ${extractedColor}<br><strong style="color:#ff7b00">Material Composition:</strong> Handcrafted using traditional materials (wood, metal, ceramic, or polyresin)<br><strong style="color:#0f346c">Craftsmanship:</strong> Authentic Indian artisan work<br><strong style="color:#ff7b00">Style:</strong> Blend of traditional and contemporary design<br><br><strong style="color:#ff7b00">Care Instructions (Detailed):</strong><br>• <strong style="color:#0f346c">Cleaning:</strong> Wipe with soft, dry cloth. For stubborn dust, use slightly damp cloth and dry immediately.<br>• <strong style="color:#0f346c">Avoid:</strong> Do not use harsh chemicals, abrasive cleaners, or excessive water.<br>• <strong style="color:#0f346c">Maintenance:</strong> Dust regularly to maintain appearance. Polish wooden items occasionally with appropriate wood polish.<br>• <strong style="color:#0f346c">Storage:</strong> Keep away from direct sunlight to prevent fading. Store in dry place to avoid moisture damage.<br><br><strong style="color:#ff7b00">Durability & Maintenance:</strong><br>• Handcrafted items may have slight variations; this adds to their unique charm.<br>• Metal items may develop natural patina over time, which is normal.<br>• Wooden items benefit from occasional conditioning to prevent drying.<br><br><strong style="color:#ff7b00">Extra Tips:</strong><br>• Handle with care to avoid chips or cracks.<br>• Keep away from extreme temperatures and humidity.<br>• Display away from high-traffic areas to prevent accidental damage.<br><br>Each piece is unique and brings the essence of Indian artistry to your living space. Explore more home decor options and customer photos on mynayar.com, amazon.com, or flipkart.</p>`;
       } else if (isToysJewelry) {
          description = `<h4 style='color:#800000;margin-bottom:5px'>Description</h4><p class="modal-description"><strong style="color:#ff7b00">Product Type:</strong> Handcrafted Jewelry/Toy<br><strong style="color:#0f346c">Color:</strong> ${extractedColor}<br><strong style="color:#ff7b00">Material Composition:</strong> Quality materials with traditional craftsmanship (brass, wood, beads, or semi-precious stones)<br><strong style="color:#0f346c">Design:</strong> Handcrafted with attention to detail<br><strong style="color:#ff7b00">Features:</strong> Authentic Indian artistry, unique patterns<br><br><strong style="color:#ff7b00">Care Instructions (Detailed):</strong><br>• <strong style="color:#0f346c">Cleaning:</strong> Wipe jewelry with soft cloth after each use. For toys, clean with damp cloth and mild soap.<br>• <strong style="color:#0f346c">Storage:</strong> Store jewelry in provided box or soft pouch. Keep toys in dry place away from moisture.<br>• <strong style="color:#0f346c">Avoid:</strong> Do not expose jewelry to water, perfume, or chemicals. Keep toys away from extreme heat.<br>• <strong style="color:#0f346c">Maintenance:</strong> Polish metal jewelry occasionally with jewelry cloth. Check toys for loose parts regularly.<br><br><strong style="color:#ff7b00">Durability & Maintenance:</strong><br>• Handcrafted jewelry may show slight variations in color and design.<br>• Wooden toys develop natural patina over time, adding character.<br>• Metal jewelry may tarnish; regular cleaning maintains shine.<br><br><strong style="color:#ff7b00">Extra Tips:</strong><br>• Remove jewelry before bathing, swimming, or exercising.<br>• Store each jewelry piece separately to prevent scratching.<br>• For toys, supervise young children during play.<br>• Handle with care to preserve intricate details.<br><br>Perfect as a gift or personal treasure. See more designs and customer reviews on mynayar.com, amazon.com, and flipkart.</p>`;
       } else {
          description = `<h4 style='color:#800000;margin-bottom:5px'>Description</h4><p class="modal-description"><strong style="color:#ff7b00">Product Type:</strong> Traditional Indian Handicraft<br><strong style="color:#0f346c">Color:</strong> ${extractedColor}<br><strong style="color:#ff7b00">Material Composition:</strong> Premium materials with authentic design<br><strong style="color:#0f346c">Craftsmanship:</strong> Traditional Indian handwork<br><strong style="color:#ff7b00">Quality:</strong> Premium materials and authentic design<br><strong style="color:#0f346c">Heritage:</strong> Celebrates rich cultural traditions<br><br><strong style="color:#ff7b00">Care Instructions (Detailed):</strong><br>• <strong style="color:#0f346c">Cleaning:</strong> Wipe with soft, dry cloth. Avoid harsh chemicals.<br>• <strong style="color:#0f346c">Storage:</strong> Store in cool, dry place away from direct sunlight.<br>• <strong style="color:#0f346c">Maintenance:</strong> Handle with care to preserve craftsmanship.<br><br><strong style="color:#ff7b00">Extra Tips:</strong><br>• Each handcrafted piece is unique and may have slight variations.<br>• Regular gentle cleaning maintains appearance.<br>• Keep away from moisture and extreme temperatures.<br><br>Experience the elegance of traditional Indian craftsmanship. For additional information and reviews, refer to mynayar.com, amazon.com, or flipkart.</p>`;
       }


      // Construct Modal DOM
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

      // Check Wishlist State
      const wishlist = JSON.parse(localStorage.getItem("wishlist") || "[]");
      const isWishlisted = wishlist.some(item => item.name === name);
      const wishlistBtnText = isWishlisted ? "❤️ Wishlisted" : "♡ Wishlist";
      const wishlistBtnClass = isWishlisted ? "btn-secondary active" : "btn-secondary";


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
                
                ${description}
                ${specialInfoHTML}
                ${sizeOptionsHTML}

                 ${showChart ? `<button class="btn-link" id="chartBtn">View Size Chart</button>` : ''}
                 <!-- PRE-RENDERED CHART (Hidden by default) -->
                 <div id="sizeChartDisplay" class="size-chart-container" style="max-height:0; overflow:hidden; opacity:0; margin-top:20px; transition: all 0.4s ease;">
                    ${chartHTML}
                 </div>

                <div class="action-buttons">
                    <button class="btn-primary" id="addToCart">Add to Cart</button>
                    <button class="${wishlistBtnClass}" id="addToWishlist">${wishlistBtnText}</button>
                </div>
            </div>
        </div>
      `;

      document.body.appendChild(overlay);
      document.body.appendChild(modalContainer);

      // Event Listeners
      const closeValues = () => {
          modalContainer.remove();
          overlay.remove();
          document.body.style.overflow = "auto";
      };
      
      modalContainer.querySelector("#closeModal").addEventListener("click", closeValues);
      overlay.addEventListener("click", closeValues);

      // Size Selection Logic
      let selectedSize = null;
      modalContainer.querySelectorAll(".size-btn").forEach(btn => {
          btn.addEventListener("click", () => {
              modalContainer.querySelectorAll(".size-btn").forEach(b => b.classList.remove("active"));
              btn.classList.add("active");
              selectedSize = btn.textContent;
          });
      });

      // Add to Cart Logic (UPDATED)
      modalContainer.querySelector("#addToCart").addEventListener("click", async () => {
         // 1. Check Auth
         if (!Auth.user) {
             alert("Please login to add items to cart.");
             closeValues();
             Auth.showLoginModal();
             return;
         }

         // 2. Validate Size
         const needsSize = (isMens || isWomenStandard || isKids) && !isSaree; 
         
         if (needsSize && !selectedSize) {
             alert("Please select a size first.");
             return;
         }
         
         const cartSize = selectedSize || (isSaree ? 'Free Size' : (sizeFromdb || 'Standard'));
         
         const btn = modalContainer.querySelector("#addToCart");
         const originalText = btn.textContent;
         btn.textContent = "Adding...";
         btn.disabled = true;

         // 3. Call Backend API
         try {
             const response = await fetch('/api/cart', {
                 method: 'POST',
                 headers: {
                     'Content-Type': 'application/json'
                 },
                 body: JSON.stringify({
                     productId: productId, 
                     quantity: 1,
                     size: cartSize
                 })
             });

             if (response.ok) {
                 btn.textContent = "Added ✓";
                 btn.style.backgroundColor = "#2e7d32";
                 setTimeout(() => { closeValues(); }, 500);
             } else {
                const err = await response.json();
                console.error("Cart Add Error:", err);
                
                // Fallback / Error Handling
                alert(`Error adding to cart: ${err.message || 'Server did not respond OK'}`);
                btn.textContent = originalText;
                btn.disabled = false;
             }
         } catch (error) {
             console.error("Cart Network Error:", error);
             alert("Network error adding to cart.");
             btn.textContent = originalText;
             btn.disabled = false;
         }
      });

       // Add to Wishlist
       modalContainer.querySelector("#addToWishlist").addEventListener("click", (e) => {
          const btn = e.target;
          let currentWishlist = JSON.parse(localStorage.getItem("wishlist") || "[]");
          const existsIndex = currentWishlist.findIndex(item => item.name === name);

          if (existsIndex > -1) {
              currentWishlist.splice(existsIndex, 1);
              btn.textContent = "♡ Wishlist";
              btn.classList.remove("active");
              alert("Removed from Wishlist");
          } else {
              currentWishlist.push({ name, img, disprice, id: container.getAttribute("id") });
              btn.textContent = "❤️ Wishlisted";
              btn.classList.add("active");
              alert("Added to Wishlist!");
          }
          localStorage.setItem("wishlist", JSON.stringify(currentWishlist));
       });

      console.log("Modal Debug:", { name, cat, isMens, isWomenStandard, isKids, isSaree, showChart, chartHTMLLength: chartHTML.length });

      // Size Chart Toggle Logic - IMPROVED
      const chartBtn = modalContainer.querySelector("#chartBtn");
      if (chartBtn) {
          chartBtn.addEventListener("click", (e) => {
              e.preventDefault();
              const display = modalContainer.querySelector("#sizeChartDisplay");
              
              if (display) {
                  const isHidden = display.style.maxHeight === "0px" || display.style.maxHeight === "";
                  
                  if (isHidden) {
                      display.style.display = "block";
                      display.style.maxHeight = "none"; 
                      display.style.overflow = "visible"; 
                      display.style.opacity = "1";
                      display.style.visibility = "visible";
                      chartBtn.textContent = "Hide Size Chart";
                      setTimeout(() => {
                          display.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                      }, 100);
                  } else {
                      display.style.maxHeight = "0px";
                      display.style.overflow = "hidden";
                      display.style.opacity = "0";
                      chartBtn.textContent = "View Size Chart";
                  }
              }
          });
      }
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
