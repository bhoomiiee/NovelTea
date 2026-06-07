const mongoose = require('mongoose');

const journalEntrySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    bookId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Book',
      default: null,
    },
    bookTitle: {
      type: String,
      default: '',
    },
    title: {
      type: String,
      required: [true, 'Entry title is required'],
      trim: true,
    },
    content: {
      type: String,
      required: [true, 'Entry content is required'],
    },
    mood: {
      type: String,
      enum: ['Happy', 'Motivated', 'Lonely', 'Curious', 'Productive', 'Relaxed', 'Frustrated', 'Inspired', ''],
      default: '',
    },
    tags: [String],
  },
  { timestamps: true }
);

module.exports = mongoose.model('Journal', journalEntrySchema);
