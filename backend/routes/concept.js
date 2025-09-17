const express = require("express");
const Concept = require("../models/Concept");
const auth = require("../middleware/authMiddleware");

const router = express.Router();

// Get all concepts
router.get("/", async (req, res) => {
  try {
    const { topic, difficulty } = req.query;
    let query = { isActive: true };
    
    if (topic) query.topic = topic;
    if (difficulty) query.difficulty = difficulty;
    
    const concepts = await Concept.find(query)
      .populate('createdBy', 'name')
      .populate('prerequisites', 'title')
      .populate('relatedConcepts', 'title')
      .sort({ createdAt: -1 });
    
    res.json(concepts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get concept by ID
router.get("/:id", async (req, res) => {
  try {
    const concept = await Concept.findById(req.params.id)
      .populate('createdBy', 'name')
      .populate('prerequisites', 'title description')
      .populate('relatedConcepts', 'title description');
    
    if (!concept) {
      return res.status(404).json({ message: "Concept not found" });
    }
    
    // Increment view count
    concept.views += 1;
    await concept.save();
    
    res.json(concept);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create new concept (Teacher/Admin only)
router.post("/", auth, async (req, res) => {
  try {
    if (!['teacher', 'admin'].includes(req.user.role)) {
      return res.status(403).json({ message: "Access denied" });
    }
    
    const concept = new Concept({
      ...req.body,
      createdBy: req.user.id
    });
    
    await concept.save();
    res.status(201).json(concept);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update concept (Teacher/Admin only)
router.put("/:id", auth, async (req, res) => {
  try {
    if (!['teacher', 'admin'].includes(req.user.role)) {
      return res.status(403).json({ message: "Access denied" });
    }
    
    const concept = await Concept.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!concept) {
      return res.status(404).json({ message: "Concept not found" });
    }
    
    res.json(concept);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete concept (Admin only)
router.delete("/:id", auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: "Access denied" });
    }
    
    const concept = await Concept.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );
    
    if (!concept) {
      return res.status(404).json({ message: "Concept not found" });
    }
    
    res.json({ message: "Concept deactivated successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get concept statistics
router.get("/:id/stats", auth, async (req, res) => {
  try {
    const concept = await Concept.findById(req.params.id);
    
    if (!concept) {
      return res.status(404).json({ message: "Concept not found" });
    }
    
    const stats = {
      views: concept.views,
      averageRating: concept.averageRating,
      difficulty: concept.difficulty,
      estimatedTime: concept.estimatedTime,
      createdAt: concept.createdAt,
      updatedAt: concept.updatedAt
    };
    
    res.json(stats);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Search concepts
router.get("/search/:query", async (req, res) => {
  try {
    const { query } = req.params;
    const { topic, difficulty } = req.query;
    
    let searchQuery = {
      isActive: true,
      $or: [
        { title: { $regex: query, $options: 'i' } },
        { description: { $regex: query, $options: 'i' } },
        { topic: { $regex: query, $options: 'i' } }
      ]
    };
    
    if (topic) searchQuery.topic = topic;
    if (difficulty) searchQuery.difficulty = difficulty;
    
    const concepts = await Concept.find(searchQuery)
      .populate('createdBy', 'name')
      .select('title description topic difficulty estimatedTime')
      .sort({ views: -1 });
    
    res.json(concepts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
