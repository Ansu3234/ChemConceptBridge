const express = require('express');
const ChemicalEquation = require('../models/ChemicalEquation');
const auth = require('../middleware/authMiddleware');
const optionalAuth = require('../middleware/optionalAuth');

const router = express.Router();

// Get all chemical equations (public)
router.get('/', optionalAuth, async (req, res) => {
  try {
    const { topic, difficulty } = req.query;
    let query = { isActive: true };
    
    if (topic) query.topic = topic;
    if (difficulty) query.difficulty = difficulty;
    
    const equations = await ChemicalEquation.find(query)
      .populate('createdBy', 'name')
      .sort({ createdAt: -1 });
    
    res.json(equations);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get equation by ID
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const equation = await ChemicalEquation.findById(req.params.id)
      .populate('createdBy', 'name');
    
    if (!equation || !equation.isActive) {
      return res.status(404).json({ message: "Equation not found" });
    }
    
    res.json(equation);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create new equation (Teacher/Admin only)
router.post('/', auth, async (req, res) => {
  try {
    if (!['teacher', 'admin'].includes(req.user.role)) {
      return res.status(403).json({ message: "Access denied" });
    }
    
    const { equationString, balancedEquationString, topic, difficulty, explanation, hints } = req.body;
    
    if (!equationString || !balancedEquationString || !topic) {
      return res.status(400).json({ message: "equationString, balancedEquationString, and topic are required" });
    }
    
    const equation = new ChemicalEquation({
      equationString,
      balancedEquationString,
      topic,
      difficulty: difficulty || 'Beginner',
      explanation,
      hints: hints || [],
      createdBy: req.user.id
    });
    
    await equation.save();
    res.status(201).json(equation);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Check if equation is balanced correctly
router.post('/:id/check-balance', auth, async (req, res) => {
  try {
    const { userEquation } = req.body;
    
    if (!userEquation) {
      return res.status(400).json({ message: "userEquation is required" });
    }
    
    const equation = await ChemicalEquation.findById(req.params.id);
    if (!equation || !equation.isActive) {
      return res.status(404).json({ message: "Equation not found" });
    }
    
    // Simple string comparison for now (can be enhanced with proper chemical equation parsing)
    const isCorrect = userEquation.trim().toLowerCase() === equation.balancedEquationString.trim().toLowerCase();
    
    // Update statistics
    equation.attempts += 1;
    if (isCorrect) {
      equation.successRate = ((equation.successRate * (equation.attempts - 1)) + 100) / equation.attempts;
    } else {
      equation.successRate = (equation.successRate * (equation.attempts - 1)) / equation.attempts;
    }
    await equation.save();
    
    res.json({
      isCorrect,
      correctAnswer: equation.balancedEquationString,
      explanation: equation.explanation,
      hints: equation.hints
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update equation (Teacher/Admin only)
router.put('/:id', auth, async (req, res) => {
  try {
    if (!['teacher', 'admin'].includes(req.user.role)) {
      return res.status(403).json({ message: "Access denied" });
    }
    
    const equation = await ChemicalEquation.findById(req.params.id);
    if (!equation) {
      return res.status(404).json({ message: "Equation not found" });
    }
    
    if (req.user.role === 'teacher' && equation.createdBy.toString() !== req.user.id) {
      return res.status(403).json({ message: "You can only edit your own equations" });
    }
    
    const updates = req.body;
    equation.set(updates);
    await equation.save();
    
    res.json(equation);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete equation (soft delete)
router.delete('/:id', auth, async (req, res) => {
  try {
    if (!['teacher', 'admin'].includes(req.user.role)) {
      return res.status(403).json({ message: "Access denied" });
    }
    
    const equation = await ChemicalEquation.findById(req.params.id);
    if (!equation) {
      return res.status(404).json({ message: "Equation not found" });
    }
    
    if (req.user.role === 'teacher' && equation.createdBy.toString() !== req.user.id) {
      return res.status(403).json({ message: "You can only delete your own equations" });
    }
    
    equation.isActive = false;
    await equation.save();
    
    res.json({ message: "Equation deactivated successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
