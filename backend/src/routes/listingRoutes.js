const express = require('express');
const router = express.Router();
const { createListing, getListings } = require('../controllers/listingController');
const protect = require('../middleware/authMiddleware');

router.get('/', getListings);
router.post('/', protect, createListing);

module.exports = router;
