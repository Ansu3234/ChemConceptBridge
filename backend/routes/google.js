const express = require('express');
const { OAuth2Client } = require('google-auth-library');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const router = express.Router();

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// POST /api/auth/google-login
router.post('/google-login', async (req, res) => {
  const { tokenId } = req.body;
  console.log('Google login request received. tokenId:', tokenId?.substring(0, 20) + '...');

  try {
    if (!tokenId) {
      return res.status(400).json({ message: 'No tokenId received' });
    }

    // ✅ Allow multiple client IDs (web, android, ios)
    const ticket = await client.verifyIdToken({
      idToken: tokenId,
      audience: [
        process.env.GOOGLE_CLIENT_ID,
        process.env.GOOGLE_ANDROID_CLIENT_ID,
        process.env.GOOGLE_IOS_CLIENT_ID,
      ].filter(Boolean),
    });

    const payload = ticket.getPayload();
    console.log("✅ Google token verified:", payload.email);

    const { email, name } = payload;

    let user = await User.findOne({ email });
    if (!user) {
      user = new User({ name, email, password: '', role: 'student' });
      await user.save();
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.json({
      token,
      user: { name: user.name, email: user.email, role: user.role }
    });
  } catch (err) {
    console.error('❌ Google login error:', err.message || err);
    res.status(400).json({ message: 'Failed to process Google login', error: err.message });
  }
});

module.exports = router;
