// MongoDB Data Migration Script
// This script exports all data from current DB and prepares it for import to new DB

require('dotenv').config();
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

// Import all models
const User = require('./server/models/User');
const Product = require('./server/models/Product');
const Order = require('./server/models/Order');
const Cart = require('./server/models/Cart');
const Wishlist = require('./server/models/Wishlist');
const Address = require('./server/models/Address');

const EXPORT_DIR = './db_export';

async function exportData() {
    try {
        console.log('🔗 Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Connected to MongoDB');

        // Create export directory
        if (!fs.existsSync(EXPORT_DIR)) {
            fs.mkdirSync(EXPORT_DIR);
        }

        console.log('\n📦 Exporting data...\n');

        // Export Users
        const users = await User.find({}).lean();
        fs.writeFileSync(
            path.join(EXPORT_DIR, 'users.json'),
            JSON.stringify(users, null, 2)
        );
        console.log(`✅ Exported ${users.length} users`);

        // Export Products
        const products = await Product.find({}).lean();
        fs.writeFileSync(
            path.join(EXPORT_DIR, 'products.json'),
            JSON.stringify(products, null, 2)
        );
        console.log(`✅ Exported ${products.length} products`);

        // Export Orders
        const orders = await Order.find({}).lean();
        fs.writeFileSync(
            path.join(EXPORT_DIR, 'orders.json'),
            JSON.stringify(orders, null, 2)
        );
        console.log(`✅ Exported ${orders.length} orders`);

        // Export Carts
        const carts = await Cart.find({}).lean();
        fs.writeFileSync(
            path.join(EXPORT_DIR, 'carts.json'),
            JSON.stringify(carts, null, 2)
        );
        console.log(`✅ Exported ${carts.length} carts`);

        // Export Wishlists
        const wishlists = await Wishlist.find({}).lean();
        fs.writeFileSync(
            path.join(EXPORT_DIR, 'wishlists.json'),
            JSON.stringify(wishlists, null, 2)
        );
        console.log(`✅ Exported ${wishlists.length} wishlists`);

        // Export Addresses
        const addresses = await Address.find({}).lean();
        fs.writeFileSync(
            path.join(EXPORT_DIR, 'addresses.json'),
            JSON.stringify(addresses, null, 2)
        );
        console.log(`✅ Exported ${addresses.length} addresses`);

        console.log('\n✅ All data exported successfully to ./db_export/');
        console.log('\n📋 Summary:');
        console.log(`   Users: ${users.length}`);
        console.log(`   Products: ${products.length}`);
        console.log(`   Orders: ${orders.length}`);
        console.log(`   Carts: ${carts.length}`);
        console.log(`   Wishlists: ${wishlists.length}`);
        console.log(`   Addresses: ${addresses.length}`);

        await mongoose.connection.close();
        console.log('\n🔌 Disconnected from MongoDB');
        
    } catch (error) {
        console.error('❌ Error exporting data:', error);
        process.exit(1);
    }
}

exportData();
