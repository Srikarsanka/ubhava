const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');
const Festival = require('../models/Festival');

// @desc    Get Admin Dashboard Stats
// @route   GET /api/admin/stats
// @access  Private/Admin
const getDashboardStats = async (req, res) => {
    try {
        // 1. Total Revenue & Orders Count
        const totalOrders = await Order.countDocuments();
        const totalRevenueAgg = await Order.aggregate([
            { $group: { _id: null, total: { $sum: "$totalAmount" } } }
        ]);
        const totalRevenue = totalRevenueAgg.length > 0 ? totalRevenueAgg[0].total : 0;

        // 2. Monthly Revenue (Current Month)
        const date = new Date();
        const firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
        const lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0);

        const monthlyRevenueAgg = await Order.aggregate([
            { $match: { createdAt: { $gte: firstDay, $lte: lastDay } } },
            { $group: { _id: null, total: { $sum: "$totalAmount" } } }
        ]);
        const monthlyRevenue = monthlyRevenueAgg.length > 0 ? monthlyRevenueAgg[0].total : 0;

        // 3. Low Stock Products (<= 5)
        const lowStockProducts = await Product.find({ stockAvailable: { $lte: 5 } })
            .select('name stockAvailable img price category')
            .limit(5);

        // 4. Best Selling Products
        // Group order items by product ID and sum quantity
        const bestSellersAgg = await Order.aggregate([
            { $unwind: "$items" },
            { $group: { 
                _id: "$items.product", 
                totalSold: { $sum: "$items.quantity" },
                revenue: { $sum: { $multiply: ["$items.quantity", "$items.priceAtPurchase"] } } 
            }},
            { $sort: { totalSold: -1 } },
            { $limit: 5 },
            { $lookup: {
                from: "products",
                localField: "_id",
                foreignField: "_id",
                as: "productDetails"
            }},
            { $unwind: "$productDetails" },
            { $project: {
                name: "$productDetails.name",
                img: { $arrayElemAt: ["$productDetails.images", 0] },
                totalSold: 1,
                revenue: 1
            }}
        ]);

        res.json({
            totalOrders,
            totalRevenue,
            monthlyRevenue,
            lowStockProducts,
            bestSellers: bestSellersAgg
        });

    } catch (error) {
        console.error("Stats Error:", error);
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get Detailed Analytics for Charts
// @route   GET /api/admin/analytics
// @access  Private/Admin
const getAnalyticsData = async (req, res) => {
    try {
        // 1. Sales Over Time (Last 30 Days)
        const salesOverTime = await Order.aggregate([
            {
                $match: {
                    createdAt: { 
                        $gte: new Date(new Date().setDate(new Date().getDate() - 30)) 
                    }
                }
            },
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                    totalSales: { $sum: "$totalAmount" },
                    count: { $sum: 1 }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        // 2. Sales by Payment Method
        const salesByPayment = await Order.aggregate([
            {
                $group: {
                    _id: "$paymentMethod", // Now exists in schema
                    total: { $sum: "$totalAmount" },
                    count: { $sum: 1 }
                }
            }
        ]);

        // 3. Sales by Category
        const salesByCategory = await Order.aggregate([
            { $unwind: "$items" },
            { $lookup: {
                from: "products",
                localField: "items.product",
                foreignField: "_id",
                as: "product"
            }},
            { $unwind: "$product" },
            { $group: {
                _id: "$product.category",
                revenue: { $sum: { $multiply: ["$items.quantity", "$items.priceAtPurchase"] } }
            }}
        ]);

        // 4. Monthly Sales (Last 12 Months)
        const salesByMonth = await Order.aggregate([
            {
                $match: {
                    createdAt: { 
                        $gte: new Date(new Date().setFullYear(new Date().getFullYear() - 1)) 
                    }
                }
            },
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m", date: "$createdAt" } },
                    totalSales: { $sum: "$totalAmount" },
                    count: { $sum: 1 }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        // 5. Yearly Sales (All Time)
        const salesByYear = await Order.aggregate([
            {
                $group: {
                    _id: { $dateToString: { format: "%Y", date: "$createdAt" } },
                    totalSales: { $sum: "$totalAmount" },
                    count: { $sum: 1 }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        res.json({
            salesOverTime, // { _id: "2024-01-01", ... }
            salesByPayment,
            salesByCategory,
            salesByMonth, // { _id: "2024-01", ... }
            salesByYear   // { _id: "2024", ... }
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const Coupon = require('../models/Coupon');

// ... existing imports ...

// @desc    Get All Coupons
// @route   GET /api/admin/coupons
// @access  Private/Admin
const getCoupons = async (req, res) => {
    try {
        const coupons = await Coupon.find({}).sort({ createdAt: -1 });
        res.json(coupons);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create New Coupon
// @route   POST /api/admin/coupons
// @access  Private/Admin
const createCoupon = async (req, res) => {
    try {
        const { code, discountPercentage, minSpend, expiryDate, description } = req.body;
        
        const couponExists = await Coupon.findOne({ code });
        if (couponExists) {
            return res.status(400).json({ message: 'Coupon code already exists' });
        }

        const coupon = await Coupon.create({
            code,
            discountPercentage,
            minSpend,
            expiryDate,
            description,
            isAiGenerated: false
        });

        res.status(201).json(coupon);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Update Coupon Status/Value
// @route   PUT /api/admin/coupons/:id
// @access  Private/Admin
const updateCoupon = async (req, res) => {
    try {
        const coupon = await Coupon.findById(req.params.id);
        if (!coupon) {
            return res.status(404).json({ message: 'Coupon not found' });
        }

        coupon.isActive = req.body.isActive !== undefined ? req.body.isActive : coupon.isActive;
        coupon.discountPercentage = req.body.discountPercentage || coupon.discountPercentage;
        coupon.minSpend = req.body.minSpend !== undefined ? req.body.minSpend : coupon.minSpend;
        
        const updatedCoupon = await coupon.save();
        res.json(updatedCoupon);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Delete Coupon
// @route   DELETE /api/admin/coupons/:id
// @access  Private/Admin
const deleteCoupon = async (req, res) => {
    try {
        const coupon = await Coupon.findById(req.params.id);
        if (!coupon) {
            return res.status(404).json({ message: 'Coupon not found' });
        }
        await coupon.deleteOne();
        res.json({ message: 'Coupon removed' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Remove Deal (Festive Price) from Product
// @route   PUT /api/admin/products/:id/remove-deal
// @access  Private/Admin
const removeDeal = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        product.festivePrice = undefined;
        product.originalPrice = undefined;
        await product.save();

        res.json({ message: 'Deal removed', product });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


// @desc    Get All Festivals & AI Forecast
// @route   GET /api/admin/festivals
// @access  Private/Admin
const getFestivals = async (req, res) => {
    try {
        const allFestivals = await Festival.find({}).sort({ eventDate: 1 });
        
        // Calculate "Next 5 Days" forecast
        const today = new Date();
        const next5Days = new Date();
        next5Days.setDate(today.getDate() + 5);

        const aiForecast = allFestivals.filter(f => {
            const fDate = new Date(f.eventDate);
            return fDate >= today && fDate <= next5Days;
        });

        res.json({
            allFestivals,
            aiForecast
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getDashboardStats,
    getAnalyticsData,
    getCoupons,
    createCoupon,
    updateCoupon,
    deleteCoupon,
    removeDeal,
    getFestivals
};
