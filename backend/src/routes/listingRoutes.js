const express = require('express');
const router = express.Router();
const { createListing, getListings } = require('../controllers/listingController');
const protect = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

router.get('/', getListings);
router.post('/', protect, upload.single('image'), createListing);

module.exports = router;
