const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("./models/User");
require("dotenv").config();

const createTestUser = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log("✅ Connected to MongoDB");
    
    // Check if user already exists
    const existingUser = await User.findOne({ email: "test@example.com" });
    if (existingUser) {
      console.log("❌ Test user already exists");
      return;
    }
    
    // Create test user
    const hashedPassword = await bcrypt.hash("password123", 10);
    const testUser = new User({
      name: "Test Student",
      email: "test@example.com",
      password: hashedPassword,
      role: "student"
    });
    
    await testUser.save();
    console.log("✅ Test user created successfully");
    console.log("Email: test@example.com");
    console.log("Password: password123");
    
  } catch (error) {
    console.error("❌ Error creating test user:", error);
  } finally {
    await mongoose.disconnect();
  }
};

createTestUser();
