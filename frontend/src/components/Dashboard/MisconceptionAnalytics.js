import React, { useEffect, useState, useCallback } from 'react';
import api from '../../apiClient';
import './MisconceptionAnalytics.css';

const MisconceptionAnalytics = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [timeRange, setTimeRange] = useState('30d');

  const loadAnalytics = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const { data } = await api.get('/remediation/analytics', {
        params: { timeRange }
      });
      setAnalytics(data);
    } catch (e) {
      setError(e.response?.data?.message || 'Failed to load analytics');
    } finally {
      setLoading(false);
    }
  }, [timeRange]);

  useEffect(() => {
    loadAnalytics();
  }, [timeRange, loadAnalytics]);

  const getCategoryColor = (category) => {
    const colors = {
      'acid-base': '#ef4444',
      'periodic-table': '#3b82f6',
      'bonding': '#10b981',
      'stoichiometry': '#f59e0b',
      'thermodynamics': '#8b5cf6',
      'general': '#6b7280'
    };
    return colors[category] || '#6b7280';
  };

  // const getSeverityColor = (severity) => {
  //   const colors = {
  //     'high': '#ef4444',
  //     'medium': '#f59e0b',
  //     'low': '#10b981'
  //   };
  //   return colors[severity] || '#6b7280';
  // };

  if (loading) {
    return (
      <div className="misconception-analytics">
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading misconception analytics...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="misconception-analytics">
        <div className="error-state">
          <div className="error-icon">⚠️</div>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="misconception-analytics">
      <div className="analytics-header">
        <h2>🧠 Misconception Analytics</h2>
        <p>Track and analyze common chemistry misconceptions across students</p>
        
        <div className="time-range-selector">
          <label>Time Range:</label>
          <select value={timeRange} onChange={(e) => setTimeRange(e.target.value)}>
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
            <option value="1y">Last year</option>
          </select>
        </div>
      </div>

      {analytics && (
        <div className="analytics-content">
          {/* Overview Cards */}
          <div className="overview-cards">
            <div className="overview-card">
              <div className="card-icon">📊</div>
              <div className="card-content">
                <h3>{analytics.totalMisconceptions}</h3>
                <p>Total Misconceptions</p>
              </div>
            </div>
            
            <div className="overview-card">
              <div className="card-icon">🔥</div>
              <div className="card-content">
                <h3>{analytics.bySeverity?.high || 0}</h3>
                <p>High Severity</p>
              </div>
            </div>
            
            <div className="overview-card">
              <div className="card-icon">⚠️</div>
              <div className="card-content">
                <h3>{analytics.bySeverity?.medium || 0}</h3>
                <p>Medium Severity</p>
              </div>
            </div>
            
            <div className="overview-card">
              <div className="card-icon">✅</div>
              <div className="card-content">
                <h3>{analytics.bySeverity?.low || 0}</h3>
                <p>Low Severity</p>
              </div>
            </div>
          </div>

          {/* Charts Section */}
          <div className="charts-section">
            {/* Category Distribution */}
            <div className="chart-card">
              <h3>Misconceptions by Category</h3>
              <div className="chart-content">
                {Object.entries(analytics.byCategory || {}).map(([category, count]) => (
                  <div key={category} className="category-bar">
                    <div className="category-label">
                      <span 
                        className="category-color" 
                        style={{ backgroundColor: getCategoryColor(category) }}
                      ></span>
                      {category.replace('-', ' ').toUpperCase()}
                    </div>
                    <div className="bar-container">
                      <div 
                        className="bar-fill"
                        style={{ 
                          width: `${(count / Math.max(...Object.values(analytics.byCategory || {}))) * 100}%`,
                          backgroundColor: getCategoryColor(category)
                        }}
                      ></div>
                      <span className="bar-count">{count}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Topic Distribution */}
            <div className="chart-card">
              <h3>Misconceptions by Topic</h3>
              <div className="topic-grid">
                {Object.entries(analytics.byTopic || {}).map(([topic, count]) => (
                  <div key={topic} className="topic-item">
                    <span className="topic-name">{topic}</span>
                    <span className="topic-count">{count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Top Misconceptions */}
          <div className="top-misconceptions">
            <h3>Top Misconceptions</h3>
            <div className="misconceptions-list">
              {analytics.topMisconceptions?.map((item, index) => (
                <div key={index} className="misconception-item">
                  <div className="misconception-rank">#{index + 1}</div>
                  <div className="misconception-content">
                    <div className="misconception-text">{item.misconception}</div>
                    <div className="misconception-count">{item.count} occurrences</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MisconceptionAnalytics;
