const mongoose = require('mongoose');
require('dotenv').config();
const Quiz = require('./models/Quiz');

async function createQuiz() {
  try {
    await mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log('Connected to MongoDB');

    const quiz = new Quiz({
      title: 'Test Quiz for Remediation',
      description: 'Simple quiz to test remediation mapping',
      topic: 'acid-base',
      difficulty: 'Beginner',
      duration: 1,
      questions: [
        {
          question: 'Is NaOH an acid or a base?',
          options: ['Acid', 'Base', 'Neutral', 'Salt'],
          correct: 1,
          explanation: 'NaOH is a strong base (sodium hydroxide).',
          misconceptionTraps: [
            'Confusing NaOH with acids',
            '',
            'Thinking neutral means salt',
            'Confusing salt terminology with acids/bases'
          ]
        }
      ],
      createdBy: mongoose.Types.ObjectId() // dummy user id
    });

    await quiz.save();
    console.log('Created quiz with id:', quiz._id.toString());
    await mongoose.disconnect();
  } catch (err) {
    console.error('Error creating quiz:', err);
  }
}

createQuiz();
