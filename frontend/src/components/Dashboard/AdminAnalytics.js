import React, { useEffect, useState } from 'react';
import api from '../../apiClient';
import './AdminAnalytics.css';
import { toast } from 'react-toastify';
import { Bar, Line, Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const RoleOption = ({ value, label }) => (
  <option value={value}>{label}</option>
);

const KpiCard = ({ icon, label, value, tone }) => (
  <div className={`kpi-card ${tone || ''}`}> 
    <div className="kpi-icon">{icon}</div>
    <div className="kpi-value">{value}</div>
    <div className="kpi-label">{label}</div>
  </div>
);

const AdminAnalytics = () => {
  const [roleFilter, setRoleFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [counts, setCounts] = useState({ admin: 0, teacher: 0, student: 0 });
  const [timeRange, setTimeRange] = useState('month'); // week, month, year
  const [summary, setSummary] = useState({
    concepts: { total: 0, approvedActive: 0 },
    quizzes: { total: 0, active: 0 },
    conceptsByStatus: { pending: 0, approved: 0, rejected: 0 },
    quizzesByDifficulty: { easy: 0, medium: 0, hard: 0 }
  });

  const fetchCounts = async (role) => {
    setLoading(true);
    setError('');
    try {
      const params = role ? { role } : undefined;
      const { data } = await api.get('/admin/analytics/users-by-role', { params });
      setCounts({ admin: data.admin || 0, teacher: data.teacher || 0, student: data.student || 0 });
    } catch (e) {
      const errorMsg = e?.response?.data?.message || 'Failed to load user analytics';
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const fetchSummary = async () => {
    try {
      const { data } = await api.get('/admin/summary', { params: { timeRange } });
      setSummary(data);
    } catch (e) {
      const errorMsg = e?.response?.data?.message || 'Failed to load summary analytics';
      toast.error(errorMsg);
    }
  };

  useEffect(() => {
    fetchCounts(roleFilter);
    fetchSummary();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roleFilter, timeRange]);

  const totalUsers = counts.admin + counts.teacher + counts.student;

  // Chart configurations
  const usersByRoleChart = {
    labels: ['Admin', 'Teacher', 'Student'],
    datasets: [
      {
        data: [counts.admin, counts.teacher, counts.student],
        backgroundColor: ['#ef4444', '#f59e0b', '#10b981'],
      },
    ],
  };

  const conceptsByStatusChart = {
    labels: ['Pending', 'Approved', 'Rejected'],
    datasets: [
      {
        data: [
          summary.conceptsByStatus.pending,
          summary.conceptsByStatus.approved,
          summary.conceptsByStatus.rejected,
        ],
        backgroundColor: ['#f59e0b', '#10b981', '#ef4444'],
      },
    ],
  };

  const quizzesByDifficultyChart = {
    labels: ['Easy', 'Medium', 'Hard'],
    datasets: [
      {
        data: [
          summary.quizzesByDifficulty.easy,
          summary.quizzesByDifficulty.medium,
          summary.quizzesByDifficulty.hard,
        ],
        backgroundColor: ['#10b981', '#f59e0b', '#ef4444'],
      },
    ],
  };

  const contentSummaryChart = {
    labels: ['Total', 'Active/Approved'],
    datasets: [
      {
        label: 'Concepts',
        data: [summary.concepts.total, summary.concepts.approvedActive],
        backgroundColor: '#10b981',
      },
      {
        label: 'Quizzes',
        data: [summary.quizzes.total, summary.quizzes.active],
        backgroundColor: '#6366f1',
      },
    ],
  };

  return (
    <div className="admin-analytics fade-in">
      <div className="analytics-header">
        <h2>System Analytics</h2>
        <div className="filters">
          <div className="filter-group">
            <label htmlFor="roleFilter">Role Filter:</label>
            <select
              id="roleFilter"
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
            >
              <RoleOption value="" label="All roles" />
              <RoleOption value="admin" label="Admin" />
              <RoleOption value="teacher" label="Teacher" />
              <RoleOption value="student" label="Student" />
            </select>
          </div>
          
          <div className="filter-group">
            <label htmlFor="timeRange">Time Range:</label>
            <select
              id="timeRange"
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
            >
              <option value="week">Last Week</option>
              <option value="month">Last Month</option>
              <option value="year">Last Year</option>
            </select>
          </div>
          
          <button
            className="refresh-btn"
            onClick={() => {
              fetchCounts(roleFilter);
              fetchSummary();
            }}
            disabled={loading}
          >
            {loading ? 'Loading...' : 'Refresh'}
          </button>
        </div>
      </div>

      {error && <div className="error">{error}</div>}

      {loading ? (
        <div className="loading">Loading analytics…</div>
      ) : (
        <>
          <div className="kpi-grid">
            <KpiCard icon="👥" label="Total Users" value={totalUsers} tone="primary" />
            <KpiCard icon="🛡️" label="Admins" value={counts.admin} />
            <KpiCard icon="📚" label="Teachers" value={counts.teacher} />
            <KpiCard icon="🎓" label="Students" value={counts.student} />
            <KpiCard icon="📝" label="Total Concepts" value={summary.concepts.total} tone="success" />
            <KpiCard icon="✅" label="Approved Concepts" value={summary.concepts.approvedActive} tone="success" />
            <KpiCard icon="❓" label="Total Quizzes" value={summary.quizzes.total} tone="info" />
            <KpiCard icon="✓" label="Active Quizzes" value={summary.quizzes.active} tone="info" />
          </div>
          
          <div className="charts-container">
            <div className="chart-card">
              <h3>Users by Role</h3>
              <div className="chart-container pie-chart">
                <Pie data={usersByRoleChart} options={{ maintainAspectRatio: false }} />
              </div>
            </div>

            <div className="chart-card">
              <h3>Concepts by Status</h3>
              <div className="chart-container pie-chart">
                <Pie data={conceptsByStatusChart} options={{ maintainAspectRatio: false }} />
              </div>
            </div>

            <div className="chart-card">
              <h3>Quizzes by Difficulty</h3>
              <div className="chart-container pie-chart">
                <Pie data={quizzesByDifficultyChart} options={{ maintainAspectRatio: false }} />
              </div>
            </div>

            <div className="chart-card">
              <h3>Content Summary</h3>
              <div className="chart-container">
                <Bar data={contentSummaryChart} options={{ maintainAspectRatio: false }} />
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}



export default AdminAnalytics;