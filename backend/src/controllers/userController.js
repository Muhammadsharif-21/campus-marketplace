const User = require('../models/User');

const toggleFavorite = async (req, res) => {
  try {
    const { listingId } = req.body;
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const index = user.favorites.findIndex(id => id.toString() === listingId.toString());
    let isFavorite = false;

    if (index > -1) {
      user.favorites.splice(index, 1);
    } else {
      user.favorites.push(listingId);
      isFavorite = true;
    }

    await user.save();
    res.status(200).json({
      message: isFavorite ? 'Added to favorites' : 'Removed from favorites',
      favorites: user.favorites,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

const getFavorites = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate({
      path: 'favorites',
      populate: { path: 'postedBy', select: 'name email phone ratings' },
    });

    res.status(200).json(user.favorites || []);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

const addRating = async (req, res) => {
  try {
    const { userId } = req.params;
    const { rating, comment } = req.body;

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ message: 'Rating must be between 1 and 5' });
    }

    if (userId.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: 'Cannot rate yourself' });
    }

    const targetUser = await User.findById(userId);
    if (!targetUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Replace previous rating by same reviewer if exists
    const existingIndex = targetUser.ratings.findIndex(
      r => r.reviewer.toString() === req.user._id.toString()
    );

    if (existingIndex > -1) {
      targetUser.ratings[existingIndex] = {
        reviewer: req.user._id,
        rating: Number(rating),
        comment: comment || '',
      };
    } else {
      targetUser.ratings.push({
        reviewer: req.user._id,
        rating: Number(rating),
        comment: comment || '',
      });
    }

    await targetUser.save();
    res.status(200).json({ message: 'Rating submitted', ratings: targetUser.ratings });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

module.exports = { toggleFavorite, getFavorites, addRating };
