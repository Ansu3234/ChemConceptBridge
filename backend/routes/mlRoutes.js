const express = require("express");
const { spawn } = require("child_process");
const router = express.Router();
const auth = require("../middleware/authMiddleware");
const QuizAttempt = require("../models/QuizAttempt");

// Predict student performance using KNN
router.post("/predict-performance", auth, async (req, res) => {
  // Accept explicit features or derive from recent attempts
  let inputData = req.body; // { quiz1: 8, quiz2: 6, quiz3: 7 }
  if (!inputData || typeof inputData !== 'object') inputData = {};

  if (inputData.auto === true || (!('quiz1' in inputData) && !('quiz2' in inputData) && !('quiz3' in inputData))) {
    const last = await QuizAttempt.find({ student: req.user.id }).sort({ completedAt: -1 }).limit(3);
    inputData = {
      quiz1: last[0]?.score || 0,
      quiz2: last[1]?.score || 0,
      quiz3: last[2]?.score || 0,
    };
  }

  const pythonProcess = spawn("python", ["./ml/predict_knn.py", JSON.stringify(inputData)]);

  pythonProcess.stdout.on("data", (data) => {
    res.json({ prediction: data.toString().trim(), features: inputData });
  });

  pythonProcess.stderr.on("data", (data) => {
    console.error(`Error: ${data}`);
    res.status(500).json({ error: "Prediction failed" });
  });
});

module.exports = router;
