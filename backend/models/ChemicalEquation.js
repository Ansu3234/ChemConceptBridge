const mongoose = require('mongoose');

const chemicalEquationSchema = new mongoose.Schema({
  equationString: { type: String, required: true, trim: true }, // e.g., "H2 + O2 -> H2O"
  balancedEquationString: { type: String, required: true, trim: true }, // e.g., "2H2 + O2 -> 2H2O"
  topic: { type: String, required: true, trim: true },
  difficulty: { 
    type: String, 
    enum: ['Beginner', 'Intermediate', 'Advanced'], 
    default: 'Beginner' 
  },
  explanation: { type: String, trim: true },
  hints: [{ type: String }], // Array of hints for balancing
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  isActive: { type: Boolean, default: true },
  attempts: { type: Number, default: 0 },
  successRate: { type: Number, default: 0 } // percentage of successful balances
}, { 
  timestamps: true 
});

module.exports = mongoose.model('ChemicalEquation', chemicalEquationSchema);
