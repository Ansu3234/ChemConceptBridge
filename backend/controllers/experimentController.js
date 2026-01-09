const Experiment = require('../models/Experiment');
const ExperimentAttempt = require('../models/ExperimentAttempt');

exports.listExperiments = async (req, res) => {
  try {
    // public experiments for students, teachers/admins see all
    const query = {};
    if (req.user && req.user.role === 'student') query.visibility = 'public';
    const exps = await Experiment.find(query).sort({ createdAt: -1 });
    res.json(exps);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getExperiment = async (req, res) => {
  try {
    const exp = await Experiment.findById(req.params.id);
    if (!exp) return res.status(404).json({ message: 'Experiment not found' });
    if (exp.visibility === 'private' && (!req.user || req.user.role === 'student')) {
      return res.status(403).json({ message: 'Access denied' });
    }
    res.json(exp);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.createExperiment = async (req, res) => {
  try {
    const payload = req.body;
    payload.createdBy = req.user._id;
    const exp = await Experiment.create(payload);
    res.status(201).json(exp);
  } catch (err) {
    res.status(400).json({ message: 'Invalid data', error: err.message });
  }
};

exports.updateExperiment = async (req, res) => {
  try {
    const exp = await Experiment.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!exp) return res.status(404).json({ message: 'Experiment not found' });
    res.json(exp);
  } catch (err) {
    res.status(400).json({ message: 'Invalid data' });
  }
};

exports.deleteExperiment = async (req, res) => {
  try {
    const exp = await Experiment.findByIdAndDelete(req.params.id);
    if (!exp) return res.status(404).json({ message: 'Experiment not found' });
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.recordAttempt = async (req, res) => {
  try {
    const expId = req.params.id;
    const payload = req.body || {};
    const attempt = await ExperimentAttempt.create({
      experiment: expId,
      student: req.user._id,
      responses: payload.responses || {},
      observations: payload.observations || '',
      pHReadings: payload.pHReadings || [],
      startTime: payload.startTime || Date.now(),
      endTime: payload.endTime || Date.now(),
      score: payload.score || null,
      feedback: payload.feedback || ''
    });
    res.status(201).json(attempt);
  } catch (err) {
    res.status(400).json({ message: 'Could not record attempt', error: err.message });
  }
};

exports.listAttempts = async (req, res) => {
  try {
    const expId = req.params.id;
    const query = { experiment: expId };
    // students only see their attempts
    if (req.user.role === 'student') query.student = req.user._id;
    const attempts = await ExperimentAttempt.find(query).populate('student', 'name email').sort({ createdAt: -1 });
    res.json(attempts);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.updateAttempt = async (req, res) => {
  try {
    const { id, attemptId } = req.params;
    const attempt = await ExperimentAttempt.findById(attemptId);
    if (!attempt) return res.status(404).json({ message: 'Attempt not found' });

    // Only teachers/admins can add feedback or score (route protected by middleware)
    const { feedback, score } = req.body;
    if (typeof feedback !== 'undefined') attempt.feedback = feedback;
    if (typeof score !== 'undefined') attempt.score = score;
    await attempt.save();
    res.json(attempt);
  } catch (err) {
    res.status(400).json({ message: 'Could not update attempt', error: err.message });
  }
};
