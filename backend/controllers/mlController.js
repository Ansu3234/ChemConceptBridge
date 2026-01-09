const { spawn } = require("child_process");
const path = require("path");

/**
 * Controller: Predict Performance using ML models
 * Input: JSON (e.g. { "quiz1": 8, "quiz2": 6, "quiz3": 7 })
 * Output: Prediction result from Python script
 */
exports.predictPerformance = (req, res) => {
  try {
    // Path to Python script
    const scriptPath = path.join(__dirname, "../ml/predict.py");

    // Spawn Python process
    const python = spawn("python", [scriptPath]);

    // Send JSON input to Python script via stdin
    python.stdin.write(JSON.stringify(req.body));
    python.stdin.end();

    // Collect output data from Python
    let output = "";
    python.stdout.on("data", (data) => {
      output += data.toString();
    });

    // When Python process finishes
    python.on("close", (code) => {
      try {
        const result = JSON.parse(output);
        res.json(result);
      } catch (err) {
        console.error("❌ Error parsing ML output:", err);
        res.status(500).json({
          error: "Failed to parse ML result. Check Python script output.",
        });
      }
    });

    // Handle Python stderr (errors)
    python.stderr.on("data", (data) => {
      console.error("⚠️ Python Error:", data.toString());
    });
  } catch (err) {
    console.error("❌ ML process error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
