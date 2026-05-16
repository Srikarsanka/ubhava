const express = require('express');
const router = express.Router();
const { getAddresses, saveAddress, deleteAddress } = require('../controllers/addressController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.route('/')
    .get(getAddresses)
    .post(saveAddress);

router.delete('/:id', deleteAddress);

module.exports = router;
