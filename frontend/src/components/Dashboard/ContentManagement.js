import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './ContentManagement.css';
import api from '../../apiClient';

const ContentManagement = ({ user }) => {
  const [stats, setStats] = useState({
    totalConcepts: 0,
    totalQuizzes: 0,
    activeStudents: 0,
    recentActivity: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Fetch concepts and quizzes to get counts
        const [conceptsRes, quizzesRes] = await Promise.all([
          api.get('/concept'),
          api.get('/quiz')
        ]);

        const myConcepts = conceptsRes.data.filter(c => (c.createdBy?._id || c.createdBy) === user.id);
        const myQuizzes = quizzesRes.data.filter(q => (q.createdBy?._id || q.createdBy) === user.id);

        // Try to get student count from quiz stats
        let studentCount = 0;
        try {
          const statsPromises = myQuizzes.map(q => api.get(`/quiz/${q._id}/stats`).catch(() => null));
          const statsResults = await Promise.all(statsPromises);
          const uniqueStudents = new Set();
          statsResults.forEach(stats => {
            if (stats?.data?.studentPerformance) {
              stats.data.studentPerformance.forEach(sp => {
                uniqueStudents.add(sp.student?._id || sp.student);
              });
            }
          });
          studentCount = uniqueStudents.size;
        } catch (e) {
          // Ignore errors
        }

        setStats({
          totalConcepts: myConcepts.length,
          totalQuizzes: myQuizzes.length,
          activeStudents: studentCount,
          recentActivity: []
        });
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setLoading(false);
      }
    };

    if (user?.id) {
      fetchStats();
    }
  }, [user]);

  return (
    <div className="content-management-container">
      <div className="content-management-header">
        <div>
          <h2>Content Management</h2>
          <p className="subtitle">Manage and organize your educational content</p>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="stats-grid">
        <div className="stat-card stat-card-primary">
          <div className="stat-icon">📚</div>
          <div className="stat-content">
            <div className="stat-label">Total Concepts</div>
            <div className="stat-value">{loading ? '—' : stats.totalConcepts}</div>
          </div>
        </div>

        <div className="stat-card stat-card-secondary">
          <div className="stat-icon">📝</div>
          <div className="stat-content">
            <div className="stat-label">Total Quizzes</div>
            <div className="stat-value">{loading ? '—' : stats.totalQuizzes}</div>
          </div>
        </div>

        <div className="stat-card stat-card-success">
          <div className="stat-icon">👥</div>
          <div className="stat-content">
            <div className="stat-label">Active Students</div>
            <div className="stat-value">{loading ? '—' : stats.activeStudents}</div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="quick-actions-section">
        <h3 className="section-title">Quick Actions</h3>
        <div className="action-grid">
          <Link to="/teacher-dashboard" onClick={(e) => {
            e.preventDefault();
            window.dispatchEvent(new CustomEvent('navigate-to-tab', { detail: 'concepts' }));
          }} className="action-card action-card-primary">
            <div className="action-icon">📚</div>
            <div className="action-content">
              <h4>Manage Concepts</h4>
              <p>Create and edit learning concepts</p>
            </div>
            <div className="action-arrow">→</div>
          </Link>

          <Link to="/teacher-dashboard" onClick={(e) => {
            e.preventDefault();
            window.dispatchEvent(new CustomEvent('navigate-to-tab', { detail: 'quizzes' }));
          }} className="action-card action-card-secondary">
            <div className="action-icon">📝</div>
            <div className="action-content">
              <h4>Manage Quizzes</h4>
              <p>Create and customize quizzes</p>
            </div>
            <div className="action-arrow">→</div>
          </Link>

          <Link to="/teacher-dashboard" onClick={(e) => {
            e.preventDefault();
            window.dispatchEvent(new CustomEvent('navigate-to-tab', { detail: 'concept-map' }));
          }} className="action-card action-card-tertiary">
            <div className="action-icon">🗺️</div>
            <div className="action-content">
              <h4>Concept Maps</h4>
              <p>Visualize concept relationships</p>
            </div>
            <div className="action-arrow">→</div>
          </Link>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="recent-activity-section">
        <h3 className="section-title">Content Overview</h3>
        <div className="overview-grid">
          <div className="overview-card">
            <div className="overview-header">
              <span className="overview-title">📖 Teaching Materials</span>
            </div>
            <div className="overview-body">
              <p>Keep your concepts updated and engaging for students.</p>
              <div className="overview-action">
                <button className="btn-outline" onClick={() => {
                  window.dispatchEvent(new CustomEvent('navigate-to-tab', { detail: 'concepts' }));
                }}>
                  View Concepts
                </button>
              </div>
            </div>
          </div>

          <div className="overview-card">
            <div className="overview-header">
              <span className="overview-title">✏️ Assessments</span>
            </div>
            <div className="overview-body">
              <p>Track student progress with interactive quizzes.</p>
              <div className="overview-action">
                <button className="btn-outline" onClick={() => {
                  window.dispatchEvent(new CustomEvent('navigate-to-tab', { detail: 'quizzes' }));
                }}>
                  View Quizzes
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContentManagement;
