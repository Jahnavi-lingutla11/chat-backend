const express = require('express');
const router = express.Router();
const Message = require('../models/Message');

// GET: Fetch all messages
router.get('/', async (req, res) => {
  try {
    const messages = await Message.find().sort({ createdAt: 1 });
    res.json(messages);
  } catch (err) {
    res.status(500).json({ msg: 'Error fetching messages' });
  }
});

// (Optional) POST: Create a message (if not using socket)
router.post('/', async (req, res) => {
  try {
    const { text, sender } = req.body;
    const newMsg = new Message({ text, sender });
    const saved = await newMsg.save();
    res.json(saved);
  } catch (err) {
    res.status(500).json({ msg: 'Error saving message' });
  }
});

module.exports = router;
