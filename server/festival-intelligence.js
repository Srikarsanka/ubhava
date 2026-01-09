const { GoogleGenerativeAI } = require("@google/generative-ai");
const axios = require('axios');
require("dotenv").config();

// Load multiple keys
// Load split keys
// Load multiple keys
const promptKey = process.env.GEMINI_PROMPT_KEY || "";
const imageKeysString = process.env.GEMINI_IMAGE_KEYS || "";
const imageKeys = imageKeysString ? imageKeysString.split(',').map(k => k.trim()) : [];

// Combine all keys into a single pool for valid rotation
const allKeys = [promptKey, ...imageKeys].filter(k => k.length > 0);

console.log(`🔑 Loaded ${allKeys.length} API Keys for Rotation`);

// Helper: Get a Random Key
function getRandomKey() {
    if (allKeys.length === 0) return null;
    return allKeys[Math.floor(Math.random() * allKeys.length)];
}



let festivalCache = {
    date: null,
    data: null
};

async function getFestivalContext(dateString) {
  // 1. Check Cache - DISABLED temporarily to force fresh detection of Sankranti
  // if (festivalCache.data && festivalCache.date === dateString) {
  //    console.log("⚡ Serving Festival Context from Cache");
  //    return festivalCache.data;
  // }

  // Retry Logic: Try up to 3 different keys if we hit Rate Limits
  let attempts = 0;
  const maxAttempts = 3;
  let lastError = null;

  while (attempts < maxAttempts) {
      attempts++;
      const currentKey = getRandomKey();
      
      if (!currentKey) {
          console.error("❌ No API Keys available.");
          break;
      }

      console.log(`🤖 Intelligence Request (Attempt ${attempts}/${maxAttempts}) using Key: ...${currentKey.slice(-4)}`);

      try {
        const genAI = new GoogleGenerativeAI(currentKey);
        // Default to Flash
        let model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        // Calculate specific date window for the LLM
        const today = new Date(dateString);
        const nextWeek = new Date(today);
        nextWeek.setDate(today.getDate() + 7);

        const prompt = `
Role: Cultural Intelligence System for a premium Indian heritage website.

Task:
Determine the cultural or festival context in India based on the given date info.

Date Information:
- Current Date: ${today.toDateString()}
- Shopping Window: ${today.toDateString()} to ${nextWeek.toDateString()} (Next 7 Days)
Region: India

Instructions:
1. CRITICAL: We are an E-commerce site. Users shop *before* the festival.
2. LOOK AHEAD: If a major festival (like Makar Sankranti, Pongal, Lohri, Holi, Diwali) is strictly within the "Shopping Window" (next 7 days), **DECLARE IT DETECTED**.
3. DO NOT wait for the exact festival date. If it's Jan 9 and Sankranti is Jan 14, DETECT IT.
4. If a festival is detected, return its specific cultural details (History, Significance).
5. If truly no festival is near, return a standard "Curated Heritage" context.

Image Prompt Rules (CRITICAL: VARY THE OUTPUT):
- Visual Style: Randomly pick ONE of these styles for the prompt:
  1. "Cinematic Wide Shot" (Environmental, scene-setting)
  2. "Macro Detail" (Extreme close-up of texture/material)
  3. "Human Connection" (Hands working, holding, or crafting - no faces)
  4. "Flat Lay Composition" (Arranged objects from above)
- Lighting: Warm, natural, cinematic lighting.
- Palette: Rich, earthy, heritage colors (Saffron, Terracotta, Teal, Gold).
- Aesthetic: Premium, Editorial, Vogue India style.
- NO Text, NO Banners.
- Subject: Focus strictly on elements related to the festival.
  - For Sankranti: USE "Harvest Crops", "Flying Kites in Village", "Rooster/Cock Fight", "Sugarcane Fields".
- Random Variance Seed: ${Math.random()} (Use this to fundamentally change the composition)

Output STRICT JSON only (no markdown, no comments):

{
  "detected": true | false,
  "festival_name": string | null,
  "mood": ["calm", "earthy", "heritage"],
  "editorial_content": {
    "title": string,
    "description": string,
    "cta_text": string | null
  },
  "image_prompt": string
}
`;
        
        // EXECUTE GENERATION (Safely handle 404 here)
        let response;
        try {
             const result = await model.generateContent(prompt);
             response = await result.response;
        } catch(genError) {
             console.log(`⚠️ Flash Model failed (${genError.message}). Retrying with Gemini Pro...`);
             try {
                 const fallbackModel = genAI.getGenerativeModel({ model: "gemini-pro" });
                 const result = await fallbackModel.generateContent(prompt);
                 response = await result.response;
             } catch(proError) {
                 throw genError; // Use original error if fallback also fails
             }
        }

        let text = response.text();

        // Clean Gemini formatting
        text = text.replace(/```json|```/g, "").trim();

        // Safety: ensure valid JSON
        let parsed = JSON.parse(text);

        // Update Cache
        festivalCache = {
            date: dateString,
            data: parsed
        };

        return parsed;

      } catch (error) {
        console.error(`❌ Attempt ${attempts} Failed (Key ...${currentKey.slice(-4)}):`, error.message);
        lastError = error;
        // If it's a 429 (Quota), the loop will try another key. 
        // If it's another error, we might still retry just in case.
      }
  }

  // If we reach here, all attempts failed
  console.error("🚨 All API retries exhausted. Attempting Local Smart Fallback.");
  
  // LOCAL DETERMINISTIC CHECK (Failsafe)
  const today = new Date(dateString);
  const month = today.getMonth(); // 0 = Jan
  const day = today.getDate();

  // JANUARY: Makar Sankranti / Pongal / Lohri (Approx Jan 10 - Jan 17)
  if (month === 0 && day >= 9 && day <= 17) {
       console.log("✅ Local Fallback: Explicitly detecting Makar Sankranti/Pongal");
       
       // Randomly pick a fallback theme for variety
       const themes = [
           "Cinematic shot of colorful kites flying over an Indian village rooftop at sunset, golden hour lighting.",
           "Action shot of a traditional rooster fight/cock fight in a rustic village setting, dynamic motion, dust rising, cinematic lighting.",
           "Bountiful harvest of new crops, sugarcane, and turmeric heaps in a village courtyard, warm earthy tones.",
           "A rustic brass plate filled with sesame ladoos (til-gud) and sugarcane pieces, placed on a sunlit stone floor."
       ];
       const randomTheme = themes[Math.floor(Math.random() * themes.length)];

       return {
          detected: true,
          festival_name: "Makar Sankranti / Pongal / Lohri",
          mood: ["festive", "vibrant", "harvest"],
          editorial_content: {
            title: "The Harvest Symphony",
            description: "Celebrating the harvest with the thrill of kite flying, the vigor of village sports, and the sweetness of til-gud.",
            cta_text: "Shop the Harvest Collection"
          },
          image_prompt: `Editorial photography, Sankranti festival. ${randomTheme} Premium heritage aesthetic.`
       };
  }

  // DEFAULT FALLBACK
  return {
      detected: false,
      festival_name: null,
      mood: ["calm", "heritage", "timeless"],
      editorial_content: {
        title: "Curated Heritage",
        description:
          "Celebrating the enduring traditions of Indian craftsmanship shaped by generations.",
        cta_text: null
      },
      image_prompt: "Calm heritage texture"
  };
}

module.exports = { getFestivalContext };
