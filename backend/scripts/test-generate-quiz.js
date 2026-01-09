const axios = require('axios');
const mongoose = require('mongoose');
const User = require('../models/User');
require('dotenv').config();

async function test() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    
    // Get a user token
    const user = await User.findOne({ email: 'alice.student@example.com' });
    if (!user) {
      console.error("No student user found (alice.student@example.com)");
      return;
    }
    
    const port = process.env.PORT || 5000;
    const baseUrl = `http://localhost:${port}`;
    console.log(`Connecting to ${baseUrl}`);

    // Let's try to login first
    const loginRes = await axios.post(`${baseUrl}/api/auth/login`, {
      email: user.email,
      password: 'Student@123' 
    });
    
    const token = loginRes.data.token;
    console.log("Got token:", token);
    
    // Now call generate
    const res = await axios.post(`${baseUrl}/api/quiz/generate`, {
      topic: 'Atomic Structure',
      difficulty: 'Intermediate'
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log("Success:", res.data);
    
  } catch (err) {
    console.error("Error details:", err.message);
    if (err.response) {
      console.error("Response status:", err.response.status);
      console.error("Response data:", err.response.data);
    }
  } finally {
    await mongoose.disconnect();
  }
}

test();
