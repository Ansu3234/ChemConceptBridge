const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
require('dotenv').config();

async function seedStudents() {
  try {
    const mongoURI = process.env.MONGO_URI;
    if (!mongoURI) {
      console.error('MONGO_URI not defined in .env');
      process.exit(1);
    }
    await mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log('✅ Connected to MongoDB');

    // Find any existing teacher to assign students to
    const teacher = await User.findOne({ role: 'teacher' });
    if (!teacher) {
      console.error('❌ No teacher found. Please create a teacher user first.');
      return;
    }

    const students = [
      { name: 'Alice Johnson', email: 'alice.student@example.com' },
      { name: 'Brian Lee', email: 'brian.student@example.com' },
      { name: 'Chitra Rao', email: 'chitra.student@example.com' }
    ];

    for (const s of students) {
      let user = await User.findOne({ email: s.email });
      if (!user) {
        const hash = await bcrypt.hash('Student@123', 10);
        user = await User.create({
          name: s.name,
          email: s.email,
          password: hash,
          role: 'student',
          assignedTeacher: teacher._id
        });
        console.log(`✅ Created student: ${s.name} (${s.email})`);
      } else {
        // Ensure assignment
        if (String(user.assignedTeacher) !== String(teacher._id)) {
          user.assignedTeacher = teacher._id;
          await user.save();
          console.log(`ℹ️ Assigned existing student to teacher: ${s.email}`);
        } else {
          console.log(`ℹ️ Student already exists and assigned: ${s.email}`);
        }
      }
    }

    console.log('🎉 Seeded demo students. Default password: Student@123');
  } catch (err) {
    console.error('❌ Error seeding students:', err.message);
  } finally {
    await mongoose.disconnect();
    console.log('✅ Disconnected');
  }
}

if (require.main === module) {
  seedStudents();
}

module.exports = seedStudents;