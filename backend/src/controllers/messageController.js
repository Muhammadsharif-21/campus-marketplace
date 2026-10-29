const Message = require('../models/Message');
const Listing = require('../models/Listing');
const Notification = require('../models/Notification');

const sendMessage = async (req, res) => {
  try {
    const { listingId } = req.params;
    const { text, receiverId } = req.body;

    if (!text || !text.trim()) {
      return res.status(400).json({ message: 'Message text is required' });
    }

    const listing = await Listing.findById(listingId);
    if (!listing) {
      return res.status(404).json({ message: 'Listing not found' });
    }

    // Determine receiver: if receiverId is provided use that, otherwise if sender is not the author, receiver is author
    let finalReceiverId = receiverId;
    if (!finalReceiverId) {
      if (listing.postedBy.toString() === req.user._id.toString()) {
        return res.status(400).json({ message: 'Receiver ID is required when seller is sending message' });
      } else {
        finalReceiverId = listing.postedBy;
      }
    }

    const message = await Message.create({
      listing: listingId,
      sender: req.user._id,
      receiver: finalReceiverId,
      text: text.trim(),
    });

    const populatedMsg = await Message.findById(message._id)
      .populate('sender', 'name email')
      .populate('receiver', 'name email');

    // Create notification for receiver
    await Notification.create({
      recipient: finalReceiverId,
      sender: req.user._id,
      listing: listingId,
      type: 'message',
      message: `${req.user.name} sent you a message regarding "${listing.title}".`,
    });

    res.status(201).json(populatedMsg);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

const getMessagesForListing = async (req, res) => {
  try {
    const { listingId } = req.params;
    const userId = req.user._id;

    const messages = await Message.find({
      listing: listingId,
      $or: [{ sender: userId }, { receiver: userId }],
    })
      .populate('sender', 'name email')
      .populate('receiver', 'name email')
      .sort({ createdAt: 1 });

    res.status(200).json(messages);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

const getConversations = async (req, res) => {
  try {
    const userId = req.user._id;

    const messages = await Message.find({
      $or: [{ sender: userId }, { receiver: userId }],
    })
      .populate('listing', 'title image category price')
      .populate('sender', 'name email')
      .populate('receiver', 'name email')
      .sort({ createdAt: -1 });

    res.status(200).json(messages);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

module.exports = { sendMessage, getMessagesForListing, getConversations };
