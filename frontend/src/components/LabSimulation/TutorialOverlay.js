import React from 'react';

const TutorialOverlay = ({ onClose }) => {
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
      <div style={{ width: 720, background: 'white', padding: 24, borderRadius: 12, boxShadow: '0 8px 40px rgba(2,6,23,0.4)' }}>
        <h2 style={{ marginTop: 0 }}>Welcome to the Virtual Lab</h2>
        <p style={{ color: '#475569' }}>This interactive lab guides you step-by-step. Use the controls to pour reagents, start/stop titration, and record observations. Click actions on each step to activate it.</p>
        <ol>
          <li><strong>Follow the Procedure:</strong> Each step shows status — click Do to focus that step.</li>
          <li><strong>Guided Mode:</strong> Toggle guidance for hints and checks.</li>
          <li><strong>Microscopic View:</strong> See particle-level reactions (neutralization).</li>
          <li><strong>Save Attempts:</strong> Students can save attempts; teachers can review them.</li>
        </ol>
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 12 }}>
          <button className="btn btn-secondary" onClick={() => { localStorage.setItem('labTutorialSeen','1'); onClose(); }}>Got it</button>
        </div>
      </div>
    </div>
  );
};

export default TutorialOverlay;
