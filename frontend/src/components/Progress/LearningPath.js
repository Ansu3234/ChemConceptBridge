import React, { useState, useEffect } from 'react';
import './LearningPath.css';
import api from '../../apiClient';

const LearningPath = ({ onStartTopic }) => {
  const [roadmap, setRoadmap] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expandedTopic, setExpandedTopic] = useState(null);
  const [completedTopics, setCompletedTopics] = useState([]);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        setError('');
        const { data } = await api.get('/learning-path');
        setRoadmap(data);
      } catch (err) {
        setError(err?.response?.data?.error || err.message || 'Failed to load learning path');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return '#ff6b6b';
      case 'medium': return '#ffa726';
      case 'low': return '#66bb6a';
      default: return '#42a5f5';
    }
  };

  const getMasteryColor = (mastery) => {
    if (mastery >= 80) return '#4caf50';
    if (mastery >= 60) return '#ff9800';
    if (mastery >= 40) return '#ff7043';
    return '#f44336';
  };

  const getMasteryLabel = (mastery) => {
    if (mastery === 0) return 'Not Started';
    if (mastery < 40) return 'Struggling';
    if (mastery < 60) return 'Learning';
    if (mastery < 80) return 'Proficient';
    return 'Mastered';
  };

  const getStepColor = (step) => {
    if (step.includes('1')) return '#ff6b6b';
    if (step.includes('2')) return '#ffa726';
    if (step.includes('3')) return '#66bb6a';
    return '#42a5f5';
  };

  const toggleComplete = (idx) => {
    setCompletedTopics(prev =>
      prev.includes(idx) ? prev.filter(i => i !== idx) : [...prev, idx]
    );
  };

  if (loading) {
    return (
      <div className="learning-path">
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Generating your personalized learning path...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="learning-path">
        <div className="error-state">
          <div className="error-icon">⚠️</div>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  // Group topics by step
  const groupedTopics = {};
  roadmap?.weeklyTopics?.forEach(topic => {
    const step = topic.step || 'Other';
    if (!groupedTopics[step]) {
      groupedTopics[step] = [];
    }
    groupedTopics[step].push(topic);
  });

  const stepOrder = ['Step 1: Foundation', 'Step 2: Reinforcement', 'Step 3: Advanced'];
  const sortedSteps = stepOrder.filter(step => groupedTopics[step]);

  return (
    <div className="learning-path">
      {/* Header */}
      <div className="lp-header">
        <div className="lp-header-content">
          <h1>📚 Your Personalized Learning Path</h1>
          <p>{roadmap?.message}</p>
        </div>
      </div>

      {/* Statistics Dashboard */}
      {roadmap?.statistics && (
        <div className="lp-statistics">
          <div className="stat-card">
            <div className="stat-number">{roadmap.statistics.totalQuizzesTaken}</div>
            <div className="stat-label">Quizzes Taken</div>
          </div>
          <div className="stat-card">
            <div className="stat-number" style={{ color: getMasteryColor(roadmap.statistics.averageMastery) }}>
              {roadmap.statistics.averageMastery}%
            </div>
            <div className="stat-label">Avg Mastery</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">{roadmap.statistics.topicsStudied}</div>
            <div className="stat-label">Topics Studied</div>
          </div>
          <div className="stat-card">
            <div className="stat-number" style={{ color: '#4caf50' }}>
              {roadmap.statistics.improvingTopics}
            </div>
            <div className="stat-label">Improving</div>
          </div>
        </div>
      )}

      {/* Overall Recommendation */}
      <div className="lp-recommendation">
        <div className="recommendation-icon">💡</div>
        <div className="recommendation-content">
          <h3>Key Insight</h3>
          <p>{roadmap?.overallRecommendation}</p>
        </div>
      </div>

      {/* Ordered Step-by-Step Roadmap */}
      <div className="lp-steps-section">
        <h2>📍 Your Learning Journey</h2>
        <div className="lp-steps-container">
          {sortedSteps.map((step, stepIdx) => (
            <div key={stepIdx} className="lp-step">
              <div className="step-header" style={{ borderLeftColor: getStepColor(step) }}>
                <div className="step-number" style={{ backgroundColor: getStepColor(step) }}>
                  {stepIdx + 1}
                </div>
                <h3>{step}</h3>
                <span className="step-count">
                  {completedTopics.filter(idx => groupedTopics[step].includes(roadmap.weeklyTopics[idx])).length} 
                  / 
                  {groupedTopics[step].length}
                </span>
              </div>

              <div className="step-topics">
                {groupedTopics[step].map((topic, topicIdx) => {
                  const globalIdx = roadmap.weeklyTopics.indexOf(topic);
                  const isCompleted = completedTopics.includes(globalIdx);

                  return (
                    <div
                      key={topicIdx}
                      className={`topic-card ${isCompleted ? 'completed' : ''}`}
                      style={{ borderLeftColor: getStepColor(step) }}
                      onClick={() => setExpandedTopic(expandedTopic === globalIdx ? null : globalIdx)}
                    >
                      <div className="topic-header">
                        <div className="topic-number">
                          {globalIdx + 1}
                        </div>
                        <div className="topic-info">
                          <h4>{topic.title}</h4>
                          <span className="topic-label">{topic.topic}</span>
                        </div>
                        <button
                          className="complete-btn"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleComplete(globalIdx);
                          }}
                          title={isCompleted ? 'Mark as incomplete' : 'Mark as complete'}
                        >
                          {isCompleted ? '✅' : '⭕'}
                        </button>
                      </div>

                      <div className="topic-meta">
                        <span className="meta-item">
                          <span className="meta-icon">🎓</span>
                          {topic.difficulty}
                        </span>
                        <span className="meta-item">
                          <span className="meta-icon">⏱️</span>
                          {topic.estimatedTime} min
                        </span>
                      </div>

                      {/* Mastery Bar */}
                      {topic.masteryLevel !== undefined && (
                        <div className="mastery-section">
                          <div className="mastery-label">
                            <span>Mastery</span>
                            <span style={{ color: getMasteryColor(topic.masteryLevel), fontWeight: 600 }}>
                              {topic.masteryLevel}%
                            </span>
                          </div>
                          <div className="mastery-bar">
                            <div
                              className="mastery-fill"
                              style={{
                                width: `${topic.masteryLevel}%`,
                                backgroundColor: getMasteryColor(topic.masteryLevel)
                              }}
                            />
                          </div>
                          <div className="mastery-label-text">
                            {getMasteryLabel(topic.masteryLevel)}
                            {topic.recentTrend && topic.recentTrend !== 'stable' && (
                              <span className={`trend ${topic.recentTrend}`}>
                                {topic.recentTrend === 'improving' ? '📈 Improving' : '📉 Declining'}
                              </span>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Expandable Details */}
                      <div className={`topic-details ${expandedTopic === globalIdx ? 'expanded' : ''}`}>
                        <p className="topic-reason">{topic.reason}</p>
                        <button
                          className="action-btn"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (typeof onStartTopic === 'function') {
                              onStartTopic(topic.topic || topic.title);
                            }
                          }}
                        >
                          {topic.recommendedAction === 'Focus here first' ? '🎯 Start Here' : '📖 Continue'}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {stepIdx < sortedSteps.length - 1 && <div className="step-connector" />}
            </div>
          ))}
        </div>
      </div>

      {/* Next Steps & Insights */}
      {roadmap?.nextSteps && (
        <div className="lp-next-steps">
          <h3>🚀 Recommended Next Steps</h3>
          <ul>
            {roadmap.nextSteps.map((step, idx) => (
              <li key={idx}>{step}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Topic Performance Details */}
      {roadmap?.topicDetails && roadmap.topicDetails.length > 0 && (
        <div className="lp-details-section">
          <h3>📊 Detailed Topic Performance</h3>
          <div className="lp-details-table">
            <div className="lp-details-header">
              <div className="col-topic">Topic</div>
              <div className="col-mastery">Mastery</div>
              <div className="col-attempts">Attempts</div>
              <div className="col-trend">Trend</div>
            </div>
            {roadmap.topicDetails.map((detail, idx) => (
              <div key={idx} className="lp-details-row">
                <div className="col-topic">{detail.topic}</div>
                <div className="col-mastery">
                  <span style={{ color: getMasteryColor(detail.mastery), fontWeight: 600 }}>
                    {detail.mastery}%
                  </span>
                </div>
                <div className="col-attempts">{detail.attemptCount}</div>
                <div className="col-trend">
                  <span className={`trend-badge ${detail.recentTrend}`}>
                    {detail.recentTrend === 'improving' && '📈'} {detail.recentTrend === 'declining' && '📉'} {detail.recentTrend === 'stable' && '→'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default LearningPath;
