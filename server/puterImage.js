/**
 * Backend Puter.js Image Generation
 * Handles all Puter.js calls server-side to avoid frontend authentication popups
 */

const { init } = require('@heyputer/puter.js');
require('dotenv').config();

// Initialize Puter.js for Node.js backend
let puterInitialized = false;
let puter = null;

async function initPuter() {
    if (puterInitialized && puter) return true;
    
    try {
        const authToken = process.env.PUTER_AUTH_TOKEN;
        
        if (!authToken) {
            console.error('❌ PUTER_AUTH_TOKEN not found in .env file');
            console.log('📝 Please add PUTER_AUTH_TOKEN=your_token_here to your .env file');
            return false;
        }
        
        // Initialize Puter with auth token
        puter = await init(authToken);
        puterInitialized = true;
        console.log('✅ Puter.js initialized successfully with auth token');
        return true;
    } catch (error) {
        console.error('❌ Puter.js initialization failed:', error.message);
        return false;
    }
}

/**
 * Generate AI image using Puter.js (backend only - no login popup for users)
 * @param {string} prompt - Image generation prompt
 * @returns {Promise<string>} - Image URL or null if failed
 */
async function generatePuterImage(prompt) {
    try {
        // Initialize Puter if not already done
        const initialized = await initPuter();
        if (!initialized) {
            console.warn('⚠️ Puter.js not initialized, skipping');
            return null;
        }
        
        console.log(`🎨 Backend: Generating AI image with Puter.js...`);
        
        // Puter.js called from backend - server-side authentication
        const imageResult = await Promise.race([
            puter.ai.image({
                model: 'flux-1',
                prompt: prompt,
                width: 1600,
                height: 900
            }),
            new Promise((_, reject) => 
                setTimeout(() => reject(new Error('Puter timeout')), 15000)
            )
        ]);
        
        const imageUrl = imageResult.url || imageResult;
        console.log(`✅ Backend: Puter.js image generated successfully`);
        
        return imageUrl;
        
    } catch (error) {
        console.error(`❌ Backend: Puter.js generation failed:`, error.message);
        return null;
    }
}

module.exports = { generatePuterImage };
