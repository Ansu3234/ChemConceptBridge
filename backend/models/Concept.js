const mongoose = require("mongoose");

const syllabusSchema = new mongoose.Schema({
  board: { type: String, enum: ["NCERT", "NEET", "Other"], default: "NCERT" },
  subject: { type: String, default: "Chemistry" },
  unit: { type: String },
  chapter: { type: String },
  topicPath: [{ type: String }], // e.g., ["Organic Chemistry", "Hydrocarbons"]
}, { _id: false });

const reviewSchema = new mongoose.Schema({
  reviewer: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  note: { type: String },
  decidedAt: { type: Date }
}, { _id: false });

const conceptSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, required: true },
  topic: { type: String, required: true, trim: true },
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

  // Moderation/standardization
  status: { type: String, enum: ["draft", "pending", "approved", "rejected"], default: "pending" },
  tags: [{ type: String, trim: true }],
  syllabus: syllabusSchema,
  review: reviewSchema,

  isActive: { type: Boolean, default: true },
  views: { type: Number, default: 0 },
  averageRating: { type: Number, default: 0 }
}, {
  timestamps: true
});

// Helper index to reduce exact duplicates (case-insensitive) on active docs
conceptSchema.index({ title: 1, topic: 1 }, { unique: false, collation: { locale: 'en', strength: 2 } });

module.exports = mongoose.model("Concept", conceptSchema);