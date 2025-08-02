const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const authMiddleware = require('../middleware/auth');

// Register route
router.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Check if user exists
    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ msg: 'User already exists' });

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    user = new User({
      username,
      email,
      password: hashedPassword,
    });

    await user.save();

    // Create JWT token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1d' });

    res.json({ token, user: { id: user._id, username: user.username, email: user.email } });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Login route
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check for user
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ msg: 'Invalid credentials' });

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ msg: 'Invalid credentials' });

    // Create JWT token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1d' });

    res.json({ token, user: { id: user._id, username: user.username, email: user.email } });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Protected profile route
router.get('/profile', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

module.exports = router;
