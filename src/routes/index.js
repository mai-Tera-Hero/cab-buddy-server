const express = require('express');
const router = express.Router();

// Import your user routes
const userRoutes = require('./users.routes');

// Health check route
router.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Mount user routes
router.use('/users', userRoutes);

module.exports = router;
