const express = require('express');
const router = express.Router();
const {
  getAllProgress, getProgress, updateProgress,
  addBookmark, deleteBookmark, toggleComplete, addHighlight,
} = require('../controllers/progressController');
const { protect } = require('../middleware/authMiddleware');

router.route('/').get(protect, getAllProgress);

router.route('/:bookId')
  .get(protect, getProgress)
  .put(protect, updateProgress);

router.route('/:bookId/bookmarks')
  .post(protect, addBookmark);

router.route('/:bookId/bookmarks/:bookmarkId')
  .delete(protect, deleteBookmark);

router.route('/:bookId/complete')
  .put(protect, toggleComplete);

router.route('/:bookId/highlights')
  .post(protect, addHighlight);

module.exports = router;
