// server.js
require("dotenv").config(); // Load environment variables first

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Routes
const authRoutes = require("./routes/auth");
const quizRoutes = require("./routes/quiz");
const conceptRoutes = require("./routes/concept");
const googleRoutes = require("./routes/google");

app.use("/api/auth", authRoutes);
app.use("/api/quiz", quizRoutes);
app.use("/api/concept", conceptRoutes);
app.use("/api/auth", googleRoutes);

// MongoDB Connection
const mongoURI = process.env.MONGO_URI;
const port = process.env.PORT || 5000;

if (!mongoURI) {
  console.error("❌ MONGO_URI not defined in .env file");
  process.exit(1);
}

mongoose
  .connect(mongoURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
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
