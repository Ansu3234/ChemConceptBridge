import React, { useState } from 'react';
import './ConceptPages.css';
import AcidBaseConcept from './AcidBaseConcept';
import PeriodicTableConcept from './PeriodicTableConcept';
import BondingConcept from './BondingConcept';
import ThermodynamicsConcept from './ThermodynamicsConcept';

const ConceptPages = () => {
  const [activeConcept, setActiveConcept] = useState('acids-bases');

  const concepts = [
    {
      id: 'acids-bases',
      title: 'Acids & Bases',
      icon: '🧪',
      description: 'Understanding pH, acid-base reactions, and buffer solutions',
      difficulty: 'Intermediate',
      estimatedTime: '45 min'
    },
    {
      id: 'periodic-table',
      title: 'Periodic Table',
      icon: '📊',
      description: 'Elements, trends, and periodic properties',
      difficulty: 'Beginner',
      estimatedTime: '30 min'
    },
    {
      id: 'bonding',
      title: 'Chemical Bonding',
      icon: '🔗',
      description: 'Ionic, covalent, and metallic bonds',
      difficulty: 'Intermediate',
      estimatedTime: '40 min'
    },
    {
      id: 'thermodynamics',
      title: 'Thermodynamics',
      icon: '🌡️',
      description: 'Energy changes, enthalpy, and entropy',
      difficulty: 'Advanced',
      estimatedTime: '60 min'
    }
  ];

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'Beginner': return '#16a34a';
      case 'Intermediate': return '#d97706';
      case 'Advanced': return '#dc2626';
      default: return '#64748b';
    }
  };

  const renderConceptContent = () => {
    switch (activeConcept) {
      case 'acids-bases':
        return <AcidBaseConcept />;
      case 'periodic-table':
        return <PeriodicTableConcept />;
      case 'bonding':
        return <BondingConcept />;
      case 'thermodynamics':
        return <ThermodynamicsConcept />;
      default:
        return <AcidBaseConcept />;
    }
  };

  return (
    <div className="concept-pages">
      <div className="concept-sidebar">
        <h3>Chemistry Concepts</h3>
        <div className="concept-list">
          {concepts.map((concept) => (
            <div
              key={concept.id}
              className={`concept-item ${activeConcept === concept.id ? 'active' : ''}`}
              onClick={() => setActiveConcept(concept.id)}
            >
              <div className="concept-icon">{concept.icon}</div>
              <div className="concept-info">
                <div className="concept-title">{concept.title}</div>
                <div className="concept-description">{concept.description}</div>
                <div className="concept-meta">
                  <span 
                    className="difficulty-badge"
                    style={{ color: getDifficultyColor(concept.difficulty) }}
                  >
                    {concept.difficulty}
                  </span>
                  <span className="time-estimate">{concept.estimatedTime}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="concept-content">
        {renderConceptContent()}
      </div>
    </div>
  );
};

export default ConceptPages;
