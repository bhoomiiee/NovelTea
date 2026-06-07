const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please add a name'],
    },
    email: {
      type: String,
      required: [true, 'Please add an email'],
      unique: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        'Please add a valid email',
      ],
    },
    password: {
      type: String,
      required: [true, 'Please add a password'],
      minlength: 6,
      select: false, // Do not return password by default
    },
    profilePic: {
      type: String,
      default: '',
    },
    avatarColor: {
      type: String,
      default: '#8B5E3C',
    },
    readingGoals: {
      yearly: { type: Number, default: 12 },
      monthly: { type: Number, default: 1 },
      dailyPages: { type: Number, default: 20 },
    },
    streaks: {
      current: { type: Number, default: 0 },
      longest: { type: Number, default: 0 },
      lastReadDate: { type: Date, default: null },
    },
    badges: [
      {
        type: String,
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Encrypt password using bcrypt
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    next();
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Match user entered password to hashed password in database
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
