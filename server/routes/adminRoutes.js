const express = require('express');
const { getDashboardStats, getAnalyticsData } = require('../controllers/adminController');
const { protect, admin } = require('../middleware/authMiddleware');
const router = express.Router();
router.get('/stats', protect, admin, getDashboardStats);
router.get('/analytics', protect, admin, getAnalyticsData);

module.exports = router;
