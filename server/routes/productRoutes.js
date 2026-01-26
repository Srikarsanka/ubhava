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

router.route('/')
    .get(getProducts)
    .post(protect, admin, createProduct);

router.route('/:id')
    .get(getProductById)
    .put(protect, admin, updateProduct)
    .delete(protect, admin, deleteProduct);

module.exports = router;
