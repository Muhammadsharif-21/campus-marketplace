const express = require('express');
const router = express.Router();
const { createListing, getListings, getMyListings, updateListing, deleteListing } = require('../controllers/listingController');
const protect = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');




router.get('/', getListings);
router.get('/mine', protect, getMyListings);
router.post('/', protect, upload.single('image'), createListing);
router.patch('/:id', protect, updateListing);
router.delete('/:id', protect, deleteListing);

module.exports = router;
