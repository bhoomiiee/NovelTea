const express = require('express');
const router = express.Router();
const { registerUser, loginUser, getMe, updateGoals, awardBadge, updateProfile, changePassword } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/me', protect, getMe);
router.put('/goals', protect, updateGoals);
router.post('/badge', protect, awardBadge);
router.put('/profile', protect, updateProfile);
router.put('/password', protect, changePassword);

module.exports = router;
