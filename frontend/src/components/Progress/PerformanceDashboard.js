import React, { useState } from 'react';
import './PerformanceDashboard.css';

// Mock data for demonstration
const mockPerformance = {
  quizzesTaken: 7,
  averageScore: 82,
  scores: [
    { quiz: 'Acids & Bases', score: 90 },
    { quiz: 'Periodic Table', score: 75 },
    { quiz: 'Bonding', score: 85 },
    { quiz: 'Thermodynamics', score: 78 },
    { quiz: 'Organic Basics', score: 88 },
    { quiz: 'Redox', score: 70 },
    { quiz: 'Equilibrium', score: 88 },
  ]
};

const PerformanceDashboard = () => {
  const [performance] = useState(mockPerformance);

  return (
    <div className="performance-dashboard">
      <div className="perf-header">
        <h2>Performance Dashboard</h2>
        <p>Track your quiz progress and scores</p>
      </div>
      <div className="perf-summary">
        <div className="perf-card">
          <div className="perf-label">Quizzes Taken</div>
          <div className="perf-value">{performance.quizzesTaken}</div>
        </div>
        <div className="perf-card">
          <div className="perf-label">Average Score</div>
          <div className="perf-value">{performance.averageScore}%</div>
        </div>
      </div>
      <div className="perf-chart-section">
        <h3>Quiz Scores</h3>
        <div className="perf-bar-chart">
          {performance.scores.map((item, idx) => (
            <div className="bar-row" key={idx}>
              <div className="bar-label">{item.quiz}</div>
              <div className="bar-outer">
                <div className="bar-inner" style={{ width: `${item.score}%` }}></div>
                <span className="bar-score">{item.score}%</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PerformanceDashboard;
