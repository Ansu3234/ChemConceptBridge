const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const role = require('../middleware/roleMiddleware');
const ctrl = require('../controllers/experimentController');

// Public: list experiments (students see only public)
router.get('/', auth, ctrl.listExperiments);
router.get('/:id', auth, ctrl.getExperiment);

// Teacher/Admin: manage experiments
router.post('/', auth, role('teacher', 'admin'), ctrl.createExperiment);
router.put('/:id', auth, role('teacher', 'admin'), ctrl.updateExperiment);
router.delete('/:id', auth, role('admin'), ctrl.deleteExperiment);

// Attempts: students create attempts; teachers/admins can view
router.post('/:id/attempts', auth, role('student'), ctrl.recordAttempt);
router.get('/:id/attempts', auth, role('teacher', 'admin', 'student'), ctrl.listAttempts);
router.put('/:id/attempts/:attemptId', auth, role('teacher', 'admin'), ctrl.updateAttempt);

module.exports = router;
