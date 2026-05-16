const express = require('express');
const router = express.Router();
const {
    getProducts,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct,
    autoAdjustPrices
} = require('../controllers/productController');
const { protect, admin } = require('../middleware/authMiddleware');

router.route('/auto-price').post(protect, admin, autoAdjustPrices);

// Season-aware product prioritization (Moansson Engine)
const Product = require('../models/Product');
router.get('/seasonal', async (req, res) => {
    try {
        const season = req.query.season || 'summer';
        const limit = parseInt(req.query.limit) || 12;

        // 1. Get season-specific Moansson products first
        let seasonProducts = await Product.find({ season, brand: 'Moansson' })
            .sort({ isTrending: -1, discount: -1 })
            .limit(limit);

        // 2. Fill remaining slots with keyword-matched traditional products
        if (seasonProducts.length < limit) {
            const remaining = limit - seasonProducts.length;
            const keywords = {
                summer: ['cotton', 'linen', 'breathable', 'light', 'kurta'],
                monsoon: ['rain', 'waterproof', 'umbrella', 'jacket'],
                winter: ['sweater', 'wool', 'warm', 'shawl', 'pashmina']
            };
            const terms = keywords[season] || [];
            const query = terms.length > 0 ? {
                brand: { $ne: 'Moansson' },
                $or: terms.map(t => ({
                    $or: [
                        { name: { $regex: t, $options: 'i' } },
                        { description: { $regex: t, $options: 'i' } }
                    ]
                }))
            } : { brand: { $ne: 'Moansson' } };

            const fillProducts = await Product.find(query)
                .sort({ isTrending: -1 })
                .limit(remaining);
            seasonProducts = [...seasonProducts, ...fillProducts];
        }

        res.json({ season, count: seasonProducts.length, products: seasonProducts });
    } catch (err) {
        console.error("Seasonal Products Error:", err);
        res.status(500).json({ message: "Error fetching seasonal products" });
    }
});

router.route('/')
    .get(getProducts)
    .post(protect, admin, createProduct);

router.route('/:id')
    .get(getProductById)
    .put(protect, admin, updateProduct)
    .delete(protect, admin, deleteProduct);

module.exports = router;
