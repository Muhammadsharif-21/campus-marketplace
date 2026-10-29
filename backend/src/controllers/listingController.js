const Listing = require('../models/Listing');
const Notification = require('../models/Notification');
const Message = require('../models/Message');
const cloudinary = require('../config/cloudinary');

const createListing = async (req, res) => {
  try {
    const { title, description, category, price, condition, spotName, lat, lng } = req.body;

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
      price: Number(price) || 0,
      condition: condition || 'Used - Good',
      image: imageUrl,
      postedBy: req.user._id,
      meetupLocation: {
        spotName: spotName || 'Campus Central',
        lat: lat ? Number(lat) : 0,
        lng: lng ? Number(lng) : 0,
      },
    });

    res.status(201).json(listing);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

const getListings = async (req, res) => {
  try {
    const { category, search, minPrice, maxPrice, condition, sortBy } = req.query;

    const filter = { status: 'active' };

    if (category && category !== 'all') {
      filter.category = category;
    }

    if (search) {
      filter.title = { $regex: search, $options: 'i' };
    }

    if (condition && condition !== 'all') {
      filter.condition = condition;
    }

    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }

    let query = Listing.find(filter)
      .populate('postedBy', 'name email phone ratings')
      .populate('interestedUsers', 'name email');

    if (sortBy === 'price_asc') {
      query = query.sort({ price: 1 });
    } else if (sortBy === 'price_desc') {
      query = query.sort({ price: -1 });
    } else if (sortBy === 'most_interested') {
      // Sort in JS or by createdAt default, we'll handle sorting after fetch or simple sort
      query = query.sort({ createdAt: -1 });
    } else {
      // Default: newest
      query = query.sort({ createdAt: -1 });
    }

    let listings = await query.exec();

    if (sortBy === 'most_interested') {
      listings = listings.sort((a, b) => (b.interestedUsers?.length || 0) - (a.interestedUsers?.length || 0));
    }

    res.status(200).json(listings);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

const getMyListings = async (req, res) => {
  try {
    const listings = await Listing.find({ postedBy: req.user._id })
      .populate('postedBy', 'name email phone ratings')
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
      listing.interestedUsers.splice(index, 1);
    } else {
      listing.interestedUsers.push(req.user._id);
      isInterested = true;

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
      .populate('postedBy', 'name email phone ratings')
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

const makeOffer = async (req, res) => {
  try {
    const { amount } = req.body;
    if (!amount || Number(amount) <= 0) {
      return res.status(400).json({ message: 'Valid offer amount is required' });
    }

    const listing = await Listing.findById(req.params.id).populate('postedBy', 'name email');
    if (!listing) {
      return res.status(404).json({ message: 'Listing not found' });
    }

    if (listing.postedBy._id.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: 'Cannot make an offer on your own listing' });
    }

    const newOffer = {
      buyer: req.user._id,
      amount: Number(amount),
      status: 'pending',
    };

    listing.offers.push(newOffer);
    await listing.save();

    // Create a message entry in chat
    const offerMsg = await Message.create({
      listing: listing._id,
      sender: req.user._id,
      receiver: listing.postedBy._id,
      text: `💰 Submitted an offer of Rs ${amount} for "${listing.title}".`,
    });

    // Notify author
    await Notification.create({
      recipient: listing.postedBy._id,
      sender: req.user._id,
      listing: listing._id,
      type: 'message',
      message: `${req.user.name} offered Rs ${amount} for your listing "${listing.title}".`,
    });

    res.status(201).json({ message: 'Offer submitted successfully', listing, offerMessage: offerMsg });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

const respondOffer = async (req, res) => {
  try {
    const { offerId, status } = req.body; // status: 'accepted' | 'declined'
    if (!['accepted', 'declined'].includes(status)) {
      return res.status(400).json({ message: 'Invalid offer status' });
    }

    const listing = await Listing.findById(req.params.id);
    if (!listing) {
      return res.status(404).json({ message: 'Listing not found' });
    }

    if (listing.postedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Only seller can respond to offers' });
    }

    const offer = listing.offers.id(offerId);
    if (!offer) {
      return res.status(404).json({ message: 'Offer not found' });
    }

    offer.status = status;
    await listing.save();

    // Send chat response
    await Message.create({
      listing: listing._id,
      sender: req.user._id,
      receiver: offer.buyer,
      text: `${status === 'accepted' ? '✅ Accepted' : '❌ Declined'} the offer of Rs ${offer.amount}.`,
    });

    // Notify buyer
    await Notification.create({
      recipient: offer.buyer,
      sender: req.user._id,
      listing: listing._id,
      type: 'message',
      message: `Seller ${status} your offer of Rs ${offer.amount} for "${listing.title}".`,
    });

    res.status(200).json({ message: `Offer ${status}`, listing });
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

    const { title, description, category, condition, price, image, status, spotName, lat, lng } = req.body;

    const updated = await Listing.findByIdAndUpdate(
      req.params.id,
      {
        title,
        description,
        category,
        condition,
        price,
        image,
        status,
        meetupLocation: {
          spotName: spotName || listing.meetupLocation?.spotName || 'Campus Central',
          lat: lat ? Number(lat) : (listing.meetupLocation?.lat || 0),
          lng: lng ? Number(lng) : (listing.meetupLocation?.lng || 0),
        }
      },
      { new: true, runValidators: true }
    ).populate('postedBy', 'name email phone ratings');

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
  makeOffer,
  respondOffer,
  updateListing,
  deleteListing,
};
