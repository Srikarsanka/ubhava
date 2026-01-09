const express = require('express');
const router = express.Router();
const {
    createOrder,
    getMyOrders,
    getOrders,
    getOrderById
} = require('../controllers/orderController');
const { protect, admin } = require('../middleware/authMiddleware');

router.route('/')
    .post(protect, createOrder)
    .get(protect, admin, getOrders);

router.route('/:id')
    .get(protect, getOrderById);

router.route('/myorders')
    .get(protect, getMyOrders);

module.exports = router;
