const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    category: {
        type: String,
        required: true
    },
    subCategory: {
        type: String
    },
    price: {
        type: Number,
        required: true
    },
    currency: {
        type: String,
        default: 'INR'
    },
    discount: {
        type: Number,
        default: 0
    },
    stockAvailable: {
        type: Number,
        required: true,
        default: 0
    },
    images: [{
        type: String // URL paths
    }],
    video: {
        type: String
    },
    sizes: [{
        type: String // e.g., S, M, L, XL
    }],
    isTrending: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });

module.exports = mongoose.model('Product', productSchema);
