// MongoDB Data Import Script
// This script imports all data from exported JSON files to new DB

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

async function importData() {
    try {
        console.log('🔗 Connecting to NEW MongoDB...');
        
        // Make sure to update MONGO_URI in .env to point to NEW database before running this
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Connected to NEW MongoDB');

        console.log('\n⚠️  WARNING: This will DELETE all existing data in the new database!');
        console.log('Press Ctrl+C within 5 seconds to cancel...\n');
        
        await new Promise(resolve => setTimeout(resolve, 5000));

        console.log('📦 Importing data...\n');

        // Clear existing data
        await User.deleteMany({});
        await Product.deleteMany({});
        await Order.deleteMany({});
        await Cart.deleteMany({});
        await Wishlist.deleteMany({});
        await Address.deleteMany({});
        console.log('🗑️  Cleared existing data\n');

        // Import Users
        const usersData = JSON.parse(fs.readFileSync(path.join(EXPORT_DIR, 'users.json'), 'utf8'));
        if (usersData.length > 0) {
            await User.insertMany(usersData);
            console.log(`✅ Imported ${usersData.length} users`);
        }

        // Import Products
        const productsData = JSON.parse(fs.readFileSync(path.join(EXPORT_DIR, 'products.json'), 'utf8'));
        if (productsData.length > 0) {
            await Product.insertMany(productsData);
            console.log(`✅ Imported ${productsData.length} products`);
        }

        // Import Orders
        const ordersData = JSON.parse(fs.readFileSync(path.join(EXPORT_DIR, 'orders.json'), 'utf8'));
        if (ordersData.length > 0) {
            await Order.insertMany(ordersData);
            console.log(`✅ Imported ${ordersData.length} orders`);
        }

        // Import Carts
        const cartsData = JSON.parse(fs.readFileSync(path.join(EXPORT_DIR, 'carts.json'), 'utf8'));
        if (cartsData.length > 0) {
            await Cart.insertMany(cartsData);
            console.log(`✅ Imported ${cartsData.length} carts`);
        }

        // Import Wishlists
        const wishlistsData = JSON.parse(fs.readFileSync(path.join(EXPORT_DIR, 'wishlists.json'), 'utf8'));
        if (wishlistsData.length > 0) {
            await Wishlist.insertMany(wishlistsData);
            console.log(`✅ Imported ${wishlistsData.length} wishlists`);
        }

        // Import Addresses
        const addressesData = JSON.parse(fs.readFileSync(path.join(EXPORT_DIR, 'addresses.json'), 'utf8'));
        if (addressesData.length > 0) {
            await Address.insertMany(addressesData);
            console.log(`✅ Imported ${addressesData.length} addresses`);
        }

        console.log('\n✅ All data imported successfully to NEW database!');
        
        await mongoose.connection.close();
        console.log('\n🔌 Disconnected from MongoDB');
        
    } catch (error) {
        console.error('❌ Error importing data:', error);
        process.exit(1);
    }
}

importData();
