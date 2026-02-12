const mongoose = require('mongoose');
const Festival = require('./server/models/Festival');
require('dotenv').config();

const checkFestival = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const fest = await Festival.findOne({ name: { $regex: 'Shivaratri', $options: 'i' } });
        console.log("Found Festival:", fest);
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

checkFestival();
