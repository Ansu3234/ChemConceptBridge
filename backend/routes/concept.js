const express = require("express");
const Concept = require("../models/Concept");
const auth = require("../middleware/authMiddleware");
const optionalAuth = require("../middleware/optionalAuth");

const router = express.Router();

const isAdmin = (req) => req.user && req.user.role === 'admin';
const isTeacher = (req) => req.user && req.user.role === 'teacher';

// Public/filtered: Get concepts
// - Public: only approved + active
// - Admin: can filter by status (?status=pending|approved|rejected|draft)
// - Teacher: ?mine=true returns own concepts (any status)
router.get("/", optionalAuth, async (req, res) => {
  try {
    const { topic, difficulty, status, mine, board } = req.query;

    let query = { isActive: true };

    if (isAdmin(req)) {
      if (status) query.status = status;
    } else if (isTeacher(req) && mine === 'true') {
      query.createdBy = req.user.id;
      if (status) query.status = status;
    } else {
      // public and non-mine views: only approved
      query.status = 'approved';
    }

    if (topic) query.topic = topic;
    if (difficulty) query.difficulty = difficulty;
    if (board) query['syllabus.board'] = board;

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

// Public get by id
// - If not approved, only admin or owning teacher can view
router.get("/:id", optionalAuth, async (req, res) => {
  try {
    const concept = await Concept.findById(req.params.id)
      .populate('createdBy', 'name')
      .populate('prerequisites', 'title description')
      .populate('relatedConcepts', 'title description');

    if (!concept || !concept.isActive) {
      return res.status(404).json({ message: "Concept not found" });
    }

    const canViewUnapproved = isAdmin(req) || (isTeacher(req) && concept.createdBy && concept.createdBy._id.toString() === req.user.id);
    if (concept.status !== 'approved' && !canViewUnapproved) {
      return res.status(403).json({ message: "Access denied" });
    }

    // Increment view count only when approved/public
    if (concept.status === 'approved') {
      concept.views += 1;
      await concept.save();
    }

    res.json(concept);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create new concept (Teacher/Admin)
// - Teachers: defaults to pending unless explicitly saving draft
// - Prevent duplicates (same title+topic) among active concepts that are approved/pending
router.post("/", auth, async (req, res) => {
  try {
    if (!['teacher', 'admin'].includes(req.user.role)) {
      return res.status(403).json({ message: "Access denied" });
    }

    const { title, topic } = req.body;
    if (!title || !topic) {
      return res.status(400).json({ message: "title and topic are required" });
    }

    const duplicate = await Concept.findOne({
      title: { $regex: `^${title}$`, $options: 'i' },
      topic: { $regex: `^${topic}$`, $options: 'i' },
      isActive: true,
      status: { $in: ['pending', 'approved'] }
    }).collation({ locale: 'en', strength: 2 });

    if (duplicate) {
      return res.status(409).json({ message: "Similar content already exists (title/topic)." });
    }

    let status = req.body.status;
    if (isTeacher(req)) {
      status = status === 'draft' ? 'draft' : 'pending';
    } else if (isAdmin(req)) {
      status = status && ['draft', 'pending', 'approved', 'rejected'].includes(status) ? status : 'approved';
    }

    const concept = new Concept({
      ...req.body,
      status,
      createdBy: req.user.id
    });

    await concept.save();
    res.status(201).json(concept);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update concept
// - Admin: can update any; status remains as set (unless explicitly changed)
// - Teacher: can update own concepts; edits to approved concepts move status back to pending for re-approval
router.put("/:id", auth, async (req, res) => {
  try {
    if (!['teacher', 'admin'].includes(req.user.role)) {
      return res.status(403).json({ message: "Access denied" });
    }

    const concept = await Concept.findById(req.params.id);
    if (!concept || !concept.isActive) {
      return res.status(404).json({ message: "Concept not found" });
    }

    const isOwnerTeacher = isTeacher(req) && concept.createdBy.toString() === req.user.id;
    if (!(isAdmin(req) || isOwnerTeacher)) {
      return res.status(403).json({ message: "Access denied" });
    }

    const updates = { ...req.body };

    if (isOwnerTeacher) {
      // Teacher editing: if concept was approved, move back to pending for moderation
      if (concept.status === 'approved') {
        updates.status = 'pending';
        updates.review = undefined; // clear previous review on resubmission
      }
      // Teachers cannot force-approve via payload
      if (updates.status === 'approved' || updates.status === 'rejected') {
        delete updates.status;
      }
    }

    concept.set(updates);
    await concept.save();
    res.json(concept);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Soft delete (Admin only)
router.delete("/:id", auth, async (req, res) => {
  try {
    if (!isAdmin(req)) {
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

// Submit draft for review (Teacher/Admin)
router.patch("/:id/submit", auth, async (req, res) => {
  try {
    if (!['teacher', 'admin'].includes(req.user.role)) {
      return res.status(403).json({ message: "Access denied" });
    }
    const concept = await Concept.findById(req.params.id);
    if (!concept || !concept.isActive) return res.status(404).json({ message: 'Concept not found' });

    if (isTeacher(req) && concept.createdBy.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    concept.status = 'pending';
    concept.review = undefined;
    await concept.save();
    res.json(concept);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Admin moderation: list pending
router.get("/admin/pending", auth, async (req, res) => {
  try {
    if (!isAdmin(req)) return res.status(403).json({ message: 'Access denied' });

    const items = await Concept.find({ status: 'pending', isActive: true })
      .populate('createdBy', 'name email')
      .sort({ updatedAt: 1 });
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Admin approve
router.patch("/:id/approve", auth, async (req, res) => {
  try {
    if (!isAdmin(req)) return res.status(403).json({ message: 'Access denied' });

    const { note, tags, syllabus } = req.body;

    const concept = await Concept.findById(req.params.id);
    if (!concept || !concept.isActive) return res.status(404).json({ message: 'Concept not found' });

    concept.status = 'approved';
    if (Array.isArray(tags)) concept.tags = tags;
    if (syllabus) concept.syllabus = syllabus;
    concept.review = { reviewer: req.user.id, note, decidedAt: new Date() };

    await concept.save();
    res.json(concept);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Generic status update (Admin only)
router.patch("/:id/status", auth, async (req, res) => {
  try {
    if (!isAdmin(req)) return res.status(403).json({ message: 'Access denied' });

    const { status } = req.body;
    if (!status || !['pending', 'approved', 'rejected'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status value' });
    }

    const concept = await Concept.findById(req.params.id);
    if (!concept || !concept.isActive) return res.status(404).json({ message: 'Concept not found' });

    concept.status = status;
    concept.review = { 
      reviewer: req.user.id, 
      note: `Status updated to ${status}`, 
      decidedAt: new Date() 
    };

    await concept.save();
    res.json(concept);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Admin reject
router.patch("/:id/reject", auth, async (req, res) => {
  try {
    if (!isAdmin(req)) return res.status(403).json({ message: 'Access denied' });

    const { note } = req.body;

    const concept = await Concept.findById(req.params.id);
    if (!concept || !concept.isActive) return res.status(404).json({ message: 'Concept not found' });

    concept.status = 'rejected';
    concept.review = { reviewer: req.user.id, note, decidedAt: new Date() };

    await concept.save();
    res.json(concept);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Concept statistics (auth required; teacher/admin only)
router.get("/:id/stats", auth, async (req, res) => {
  try {
    if (!['teacher', 'admin'].includes(req.user.role)) {
      return res.status(403).json({ message: "Access denied" });
    }

    const concept = await Concept.findById(req.params.id);
    if (!concept) {
      return res.status(404).json({ message: "Concept not found" });
    }

    const stats = {
      views: concept.views,
      averageRating: concept.averageRating,
      difficulty: concept.difficulty,
      estimatedTime: concept.estimatedTime,
      status: concept.status,
      createdAt: concept.createdAt,
      updatedAt: concept.updatedAt
    };

    res.json(stats);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Search concepts (public approved-only)
router.get("/search/:query", auth, async (req, res) => {
  try {
    const { query } = req.params;
    const { topic, difficulty } = req.query;

    let searchQuery = {
      isActive: true,
      status: 'approved',
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
      .select('title description topic difficulty estimatedTime tags syllabus')
      .sort({ views: -1 });

    res.json(concepts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;