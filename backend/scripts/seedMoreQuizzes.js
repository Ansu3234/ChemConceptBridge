/* eslint-disable no-console */
require('dotenv').config();
const mongoose = require('mongoose');
const Quiz = require('../models/Quiz');
const User = require('../models/User');

async function main() {
  const mongoURI = process.env.MONGO_URI;
  if (!mongoURI) {
    console.error('MONGO_URI not defined in .env');
    process.exit(1);
  }
  await mongoose.connect(mongoURI);
  console.log('✅ Connected to MongoDB');

  // Ensure a teacher user exists as creator
  let teacher = await User.findOne({ role: 'teacher' });
  if (!teacher) {
    teacher = await User.create({ name: 'Teacher Seed', email: 'teacher.seed@example.com', password: 'password123', role: 'teacher' });
  }

  const quizzes = [
    // Atomic Structure
    {
      title: 'Atomic Structure Fundamentals',
      description: 'Basic concepts of atoms, protons, neutrons, and electrons.',
      topic: 'Atomic Structure',
      difficulty: 'Beginner',
      duration: 15,
      questions: [
        {
          question: 'What is the charge of a proton?',
          options: ['Positive', 'Negative', 'Neutral', 'Variable'],
          correct: 0,
          explanation: 'Protons carry a positive charge.',
          misconceptionTraps: ['Confusing with electron']
        },
        {
          question: 'Which particle is found in the nucleus?',
          options: ['Electron', 'Proton', 'Photon', 'Positron'],
          correct: 1,
          explanation: 'Protons and neutrons are found in the nucleus.',
          misconceptionTraps: ['Thinking electrons are in the nucleus']
        },
        {
          question: 'What determines the atomic number?',
          options: ['Number of neutrons', 'Number of protons', 'Number of electrons', 'Atomic mass'],
          correct: 1,
          explanation: 'Atomic number is defined by the number of protons.',
          misconceptionTraps: ['Confusing with mass number']
        }
      ]
    },
    {
      title: 'Advanced Atomic Theory',
      description: 'Quantum numbers and electron configuration.',
      topic: 'Atomic Structure',
      difficulty: 'Advanced',
      duration: 20,
      questions: [
        {
          question: 'What is the maximum number of electrons in a d-subshell?',
          options: ['2', '6', '10', '14'],
          correct: 2,
          explanation: 'd-subshells have 5 orbitals, each holding 2 electrons.',
          misconceptionTraps: ['Confusing with p-subshell (6)']
        },
        {
          question: 'Which quantum number describes the shape of the orbital?',
          options: ['Principal (n)', 'Azimuthal (l)', 'Magnetic (ml)', 'Spin (ms)'],
          correct: 1,
          explanation: 'The azimuthal quantum number (l) determines the shape.',
          misconceptionTraps: ['Confusing with magnetic quantum number']
        }
      ]
    },

    // Chemical Bonding
    {
      title: 'Ionic vs Covalent Bonding',
      description: 'Understanding different types of chemical bonds.',
      topic: 'Chemical Bonding',
      difficulty: 'Intermediate',
      duration: 15,
      questions: [
        {
          question: 'Ionic bonds are formed by the _____ of electrons.',
          options: ['sharing', 'transfer', 'destruction', 'creation'],
          correct: 1,
          explanation: 'Ionic bonds involve the transfer of electrons from metal to non-metal.',
          misconceptionTraps: ['Confusing with covalent sharing']
        },
        {
          question: 'Which molecule contains a triple bond?',
          options: ['H2', 'O2', 'N2', 'Cl2'],
          correct: 2,
          explanation: 'Nitrogen (N2) has a triple bond.',
          misconceptionTraps: ['Thinking O2 has a triple bond']
        }
      ]
    },

    // Thermodynamics
    {
      title: 'Thermodynamics Basics',
      description: 'Energy, heat, and laws of thermodynamics.',
      topic: 'Thermodynamics',
      difficulty: 'Intermediate',
      duration: 20,
      questions: [
        {
          question: 'What is the First Law of Thermodynamics?',
          options: ['Entropy always increases', 'Energy cannot be created or destroyed', 'Absolute zero is unattainable', 'F = ma'],
          correct: 1,
          explanation: 'Conservation of energy.',
          misconceptionTraps: ['Confusing with Second Law']
        },
        {
          question: 'An exothermic reaction _____ heat.',
          options: ['absorbs', 'releases', 'destroys', 'creates'],
          correct: 1,
          explanation: 'Exothermic reactions release heat to the surroundings.',
          misconceptionTraps: ['Thinking it absorbs heat']
        }
      ]
    },

    // Stoichiometry
    {
      title: 'Stoichiometry Practice',
      description: 'Balancing equations and mole calculations.',
      topic: 'Stoichiometry',
      difficulty: 'Advanced',
      duration: 25,
      questions: [
        {
          question: 'What is Avogadro\'s number?',
          options: ['6.022 x 10^23', '3.14159', '9.8 m/s^2', '1.6 x 10^-19'],
          correct: 0,
          explanation: 'Number of particles in one mole.',
          misconceptionTraps: ['Confusing with other constants']
        },
        {
          question: 'In the reaction 2H2 + O2 -> 2H2O, how many moles of O2 are needed for 4 moles of H2?',
          options: ['1', '2', '4', '8'],
          correct: 1,
          explanation: 'Ratio is 2:1, so 4 moles H2 need 2 moles O2.',
          misconceptionTraps: ['Ignoring the ratio']
        }
      ]
    },

    // Organic Chemistry
    {
      title: 'Intro to Organic Chemistry',
      description: 'Hydrocarbons and functional groups.',
      topic: 'Organic Chemistry',
      difficulty: 'Intermediate',
      duration: 20,
      questions: [
        {
          question: 'Which functional group characterizes alcohols?',
          options: ['-COOH', '-OH', '-NH2', '-CHO'],
          correct: 1,
          explanation: 'Hydroxyl group (-OH) is characteristic of alcohols.',
          misconceptionTraps: ['Confusing with carboxylic acid']
        },
        {
          question: 'What is the general formula for alkanes?',
          options: ['CnH2n', 'CnH2n+2', 'CnH2n-2', 'CnHn'],
          correct: 1,
          explanation: 'Alkanes are saturated hydrocarbons with formula CnH2n+2.',
          misconceptionTraps: ['Confusing with alkenes']
        }
      ]
    }
  ];

  for (const q of quizzes) {
    const quiz = await Quiz.findOneAndUpdate(
      { title: q.title, topic: q.topic }, 
      { ...q, createdBy: teacher._id, isActive: true }, 
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    console.log(`Saved quiz: ${quiz.title}`);
  }

  console.log(`✅ Seeded ${quizzes.length} additional quizzes`);
  await mongoose.disconnect();
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
