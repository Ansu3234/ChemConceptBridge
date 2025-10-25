import React, { useEffect, useState } from 'react';
import './AdminDashboard.css';
import AdminUsers from './AdminUsers';
import AdminConcepts from './AdminConcepts';
import AdminQuizzes from './AdminQuizzes';
import AdminAnalytics from './AdminAnalytics';
import MisconceptionAnalytics from './MisconceptionAnalytics';
import api from '../../apiClient';
import { toast } from 'react-toastify';

const AdminDashboard = ({ activeTab, setActiveTab }) => {
  const [counts, setCounts] = useState({ users: '—', concepts: '—', quizzes: '—', students: '—', teachers: '—' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchDashboardData = async () => {
    setLoading(true);
    setError('');
    try {
      const [conceptsRes, quizzesRes, analyticsRes] = await Promise.all([
        api.get('/concept', { params: { status: 'approved' } }),
        api.get('/quiz'),
        api.get('/admin/analytics/users-by-role')
      ]);
      
      setCounts({
        users: (analyticsRes?.data?.admin || 0) + (analyticsRes?.data?.teacher || 0) + (analyticsRes?.data?.student || 0),
        students: analyticsRes?.data?.student || 0,
        teachers: analyticsRes?.data?.teacher || 0,
        concepts: (conceptsRes.data || []).length,
        quizzes: (quizzesRes.data || []).length,
      });
    } catch (e) {
      setError(e?.response?.data?.message || 'Failed to load dashboard data');
      toast.error('Failed to load dashboard data. Please try again.');
      setCounts({ users: '—', concepts: '—', quizzes: '—', students: '—', teachers: '—' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const renderOverview = () => (
    <div className="admin-overview">
      {error && <div className="error-message">{error}</div>}
      {loading ? (
        <div className="loading-spinner">Loading dashboard data...</div>
      ) : (
        <>
          <div className="dashboard-header">
            <h2>Admin Dashboard</h2>
            <button className="refresh-btn" onClick={fetchDashboardData} disabled={loading}>
              {loading ? 'Refreshing...' : 'Refresh Data'}
            </button>
          </div>
          
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon primary">👥</div>
              <div className="stat-value">{counts.users}</div>
              <div className="stat-label">Total Users</div>
            </div>
            
            <div className="stat-card">
              <div className="stat-icon info">👨‍🏫</div>
              <div className="stat-value">{counts.teachers}</div>
              <div className="stat-label">Teachers</div>
            </div>
            
            <div className="stat-card">
              <div className="stat-icon secondary">🧑‍🎓</div>
              <div className="stat-value">{counts.students}</div>
              <div className="stat-label">Students</div>
            </div>
            
            <div className="stat-card">
              <div className="stat-icon success">📚</div>
              <div className="stat-value">{counts.concepts}</div>
              <div className="stat-label">Concepts</div>
            </div>
            
            <div className="stat-card">
              <div className="stat-icon warning">📝</div>
              <div className="stat-value">{counts.quizzes}</div>
              <div className="stat-label">Quizzes</div>
            </div>
          </div>

          <div className="dashboard-cards-container">
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
            
            <div className="dashboard-card">
              <h3>Quick Actions</h3>
              <div className="quick-actions">
                <button className="action-btn" onClick={() => setActiveTab('users')}>Manage Users</button>
                <button className="action-btn" onClick={() => setActiveTab('concepts')}>Manage Concepts</button>
                <button className="action-btn" onClick={() => setActiveTab('quizzes')}>Manage Quizzes</button>
                <button className="action-btn" onClick={() => setActiveTab('analytics')}>View Analytics</button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return renderOverview();
      case 'concepts':
        return <AdminConcepts />;
      case 'quizzes':
        return <AdminQuizzes />;
      case 'analytics':
        return <AdminAnalytics />;
      case 'misconceptions':
        return <MisconceptionAnalytics />;
      case 'users':
        return <AdminUsers />;
      case 'periodic-table':
        return (
          <div className="dashboard-card">
            <h3>Periodic Table</h3>
            <div style={{ paddingTop: 8 }}>
              {React.createElement(require('../PeriodicTable/PeriodicTable').default)}
            </div>
          </div>
        );
      case 'concept-map':
        return (
          <div className="dashboard-card">
            <h3>Concept Map Moderation</h3>
            <div style={{ paddingTop: 8 }}>
              {React.createElement(require('../Admin/AdminConceptMapModeration').default)}
            </div>
          </div>
        );
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