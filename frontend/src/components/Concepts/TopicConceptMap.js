import React, { useMemo } from 'react';
import ConceptMap from '../ConceptMap/ConceptMap';
import './TopicConceptMap.css';

// Topic-specific concept map data
const getTopicConceptMap = (topic) => {
  const topicLower = (topic || '').toLowerCase();

  const conceptMaps = {
    'acids & bases': {
      nodes: [
        { id: 1, label: 'Acids & Bases', x: 400, y: 100 },
        { id: 2, label: 'Arrhenius Theory', x: 200, y: 200 },
        { id: 3, label: 'Brønsted-Lowry', x: 400, y: 200 },
        { id: 4, label: 'Lewis Theory', x: 600, y: 200 },
        { id: 5, label: 'pH Scale', x: 150, y: 320 },
        { id: 6, label: 'Strong Acids', x: 300, y: 320 },
        { id: 7, label: 'Weak Acids', x: 450, y: 320 },
        { id: 8, label: 'Neutralization', x: 600, y: 320 },
        { id: 9, label: 'Buffers', x: 400, y: 420 },
        { id: 10, label: 'Salt Formation', x: 250, y: 420 }
      ],
      links: [
        { from: 1, to: 2 },
        { from: 1, to: 3 },
        { from: 1, to: 4 },
        { from: 2, to: 5 },
        { from: 3, to: 6 },
        { from: 3, to: 7 },
        { from: 4, to: 8 },
        { from: 5, to: 9 },
        { from: 6, to: 9 },
        { from: 7, to: 9 },
        { from: 8, to: 10 }
      ]
    },
    'periodic table': {
      nodes: [
        { id: 1, label: 'Periodic Table', x: 400, y: 100 },
        { id: 2, label: 'Periods', x: 200, y: 200 },
        { id: 3, label: 'Groups', x: 400, y: 200 },
        { id: 4, label: 'Atomic Number', x: 600, y: 200 },
        { id: 5, label: 'Alkali Metals', x: 150, y: 320 },
        { id: 6, label: 'Halogens', x: 350, y: 320 },
        { id: 7, label: 'Noble Gases', x: 550, y: 320 },
        { id: 8, label: 'Atomic Radius', x: 200, y: 420 },
        { id: 9, label: 'Ionization Energy', x: 400, y: 420 },
        { id: 10, label: 'Electronegativity', x: 600, y: 420 }
      ],
      links: [
        { from: 1, to: 2 },
        { from: 1, to: 3 },
        { from: 1, to: 4 },
        { from: 3, to: 5 },
        { from: 3, to: 6 },
        { from: 3, to: 7 },
        { from: 2, to: 8 },
        { from: 2, to: 9 },
        { from: 2, to: 10 },
        { from: 8, to: 9 },
        { from: 9, to: 10 }
      ]
    },
    'chemical bonding': {
      nodes: [
        { id: 1, label: 'Chemical Bonding', x: 400, y: 100 },
        { id: 2, label: 'Ionic Bonds', x: 200, y: 200 },
        { id: 3, label: 'Covalent Bonds', x: 400, y: 200 },
        { id: 4, label: 'Metallic Bonds', x: 600, y: 200 },
        { id: 5, label: 'Electron Transfer', x: 150, y: 320 },
        { id: 6, label: 'Electron Sharing', x: 350, y: 320 },
        { id: 7, label: 'Delocalized Electrons', x: 550, y: 320 },
        { id: 8, label: 'VSEPR Theory', x: 300, y: 420 },
        { id: 9, label: 'Molecular Geometry', x: 500, y: 420 },
        { id: 10, label: 'Bond Strength', x: 400, y: 500 }
      ],
      links: [
        { from: 1, to: 2 },
        { from: 1, to: 3 },
        { from: 1, to: 4 },
        { from: 2, to: 5 },
        { from: 3, to: 6 },
        { from: 4, to: 7 },
        { from: 3, to: 8 },
        { from: 8, to: 9 },
        { from: 2, to: 10 },
        { from: 3, to: 10 },
        { from: 4, to: 10 }
      ]
    },
    'atomic structure': {
      nodes: [
        { id: 1, label: 'Atomic Structure', x: 400, y: 100 },
        { id: 2, label: 'Protons', x: 220, y: 200 },
        { id: 3, label: 'Neutrons', x: 400, y: 200 },
        { id: 4, label: 'Electrons', x: 580, y: 200 },
        { id: 5, label: 'Atomic Number (Z)', x: 200, y: 320 },
        { id: 6, label: 'Mass Number (A)', x: 400, y: 320 },
        { id: 7, label: 'Isotopes', x: 600, y: 320 },
        { id: 8, label: 'Electron Configuration', x: 280, y: 440 },
        { id: 9, label: 'Energy Levels', x: 440, y: 440 },
        { id: 10, label: 'Valence Electrons', x: 600, y: 440 }
      ],
      links: [
        { from: 1, to: 2 },
        { from: 1, to: 3 },
        { from: 1, to: 4 },
        { from: 2, to: 5 },
        { from: 3, to: 6 },
        { from: 4, to: 7 },
        { from: 4, to: 8 },
        { from: 8, to: 9 },
        { from: 9, to: 10 },
        { from: 5, to: 6 },
        { from: 6, to: 7 }
      ]
    },
    'thermodynamics': {
      nodes: [
        { id: 1, label: 'Thermodynamics', x: 400, y: 100 },
        { id: 2, label: 'First Law', x: 200, y: 200 },
        { id: 3, label: 'Second Law', x: 400, y: 200 },
        { id: 4, label: 'Third Law', x: 600, y: 200 },
        { id: 5, label: 'Enthalpy (ΔH)', x: 150, y: 320 },
        { id: 6, label: 'Entropy (ΔS)', x: 350, y: 320 },
        { id: 7, label: 'Gibbs Free Energy', x: 550, y: 320 },
        { id: 8, label: 'Exothermic', x: 200, y: 420 },
        { id: 9, label: 'Endothermic', x: 400, y: 420 },
        { id: 10, label: 'Spontaneity', x: 600, y: 420 }
      ],
      links: [
        { from: 1, to: 2 },
        { from: 1, to: 3 },
        { from: 1, to: 4 },
        { from: 2, to: 5 },
        { from: 3, to: 6 },
        { from: 3, to: 7 },
        { from: 5, to: 8 },
        { from: 5, to: 9 },
        { from: 7, to: 10 },
        { from: 6, to: 10 }
      ]
    },
    'organic chemistry': {
      nodes: [
        { id: 1, label: 'Organic Chemistry', x: 400, y: 100 },
        { id: 2, label: 'Hydrocarbons', x: 200, y: 200 },
        { id: 3, label: 'Functional Groups', x: 400, y: 200 },
        { id: 4, label: 'Reactions', x: 600, y: 200 },
        { id: 5, label: 'Alkanes', x: 150, y: 320 },
        { id: 6, label: 'Alkenes', x: 300, y: 320 },
        { id: 7, label: 'Alkynes', x: 450, y: 320 },
        { id: 8, label: 'Aromatics', x: 600, y: 320 },
        { id: 9, label: 'Substitution', x: 300, y: 420 },
        { id: 10, label: 'Elimination', x: 500, y: 420 }
      ],
      links: [
        { from: 1, to: 2 },
        { from: 1, to: 3 },
        { from: 1, to: 4 },
        { from: 2, to: 5 },
        { from: 2, to: 6 },
        { from: 2, to: 7 },
        { from: 2, to: 8 },
        { from: 4, to: 9 },
        { from: 4, to: 10 },
        { from: 3, to: 9 },
        { from: 3, to: 10 }
      ]
    },
    'stoichiometry': {
      nodes: [
        { id: 1, label: 'Stoichiometry', x: 400, y: 100 },
        { id: 2, label: 'Balanced Equations', x: 200, y: 200 },
        { id: 3, label: 'Mole Concept', x: 400, y: 200 },
        { id: 4, label: 'Molar Mass', x: 600, y: 200 },
        { id: 5, label: 'Mole Ratios', x: 150, y: 320 },
        { id: 6, label: 'Mass Calculations', x: 350, y: 320 },
        { id: 7, label: 'Volume Calculations', x: 550, y: 320 },
        { id: 8, label: 'Limiting Reactant', x: 300, y: 420 },
        { id: 9, label: 'Percent Yield', x: 500, y: 420 },
        { id: 10, label: 'Solution Stoichiometry', x: 400, y: 500 }
      ],
      links: [
        { from: 1, to: 2 },
        { from: 1, to: 3 },
        { from: 1, to: 4 },
        { from: 2, to: 5 },
        { from: 3, to: 6 },
        { from: 3, to: 7 },
        { from: 4, to: 6 },
        { from: 5, to: 8 },
        { from: 8, to: 9 },
        { from: 6, to: 10 },
        { from: 7, to: 10 }
      ]
    },
    'equilibrium': {
      nodes: [
        { id: 1, label: 'Chemical Equilibrium', x: 400, y: 100 },
        { id: 2, label: 'Dynamic Balance', x: 200, y: 200 },
        { id: 3, label: 'Equilibrium Constant (K)', x: 400, y: 200 },
        { id: 4, label: 'Le Chatelier\'s Principle', x: 600, y: 200 },
        { id: 5, label: 'Forward Reaction', x: 150, y: 320 },
        { id: 6, label: 'Reverse Reaction', x: 350, y: 320 },
        { id: 7, label: 'Concentration Changes', x: 550, y: 320 },
        { id: 8, label: 'Temperature Effects', x: 200, y: 420 },
        { id: 9, label: 'Pressure Effects', x: 400, y: 420 },
        { id: 10, label: 'Acid-Base Equilibrium', x: 600, y: 420 }
      ],
      links: [
        { from: 1, to: 2 },
        { from: 1, to: 3 },
        { from: 1, to: 4 },
        { from: 2, to: 5 },
        { from: 2, to: 6 },
        { from: 4, to: 7 },
        { from: 4, to: 8 },
        { from: 4, to: 9 },
        { from: 3, to: 10 },
        { from: 5, to: 6 }
      ]
    },
    'redox reactions': {
      nodes: [
        { id: 1, label: 'Redox Reactions', x: 400, y: 100 },
        { id: 2, label: 'Oxidation', x: 200, y: 200 },
        { id: 3, label: 'Reduction', x: 400, y: 200 },
        { id: 4, label: 'Electron Transfer', x: 600, y: 200 },
        { id: 5, label: 'Oxidation Numbers', x: 150, y: 320 },
        { id: 6, label: 'Oxidizing Agents', x: 350, y: 320 },
        { id: 7, label: 'Reducing Agents', x: 550, y: 320 },
        { id: 8, label: 'Half-Reactions', x: 300, y: 420 },
        { id: 9, label: 'Balancing Redox', x: 500, y: 420 },
        { id: 10, label: 'Electrochemical Cells', x: 400, y: 500 }
      ],
      links: [
        { from: 1, to: 2 },
        { from: 1, to: 3 },
        { from: 1, to: 4 },
        { from: 2, to: 5 },
        { from: 3, to: 5 },
        { from: 2, to: 7 },
        { from: 3, to: 6 },
        { from: 4, to: 8 },
        { from: 8, to: 9 },
        { from: 4, to: 10 },
        { from: 9, to: 10 }
      ]
    }
  };

  // Try exact match first
  if (conceptMaps[topicLower]) {
    return JSON.parse(JSON.stringify(conceptMaps[topicLower])); // Deep copy to ensure fresh data
  }

  // Try partial match with better logic
  for (const key in conceptMaps) {
    const keyLower = key.toLowerCase();
    // Check if topic contains key or key contains topic (for better matching)
    if (topicLower.includes(keyLower) || keyLower.includes(topicLower)) {
      return JSON.parse(JSON.stringify(conceptMaps[key])); // Deep copy
    }
  }
  
  // Try matching with trimmed topic (remove extra spaces)
  const trimmedTopic = topicLower.trim();
  if (conceptMaps[trimmedTopic]) {
    return JSON.parse(JSON.stringify(conceptMaps[trimmedTopic]));
  }

  // Default generic concept map
  return {
    nodes: [
      { id: 1, label: topic || 'Main Concept', x: 400, y: 200 },
      { id: 2, label: 'Key Concept 1', x: 250, y: 300 },
      { id: 3, label: 'Key Concept 2', x: 400, y: 300 },
      { id: 4, label: 'Key Concept 3', x: 550, y: 300 },
      { id: 5, label: 'Application 1', x: 300, y: 400 },
      { id: 6, label: 'Application 2', x: 500, y: 400 }
    ],
    links: [
      { from: 1, to: 2 },
      { from: 1, to: 3 },
      { from: 1, to: 4 },
      { from: 2, to: 5 },
      { from: 3, to: 6 },
      { from: 4, to: 5 }
    ]
  };
};

const TopicConceptMap = ({ topic }) => {
  // Use useMemo to recalculate map data when topic changes
  const mapData = useMemo(() => {
    return getTopicConceptMap(topic);
  }, [topic]);

  return (
    <div className="topic-concept-map-wrapper" key={`concept-map-${topic}`}>
      <div className="topic-concept-map-content">
        <ConceptMap
          key={`map-${topic}`}
          nodes={mapData.nodes}
          links={mapData.links}
          role="student"
          hideTitle={true}
          description="Explore relationships between concepts. Drag to rearrange, click nodes to connect."
        />
      </div>
    </div>
  );
};

export default TopicConceptMap;

