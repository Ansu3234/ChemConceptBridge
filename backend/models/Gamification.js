const mongoose = require('mongoose');

const badgeSchema = new mongoose.Schema({
  id: { type: String, required: true }, // Unique badge identifier
  name: { type: String, required: true }, // Badge name
  description: { type: String, required: true }, // Achievement description
  icon: { type: String, required: true }, // Icon emoji or URL
  unlockedAt: { type: Date, required: true }, // When the badge was earned
  category: { type: String, enum: ['milestone', 'achievement', 'performance', 'streak'], required: true },
  xpReward: { type: Number, default: 0 }, // XP awarded for this badge
}, { timestamps: true });

const gamificationSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', unique: true, required: true },
  xp: { type: Number, default: 0 },
  level: { type: Number, default: 1 }, // Level based on XP (1 XP = ~1 level at 100 XP per level)
  badges: [badgeSchema], // Array of earned badges with details
  streakDays: { type: Number, default: 0 }, // Current streak count
  lastActivityAt: { type: Date },
  totalQuizzesCompleted: { type: Number, default: 0 },
  totalTopicsLearned: { type: Number, default: 0 },
  averageQuizScore: { type: Number, default: 0 },
}, { timestamps: true });

// Index for leaderboard queries
gamificationSchema.index({ xp: -1 });
// user has `unique: true` on the schema field which creates an index; avoid duplicate
// gamificationSchema.index({ user: 1 });

module.exports = mongoose.model('Gamification', gamificationSchema);


