const mongoose = require('mongoose');

const gamificationSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', unique: true, required: true },
  xp: { type: Number, default: 0 },
  badges: { type: [String], default: [] },
  lastActivityAt: { type: Date },
}, { timestamps: true });

module.exports = mongoose.model('Gamification', gamificationSchema);


