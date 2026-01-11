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

// Festival Intelligence Route
const { getFestivalContext } = require('./festival-intelligence');

app.get('/api/festival-context', async (req, res) => {
    // Determine date (default to today, or allow mock date via query)
    const clientDate = req.query.date ? new Date(req.query.date).toDateString() : new Date().toDateString();
    
    console.log(`🤖 Intelligence Request: Analyzing context for ${clientDate}...`);
    
    const context = await getFestivalContext(clientDate);
    res.json(context);
});

app.get('/api/status', (req, res) => {
    res.json({ status: 'active', message: 'Backend is running with MongoDB' });
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server is running on port ${PORT}`);
});
