const Address = require('../models/Address');

// @desc    Get user addresses
// @route   GET /api/address
// @access  Private
const getAddresses = async (req, res) => {
    try {
        const addresses = await Address.find({ user: req.user._id });
        res.json(addresses);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Add or Update address
// @route   POST /api/address
// @access  Private
const saveAddress = async (req, res) => {
    const { fullName, phone, street, city, state, pincode } = req.body;

    try {
        // For simplicity, we'll update the first one or create new
        let address = await Address.findOne({ user: req.user._id });
        
        if (address) {
            address.fullName = fullName || address.fullName;
            address.phone = phone || address.phone;
            address.street = street || address.street;
            address.city = city || address.city;
            address.state = state || address.state;
            address.pincode = pincode || address.pincode;
            await address.save();
            res.json(address);
        } else {
            address = await Address.create({
                user: req.user._id,
                fullName,
                phone,
                street,
                city,
                state,
                pincode,
                isDefault: true
            });
            res.status(201).json(address);
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete address
// @route   DELETE /api/address/:id
// @access  Private
const deleteAddress = async (req, res) => {
    try {
        const address = await Address.findById(req.params.id);
        if (address && address.user.toString() === req.user._id.toString()) {
            await address.remove();
            res.json({ message: 'Address removed' });
        } else {
            res.status(404).json({ message: 'Address not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getAddresses,
    saveAddress,
    deleteAddress
};
