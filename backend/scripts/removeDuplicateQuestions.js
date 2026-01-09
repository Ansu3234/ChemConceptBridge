// Script to remove duplicate questions from all quizzes
// Run with: node backend/scripts/removeDuplicateQuestions.js

require('dotenv').config();
const mongoose = require('mongoose');
const Quiz = require('../models/Quiz');

const mongoURI = process.env.MONGO_URI;

if (!mongoURI) {
  console.error('❌ MONGO_URI not defined in .env file');
  process.exit(1);
}

async function removeDuplicates() {
  try {
    await mongoose.connect(mongoURI);
    console.log('✅ Connected to MongoDB');

    const allQuizzes = await Quiz.find({ isActive: true });
    console.log(`📊 Found ${allQuizzes.length} active quizzes`);

    let totalRemoved = 0;
    let quizzesUpdated = 0;
    const topicStats = {};

    for (const quiz of allQuizzes) {
      if (!Array.isArray(quiz.questions) || quiz.questions.length === 0) {
        continue;
      }

      const originalCount = quiz.questions.length;
      const uniqueQuestions = [];
      const seenQuestions = new Set();
      let removedFromQuiz = 0;

      quiz.questions.forEach(q => {
        const questionText = q.question ? q.question.trim().toLowerCase() : '';
        if (questionText && !seenQuestions.has(questionText)) {
          seenQuestions.add(questionText);
          uniqueQuestions.push(q);
        } else if (questionText) {
          removedFromQuiz++;
        }
      });

      if (removedFromQuiz > 0) {
        quiz.questions = uniqueQuestions;
        await quiz.save();
        totalRemoved += removedFromQuiz;
        quizzesUpdated++;

        // Track by topic
        if (!topicStats[quiz.topic]) {
          topicStats[quiz.topic] = { quizzes: 0, questions: 0 };
        }
        topicStats[quiz.topic].quizzes++;
        topicStats[quiz.topic].questions += removedFromQuiz;

        console.log(`✅ Quiz "${quiz.title}" (${quiz.topic}): Removed ${removedFromQuiz} duplicate(s) (${originalCount} → ${uniqueQuestions.length})`);
      }
    }

    console.log('\n📈 Summary:');
    console.log(`   Total quizzes processed: ${allQuizzes.length}`);
    console.log(`   Quizzes with duplicates: ${quizzesUpdated}`);
    console.log(`   Total duplicate questions removed: ${totalRemoved}`);

    if (Object.keys(topicStats).length > 0) {
      console.log('\n📚 By Topic:');
      Object.entries(topicStats).forEach(([topic, stats]) => {
        console.log(`   ${topic}: ${stats.quizzes} quiz(zes), ${stats.questions} duplicate(s) removed`);
      });
    }

    if (totalRemoved === 0) {
      console.log('\n✨ No duplicate questions found! All quizzes are clean.');
    } else {
      console.log(`\n✨ Cleanup completed successfully!`);
    }

    await mongoose.disconnect();
    console.log('✅ Disconnected from MongoDB');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    await mongoose.disconnect();
    process.exit(1);
  }
}

removeDuplicates();

