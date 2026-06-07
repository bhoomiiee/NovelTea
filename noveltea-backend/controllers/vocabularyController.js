const Vocabulary = require('../models/Vocabulary');

// @desc    Get all vocabulary words for a user
// @route   GET /api/vocabulary
// @access  Private
exports.getVocabulary = async (req, res) => {
  try {
    const words = await Vocabulary.find({ userId: req.user._id })
      .sort({ createdAt: -1 });
    res.status(200).json(words);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Add a new word to vault
// @route   POST /api/vocabulary
// @access  Private
exports.addWord = async (req, res) => {
  try {
    const { word, meaning, synonyms, example, context, bookId } = req.body;

    const wordExists = await Vocabulary.findOne({
      userId: req.user._id,
      word: word.toLowerCase().trim(),
    });

    if (wordExists) {
      return res.status(400).json({ message: 'Word already in your vault!' });
    }

    const vocab = await Vocabulary.create({
      userId: req.user._id,
      word: word.toLowerCase().trim(),
      meaning,
      synonyms: synonyms || [],
      example: example || '',
      context: context || '',
      bookId: bookId || null,
    });

    res.status(201).json(vocab);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Toggle mastered status
// @route   PUT /api/vocabulary/:id/mastered
// @access  Private
exports.toggleMastered = async (req, res) => {
  try {
    const word = await Vocabulary.findById(req.params.id);

    if (!word || word.userId.toString() !== req.user._id.toString()) {
      return res.status(404).json({ message: 'Word not found' });
    }

    word.mastered = !word.mastered;
    await word.save();

    res.status(200).json(word);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a word from vault
// @route   DELETE /api/vocabulary/:id
// @access  Private
exports.deleteWord = async (req, res) => {
  try {
    const word = await Vocabulary.findById(req.params.id);

    if (!word || word.userId.toString() !== req.user._id.toString()) {
      return res.status(404).json({ message: 'Word not found' });
    }

    await word.deleteOne();
    res.status(200).json({ message: 'Word removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
