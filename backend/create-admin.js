const path = require("path");
require("dotenv").config({ path: path.join(__dirname, ".env") });
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("./models/User");

(async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
    const email = process.env.ADMIN_EMAIL || "admin@chemconcept.local";
    const password = process.env.ADMIN_PASSWORD || "Admin@12345";
    let admin = await User.findOne({ email });
    if (!admin) {
      const hash = await bcrypt.hash(password, 10);
      admin = await User.create({ name: "System Admin", email, password: hash, role: "admin" });
      console.log("✅ Admin created:", email, "password:", password);
    } else {
      console.log("ℹ️ Admin already exists:", email);
    }
  } catch (e) {
    console.error("❌ Error:", e.message);
  } finally {
    await mongoose.disconnect();
  }
})();