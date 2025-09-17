
import React, { useRef, useEffect, useState } from 'react';
import './MoleculeAnimation.css';

const MOLECULES = [
  {
    name: 'Water',
    formula: 'H₂O',
    atoms: [
      { id: 1, type: 'O', x: 120, y: 100 },
      { id: 2, type: 'H', x: 70, y: 140 },
      { id: 3, type: 'H', x: 170, y: 140 }
    ],
    bonds: [
      { from: 1, to: 2 },
      { from: 1, to: 3 }
    ]
  },
  {
    name: 'Carbon Dioxide',
    formula: 'CO₂',
    atoms: [
      { id: 1, type: 'C', x: 120, y: 100 },
      { id: 2, type: 'O', x: 60, y: 100 },
      { id: 3, type: 'O', x: 180, y: 100 }
    ],
    bonds: [
      { from: 1, to: 2 },
      { from: 1, to: 3 }
    ]
  },
  {
    name: 'Methane',
    formula: 'CH₄',
    atoms: [
      { id: 1, type: 'C', x: 120, y: 100 },
      { id: 2, type: 'H', x: 60, y: 60 },
      { id: 3, type: 'H', x: 180, y: 60 },
      { id: 4, type: 'H', x: 60, y: 140 },
      { id: 5, type: 'H', x: 180, y: 140 }
    ],
    bonds: [
      { from: 1, to: 2 },
      { from: 1, to: 3 },
      { from: 1, to: 4 },
      { from: 1, to: 5 }
    ]
  }
];

const atomColors = {
  H: '#fbbf24',
  O: '#60a5fa',
  C: '#64748b'
};

const MoleculeAnimation = () => {
  const [selected, setSelected] = useState(0);
  const canvasRef = useRef(null);

  useEffect(() => {
    const molecule = MOLECULES[selected];
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    canvas.width = 240;
    canvas.height = 200;

    // Draw bonds
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.lineWidth = 6;
    molecule.bonds.forEach(bond => {
      const from = molecule.atoms.find(a => a.id === bond.from);
      const to = molecule.atoms.find(a => a.id === bond.to);
      ctx.beginPath();
      ctx.moveTo(from.x, from.y);
      ctx.lineTo(to.x, to.y);
      ctx.strokeStyle = '#64748b';
      ctx.stroke();
    });

    // Draw atoms
    molecule.atoms.forEach(atom => {
      ctx.beginPath();
      ctx.arc(atom.x, atom.y, 22, 0, Math.PI * 2);
      ctx.fillStyle = atomColors[atom.type] || '#a3a3a3';
      ctx.fill();
      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.fillStyle = '#1e293b';
      ctx.font = 'bold 1.5rem Segoe UI, Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(atom.type, atom.x, atom.y + 2);
    });
  }, [selected]);

  const molecule = MOLECULES[selected];

  return (
    <div className="molecule-animation">
      <h2 style={{textAlign: 'center', marginTop: '32px', color: '#1e293b'}}>Molecule Animation</h2>
      <p style={{textAlign: 'center', color: '#64748b', marginBottom: '16px'}}>Select a molecule to view its structure and details.</p>
      <div style={{display:'flex', justifyContent:'center', alignItems:'center', marginBottom:'16px'}}>
        <label htmlFor="mol-select" style={{marginRight:8, fontWeight:500, color:'#334155'}}>Molecule:</label>
        <select id="mol-select" value={selected} onChange={e => setSelected(Number(e.target.value))} style={{padding:'6px 12px', borderRadius:6, border:'1px solid #e0e7ef', fontSize:'1rem', color:'#334155', background:'#f1f5f9'}}>
          {MOLECULES.map((mol, idx) => (
            <option value={idx} key={mol.name}>{mol.name} ({mol.formula})</option>
          ))}
        </select>
      </div>
      <div style={{textAlign:'center', marginBottom:'8px', color:'#0e7490', fontWeight:600, fontSize:'1.2rem'}}>
        {molecule.name} <span style={{color:'#64748b'}}>({molecule.formula})</span>
      </div>
      <div style={{width: '240px', height: '200px', margin: '0 auto', background: '#f8fafc', borderRadius: '12px', boxShadow: '0 2px 8px rgba(30,41,59,0.04)'}}>
        <canvas ref={canvasRef} style={{width: '100%', height: '100%'}} />
      </div>
    </div>
  );
};

export default MoleculeAnimation;