import React, { useState, useEffect } from 'react';
import './StudentDashboard.css';
import ConceptPages from '../Concepts/ConceptPages';
import QuizEngine from '../Quiz/QuizEngine';
import ConceptMap from '../ConceptMap/ConceptMap';
import ProgressTracker from '../Progress/ProgressTracker';
import RemediationModule from '../Remediation/RemediationModule';
import Leaderboard from '../Gamification/Leaderboard';
import ConfidenceMeter from '../Progress/ConfidenceMeter';
import PerformanceDashboard from '../Progress/PerformanceDashboard';
import MoleculeAnimation from '../MoleculeAnimation/MoleculeAnimation';
import PeriodicTable from '../PeriodicTable/PeriodicTable';
import ChemicalEquations from '../ChemicalEquations/ChemicalEquations';
import ChemistryCalculator from '../ChemistryCalculator/ChemistryCalculator';

const StudentDashboard = ({ activeTab, setActiveTab }) => {
  const [studentStats, setStudentStats] = useState({
    totalQuizzes: 0,
    accuracy: 0,
    conceptsLearned: 0,
    currentStreak: 0,
    xpPoints: 0,
    level: 1
  });

  const [recentActivity, setRecentActivity] = useState([]);
  const [userName, setUserName] = useState('');

  useEffect(() => {
    // Load user name from localStorage
    const storedName = localStorage.getItem('userName');
    setUserName(storedName || 'Student');

    // Fetch user stats from backend
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;
        const response = await fetch('http://localhost:5000/api/user/stats', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        if (!response.ok) throw new Error('Failed to fetch stats');
        const stats = await response.json();
        setStudentStats({
          totalQuizzes: stats.totalQuizzes ?? 0,
          accuracy: stats.accuracy ?? 0,
          conceptsLearned: stats.conceptsLearned ?? 0,
          currentStreak: stats.currentStreak ?? 0,
          xpPoints: stats.xpPoints ?? 0,
          level: stats.level ?? 1
        });
        // Optionally fetch recent activity here if backend supports it
      } catch (err) {
        // fallback to empty stats
        setStudentStats({
          totalQuizzes: 0,
          accuracy: 0,
          conceptsLearned: 0,
          currentStreak: 0,
          xpPoints: 0,
          level: 1
        });
      }
    };

    // Initial fetch
    fetchStats();

    // Listen for concept completion events to refresh stats
    const onConceptCompleted = () => fetchStats();
    window.addEventListener('concept-completed', onConceptCompleted);

    // ...existing code for recentActivity (can be replaced with backend fetch if available)
    setRecentActivity([
      { id: 1, type: 'quiz', title: 'Acids and Bases Quiz', score: 85, date: '2024-01-15' },
      { id: 2, type: 'concept', title: 'Periodic Table', status: 'completed', date: '2024-01-14' },
      { id: 3, type: 'remediation', title: 'Chemical Bonding Review', date: '2024-01-13' },
    ]);

    return () => {
      window.removeEventListener('concept-completed', onConceptCompleted);
    };
  }, []);

  const renderOverview = () => (
    <div className="student-overview">
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon primary">📝</div>
          <div className="stat-value">{studentStats.totalQuizzes}</div>
          <div className="stat-label">Quizzes Taken</div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon success">✅</div>
          <div className="stat-value">{studentStats.accuracy}%</div>
          <div className="stat-label">Accuracy Rate</div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon warning">🧪</div>
          <div className="stat-value">{studentStats.conceptsLearned}</div>
          <div className="stat-label">Concepts Learned</div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon danger">🔥</div>
          <div className="stat-value">{studentStats.currentStreak}</div>
          <div className="stat-label">Day Streak</div>
        </div>
      </div>

      <div className="dashboard-grid">
        <div className="dashboard-card">
          <h3>Recent Activity</h3>
          <div className="activity-list">
            {recentActivity.map(activity => (
              <div key={activity.id} className="activity-item">
                <div className="activity-icon">
                  {activity.type === 'quiz' && '📝'}
                  {activity.type === 'concept' && '🧪'}
                  {activity.type === 'remediation' && '🔧'}
                </div>
                <div className="activity-content">
                  <div className="activity-title">{activity.title}</div>
                  <div className="activity-meta">
                    {activity.score && <span className="score">Score: {activity.score}%</span>}
                    {activity.status && <span className="status">{activity.status}</span>}
                    <span className="date">{activity.date}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="dashboard-card">
          <h3>Quick Actions</h3>
          <div className="quick-actions">
            <button 
              className="btn btn-primary"
              onClick={() => setActiveTab('quizzes')}
            >
              📝 Take a Quiz
            </button>
            <button 
              className="btn btn-secondary"
              onClick={() => setActiveTab('concepts')}
            >
              🧪 Study Concepts
            </button>
            <button 
              className="btn btn-secondary"
              onClick={() => setActiveTab('concept-map')}
            >
              🗺️ View Concept Map
            </button>
            <button 
              className="btn btn-secondary"
              onClick={() => setActiveTab('molecule-animation')}
            >
              🔬 Molecule Animation
            </button>
            <button 
              className="btn btn-secondary"
              onClick={() => setActiveTab('remediation')}
            >
              🔧 Remediation
            </button>
          </div>
        </div>
      </div>

      <div className="dashboard-card">
        <h3>Learning Progress</h3>
        <div className="progress-overview">
          <div className="progress-item">
            <div className="progress-label">Overall Progress</div>
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: '75%' }}></div>
            </div>
            <div className="progress-value">75%</div>
          </div>
          
          <div className="progress-item">
            <div className="progress-label">This Week</div>
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: '60%' }}></div>
            </div>
            <div className="progress-value">60%</div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return renderOverview();
      case 'concepts':
        return <ConceptPages />;
      case 'quizzes':
        return <QuizEngine />;
      case 'concept-map':
        return <ConceptMap />;
      case 'progress':
        return <ProgressTracker />;
      case 'remediation':
        return <RemediationModule />;
      case 'confidence':
        return <ConfidenceMeter />;
      case 'molecule-animation':
        return <MoleculeAnimation />;
      case 'periodic-table':
        return <PeriodicTable />;
      case 'chemical-equations':
        return <ChemicalEquations />;
      case 'chemistry-calculator':
        return <ChemistryCalculator />;
      case 'leaderboard':
        return <Leaderboard />;
      case 'performance-dashboard':
        return <PerformanceDashboard />;
      default:
        return renderOverview();
    }
  };

  return (
    <div className="student-dashboard-layout">
      <div className="student-dashboard-header" style={{padding: '24px 0 0 0'}}>
        <h2 style={{fontWeight:600, color:'#1976d2'}}>Good Evening, {userName}!</h2>
        <p style={{color:'#555', fontSize:16}}>Ready to explore chemistry concepts?</p>
      </div>
      <div className="student-dashboard-content">
        {renderContent()}
      </div>
    </div>
  );
};

export default StudentDashboard;
