const express = require('express');
const router = express.Router();
const { uploadBook, getBooks, getBookById, uploadPDF, deleteBook } = require('../controllers/bookController');
const { protect } = require('../middleware/authMiddleware');

router.route('/')
  .post(protect, uploadPDF, uploadBook)
  .get(protect, getBooks);

router.route('/:id')
  .get(protect, getBookById)
  .delete(protect, deleteBook);

module.exports = router;
