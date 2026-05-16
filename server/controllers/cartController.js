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

const Coupon = require('../models/Coupon');

// ... existing imports ...

// @desc    Apply Coupon
// @route   POST /api/cart/coupon
// @access  Private
const applyCoupon = async (req, res) => {
    try {
        const { code } = req.body;
        const cart = await Cart.findOne({ user: req.user._id }).populate('items.product');

        if (!cart) return res.status(404).json({ message: 'Cart not found' });

        const coupon = await Coupon.findOne({ code: code.toUpperCase() });

        if (!coupon) return res.status(404).json({ message: 'Invalid coupon code' });
        if (!coupon.isActive) return res.status(400).json({ message: 'Coupon is inactive' });
        if (new Date() > coupon.expiryDate) return res.status(400).json({ message: 'Coupon has expired' });

        // Calculate Cart Total to check minSpend
        const cartTotal = cart.items.reduce((acc, item) => {
            const price = item.product.festivePrice || item.product.price;
            return acc + (price * item.quantity);
        }, 0);

        if (cartTotal < coupon.minSpend) {
            return res.status(400).json({ message: `Minimum spend of ₹${coupon.minSpend} required` });
        }

        // Apply
        cart.appliedCoupon = {
            code: coupon.code,
            discountType: coupon.discountType || 'percentage',
            discountPercentage: coupon.discountPercentage || 0,
            discountAmount: coupon.discountAmount || 0,
            minSpend: coupon.minSpend
        };

        // Recalculate discount total
        if (cart.appliedCoupon.discountType === 'flat') {
            cart.discountTotal = Math.min(cartTotal, cart.appliedCoupon.discountAmount);
        } else {
            cart.discountTotal = Math.round((cartTotal * cart.appliedCoupon.discountPercentage) / 100);
        }
        
        await cart.save();
        res.json(cart);

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Remove Coupon
// @route   DELETE /api/cart/coupon
// @access  Private
const removeCoupon = async (req, res) => {
    try {
        const cart = await Cart.findOne({ user: req.user._id }).populate('items.product');
        if (cart) {
            cart.appliedCoupon = undefined;
            cart.discountTotal = 0;
            await cart.save();
            res.json(cart);
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
    removeFromCart,
    applyCoupon,
    removeCoupon
};
