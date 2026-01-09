const express = require('express');
const auth = require('../middleware/authMiddleware');
const { generateLearningPath } = require('../utils/learningPathGenerator');

const router = express.Router();

/**
 * GET /api/learning-path
 * Generate personalized weekly learning roadmap for authenticated student
 */
router.get('/', auth, async (req, res) => {
  try {
    const learningPath = await generateLearningPath(req.user.id);
    res.json(learningPath);
  } catch (err) {
    console.error('Learning path generation error:', err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * GET /api/learning-path/:userId
 * Admin/Teacher can view learning path for a specific student
 */
router.get('/:userId', auth, async (req, res) => {
  try {
    // Only allow viewing own path or if user is teacher/admin
    if (req.user.id !== req.params.userId && !['teacher', 'admin'].includes(req.user.role)) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const learningPath = await generateLearningPath(req.params.userId);
    res.json(learningPath);
  } catch (err) {
    console.error('Learning path generation error:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
