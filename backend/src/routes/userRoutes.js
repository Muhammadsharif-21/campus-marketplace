const express = require('express');
const router = express.Router();
const { toggleFavorite, getFavorites, addRating } = require('../controllers/userController');
const protect = require('../middleware/authMiddleware');

router.get('/favorites', protect, getFavorites);
router.post('/favorites', protect, toggleFavorite);
router.post('/:userId/rate', protect, addRating);

module.exports = router;
