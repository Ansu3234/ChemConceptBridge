import React, { useEffect, useState } from 'react';
import './GamifiedTracker.css';
import api from '../../apiClient';

const GamifiedTracker = () => {
  const [user, setUser] = useState({ name: '', xp: 0, badges: [] });
  const [leaderboard, setLeaderboard] = useState([]);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get('/user/gamification');
        const me = data?.me || { xp: 0, badges: [] };
        setUser({ name: 'Me', xp: me.xp || 0, badges: (me.badges || []).map(b => ({ name: b, icon: '🏅', desc: b })) });
        setLeaderboard(data?.leaderboard || []);
      } catch (e) {
        setUser({ name: 'Me', xp: 0, badges: [] });
        setLeaderboard([]);
      }
    })();
  }, []);

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
                <span className="gt-rank">#{entry.rank || (idx + 1)}</span>
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
