const express = require('express');
const Concept = require('../models/Concept');
const Quiz = require('../models/Quiz');
const optionalAuth = require('../middleware/optionalAuth');

const router = express.Router();

// Simple text search across concepts and quizzes
router.get('/', optionalAuth, async (req, res) => {
  try {
    const { q, type, limit } = req.query;
    const max = Math.min(Number(limit) || 10, 25);
    if (!q || typeof q !== 'string' || q.trim().length < 2) {
      return res.status(400).json({ message: 'q (min 2 chars) is required' });
    }
    const regex = new RegExp(q.trim(), 'i');

    const results = {};
    if (!type || type === 'concepts') {
      results.concepts = await Concept.find({ isActive: true, status: 'approved', $or: [
        { title: regex },
        { topic: regex },
        { description: regex },
        { tags: regex },
      ] }).select('title topic difficulty tags').limit(max);
    }
    if (!type || type === 'quizzes') {
      results.quizzes = await Quiz.find({ isActive: true, $or: [
        { title: regex },
        { topic: regex },
        { description: regex },
      ] }).select('title topic difficulty duration').limit(max);
    }

    res.json(results);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;


