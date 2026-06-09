const express = require('express');
const router = express.Router();
const { uploadBook, getBooks, getBookById, uploadPDF, deleteBook, registerBook } = require('../controllers/bookController');
const { protect } = require('../middleware/authMiddleware');

router.route('/')
  .post(protect, uploadPDF, uploadBook)
  .get(protect, getBooks);

// Fast path — browser uploads directly to Cloudinary, sends URL here
router.post('/register', protect, registerBook);

router.route('/:id')
  .get(protect, getBookById)
  .delete(protect, deleteBook);

module.exports = router;
