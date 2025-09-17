import React from 'react';
import './RemediationModule.css';

const RemediationModule = () => {
  return (
    <div className="remediation-module">
      <div className="remediation-header">
        <h2>Remediation Module</h2>
        <p>Get personalized help with concepts you're struggling with</p>
      </div>
      
      <div className="remediation-content">
        <div className="coming-soon">
          <div className="coming-soon-icon">🔧</div>
          <h3>Micro-Remediation</h3>
          <p>Short corrective videos, animations, and interactive content will be available here to help you master difficult concepts.</p>
        </div>
      </div>
    </div>
  );
};

export default RemediationModule;
