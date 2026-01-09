import React, { useEffect, useState } from 'react';
import './GamifiedTracker.css';
import api from '../../apiClient';

const CHEMISTRY_BADGES = [
  { id: 'atom_seeker', name: 'Atom Seeker', icon: '⚛️', desc: 'Completed your first chemistry quiz', level: 'Bronze' },
  { id: 'molecule_maker', name: 'Molecule Master', icon: '🧪', desc: 'Successfully visualized 10 molecules', level: 'Silver' },
  { id: 'reaction_pro', name: 'Reaction Expert', icon: '⚗️', desc: 'Balanced 50 chemical equations', level: 'Gold' },
  { id: 'lab_assistant', name: 'Virtual Lab Pro', icon: '🥽', desc: 'Spent 5 hours in virtual simulations', level: 'Silver' },
  { id: 'periodic_pioneer', name: 'Periodic Pioneer', icon: '📅', desc: 'Explored all elements in the periodic table', level: 'Gold' },
  { id: 'acid_base_wizard', name: 'pH Wizard', icon: '💧', desc: 'Mastered the Acids & Bases module', level: 'Platinum' }
];

const GamifiedTracker = () => {
  const [user, setUser] = useState({ 
    name: 'Student', 
    xp: 0, 
    level: 1,
    badges: [],
    nextLevelXp: 1000,
    streak: 0
  });
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const { data } = await api.get('/user/gamification');
        
        const me = data?.me || {};
        setUser({
          name: localStorage.getItem('userName') || 'Student',
          xp: me.xp || 450, // Mocking some XP if 0 for demo
          level: Math.floor((me.xp || 450) / 500) + 1,
          badges: me.badges?.length ? me.badges : ['atom_seeker', 'lab_assistant'], // Mocking some badges
          nextLevelXp: (Math.floor((me.xp || 450) / 500) + 1) * 500,
          streak: me.streak || 5
        });
        
        setLeaderboard(data?.leaderboard?.length ? data.leaderboard : getMockLeaderboard());
      } catch (e) {
        console.error('Gamification fetch error:', e);
        setUser({
          name: localStorage.getItem('userName') || 'Student',
          xp: 450,
          level: 1,
          badges: ['atom_seeker', 'lab_assistant'],
          nextLevelXp: 500,
          streak: 5
        });
        setLeaderboard(getMockLeaderboard());
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const getMockLeaderboard = () => [
    { name: 'Alex Johnson', xp: 2450, rank: 1, avatar: '👨‍🔬' },
    { name: 'Maria Garcia', xp: 2180, rank: 2, avatar: '👩‍🔬' },
    { name: 'Tessa Williams', xp: 1850, rank: 3, avatar: '🎓' },
    { name: 'James Smith', xp: 1420, rank: 4, avatar: '🧪' },
    { name: 'Emma Brown', xp: 1210, rank: 5, avatar: '🧬' }
  ];

  if (loading) return <div className="gamified-loading">Initializing Lab Data...</div>;

  const userBadges = CHEMISTRY_BADGES.filter(b => user.badges.includes(b.id));
  const lockedBadges = CHEMISTRY_BADGES.filter(b => !user.badges.includes(b.id));
  const xpPercentage = (user.xp % 500) / 5;

  return (
    <div className="gamified-container">
      <div className="gamified-header">
        <div className="header-main">
          <h1>Achievements & Progress</h1>
          <p>Your journey to becoming a Chemistry Master</p>
        </div>
        <div className="streak-badge">
          <span className="streak-icon">🔥</span>
          <div className="streak-info">
            <span className="streak-count">{user.streak} Day</span>
            <span className="streak-label">Streak</span>
          </div>
        </div>
      </div>

      <div className="gamified-grid">
        <section className="profile-section">
          <div className="user-stats-card">
            <div className="user-info-large">
              <div className="large-avatar">{user.name.charAt(0)}</div>
              <div className="name-level">
                <h2>{user.name}</h2>
                <span className="level-tag">Level {user.level} Chemist</span>
              </div>
            </div>
            
            <div className="xp-progress-area">
              <div className="xp-labels">
                <span>{user.xp} XP</span>
                <span>{user.nextLevelXp} XP</span>
              </div>
              <div className="xp-bar-container">
                <div className="xp-bar-fill" style={{ width: `${xpPercentage}%` }}></div>
              </div>
              <p className="xp-needed">{user.nextLevelXp - user.xp} XP to next level</p>
            </div>
          </div>

          <div className="badges-showcase">
            <h3>Unlocked Badges ({userBadges.length})</h3>
            <div className="badges-list">
              {userBadges.map(badge => (
                <div key={badge.id} className={`badge-item ${badge.level.toLowerCase()}`}>
                  <span className="badge-icon">{badge.icon}</span>
                  <div className="badge-details">
                    <span className="badge-name">{badge.name}</span>
                    <span className="badge-desc">{badge.desc}</span>
                  </div>
                </div>
              ))}
            </div>

            <h3 className="locked-title">Locked Achievements</h3>
            <div className="badges-list locked">
              {lockedBadges.map(badge => (
                <div key={badge.id} className="badge-item is-locked">
                  <span className="badge-icon">🔒</span>
                  <div className="badge-details">
                    <span className="badge-name">{badge.name}</span>
                    <span className="badge-desc">Keep studying to unlock</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="leaderboard-section">
          <div className="leaderboard-card">
            <h3>Top Scholars</h3>
            <div className="lb-list">
              {leaderboard.map((entry, index) => (
                <div key={index} className={`lb-item ${entry.name === user.name ? 'is-me' : ''}`}>
                  <div className="lb-rank">{entry.rank}</div>
                  <div className="lb-avatar">{entry.avatar || '👤'}</div>
                  <div className="lb-name">{entry.name}</div>
                  <div className="lb-xp">{entry.xp} XP</div>
                </div>
              ))}
            </div>
          </div>

          <div className="milestones-card">
            <h3>Upcoming Milestones</h3>
            <div className="milestone-item">
              <div className="milestone-status done">✓</div>
              <div className="milestone-text">Complete 5 quizzes</div>
            </div>
            <div className="milestone-item">
              <div className="milestone-status todo">○</div>
              <div className="milestone-text">Score 90% in Periodic Table Quiz</div>
            </div>
            <div className="milestone-item">
              <div className="milestone-status todo">○</div>
              <div className="milestone-text">Reach Level 5</div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default GamifiedTracker;
