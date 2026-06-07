const express = require('express');
const router = express.Router();
const { getMoodRecommendations } = require('../controllers/moodController');
const { protect } = require('../middleware/authMiddleware');

router.post('/recommend', protect, getMoodRecommendations);

module.exports = router;
