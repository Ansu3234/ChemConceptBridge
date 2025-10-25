const mongoose = require('mongoose');
const ChemicalEquation = require('../models/ChemicalEquation');
const User = require('../models/User');
require('dotenv').config();

const sampleEquations = [
  {
    equationString: "H2 + O2 -> H2O",
    balancedEquationString: "2H2 + O2 -> 2H2O",
    topic: "Combustion",
    difficulty: "Beginner",
    explanation: "This is a combustion reaction where hydrogen gas reacts with oxygen gas to form water. The equation needs to be balanced so that the number of atoms on both sides are equal.",
    hints: [
      "Count the atoms on each side",
      "Start by balancing the most complex molecule (H2O)",
      "Remember that you can only change coefficients, not subscripts"
    ]
  },
  {
    equationString: "Na + Cl2 -> NaCl",
    balancedEquationString: "2Na + Cl2 -> 2NaCl",
    topic: "Synthesis",
    difficulty: "Beginner",
    explanation: "Sodium metal reacts with chlorine gas to form sodium chloride (table salt). This is a synthesis reaction.",
    hints: [
      "Sodium is a metal that forms +1 ions",
      "Chlorine is a halogen that forms -1 ions",
      "Balance the equation by adjusting coefficients"
    ]
  },
  {
    equationString: "CaCO3 + HCl -> CaCl2 + H2O + CO2",
    balancedEquationString: "CaCO3 + 2HCl -> CaCl2 + H2O + CO2",
    topic: "Acid-Base Reactions",
    difficulty: "Intermediate",
    explanation: "Calcium carbonate reacts with hydrochloric acid to produce calcium chloride, water, and carbon dioxide. This is an acid-base reaction.",
    hints: [
      "This is a double displacement reaction",
      "HCl is a strong acid",
      "CO2 is a gas that escapes from the solution"
    ]
  },
  {
    equationString: "Al + O2 -> Al2O3",
    balancedEquationString: "4Al + 3O2 -> 2Al2O3",
    topic: "Oxidation",
    difficulty: "Intermediate",
    explanation: "Aluminum metal reacts with oxygen to form aluminum oxide. This is an oxidation reaction.",
    hints: [
      "Aluminum has a +3 oxidation state",
      "Oxygen has a -2 oxidation state",
      "Find the least common multiple for balancing"
    ]
  },
  {
    equationString: "C6H12O6 + O2 -> CO2 + H2O",
    balancedEquationString: "C6H12O6 + 6O2 -> 6CO2 + 6H2O",
    topic: "Cellular Respiration",
    difficulty: "Advanced",
    explanation: "This represents cellular respiration where glucose is oxidized to produce carbon dioxide and water, releasing energy.",
    hints: [
      "This is a combustion reaction of glucose",
      "Start by balancing carbon atoms",
      "Then balance hydrogen atoms",
      "Finally balance oxygen atoms"
    ]
  },
  {
    equationString: "Fe2O3 + CO -> Fe + CO2",
    balancedEquationString: "Fe2O3 + 3CO -> 2Fe + 3CO2",
    topic: "Reduction",
    difficulty: "Advanced",
    explanation: "Iron(III) oxide is reduced by carbon monoxide to produce iron metal and carbon dioxide. This is used in iron smelting.",
    hints: [
      "This is a reduction-oxidation reaction",
      "CO is the reducing agent",
      "Fe2O3 is the oxidizing agent",
      "Balance the equation step by step"
    ]
  },
  {
    equationString: "NH3 + O2 -> NO + H2O",
    balancedEquationString: "4NH3 + 5O2 -> 4NO + 6H2O",
    topic: "Industrial Chemistry",
    difficulty: "Advanced",
    explanation: "Ammonia reacts with oxygen to form nitrogen monoxide and water. This is part of the Ostwald process for nitric acid production.",
    hints: [
      "This is a complex balancing problem",
      "Start with the most complex molecule",
      "Use fractional coefficients if needed, then multiply by the denominator"
    ]
  },
  {
    equationString: "H2SO4 + NaOH -> Na2SO4 + H2O",
    balancedEquationString: "H2SO4 + 2NaOH -> Na2SO4 + 2H2O",
    topic: "Neutralization",
    difficulty: "Intermediate",
    explanation: "Sulfuric acid reacts with sodium hydroxide in a neutralization reaction to form sodium sulfate and water.",
    hints: [
      "This is an acid-base neutralization",
      "H2SO4 is a diprotic acid",
      "NaOH is a strong base",
      "The products are salt and water"
    ]
  }
];

const seedChemicalEquations = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/chemconcept-bridge');
    console.log('Connected to MongoDB');

    // Find a teacher user to assign as creator
    const teacher = await User.findOne({ role: 'teacher' });
    if (!teacher) {
      console.log('No teacher found. Please create a teacher user first.');
      return;
    }

    // Clear existing chemical equations
    await ChemicalEquation.deleteMany({});
    console.log('Cleared existing chemical equations');

    // Create sample equations
    const equations = sampleEquations.map(eq => ({
      ...eq,
      createdBy: teacher._id
    }));

    await ChemicalEquation.insertMany(equations);
    console.log(`Created ${equations.length} chemical equations`);

    console.log('Chemical equations seeded successfully!');
  } catch (error) {
    console.error('Error seeding chemical equations:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
};

// Run the seed function if this file is executed directly
if (require.main === module) {
  seedChemicalEquations();
}

module.exports = seedChemicalEquations;
