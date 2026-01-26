const Product = require('../models/Product');

// @desc    Fetch all products
// @route   GET /api/products
// @access  Public
const getProducts = async (req, res) => {
    try {
        const keyword = req.query.keyword ? {
            name: {
                $regex: req.query.keyword,
                $options: 'i' // case insensitive
            }
        } : {};

        const products = await Product.find({ ...keyword });
        res.json(products);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Fetch single product
// @route   GET /api/products/:id
// @access  Public
const getProductById = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);

        if (product) {
            res.json(product);
        } else {
            res.status(404).json({ message: 'Product not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create a product
// @route   POST /api/products
// @access  Private/Admin
const createProduct = async (req, res) => {
    const {
        name,
        price,
        description,
        image, // legacy support
        images,
        category,
        subCategory,
        stock,
        isTrending,
        sizes
    } = req.body;

    // Handle image array vs single string
    const imageList = images || (image ? [image] : []);

    try {
        const product = new Product({
            name,
            price,
            description,
            images: imageList,
            category,
            subCategory,
            stockAvailable: stock || 0,
            isTrending: isTrending || false,
            sizes: sizes || []
        });

        const createdProduct = await product.save();
        res.status(201).json(createdProduct);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Update a product
// @route   PUT /api/products/:id
// @access  Private/Admin
const updateProduct = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);

        if (product) {
            product.name = req.body.name || product.name;
            product.price = req.body.price || product.price;
            product.description = req.body.description || product.description;
            product.category = req.body.category || product.category;
            product.subCategory = req.body.subCategory || product.subCategory; // Added
            product.stockAvailable = req.body.stock !== undefined ? req.body.stock : product.stockAvailable;
            product.isTrending = req.body.isTrending !== undefined ? req.body.isTrending : product.isTrending; // Added
            product.video = req.body.video || product.video; // Added
            product.sizes = req.body.sizes || product.sizes; 
            
            // Handle Pricing Config
            if(req.body.pricingConstraints) {
                product.pricingConstraints = req.body.pricingConstraints;
            }

            // Handle Festive Price Updates
            if (req.body.festivePrice !== undefined) {
                product.festivePrice = req.body.festivePrice;
                if (!product.originalPrice && req.body.festivePrice > 0) {
                     product.originalPrice = product.price;
                }
            }
            
            // ... existing legacy image handling ... 
            if (req.body.images) {
                product.images = req.body.images;
            } else if (req.body.image) {
                product.images = [req.body.image];
            }

            const updatedProduct = await product.save();
            res.json(updatedProduct);
        } else {
            res.status(404).json({ message: 'Product not found' });
        }
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Auto Adjust Prices based on Smart Rules
// @route   POST /api/products/auto-price
// @access  Private/Admin
const autoAdjustPrices = async (req, res) => {
    try {
        const products = await Product.find({});
        let adjustedCount = 0;

        for(const p of products) {
            // Only adjust if constraints are set
            if(!p.pricingConstraints || (!p.pricingConstraints.maxPrice && !p.pricingConstraints.maxDiscount)) continue;

            let newPrice = p.price;
            let festivePrice = 0;
            const maxP = p.pricingConstraints.maxPrice || Infinity;
            const maxD = p.pricingConstraints.maxDiscount || 0;

            // Rule 1: Scarcity (Stock < 5) -> Surge Price
            if(p.stockAvailable < 5 && p.stockAvailable > 0) {
               // Increase by 10%, but not above Max Price
               const surge = Math.round(p.price * 1.10);
               if(surge <= maxP) {
                   p.price = surge;
                   p.festivePrice = 0; // Remove deals during scarcity
                   adjustedCount++;
               }
            }

            // Rule 2: Surplus (Stock > 20) -> Discount
            if(p.stockAvailable > 20 && maxD > 0) {
                // Apply max discount allowed
                if(!p.originalPrice) p.originalPrice = p.price; 
                p.festivePrice = Math.round(p.price * (1 - (maxD / 100)));
                adjustedCount++;
            }

            await p.save();
        }

        res.json({ message: `Smart Pricing Run: Adjusted ${adjustedCount} products.` });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const deleteProduct = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);

        if (product) {
            await product.deleteOne();
            res.json({ message: 'Product removed' });
        } else {
            res.status(404).json({ message: 'Product not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getProducts,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct,
    autoAdjustPrices
};
