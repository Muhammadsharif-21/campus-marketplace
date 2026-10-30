const Notification = require('../models/Notification');

const getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ recipient: req.user._id })
      .populate('sender', 'name email')
      .populate('listing', 'title category price postedBy')
      .sort({ createdAt: -1 });

    res.status(200).json(notifications);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

const markAsRead = async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);
    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    if (notification.recipient.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    notification.read = true;
    await notification.save();

    res.status(200).json(notification);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

const markAllAsRead = async (req, res) => {
  try {
    await Notification.updateMany({ recipient: req.user._id, read: false }, { read: true });
    res.status(200).json({ message: 'All notifications marked as read' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

module.exports = { getNotifications, markAsRead, markAllAsRead };
