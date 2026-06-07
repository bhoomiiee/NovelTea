const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');

// Load env vars
dotenv.config();

// Connect to database
connectDB();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

const authRoutes = require('./routes/authRoutes');
const bookRoutes = require('./routes/bookRoutes');
const progressRoutes = require('./routes/progressRoutes');
const vocabularyRoutes = require('./routes/vocabularyRoutes');
const journalRoutes = require('./routes/journalRoutes');
const communityRoutes = require('./routes/communityRoutes');
const moodRoutes = require('./routes/moodRoutes');
const path = require('path');

// Basic Route
app.get('/', (req, res) => {
  res.send('NovelTea API is running...');
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/books', bookRoutes);
app.use('/api/progress', progressRoutes);
app.use('/api/vocabulary', vocabularyRoutes);
app.use('/api/journal', journalRoutes);
app.use('/api/community', communityRoutes);
app.use('/api/mood', moodRoutes);

// Make uploads folder static
app.use('/uploads', express.static(path.join(__dirname, '/uploads')));

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
