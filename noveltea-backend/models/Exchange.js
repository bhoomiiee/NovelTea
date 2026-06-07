const mongoose = require('mongoose');

const exchangeSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    userName: { type: String, required: true },
    title: { type: String, required: true },
    author: { type: String, default: '' },
    genre: { type: String, default: 'General' },
    condition: {
      type: String,
      enum: ['Like New', 'Good', 'Fair', 'Well Read'],
      default: 'Good',
    },
    location: { type: String, default: '' },
    description: { type: String, default: '' },
    isAvailable: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Exchange', exchangeSchema);
