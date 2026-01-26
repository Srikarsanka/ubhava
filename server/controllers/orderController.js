const Order = require('../models/Order');
const Cart = require('../models/Cart');

const Product = require('../models/Product'); // Import Product model

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
const createOrder = async (req, res) => {
    const {
        orderItems,
        deliveryAddress,
        paymentMethod,
        totalAmount
    } = req.body;

    if (orderItems && orderItems.length === 0) {
        return res.status(400).json({ message: 'No order items' });
    }

    try {
        // 1. Validate Stock & Deduct
        // We do this loop *before* creating the order to ensure all items are valid
        for (const item of orderItems) {
            // item.product must be the Product ID
            const product = await Product.findById(item.product);
            
            if (!product) {
                return res.status(404).json({ message: `Product not found: ${item.name || 'Unknown Item'}` });
            }

            if (product.stockAvailable < item.quantity) {
                return res.status(400).json({ message: `Insufficient stock for ${product.name}. Only ${product.stockAvailable} left.` });
            }

            // Deduct stock
            product.stockAvailable -= item.quantity;
            await product.save();
        }

        // 2. Create Order
        const order = new Order({
            user: req.user._id,
            items: orderItems,
            totalAmount,
            deliveryAddress,
            paymentMethod: paymentMethod || 'COD'
        });

        const createdOrder = await order.save();

        // 3. Clear user cart
        await Cart.findOneAndUpdate({ user: req.user._id }, { items: [] });

        res.status(201).json(createdOrder);

        // 4. Send Confirmation Email (Async - don't block response)
        sendOrderConfirmationEmail(req.user, createdOrder);

    } catch (error) {
        console.error("Order Creation Error:", error);
        res.status(500).json({ message: error.message });
    }
};

// --- Web3Forms Admin Notification ---
const axios = require('axios'); // Ensure axios is required

const sendAdminOrderNotification = async (order, user) => {
    try {
        const adminEmail = 'sankasrikar148@gmail.com';
        const accessKey = 'a22faa5b-27cb-4897-90ed-a3054272543b'; 

        const itemList = order.items.map(item => 
            `- ${item.quantity}x Product ID: ${item.product}`
        ).join('\n');

        const message = `
New Order Received! 🚀

Order ID: ${order._id}
Customer: ${user.fullName} (${user.email})
Total Amount: ₹${order.totalAmount}
Payment Method: ${order.paymentMethod}

Items:
${itemList}

Check Admin Panel for details.
        `;

        // Send via Web3Forms API using Axios
        const response = await axios.post('https://api.web3forms.com/submit', {
            access_key: accessKey,
            email: adminEmail,
            subject: `New Order Alert: #${order._id}`,
            message: message,
            from_name: "Udbhava Orders"
        }, {
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }
        });

        if (response.data && response.data.success) {
            console.log("✅ Admin Order Notification sent via Web3Forms");
        } else {
            console.error("❌ Web3Forms Admin Notification Failed:", response.data);
        }

    } catch (error) {
        console.error("❌ Admin Notification Error:", error.response ? error.response.data : error.message);
    }
};

// --- Email Helper (Keeping existing structure for reference, but adding Admin trigger) ---
const nodemailer = require('nodemailer');

const sendOrderConfirmationEmail = async (user, order) => {
    // TRIGGER ADMIN NOTIFICATON HERE
    sendAdminOrderNotification(order, user);

    // Check if Credentials exist for Customer Email
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
        console.log("⚠️ Email Credentials missing in .env. Skipping Customer Email.");
        return;
    }

    try {
        const transporter = nodemailer.createTransport({
            service: 'gmail', // or your provider
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: user.email,
            subject: `Order Confirmed! Order #${order._id}`,
            html: `
                <div style="font-family: Arial, sans-serif; color: #333;">
                    <h2 style="color: #800000;">Thank you for your order, ${user.fullName}!</h2>
                    <p>Your order has been placed successfully.</p>
                    <p><strong>Order ID:</strong> ${order._id}</p>
                    <p><strong>Total Amount:</strong> ₹${order.totalAmount}</p>
                    <p><strong>Payment Method:</strong> ${order.paymentMethod}</p>
                    <hr>
                    <h3>Items:</h3>
                    <ul>
                        ${order.items.map(item => `<li>Qty: ${item.quantity} - Product ID: ${item.product}</li>`).join('')}
                    </ul>
                    <p>We will notify you when it ships!</p>
                    <p>Regards,<br>Udbhava Enterprise</p>
                </div>
            `
        };

        await transporter.sendMail(mailOptions);
        console.log(`✅ Order Confirmation Email sent to ${user.email}`);
    } catch (err) {
        console.error("❌ Email Sending Failed:", err.message);
    }
};

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Private
const getOrderById = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id)
            .populate('user', 'fullName email')
            .populate('items.product', 'name images'); // Populate product details

        if (order) {
            res.json(order);
        } else {
            res.status(404).json({ message: 'Order not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get logged in user orders
// @route   GET /api/orders/myorders
// @access  Private
const getMyOrders = async (req, res) => {
    try {
        const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all orders (Admin)
// @route   GET /api/orders
// @access  Private/Admin
const getOrders = async (req, res) => {
    try {
        const orders = await Order.find({})
            .populate('user', 'id fullName email')
            .populate('items.product', 'name images category') // Populate product info in items
            .sort({ createdAt: -1 }); // Sort by newest first
        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    createOrder,
    getMyOrders,
    getOrders,
    getOrderById
};
