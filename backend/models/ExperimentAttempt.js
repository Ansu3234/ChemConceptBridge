const mongoose = require('mongoose');

const attemptSchema = new mongoose.Schema({
  experiment: { type: mongoose.Schema.Types.ObjectId, ref: 'Experiment', required: true },
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  responses: mongoose.Schema.Types.Mixed, // arbitrary UI state / answers
  observations: String,
  pHReadings: [Number],
  startTime: Date,
  endTime: Date,
  score: Number,
  feedback: String,
}, { timestamps: true });

module.exports = mongoose.model('ExperimentAttempt', attemptSchema);
