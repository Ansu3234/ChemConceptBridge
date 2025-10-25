import React, { useEffect, useState } from 'react';
import './RemediationModule.css';
import api from '../../apiClient';

const RemediationModule = ({ attemptId }) => {
  const [recs, setRecs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [analytics, setAnalytics] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('all');

  useEffect(() => {
    if (!attemptId) return;
    (async () => {
      try {
        setLoading(true);
        setError('');
        const { data } = await api.post('/remediation/recommend', { attemptId });
        setRecs(data?.recommendations || []);
        setAnalytics(data);
      } catch (e) {
        setError(e?.response?.data?.message || 'Failed to load recommendations');
      } finally {
        setLoading(false);
      }
    })();
  }, [attemptId]);

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'high': return '#ff4444';
      case 'medium': return '#ffaa00';
      case 'low': return '#44aa44';
      default: return '#666666';
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'video': return '🎥';
      case 'article': return '📖';
      case 'interactive': return '🎮';
      case 'animation': return '🎬';
      case 'simulation': return '🧪';
      case 'calculator': return '🧮';
      case 'visualization': return '📊';
      default: return '📝';
    }
  };

  const filteredRecs = selectedCategory === 'all' 
    ? recs 
    : recs.filter(r => r.category === selectedCategory);

  const categories = analytics?.categories || [];

  return (
    <div className="remediation-module">
      <div className="remediation-header">
        <h2>🧠 AI-Powered Remediation Module</h2>
        <p>Personalized learning resources based on detected misconceptions</p>
        
        {analytics && (
          <div className="analytics-summary">
            <div className="summary-card">
              <span className="summary-number">{analytics.detectedMisconceptions}</span>
              <span className="summary-label">Misconceptions Detected</span>
            </div>
            <div className="summary-card">
              <span className="summary-number">{analytics.summary?.highSeverity || 0}</span>
              <span className="summary-label">High Priority</span>
            </div>
            <div className="summary-card">
              <span className="summary-number">{analytics.summary?.total || 0}</span>
              <span className="summary-label">Resources Available</span>
            </div>
          </div>
        )}
      </div>

      {categories.length > 1 && (
        <div className="category-filter">
          <label>Filter by category:</label>
          <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)}>
            <option value="all">All Categories</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>
                {cat.charAt(0).toUpperCase() + cat.slice(1).replace('-', ' ')}
              </option>
            ))}
          </select>
        </div>
      )}

      <div className="remediation-content">
        {loading && (
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Analyzing your responses and detecting misconceptions...</p>
          </div>
        )}
        
        {error && (
          <div className="error-state">
            <div className="error-icon">⚠️</div>
            <p>{error}</p>
          </div>
        )}
        
        {!loading && !error && filteredRecs.length === 0 && (
          <div className="empty-state">
            <div className="empty-icon">🎉</div>
            <h3>Great job!</h3>
            <p>No misconceptions detected. Keep up the excellent work!</p>
          </div>
        )}

        {!loading && !error && filteredRecs.length > 0 && (
          <div className="recommendations-grid">
            {filteredRecs.map((rec, i) => (
              <div key={i} className="recommendation-card" style={{ borderLeftColor: getSeverityColor(rec.severity) }}>
                <div className="rec-header">
                  <span className="rec-type-icon">{getTypeIcon(rec.type)}</span>
                  <span className="rec-type">{rec.type}</span>
                  <span className="rec-severity" style={{ backgroundColor: getSeverityColor(rec.severity) }}>
                    {rec.severity}
                  </span>
                </div>
                
                <div className="rec-content">
                  <h4>{rec.title}</h4>
                  {rec.reason && (
                    <div className="rec-reason">
                      <strong>Misconception:</strong> {rec.reason}
                    </div>
                  )}
                  {rec.confidence && (
                    <div className="rec-confidence">
                      <span>Confidence: {Math.round(rec.confidence * 100)}%</span>
                    </div>
                  )}
                </div>
                
                <div className="rec-actions">
                  <a 
                    href={rec.url} 
                    target="_blank" 
                    rel="noreferrer"
                    className="rec-link"
                  >
                    {rec.type === 'calculator' ? 'Use Tool' : 'View Resource'}
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default RemediationModule;
