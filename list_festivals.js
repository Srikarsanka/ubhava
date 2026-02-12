const mongoose = require('mongoose');
const Festival = require('./server/models/Festival');
require('dotenv').config();

const listFestivals = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const festivals = await Festival.find({ eventDate: { $gte: new Date('2026-01-01'), $lte: new Date('2026-12-31') } });
        console.log("Found Festivals:", festivals.map(f => `${f.name} (${f.eventDate.toISOString().split('T')[0]}) - Type: ${f.templateType}`));
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

listFestivals();
