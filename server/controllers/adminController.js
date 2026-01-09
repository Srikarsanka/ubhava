const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');

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

module.exports = {
    getDashboardStats,
    getAnalyticsData
};
