const mongoose = require("mongoose");

const quizSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  topic: { type: String, required: true },
  difficulty: { 
    type: String, 
    enum: ["Beginner", "Intermediate", "Advanced"], 
    required: true 
  },
  duration: { type: Number, required: true }, // in minutes
  questions: [{
    question: { type: String, required: true },
    options: [{ type: String, required: true }],
    correct: { type: Number, required: true },
    explanation: { type: String, required: true },
    misconceptionTraps: [{ type: String }] // Common wrong answers
  }],
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  isActive: { type: Boolean, default: true },
  attempts: { type: Number, default: 0 },
  averageScore: { type: Number, default: 0 }
}, {
  timestamps: true
});

module.exports = mongoose.model("Quiz", quizSchema);
