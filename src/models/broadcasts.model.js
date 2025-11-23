const mongoose = require('mongoose');

const broadcastSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  pickup: {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true }
  },
  destination: {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true }
  },
  status: { 
    type: String, 
    enum: ['open', 'closed'], 
    default: 'open' 
  },
  acceptedBy: { 
    type: [String], 
    default: [] 
  },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.models.Broadcast || mongoose.model('Broadcast', broadcastSchema);

