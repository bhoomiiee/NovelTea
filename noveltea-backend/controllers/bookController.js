const Book = require('../models/Book');
const path = require('path');
const fs = require('fs');
const multer = require('multer');

// ── Cloudinary setup (used when env vars are present) ─────────────────────
let cloudinaryStorage = null;
let useCloudinary = false;

if (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET) {
  try {
    const cloudinary = require('cloudinary').v2;
    const { CloudinaryStorage } = require('multer-storage-cloudinary');

    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key:    process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });

    cloudinaryStorage = new CloudinaryStorage({
      cloudinary,
      params: {
        folder: 'noveltea-books',
        resource_type: 'raw',   // PDFs are raw files
        format: 'pdf',
        use_filename: true,
        unique_filename: true,
      },
    });

    useCloudinary = true;
    console.log('✓ Cloudinary storage enabled');
  } catch (e) {
    console.warn('Cloudinary init failed, falling back to disk:', e.message);
  }
}

// ── Disk storage fallback (local dev) ─────────────────────────────────────
const UPLOADS_DIR = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

const diskStorage = multer.diskStorage({
  destination(req, file, cb) { cb(null, UPLOADS_DIR); },
  filename(req, file, cb) {
    cb(null, `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`);
  },
});

// ── Multer instance ────────────────────────────────────────────────────────
const upload = multer({
  storage: useCloudinary ? cloudinaryStorage : diskStorage,
  limits: { fileSize: 50 * 1024 * 1024 },
  fileFilter(req, file, cb) {
    if (file.mimetype === 'application/pdf') cb(null, true);
    else cb(new Error('Only PDFs are allowed'));
  },
});

// Middleware — Express 5 compatible error handling
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

// ── Controllers ───────────────────────────────────────────────────────────

// @desc    Register a book with a pre-uploaded Cloudinary URL (fast path)
// @route   POST /api/books/register
// @access  Private
exports.registerBook = async (req, res) => {
  try {
    const { title, author, genre, fileUrl } = req.body;
    if (!fileUrl) return res.status(400).json({ message: 'fileUrl is required' });

    const book = await Book.create({
      title: title || 'Untitled',
      author: author || 'Unknown',
      genre: genre || 'General',
      fileUrl,
      uploadedBy: req.user._id,
    });

    res.status(201).json(book);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Upload a new book (legacy — file goes through backend)
// @route   POST /api/books
// @access  Private
exports.uploadBook = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Please upload a PDF file' });
    }

    const { title, author, genre } = req.body;

    // Cloudinary gives req.file.path as the full HTTPS URL
    // Disk storage gives a local file path
    let fileUrl;
    if (useCloudinary && req.file.path && req.file.path.startsWith('http')) {
      fileUrl = req.file.path; // full Cloudinary URL
    } else {
      fileUrl = '/uploads/' + path.basename(req.file.path);
    }

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
