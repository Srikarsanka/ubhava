const mongoose = require('mongoose');
require('dotenv').config();
const { getFestivalContext } = require('./festival-intelligence');

const bootstrap = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("🔥 Bootstrapping AI Context for Today...");

        // Force trigger for Republic Day (or whatever is active today/soon)
        const result = await getFestivalContext(new Date());
        
        console.log("✅ AI Context Generated!");
        console.log("Mood:", result.mood);
        console.log("Coupons:", result.special_offers);
        
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
};

bootstrap();
