const Wishlist = require('../models/Wishlist');
const Product = require('../models/Product');

// @desc    Get user wishlist
// @route   GET /api/wishlist
// @access  Private
const getWishlist = async (req, res) => {
    try {
        let wishlist = await Wishlist.findOne({ user: req.user._id }).populate('products');
        if (!wishlist) {
            wishlist = await Wishlist.create({ user: req.user._id, products: [] });
        }
        res.json(wishlist);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Add product to wishlist
// @route   POST /api/wishlist
// @access  Private
const addToWishlist = async (req, res) => {
    const { productId } = req.body;

    try {
        let wishlist = await Wishlist.findOne({ user: req.user._id });
        if (!wishlist) {
            wishlist = await Wishlist.create({ user: req.user._id, products: [] });
        }

        if (wishlist.products.includes(productId)) {
            return res.status(400).json({ message: 'Product already in wishlist' });
        }

        wishlist.products.push(productId);
        await wishlist.save();
        
        const updatedWishlist = await Wishlist.findById(wishlist._id).populate('products');
        res.json(updatedWishlist);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Remove product from wishlist
// @route   DELETE /api/wishlist/:productId
// @access  Private
const removeFromWishlist = async (req, res) => {
    try {
        let wishlist = await Wishlist.findOne({ user: req.user._id });
        if (wishlist) {
            wishlist.products = wishlist.products.filter(p => p.toString() !== req.params.productId);
            await wishlist.save();
            const updatedWishlist = await Wishlist.findById(wishlist._id).populate('products');
            res.json(updatedWishlist);
        } else {
            res.status(404).json({ message: 'Wishlist not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getWishlist,
    addToWishlist,
    removeFromWishlist
};
