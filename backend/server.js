// ====================
// 🌍 server.js
// ====================
require("dotenv").config(); // Load environment variables first

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();

// ====================
// 🔧 Middleware Setup
// ====================
app.use(express.json());

// ✅ CORS — Allow React frontend (ports 3000 & 3003)
app.use(
  cors({
    origin: [
      "http://localhost:3000", // Default React dev server
      "http://localhost:3003", // Custom dev port
    ],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// ====================
// 📦 Import Routes
// ====================
const authRoutes = require("./routes/auth");
const quizRoutes = require("./routes/quiz");
const conceptRoutes = require("./routes/concept");
const adminRoutes = require("./routes/admin");
const conceptMapRoutes = require("./routes/conceptMap");
const googleRoutes = require("./routes/google");
const userRoutes = require("./routes/user");
const remediationRoutes = require("./routes/remediation");
const searchRoutes = require("./routes/search");
const chemicalEquationRoutes = require("./routes/chemicalEquation");
const mlRoutes = require("./routes/mlRoutes");

// ====================
// 🚏 API Route Mounting
// ====================
app.use("/api/ml", mlRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/quiz", quizRoutes);
app.use("/api/concept", conceptRoutes);
app.use("/api/concept-map", conceptMapRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/google", googleRoutes); // ✅ fixed duplicate "/api/auth"
app.use("/api/user", userRoutes);
app.use("/api/remediation", remediationRoutes);
app.use("/api/search", searchRoutes);
app.use("/api/chemical-equations", chemicalEquationRoutes);

// ====================
// 🧠 Health Check Route
// ====================
app.get("/", (req, res) => {
  res.json({ message: "✅ Backend is live and running!" });
});

// ====================
// 🛢️ MongoDB Connection
// ====================
const mongoURI = process.env.MONGO_URI;
const port = process.env.PORT || 5000;

if (!mongoURI) {
  console.error("❌ MONGO_URI not defined in .env file");
  process.exit(1);
}

mongoose
  .connect(mongoURI)
  .then(() => {
    console.log("✅ MongoDB connected");

    // Start server after DB connection
    app.listen(port, () => {
      console.log(`🚀 Server running on port ${port}`);
    });
  })
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err.message);
    process.exit(1);
  });
