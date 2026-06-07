const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please add a book title'],
    },
    author: {
      type: String,
      default: 'Unknown Author',
    },
    coverImage: {
      type: String,
      default: '',
    },
    fileUrl: {
      type: String,
      required: [true, 'Please provide the file URL'],
    },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    genre: {
      type: String,
      default: 'General',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Book', bookSchema);
