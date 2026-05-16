const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Product = require('./models/Product');
const Coupon = require('./models/Coupon');
const Festival = require('./models/Festival');

dotenv.config();

const users = [
    {
        fullName: 'Admin User',
        email: 'admin@example.com',
        password: 'admin123',
        role: 'admin',
        phoneNumber: '9999999999'
    },
    {
        fullName: 'Srikar Sanka',
        email: 'sankasrikar@gmail.com',
        password: 'user123',
        role: 'user',
        phoneNumber: '8639157722'
    }
];

const productsData = [
    {
    category: 'women',
    subCategory: 'saree',
    images: ['https://res.cloudinary.com/dnevq4wek/image/upload/v1744390707/trendsaree_vbeoxs.avif'],
    price: 5000,
    name: 'Sea Green Bel Buti Patterned Saree',
    video: 'https://res.cloudinary.com/dnevq4wek/video/upload/v1744873419/seagreensareevedio_gvynpb.mp4',
    description: "Experience the timeless elegance of our handcrafted collections.",
    stockAvailable: 15,
    sizes: ['Std'],
    season: 'monsoon',
    brand: 'Moansson'
  },
  {
    category: 'women',
    subCategory: 'saree',
    images: ['https://res.cloudinary.com/dnevq4wek/image/upload/v1744390847/pinksaretrend2_saqzxo.avif'],
    price: 6000,
    name: 'Cream Beige Floral Embroidered Saree',
    video: 'https://res.cloudinary.com/dnevq4wek/video/upload/v1744873545/creamsareefloral_thxsbm.mp4',
    description: "Experience the timeless elegance of our handcrafted collections.",
    stockAvailable: 10,
    sizes: ['Std'],
    season: 'monsoon',
    brand: 'Moansson'
  },
  {
    category: 'men',
    subCategory: 'outerwear',
    images: ['/images/products/raincoat.png'],
    price: 2500,
    name: 'Moansson Sea Blue Raincoat',
    description: "Ultra-lightweight waterproof raincoat designed for heavy monsoons.",
    stockAvailable: 20,
    sizeStock: [
        { size: 'S', stock: 3 },
        { size: 'M', stock: 8 },
        { size: 'L', stock: 2 },
        { size: 'XL', stock: 7 }
    ],
    sizes: ['S', 'M', 'L', 'XL'],
    season: 'monsoon',
    brand: 'Moansson'
  },
  {
    category: 'women',
    subCategory: 'knitwear',
    images: ['/images/products/sweater.png'],
    price: 3200,
    name: 'Woolen Maroon Sweater',
    description: "Hand-knitted premium wool sweater for chilly monsoon evenings.",
    stockAvailable: 12,
    sizeStock: [
        { size: 'S', stock: 4 },
        { size: 'M', stock: 12 },
        { size: 'L', stock: 0 }
    ],
    sizes: ['S', 'M', 'L'],
    season: 'monsoon',
    brand: 'Moansson'
  },
  {
    category: 'home',
    subCategory: 'accessories',
    images: ['/images/products/umbrella.png'],
    price: 1200,
    name: 'Artisan Printed Umbrella',
    description: "Large canopy umbrella with traditional hand-block prints.",
    stockAvailable: 50,
    sizes: ['Std'],
    season: 'monsoon',
    brand: 'Moansson'
  },
  {
    category: 'men',
    subCategory: 'outerwear',
    images: ['/images/products/windbreaker.png'],
    price: 2800,
    name: 'Emerald Windbreaker',
    description: "Water-resistant windbreaker in a vibrant emerald shade.",
    stockAvailable: 18,
    sizeStock: [
        { size: 'M', stock: 15 },
        { size: 'L', stock: 3 },
        { size: 'XL', stock: 2 }
    ],
    sizes: ['M', 'L', 'XL'],
    season: 'monsoon',
    brand: 'Moansson'
  },
  {
    category: 'men',
    subCategory: 'Kurta Pajama',
    name: "Mehndi Green Kurta Set with Abstract & Paisley Print",
    video: "https://res.cloudinary.com/dnevq4wek/video/upload/v1744911342/kurtha1_zrwh5t.mp4",
    images: ["https://res.cloudinary.com/dnevq4wek/image/upload/v1744911302/kurthap1_wce0vs.webp"],
    price: 6500,
    description: "Premium cotton kurta for festive occasions.",
    stockAvailable: 20,
    sizes: ['S', 'M', 'L', 'XL']
  },
  {
    category: 'men',
    subCategory: 'sherwani',
    name: "Cream Beige Jaal Patterned Sherwani Set with Layered Necklace",
    video: "https://res.cloudinary.com/dnevq4wek/video/upload/v1744918722/sherwani1_mkmvs1.mp4",
    images: ["https://res.cloudinary.com/dnevq4wek/image/upload/v1744918739/sherwani1_iczd7d.avif"],
    price: 25500,
    description: "Handcrafted sherwani for the perfect groom look.",
    stockAvailable: 5,
    sizes: ['M', 'L', 'XL']
  },
  {
    category:'HomeDecor',
    subCategory:'home',
    images: ["https://res.cloudinary.com/dnevq4wek/image/upload/v1745060228/homedecor1_m2bfun.jpg"],
    name: "Alpana Polyresin Standing Krishna Figurine",
    price: 2499,
    description: "Beautiful handcrafted Krishna figurine for home decor.",
    stockAvailable: 30
  }
];

const seedData = async () => {
    try {
        console.log('🚀 Seeding process started...');
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Connected to MongoDB Atlas');

        // Clear existing data
        await User.deleteMany();
        await Product.deleteMany();
        await Coupon.deleteMany();
        await Festival.deleteMany();
        console.log('🗑️  Existing data cleared');

        // Insert Users
        // We use create() to trigger the 'save' middleware for hashing
        await User.create(users);
        console.log('👤 Users seeded');

        // Insert Products
        await Product.insertMany(productsData);
        console.log('🛍️  Products seeded');

        // Insert some default coupons
        const nextYear = new Date();
        nextYear.setFullYear(nextYear.getFullYear() + 1);

        await Coupon.create([
            { code: 'WELCOME10', discountPercentage: 10, minSpend: 1000, description: 'New User Discount', isActive: true, expiryDate: nextYear },
            { code: 'FESTIVE20', discountPercentage: 20, minSpend: 5000, description: 'Limited Festive Offer', isActive: true, expiryDate: nextYear }
        ]);
        // Insert a sample festival
        await Festival.create({
            name: 'Diwali',
            eventDate: new Date('2026-11-01'),
            startDate: new Date('2026-10-20'),
            endDate: new Date('2026-11-05'),
            description: 'Festival of Lights',
            keywords: ['diya', 'fireworks', 'lights'],
            templateType: 'spiritual'
        });
        console.log('✨ Festivals seeded');

        console.log('✨ Database seeding completed successfully!');
        process.exit();
    } catch (error) {
        console.error(`❌ Seeding Error: ${error.message}`);
        process.exit(1);
    }
};

seedData();
