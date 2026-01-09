// ================================================
// 🧠 Machine Learning Routes — Complete Implementation
// ================================================

const express = require("express");
const router = express.Router();
const { spawn } = require("child_process");
const path = require("path");
const fs = require("fs");
const auth = require("../middleware/authMiddleware");
const QuizAttempt = require("../models/QuizAttempt");

// Helper function to run Python scripts
function runPythonScript(scriptPath, args = [], cwd = null) {
  return new Promise((resolve, reject) => {
    const python = spawn("python", [scriptPath, ...args], {
      cwd: cwd || path.dirname(scriptPath),
      stdio: ["ignore", "pipe", "pipe"]
    });

    let stdout = "";
    let stderr = "";

    python.stdout.on("data", (data) => {
      stdout += data.toString();
    });

    python.stderr.on("data", (data) => {
      stderr += data.toString();
    });

    python.on("close", (code) => {
      if (code !== 0) {
        reject(new Error(stderr || `Python script exited with code ${code}`));
      } else {
        resolve(stdout);
      }
    });

    python.on("error", (err) => {
      reject(new Error(`Failed to start Python: ${err.message}`));
    });
  });
}

// ==============================
// POST /api/ml/train
// Train all 5 ML models and generate visualization
// ==============================
router.post("/train", auth, async (req, res) => {
  try {
    const mlDir = path.join(__dirname, "..", "ml");
    
    console.log("🚀 Starting ML model training...");

    // Step 1: Generate training data
    console.log("📊 Step 1: Generating training data...");
    await runPythonScript(path.join(mlDir, "data_generator.py"), [], mlDir);

    // Step 2: Train all models (KNN, Naive Bayes, Decision Tree, SVM, Neural Network)
    console.log("🧠 Step 2: Training all ML models...");
    await runPythonScript(path.join(mlDir, "train_models.py"), [], mlDir);

    // Step 3: Generate visualization charts
    console.log("📈 Step 3: Generating visualization charts...");
    await runPythonScript(path.join(mlDir, "visualize_results.py"), [], mlDir);

    // Read results
    const resultsPath = path.join(mlDir, "model_results.json");
    const chartPath = path.join(mlDir, "model_comparison_charts.png");
    
    let results = [];
    if (fs.existsSync(resultsPath)) {
      results = JSON.parse(fs.readFileSync(resultsPath, "utf-8"));
    }

    console.log("✅ Training completed successfully!");

    res.json({
      success: true,
      message: "All ML models trained successfully",
      results: results,
      chartGenerated: fs.existsSync(chartPath),
      models: results.map(r => r.model)
    });

  } catch (err) {
    console.error("❌ ML training error:", err);
    res.status(500).json({
      success: false,
      error: "Failed to train ML models",
      details: err.message
    });
  }
});

// ==============================
// GET /api/ml/results
// Get training results (metrics for all models)
// ==============================
router.get("/results", auth, (req, res) => {
  try {
    const resultsPath = path.join(__dirname, "..", "ml", "model_results.json");
    
    if (!fs.existsSync(resultsPath)) {
      return res.json([]);
    }

    const results = JSON.parse(fs.readFileSync(resultsPath, "utf-8"));
    res.json(results);

  } catch (err) {
    console.error("❌ Error reading ML results:", err);
    res.status(500).json({ error: "Failed to read results" });
  }
});

// ==============================
// GET /api/ml/chart
// Serve visualization chart image
// ==============================
router.get("/chart", auth, (req, res) => {
  try {
    const chartPath = path.join(__dirname, "..", "ml", "model_comparison_charts.png");
    
    if (!fs.existsSync(chartPath)) {
      return res.status(404).json({ error: "Chart not found. Please train models first." });
    }

    res.sendFile(chartPath);

  } catch (err) {
    console.error("❌ Error serving chart:", err);
    res.status(500).json({ error: "Failed to serve chart" });
  }
});

// ==============================
// POST /api/ml/predict-performance
// Predict student performance using KNN model
// ==============================
router.post("/predict-performance", auth, async (req, res) => {
  try {
    console.log("📩 Received ML prediction request:", req.body);

    const scriptPath = path.join(__dirname, "../ml/predict_knn.py");
    const inputData = req.body;

    // Validate input
    if (!inputData || (!inputData.quiz1 && !inputData.quiz2 && !inputData.quiz3)) {
      return res.status(400).json({ error: "Missing quiz scores. Provide quiz1, quiz2, quiz3" });
    }

    const python = spawn("python", [scriptPath, JSON.stringify(inputData)]);

    let output = "";
    let errorOutput = "";

    python.stdout.on("data", (data) => {
      output += data.toString();
    });

    python.stderr.on("data", (data) => {
      errorOutput += data.toString();
    });

    python.on("close", (code) => {
      if (errorOutput) {
        console.error("🐍 Python Error:", errorOutput);
        return res.status(500).json({ error: "Prediction failed", details: errorOutput });
      }

      try {
        const result = JSON.parse(output);
        console.log("✅ Prediction result:", result);
        res.json(result);
      } catch (err) {
        console.error("❌ Failed to parse Python output:", err);
        res.status(500).json({ error: "Prediction failed - Invalid output from model" });
      }
    });

    python.on("error", (err) => {
      console.error("🚫 Failed to start Python process:", err);
      res.status(500).json({ error: "Internal Server Error - Python process error" });
    });

  } catch (err) {
    console.error("💥 ML prediction route crashed:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// ==============================
// GET /api/ml/my-prediction
// Get prediction for current user based on history
// ==============================
router.get("/my-prediction", auth, async (req, res) => {
  try {
    // Fetch last 3 attempts
    const attempts = await QuizAttempt.find({ student: req.user.id })
      .sort({ createdAt: -1 })
      .limit(3);

    if (attempts.length === 0) {
      return res.json({ prediction: "average", probabilities: { weak: 0.33, average: 0.34, strong: 0.33 }, note: "No history" });
    }

    // Prepare input data
    // If less than 3 attempts, pad with average or 0?
    // The model expects quiz1, quiz2, quiz3.
    // Let's use available scores and pad with the average of available scores.
    
    const scores = attempts.map(a => a.score);
    const avgScore = scores.reduce((a, b) => a + b, 0) / scores.length;
    
    const inputData = {
      quiz1: scores[0] || avgScore,
      quiz2: scores[1] || (scores.length > 1 ? scores[1] : avgScore),
      quiz3: scores[2] || (scores.length > 2 ? scores[2] : avgScore),
      time_spent: attempts.reduce((a, b) => a + (b.timeSpent || 0), 0) / attempts.length || 1200,
      confidence: attempts.reduce((a, b) => a + (b.confidenceLevel || 3), 0) / attempts.length || 3
    };

    const scriptPath = path.join(__dirname, "../ml/predict_knn.py");
    
    const python = spawn("python", [scriptPath, JSON.stringify(inputData)]);

    let output = "";
    let errorOutput = "";

    python.stdout.on("data", (data) => {
      output += data.toString();
    });

    python.stderr.on("data", (data) => {
      errorOutput += data.toString();
    });

    python.on("close", (code) => {
      if (errorOutput) {
        console.error("Python Error:", errorOutput);
        // Fallback if ML fails
        return res.json({ prediction: "average", error: "ML failed" });
      }
      try {
        const result = JSON.parse(output);
        res.json(result);
      } catch (err) {
        res.json({ prediction: "average", error: "Parse failed" });
      }
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
