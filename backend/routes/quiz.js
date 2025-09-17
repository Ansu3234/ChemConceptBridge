const express = require("express");
const Quiz = require("../models/Quiz");
const QuizAttempt = require("../models/QuizAttempt");
const auth = require("../middleware/authMiddleware");

const router = express.Router();

// Get all quizzes
router.get("/", async (req, res) => {
  try {
    const { topic, difficulty } = req.query;
    let query = { isActive: true };
    
    if (topic) query.topic = topic;
    if (difficulty) query.difficulty = difficulty;
    
    const quizzes = await Quiz.find(query)
      .populate('createdBy', 'name')
      .select('-questions.correct -questions.explanation')
      .sort({ createdAt: -1 });
    
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
    
    res.json(quiz);
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
    
    const quiz = new Quiz({
      ...req.body,
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
    const { answers, timeSpent, confidenceLevel } = req.body;
    
    const quiz = await Quiz.findById(req.params.id);
    if (!quiz) {
      return res.status(404).json({ message: "Quiz not found" });
    }
    
    // Calculate score
    let correct = 0;
    const detailedAnswers = answers.map(answer => {
      const question = quiz.questions.find(q => q._id.toString() === answer.questionId);
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
        if (question.misconceptionTraps && question.misconceptionTraps.includes(answer.selectedOption)) {
          misconceptions.push(question.misconceptionTraps[answer.selectedOption]);
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
      confidenceLevel,
      misconceptions
    });
    
    await attempt.save();
    
    // Update quiz statistics
    quiz.attempts += 1;
    quiz.averageScore = ((quiz.averageScore * (quiz.attempts - 1)) + score) / quiz.attempts;
    await quiz.save();
    
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

module.exports = router;
