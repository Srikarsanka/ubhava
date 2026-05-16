const mongoose = require('mongoose');

const couponSchema = new mongoose.Schema({
    code: {
        type: String,
        required: true,
        unique: true,
        uppercase: true,
        trim: true
    },
    discountType: {
        type: String,
        enum: ['percentage', 'flat'],
        default: 'percentage'
    },
    discountPercentage: {
        type: Number,
        default: 0,
        min: 0,
        max: 100
    },
    discountAmount: {
        type: Number,
        default: 0,
        min: 0
    },
    minSpend: {
        type: Number,
        default: 0
    },
    description: {
        type: String,
        default: "Seasonal Offer"
    },
    expiryDate: {
        type: Date,
        required: true
    },
    isActive: {
        type: Boolean,
        default: true
    },
    isAiGenerated: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });

module.exports = mongoose.model('Coupon', couponSchema);
