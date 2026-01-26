const express = require('express');
const router = express.Router();
const Contact = require('../models/Contact');

// @desc    Submit Contact Form
// @route   POST /api/contact
// @access  Public
router.post('/', async (req, res) => {
    try {
        const { name, email, message } = req.body;

        if (!name || !email || !message) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        // 1. Save to Database
        const newContact = new Contact({
            name,
            email,
            message
        });
        await newContact.save();

        res.status(201).json({ message: 'Message saved!' });
    } catch (error) {
        console.error("Contact Error:", error);
        res.status(500).json({ message: 'Server Error' });
    }
});

module.exports = router;
