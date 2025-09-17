import React from 'react';
import './Leaderboard.css';

const Leaderboard = () => {
  return (
    <div className="leaderboard">
      <div className="leaderboard-header">
        <h2>Leaderboard</h2>
        <p>Compete with your peers and track your progress</p>
      </div>
      
      <div className="leaderboard-content">
        <div className="coming-soon">
          <div className="coming-soon-icon">🏆</div>
          <h3>Gamification Features</h3>
          <p>Badges, XP points, streaks, and leaderboards will be available here to make learning more engaging and fun.</p>
        </div>
      </div>
    </div>
  );
};

export default Leaderboard;
