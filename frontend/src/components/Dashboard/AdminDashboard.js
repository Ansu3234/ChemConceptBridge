import React from 'react';
import './AdminDashboard.css';

const AdminDashboard = ({ activeTab, setActiveTab }) => {
  const renderOverview = () => (
    <div className="admin-overview">
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon primary">👥</div>
          <div className="stat-value">156</div>
          <div className="stat-label">Total Users</div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon success">📚</div>
          <div className="stat-value">24</div>
          <div className="stat-label">Concepts</div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon warning">📝</div>
          <div className="stat-value">48</div>
          <div className="stat-label">Quizzes</div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon danger">⚡</div>
          <div className="stat-value">99.9%</div>
          <div className="stat-label">Uptime</div>
        </div>
      </div>

      <div className="dashboard-card">
        <h3>System Status</h3>
        <div className="status-list">
          <div className="status-item">
            <span className="status-label">Database</span>
            <span className="status-badge success">Online</span>
          </div>
          <div className="status-item">
            <span className="status-label">API Server</span>
            <span className="status-badge success">Online</span>
          </div>
          <div className="status-item">
            <span className="status-label">File Storage</span>
            <span className="status-badge success">Online</span>
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
        return <div className="coming-soon">System Analytics - Coming Soon</div>;
      case 'users':
        return <div className="coming-soon">User Management - Coming Soon</div>;
      case 'system':
        return <div className="coming-soon">System Settings - Coming Soon</div>;
      case 'reports':
        return <div className="coming-soon">Reports - Coming Soon</div>;
      default:
        return renderOverview();
    }
  };

  return (
    <div className="admin-dashboard fade-in">
      {renderContent()}
    </div>
  );
};

export default AdminDashboard;
