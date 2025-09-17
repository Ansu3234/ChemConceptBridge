const mongoose = require("mongoose");

const conceptSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  topic: { type: String, required: true },
  difficulty: { 
    type: String, 
    enum: ["Beginner", "Intermediate", "Advanced"], 
    required: true 
  },
  estimatedTime: { type: Number, required: true }, // in minutes
  content: {
    overview: { type: String },
    definitions: { type: String },
    examples: [{ type: String }],
    visualizations: [{ type: String }], // URLs to images/videos
    interactiveElements: [{ type: String }] // URLs to interactive content
  },
  prerequisites: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Concept' }],
  relatedConcepts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Concept' }],
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  isActive: { type: Boolean, default: true },
  views: { type: Number, default: 0 },
  averageRating: { type: Number, default: 0 }
}, {
  timestamps: true
});

module.exports = mongoose.model("Concept", conceptSchema);
