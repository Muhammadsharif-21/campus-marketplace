const mongoose = require('mongoose');

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
}, { timestamps: true });

const Listing = mongoose.model('Listing', listingSchema);
module.exports = Listing;