import React, { useState, useEffect } from 'react';
import './GamificationPage.css';
import { FaTrophy, FaMedal, FaFire, FaStar } from 'react-icons/fa';

function GamificationPage() {
  const [personalStats, setPersonalStats] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [badges, setBadges] = useState([]);
  const [activeBadgeFilter, setActiveBadgeFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGamificationData = async () => {
      try {
        const token = localStorage.getItem('authToken');
        const response = await fetch('/api/user/gamification', {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (response.ok) {
          const data = await response.json();
          setPersonalStats(data.personal);
          setLeaderboard(data.leaderboard);
        }
      } catch (error) {
        console.error('Error fetching gamification data:', error);
      }
    };

    const fetchBadgeDetails = async () => {
      try {
        const token = localStorage.getItem('authToken');
        const response = await fetch('/api/user/badges/details', {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (response.ok) {
          const data = await response.json();
          setBadges(data.badges);
        }
      } catch (error) {
        console.error('Error fetching badge details:', error);
      }
    };

    Promise.all([fetchGamificationData(), fetchBadgeDetails()]).finally(() => {
      setLoading(false);
    });
  }, []);

  if (loading) {
    return <div className="gamification-page"><div className="loading">Loading...</div></div>;
  }

  const filteredBadges = activeBadgeFilter === 'all'
    ? (personalStats?.badges || [])
    : (personalStats?.badges || []).filter(b => b.category === activeBadgeFilter);

  const badgeCategories = ['all', 'milestone', 'achievement', 'performance', 'streak'];

  return (
    <div className="gamification-page">
      {/* Header */}
      <div className="gamification-header">
        <h1>🎮 Progress Tracker</h1>
        <p>Unlock badges and climb the leaderboard!</p>
      </div>

      {/* Personal Stats Section */}
      {personalStats && (
        <div className="personal-stats">
          <div className="stat-card large">
            <div className="stat-value">{personalStats.level}</div>
            <div className="stat-label">Level</div>
          </div>

          <div className="stat-card large">
            <div className="stat-value">{personalStats.xp}</div>
            <div className="stat-label">Total XP</div>
          </div>

          <div className="stat-card">
            <div className="stat-value" style={{ color: '#ff6b6b' }}>
              <FaTrophy /> #{personalStats.rank}
            </div>
            <div className="stat-label">Leaderboard Rank</div>
          </div>

          <div className="stat-card">
            <div className="stat-value">{personalStats.totalQuizzesCompleted}</div>
            <div className="stat-label">Quizzes Completed</div>
          </div>

          <div className="stat-card">
            <div className="stat-value" style={{ color: '#ffd700' }}>
              <FaFire /> {personalStats.streakDays}
            </div>
            <div className="stat-label">Day Streak</div>
          </div>

          <div className="stat-card">
            <div className="stat-value">{Math.round(personalStats.averageQuizScore)}%</div>
            <div className="stat-label">Avg. Score</div>
          </div>

          {/* Progress to next level */}
          <div className="progress-bar-container">
            <div className="progress-label">Progress to Level {personalStats.level + 1}</div>
            <div className="progress-bar">
              <div 
                className="progress-fill" 
                style={{ width: `${personalStats.progressToNextLevel}%` }}
              ></div>
            </div>
            <div className="progress-text">
              {personalStats.progressToNextLevel}% to next level
            </div>
          </div>
        </div>
      )}

      {/* Badges Section */}
      <div className="badges-section">
        <h2>🏅 Your Badges</h2>
        
        <div className="badge-filters">
          {badgeCategories.map(category => (
            <button
              key={category}
              className={`filter-btn ${activeBadgeFilter === category ? 'active' : ''}`}
              onClick={() => setActiveBadgeFilter(category)}
            >
              {category.charAt(0).toUpperCase() + category.slice(1)}
            </button>
          ))}
        </div>

        {filteredBadges.length > 0 ? (
          <div className="badges-grid">
            {filteredBadges.map(badge => (
              <div key={badge.id} className="badge-item">
                <div className="badge-icon">{badge.icon}</div>
                <div className="badge-name">{badge.name}</div>
                <div className="badge-description">{badge.description}</div>
                <div className="badge-xp">+{badge.xpReward} XP</div>
                <div className="badge-date">
                  {new Date(badge.unlockedAt).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="no-badges">
            <p>No badges unlocked yet in this category. Keep learning!</p>
          </div>
        )}
      </div>

      {/* Leaderboard Section */}
      <div className="leaderboard-section">
        <h2>📊 Global Leaderboard</h2>
        
        <div className="leaderboard-container">
          <table className="leaderboard-table">
            <thead>
              <tr>
                <th>Rank</th>
                <th>Player</th>
                <th>Level</th>
                <th>XP</th>
                <th>Badges</th>
              </tr>
            </thead>
            <tbody>
              {leaderboard.map((entry, index) => (
                <tr key={index} className={entry.isCurrentUser ? 'current-user' : ''}>
                  <td className="rank-cell">
                    {entry.rank === 1 ? '🥇' : entry.rank === 2 ? '🥈' : entry.rank === 3 ? '🥉' : entry.rank}
                  </td>
                  <td className="player-cell">
                    {entry.name}
                    {entry.isCurrentUser && <span className="you-badge"> (You)</span>}
                  </td>
                  <td className="level-cell">
                    <span className="level-badge">Lvl {entry.level}</span>
                  </td>
                  <td className="xp-cell">{entry.xp} XP</td>
                  <td className="badges-cell">
                    <div className="badge-list">
                      {entry.badges.slice(0, 3).map((badge, idx) => (
                        <span key={idx} className="badge-icon-small" title={badge.name}>
                          {badge.icon}
                        </span>
                      ))}
                      {entry.badges.length > 3 && (
                        <span className="badge-more">+{entry.badges.length - 3}</span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Locked Badges Preview */}
      <div className="all-badges-section">
        <h2>🔓 All Available Badges</h2>
        
        <div className="all-badges-grid">
          {badges.map(badge => {
            const isUnlocked = (personalStats?.badges || []).some(b => b.id === badge.id);
            return (
              <div key={badge.id} className={`all-badge-item ${isUnlocked ? 'unlocked' : 'locked'}`}>
                <div className="badge-icon" style={{ opacity: isUnlocked ? 1 : 0.3 }}>
                  {badge.icon}
                </div>
                <div className="badge-name">{badge.name}</div>
                <div className="badge-description">{badge.description}</div>
                <div className="badge-xp">+{badge.xpReward} XP</div>
                {!isUnlocked && <div className="locked-overlay">🔒</div>}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default GamificationPage;
