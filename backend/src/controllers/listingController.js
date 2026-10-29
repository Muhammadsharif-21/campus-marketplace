const Listing = require('../models/Listing');
const Notification = require('../models/Notification');
const cloudinary = require('../config/cloudinary');

const createListing = async (req, res) => {
  try {
    const { title, description, category, price } = req.body;

    let imageUrl;

    if (req.file) {
      const base64 = req.file.buffer.toString('base64');
      const dataUri = `data:${req.file.mimetype};base64,${base64}`;

      const result = await cloudinary.uploader.upload(dataUri, {
        folder: 'campus-marketplace'
      });

      imageUrl = result.secure_url;
    }

    const listing = await Listing.create({
      title,
      description,
      category,
      price,
      image: imageUrl,
      postedBy: req.user._id,
    });

    res.status(201).json(listing);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

const getListings = async (req, res) => {
  try {
    const { category, search } = req.query;

    const filter = { status: 'active' };

    if (category) {
      filter.category = category;
    }

    if (search) {
      filter.title = { $regex: search, $options: 'i' };
    }

    const listings = await Listing.find(filter)
      .populate('postedBy', 'name email phone')
      .populate('interestedUsers', 'name email')
      .sort({ createdAt: -1 });

    res.status(200).json(listings);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

const getMyListings = async (req, res) => {
  try {
    const listings = await Listing.find({ postedBy: req.user._id })
      .populate('postedBy', 'name email phone')
      .populate('interestedUsers', 'name email phone')
      .sort({ createdAt: -1 });

    res.status(200).json(listings);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

const toggleInterest = async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id).populate('postedBy', 'name email');
    if (!listing) {
      return res.status(404).json({ message: 'Listing not found' });
    }

    const userId = req.user._id.toString();
    const index = listing.interestedUsers.findIndex(id => id.toString() === userId);

    let isInterested = false;
    if (index > -1) {
      // Remove interest
      listing.interestedUsers.splice(index, 1);
    } else {
      // Add interest
      listing.interestedUsers.push(req.user._id);
      isInterested = true;

      // Notify the listing author if the user is not the author themselves
      if (listing.postedBy._id.toString() !== userId) {
        await Notification.create({
          recipient: listing.postedBy._id,
          sender: req.user._id,
          listing: listing._id,
          type: 'interested',
          message: `${req.user.name} expressed interest in your listing "${listing.title}".`,
        });
      }
    }

    await listing.save();
    const updated = await Listing.findById(req.params.id)
      .populate('postedBy', 'name email phone')
      .populate('interestedUsers', 'name email');

    res.status(200).json({
      message: isInterested ? 'Expressed interest' : 'Removed interest',
      listing: updated
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

const updateListing = async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id);

    if (!listing) {
      return res.status(404).json({ message: 'Listing not found' });
    }

    if (listing.postedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not allowed to edit this listing' });
    }

    const { title, description, category, price, image, status } = req.body;

    const updated = await Listing.findByIdAndUpdate(
      req.params.id,
      { title, description, category, price, image, status },
      { new: true, runValidators: true }
    ).populate('postedBy', 'name email phone');

    res.status(200).json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

const deleteListing = async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id);

    if (!listing) {
      return res.status(404).json({ message: 'Listing not found' });
    }

    if (listing.postedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not allowed to delete this listing' });
    }

    await listing.deleteOne();

    res.status(200).json({ message: 'Listing deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  createListing,
  getListings,
  getMyListings,
  toggleInterest,
  updateListing,
  deleteListing,
};
