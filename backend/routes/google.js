// routes/google.js
const express = require("express");
const { OAuth2Client } = require("google-auth-library");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const router = express.Router();

// ✅ Use environment variable for Google Client ID
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// =========================
// 🌐 POST /api/auth/google-login
// =========================
router.post("/google-login", async (req, res) => {
  const { tokenId } = req.body;

  console.log("📩 Google login request received.");

  try {
    if (!tokenId) {
      return res.status(400).json({ message: "Missing Google tokenId" });
    }

    // Verify the Google ID token
    const ticket = await client.verifyIdToken({
      idToken: tokenId,
      audience: [
        process.env.GOOGLE_CLIENT_ID,
        process.env.GOOGLE_ANDROID_CLIENT_ID,
        process.env.GOOGLE_IOS_CLIENT_ID,
      ].filter(Boolean),
    });

    const payload = ticket.getPayload();
    const { email, name } = payload;

    console.log(`✅ Google user verified: ${email}`);

    // Check if user exists, else create one
    let user = await User.findOne({ email });
    if (!user) {
      user = new User({ name, email, password: "", role: "student" });
      await user.save();
      console.log(`🆕 New user created: ${email}`);
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      token,
      user: { name: user.name, email: user.email, role: user.role },
    });
  } catch (err) {
    console.error("❌ Google login error:", err.message || err);
    res.status(400).json({
      message: "Failed to process Google login",
      error: err.message,
    });
  }
});

module.exports = router;
