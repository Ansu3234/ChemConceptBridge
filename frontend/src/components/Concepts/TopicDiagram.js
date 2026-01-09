import React, { useState } from 'react';
import PeriodicTable from '../PeriodicTable/PeriodicTable';
import MoleculeAnimation from '../MoleculeAnimation/MoleculeAnimation';
import './TopicDiagram.css';

// pH Scale Component
const PHScale = () => {
  const getPHColor = (pH) => {
    if (pH < 3) return '#ff0000';
    if (pH < 5) return '#ff6600';
    if (pH < 6) return '#ffcc00';
    if (pH < 7) return '#ffff00';
    if (pH === 7) return '#00ff00';
    if (pH < 9) return '#00ccff';
    if (pH < 11) return '#0066ff';
    return '#0000ff';
  };

  return (
    <div className="ph-scale-diagram">
      <div className="ph-scale-header">
        <span>Acidic</span>
        <span>Neutral</span>
        <span>Basic</span>
      </div>
      <div className="ph-scale-bar">
        {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14].map(pH => (
          <div
            key={pH}
            className={`ph-value ${pH < 7 ? 'acidic' : pH === 7 ? 'neutral' : 'basic'}`}
            style={{ backgroundColor: getPHColor(pH) }}
            title={`pH ${pH}`}
          >
            {pH}
          </div>
        ))}
      </div>
      <div className="ph-formula-display">
        <strong>pH = -log[H⁺]</strong>
      </div>
    </div>
  );
};

// Energy Diagram for Thermodynamics
const EnergyDiagram = () => {
  return (
    <div className="energy-diagram">
      <div className="energy-axis">
        <div className="energy-label">Energy</div>
        <div className="energy-levels">
          <div className="energy-bar products" style={{ height: '40%' }}>
            <span>Products (Lower Energy)</span>
          </div>
          <div className="energy-bar activation" style={{ height: '20%' }}>
            <span>Activation Energy</span>
          </div>
          <div className="energy-bar reactants" style={{ height: '40%' }}>
            <span>Reactants (Higher Energy)</span>
          </div>
        </div>
      </div>
      <div className="energy-legend">
        <div className="legend-item">
          <span className="legend-color" style={{ background: '#3b82f6' }}></span>
          <span>Reactants</span>
        </div>
        <div className="legend-item">
          <span className="legend-color" style={{ background: '#f59e0b' }}></span>
          <span>Activation Energy</span>
        </div>
        <div className="legend-item">
          <span className="legend-color" style={{ background: '#10b981' }}></span>
          <span>Products</span>
        </div>
      </div>
    </div>
  );
};

// Stoichiometry Balance Diagram
const StoichiometryDiagram = () => {
  return (
    <div className="stoichiometry-diagram">
      <div className="reaction-equation">
        <div className="reactant-side">
          <div className="molecule">2H₂</div>
          <span>+</span>
          <div className="molecule">O₂</div>
        </div>
        <div className="arrow">→</div>
        <div className="product-side">
          <div className="molecule">2H₂O</div>
        </div>
      </div>
      <div className="mole-ratios">
        <div className="ratio-item">
          <strong>2 mol H₂</strong> : <strong>1 mol O₂</strong> : <strong>2 mol H₂O</strong>
        </div>
        <div className="ratio-item">
          <strong>4 g H₂</strong> : <strong>32 g O₂</strong> : <strong>36 g H₂O</strong>
        </div>
      </div>
    </div>
  );
};

// Equilibrium Diagram
const EquilibriumDiagram = () => {
  const [equilibrium, setEquilibrium] = useState(50);
  
  return (
    <div className="equilibrium-diagram">
      <div className="equilibrium-container">
        <div className="reactants-box">
          <div className="box-label">Reactants</div>
          <div className="particles" style={{ opacity: (100 - equilibrium) / 100 }}>
            {[...Array(20)].map((_, i) => (
              <div key={i} className="particle reactant"></div>
            ))}
          </div>
        </div>
        <div className="equilibrium-arrow">
          <div className="arrow-left">⇌</div>
        </div>
        <div className="products-box">
          <div className="box-label">Products</div>
          <div className="particles" style={{ opacity: equilibrium / 100 }}>
            {[...Array(20)].map((_, i) => (
              <div key={i} className="particle product"></div>
            ))}
          </div>
        </div>
      </div>
      <div className="equilibrium-control">
        <label>Equilibrium Position: {equilibrium}%</label>
        <input
          type="range"
          min="0"
          max="100"
          value={equilibrium}
          onChange={(e) => setEquilibrium(Number(e.target.value))}
        />
      </div>
    </div>
  );
};

// Redox Diagram
const RedoxDiagram = () => {
  return (
    <div className="redox-diagram">
      <div className="redox-reaction">
        <div className="redox-half">
          <div className="half-title">Oxidation</div>
          <div className="half-reaction">
            <span className="element">Zn</span>
            <span>→</span>
            <span className="element">Zn²⁺</span>
            <span>+</span>
            <span className="electron">2e⁻</span>
          </div>
          <div className="half-note">Loss of electrons</div>
        </div>
        <div className="redox-separator">+</div>
        <div className="redox-half">
          <div className="half-title">Reduction</div>
          <div className="half-reaction">
            <span className="element">Cu²⁺</span>
            <span>+</span>
            <span className="electron">2e⁻</span>
            <span>→</span>
            <span className="element">Cu</span>
          </div>
          <div className="half-note">Gain of electrons</div>
        </div>
      </div>
      <div className="redox-total">
        <strong>Overall: Zn + Cu²⁺ → Zn²⁺ + Cu</strong>
      </div>
    </div>
  );
};

const TopicDiagram = ({ topic }) => {
  const topicLower = (topic || '').toLowerCase();

  if (topicLower.includes('periodic table')) {
    return (
      <div className="topic-diagram-container">
        <PeriodicTable />
      </div>
    );
  }

  if (topicLower.includes('acids') || topicLower.includes('bases')) {
    return (
      <div className="topic-diagram-container">
        <PHScale />
      </div>
    );
  }

  if (topicLower.includes('bonding') || topicLower.includes('organic')) {
    return (
      <div className="topic-diagram-container">
        <MoleculeAnimation />
      </div>
    );
  }

  if (topicLower.includes('thermodynamics')) {
    return (
      <div className="topic-diagram-container">
        <EnergyDiagram />
      </div>
    );
  }

  if (topicLower.includes('stoichiometry')) {
    return (
      <div className="topic-diagram-container">
        <StoichiometryDiagram />
      </div>
    );
  }

  if (topicLower.includes('equilibrium')) {
    return (
      <div className="topic-diagram-container">
        <EquilibriumDiagram />
      </div>
    );
  }

  if (topicLower.includes('redox')) {
    return (
      <div className="topic-diagram-container">
        <RedoxDiagram />
      </div>
    );
  }

  // Default placeholder
  return (
    <div className="topic-diagram-placeholder">
      <div className="placeholder-icon">⚛️</div>
      <div className="placeholder-text">Interactive visualization for {topic || 'this concept'}</div>
    </div>
  );
};

export default TopicDiagram;

