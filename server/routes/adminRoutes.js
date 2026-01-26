const express = require('express');
const { 
    getDashboardStats, 
    getAnalyticsData,
    getCoupons,
    createCoupon,
    updateCoupon,
    deleteCoupon,
    removeDeal
} = require('../controllers/adminController');
const { protect, admin } = require('../middleware/authMiddleware');
const router = express.Router();

router.get('/stats', protect, admin, getDashboardStats);
router.get('/analytics', protect, admin, getAnalyticsData);

// Coupon Routes
router.route('/coupons')
    .get(protect, admin, getCoupons)
    .post(protect, admin, createCoupon);

router.route('/coupons/:id')
    .put(protect, admin, updateCoupon)
    .delete(protect, admin, deleteCoupon);

// Deal Management
router.put('/products/:id/remove-deal', protect, admin, removeDeal);

module.exports = router;
