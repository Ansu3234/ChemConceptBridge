import React, { useEffect, useState } from 'react';
import './PerformanceDashboard.css';
import api from '../../apiClient';

const empty = { quizzesTaken: 0, averageScore: 0, scores: [] };

const PerformanceDashboard = () => {
  const [performance, setPerformance] = useState(empty);
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        setError('');
        const [statsRes, perfRes, predRes] = await Promise.all([
          api.get('/user/stats'),
          api.get('/user/performance'),
          api.get('/ml/my-prediction').catch(() => ({ data: null }))
        ]);
        const quizzesTaken = perfRes?.data?.totalAttempts || 0;
        const scores = (perfRes?.data?.topics || []).map(t => ({ quiz: t.topic, score: t.averageScore }));
        const avg = scores.length ? Math.round((scores.reduce((s, x) => s + x.score, 0) / scores.length) * 10) / 10 : 0;
        setPerformance({ quizzesTaken, averageScore: avg, scores });
        
        if (predRes?.data) {
          setPrediction(predRes.data);
        }
      } catch (e) {
        setError(e?.response?.data?.message || 'Failed to load performance');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const calculateEstimatedScore = (probs) => {
    if (!probs) return 0;
    // weak: ~40, average: ~70, strong: ~90
    const score = (probs.weak || 0) * 40 + (probs.average || 0) * 70 + (probs.strong || 0) * 90;
    return Math.round(score);
  };

  return (
    <div className="performance-dashboard">
      <div className="perf-header">
        <h2>Performance Dashboard</h2>
        <p>Track your quiz progress and scores</p>
      </div>
      {loading && <div>Loading…</div>}
      {error && <div className="error">{error}</div>}
      
      {prediction && !prediction.error && (
        <div className="ai-prediction-section">
          <h3>🔮 AI Performance Prediction</h3>
          <div className="prediction-card">
            <div className="prediction-main">
              <span className="prediction-label">Current Level:</span>
              <span className={`prediction-value ${prediction.prediction}`}>
                {prediction.prediction.toUpperCase()}
              </span>
            </div>
            {prediction.probabilities && (
              <div className="prediction-details">
                <div className="estimated-score">
                  <span className="label">Predicted Next Score:</span>
                  <span className="value">{calculateEstimatedScore(prediction.probabilities)}%</span>
                </div>
                <div className="probability-bars">
                  {Object.entries(prediction.probabilities).map(([key, val]) => (
                    <div key={key} className="prob-bar-row">
                      <span className="prob-label">{key}</span>
                      <div className="prob-track">
                        <div 
                          className={`prob-fill ${key}`} 
                          style={{ width: `${val * 100}%` }}
                        ></div>
                      </div>
                      <span className="prob-val">{Math.round(val * 100)}%</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="perf-summary">
        <div className="perf-card">
          <div className="perf-label">Quizzes Taken</div>
          <div className="perf-value">{performance.quizzesTaken}</div>
        </div>
        <div className="perf-card">
          <div className="perf-label">Average Score</div>
          <div className="perf-value">{performance.averageScore}%</div>
        </div>
      </div>
      <div className="perf-chart-section">
        <h3>Quiz Scores</h3>
        <div className="perf-bar-chart">
          {performance.scores.map((item, idx) => (
            <div className="bar-row" key={idx}>
              <div className="bar-label">{item.quiz}</div>
              <div className="bar-outer">
                <div className="bar-inner" style={{ width: `${item.score}%` }}></div>
                <span className="bar-score">{item.score}%</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PerformanceDashboard;
