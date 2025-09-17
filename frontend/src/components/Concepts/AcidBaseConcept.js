import React, { useState } from 'react';
import './AcidBaseConcept.css';

const AcidBaseConcept = () => {
  const [activeSection, setActiveSection] = useState('overview');

  const sections = [
    { id: 'overview', title: 'Overview', icon: '📋' },
    { id: 'definitions', title: 'Definitions', icon: '📖' },
    { id: 'ph-scale', title: 'pH Scale', icon: '📊' },
    { id: 'reactions', title: 'Reactions', icon: '⚗️' },
    { id: 'buffers', title: 'Buffers', icon: '🛡️' },
    { id: 'examples', title: 'Examples', icon: '💡' }
  ];

  const renderOverview = () => (
    <div className="concept-section">
      <h2>Acids and Bases Overview</h2>
      <div className="concept-intro">
        <div className="intro-card">
          <h3>What are Acids and Bases?</h3>
          <p>
            Acids and bases are fundamental concepts in chemistry that describe the properties 
            of substances based on their ability to donate or accept protons (H⁺ ions).
          </p>
        </div>
        
        <div className="key-concepts">
          <h3>Key Concepts</h3>
          <ul>
            <li>Arrhenius definition of acids and bases</li>
            <li>Brønsted-Lowry acid-base theory</li>
            <li>pH scale and its significance</li>
            <li>Acid-base reactions and neutralization</li>
            <li>Buffer solutions and their importance</li>
          </ul>
        </div>
      </div>
    </div>
  );

  const renderDefinitions = () => (
    <div className="concept-section">
      <h2>Acid-Base Definitions</h2>
      
      <div className="definition-cards">
        <div className="definition-card">
          <h3>Arrhenius Definition</h3>
          <div className="definition-content">
            <div className="definition-item">
              <strong>Acid:</strong> A substance that increases the concentration of H⁺ ions in aqueous solution
            </div>
            <div className="definition-item">
              <strong>Base:</strong> A substance that increases the concentration of OH⁻ ions in aqueous solution
            </div>
            <div className="example">
              <strong>Example:</strong> HCl → H⁺ + Cl⁻ (acid), NaOH → Na⁺ + OH⁻ (base)
            </div>
          </div>
        </div>

        <div className="definition-card">
          <h3>Brønsted-Lowry Definition</h3>
          <div className="definition-content">
            <div className="definition-item">
              <strong>Acid:</strong> A proton (H⁺) donor
            </div>
            <div className="definition-item">
              <strong>Base:</strong> A proton (H⁺) acceptor
            </div>
            <div className="example">
              <strong>Example:</strong> NH₃ + H₂O ⇌ NH₄⁺ + OH⁻
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderPHScale = () => (
    <div className="concept-section">
      <h2>pH Scale</h2>
      
      <div className="ph-scale-container">
        <div className="ph-scale">
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
              >
                {pH}
              </div>
            ))}
          </div>
        </div>
        
        <div className="ph-info">
          <div className="ph-formula">
            <h3>pH Formula</h3>
            <div className="formula">pH = -log[H⁺]</div>
          </div>
          
          <div className="ph-examples">
            <h3>Common Examples</h3>
            <div className="example-list">
              <div className="example-item">
                <span className="ph-value-small acidic">1</span>
                <span>Stomach acid</span>
              </div>
              <div className="example-item">
                <span className="ph-value-small acidic">3</span>
                <span>Orange juice</span>
              </div>
              <div className="example-item">
                <span className="ph-value-small neutral">7</span>
                <span>Pure water</span>
              </div>
              <div className="example-item">
                <span className="ph-value-small basic">11</span>
                <span>Ammonia</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

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

  const renderReactions = () => (
    <div className="concept-section">
      <h2>Acid-Base Reactions</h2>
      
      <div className="reaction-cards">
        <div className="reaction-card">
          <h3>Neutralization Reaction</h3>
          <div className="reaction-equation">
            Acid + Base → Salt + Water
          </div>
          <div className="reaction-example">
            <strong>Example:</strong> HCl + NaOH → NaCl + H₂O
          </div>
        </div>

        <div className="reaction-card">
          <h3>Strong vs Weak Acids</h3>
          <div className="comparison">
            <div className="comparison-item">
              <strong>Strong Acids:</strong> Completely dissociate in water
              <div className="example">HCl, H₂SO₄, HNO₃</div>
            </div>
            <div className="comparison-item">
              <strong>Weak Acids:</strong> Partially dissociate in water
              <div className="example">CH₃COOH, H₂CO₃, HF</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderBuffers = () => (
    <div className="concept-section">
      <h2>Buffer Solutions</h2>
      
      <div className="buffer-content">
        <div className="buffer-definition">
          <h3>What is a Buffer?</h3>
          <p>
            A buffer solution is a solution that resists changes in pH when small amounts 
            of acid or base are added. It consists of a weak acid and its conjugate base, 
            or a weak base and its conjugate acid.
          </p>
        </div>

        <div className="buffer-examples">
          <h3>Common Buffer Systems</h3>
          <div className="buffer-list">
            <div className="buffer-item">
              <strong>Acetic Acid/Acetate:</strong> CH₃COOH/CH₃COO⁻
            </div>
            <div className="buffer-item">
              <strong>Ammonia/Ammonium:</strong> NH₃/NH₄⁺
            </div>
            <div className="buffer-item">
              <strong>Phosphate Buffer:</strong> H₂PO₄⁻/HPO₄²⁻
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderExamples = () => (
    <div className="concept-section">
      <h2>Real-World Examples</h2>
      
      <div className="examples-grid">
        <div className="example-card">
          <h3>Biological Systems</h3>
          <ul>
            <li>Blood pH maintained at ~7.4 by bicarbonate buffer</li>
            <li>Stomach acid (pH ~1.5) for protein digestion</li>
            <li>Enzyme activity depends on optimal pH</li>
          </ul>
        </div>

        <div className="example-card">
          <h3>Environmental</h3>
          <ul>
            <li>Acid rain (pH &lt; 5.6) damages ecosystems</li>
            <li>Ocean acidification affects marine life</li>
            <li>Soil pH affects plant growth</li>
          </ul>
        </div>

        <div className="example-card">
          <h3>Industrial</h3>
          <ul>
            <li>Water treatment and purification</li>
            <li>Food preservation and processing</li>
            <li>Pharmaceutical manufacturing</li>
          </ul>
        </div>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeSection) {
      case 'overview': return renderOverview();
      case 'definitions': return renderDefinitions();
      case 'ph-scale': return renderPHScale();
      case 'reactions': return renderReactions();
      case 'buffers': return renderBuffers();
      case 'examples': return renderExamples();
      default: return renderOverview();
    }
  };

  return (
    <div className="acid-base-concept">
      <div className="concept-navigation">
        {sections.map(section => (
          <button
            key={section.id}
            className={`nav-button ${activeSection === section.id ? 'active' : ''}`}
            onClick={() => setActiveSection(section.id)}
          >
            <span className="nav-icon">{section.icon}</span>
            <span className="nav-label">{section.title}</span>
          </button>
        ))}
      </div>

      <div className="concept-main-content">
        {renderContent()}
      </div>
    </div>
  );
};

export default AcidBaseConcept;
