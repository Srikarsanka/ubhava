const express = require('express');
const cors = require('cors');
const path = require('path');
const dotenv = require('dotenv');
const cookieParser = require('cookie-parser');
const connectDB = require('./config/db');

// Load env vars
dotenv.config();

// Connect to database
connectDB();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({
    origin: process.env.NODE_ENV === 'production' 
        ? ['https://ubhava-com.onrender.com', 'http://localhost:3000']
        : 'http://localhost:3000',
    credentials: true 
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Serve Static Files (The "Frontend")
app.use(express.static(path.join(__dirname, '../public')));

// API Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/products', require('./routes/productRoutes'));
app.use('/api/cart', require('./routes/cartRoutes'));
app.use('/api/orders', require('./routes/orderRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/contact', require('./routes/contactRoutes'));

const { getFestivalContext } = require('./festival-intelligence');
const Product = require('./models/Product');

app.get('/api/festival-context', async (req, res) => {
    try {
        const clientDate = req.query.date ? new Date(req.query.date).toDateString() : new Date().toDateString();
        console.log(`🤖 Intelligence Request: Analyzing context for ${clientDate}...`);
        
        const context = await getFestivalContext(clientDate);
        res.json(context);
    } catch (err) {
        console.error("Festival Context Error:", err);
        res.status(500).json({ message: "Error processing festival intelligence" });
    }
});

// Coupon Validation Route
app.post('/api/coupons/validate', async (req, res) => {
    try {
        const { code, amount } = req.body;
        console.log(`🎟️ Validating coupon: ${code} for amount ₹${amount}`);
        
        const context = await getFestivalContext(new Date().toDateString());
        
        if (!context.special_offers || context.special_offers.length === 0) {
            return res.status(404).json({ message: "No active promotions found." });
        }

        // Find matching coupon in the array
        const offer = context.special_offers.find(o => o.discount_code.toUpperCase() === code.toUpperCase());
        
        if (!offer) {
            return res.status(400).json({ message: "Invalid coupon code." });
        }

        // 1. Check Expiration
        if (offer.expires_at) {
            const expiry = new Date(offer.expires_at);
            if (new Date() > expiry) {
                return res.status(400).json({ message: "This coupon has expired." });
            }
        }

        // 2. Check Minimum Spend
        if (offer.min_spend && amount < offer.min_spend) {
            return res.status(400).json({ 
                message: `Minimum spend of ₹${offer.min_spend} required for this coupon.`,
                threshold: offer.min_spend
            });
        }

        // SUCCESS
        res.json({
            valid: true,
            discount: offer.discount_percentage,
            code: offer.discount_code,
            message: `Coupon applied: ${offer.discount_percentage}% OFF!`
        });

    } catch (err) {
        console.error("Coupon Validation Error:", err);
        res.status(500).json({ message: "Error validating coupon." });
    }
});

app.get('/api/status', (req, res) => {
    res.json({ status: 'active', message: 'Backend is running with MongoDB' });
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server is running on port ${PORT}`);
});
