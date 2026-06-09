const express = require('express');
const router = express.Router();
const { uploadBook, getBooks, getBookById, uploadPDF, deleteBook, registerBook } = require('../controllers/bookController');
const { getUploadSignature } = require('../controllers/uploadSignatureController');
const { protect } = require('../middleware/authMiddleware');

router.route('/')
  .post(protect, uploadPDF, uploadBook)
  .get(protect, getBooks);

// Signed upload signature — browser uses this to upload directly to Cloudinary
router.get('/upload-signature', protect, getUploadSignature);

// Register book after direct Cloudinary upload
router.post('/register', protect, registerBook);

router.route('/:id')
  .get(protect, getBookById)
  .delete(protect, deleteBook);

module.exports = router;
