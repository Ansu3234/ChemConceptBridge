import React, { useMemo, useState } from 'react';
import PeriodicTable from '../PeriodicTable/PeriodicTable';
import './PeriodicTableConcept.css';

const sections = [
  { id: 'layout', title: 'Table Layout', icon: '🧱' },
  { id: 'families', title: 'Element Families', icon: '🧬' },
  { id: 'trends', title: 'Periodic Trends', icon: '📈' },
  { id: 'applications', title: 'Applications & Tips', icon: '🧪' },
  { id: 'practice', title: 'Practice & Checkpoints', icon: '📝' }
];

const familyCards = [
  {
    title: 'Alkali Metals (Group 1)',
    description:
      'Highly reactive metals with one valence electron. Soft, low-density, and form +1 ions.',
    examples: ['Lithium (Li)', 'Sodium (Na)', 'Potassium (K)'],
    color: '#fbbf24'
  },
  {
    title: 'Halogens (Group 17)',
    description:
      'Reactive nonmetals that gain one electron to form -1 ions. Often exist as diatomic molecules.',
    examples: ['Fluorine (F₂)', 'Chlorine (Cl₂)', 'Iodine (I₂)'],
    color: '#38bdf8'
  },
  {
    title: 'Noble Gases (Group 18)',
    description:
      'Inert, stable gases with full valence shells. Key for lighting, welding, and cooling systems.',
    examples: ['Helium (He)', 'Neon (Ne)', 'Argon (Ar)'],
    color: '#a78bfa'
  },
  {
    title: 'Transition Metals (Groups 3-12)',
    description:
      'Form colorful compounds, multiple oxidation states, and are excellent conductors of heat and electricity.',
    examples: ['Iron (Fe)', 'Copper (Cu)', 'Gold (Au)'],
    color: '#60a5fa'
  }
];

const trendHighlights = [
  {
    title: 'Atomic Radius',
    summary: 'Size of atoms measured from nucleus to valence shell.',
    left: 'Increases down a group because new energy levels are added.',
    right: 'Decreases across a period as nuclear charge pulls electrons closer.',
    color: '#7dd3fc'
  },
  {
    title: 'Ionization Energy',
    summary: 'Energy required to remove an electron.',
    left: 'Decreases down a group because outer electrons are farther from the nucleus.',
    right: 'Increases across a period due to stronger attraction between nucleus and valence electrons.',
    color: '#fca5a5'
  },
  {
    title: 'Electronegativity',
    summary: 'Ability of an atom to attract electrons in a bond.',
    left: 'Decreases down a group as additional shells reduce the pull on bonding electrons.',
    right: 'Increases across a period with increasing nuclear charge. Fluorine is the most electronegative element.',
    color: '#bef264'
  }
];

const practicePrompts = [
  {
    question: 'Element Prediction',
    task:
      'An element is shiny, conducts electricity, and forms a +2 ion. Which family is it likely in? Explain your reasoning.',
    hint: 'Consider the number of valence electrons and metallic characteristics.'
  },
  {
    question: 'Trend Application',
    task:
      'Arrange the elements Na, K, and Li in order of increasing atomic radius and justify the order.',
    hint: 'Think about position within Group 1 and the number of energy levels.'
  },
  {
    question: 'Real-World Connection',
    task:
      'Helium is used in weather balloons instead of hydrogen. Link this usage to periodic trends and reactivity.',
    hint: 'Compare noble gas properties with those of Group 1 metals.'
  }
];

const quickFacts = [
  'Elements are ordered by increasing atomic number (number of protons).',
  'Elements in the same group have similar valence electron configurations.',
  'Periodic trends arise from the balance between nuclear charge and electron shielding.',
  'Lanthanides and actinides are placed separately to keep the table compact.'
];

const PeriodicTableConcept = () => {
  const [activeSection, setActiveSection] = useState('layout');

  const renderedFamilyCards = useMemo(
    () =>
      familyCards.map(card => (
        <div key={card.title} className="ptc-family-card" style={{ borderTopColor: card.color }}>
          <h4>{card.title}</h4>
          <p>{card.description}</p>
          <div className="ptc-chip-row">
            {card.examples.map(example => (
              <span key={example} className="ptc-chip" style={{ backgroundColor: card.color }}>
                {example}
              </span>
            ))}
          </div>
        </div>
      )),
    []
  );

  const renderedTrendCards = useMemo(
    () =>
      trendHighlights.map(trend => (
        <div key={trend.title} className="ptc-trend-card" style={{ borderColor: trend.color }}>
          <h4>{trend.title}</h4>
          <p className="ptc-trend-summary">{trend.summary}</p>
          <div className="ptc-trend-grid">
            <div>
              <p className="ptc-trend-direction">⬇ Down a group</p>
              <p>{trend.left}</p>
            </div>
            <div>
              <p className="ptc-trend-direction">➡ Across a period</p>
              <p>{trend.right}</p>
            </div>
          </div>
        </div>
      )),
    []
  );

  const renderSectionContent = () => {
    switch (activeSection) {
      case 'layout':
        return (
          <div className="ptc-section">
            <div className="ptc-two-column">
              <div className="ptc-card">
                <h3>Reading the Periodic Table</h3>
                <ul>
                  <li>Periods run horizontally and indicate the number of energy levels (shells).</li>
                  <li>Groups run vertically and reveal the number of valence electrons.</li>
                  <li>The staircase line separates metals (left) from nonmetals (right); metalloids line the border.</li>
                  <li>Lanthanides and actinides sit below the main chart for space but belong to Period 6 and 7.</li>
                </ul>
                <div className="ptc-callout">
                  Remember: Atomic number increases sequentially from left to right and top to bottom.
                </div>
              </div>
              <div className="ptc-card highlight">
                <h3>Interactive Exploration</h3>
                <p>Select elements to view their symbol, atomic number, and group/period position.</p>
                <PeriodicTable />
              </div>
            </div>
            <div className="ptc-key-facts">
              {quickFacts.map(fact => (
                <div key={fact} className="ptc-fact-card">
                  <span role="img" aria-label="spark">✨</span>
                  <p>{fact}</p>
                </div>
              ))}
            </div>
          </div>
        );
      case 'families':
        return (
          <div className="ptc-section">
            <h3>Element Families and Characteristic Properties</h3>
            <p className="ptc-section-intro">
              The periodic table is divided into families that share similar valence configurations and chemical behaviour. Exploring pattern-based
              properties helps predict reactions and product formation.
            </p>
            <div className="ptc-family-grid">{renderedFamilyCards}</div>
            <div className="ptc-note">
              <strong>Teacher Tip:</strong> Have learners build flashcards for each family, highlighting valence electrons, ionic charge, and a common application.
            </div>
          </div>
        );
      case 'trends':
        return (
          <div className="ptc-section">
            <h3>Mastering Periodic Trends</h3>
            <p className="ptc-section-intro">
              Trends explain how atomic properties change systematically. Use them to compare reactivity, bonding tendencies, and stability across elements.
            </p>
            <div className="ptc-trend-grid-wrapper">{renderedTrendCards}</div>
            <div className="ptc-trend-summary-card">
              <h4>Putting It Together</h4>
              <p>
                Moving diagonally from francium (bottom-left) to fluorine (top-right) shows decreasing atomic size but increasing ionization energy and electronegativity.
                This diagonal trend explains why fluorine is highly reactive—it easily attracts electrons.
              </p>
            </div>
          </div>
        );
      case 'applications':
        return (
          <div className="ptc-section">
            <h3>Real-World Applications & Study Tips</h3>
            <div className="ptc-two-column">
              <div className="ptc-card">
                <h4>Everyday Chemistry</h4>
                <ul>
                  <li><strong>Medical:</strong> Radioisotopes like Technetium-99m trace physiological pathways.</li>
                  <li><strong>Industrial:</strong> Catalytic converters rely on platinum group metals to reduce emissions.</li>
                  <li><strong>Energy:</strong> Lanthanides power strong magnets in wind turbines and electric vehicles.</li>
                </ul>
              </div>
              <div className="ptc-card">
                <h4>Study Strategies</h4>
                <ul>
                  <li>Group elements by valence electrons in colour-coded mind maps.</li>
                  <li>Create mnemonics for order: “Happy Henry Likes Beer Brownies” (H, He, Li, Be, B...).</li>
                  <li>Practice tracing trends with arrows for each property (↑/↓ or →/←).</li>
                </ul>
              </div>
            </div>
            <div className="ptc-timeline">
              <div className="ptc-timeline-item">
                <span className="ptc-timeline-dot" />
                <div>
                  <h4>1869 — Dmitri Mendeleev</h4>
                  <p>Predicted the existence of undiscovered elements by leaving gaps for them in his table.</p>
                </div>
              </div>
              <div className="ptc-timeline-item">
                <span className="ptc-timeline-dot" />
                <div>
                  <h4>1913 — Henry Moseley</h4>
                  <p>Reordered the table by atomic number, explaining inconsistencies in Mendeleev’s arrangement.</p>
                </div>
              </div>
              <div className="ptc-timeline-item">
                <span className="ptc-timeline-dot" />
                <div>
                  <h4>Present Day</h4>
                  <p>Modern tables include synthetic elements and utilise interactive digital tools—like the one above!</p>
                </div>
              </div>
            </div>
          </div>
        );
      case 'practice':
        return (
          <div className="ptc-section">
            <h3>Practice Checkpoints</h3>
            <p className="ptc-section-intro">
              Use these prompts to test understanding. Pair answers with self-explanations or peer discussions to reinforce retention.
            </p>
            <div className="ptc-practice-grid">
              {practicePrompts.map(prompt => (
                <div key={prompt.question} className="ptc-practice-card">
                  <h4>{prompt.question}</h4>
                  <p>{prompt.task}</p>
                  <div className="ptc-hint">💡 Hint: {prompt.hint}</div>
                </div>
              ))}
            </div>
            <div className="ptc-note">
              <strong>Extension:</strong> Connect with the Concept Mapping tool to link periodic trends with bonding types and reactivity of compounds studied in other modules.
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="periodic-table-concept">
      <header className="ptc-header">
        <div>
          <h2>Periodic Table Deep Dive</h2>
          <p>Decode element organisation, identify recurring patterns, and apply trends to predict behaviour.</p>
        </div>
        <div className="ptc-meta">
          <span className="ptc-tag">Estimated time: 25 minutes</span>
          <span className="ptc-tag">Difficulty: Intermediate</span>
        </div>
      </header>

      <nav className="ptc-navigation">
        {sections.map(section => (
          <button
            key={section.id}
            type="button"
            className={`ptc-nav-btn ${activeSection === section.id ? 'active' : ''}`}
            onClick={() => setActiveSection(section.id)}
          >
            <span className="ptc-nav-icon" aria-hidden="true">{section.icon}</span>
            <span>{section.title}</span>
          </button>
        ))}
      </nav>

      <main className="ptc-main">{renderSectionContent()}</main>
    </div>
  );
};

export default PeriodicTableConcept;
