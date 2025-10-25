const mongoose = require('mongoose');

const userProgressSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', unique: true, required: true },
  // Store completed concept topics by string; avoids requiring Concept documents
  completedTopics: { type: [String], default: [] }
}, {
  timestamps: true
});

module.exports = mongoose.model('UserProgress', userProgressSchema);