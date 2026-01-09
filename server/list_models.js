const { GoogleGenerativeAI } = require("@google/generative-ai");
require("dotenv").config({ path: '../.env' }); // Adjust path if running from server dir

// Try root .env too just in case
require("dotenv").config(); 

async function listModels() {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  try {
      // For some reason the SDK might not expose listModels easily on the main class in older versions, 
      // but let's try accessing via the model manager if possible or just use a raw fetch like the error suggested.
      
      // actually the error said "Call ListModels". usage in node sdk:
      // NOT exposed directly in all versions. 
      // Let's rely on a raw REST call to be 100% sure what the API sees.
      
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
          console.error("❌ No API KEY found in process.env");
          return;
      }
      console.log("🔑 Using API Key ending in:", apiKey.slice(-4));

      const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;
      const response = await fetch(url);
      const data = await response.json();

      if (data.models) {
          console.log("✅ Available Models:");
          data.models.forEach(m => {
              if (m.supportedGenerationMethods && m.supportedGenerationMethods.includes("generateContent")) {
                  console.log(`- ${m.name}`);
              }
          });
      } else {
          console.error("❌ Error listing models:", data);
      }

  } catch (error) {
    console.error("❌ Fatal Error:", error);
  }
}

listModels();
