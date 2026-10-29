const mongoose = require('mongoose');

const offerSchema = new mongoose.Schema({
  buyer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'declined'],
    default: 'pending',
  },
}, { timestamps: true });

const listingSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    enum: ['for-sale', 'free', 'lost', 'found'],
    required: true,
  },
  condition: {
    type: String,
    enum: ['Brand New', 'Like New', 'Used - Good', 'Used - Fair'],
    default: 'Used - Good',
  },
  price: {
    type: Number,
    default: 0,
  },
  image: {
    type: String,
  },
  status: {
    type: String,
    enum: ['active', 'resolved'],
    default: 'active',
  },
  postedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  meetupLocation: {
    spotName: { type: String, default: 'Campus Central' },
    lat: { type: Number, default: 0 },
    lng: { type: Number, default: 0 },
  },
  interestedUsers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }],
  offers: [offerSchema],
}, { timestamps: true });

const Listing = mongoose.model('Listing', listingSchema);
module.exports = Listing;
