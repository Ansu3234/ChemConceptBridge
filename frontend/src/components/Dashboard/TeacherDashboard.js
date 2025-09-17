import React from 'react';
import './TeacherDashboard.css';

const TeacherDashboard = ({ activeTab, setActiveTab }) => {
  const renderOverview = () => (
    <div className="teacher-overview">
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon primary">👥</div>
          <div className="stat-value">24</div>
          <div className="stat-label">Total Students</div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon success">📝</div>
          <div className="stat-value">8</div>
          <div className="stat-label">Active Quizzes</div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon warning">📊</div>
          <div className="stat-value">85%</div>
          <div className="stat-label">Avg. Performance</div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon danger">🔧</div>
          <div className="stat-value">12</div>
          <div className="stat-label">Remediation Needed</div>
        </div>
      </div>

      <div className="dashboard-card">
        <h3>Recent Student Activity</h3>
        <div className="activity-list">
          <div className="activity-item">
            <div className="activity-icon">📝</div>
            <div className="activity-content">
              <div className="activity-title">Sarah completed Acids & Bases Quiz</div>
              <div className="activity-meta">
                <span className="score">Score: 92%</span>
                <span className="date">2 hours ago</span>
              </div>
            </div>
          </div>
          <div className="activity-item">
            <div className="activity-icon">🔧</div>
            <div className="activity-content">
              <div className="activity-title">Mike accessed Bonding remediation</div>
              <div className="activity-meta">
                <span className="date">4 hours ago</span>
              </div>
            </div>
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
        return <div className="coming-soon">Concept Management - Coming Soon</div>;
      case 'quizzes':
        return <div className="coming-soon">Quiz Management - Coming Soon</div>;
      case 'progress':
        return <div className="coming-soon">Student Progress Analytics - Coming Soon</div>;
      case 'students':
        return <div className="coming-soon">Student Management - Coming Soon</div>;
      case 'analytics':
        return <div className="coming-soon">Advanced Analytics - Coming Soon</div>;
      case 'content':
        return <div className="coming-soon">Content Management - Coming Soon</div>;
      default:
        return renderOverview();
    }
  };

  return (
    <div className="teacher-dashboard fade-in">
      {renderContent()}
    </div>
  );
};

export default TeacherDashboard;
