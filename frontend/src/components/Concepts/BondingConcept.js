import React, { useMemo, useState } from 'react';
import MoleculeAnimation from '../MoleculeAnimation/MoleculeAnimation';
import './BondingConcept.css';

const sections = [
  { id: 'overview', title: 'Bonding Overview', icon: '🔬' },
  { id: 'ionic', title: 'Ionic Bonds', icon: '🧂' },
  { id: 'covalent', title: 'Covalent Bonds', icon: '🧪' },
  { id: 'metallic', title: 'Metallic Bonds', icon: '⚙️' },
  { id: 'vsepr', title: 'Shapes (VSEPR)', icon: '🔺' },
  { id: 'practice', title: 'Compare & Practice', icon: '✅' }
];

const ionicSteps = [
  { title: 'Electron Transfer', detail: 'A metal atom loses electrons to form a positively charged cation.' },
  { title: 'Nonmetal Gains Electrons', detail: 'A nonmetal atom gains electrons to form a negatively charged anion.' },
  { title: 'Electrostatic Attraction', detail: 'Opposite charges attract, forming a strong ionic lattice (e.g., NaCl).' }
];

const covalentTypes = [
  { title: 'Single Bond', detail: 'Two electrons (one pair) shared, e.g., H₂ (H—H)', color: '#38bdf8' },
  { title: 'Double Bond', detail: 'Four electrons (two pairs) shared, e.g., O₂ (O═O)', color: '#f59e0b' },
  { title: 'Triple Bond', detail: 'Six electrons (three pairs) shared, e.g., N₂ (N≡N)', color: '#ef4444' }
];

const metallicFeatures = [
  'Metal atoms release valence electrons into a “sea” of delocalised electrons.',
  'Positive metal ions are fixed in a lattice while electrons move freely.',
  'Explains high electrical/thermal conductivity and malleability/ductility.'
];

const vseprShapes = [
  {
    name: 'Linear (AX₂)',
    description: '180° bond angle. Two electron groups with no lone pairs.',
    examples: ['CO₂', 'BeCl₂']
  },
  {
    name: 'Trigonal Planar (AX₃)',
    description: '120° bond angles. Three electron groups, no lone pairs.',
    examples: ['BF₃', 'SO₃']
  },
  {
    name: 'Tetrahedral (AX₄)',
    description: '109.5°. Four electron groups, classic 3D arrangement.',
    examples: ['CH₄', 'NH₄⁺']
  },
  {
    name: 'Trigonal Pyramidal (AX₃E)',
    description: '107°. Three bonding pairs, one lone pair pushing bonds downwards.',
    examples: ['NH₃']
  },
  {
    name: 'Bent (AX₂E/AX₂E₂)',
    description: '~104.5° (H₂O). Lone pairs compress bonding pair angles.',
    examples: ['H₂O', 'SO₂']
  }
];

const practiceComparisons = [
  {
    prompt: 'Explain why sodium chloride forms a crystalline solid whereas methane is a gas at room temperature.',
    tip: 'Compare electrostatic lattice interactions with weak intermolecular forces.'
  },
  {
    prompt: 'Predict the bond type in magnesium oxide and carbon dioxide. Justify using electronegativity differences.',
    tip: 'Recall: ΔEN > 1.7 is typically ionic; between 0.4–1.7 is polar covalent.'
  },
  {
    prompt: 'Metals conduct electricity even when solid. Relate this property to the structure of metallic bonds.',
    tip: 'Discuss delocalised electrons and their mobility.'
  }
];

const BondingConcept = () => {
  const [activeSection, setActiveSection] = useState('overview');

  const ionicStepsRendered = useMemo(
    () =>
      ionicSteps.map(step => (
        <div key={step.title} className="bond-step-card">
          <h4>{step.title}</h4>
          <p>{step.detail}</p>
        </div>
      )),
    []
  );

  const covalentTypeCards = useMemo(
    () =>
      covalentTypes.map(type => (
        <div key={type.title} className="bond-type-card" style={{ borderTopColor: type.color }}>
          <h4>{type.title}</h4>
          <p>{type.detail}</p>
        </div>
      )),
    []
  );

  const vseprRendered = useMemo(
    () =>
      vseprShapes.map(shape => (
        <div key={shape.name} className="vsepr-card">
          <div className="vsepr-card-header">
            <h4>{shape.name}</h4>
            <span>{shape.description}</span>
          </div>
          <div className="vsepr-examples">
            {shape.examples.map(example => (
              <span key={example} className="vsepr-chip">{example}</span>
            ))}
          </div>
        </div>
      )),
    []
  );

  const renderSection = () => {
    switch (activeSection) {
      case 'overview':
        return (
          <section className="bond-section">
            <div className="bond-split">
              <div className="bond-card">
                <h3>Why Atoms Bond</h3>
                <ul>
                  <li>Atoms bond to achieve a stable electron configuration (often resembling noble gases).</li>
                  <li>Bonds form by transferring or sharing electrons to reduce total energy.</li>
                  <li>Bond strength and structure dictate physical properties like melting point and conductivity.</li>
                </ul>
                <div className="bond-callout">
                  Metastable or excited states can break bonds, leading to chemical reactions—bond breaking requires energy, bond
                  formation releases energy.
                </div>
              </div>
              <div className="bond-card highlight">
                <h3>Visualise Molecules</h3>
                <p>Select common molecules to inspect atomic arrangement and bonding in real time.</p>
                <MoleculeAnimation />
              </div>
            </div>
            <div className="bond-quickfacts">
              <div className="bond-fact-card">Ionic bonds occur between metals and nonmetals.</div>
              <div className="bond-fact-card">Covalent bonds share electrons—common in molecules like water or CO₂.</div>
              <div className="bond-fact-card">Metallic bonding features a lattice of cations in a sea of electrons.</div>
            </div>
          </section>
        );
      case 'ionic':
        return (
          <section className="bond-section">
            <h3>Ionic Bonding</h3>
            <p className="bond-intro">
              Ionic bonds form via electron transfer from a low electronegativity atom (metal) to a high electronegativity atom (nonmetal). Resulting ions
              pack into repeating structures called lattices.
            </p>
            <div className="bond-step-grid">{ionicStepsRendered}</div>
            <div className="bond-properties">
              <div className="bond-property-card">
                <h4>Lattice Structure</h4>
                <p>Crystal lattice maximises attraction between opposite charges while minimising repulsion.</p>
                <ul>
                  <li>High melting/boiling points</li>
                  <li>Brittle solids (shifting layers align like charges → repel)</li>
                  <li>Conduct electricity when molten or dissolved (ions mobile)</li>
                </ul>
              </div>
              <div className="bond-property-card">
                <h4>Energy Considerations</h4>
                <p>
                  Lattice energy measures strength of ionic bonds—the energy released when gaseous ions form a solid lattice.
                </p>
                <div className="bond-callout secondary">
                  Larger charges and smaller ionic radii → stronger lattice energy (e.g., MgO stronger than NaCl).
                </div>
              </div>
            </div>
          </section>
        );
      case 'covalent':
        return (
          <section className="bond-section">
            <h3>Covalent Bonding</h3>
            <p className="bond-intro">
              Covalent bonds form when atoms share electron pairs to complete valence shells. Bond polarity depends on electronegativity differences.
            </p>
            <div className="bond-type-grid">{covalentTypeCards}</div>
            <div className="bond-properties">
              <div className="bond-property-card">
                <h4>Polar vs Nonpolar</h4>
                <p>
                  If electron sharing is unequal, the bond gains partial charges (dipoles). Water’s bent shape concentrates the dipole, leading to hydrogen bonds.
                </p>
                <ul>
                  <li>Electronegativity difference 0–0.4 → nonpolar covalent (e.g., N₂)</li>
                  <li>0.4–1.7 → polar covalent (e.g., H₂O, HF)</li>
                  <li>Symmetric molecules (CO₂) may be nonpolar overall despite polar bonds.</li>
                </ul>
              </div>
              <div className="bond-property-card">
                <h4>Network Covalent Solids</h4>
                <p>Some covalent substances (diamond, SiO₂) form continuous networks → very hard, high melting points.</p>
              </div>
            </div>
          </section>
        );
      case 'metallic':
        return (
          <section className="bond-section">
            <h3>Metallic Bonding</h3>
            <p className="bond-intro">
              Metallic bonds involve a lattice of positive ions surrounded by delocalised electrons. Electrons act as glue, holding ions together and enabling
              conductivity.
            </p>
            <div className="bond-metallic-grid">
              {metallicFeatures.map(feature => (
                <div key={feature} className="bond-metallic-card">
                  {feature}
                </div>
              ))}
            </div>
            <div className="bond-note">
              <strong>Alloys:</strong> Mixing metals introduces different atom sizes, disrupting lattice layers so the material becomes harder (e.g., steel = iron + carbon).
            </div>
          </section>
        );
      case 'vsepr':
        return (
          <section className="bond-section">
            <h3>Valence Shell Electron Pair Repulsion (VSEPR)</h3>
            <p className="bond-intro">
              Electron pairs around a central atom repel each other, adopting geometries that maximise separation. Shape depends on both bonding and lone pairs.
            </p>
            <div className="bond-vsepr-grid">{vseprRendered}</div>
            <div className="bond-note">
              <strong>Teacher Tip:</strong> Use 3D ball-and-stick kits or virtual simulations to reinforce spatial understanding.
            </div>
          </section>
        );
      case 'practice':
        return (
          <section className="bond-section">
            <h3>Compare & Practice</h3>
            <div className="bond-compare-grid">
              <div className="bond-compare-card">
                <table>
                  <thead>
                    <tr>
                      <th>Property</th>
                      <th>Ionic</th>
                      <th>Covalent</th>
                      <th>Metallic</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>Particles</td>
                      <td>Cations & anions</td>
                      <td>Molecules or networks</td>
                      <td>Metal cations + sea of electrons</td>
                    </tr>
                    <tr>
                      <td>Melting Point</td>
                      <td>High</td>
                      <td>Low/medium (higher for networks)</td>
                      <td>Varied (often high)</td>
                    </tr>
                    <tr>
                      <td>Conductivity</td>
                      <td>Only molten/solution</td>
                      <td>Poor (except graphite)</td>
                      <td>Excellent</td>
                    </tr>
                    <tr>
                      <td>Solubility</td>
                      <td>Often in water</td>
                      <td>Many in nonpolar solvents</td>
                      <td>Insoluble</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div className="bond-practice-prompts">
                {practiceComparisons.map(item => (
                  <div key={item.prompt} className="bond-practice-card">
                    <h4>{item.prompt}</h4>
                    <p className="bond-hint">💡 Tip: {item.tip}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        );
      default:
        return null;
    }
  };

  return (
    <div className="bonding-concept">
      <header className="bond-header">
        <div>
          <h2>Chemical Bonding Masterclass</h2>
          <p>Compare how atoms transfer, share, or delocalise electrons to form stable substances.</p>
        </div>
        <div className="bond-meta">
          <span className="bond-tag">Estimated time: 30 minutes</span>
          <span className="bond-tag">Difficulty: Intermediate</span>
        </div>
      </header>

      <nav className="bond-navigation">
        {sections.map(section => (
          <button
            key={section.id}
            type="button"
            className={`bond-nav-btn ${activeSection === section.id ? 'active' : ''}`}
            onClick={() => setActiveSection(section.id)}
          >
            <span aria-hidden="true" className="bond-nav-icon">{section.icon}</span>
            <span>{section.title}</span>
          </button>
        ))}
      </nav>

      <main className="bond-main">{renderSection()}</main>
    </div>
  );
};

export default BondingConcept;
