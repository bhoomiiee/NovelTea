const mongoose = require('mongoose');

const vocabularySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    word: {
      type: String,
      required: [true, 'Word is required'],
      trim: true,
    },
    meaning: {
      type: String,
      required: [true, 'Meaning is required'],
    },
    synonyms: [String],
    example: {
      type: String,
      default: '',
    },
    context: {
      type: String, // sentence from book where word appeared
      default: '',
    },
    bookId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Book',
      default: null,
    },
    mastered: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Vocabulary', vocabularySchema);
