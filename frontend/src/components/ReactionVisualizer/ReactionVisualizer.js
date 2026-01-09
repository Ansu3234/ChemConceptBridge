import React, { useState, useRef, useEffect } from 'react';
import './ReactionVisualizer.css';

const REACTIONS = [
  {
    id: 1,
    name: 'Combustion: Methane + Oxygen',
    equation: 'CH₄ + 2O₂ → CO₂ + 2H₂O',
    reactants: ['CH₄', 'O₂'],
    products: ['CO₂', 'H₂O'],
    type: 'exothermic',
    description: 'Natural gas burns in oxygen to produce carbon dioxide and water vapor',
    energetics: 'Releases 890 kJ/mol (Highly exothermic)',
    visualization: 'combustion_methane',
    colors: {
      CH4: '#808080',
      O2: '#3050F8',
      CO2: '#D3D3D3',
      H2O: '#87CEEB'
    }
  },
  {
    id: 2,
    name: 'Acid-Base: HCl + NaOH',
    equation: 'HCl + NaOH → NaCl + H₂O',
    reactants: ['HCl', 'NaOH'],
    products: ['NaCl', 'H₂O'],
    type: 'exothermic',
    description: 'A strong acid reacts with a strong base to form salt and water',
    energetics: 'Releases 57.3 kJ/mol (Exothermic)',
    visualization: 'acid_base',
    colors: {
      HCl: '#FF6B6B',
      NaOH: '#4ECDC4',
      NaCl: '#FFD93D',
      H2O: '#87CEEB'
    }
  },
  {
    id: 3,
    name: 'Oxidation: Copper + Oxygen',
    equation: '2Cu + O₂ → 2CuO',
    reactants: ['Cu', 'O₂'],
    products: ['CuO'],
    type: 'exothermic',
    description: 'Copper metal oxidizes when heated in oxygen to form copper oxide',
    energetics: 'Releases 310 kJ/mol (Exothermic)',
    visualization: 'copper_oxidation',
    colors: {
      Cu: '#B87333',
      O2: '#3050F8',
      CuO: '#000000'
    }
  },
  {
    id: 4,
    name: 'Synthesis: Hydrogen + Chlorine',
    equation: 'H₂ + Cl₂ → 2HCl',
    reactants: ['H₂', 'Cl₂'],
    products: ['HCl'],
    type: 'exothermic',
    description: 'Hydrogen and chlorine gases combine to form hydrogen chloride',
    energetics: 'Releases 184 kJ/mol (Exothermic)',
    visualization: 'hydrogen_chlorine',
    colors: {
      H2: '#FFFFFF',
      Cl2: '#90EE90',
      HCl: '#FFB6C1'
    }
  },
  {
    id: 5,
    name: 'Decomposition: Calcium Carbonate',
    equation: 'CaCO₃ → CaO + CO₂',
    reactants: ['CaCO₃'],
    products: ['CaO', 'CO₂'],
    type: 'endothermic',
    description: 'Limestone decomposes when heated to form quicklime and carbon dioxide',
    energetics: 'Requires 178 kJ/mol (Endothermic)',
    visualization: 'decomposition',
    colors: {
      CaCO3: '#F5DEB3',
      CaO: '#FFFACD',
      CO2: '#D3D3D3'
    }
  }
];

const ReactionVisualizer = () => {
  const [selectedReaction, setSelectedReaction] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [animationProgress, setAnimationProgress] = useState(0);
  const canvasRef = useRef(null);

  const reaction = REACTIONS[selectedReaction];

  useEffect(() => {
    if (!isAnimating) return;

    const interval = setInterval(() => {
      setAnimationProgress((prev) => {
        if (prev >= 100) {
          setIsAnimating(false);
          return 100;
        }
        return prev + 2;
      });
    }, 30);

    return () => clearInterval(interval);
  }, [isAnimating]);

  useEffect(() => {
    if (canvasRef.current) {
      drawReaction(canvasRef.current, reaction, animationProgress);
    }
  }, [reaction, animationProgress]);

  const drawReaction = (canvas, reaction, progress) => {
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;

    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, width, height);

    ctx.font = '14px Arial';
    ctx.fillStyle = '#333';

    const centerY = height / 2;
    const reactantX = 80;
    const arrowX = width / 2;
    const productX = width - 80;

    const moleculeSize = 30;

    ctx.font = 'bold 12px Arial';

    reaction.reactants.forEach((reactant, idx) => {
      const y = centerY - (reaction.reactants.length * 40) / 2 + idx * 50;
      const x = reactantX;

      const opacity = 1 - (progress / 100) * 0.7;
      ctx.globalAlpha = opacity;

      ctx.fillStyle = reaction.colors[reactant] || '#4ECDC4';
      ctx.beginPath();
      ctx.arc(x, y, moleculeSize / 2, 0, Math.PI * 2);
      ctx.fill();

      ctx.globalAlpha = 1;
      ctx.fillStyle = '#fff';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(reactant, x, y);
    });

    ctx.globalAlpha = 1;
    ctx.strokeStyle = '#666';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(arrowX - 30, centerY);
    ctx.lineTo(arrowX + 30, centerY);
    ctx.stroke();

    ctx.fillStyle = '#666';
    ctx.beginPath();
    ctx.moveTo(arrowX + 30, centerY);
    ctx.lineTo(arrowX + 20, centerY - 5);
    ctx.lineTo(arrowX + 20, centerY + 5);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = reaction.type === 'exothermic' ? '#FF6B6B' : '#3B82F6';
    ctx.font = '10px Arial';
    ctx.fillText(reaction.type.toUpperCase(), arrowX, centerY - 20);

    reaction.products.forEach((product, idx) => {
      const y = centerY - (reaction.products.length * 40) / 2 + idx * 50;
      const x = productX;

      const opacity = Math.min((progress / 100) * 1.5, 1);
      ctx.globalAlpha = opacity;

      ctx.fillStyle = reaction.colors[product] || '#FFD93D';
      ctx.beginPath();
      ctx.arc(x, y, moleculeSize / 2, 0, Math.PI * 2);
      ctx.fill();

      ctx.globalAlpha = 1;
      ctx.fillStyle = '#fff';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.font = 'bold 12px Arial';
      ctx.fillText(product, x, y);
    });

    if (reaction.type === 'exothermic' && progress > 30) {
      const heatIntensity = Math.min((progress - 30) / 70, 1);
      ctx.globalAlpha = 0.3 * heatIntensity;
      ctx.fillStyle = '#FF6B6B';
      ctx.beginPath();
      ctx.arc(arrowX, centerY, 50 * heatIntensity, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;
    }
  };

  const startAnimation = () => {
    setAnimationProgress(0);
    setIsAnimating(true);
  };

  const resetAnimation = () => {
    setAnimationProgress(0);
    setIsAnimating(false);
  };

  return (
    <div className="reaction-visualizer">
      <div className="rv-header">
        <h2>Chemical Reaction Visualizer</h2>
        <p>Observe atomic and molecular rearrangement in chemical reactions</p>
      </div>

      <div className="rv-container">
        <div className="rv-selector">
          <h3>Select Reaction:</h3>
          <div className="reactions-list">
            {REACTIONS.map((rxn, idx) => (
              <button
                key={rxn.id}
                className={`reaction-btn ${selectedReaction === idx ? 'active' : ''}`}
                onClick={() => {
                  setSelectedReaction(idx);
                  resetAnimation();
                }}
              >
                <div className="rxn-type">
                  <span className={`type-badge ${rxn.type}`}>
                    {rxn.type === 'exothermic' ? '🔥' : '❄️'}
                  </span>
                </div>
                <div className="rxn-info">
                  <div className="rxn-name">{rxn.name}</div>
                  <div className="rxn-eq">{rxn.equation}</div>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="rv-content">
          <div className="rv-details">
            <h3>{reaction.name}</h3>
            <div className="equation-box">
              <div className="equation">{reaction.equation}</div>
              <div className={`reaction-type ${reaction.type}`}>
                {reaction.type === 'exothermic' ? '🔥 Exothermic' : '❄️ Endothermic'}
              </div>
            </div>

            <p className="description">{reaction.description}</p>

            <div className="energetics-box">
              <h4>⚡ Energy Change:</h4>
              <p>{reaction.energetics}</p>
            </div>
          </div>

          <div className="rv-canvas-area">
            <canvas
              ref={canvasRef}
              width={500}
              height={300}
              className="rv-canvas"
            />
            <div className="progress-indicator">
              <div className="progress-bar">
                <div
                  className="progress-fill"
                  style={{ width: `${animationProgress}%` }}
                />
              </div>
              <span className="progress-text">{animationProgress}%</span>
            </div>
          </div>

          <div className="rv-legend">
            <h4>Legend:</h4>
            <div className="legend-items">
              <div className="legend-section">
                <h5>Reactants:</h5>
                {reaction.reactants.map((reactant) => (
                  <div key={reactant} className="legend-item">
                    <div
                      className="legend-color"
                      style={{ backgroundColor: reaction.colors[reactant] || '#4ECDC4' }}
                    />
                    <span>{reactant}</span>
                  </div>
                ))}
              </div>

              <div className="legend-section">
                <h5>Products:</h5>
                {reaction.products.map((product) => (
                  <div key={product} className="legend-item">
                    <div
                      className="legend-color"
                      style={{ backgroundColor: reaction.colors[product] || '#FFD93D' }}
                    />
                    <span>{product}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="rv-controls">
            <button
              className="btn btn-primary"
              onClick={startAnimation}
              disabled={isAnimating}
            >
              ▶️ Start Reaction
            </button>
            <button
              className="btn btn-secondary"
              onClick={resetAnimation}
            >
              🔄 Reset
            </button>
          </div>

          <div className="rv-info-box">
            <h4>ℹ️ How to Use:</h4>
            <ul>
              <li>Select a reaction from the list on the left</li>
              <li>Click "Start Reaction" to animate the chemical process</li>
              <li>Watch as reactant molecules transform into products</li>
              <li>Notice the energy indicator (for exothermic/endothermic reactions)</li>
              <li>Review the energetics to understand heat release or absorption</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReactionVisualizer;
