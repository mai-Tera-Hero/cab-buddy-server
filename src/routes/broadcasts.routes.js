const express = require('express');
const router = express.Router();
const Broadcast = require('../models/broadcasts.model');

// POST /broadcasts/broadcast/create
router.post('/broadcast/create', async (req, res) => {
  try {
    const { userId, pickup, destination } = req.body;

    // Validation
    if (!userId) {
      return res.status(400).json({ error: 'userId is required' });
    }

    if (!pickup || pickup.lat === undefined || pickup.lng === undefined) {
      return res.status(400).json({ error: 'pickup must contain lat and lng' });
    }

    if (!destination || destination.lat === undefined || destination.lng === undefined) {
      return res.status(400).json({ error: 'destination must contain lat and lng' });
    }

    // Convert to numbers if they're strings
    const pickupLat = typeof pickup.lat === 'string' ? parseFloat(pickup.lat) : pickup.lat;
    const pickupLng = typeof pickup.lng === 'string' ? parseFloat(pickup.lng) : pickup.lng;
    const destLat = typeof destination.lat === 'string' ? parseFloat(destination.lat) : destination.lat;
    const destLng = typeof destination.lng === 'string' ? parseFloat(destination.lng) : destination.lng;

    // Validate they are valid numbers
    if (isNaN(pickupLat) || isNaN(pickupLng)) {
      return res.status(400).json({ error: 'pickup must contain valid lat and lng numbers' });
    }

    if (isNaN(destLat) || isNaN(destLng)) {
      return res.status(400).json({ error: 'destination must contain valid lat and lng numbers' });
    }

    // Create new broadcast
    const broadcast = new Broadcast({
      userId,
      pickup: {
        lat: pickupLat,
        lng: pickupLng
      },
      destination: {
        lat: destLat,
        lng: destLng
      },
      status: 'open',
      acceptedBy: []
    });

    await broadcast.save();

    res.status(201).json(broadcast);
  } catch (err) {
    // Handle Mongoose validation errors
    if (err.name === 'ValidationError') {
      return res.status(400).json({ error: err.message });
    }
    // Handle duplicate key errors
    if (err.code === 11000) {
      return res.status(400).json({ error: 'Duplicate entry' });
    }
    res.status(500).json({ error: err.message });
  }
});

// GET /broadcasts - List all open broadcasts (newest first)
router.get('/', async (req, res) => {
  try {
    const broadcasts = await Broadcast.find({ status: 'open' })
      .sort({ createdAt: -1 }); // Newest first

    res.status(200).json(broadcasts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /broadcasts/:broadcastId/accept - Accept a broadcast
router.post('/:broadcastId/accept', async (req, res) => {
  try {
    const { broadcastId } = req.params;
    const { userId } = req.body;

    // Validation
    if (!userId) {
      return res.status(400).json({ error: 'userId is required' });
    }

    // Find the broadcast
    const broadcast = await Broadcast.findById(broadcastId);
    if (!broadcast) {
      return res.status(404).json({ error: 'Broadcast not found' });
    }

    // Check if broadcast is closed
    if (broadcast.status === 'closed') {
      return res.status(400).json({ error: 'Cannot accept a closed broadcast' });
    }

    // Prevent creator from accepting their own broadcast
    if (broadcast.userId === userId) {
      return res.status(400).json({ error: 'Cannot accept your own broadcast' });
    }

    // Add user to acceptedBy array (allow duplicates, but we can check if already exists)
    if (!broadcast.acceptedBy.includes(userId)) {
      broadcast.acceptedBy.push(userId);
      await broadcast.save();
    }

    res.status(200).json(broadcast);
  } catch (err) {
    // Handle invalid ObjectId format
    if (err.name === 'CastError') {
      return res.status(400).json({ error: 'Invalid broadcast ID format' });
    }
    res.status(500).json({ error: err.message });
  }
});

// POST /broadcasts/:broadcastId/close - Close a broadcast (only creator)
router.post('/:broadcastId/close', async (req, res) => {
  try {
    const { broadcastId } = req.params;
    const { userId } = req.body;

    // Validation
    if (!userId) {
      return res.status(400).json({ error: 'userId is required' });
    }

    // Find the broadcast
    const broadcast = await Broadcast.findById(broadcastId);
    if (!broadcast) {
      return res.status(404).json({ error: 'Broadcast not found' });
    }

    // Check if already closed
    if (broadcast.status === 'closed') {
      return res.status(400).json({ error: 'Broadcast is already closed' });
    }

    // Only creator can close
    if (broadcast.userId !== userId) {
      return res.status(403).json({ error: 'Only the creator can close this broadcast' });
    }

    // Close the broadcast
    broadcast.status = 'closed';
    await broadcast.save();

    res.status(200).json(broadcast);
  } catch (err) {
    // Handle invalid ObjectId format
    if (err.name === 'CastError') {
      return res.status(400).json({ error: 'Invalid broadcast ID format' });
    }
    res.status(500).json({ error: err.message });
  }
});

// GET /broadcasts/:broadcastId/matches - Find broadcasts with same pickup and destination (active/open only)
router.get('/:broadcastId/matches', async (req, res) => {
  try {
    const { broadcastId } = req.params;

    // Find the broadcast to get its pickup and destination
    const broadcast = await Broadcast.findById(broadcastId);
    if (!broadcast) {
      return res.status(404).json({ error: 'Broadcast not found' });
    }

    // Find other broadcasts with same pickup and destination that are open
    const matches = await Broadcast.find({
      _id: { $ne: broadcastId }, // Exclude the original broadcast
      status: 'open',
      'pickup.lat': broadcast.pickup.lat,
      'pickup.lng': broadcast.pickup.lng,
      'destination.lat': broadcast.destination.lat,
      'destination.lng': broadcast.destination.lng
    }).sort({ createdAt: -1 }); // Newest first

    res.status(200).json(matches);
  } catch (err) {
    // Handle invalid ObjectId format
    if (err.name === 'CastError') {
      return res.status(400).json({ error: 'Invalid broadcast ID format' });
    }
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

