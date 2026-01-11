/**
 * UDBHAVA - Heritage Intelligence System
 * Simulates an LLM API to fetch context-aware festival data and injects editorial content.
 */

// 1. REAL LLM API (Via Backend Proxy)
async function fetchFestivalContext() {
    try {
        // Can optionally pass ?date=2026-01-14 to debug specific dates
        const response = await fetch('/api/festival-context');
        const data = await response.json();
        
        // Ensure image logic is handled.
        // If the backend provides an image_url (generated), use it.
        // If not, use the prompt to pick a simulated asset (since we don't have a real image-gen API key active in backend yet, 
        // we might rely on the backend to fall back or frontend to map).
        
        // For this implementation, the backend generates the image.
        // We trust the backend's image_url if provided.
        
        // Check if image_url is missing (which it will be now, as we removed backend gen)
        if (!data.editorial_content.image_url && data.image_prompt) {
             
             // DISABLED: Puter.js image generation (was causing login modal)
             // Using fallback image instead
             console.log("🎨 Using fallback image (Puter.js disabled)");
             data.editorial_content.image_url = "/assets/minimal_earthen_pottery_1767951596489.png";
             
             /* ORIGINAL PUTER.JS CODE - DISABLED
             // Client-Side Random Variance (To ensure variety even if backend is cached)
             const styles = [
                "Cinematic Wide Shot, environmental context",
                "Extreme Macro Detail, texture focus",
                "Flat Lay composition from above",
                "Soft focus natural light portrait style (no faces)"
             ];
             const randomStyle = styles[Math.floor(Math.random() * styles.length)];
             const variedPrompt = `${data.image_prompt}. Visual Style: ${randomStyle}. Random Seed: ${Math.random()}`;

             console.log("🎨 Frontend: Generating Image via Puter.js for prompt:", variedPrompt);
             try {
                // Primary: Flux.1 Schnell
                const imageElement = await puter.ai.txt2img(variedPrompt, { model: "black-forest-labs/FLUX.1-schnell" });
                data.editorial_content.image_url = imageElement.src;
                console.log("✅ Image Generated Successfully via Puter.js (Flux)");
             } catch (err) {
                console.warn("⚠️ Flux Gen Failed, retrying with SDXL...", err);
                try {
                    // Fallback: SDXL
                    const imageElement = await puter.ai.txt2img(variedPrompt, { model: "stabilityai/stable-diffusion-xl-base-1.0" });
                    data.editorial_content.image_url = imageElement.src;
                    console.log("✅ Image Generated Successfully via Puter.js (SDXL)");
                } catch(e2) {
                    console.error("❌ All Image Gen Failed:", e2);
                     // Fallback to local asset
                    data.editorial_content.image_url = "/assets/minimal_earthen_pottery_1767951596489.png"; 
                }
             }
             */
        }

        return data;

    } catch (err) {
        console.error("System Error - Festival Intelligence:", err);
        return { detected: false };
    }
}

// 2. RENDERER (The "Agent" that modifies the DOM)
async function initHeritageSystem() {
    console.log("🌸 Initializing Heritage Intelligence...");
    
    try {
        const context = await fetchFestivalContext();
        
        // Always inject if content exists, even for "Default/Calm" mode (detected: false)
        if (context.editorial_content) {
            console.log(`🎉 Heritage Context Loaded: ${context.festival_name || 'Standard Heritage'}`);
            injectEditorialLayer(context);
        } else {
            console.warn("🌿 No editorial content available.");
        }

    } catch (err) {
        console.error("Error fetching festival context:", err);
    }
}

// 3. INJECTOR (Manages the DOM manipulation)
function injectEditorialLayer(context) {
    const container = document.getElementById('dynamic-content-layer');
    const template = document.getElementById('tmpl-editorial-section');

    if (!container || !template) return;

    // Clone the template
    const clone = template.content.cloneNode(true);
    const section = clone.querySelector('.editorial-section');

    // Populate Data
    const content = context.editorial_content;
    section.querySelector('.festival-title').textContent = content.title;
    section.querySelector('.festival-desc').textContent = content.description;
    
    const img = section.querySelector('.festival-img');
    if (img) img.src = content.image_url;

    const cta = section.querySelector('.festival-cta');
    if (cta) {
        cta.textContent = content.cta_text;
        // Fix: Handle case where festival_name is null (Fallback Mode)
        const collectionSlug = context.festival_name ? 
                               context.festival_name.toLowerCase().replace(/ /g, '-') : 
                               "all"; 
        cta.href = "shop.html?collection=" + collectionSlug;
    }

    // Append to DOM
    container.innerHTML = ''; // Clear previous if any
    container.appendChild(section);

    // Trigger Animation (Force reflow)
    setTimeout(() => {
        section.classList.add('visible');
    }, 100);
}

// Initialize on load
document.addEventListener('DOMContentLoaded', initHeritageSystem);
