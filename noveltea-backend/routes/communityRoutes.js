const express = require('express');
const router = express.Router();
const {
  getPosts, createPost, deletePost, toggleLike, addComment,
  getExchange, createListing, deleteListing,
} = require('../controllers/communityController');
const { protect } = require('../middleware/authMiddleware');

// Posts
router.get('/posts', protect, getPosts);
router.post('/posts', protect, createPost);
router.delete('/posts/:id', protect, deletePost);
router.put('/posts/:id/like', protect, toggleLike);
router.post('/posts/:id/comments', protect, addComment);

// Exchange
router.get('/exchange', protect, getExchange);
router.post('/exchange', protect, createListing);
router.delete('/exchange/:id', protect, deleteListing);

module.exports = router;
