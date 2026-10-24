const Listing = require('../models/Listing');
const cloudinary = require('../config/cloudinary')


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
      .populate('postedBy', 'name email')
      .sort({ createdAt: -1 });

    res.status(200).json(listings);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

module.exports = { createListing, getListings };