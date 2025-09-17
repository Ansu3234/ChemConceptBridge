import React, { useState } from 'react';
import './PeriodicTable.css';
import { FULL_ELEMENTS } from './elements-full';

const groupColors = {
  'alkali metal': '#fbbf24',
  'alkaline earth metal': '#f59e42',
  'transition metal': '#60a5fa',
  'post-transition metal': '#a3a3a3',
  'metalloid': '#34d399',
  'nonmetal': '#f87171',
  'halogen': '#38bdf8',
  'noble gas': '#a78bfa',
  'lanthanide': '#f472b6',
  'actinide': '#f472b6',
  'unknown': '#d1d5db'
};

const PeriodicTable = () => {
  const [selected, setSelected] = useState(null);

  const handleSelect = (el) => setSelected(el);

  return (
    <div className="periodic-table-module">
      <h2 className="pt-title">Interactive Periodic Table</h2>
      <p className="pt-desc">Click an element to view its details.</p>
      <div className="pt-table">
        {[...Array(7)].map((_, period) => (
          <div className="pt-row" key={period}>
            {[...Array(18)].map((_, group) => {
              const el = FULL_ELEMENTS.find(e => e.period === period + 1 && e.group === group + 1);
              return el ? (
                <button
                  key={el.symbol}
                  className={`pt-cell ${selected && selected.symbol === el.symbol ? 'selected' : ''}`}
                  style={{ background: groupColors[el.category] || '#e0e7ef' }}
                  onClick={() => handleSelect(el)}
                  title={el.name}
                >
                  <div className="pt-symbol">{el.symbol}</div>
                  <div className="pt-number">{el.number}</div>
                </button>
              ) : (
                <div className="pt-cell empty" key={group}></div>
              );
            })}
          </div>
        ))}
      </div>
      {selected && (
        <div className="pt-details">
          <h3>{selected.name} ({selected.symbol})</h3>
          <p>Atomic Number: {selected.number}</p>
          <p>Group: {selected.group}, Period: {selected.period}</p>
          <p>Category: {selected.category}</p>
        </div>
      )}
    </div>
  );
};

export default PeriodicTable;
