const Post = require('../models/Post');
const Exchange = require('../models/Exchange');

// ─── POSTS ─────────────────────────────────────────────────────────────────

// @desc  Get all posts (newest first)
// @route GET /api/community/posts
exports.getPosts = async (req, res) => {
  try {
    const posts = await Post.find().sort({ createdAt: -1 }).limit(50);
    res.json(posts);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

// @desc  Create a post
// @route POST /api/community/posts
exports.createPost = async (req, res) => {
  try {
    const { type, content, bookTitle, rating } = req.body;
    const post = await Post.create({
      userId: req.user._id,
      userName: req.user.name,
      type: type || 'thought',
      content,
      bookTitle: bookTitle || '',
      rating: rating || null,
    });
    res.status(201).json(post);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

// @desc  Delete own post
// @route DELETE /api/community/posts/:id
exports.deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });
    if (post.userId.toString() !== req.user._id.toString())
      return res.status(403).json({ message: 'Not authorized' });
    await post.deleteOne();
    res.json({ message: 'Deleted' });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

// @desc  Toggle like on a post
// @route PUT /api/community/posts/:id/like
exports.toggleLike = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });
    const uid = req.user._id.toString();
    const idx = post.likes.map(String).indexOf(uid);
    if (idx === -1) post.likes.push(req.user._id);
    else post.likes.splice(idx, 1);
    await post.save();
    res.json({ likes: post.likes.length, liked: idx === -1 });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

// @desc  Add a comment
// @route POST /api/community/posts/:id/comments
exports.addComment = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });
    post.comments.push({ userId: req.user._id, userName: req.user.name, text: req.body.text });
    await post.save();
    res.status(201).json(post.comments);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

// ─── EXCHANGE ───────────────────────────────────────────────────────────────

// @desc  Get all exchange listings
// @route GET /api/community/exchange
exports.getExchange = async (req, res) => {
  try {
    const listings = await Exchange.find({ isAvailable: true }).sort({ createdAt: -1 });
    res.json(listings);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

// @desc  List a book for exchange
// @route POST /api/community/exchange
exports.createListing = async (req, res) => {
  try {
    const { title, author, genre, condition, location, description } = req.body;
    const listing = await Exchange.create({
      userId: req.user._id,
      userName: req.user.name,
      title,
      author: author || '',
      genre: genre || 'General',
      condition: condition || 'Good',
      location: location || '',
      description: description || '',
    });
    res.status(201).json(listing);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

// @desc  Mark listing as unavailable (remove)
// @route DELETE /api/community/exchange/:id
exports.deleteListing = async (req, res) => {
  try {
    const listing = await Exchange.findById(req.params.id);
    if (!listing) return res.status(404).json({ message: 'Listing not found' });
    if (listing.userId.toString() !== req.user._id.toString())
      return res.status(403).json({ message: 'Not authorized' });
    await listing.deleteOne();
    res.json({ message: 'Listing removed' });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};
