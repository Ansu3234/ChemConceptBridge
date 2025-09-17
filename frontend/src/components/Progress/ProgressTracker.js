import React from 'react';
import './ProgressTracker.css';

const ProgressTracker = () => {
  return (
    <div className="progress-tracker">
      <div className="progress-header">
        <h2>Progress Tracker</h2>
        <p>Monitor your learning journey and achievements</p>
      </div>
      
      <div className="progress-content">
        <div className="coming-soon">
          <div className="coming-soon-icon">📈</div>
          <h3>Progress Analytics</h3>
          <p>Detailed progress tracking with charts, heatmaps, and performance analytics will be available here.</p>
        </div>
      </div>
    </div>
  );
};

export default ProgressTracker;
