const Book = require('../models/Book');
const path = require('path');
const multer = require('multer');

// Configure Multer storage
const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, 'uploads/'); // Save files to 'uploads' directory
  },
  filename(req, file, cb) {
    cb(
      null,
      `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`
    );
  },
});

// Init upload
const upload = multer({
  storage,
  fileFilter: function (req, file, cb) {
    // Only accept PDFs
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDFs are allowed'));
    }
  },
});

// Middleware to use in routes
exports.uploadPDF = upload.single('pdf');

// @desc    Upload a new book
// @route   POST /api/books
// @access  Private
exports.uploadBook = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Please upload a PDF file' });
    }

    const { title, author, genre } = req.body;

    const book = await Book.create({
      title: title || req.file.originalname,
      author,
      genre,
      fileUrl: `/${req.file.path.replace(/\\/g, '/')}`, // Normalize path for windows
      uploadedBy: req.user._id,
    });

    res.status(201).json(book);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all books for logged in user
// @route   GET /api/books
// @access  Private
exports.getBooks = async (req, res) => {
  try {
    const books = await Book.find({ uploadedBy: req.user._id }).sort({ createdAt: -1 });
    res.status(200).json(books);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get a specific book by ID
// @route   GET /api/books/:id
// @access  Private
exports.getBookById = async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) return res.status(404).json({ message: 'Book not found' });
    if (book.uploadedBy.toString() !== req.user._id.toString())
      return res.status(401).json({ message: 'Not authorized to access this book' });
    res.status(200).json(book);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a book
// @route   DELETE /api/books/:id
// @access  Private
exports.deleteBook = async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) return res.status(404).json({ message: 'Book not found' });
    if (book.uploadedBy.toString() !== req.user._id.toString())
      return res.status(403).json({ message: 'Not authorized' });
    await book.deleteOne();
    res.status(200).json({ message: 'Book removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
