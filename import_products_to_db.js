// Import hardcoded products from products_data.js into MongoDB
require('dotenv').config();
const mongoose = require('mongoose');
const fs = require('fs');
const Product = require('./server/models/Product');

async function importProducts() {
    try {
        console.log('🔗 Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Connected to MongoDB\n');

        // Read products_data.js file
        const fileContent = fs.readFileSync('./public/products_data.js', 'utf8');
        
        // Extract products array using eval (safe in this controlled context)
        let products;
        eval(fileContent); // This sets the 'products' variable
        
        console.log(`📦 Found ${products.length} products in products_data.js`);
        console.log('⚠️  This will DELETE all existing products in database!');
        console.log('Press Ctrl+C within 3 seconds to cancel...\n');
        
        await new Promise(resolve => setTimeout(resolve, 3000));

        // Clear existing products
        await Product.deleteMany({});
        console.log('🗑️  Cleared existing products\n');

        // Transform and insert products
        const transformedProducts = products.map(p => ({
            name: p.name,
            category: p.category || p.subCategory,
            subCategory: p.subCategory,
            price: parseInt(p.price),
            originalPrice: parseInt(p.originalPrice || p.price),
            image: p.img,
            video: p.video || '',
            description: p.description || p.name,
            stock: p.stock || 100,
            sizes: p.sizes || [],
            colors: p.colors || []
        }));

        await Product.insertMany(transformedProducts);
        console.log(`✅ Imported ${transformedProducts.length} products to database\n`);

        await mongoose.connection.close();
        console.log('🔌 Disconnected from MongoDB');
        console.log('\n✅ Products successfully imported!');
        console.log('Now run: node export_data.js to export all data');
        
    } catch (error) {
        console.error('❌ Error importing products:', error);
        process.exit(1);
    }
}

importProducts();
