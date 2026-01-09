const Cart = require('../models/Cart');
const Product = require('../models/Product');

// @desc    Get user cart
// @route   GET /api/cart
// @access  Private
const getCart = async (req, res) => {
    try {
        let cart = await Cart.findOne({ user: req.user._id }).populate('items.product');
        if (!cart) {
            cart = await Cart.create({ user: req.user._id, items: [] });
        }
        res.json(cart);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Add item to cart
// @route   POST /api/cart
// @access  Private
const addToCart = async (req, res) => {
    const { productId, quantity, size } = req.body;

    try {
        let cart = await Cart.findOne({ user: req.user._id });
        if (!cart) {
            cart = await Cart.create({ user: req.user._id, items: [] });
        }

        const product = await Product.findById(productId);
        if(!product) {
             return res.status(404).json({ message: 'Product not found' });
        }

        // Check if item exists
        // Note: Logic might need to handle separate entries for different sizes of same product
        // For simplicity, unique constraint on ProductId only is common, but with size it should be ProductId + Size
        const itemIndex = cart.items.findIndex(p => p.product.toString() === productId && p.selectedSize === size);

        if (itemIndex > -1) {
            // Update quantity
            cart.items[itemIndex].quantity += (quantity || 1);
        } else {
            // Add new item
            cart.items.push({
                product: productId,
                quantity: quantity || 1,
                selectedSize: size
            });
        }

        await cart.save();
        // Return populated cart
        const populatedCart = await Cart.findById(cart._id).populate('items.product');
        res.json(populatedCart);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Remove item from cart
// @route   DELETE /api/cart/:productId
// @access  Private
const removeFromCart = async (req, res) => {
    try {
        let cart = await Cart.findOne({ user: req.user._id });
        if (cart) {
            cart.items = cart.items.filter(item => item.product.toString() !== req.params.productId);
            await cart.save();
            const populatedCart = await Cart.findById(cart._id).populate('items.product');
            res.json(populatedCart);
        } else {
            res.status(404).json({ message: 'Cart not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getCart,
    addToCart,
    removeFromCart
};
