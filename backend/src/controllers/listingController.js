const Listing = require('../models/Listing');

const createListing = async (req, res) => {
  try {
    const { title, description, category, price, image } = req.body;

    const listing = await Listing.create({
      title,
      description,
      category,
      price,
      image,
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
    const listings = await Listing.find({ status: 'active' })
      .populate('postedBy', 'name email')
      .sort({ createdAt: -1 });

    res.status(200).json(listings);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

module.exports = { createListing, getListings };