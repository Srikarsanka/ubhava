const { GoogleGenerativeAI } = require("@google/generative-ai");
const fs = require('fs');
require("dotenv").config();

async function listModels() {
    // Only use the prompt key for testing
    const key = process.env.GEMINI_PROMPT_KEY;
    const genAI = new GoogleGenerativeAI(key);

    try {
        console.log("Fetching models...");
        // Note: listModels is usually on the model manager or similar, checking docs...
        // Actually, for @google/generative-ai 0.24.1, unfortunately there isn't a direct listModels helper exposed easily 
        // on the main instance in some versions, but let's try assuming standard usage.
        // Wait, the error message SUGGESTED call ListModels.
        
        // Use a direct fetch if the library doesn't support it easily, 
        // but let's try to infer from common patterns or use a raw request.
        
        // Simpler: Just try to get the model list via REST using the key
        const fetch = (await import('node-fetch')).default;
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${key}`);
        const data = await response.json();
        
        console.log("MODELS:", JSON.stringify(data, null, 2));
        fs.writeFileSync('api_models.json', JSON.stringify(data, null, 2));
        
    } catch (error) {
        console.error("Error listing models:", error);
    }
}

listModels();
