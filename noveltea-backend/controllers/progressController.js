const ReadingProgress = require('../models/ReadingProgress');
const User = require('../models/User');

// Helper: update streak for a user
const updateStreak = async (userId) => {
  try {
    const user = await User.findById(userId);
    if (!user) return;

    const now = new Date();
    const last = user.streaks?.lastReadDate ? new Date(user.streaks.lastReadDate) : null;

    const todayStr = now.toDateString();
    const lastStr = last ? last.toDateString() : null;

    if (lastStr === todayStr) {
      // Already read today, no change
      return;
    }

    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toDateString();

    let newCurrent = 1;
    if (lastStr === yesterdayStr) {
      // Consecutive day
      newCurrent = (user.streaks?.current || 0) + 1;
    }

    const newLongest = Math.max(user.streaks?.longest || 0, newCurrent);

    await User.findByIdAndUpdate(userId, {
      'streaks.current': newCurrent,
      'streaks.longest': newLongest,
      'streaks.lastReadDate': now,
    });
  } catch (err) {
    console.error('Streak update failed:', err.message);
  }
};

// @desc    Get all reading progress records for the user
// @route   GET /api/progress
// @access  Private
exports.getAllProgress = async (req, res) => {
  try {
    const progresses = await ReadingProgress.find({ userId: req.user._id });
    res.status(200).json(progresses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get reading progress for a book
// @route   GET /api/progress/:bookId
// @access  Private
exports.getProgress = async (req, res) => {
  try {
    let progress = await ReadingProgress.findOne({
      userId: req.user._id,
      bookId: req.params.bookId,
    });

    if (!progress) {
      // Auto-create a progress document on first access
      progress = await ReadingProgress.create({
        userId: req.user._id,
        bookId: req.params.bookId,
      });
    }

    res.status(200).json(progress);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update reading progress (page number, completion)
// @route   PUT /api/progress/:bookId
// @access  Private
exports.updateProgress = async (req, res) => {
  try {
    const { currentPage, totalPages, isCompleted } = req.body;

    const autoCompleted = totalPages > 0 && currentPage >= totalPages;

    const progress = await ReadingProgress.findOneAndUpdate(
      { userId: req.user._id, bookId: req.params.bookId },
      {
        currentPage,
        totalPages,
        isCompleted: isCompleted || autoCompleted,
        lastReadAt: Date.now(),
      },
      { new: true, upsert: true }
    );

    // Update streak on every progress save
    await updateStreak(req.user._id);

    res.status(200).json(progress);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Add a bookmark
// @route   POST /api/progress/:bookId/bookmarks
// @access  Private
exports.addBookmark = async (req, res) => {
  try {
    const { page, note } = req.body;

    const progress = await ReadingProgress.findOneAndUpdate(
      { userId: req.user._id, bookId: req.params.bookId },
      { $push: { bookmarks: { page, note } }, lastReadAt: Date.now() },
      { new: true, upsert: true }
    );

    res.status(201).json(progress.bookmarks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a bookmark
// @route   DELETE /api/progress/:bookId/bookmarks/:bookmarkId
// @access  Private
exports.deleteBookmark = async (req, res) => {
  try {
    const progress = await ReadingProgress.findOneAndUpdate(
      { userId: req.user._id, bookId: req.params.bookId },
      { $pull: { bookmarks: { _id: req.params.bookmarkId } } },
      { new: true }
    );
    if (!progress) return res.status(404).json({ message: 'Progress not found' });
    res.status(200).json(progress.bookmarks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Toggle book completion manually
// @route   PUT /api/progress/:bookId/complete
// @access  Private
exports.toggleComplete = async (req, res) => {
  try {
    const progress = await ReadingProgress.findOne({ userId: req.user._id, bookId: req.params.bookId });
    if (!progress) return res.status(404).json({ message: 'Progress not found' });
    progress.isCompleted = !progress.isCompleted;
    await progress.save();
    res.status(200).json(progress);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
// @route   POST /api/progress/:bookId/highlights
// @access  Private
exports.addHighlight = async (req, res) => {
  try {
    const { page, text, category } = req.body;

    const progress = await ReadingProgress.findOneAndUpdate(
      { userId: req.user._id, bookId: req.params.bookId },
      { $push: { highlights: { page, text, category } }, lastReadAt: Date.now() },
      { new: true, upsert: true }
    );

    res.status(201).json(progress.highlights);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
