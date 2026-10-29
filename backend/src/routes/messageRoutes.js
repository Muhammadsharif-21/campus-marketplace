const express = require('express');
const router = express.Router();
const { sendMessage, getMessagesForListing, getConversations } = require('../controllers/messageController');
const protect = require('../middleware/authMiddleware');

router.get('/conversations', protect, getConversations);
router.get('/:listingId', protect, getMessagesForListing);
router.post('/:listingId', protect, sendMessage);

module.exports = router;
