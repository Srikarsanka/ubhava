const mongoose = require('mongoose');
const { getFestivalContext } = require('./festival-intelligence');
const Festival = require('./models/Festival');
const FestivalContext = require('./models/FestivalContext');
require('dotenv').config();

// This script forces the AI to "Discover" and seed the entire year's festivals
const syncYear = async (year = 2026) => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log(`🚀 Starting Intelligent Festival Sync for ${year} (Telugu Culture Focus)...`);

        // We use the intelligence engine to naturally "discover" festivals
        // We'll pass a dummy date in the middle of the year to trigger the discovery
        const { GoogleGenerativeAI } = require("@google/generative-ai");
        const prompt = `
Role: Cultural AI for UDBHAVA. 
Generate a COMPREHENSIVE list of festivals for the year ${year}.
Focus: Telugu Culture (Andhra & Telangana) + All Major Indian Festivals.
Requirements:
1. Exact dates for ${year}.
2. For each, give Name, eventDate, startDate (exactly 5 days before), endDate (1 day after).
3. Include: Ugadi, Sankranti, Vinayaka Chavithi, Varalakshmi Vratham, Bonalu, Bathukamma, Dussehra, Deepavali, Sri Rama Navami, Maha Shivaratri, Republic Day, Independence Day, Eid, Christmas.

Return STRICT JSON array for 'Festival' collection.
`;
        const allKeys = [process.env.GEMINI_PROMPT_KEY, ...(process.env.GEMINI_IMAGE_KEYS || "").split(',')].filter(k => k && k.length > 0);
        const shuffledKeys = [...allKeys].sort(() => 0.5 - Math.random());
        
        let text = null;
        for (const key of shuffledKeys) {
            try {
                const genAI = new GoogleGenerativeAI(key);
                const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });
                
                console.log(`🤖 Deep Researching with Key ...${key.slice(-4)}`);
                const result = await model.generateContent(prompt);
                const response = await result.response;
                text = response.text().replace(/```json|```/g, "").trim();
                if (text) break;
            } catch (aiErr) {
                console.warn(`⚠️ Key ...${key.slice(-4)} failed: ${aiErr.message}`);
            }
        }

        if (!text) throw new Error("All AI keys failed to generate the calendar.");
        
        let festivalList;
        try {
            festivalList = JSON.parse(text);
        } catch (parseErr) {
            console.error("❌ Failed to parse AI JSON:", text);
            throw parseErr;
        }

        // --- ENFORCEMENT for User Request (Shivaratri) ---
        const hasShivaratri = festivalList.some(f => f.name && f.name.toLowerCase().includes('shivara'));
        if (!hasShivaratri) {
            console.log("⚠️ AI missed Shivaratri. Injecting manually as per user request...");
            festivalList.push({
                name: "Maha Shivaratri 2026",
                eventDate: "2026-02-15",
                startDate: "2026-02-10",
                endDate: "2026-02-16",
                description: "The Great Night of Shiva. A time for prayer, meditation, and overcoming darkness and ignorance.",
                templateType: "shivaratri" // Will trigger cosmic-lights
            });
        }
        // ------------------------------------------------

        console.log(`✨ Found ${festivalList.length} significant dates for ${year}.`);

        for (const fest of festivalList) {
            try {
                // Handle different possible property names from AI
                const name = fest.name || fest.festivalName || fest.title;
                if (!name) continue;
                fest.name = name;

                // Ensure dates are valid
                fest.eventDate = new Date(fest.eventDate);
                fest.startDate = new Date(fest.startDate);
                fest.endDate = new Date(fest.endDate);

                // Determine template type intelligently
                let type = 'spiritual';
                const lowerName = name.toLowerCase();
                if (lowerName.includes('republic') || lowerName.includes('independ')) type = 'patriotic';
                if (lowerName.includes('sankranti') || lowerName.includes('pongal')) type = 'harvest';
                if (lowerName.includes('holi') || lowerName.includes('ugadi')) type = 'spring';
                if (lowerName.includes('shivaratri') || lowerName.includes('shiva')) type = 'shivaratri'; // New Intelligence Rule
                
                fest.templateType = fest.templateType || type;

                await Festival.findOneAndUpdate(
                    { name: fest.name },
                    fest,
                    { upsert: true, new: true }
                );
                console.log(`  ✓ Synced: ${fest.name} (${fest.eventDate.toISOString().split('T')[0]})`);
            } catch (festErr) {
                console.error(`  ✗ Failed to sync ${fest.name}:`, festErr.message);
            }
        }

        console.log("\n✅ Database is now intelligent and culturally aware.");
        console.log("🗑️ Clearing existing contexts to refresh branding...");
        await FestivalContext.deleteMany({});
        
        process.exit(0);
    } catch (err) {
        console.error("❌ Sync Failed:", err);
        process.exit(1);
    }
};

syncYear();
