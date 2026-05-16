const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    items: [{
        product: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'Product'
        },
        quantity: {
            type: Number,
            required: true
        },
        priceAtPurchase: {
            type: Number, // Price snapshot
            required: true
        },
        selectedSize: {
             type: String
        }
    }],
    totalAmount: {
        type: Number,
        required: true
    },
    deliveryAddress: {
        fullName: String,
        phone: String,
        street: String,
        city: String,
        state: String,
        pincode: String
    },
    orderStatus: {
        type: String,
        enum: ['Placed', 'Order Received', 'Order Packed', 'Shipped', 'Delivered', 'Cancelled'],
        default: 'Placed'
    },
    statusLastUpdated: {
        type: Date,
        default: Date.now
    },
    paymentStatus: {
        type: String,
        enum: ['Pending', 'Paid', 'Failed'],
        default: 'Pending'
    },
    paymentMethod: {
        type: String, // 'UPI', 'COD', 'Card'
        required: true,
        default: 'COD'
    }
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);
