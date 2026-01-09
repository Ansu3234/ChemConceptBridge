const mongoose = require('mongoose');
require('dotenv').config();
const Experiment = require('../models/Experiment');

async function addThumbnails() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to DB for updating experiments with thumbnails');

    const experiments = await Experiment.find();
    for (const exp of experiments) {
      if (!exp.thumbnail) {
        exp.thumbnail = 'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?q=80&w=600&auto=format&fit=crop&ixlib=rb-4.0.3&s=9c2b8a2a0f7f8b6a';
        await exp.save();
        console.log('Added thumbnail to:', exp.title);
      } else {
        console.log('Already has thumbnail:', exp.title);
      }
    }

    console.log('Thumbnail update complete');
    process.exit(0);
  } catch (err) {
    console.error('Update failed', err);
    process.exit(1);
  }
}

addThumbnails();
