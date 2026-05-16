const express = require('express');
const router = express.Router();
const {
    createOrder,
    getMyOrders,
    getOrders,
    getOrderById,
    updateOrderStatus
} = require('../controllers/orderController');
const { protect, admin } = require('../middleware/authMiddleware');

router.route('/')
    .post(protect, createOrder)
    .get(protect, admin, getOrders);

router.route('/:id/status')
    .put(protect, admin, updateOrderStatus);

router.route('/myorders')
    .get(protect, getMyOrders);

router.route('/:id')
    .get(protect, getOrderById);

module.exports = router;
