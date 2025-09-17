import React, { useState, useEffect } from 'react';
import './StudentDashboard.css';
import ConceptPages from '../Concepts/ConceptPages';
import QuizEngine from '../Quiz/QuizEngine';
import ConceptMap from '../ConceptMap/ConceptMap';
import ProgressTracker from '../Progress/ProgressTracker';
import RemediationModule from '../Remediation/RemediationModule';
import Leaderboard from '../Gamification/Leaderboard';
import ConfidenceMeter from '../Progress/ConfidenceMeter';
import MoleculeAnimation from '../MoleculeAnimation/MoleculeAnimation';
import PeriodicTable from '../PeriodicTable/PeriodicTable';
// Placeholder imports for new modules
const ChemicalEquations = () => <div style={{padding:40, textAlign:'center'}}><h2>Chemical Equations</h2><p>Equation balancing and practice coming soon.</p></div>;
const ChemistryCalculator = () => <div style={{padding:40, textAlign:'center'}}><h2>Chemistry Calculator</h2><p>Molar mass and conversions coming soon.</p></div>;

const StudentDashboard = ({ activeTab, setActiveTab }) => {
  const [studentStats, setStudentStats] = useState({
    totalQuizzes: 0,
    correctAnswers: 0,
    conceptsLearned: 0,
    currentStreak: 0,
    xpPoints: 0,
    level: 1
  });

  const [recentActivity, setRecentActivity] = useState([]);

  useEffect(() => {
    // Simulate loading student data
    setStudentStats({
      totalQuizzes: 15,
      correctAnswers: 12,
      conceptsLearned: 8,
      currentStreak: 5,
      xpPoints: 1250,
      level: 3
    });

    setRecentActivity([
      { id: 1, type: 'quiz', title: 'Acids and Bases Quiz', score: 85, date: '2024-01-15' },
      { id: 2, type: 'concept', title: 'Periodic Table', status: 'completed', date: '2024-01-14' },
      { id: 3, type: 'remediation', title: 'Chemical Bonding Review', date: '2024-01-13' },
    ]);
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
          <div className="stat-value">{Math.round((studentStats.correctAnswers / studentStats.totalQuizzes) * 100) || 0}%</div>
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
        // Removed duplicate 'molecule' case
        // return <MoleculeAnimation />;
      case 'periodic-table':
        return <PeriodicTable />;
      case 'chemical-equations':
        return <ChemicalEquations />;
      case 'chemistry-calculator':
        return <ChemistryCalculator />;
      case 'leaderboard':
        return <Leaderboard />;
      default:
        return renderOverview();
    }
  };

  return (
    <div className="student-dashboard-layout">
      <div className="student-dashboard-content">
        {renderContent()}
      </div>
    </div>
  );
};

export default StudentDashboard;
