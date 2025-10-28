import React, { useCallback, useEffect, useState } from 'react';
import './AdminDashboard.css';
import AdminUsers from './AdminUsers';
import AdminConcepts from './AdminConcepts';
import AdminQuizzes from './AdminQuizzes';
import AdminAnalytics from './AdminAnalytics';
import MisconceptionAnalytics from './MisconceptionAnalytics';
import AdminSystemSettings from './AdminSystemSettings';
import api from '../../apiClient';
import { toast } from 'react-toastify';

const AdminDashboard = ({ activeTab, setActiveTab }) => {
  const [counts, setCounts] = useState({ users: '—', concepts: '—', quizzes: '—', students: '—', teachers: '—' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [reportsData, setReportsData] = useState({ summary: null, users: { admin: 0, teacher: 0, student: 0 }, concepts: [], quizzes: [] });
  const [reportsLoading, setReportsLoading] = useState(false);
  const [reportsError, setReportsError] = useState('');

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

  useEffect(() => {
    if (activeTab === 'reports') {
      loadReports();
    }
  }, [activeTab]);

  const loadReports = useCallback(async () => {
    setReportsLoading(true);
    setReportsError('');
    try {
      const [summaryRes, usersRes, quizzesRes, conceptsRes] = await Promise.all([
        api.get('/admin/summary'),
        api.get('/admin/analytics/users-by-role'),
        api.get('/quiz'),
        api.get('/concept')
      ]);
      setReportsData({
        summary: summaryRes?.data || null,
        users: {
          admin: usersRes?.data?.admin || 0,
          teacher: usersRes?.data?.teacher || 0,
          student: usersRes?.data?.student || 0
        },
        quizzes: quizzesRes?.data || [],
        concepts: conceptsRes?.data || []
      });
    } catch (e) {
      const message = e?.response?.data?.message || 'Failed to load reports';
      setReportsError(message);
      toast.error(message);
      setReportsData({ summary: null, users: { admin: 0, teacher: 0, student: 0 }, concepts: [], quizzes: [] });
    } finally {
      setReportsLoading(false);
    }
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
        return (
          <div className="tab-content">
            <AdminSystemSettings />
          </div>
        );
      case 'reports':
        return (
          <div className="reports-section">
            <div className="reports-header">
              <div>
                <h2>Reports</h2>
                <p>Comprehensive performance insights across users, content, and engagement.</p>
              </div>
              <button className="refresh-btn" onClick={loadReports} disabled={reportsLoading}>
                {reportsLoading ? 'Loading…' : 'Refresh Reports'}
              </button>
            </div>

            {reportsError && <div className="error-message">{reportsError}</div>}

            {reportsLoading ? (
              <div className="loading-spinner">Loading reports...</div>
            ) : (
              <>
                <div className="reports-grid">
                  <div className="reports-card">
                    <h3>User Distribution</h3>
                    <div className="reports-grid-cols">
                      <div className="reports-stat">
                        <span className="reports-stat-label">Admins</span>
                        <span className="reports-stat-value">{reportsData.users.admin}</span>
                      </div>
                      <div className="reports-stat">
                        <span className="reports-stat-label">Teachers</span>
                        <span className="reports-stat-value">{reportsData.users.teacher}</span>
                      </div>
                      <div className="reports-stat">
                        <span className="reports-stat-label">Students</span>
                        <span className="reports-stat-value">{reportsData.users.student}</span>
                      </div>
                    </div>
                  </div>

                  <div className="reports-card">
                    <h3>Concept Overview</h3>
                    <div className="reports-grid-cols">
                      <div className="reports-stat">
                        <span className="reports-stat-label">Total Concepts</span>
                        <span className="reports-stat-value">{reportsData.summary?.concepts?.total || 0}</span>
                      </div>
                      <div className="reports-stat">
                        <span className="reports-stat-label">Approved & Active</span>
                        <span className="reports-stat-value">{reportsData.summary?.concepts?.approvedActive || 0}</span>
                      </div>
                      <div className="reports-stat">
                        <span className="reports-stat-label">Pending</span>
                        <span className="reports-stat-value">{reportsData.summary?.conceptsByStatus?.pending || 0}</span>
                      </div>
                    </div>
                  </div>

                  <div className="reports-card">
                    <h3>Quiz Overview</h3>
                    <div className="reports-grid-cols">
                      <div className="reports-stat">
                        <span className="reports-stat-label">Total Quizzes</span>
                        <span className="reports-stat-value">{reportsData.summary?.quizzes?.total || 0}</span>
                      </div>
                      <div className="reports-stat">
                        <span className="reports-stat-label">Active Quizzes</span>
                        <span className="reports-stat-value">{reportsData.summary?.quizzes?.active || 0}</span>
                      </div>
                      <div className="reports-stat">
                        <span className="reports-stat-label">Hard Difficulty</span>
                        <span className="reports-stat-value">{reportsData.summary?.quizzesByDifficulty?.hard || 0}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="reports-table-container">
                  <div className="reports-table">
                    <h3>Latest Concepts</h3>
                    <table>
                      <thead>
                        <tr>
                          <th>Title</th>
                          <th>Status</th>
                          <th>Updated</th>
                        </tr>
                      </thead>
                      <tbody>
                        {reportsData.concepts.slice(0, 5).map((concept) => (
                          <tr key={concept._id}>
                            <td>{concept.title}</td>
                            <td>{concept.status}</td>
                            <td>{new Date(concept.updatedAt).toLocaleDateString()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="reports-table">
                    <h3>Latest Quizzes</h3>
                    <table>
                      <thead>
                        <tr>
                          <th>Title</th>
                          <th>Difficulty</th>
                          <th>Updated</th>
                        </tr>
                      </thead>
                      <tbody>
                        {reportsData.quizzes.slice(0, 5).map((quiz) => (
                          <tr key={quiz._id}>
                            <td>{quiz.title}</td>
                            <td>{quiz.difficulty}</td>
                            <td>{new Date(quiz.updatedAt).toLocaleDateString()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            )}
          </div>
        );
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