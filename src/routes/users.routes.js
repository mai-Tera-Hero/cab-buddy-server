const express = require('express');
const router = express.Router();
const User = require('../models/users.model'); // your model

// POST /users/create
router.post('/create', async (req, res) => {
  try {
    const { name, email, phone } = req.body;

    // Simple validation
    if (!name || !email || !phone) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'User with this email already exists' });
    }

    // Create new user
    const user = new User({ name, email, phone });
    await user.save();

    res.status(201).json({ message: 'User created successfully', user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
