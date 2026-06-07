const express = require('express');
const router = express.Router();
const {
  getVocabulary,
  addWord,
  toggleMastered,
  deleteWord,
} = require('../controllers/vocabularyController');
const { protect } = require('../middleware/authMiddleware');

router.route('/').get(protect, getVocabulary).post(protect, addWord);
router.route('/:id/mastered').put(protect, toggleMastered);
router.route('/:id').delete(protect, deleteWord);

module.exports = router;
