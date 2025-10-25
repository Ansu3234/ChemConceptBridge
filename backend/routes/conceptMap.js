const express = require("express");
const ConceptMap = require("../models/ConceptMap");
const auth = require("../middleware/authMiddleware");
const optionalAuth = require("../middleware/optionalAuth");

const router = express.Router();

const isAdmin = (req) => req.user && req.user.role === 'admin';
const isTeacher = (req) => req.user && req.user.role === 'teacher';

// List concept maps
// - Public: approved + active
// - Admin: can filter by status
// - Teacher: ?mine=true to get own maps (any status)
router.get("/", optionalAuth, async (req, res) => {
  try {
    const { topic, difficulty, status, mine, board } = req.query;
    const query = { isActive: true };

    if (isAdmin(req)) {
      if (status) query.status = status;
    } else if (isTeacher(req) && mine === 'true') {
      query.createdBy = req.user.id;
      if (status) query.status = status;
    } else {
      query.status = 'approved';
    }

    if (topic) query.topic = topic;
    if (difficulty) query.difficulty = difficulty;
    if (board) query['syllabus.board'] = board;

    const maps = await ConceptMap.find(query)
      .populate('createdBy', 'name')
      .sort({ createdAt: -1 });
    res.json(maps);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get one by id (public approved-only, else admin/owner)
router.get("/:id", optionalAuth, async (req, res) => {
  try {
    const map = await ConceptMap.findById(req.params.id).populate('createdBy', 'name');
    if (!map || !map.isActive) return res.status(404).json({ message: 'Concept map not found' });

    const canViewUnapproved = isAdmin(req) || (isTeacher(req) && map.createdBy && map.createdBy._id.toString() === req.user.id);
    if (map.status !== 'approved' && !canViewUnapproved) {
      return res.status(403).json({ message: 'Access denied' });
    }

    if (map.status === 'approved') {
      map.views += 1;
      await map.save();
    }

    res.json(map);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create (teacher/admin)
router.post("/", auth, async (req, res) => {
  try {
    if (!['teacher', 'admin'].includes(req.user.role)) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const { title, topic } = req.body;
    if (!title || !topic) return res.status(400).json({ message: 'title and topic are required' });

    const duplicate = await ConceptMap.findOne({
      title: { $regex: `^${title}$`, $options: 'i' },
      topic: { $regex: `^${topic}$`, $options: 'i' },
      isActive: true,
      status: { $in: ['pending', 'approved'] }
    }).collation({ locale: 'en', strength: 2 });
    if (duplicate) return res.status(409).json({ message: 'Similar concept map exists (title/topic).' });

    let status = req.body.status;
    if (isTeacher(req)) {
      status = status === 'draft' ? 'draft' : 'pending';
    } else if (isAdmin(req)) {
      status = status && ['draft', 'pending', 'approved', 'rejected'].includes(status) ? status : 'approved';
    }

    const map = new ConceptMap({ ...req.body, status, createdBy: req.user.id });
    await map.save();
    res.status(201).json(map);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update (owner teacher or admin)
router.put("/:id", auth, async (req, res) => {
  try {
    if (!['teacher', 'admin'].includes(req.user.role)) return res.status(403).json({ message: 'Access denied' });
    const map = await ConceptMap.findById(req.params.id);
    if (!map || !map.isActive) return res.status(404).json({ message: 'Concept map not found' });

    const isOwnerTeacher = isTeacher(req) && map.createdBy.toString() === req.user.id;
    if (!(isAdmin(req) || isOwnerTeacher)) return res.status(403).json({ message: 'Access denied' });

    const updates = { ...req.body };
    if (isOwnerTeacher) {
      if (map.status === 'approved') {
        updates.status = 'pending';
        updates.review = undefined;
      }
      if (updates.status === 'approved' || updates.status === 'rejected') {
        delete updates.status;
      }
    }

    map.set(updates);
    await map.save();
    res.json(map);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Submit draft -> pending
router.patch("/:id/submit", auth, async (req, res) => {
  try {
    if (!['teacher', 'admin'].includes(req.user.role)) return res.status(403).json({ message: 'Access denied' });
    const map = await ConceptMap.findById(req.params.id);
    if (!map || !map.isActive) return res.status(404).json({ message: 'Concept map not found' });

    if (isTeacher(req) && map.createdBy.toString() !== req.user.id) return res.status(403).json({ message: 'Access denied' });

    map.status = 'pending';
    map.review = undefined;
    await map.save();
    res.json(map);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Admin list pending
router.get("/admin/pending", auth, async (req, res) => {
  try {
    if (!isAdmin(req)) return res.status(403).json({ message: 'Access denied' });
    const items = await ConceptMap.find({ status: 'pending', isActive: true }).populate('createdBy', 'name email').sort({ updatedAt: 1 });
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
    const map = await ConceptMap.findById(req.params.id);
    if (!map || !map.isActive) return res.status(404).json({ message: 'Concept map not found' });

    map.status = 'approved';
    if (Array.isArray(tags)) map.tags = tags;
    if (syllabus) map.syllabus = syllabus;
    map.review = { reviewer: req.user.id, note, decidedAt: new Date() };

    await map.save();
    res.json(map);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Admin reject
router.patch("/:id/reject", auth, async (req, res) => {
  try {
    if (!isAdmin(req)) return res.status(403).json({ message: 'Access denied' });
    const { note } = req.body;
    const map = await ConceptMap.findById(req.params.id);
    if (!map || !map.isActive) return res.status(404).json({ message: 'Concept map not found' });

    map.status = 'rejected';
    map.review = { reviewer: req.user.id, note, decidedAt: new Date() };
    await map.save();
    res.json(map);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Soft delete (admin)
router.delete("/:id", auth, async (req, res) => {
  try {
    if (!isAdmin(req)) return res.status(403).json({ message: 'Access denied' });
    const map = await ConceptMap.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
    if (!map) return res.status(404).json({ message: 'Concept map not found' });
    res.json({ message: 'Concept map deactivated successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;