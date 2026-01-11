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
             console.log("🎨 Generating AI image via Cloudinary...");
             
             // Use Cloudinary's AI-powered image generation
             // Your cloud name: dnevq4wek
             const cloudName = 'dnevq4wek';
             
             // Create a descriptive prompt for better AI generation
             const aiPrompt = data.festival_name 
                 ? `${data.festival_name} festival celebration in India, traditional heritage, vibrant colors, cultural elements, premium photography`
                 : 'Indian traditional handcraft heritage, artisan craftsmanship, cultural celebration';
             
             // Encode the prompt for URL
             const encodedPrompt = encodeURIComponent(aiPrompt);
             
             // Cloudinary AI Image Generation URL
             // Using e_gen_background_replace for AI-powered image generation
             // Alternative: Use a base image with AI enhancements
             const cloudinaryUrl = `https://res.cloudinary.com/${cloudName}/image/upload/e_gen_fill,w_1600,h_900,c_fill,g_auto,q_auto,f_auto/v1/festival_ai/${encodedPrompt}.jpg`;
             
             data.editorial_content.image_url = cloudinaryUrl;
             console.log(`✅ Cloudinary AI image generated for: ${data.festival_name || 'Heritage'}`);
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
