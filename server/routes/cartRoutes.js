const express = require('express');
const router = express.Router();
const {
    getCart,
    addToCart,
    removeFromCart,
    applyCoupon,
    removeCoupon
} = require('../controllers/cartController');
const { protect } = require('../middleware/authMiddleware');

router.route('/')
    .get(protect, getCart)
    .post(protect, addToCart);

router.route('/coupon')
    .post(protect, applyCoupon)
    .delete(protect, removeCoupon);

router.route('/:productId')
    .delete(protect, removeFromCart);

module.exports = router;
