import React, { useState } from 'react';
import './GamifiedTracker.css';

const mockUser = {
  name: 'Student A',
  xp: 1240,
  badges: [
    { name: 'Quiz Novice', icon: '🏅', desc: 'Completed 3 quizzes' },
    { name: 'Acid Ace', icon: '⚗️', desc: 'Scored 90%+ in Acids & Bases' },
    { name: 'Streak Starter', icon: '🔥', desc: '3 quizzes in a row' }
  ]
};

const mockLeaderboard = [
  { name: 'Student A', xp: 1240 },
  { name: 'Student B', xp: 1100 },
  { name: 'Student C', xp: 950 },
  { name: 'Student D', xp: 800 },
  { name: 'Student E', xp: 700 }
];

const GamifiedTracker = () => {
  const [user] = useState(mockUser);
  const [leaderboard] = useState(mockLeaderboard);

  return (
    <div className="gamified-tracker">
      <div className="gt-header">
        <h2>Progress & Leaderboard</h2>
        <p>Earn XP, collect badges, and climb the leaderboard!</p>
      </div>
      <div className="gt-flex">
        <div className="gt-user-card">
          <div className="gt-xp">{user.xp} XP</div>
          <div className="gt-badges">
            {user.badges.map((badge, idx) => (
              <div className="gt-badge" key={idx} title={badge.desc}>
                <span className="gt-badge-icon">{badge.icon}</span>
                <span className="gt-badge-name">{badge.name}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="gt-leaderboard">
          <h3>Leaderboard</h3>
          <ol>
            {leaderboard.map((entry, idx) => (
              <li key={idx} className={entry.name === user.name ? 'gt-me' : ''}>
                <span className="gt-rank">#{idx + 1}</span>
                <span className="gt-lb-name">{entry.name}</span>
                <span className="gt-lb-xp">{entry.xp} XP</span>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </div>
  );
};

export default GamifiedTracker;
