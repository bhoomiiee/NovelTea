const Book = require('../models/Book');
const path = require('path');
const fs = require('fs');
const multer = require('multer');

// Ensure uploads directory exists (critical on Render where it may not persist)
const UPLOADS_DIR = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

// Configure Multer storage
const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, UPLOADS_DIR);
  },
  filename(req, file, cb) {
    cb(null, `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50 MB
  fileFilter(req, file, cb) {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDFs are allowed'));
    }
  },
});

// Middleware — wrap multer for Express 5 compatibility
exports.uploadPDF = (req, res, next) => {
  upload.single('pdf')(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      return res.status(400).json({ message: `Upload error: ${err.message}` });
    }
    if (err) {
      return res.status(400).json({ message: err.message });
    }
    next();
  });
};

// @desc    Upload a new book
// @route   POST /api/books
// @access  Private
exports.uploadBook = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Please upload a PDF file' });
    }

    const { title, author, genre } = req.body;

    // Normalize path for both Windows (local) and Linux (Render)
    const fileUrl = '/uploads/' + path.basename(req.file.path);

    const book = await Book.create({
      title: title || req.file.originalname,
      author,
      genre,
      fileUrl,
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
