const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        const uri = process.env.MONGO_URI;
        if (!uri) {
            console.error("❌ CRITICAL: MONGO_URI is missing in .env file!");
            process.exit(1);
        }

        // Standard Atlas connection options
        const options = {
            dbName: 'pride', // Explicitly target pride database
            tlsAllowInvalidCertificates: true, // Workaround for local CA certificate issues
        };

        const conn = await mongoose.connect(uri, options);
        console.log(`✅ MongoDB Atlas Connected: ${conn.connection.host}`);
        
    } catch (error) {
        console.error(`❌ MongoDB Connection Error: ${error.message}`);
        // If certificate error, provide specific advice
        if (error.message.includes('certificate')) {
            console.log("💡 TIP: Your local machine might have outdated SSL certificates. Try updating Node.js or check your network/VPN settings.");
        }
        process.exit(1);
    }
};

module.exports = connectDB;
