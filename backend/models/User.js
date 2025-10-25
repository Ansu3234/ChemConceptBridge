const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    name: String,
    email: { type: String, required: true, unique: true },
    password: String,
    // Include admin as a valid role
    role: { type: String, enum: ["student", "teacher", "admin"], default: "student", index: true },
    // Link a student to their teacher (optional)
    assignedTeacher: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    resetPasswordToken: String,
    resetPasswordExpires: Date,
}, { timestamps: true });

// Index to optimize role-based aggregations and counts
userSchema.index({ role: 1 });

module.exports = mongoose.model("User", userSchema);