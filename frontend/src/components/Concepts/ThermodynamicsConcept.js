import React, { useMemo, useState } from 'react';
import './ThermodynamicsConcept.css';

const sections = [
  { id: 'fundamentals', title: 'Thermodynamic Fundamentals', icon: '🔥' },
  { id: 'laws', title: 'Laws of Thermodynamics', icon: '📜' },
  { id: 'enthalpy', title: 'Enthalpy & Energy Diagrams', icon: '📊' },
  { id: 'entropy', title: 'Entropy & Spontaneity', icon: '♾️' },
  { id: 'gibbs', title: 'Gibbs Free Energy', icon: '⚖️' },
  { id: 'practice', title: 'Applications & Practice', icon: '🧠' }
];

const lawHighlights = [
  {
    name: 'Zeroth Law',
    statement: 'If A is in thermal equilibrium with B, and B with C, then A and C are in equilibrium.',
    implication: 'Defines temperature as a measurable and transitive property.'
  },
  {
    name: 'First Law',
    statement: 'Energy cannot be created or destroyed; ΔU = q + w.',
    implication: 'Internal energy change equals heat added plus work done on the system.'
  },
  {
    name: 'Second Law',
    statement: 'Entropy of an isolated system never decreases; spontaneous processes increase entropy.',
    implication: 'Heat flows naturally from hot to cold; some energy becomes unavailable for work.'
  },
  {
    name: 'Third Law',
    statement: 'As temperature approaches absolute zero, entropy approaches a minimum constant.',
    implication: 'Impossible to reach absolute zero; provides reference point for entropy values.'
  }
];

const enthalpyConcepts = [
  {
    title: 'Exothermic vs Endothermic',
    content: 'Exothermic processes release heat (ΔH < 0). Endothermic processes absorb heat (ΔH > 0).'
  },
  {
    title: 'Enthalpy Change Calculation',
    content: 'ΔH = ΣΔHf°(products) – ΣΔHf°(reactants). Use Hess’s Law to add/subtract reactions.'
  },
  {
    title: 'Heat Capacity & Calorimetry',
    content: 'q = mcΔT (mass × specific heat × temperature change). Applied in bomb and coffee-cup calorimeters.'
  }
];

const entropyInsights = [
  {
    title: 'Entropy (S)',
    detail: 'Measure of disorder or dispersal of energy. Reactions producing more particles or gas tend to increase entropy.'
  },
  {
    title: 'Second Law Applications',
    detail: 'A spontaneous change increases the total entropy of system + surroundings. ΔSuniverse > 0.'
  },
  {
    title: 'Microstates',
    detail: 'S = k ln W, where W is the number of microstates. More possible arrangements → higher entropy.'
  }
];

const gibbsPoints = [
  {
    title: 'Equation',
    detail: 'ΔG = ΔH – TΔS. Combines enthalpy and entropy to predict spontaneity at constant T and P.'
  },
  {
    title: 'Interpretation',
    detail: 'ΔG < 0 → spontaneous, ΔG = 0 → equilibrium, ΔG > 0 → non-spontaneous (reverse direction favoured).'
  },
  {
    title: 'Temperature Dependence',
    detail: 'Processes with ΔH > 0 and ΔS > 0 become spontaneous at high T (e.g., ice melting).'
  }
];

const practiceScenarios = [
  {
    prompt: 'Heating Ice',
    question: 'Sketch a heating curve for ice from –20 °C to 120 °C and label phase changes. Identify where temperature remains constant.',
    hint: 'Plateaus correspond to melting and boiling; energy used to break intermolecular forces.'
  },
  {
    prompt: 'Spontaneity Check',
    question: 'Predict if the dissolution of ammonium nitrate in water (ΔH > 0, ΔS > 0) is spontaneous at room temperature.',
    hint: 'Consider the sign of ΔG = ΔH – TΔS at moderate temperatures.'
  },
  {
    prompt: 'Calorimetry',
    question: 'A 25 g metal sample releases 550 J when cooling from 80 °C to 30 °C. Find its specific heat capacity.',
    hint: 'Rearrange q = mcΔT. Heat lost by metal equals heat gained by surroundings (ignore losses).' }
];

const ThermodynamicsConcept = () => {
  const [activeSection, setActiveSection] = useState('fundamentals');

  const lawCards = useMemo(
    () =>
      lawHighlights.map(law => (
        <div key={law.name} className="thermo-law-card">
          <h4>{law.name}</h4>
          <p className="thermo-law-statement">{law.statement}</p>
          <p className="thermo-law-implication">{law.implication}</p>
        </div>
      )),
    []
  );

  const enthalpyCards = useMemo(
    () =>
      enthalpyConcepts.map(concept => (
        <div key={concept.title} className="thermo-enthalpy-card">
          <h4>{concept.title}</h4>
          <p>{concept.content}</p>
        </div>
      )),
    []
  );

  const entropyCards = useMemo(
    () =>
      entropyInsights.map(insight => (
        <div key={insight.title} className="thermo-entropy-card">
          <h4>{insight.title}</h4>
          <p>{insight.detail}</p>
        </div>
      )),
    []
  );

  const gibbsCards = useMemo(
    () =>
      gibbsPoints.map(point => (
        <div key={point.title} className="thermo-gibbs-card">
          <h4>{point.title}</h4>
          <p>{point.detail}</p>
        </div>
      )),
    []
  );

  const renderSection = () => {
    switch (activeSection) {
      case 'fundamentals':
        return (
          <section className="thermo-section">
            <div className="thermo-two-column">
              <div className="thermo-card">
                <h3>Systems & Surroundings</h3>
                <ul>
                  <li><strong>System:</strong> Part of the universe we study (e.g., reaction mixture).</li>
                  <li><strong>Surroundings:</strong> Everything else (solution, container, lab environment).</li>
                  <li><strong>Boundary:</strong> Imaginary surface separating system and surroundings.</li>
                </ul>
                <div className="thermo-callout">
                  Classify processes as <em>open</em> (exchange matter & energy), <em>closed</em> (energy only), or <em>isolated</em> (neither).
                </div>
              </div>
              <div className="thermo-card highlight">
                <h3>State Functions</h3>
                <p>Properties depending only on the current state (not path): U (internal energy), H (enthalpy), S (entropy), G (Gibbs free energy).</p>
                <p>Path functions (q, w) depend on how the change occurs.</p>
              </div>
            </div>
            <div className="thermo-key-facts">
              <div className="thermo-fact-card">Heat (q) flows due to temperature differences; work (w) is energy transfer via force acting through a distance.</div>
              <div className="thermo-fact-card">Positive q or w means energy enters the system. Negative values mean energy leaves the system.</div>
              <div className="thermo-fact-card">Energy units: calorie (cal), joule (J), kilojoule (kJ). 1 cal ≈ 4.184 J.</div>
            </div>
          </section>
        );
      case 'laws':
        return (
          <section className="thermo-section">
            <h3>Laws of Thermodynamics</h3>
            <p className="thermo-intro">Each law builds a foundational principle for energy transfer and equilibrium.</p>
            <div className="thermo-law-grid">{lawCards}</div>
            <div className="thermo-note">
              <strong>Experiment:</strong> Use calorimeters, heat engines, or refrigerators as real-world examples when demonstrating the laws in the classroom.
            </div>
          </section>
        );
      case 'enthalpy':
        return (
          <section className="thermo-section">
            <h3>Enthalpy & Energy Diagrams</h3>
            <div className="thermo-enthalpy-grid">{enthalpyCards}</div>
            <div className="thermo-diagram">
              <div className="thermo-axis">
                <span className="thermo-axis-label">Potential Energy</span>
                <div className="thermo-diagram-content">
                  <div className="thermo-diagram-side">
                    <h4>Exothermic</h4>
                    <p>Products lie lower than reactants. ΔH is negative; heat released to surroundings.</p>
                  </div>
                  <div className="thermo-diagram-middle">
                    <div className="thermo-peak exo">Activation Energy</div>
                    <div className="thermo-arrow exo">ΔH</div>
                  </div>
                  <div className="thermo-diagram-side">
                    <h4>Endothermic</h4>
                    <p>Products sit higher than reactants. ΔH positive; heat absorbed from surroundings.</p>
                  </div>
                </div>
              </div>
              <div className="thermo-note">
                <strong>Tip:</strong> Hess’s Law allows you to add or subtract reactions as if adding vectors—draw energy diagrams to visualise transitions.
              </div>
            </div>
          </section>
        );
      case 'entropy':
        return (
          <section className="thermo-section">
            <h3>Entropy & Disorder</h3>
            <p className="thermo-intro">
              Entropy tracks the dispersal of energy and matter. Processes increasing randomness or distributing energy more evenly drive the universe forward.
            </p>
            <div className="thermo-entropy-grid">{entropyCards}</div>
            <div className="thermo-note">
              <strong>Classroom Demo:</strong> Compare diffusion of dye in water versus ice to visualise entropy changes over time.
            </div>
          </section>
        );
      case 'gibbs':
        return (
          <section className="thermo-section">
            <h3>Gibbs Free Energy</h3>
            <div className="thermo-gibbs-grid">{gibbsCards}</div>
            <div className="thermo-summary">
              <table>
                <thead>
                  <tr>
                    <th>ΔH</th>
                    <th>ΔS</th>
                    <th>ΔG Behaviour</th>
                    <th>Example</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Negative</td>
                    <td>Positive</td>
                    <td>Spontaneous at all T</td>
                    <td>Combustion</td>
                  </tr>
                  <tr>
                    <td>Negative</td>
                    <td>Negative</td>
                    <td>Spontaneous at low T</td>
                    <td>Water freezing</td>
                  </tr>
                  <tr>
                    <td>Positive</td>
                    <td>Positive</td>
                    <td>Spontaneous at high T</td>
                    <td>Ice melting</td>
                  </tr>
                  <tr>
                    <td>Positive</td>
                    <td>Negative</td>
                    <td>Never spontaneous</td>
                    <td>Electrolysis of water</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>
        );
      case 'practice':
        return (
          <section className="thermo-section">
            <h3>Applications & Practice</h3>
            <div className="thermo-practice-grid">
              {practiceScenarios.map(scenario => (
                <div key={scenario.prompt} className="thermo-practice-card">
                  <h4>{scenario.prompt}</h4>
                  <p>{scenario.question}</p>
                  <div className="thermo-hint">💡 Hint: {scenario.hint}</div>
                </div>
              ))}
            </div>
            <div className="thermo-note">
              <strong>Integration:</strong> Link outcomes with the Confidence Meter module—students can self-rate understanding before checking their answers.
            </div>
          </section>
        );
      default:
        return null;
    }
  };

  return (
    <div className="thermodynamics-concept">
      <header className="thermo-header">
        <div>
          <h2>Thermodynamics Explorer</h2>
          <p>Investigate how energy transfers govern chemical reactions, phase changes, and spontaneity.</p>
        </div>
        <div className="thermo-meta">
          <span className="thermo-tag">Estimated time: 35 minutes</span>
          <span className="thermo-tag">Difficulty: Advanced</span>
        </div>
      </header>

      <nav className="thermo-navigation">
        {sections.map(section => (
          <button
            key={section.id}
            type="button"
            className={`thermo-nav-btn ${activeSection === section.id ? 'active' : ''}`}
            onClick={() => setActiveSection(section.id)}
          >
            <span aria-hidden="true" className="thermo-nav-icon">{section.icon}</span>
            <span>{section.title}</span>
          </button>
        ))}
      </nav>

      <main className="thermo-main">{renderSection()}</main>
    </div>
  );
};

export default ThermodynamicsConcept;
