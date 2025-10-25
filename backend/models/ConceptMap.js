const mongoose = require("mongoose");

const syllabusSchema = new mongoose.Schema({
  board: { type: String, enum: ["NCERT", "NEET", "Other"], default: "NCERT" },
  subject: { type: String, default: "Chemistry" },
  unit: { type: String },
  chapter: { type: String },
  topicPath: [{ type: String }],
}, { _id: false });

const reviewSchema = new mongoose.Schema({
  reviewer: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  note: { type: String },
  decidedAt: { type: Date }
}, { _id: false });

// Basic node-link structure for concept maps
const nodeSchema = new mongoose.Schema({
  key: { type: String },        // optional external key
  id: { type: Number, required: true },
  label: { type: String, required: true, trim: true },
  x: { type: Number, default: 0 },
  y: { type: Number, default: 0 },
}, { _id: false });

const linkSchema = new mongoose.Schema({
  from: { type: Number, required: true },
  to: { type: Number, required: true },
  label: { type: String, trim: true }, // optional relationship label
}, { _id: false });

const conceptMapSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, required: true },
  topic: { type: String, required: true, trim: true },
  difficulty: { type: String, enum: ["Beginner", "Intermediate", "Advanced"], required: true },

  nodes: { type: [nodeSchema], default: [] },
  links: { type: [linkSchema], default: [] },

  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

  // Moderation/standardization
  status: { type: String, enum: ["draft", "pending", "approved", "rejected"], default: "pending" },
  tags: [{ type: String, trim: true }],
  syllabus: syllabusSchema,
  review: reviewSchema,

  isActive: { type: Boolean, default: true },
  views: { type: Number, default: 0 },
}, { timestamps: true });

// Soft duplicate mitigation on title+topic (case-insensitive)
conceptMapSchema.index({ title: 1, topic: 1 }, { unique: false, collation: { locale: 'en', strength: 2 } });

module.exports = mongoose.model("ConceptMap", conceptMapSchema);