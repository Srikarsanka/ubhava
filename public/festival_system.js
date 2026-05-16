/**
 * UDBHAVA - Festival Intelligence System
 * Dynamic AI-powered content using Gemini + Promotional Images
 */

// Main initialization
async function initHeritageSystem() {
    console.log("🌸 Initializing Heritage Intelligence...");
    const loader = document.getElementById('festival-loader');
    
    // 1. Show loader and Lock Scroll
    if (loader) {
        loader.classList.remove('hidden');
        document.body.style.overflow = 'hidden';
    }

    try {
        // Intercept Admin Preview Themes
        const urlParams = new URLSearchParams(window.location.search);
        const previewTheme = urlParams.get('previewTheme');
        
        if (['summer', 'monsoon', 'winter', 'standard'].includes(previewTheme)) {
            console.log(`👁️ Admin Preview Mode Active: ${previewTheme}`);
            await showSeasonalContent(previewTheme);
            return;
        }

        // Fetch dynamic festival context from backend (Gemini AI)
        let response = null;
        let context = null;
        try {
            response = await fetch('/api/festival-context');
            context = await response.json();
        } catch (e) {
            console.warn("Festival API failed", e);
        }
        
        // Backend provides everything - dynamic text + promotional images
        if (context && context.editorial_content && context.detected) {
            injectEditorialLayer(context);
        } else {
            console.log("⚠️ No active festival detected. Falling back to seasonal Moansson theme.");
            // If no festival, fallback to the current season/weather theme
            let currentSeason = 'standard';
            try {
                const weatherRes = await fetch('/api/weather-context');
                const weatherData = await weatherRes.json();
                if (weatherData && weatherData.resolvedTheme) {
                    currentSeason = weatherData.resolvedTheme;
                }
            } catch (e) {}
            
            await showSeasonalContent(currentSeason);
        }
        
    } catch (err) {
        console.error("Error loading festival content:", err);
        await showSeasonalContent('standard');
    } finally {
        // 2. Hide loader and Unlock Scroll (with slight delay for injection finish)
        setTimeout(() => {
            if (loader) {
                loader.classList.add('hidden');
                document.body.style.overflow = '';
            }
        }, 800);
    }
}

// Moansson Seasonal Editorial Fallback
async function showSeasonalContent(theme) {
    const contentMap = {
        summer: {
            title: "Moansson Summer Edit",
            desc: "Lightweight, breathable cottons engineered for the scorching sun.",
            cta: "Shop Summer",
            img: "/images/moansson/summer_editorial.png",
            vfx: "sun-glow"
        },
        monsoon: {
            title: "Moansson Rainwear",
            desc: "Sleek, waterproof protection designed for the urban downpour.",
            cta: "Shop Monsoon",
            img: "/images/moansson/monsoon_editorial.png",
            vfx: "rain"
        },
        winter: {
            title: "Moansson Winter Collection",
            desc: "Premium insulated layers and woolens for absolute warmth.",
            cta: "Shop Winter",
            img: "/images/moansson/winter_editorial.png",
            vfx: "snowfall"
        },
        standard: {
            title: "UDBHAVA Heritage",
            desc: "Celebrating the enduring traditions of Indian craftsmanship shaped by generations.",
            cta: "Explore Our Story",
            img: "/images/promotional/bridal_heritage.png",
            vfx: "standard"
        }
    };

    // Fetch related products for this season
    let relatedProducts = [];
    try {
        const prodRes = await fetch(`/api/products/seasonal?season=${theme}&limit=4`);
        const prodData = await prodRes.json();
        relatedProducts = prodData.products || [];
    } catch (e) {
        console.warn("Seasonal Product Fetch failed", e);
    }

    const context = {
        detected: false,
        templateType: theme,
        festival_name: selected.title,
        mood: [theme], 
        vfx_type: [selected.vfx],
        related_products: relatedProducts,
        editorial_content: {
            title: selected.title,
            description: selected.desc,
            cta_text: selected.cta,
            image_url: selected.img
        }
    };
    injectEditorialLayer(context);
}

// Layer 3 Fallback - Load promotional content from JSON
let promotionalData = null;

async function loadPromotionalContent() {
    if (promotionalData) return promotionalData;
    
    try {
        const response = await fetch('/promotional-content.json');
        promotionalData = await response.json();
        return promotionalData;
    } catch (error) {
        console.error('Failed to load promotional content:', error);
        return null;
    }
}

async function getPromotionalContent() {
    const data = await loadPromotionalContent();
    
    if (!data || !data.promotional_content) {
        // Fallback if JSON fails to load
        return {
            image_url: '/images/promotional/bridal_heritage.png',
            title: "Discover UDBHAVA",
            description: "Experience the timeless beauty of Indian handcraft",
            cta_text: "Explore Collection"
        };
    }
    
    // Select random promotional content
    const promos = data.promotional_content;
    const promo = promos[Math.floor(Math.random() * promos.length)];
    
    console.log(`📢 Using promotional content: ${promo.title}`);
    
    return {
        image_url: promo.image,
        title: promo.title,
        description: promo.description,
        cta_text: promo.cta_text
    };
}

// Layer 3 Fallback - Local Promotional Images
function getCloudinaryFallback(mood = []) {
    // Local promotional images stored in public/images/promotional/
    const promotionalContent = [
        {
            url: '/images/promotional/heritage_celebration.png',
            title: "Celebrate Heritage",
            description: "Discover the timeless beauty of Indian handcraft with UDBHAVA"
        },
        {
            url: 'https://res.cloudinary.com/dnevq4wek/image/upload/w_1600,h_900,c_fill,g_auto,q_auto:best,f_auto,e_improve,e_sharpen:50/weddingcollection_yegzng',
            title: "Wedding Collection",
            description: "Exquisite traditional wear for your special celebrations"
        },
        {
            url: 'https://res.cloudinary.com/dnevq4wek/image/upload/w_1600,h_900,c_fill,g_auto,q_auto:best,f_auto,e_improve,e_sharpen:50/desbag_aw0oku',
            title: "Handcrafted Wonders",
            description: "Traditional toys and crafts made with love and heritage"
        }
    ];
    
    // Select a random promotional content
    const promo = promotionalContent[Math.floor(Math.random() * promotionalContent.length)];
    
    console.log(`📢 Using promotional content: ${promo.title}`);
    
    return promo.url;
}

// Helper: Add to Cart (Shared Logic)
async function addToCart(productId) {
    if (!Auth.user) {
        alert("Please login to add items to bag.");
        if (typeof Auth.showLoginModal === 'function') Auth.showLoginModal();
        return;
    }

    try {
        const response = await fetch('/api/cart/', {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${Auth.token}`
            },
            body: JSON.stringify({ productId: productId, quantity: 1, size: 'Standard' })
        });

        if (response.ok) {
            alert("Added to Bag ✓");
            // Optional: update cart count if exists
        } else {
            const err = await response.json();
            alert(`Error: ${err.message || 'Failed to add'}`);
        }
    } catch (error) {
        console.error("Cart Error:", error);
        alert("Network error. Please try again.");
    }
}

// DOM Injection
function injectEditorialLayer(context) {
    const container = document.getElementById('dynamic-content-layer');
    
    // Pick Template based on context.templateType
    const templateType = context.templateType || 'standard';
    const templateId = `tmpl-${templateType}-section`;
    const template = document.getElementById(templateId) || document.getElementById('tmpl-editorial-section');

    if (!container || !template) return;

    // Reset container
    container.innerHTML = '';
    
    // Work with the clone
    const clone = template.content.cloneNode(true);
    const content = context.editorial_content;
    const section = clone.querySelector('.editorial-section');

    // 1. Text Content Mapping
    const titleEl = clone.querySelector('.festival-title');
    if (titleEl) titleEl.textContent = content.title;

    const descEl = clone.querySelector('.festival-desc');
    if (descEl) descEl.textContent = content.description;

    // Wishes Banner (subline)
    const wishesEl = clone.querySelector('.festival-wishes-text');
    if (wishesEl && context.festival_wishes) {
        wishesEl.textContent = context.festival_wishes;
        const banner = clone.querySelector('.festival-wishes-banner');
        if (banner) banner.style.display = 'inline-block';
    }

    // CTA Button text from AI
    const ctaBtn = clone.querySelector('.theme-cta');
    if (ctaBtn && content.cta_text) {
        ctaBtn.textContent = content.cta_text;
    }

    // 2. Image
    const img = clone.querySelector('.festival-img');
    if (img) img.src = content.image_url;

    // 3. Offer Badge (supports multiple coupons)
    const offerBadge = clone.querySelector('.festival-offer-badge');
    if (context.special_offers && context.special_offers.length > 0 && offerBadge) {
        const offer = context.special_offers[0];
        offerBadge.style.display = 'inline-flex';
        const labelEl = offerBadge.querySelector('.offer-label');
        if (labelEl) labelEl.textContent = offer.label || "Festival Special";
        
        const codeEl = offerBadge.querySelector('.offer-code');
        if (codeEl) {
            const minSpend = offer.min_spend;
            codeEl.textContent = minSpend ? `${offer.discount_code} (Above ₹${minSpend})` : offer.discount_code;
        }

        const discEl = offerBadge.querySelector('.offer-discount');
        if (discEl) discEl.textContent = `${offer.discount_percentage}% OFF`;
    } else if (offerBadge) {
        offerBadge.style.display = 'none';
    }

    // 4. Theme Classes & VFX
    const vfx = Array.isArray(context.vfx_type) ? context.vfx_type : [context.vfx_type];
    
    // Add theme classes
    if (templateType === 'spiritual') section.classList.add('spiritual-theme');
    if (templateType === 'patriotic') section.classList.add('patriotic-theme');
    if (templateType === 'harvest') section.classList.add('harvest-theme');
    if (templateType === 'spring') section.classList.add('spring-theme');
    if (templateType === 'monsoon') section.classList.add('monsoon-theme');
    if (templateType === 'summer') section.classList.add('summer-theme');
    if (templateType === 'shivaratri') section.classList.add('shivaratri-vibe');

    // DIWALI CHECK
    if (templateType === 'spiritual' && vfx.includes('fireworks') && vfx.includes('diyas')) {
        section.classList.add('diwali-vibe');
    }

    // ABUNDANCE VFX
    if (vfx.includes('harvest-goodness') || templateType === 'harvest') {
        createFallingAbundance('harvest');
    }
    if (vfx.includes('spring-goodness') || templateType === 'spring') {
        createFallingAbundance('spring');
        const toran = document.createElement('div');
        toran.className = 'mango-toran';
        section.prepend(toran);
    }

    const showcase = clone.querySelector('.festival-product-showcase');
    const grid = clone.querySelector('.festival-products-grid');
    const productTemplate = document.getElementById('tmpl-festival-product-card');

    if (context.related_products && context.related_products.length > 0 && showcase && grid && productTemplate) {
        showcase.style.display = 'block';
        context.related_products.forEach(product => {
            const productClone = productTemplate.content.cloneNode(true);
            const card = productClone.querySelector('.product-card');
            card.querySelector('.p-img').src = product.images[0] || '';
            card.querySelector('.p-name').textContent = product.name;
            const origPrice = card.querySelector('.p-price-original');
            const festPrice = card.querySelector('.p-price-festive');
            if (product.festive_price) {
                origPrice.textContent = `₹${product.original_price}`;
                festPrice.textContent = `₹${product.festive_price}`;
            } else {
                origPrice.style.display = 'none';
                festPrice.textContent = `₹${product.price}`;
            }
            card.querySelector('.product-image').addEventListener('click', () => {
                window.location.href = `product-details.html?id=${product._id}`;
            });
            const btnQuickAdd = card.querySelector('.btn-quick-add');
            if (btnQuickAdd) {
                btnQuickAdd.addEventListener('click', (e) => {
                    e.stopPropagation();
                    addToCart(product._id);
                });
            }
            grid.appendChild(productClone);
        });
    } else if (showcase) {
        showcase.style.display = 'none';
    }

    // Append to DOM
    container.appendChild(clone);

    // Orchestrate Entrance
    setTimeout(() => {
        const injectedSection = container.querySelector('.editorial-section');
        if (injectedSection) {
            injectedSection.classList.add('visible');

            // Dynamic Ambient VFX — filter inappropriate ones per theme
            if (context.vfx_type && context.vfx_type !== 'standard') {
                let vfx = Array.isArray(context.vfx_type) ? [...context.vfx_type] : [context.vfx_type];

                // Remove flower petals from non-spring themes
                if (templateType !== 'spring') {
                    vfx = vfx.filter(v => v !== 'flowers' && v !== 'spring-goodness');
                }
                // Remove harvest effects from non-harvest themes
                if (templateType !== 'harvest') {
                    vfx = vfx.filter(v => v !== 'harvest-goodness');
                }
                // For summer, only allow summer-appropriate VFX
                if (templateType === 'summer') {
                    vfx = vfx.filter(v => ['standard', 'sun-glow'].includes(v));
                }
                // For monsoon, only allow rain/water VFX
                if (templateType === 'monsoon') {
                    vfx = vfx.filter(v => ['standard', 'rain', 'lightning'].includes(v));
                }

                if (vfx.length > 0) {
                    injectAmbientVFX(injectedSection, vfx);
                }
            }
        }
        
        const wishes = container.querySelector('.festival-wishes-banner');
        if (wishes) wishes.style.opacity = '1';
    }, 100);
}

function injectAmbientVFX(section, vfxTypes) {
    if (!section) return;

    const vfxContainer = document.createElement('div');
    vfxContainer.className = 'ambient-vfx-container';
    
    // Position full-width across the entire editorial section
    section.style.position = 'relative'; 
    section.appendChild(vfxContainer);

    const types = Array.isArray(vfxTypes) ? vfxTypes : [vfxTypes];
    
    // Patriotic Check: If airshow is present, suppress fireworks (user request)
    const filteredTypes = types.includes('airshow') ? types.filter(t => t !== 'fireworks') : types;

    filteredTypes.forEach(type => {
        if (type === 'fireworks') initFireworks(vfxContainer);
        if (type === 'diyas') initDiyas(vfxContainer);
        if (type === 'flowers') initFlowers(vfxContainer);
        if (type === 'lanterns') initLanterns(vfxContainer);
        if (type === 'airshow') initAirShow(vfxContainer);
        if (type === 'cosmic-lights') initCosmicLights(vfxContainer); // Shivaratri Special
        if (type === 'damaru') initDamaru(vfxContainer); // Shivaratri Special
    });
}

// 1. ELITE VIBRANT CANVAS FIREWORKS
function initFireworks(container) {
    const canvas = document.createElement('canvas');
    canvas.id = 'fireworks-canvas';
    container.appendChild(canvas);
    
    const ctx = canvas.getContext('2d');
    let particles = [];
    
    function resize() {
        // Track the full width of the editorial section (Text + Image)
        const parent = container.parentElement;
        canvas.width = parent.offsetWidth;
        canvas.height = parent.offsetHeight;
    }
    window.addEventListener('resize', resize);
    resize();

    class Particle {
        constructor(x, y, hue) {
            this.x = x; this.y = y;
            this.hue = hue;
            this.brightness = 50 + Math.random() * 50;
            this.alpha = 1;
            this.decay = 0.01 + Math.random() * 0.02;
            
            const speed = 2 + Math.random() * 8;
            const angle = Math.random() * Math.PI * 2;
            this.velocity = {
                x: Math.cos(angle) * speed,
                y: Math.sin(angle) * speed
            };
            this.friction = 0.96;
            this.gravity = 0.15;
            this.history = []; // For realistic trails
        }
        draw() {
            ctx.beginPath();
            ctx.moveTo(this.x, this.y);
            if (this.history.length > 0) {
                const last = this.history[this.history.length - 1];
                ctx.lineTo(last.x, last.y);
            }
            ctx.strokeStyle = `hsla(${this.hue}, 100%, ${this.brightness}%, ${this.alpha})`;
            ctx.lineWidth = 2;
            ctx.stroke();
        }
        update() {
            this.history.push({x: this.x, y: this.y});
            if (this.history.length > 5) this.history.shift();
            
            this.velocity.x *= this.friction;
            this.velocity.y *= this.friction;
            this.velocity.y += this.gravity;
            this.x += this.velocity.x;
            this.y += this.velocity.y;
            this.alpha -= this.decay;
        }
    }

    function createFirework() {
        const x = Math.random() * canvas.width;
        const y = Math.random() * (canvas.height * 0.7);
        const hue = Math.random() * 360;
        
        // Flash the background slightly
        container.style.backgroundColor = `hsla(${hue}, 30%, 20%, 0.05)`;
        setTimeout(() => container.style.backgroundColor = 'transparent', 100);

        for (let i = 0; i < 40; i++) particles.push(new Particle(x, y, hue));
    }

    function animate() {
        if (!document.body.contains(canvas)) return;
        
        // Motion Blur Effect
        ctx.fillStyle = 'rgba(0, 0, 0, 0.15)';
        ctx.globalCompositeOperation = 'destination-out';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.globalCompositeOperation = 'lighter'; // Additive blending for "glow"

        particles.forEach((p, i) => {
            if (p.alpha <= 0) particles.splice(i, 1);
            else { p.update(); p.draw(); }
        });
        
        if (Math.random() < 0.04) createFirework();
        requestAnimationFrame(animate);
    }
    animate();
}

// 2. ROYAL GOLD MINIMAL FRAMING DIYAS (Exactly 4 near Text)
function initDiyas(container) {
    const section = container.parentElement;
    const textSection = section.querySelector('.editorial-text');
    if (!textSection) return;

    // We'll create 4 anchors relative to the text section
    const positions = [
        { top: '-10px', left: '-10px' },  // Top Left
        { top: '-10px', right: '-10px' }, // Top Right
        { bottom: '-10px', left: '-10px' }, // Bottom Left
        { bottom: '-10px', right: '-10px' } // Bottom Right
    ];

    positions.forEach((pos, i) => {
        const diya = document.createElement('div');
        diya.className = 'diya-wrap blinking';
        
        // Apply position relative to the text section
        Object.keys(pos).forEach(key => diya.style[key] = pos[key]);
        
        diya.style.animationDelay = `${i * 0.8}s`;
        
        diya.innerHTML = `
            <svg viewBox="0 0 100 60" class="diya-svg">
                <path class="diya-base" d="M10,30 Q10,50 50,55 Q90,50 90,30 Q90,20 50,25 Q10,20 10,30 Z" />
                <path fill="#a0522d" d="M45,25 L55,25 L52,15 L48,15 Z" />
            </svg>
            <div class="flame-container">
                <div class="flame-layer flame-outer"></div>
                <div class="flame-layer flame-inner"></div>
            </div>
        `;
        textSection.appendChild(diya); // Attach directly to textSection for perfect anchoring
    });
}

function createDiya(container, config) {
    const diya = document.createElement('div');
    diya.className = 'diya-wrap';
    if (config.left) diya.style.left = config.left;
    if (config.right) diya.style.right = config.right;
    if (config.bottom) diya.style.bottom = config.bottom;
    
    diya.style.transform = `scale(${config.scale || 1})`;
    diya.style.animationDelay = `${config.delay || 0}s`;
    
    diya.innerHTML = `
        <svg viewBox="0 0 100 60" class="diya-svg">
            <path class="diya-base" d="M10,30 Q10,50 50,55 Q90,50 90,30 Q90,20 50,25 Q10,20 10,30 Z" />
            <path fill="#a0522d" d="M45,25 L55,25 L52,15 L48,15 Z" />
        </svg>
        <div class="flame-container">
            <div class="flame-layer flame-outer"></div>
            <div class="flame-layer flame-inner"></div>
        </div>
    `;
    container.appendChild(diya);
}

// 3. 3D FLUTTERING PETALS
function initFlowers(container) {
    for (let i = 0; i < 20; i++) {
        const petal = document.createElement('div');
        petal.className = `petal petal-type-${Math.floor(Math.random() * 3) + 1}`;
        petal.style.left = `${Math.random() * 100}%`;
        petal.style.animationDelay = `${Math.random() * 10}s`;
        petal.style.animationDuration = `${8 + Math.random() * 7}s`;
        container.appendChild(petal);
    }
}

// --- Falling Abundance VFX (Harvest/Spring) ---
function createFallingAbundance(mode) {
    const layer = document.getElementById('dynamic-content-layer');
    if (!layer) return;

    const count = 30;
    for (let i = 0; i < count; i++) {
        const item = document.createElement('div');
        item.className = mode === 'harvest' ? 'particle-grain' : 'particle-flower';
        
        // Randomize
        item.style.position = 'absolute';
        item.style.left = Math.random() * 100 + 'vw';
        item.style.top = '-20px';
        item.style.animationDuration = (5 + Math.random() * 5) + 's';
        item.style.animationDelay = Math.random() * 5 + 's';
        item.style.opacity = 0.4 + Math.random() * 0.4;
        
        layer.appendChild(item);
    }
}

function initLanterns(container) {
    // Basic implementation for now, similar to petals but rising
    for (let i = 0; i < 10; i++) {
        const lantern = document.createElement('div');
        lantern.className = 'particle-lantern';
        lantern.style.left = `${Math.random() * 100}%`;
        lantern.style.animationDelay = `${Math.random() * 10}s`;
        container.appendChild(lantern);
    }
}


function initAirShow(container) {
    const flypast = document.createElement('div');
    flypast.className = 'flypast-container';
    
    // Squadron A: Top-Left to Bottom-Right
    // Squadron B: Top-Right to Bottom-Left
    flypast.innerHTML = `
        <!-- Squadron A -->
        <div class="jet jet-1 jet-ltr" style="left: 10%"><div class="smoke-trail"></div></div>
        <div class="jet jet-2 jet-ltr" style="left: 20%; animation-delay: 0.5s"><div class="smoke-trail"></div></div>
        <div class="jet jet-3 jet-ltr" style="left: 30%; animation-delay: 1s"><div class="smoke-trail"></div></div>
        
        <!-- Squadron B -->
        <div class="jet jet-1 jet-rtl" style="right: 10%; animation-delay: 2s"><div class="smoke-trail"></div></div>
        <div class="jet jet-2 jet-rtl" style="right: 20%; animation-delay: 2.5s"><div class="smoke-trail"></div></div>
        <div class="jet jet-3 jet-rtl" style="right: 30%; animation-delay: 3s"><div class="smoke-trail"></div></div>
    `;
    container.appendChild(flypast);
}

// 4. SHIVARATRI SPECIAL: Cosmic Lights & Damaru
function initCosmicLights(container) {
    const section = container.parentElement;
    // Create a canvas for starry background and cosmic rays
    const canvas = document.createElement('canvas');
    canvas.classList.add('cosmic-canvas');
    canvas.style.position = 'absolute';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    canvas.style.zIndex = '0';
    canvas.style.pointerEvents = 'none';
    container.appendChild(canvas);
    
    // Add simple CSS animation class to container or section if needed
    section.classList.add('cosmic-active');
}

function initDamaru(container) {
    // Add floating damarus (drums) or tridents
    for (let i = 0; i < 6; i++) {
        const damaru = document.createElement('div');
        damaru.className = 'damaru-icon';
        damaru.innerHTML = '🔱'; // Trident for now, or use SVG
        damaru.style.left = Math.random() * 90 + '%';
        damaru.style.animationDelay = Math.random() * 5 + 's';
        damaru.style.fontSize = (20 + Math.random() * 20) + 'px';
        damaru.style.position = 'absolute';
        damaru.style.opacity = '0';
        damaru.style.color = '#FFD700'; // Gold
        damaru.style.filter = 'drop-shadow(0 0 5px rgba(255,215,0,0.5))';
        damaru.style.animation = 'floatUpFade 8s infinite linear';
        container.appendChild(damaru);
    }
}

document.addEventListener('DOMContentLoaded', initHeritageSystem);
