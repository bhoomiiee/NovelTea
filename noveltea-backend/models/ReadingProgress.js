const mongoose = require('mongoose');

const readingProgressSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    bookId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Book',
      required: true,
    },
    currentPage: {
      type: Number,
      default: 1,
    },
    totalPages: {
      type: Number,
      default: 0,
    },
    bookmarks: [
      {
        page: Number,
        note: String,
        createdAt: { type: Date, default: Date.now },
      },
    ],
    highlights: [
      {
        page: Number,
        text: String,
        category: { type: String, default: 'General' },
        createdAt: { type: Date, default: Date.now },
      },
    ],
    lastReadAt: {
      type: Date,
      default: Date.now,
    },
    isCompleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Ensure one progress record per user per book
readingProgressSchema.index({ userId: 1, bookId: 1 }, { unique: true });

module.exports = mongoose.model('ReadingProgress', readingProgressSchema);
