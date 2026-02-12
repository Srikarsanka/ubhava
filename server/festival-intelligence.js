const { GoogleGenerativeAI } = require("@google/generative-ai");
const axios = require('axios');
const Festival = require('./models/Festival');
const FestivalContext = require('./models/FestivalContext');
require("dotenv").config();

const allKeys = [process.env.GEMINI_PROMPT_KEY, ...(process.env.GEMINI_IMAGE_KEYS || "").split(',')].filter(k => k && k.length > 0);

const Product = require('./models/Product'); // Ensure Product model is available

async function getFestivalContext(dateString) {
    const today = new Date(dateString);
    const tenDaysLater = new Date(today);
    tenDaysLater.setDate(today.getDate() + 10);

    try {
        // 1. Find the most relevant active festival (Today is within the 10-day window)
        const upcomingFestival = await Festival.findOne({
            startDate: { $lte: today },
            endDate: { $gte: today }
        }).sort({ eventDate: 1 }); 

        // 2. If no festival window is active, try to DISCOVER one via AI
        if (!upcomingFestival) {
            console.log(`🔍 No festival in DB for ${dateString}. Launching AI Discovery...`);
            await discoverNewFestivals(today);
            
            // Re-check after discovery
            const discoveredFestival = await Festival.findOne({
                startDate: { $lte: today },
                endDate: { $gte: today }
            }).sort({ eventDate: 1 });

            if (!discoveredFestival) {
                // Return Branding Mode
                return {
                    detected: false,
                    templateType: 'standard',
                    festival_name: "UDBHAVA Heritage",
                    mood: ["heritage", "timeless", "artisan"],
                    editorial_content: {
                        title: "UDBHAVA - The Origin of Indian Handcraft",
                        description: "Celebrating the enduring traditions of Indian craftsmanship shaped by generations.",
                        cta_text: "Explore Our Story",
                        image_url: "/images/promotional/bridal_heritage.png"
                    },
                    special_offers: [],
                    related_products: []
                };
            }
            upcomingFestival = discoveredFestival;
        }

        // ... existing logic for found festival ...
        // 3. If festival found, check if we already have a generated context
        const existingContext = await FestivalContext.findOne({
            festival_name: upcomingFestival.name,
            expires_at: { $gt: today }
        });

        if (existingContext) {
            console.log(`🏠 Restoring Persistent Festival: ${existingContext.festival_name} with ${existingContext.related_products?.length || 0} products`);
            return existingContext.toObject();
        }

        // 4. Generate New Context using AI (Text Only)
        console.log(`🤖 Generating AI Context for: ${upcomingFestival.name}`);
        const festivalData = await generateFestivalText(upcomingFestival);

        // 5. Select static image
        const image_url = (upcomingFestival.suggestedImages && upcomingFestival.suggestedImages.length > 0) 
            ? upcomingFestival.suggestedImages[0] 
            : "/images/promotional/festival_celebration.jpg";

        festivalData.editorial_content.image_url = image_url;

const Coupon = require('./models/Coupon');

// ... existing code ...

        // 6. PERSISTENT PRODUCT & COUPON GENERATION
        let related_products = [];
        
        // A. Persist Coupons
        if (festivalData.special_offers && festivalData.special_offers.length > 0) {
            console.log(`🎟️ Persisting ${festivalData.special_offers.length} AI Coupons to Database`);
            
            // Clear old AI coupons first to keep DB clean
            await Coupon.deleteMany({ isAiGenerated: true, isActive: true });

            for (const offer of festivalData.special_offers) {
                try {
                    await Coupon.findOneAndUpdate(
                        { code: offer.discount_code },
                        {
                            code: offer.discount_code,
                            discountPercentage: offer.discount_percentage,
                            minSpend: offer.min_spend || 0,
                            description: `${offer.label} (AI Generated for ${upcomingFestival.name})`,
                            expiryDate: new Date(offer.expires_at),
                            isActive: true,
                            isAiGenerated: true
                        },
                        { upsert: true, new: true }
                    );
                } catch (e) { console.warn("Coupon save failed", e.message); }
            }
        }

        // B. Persist Deals (Festive Pricing)
        if (festivalData.product_keywords && festivalData.product_keywords.length > 0) {
            console.log(`🔍 Updating Product Database with Festive Prices`);
            const searchTerms = festivalData.product_keywords.flatMap(kw => kw.split(' ')).filter(w => w.length > 2);
            
            // 1. Reset old festive prices first
            await Product.updateMany({}, { $unset: { festivePrice: "", originalPrice: "" } });

            const query = {
                $or: searchTerms.map(term => ({
                    $or: [
                        { name: { $regex: term, $options: 'i' } },
                        { category: { $regex: term, $options: 'i' } },
                        { description: { $regex: term, $options: 'i' } }
                    ]
                }))
            };

            let productMatches = await Product.find(query).limit(12);
            if (productMatches.length === 0) productMatches = await Product.find({ isTrending: true }).limit(12);

            let highestDiscount = 0;
            if (festivalData.special_offers && festivalData.special_offers.length > 0) {
                highestDiscount = Math.max(...festivalData.special_offers.map(o => o.discount_percentage));
            }

            // Update matched products in DB
            if (highestDiscount > 0) {
                for (const prod of productMatches) {
                    const discountAmt = Math.round(prod.price * (highestDiscount / 100));
                    prod.originalPrice = prod.price;
                    prod.festivePrice = prod.price - discountAmt;
                    await prod.save();
                }
            }

            // Refresh list from DB to return
            related_products = productMatches.map(p => {
                const productObj = p.toObject();
                if (p.festivePrice) {
                    productObj.original_price = p.originalPrice;
                    productObj.festive_price = p.festivePrice;
                    productObj.discount_applied = highestDiscount;
                }
                return productObj;
            });
        }

        // 7. Save to DB with persistent multi-coupons and product list
        const contextExpiry = upcomingFestival.endDate;
        const newContext = await FestivalContext.create({
            ...festivalData,
            detected: true, // Crucial for frontend logic
            festival_name: upcomingFestival.name,
            templateType: upcomingFestival.templateType,
            vfx_type: Array.isArray(festivalData.vfx_type) ? festivalData.vfx_type : [festivalData.vfx_type || 'standard'],
            applicable_date: dateString,
            related_products: related_products,
            expires_at: contextExpiry
        });

        return newContext.toObject();

    } catch (err) {
        console.error("Festival Intelligence Error:", err);
        // Minimum safe fallback
        return {
            detected: false,
            festival_name: "UDBHAVA",
            editorial_content: { title: "UDBHAVA Heritage", description: "Indian Handcrafts", image_url: "/images/promotional/bridal_heritage.png" }
        };
    }
}

async function generateFestivalText(festival) {
    const shuffledKeys = [...allKeys].sort(() => 0.5 - Math.random());
    
    for (const key of shuffledKeys) {
        try {
            const genAI = new GoogleGenerativeAI(key);
            const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });

            const prompt = `
Role: Cultural Editor for UDBHAVA (Premium Indian Heritage Shop).
Festival: ${festival.name}
Details: ${festival.description}

Task: Generate festive marketing content. No AI imagery needed. Just text.
Return STRICT JSON:
{
  "detected": true,
  "festival_wishes": "Warm greeting...",
  "product_keywords": ["keyword1", "keyword2"...],
  "special_offers": [
    {
      "label": "Festive Offer",
      "discount_percentage": 20,
      "discount_code": "CODE1",
      "min_spend": 2000,
      "expires_at": "${festival.endDate.toISOString().split('T')[0]}"
    },
    {
       "label": "Premium Pack",
       "discount_percentage": 25,
       "discount_code": "CODE2",
       "min_spend": 5000,
       "expires_at": "${festival.endDate.toISOString().split('T')[0]}"
    }
  ],
  "editorial_content": {
    "title": "Short catchy title",
    "description": "Luxurious 2-sentence description of the festival's craft significance",
    "cta_text": "Discover Collection"
  },
  "mood": ["cultural", "vibrant"],
  "vfx_type": ["diyas", "fireworks"] 
}
Note: Select the most culturally appropriate VFX array for ${festival.name}. 
- For Diwali, ALWAYS include both "fireworks" and "diyas".
- For Republic Day/Independence Day, ALWAYS include "airshow" and NEVER "fireworks".
- For Shivaratri, ALWAYS use "cosmic-lights" and "damaru".
- Options: diyas, flowers, fireworks, lanterns, airshow, harvest-goodness, spring-goodness, cosmic-lights, damaru, standard.
`;
            const result = await model.generateContent(prompt);
            const response = await result.response;
            let text = response.text().replace(/```json|```/g, "").trim();
            return JSON.parse(text);

        } catch (e) {
            console.warn(`Key ...${key.slice(-4)} failed, trying next.`);
        }
    }
    throw new Error("All AI keys failed for text generation.");
}

async function discoverNewFestivals(targetDate) {
    const year = targetDate.getFullYear();
    const shuffledKeys = [...allKeys].sort(() => 0.5 - Math.random());
    
    for (const key of shuffledKeys) {
        try {
            const genAI = new GoogleGenerativeAI(key);
            const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });

            const prompt = `
Role: Specialized Cultural Researcher for UDBHAVA (Premium Telugu Heritage & Handcraft Brand).
Target Year: ${year}
Current Date: ${targetDate.toISOString().split('T')[0]}

Task: Identify major Indian festivals for the year ${year}, with a HEAVY FOCUS on Telugu Culture and Heritage (Andhra Pradesh & Telangana). 
Include festivals like: Ugadi, Sankranti, Vinayaka Chavithi, Varalakshmi Vratham, Bonalu, Bathukamma, Dussehra, Deepavali, Sri Rama Navami.

For each festival, determine the EXACT date for ${year} based on the Hindu Lunar Calendar (Panchangam).

Return STRICT JSON array for the "Festival" schema:
[
  {
    "name": "Festival Name (e.g. Ugadi 2026)",
    "eventDate": "YYYY-MM-DD",
    "startDate": "YYYY-MM-DD", // Exactly 10 days before eventDate
    "endDate": "YYYY-MM-DD",   // Same as eventDate (unless multi-day)
    "description": "2-sentence cultural significance focusing on handcraft/heritage",
    "keywords": ["saree", "silk", "handloom", "puja", "tradition"],
    "templateType": "harvest" // Options: patriotic, harvest, spring, spiritual, diwali, standard
  }
]
- Use 'harvest' for Sankranti / Pongal.
- Use 'spiritual' for Puja festivals (Ganesh, Varalakshmi, Dussehra).
- Use 'spring' for Holi/Ugadi.
- Use 'diwali' for Deepavali / Diwali.
`;
            const result = await model.generateContent(prompt);
            const response = await result.response;
            let text = response.text().replace(/```json|```/g, "").trim();
            const festivalList = JSON.parse(text);

            for (const fest of festivalList) {
                // Only insert if it doesn't exist
                await Festival.findOneAndUpdate(
                    { name: fest.name },
                    fest,
                    { upsert: true, new: true }
                );
            }
            console.log(`✅ AI Discovery complete. Learned ${festivalList.length} festivals for ${year}.`);
            return;

        } catch (e) {
            console.warn(`Discovery Key fail: ${e.message}`);
        }
    }
}

module.exports = { getFestivalContext };
