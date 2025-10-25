const express = require("express");
const Quiz = require("../models/Quiz");
const QuizAttempt = require("../models/QuizAttempt");
const auth = require("../middleware/authMiddleware");
const Gamification = require("../models/Gamification");

const router = express.Router();

// Get all quizzes
router.get("/", async (req, res) => {
  try {
    const { topic, difficulty } = req.query;
    let query = { isActive: true };
    
    if (topic) query.topic = topic;
    if (difficulty) query.difficulty = difficulty;
    
    const quizzesDocs = await Quiz.find(query)
      .populate('createdBy', 'name')
      .sort({ createdAt: -1 });

    const quizzes = quizzesDocs.map(q => {
      const o = q.toObject();
      if (Array.isArray(o.questions)) {
        o.questions = o.questions.map(qq => ({ _id: qq._id, question: qq.question, options: qq.options }));
      }
      return o;
    });
    
    res.json(quizzes);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get quiz by ID
router.get("/:id", async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id)
      .populate('createdBy', 'name');
    
    if (!quiz) {
      return res.status(404).json({ message: "Quiz not found" });
    }
    // Do not leak answer keys to clients other than creator/admin
    const sanitized = quiz.toObject();
    if (Array.isArray(sanitized.questions)) {
      sanitized.questions = sanitized.questions.map(q => ({
        _id: q._id,
        question: q.question,
        options: q.options,
        // hide correct index and explanation until after attempt
      }));
    }
    
    res.json(sanitized);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create new quiz (Teacher/Admin only)
router.post("/", auth, async (req, res) => {
  try {
    if (!['teacher', 'admin'].includes(req.user.role)) {
      return res.status(403).json({ message: "Access denied" });
    }

    // Validate payload
    const { title, description, topic, difficulty, duration, questions } = req.body || {};
    const allowedDifficulties = ["Beginner", "Intermediate", "Advanced"];
    if (!title || !description || !topic || !difficulty || typeof duration !== 'number' || duration <= 0) {
      return res.status(400).json({ message: "title, description, topic, difficulty, positive numeric duration are required" });
    }
    if (!allowedDifficulties.includes(difficulty)) {
      return res.status(400).json({ message: "Invalid difficulty" });
    }
    if (!Array.isArray(questions) || questions.length === 0) {
      return res.status(400).json({ message: "At least one question is required" });
    }
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      if (!q || typeof q.question !== 'string' || !Array.isArray(q.options) || q.options.length < 2) {
        return res.status(400).json({ message: `Question ${i + 1} must have text and at least 2 options` });
      }
      if (typeof q.correct !== 'number' || q.correct < 0 || q.correct >= q.options.length) {
        return res.status(400).json({ message: `Question ${i + 1} has invalid correct option index` });
      }
      if (!q.explanation || typeof q.explanation !== 'string') {
        return res.status(400).json({ message: `Question ${i + 1} must include an explanation` });
      }
    }

    const quiz = new Quiz({
      title, description, topic, difficulty, duration, questions,
      createdBy: req.user.id
    });

    await quiz.save();
    res.status(201).json(quiz);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Submit quiz attempt
router.post("/:id/attempt", auth, async (req, res) => {
  try {
    const { answers, timeSpent, confidenceLevel } = req.body || {};
    if (!Array.isArray(answers) || answers.length === 0) {
      return res.status(400).json({ message: "answers array is required" });
    }
    if (typeof timeSpent !== 'number' || timeSpent < 0) {
      return res.status(400).json({ message: "timeSpent must be a non-negative number (seconds)" });
    }
    
    const quiz = await Quiz.findById(req.params.id);
    if (!quiz) {
      return res.status(404).json({ message: "Quiz not found" });
    }
    // Normalize confidence: accept 1-5 or 0-100
    let normalizedConfidence = undefined;
    if (typeof confidenceLevel === 'number') {
      if (confidenceLevel > 5) {
        // treat as percentage and map to 1..5
        const pct = Math.max(0, Math.min(100, confidenceLevel));
        normalizedConfidence = Math.max(1, Math.min(5, Math.round((pct / 100) * 5)));
      } else if (confidenceLevel >= 1 && confidenceLevel <= 5) {
        normalizedConfidence = Math.round(confidenceLevel);
      }
    }

    // Calculate score
    let correct = 0;
    const detailedAnswers = answers.map((answer) => {
      const question = quiz.questions.find(q => q._id.toString() === String(answer.questionId));
      if (!question) {
        throw new Error("Invalid questionId in answers");
      }
      if (typeof answer.selectedOption !== 'number' || answer.selectedOption < 0 || answer.selectedOption >= question.options.length) {
        throw new Error("Invalid selectedOption index in answers");
      }
      const isCorrect = answer.selectedOption === question.correct;
      if (isCorrect) correct++;
      
      return {
        questionId: answer.questionId,
        selectedOption: answer.selectedOption,
        isCorrect,
        timeSpent: answer.timeSpent || 0
      };
    });
    
    const score = Math.round((correct / quiz.questions.length) * 100);
    
    // Detect misconceptions (simplified)
    const misconceptions = [];
    detailedAnswers.forEach(answer => {
      if (!answer.isCorrect) {
        const question = quiz.questions.find(q => q._id.toString() === answer.questionId);
        if (Array.isArray(question.misconceptionTraps)) {
          const trap = question.misconceptionTraps[answer.selectedOption];
          if (trap) misconceptions.push(trap);
        }
      }
    });
    
    // Create attempt record
    const attempt = new QuizAttempt({
      student: req.user.id,
      quiz: req.params.id,
      answers: detailedAnswers,
      score,
      timeSpent,
      confidenceLevel: normalizedConfidence,
      misconceptions
    });
    
    await attempt.save();
    
    // Update quiz statistics
    quiz.attempts += 1;
    quiz.averageScore = ((quiz.averageScore * (quiz.attempts - 1)) + score) / quiz.attempts;
    await quiz.save();

    // Simple gamification: award XP and basic badges
    try {
      const deltaXp = 10 + Math.round(score / 10); // base 10 + up to 10 by performance
      const gam = await Gamification.findOneAndUpdate(
        { user: req.user.id },
        { $inc: { xp: deltaXp }, $setOnInsert: { badges: [] }, $set: { lastActivityAt: new Date() } },
        { new: true, upsert: true }
      );

      const newBadges = [];
      if (score >= 90 && !(gam.badges || []).includes('High Scorer')) newBadges.push('High Scorer');
      if (correct === quiz.questions.length && !(gam.badges || []).includes('Perfect Quiz')) newBadges.push('Perfect Quiz');
      if (newBadges.length) {
        gam.badges = Array.from(new Set([...(gam.badges || []), ...newBadges]));
        await gam.save();
      }
    } catch (_) {
      // Best-effort; ignore gamification errors
    }
    
    res.json({
      score,
      correct,
      total: quiz.questions.length,
      misconceptions,
      attemptId: attempt._id
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get student's quiz attempts
router.get("/attempts/student", auth, async (req, res) => {
  try {
    const attempts = await QuizAttempt.find({ student: req.user.id })
      .populate('quiz', 'title topic difficulty')
      .sort({ completedAt: -1 });
    
    res.json(attempts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get quiz statistics (Teacher/Admin only)
router.get("/:id/stats", auth, async (req, res) => {
  try {
    if (!['teacher', 'admin'].includes(req.user.role)) {
      return res.status(403).json({ message: "Access denied" });
    }
    
    const attempts = await QuizAttempt.find({ quiz: req.params.id })
      .populate('student', 'name email');
    
    const stats = {
      totalAttempts: attempts.length,
      averageScore: attempts.reduce((sum, attempt) => sum + attempt.score, 0) / attempts.length || 0,
      completionRate: attempts.length > 0 ? 100 : 0, // Simplified
      commonMisconceptions: {},
      studentPerformance: attempts.map(attempt => ({
        student: attempt.student,
        score: attempt.score,
        completedAt: attempt.completedAt
      }))
    };
    
    // Count misconceptions
    attempts.forEach(attempt => {
      attempt.misconceptions.forEach(misconception => {
        stats.commonMisconceptions[misconception] = (stats.commonMisconceptions[misconception] || 0) + 1;
      });
    });
    
    res.json(stats);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update quiz (Teacher/Admin; teacher can only edit own quiz)
router.put("/:id", auth, async (req, res) => {
  try {
    if (!['teacher', 'admin'].includes(req.user.role)) {
      return res.status(403).json({ message: "Access denied" });
    }

    let quiz = await Quiz.findById(req.params.id);
    if (!quiz) {
      return res.status(404).json({ message: "Quiz not found" });
    }

    if (req.user.role === 'teacher' && quiz.createdBy.toString() !== req.user.id) {
      return res.status(403).json({ message: "You can only edit your own quizzes" });
    }

    const updates = req.body;
    quiz.set(updates);
    await quiz.save();
    res.json(quiz);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update quiz status (activate/deactivate) (Teacher/Admin; teacher can only update own quiz)
router.patch("/:id/status", auth, async (req, res) => {
  try {
    if (!['teacher', 'admin'].includes(req.user.role)) {
      return res.status(403).json({ message: "Access denied" });
    }

    const quiz = await Quiz.findById(req.params.id);
    if (!quiz) {
      return res.status(404).json({ message: "Quiz not found" });
    }

    if (req.user.role === 'teacher' && quiz.createdBy.toString() !== req.user.id) {
      return res.status(403).json({ message: "You can only update your own quizzes" });
    }

    const { isActive } = req.body;
    if (typeof isActive !== 'boolean') {
      return res.status(400).json({ message: "isActive must be a boolean value" });
    }

    quiz.isActive = isActive;
    await quiz.save();

    res.json({ 
      message: isActive ? "Quiz activated successfully" : "Quiz deactivated successfully",
      quiz
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete quiz (soft delete: isActive=false) (Teacher/Admin; teacher can only delete own quiz)
router.delete("/:id", auth, async (req, res) => {
  try {
    if (!['teacher', 'admin'].includes(req.user.role)) {
      return res.status(403).json({ message: "Access denied" });
    }

    const quiz = await Quiz.findById(req.params.id);
    if (!quiz) {
      return res.status(404).json({ message: "Quiz not found" });
    }

    if (req.user.role === 'teacher' && quiz.createdBy.toString() !== req.user.id) {
      return res.status(403).json({ message: "You can only delete your own quizzes" });
    }

    quiz.isActive = false;
    await quiz.save();

    res.json({ message: "Quiz deactivated successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
