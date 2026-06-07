const Journal = require('../models/Journal');

// @desc    Get all journal entries for the user
// @route   GET /api/journal
// @access  Private
exports.getEntries = async (req, res) => {
  try {
    const entries = await Journal.find({ userId: req.user._id }).sort({ createdAt: -1 });
    res.status(200).json(entries);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a new journal entry
// @route   POST /api/journal
// @access  Private
exports.createEntry = async (req, res) => {
  try {
    const { title, content, mood, tags, bookId, bookTitle } = req.body;

    const entry = await Journal.create({
      userId: req.user._id,
      title,
      content,
      mood: mood || '',
      tags: tags || [],
      bookId: bookId || null,
      bookTitle: bookTitle || '',
    });

    res.status(201).json(entry);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update a journal entry
// @route   PUT /api/journal/:id
// @access  Private
exports.updateEntry = async (req, res) => {
  try {
    const entry = await Journal.findById(req.params.id);

    if (!entry || entry.userId.toString() !== req.user._id.toString()) {
      return res.status(404).json({ message: 'Entry not found' });
    }

    const { title, content, mood, tags, bookTitle } = req.body;
    entry.title = title ?? entry.title;
    entry.content = content ?? entry.content;
    entry.mood = mood ?? entry.mood;
    entry.tags = tags ?? entry.tags;
    entry.bookTitle = bookTitle ?? entry.bookTitle;

    await entry.save();
    res.status(200).json(entry);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a journal entry
// @route   DELETE /api/journal/:id
// @access  Private
exports.deleteEntry = async (req, res) => {
  try {
    const entry = await Journal.findById(req.params.id);

    if (!entry || entry.userId.toString() !== req.user._id.toString()) {
      return res.status(404).json({ message: 'Entry not found' });
    }

    await entry.deleteOne();
    res.status(200).json({ message: 'Entry deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
