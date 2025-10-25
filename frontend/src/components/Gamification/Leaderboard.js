import React, { useEffect, useState } from 'react';
import './Leaderboard.css';
import api from '../../apiClient';

const Leaderboard = () => {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        setLoading(true);
        const { data } = await api.get('/user/gamification');
        setEntries(data?.leaderboard || getMockLeaderboard());
        setLoading(false);
      } catch (err) {
        console.error('Error fetching leaderboard:', err);
        setEntries(getMockLeaderboard());
        setError('Could not fetch live leaderboard data. Showing sample data instead.');
        setLoading(false);
      }
    };
    
    fetchLeaderboard();
  }, []);

  // Mock data for development/demo purposes
  const getMockLeaderboard = () => {
    return [
      { rank: 1, name: 'Alex Johnson', xp: 1240 },
      { rank: 2, name: 'Maria Garcia', xp: 1180 },
      { rank: 3, name: 'Tessa Williams', xp: 1050 },
      { rank: 4, name: 'James Smith', xp: 980 },
      { rank: 5, name: 'Emma Brown', xp: 920 },
      { rank: 6, name: 'Noah Davis', xp: 870 },
      { rank: 7, name: 'Olivia Miller', xp: 810 },
      { rank: 8, name: 'William Wilson', xp: 760 },
      { rank: 9, name: 'Sophia Moore', xp: 720 },
      { rank: 10, name: 'Liam Taylor', xp: 680 }
    ];
  };

  return (
    <div className="leaderboard">
      <div className="leaderboard-header">
        <h2>Leaderboard</h2>
        <p>Compete with your peers and track your progress</p>
      </div>
      
      {loading ? (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading leaderboard data...</p>
        </div>
      ) : (
        <div className="leaderboard-content">
          {error && <div className="error-message">{error}</div>}
          
          <div className="leaderboard-top">
            {entries.slice(0, 3).map((entry, index) => (
              <div key={index} className={`top-player top-${index + 1}`}>
                <div className="trophy-icon">{index === 0 ? '🏆' : index === 1 ? '🥈' : '🥉'}</div>
                <div className="player-name">{entry.name}</div>
                <div className="player-xp">{entry.xp} XP</div>
              </div>
            ))}
          </div>
          
          <div className="leaderboard-table">
            <div className="table-header">
              <span className="rank-header">Rank</span>
              <span className="name-header">Student</span>
              <span className="xp-header">XP Points</span>
            </div>
            
            <div className="table-body">
              {entries.map((entry, index) => (
                <div key={index} className={`table-row ${index < 3 ? 'top-three' : ''}`}>
                  <span className="rank">#{entry.rank || (index + 1)}</span>
                  <span className="name">{entry.name}</span>
                  <span className="xp">{entry.xp} XP</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Leaderboard;
