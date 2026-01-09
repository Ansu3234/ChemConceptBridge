import React, { useState, useEffect } from 'react';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement, PointElement, LineElement, Filler } from 'chart.js';
import api from '../../apiClient';
import { Bar, Doughnut, Line } from 'react-chartjs-2';
import './ProgressTracker.css';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
  Filler
);

const ProgressTracker = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalQuizzes: 0,
    accuracy: 0,
    conceptsLearned: 0,
    currentStreak: 0,
    xpPoints: 0,
    level: 1,
    recentActivity: []
  });

  useEffect(() => {
    const fetchUserStats = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        if (!token) {
          // Don't show error for missing token, just use default stats
          setLoading(false);
          return;
        }
        
        const { data } = await api.get('/user/stats');
        setStats({
          totalQuizzes: data.totalQuizzes || 0,
          accuracy: data.accuracy || 0,
          conceptsLearned: data.conceptsLearned || 0,
          currentStreak: data.currentStreak || 0,
          xpPoints: data.xpPoints || 0,
          level: data.level || 1,
          recentActivity: data.recentActivity || []
        });
        setLoading(false);
      } catch (err) {
        // Silently handle errors without redirecting
        setLoading(false);
      }
    };
    
    fetchUserStats();
  }, []);

  // Sample data for charts
  const conceptProgressData = {
    labels: ['Acids & Bases', 'Periodic Table', 'Chemical Bonding', 'Thermodynamics', 'Organic Chemistry'],
    datasets: [
      {
        label: 'Mastery Level',
        data: [85, 65, 70, 40, 55],
        backgroundColor: 'rgba(59, 130, 246, 0.6)',
        borderColor: 'rgba(59, 130, 246, 1)',
        borderWidth: 1,
      },
    ],
  };

  const quizPerformanceData = {
    labels: ['Quiz 1', 'Quiz 2', 'Quiz 3', 'Quiz 4', 'Quiz 5'],
    datasets: [
      {
        label: 'Score (%)',
        data: [75, 82, 68, 90, 85],
        borderColor: 'rgba(22, 163, 74, 1)',
        backgroundColor: 'rgba(22, 163, 74, 0.2)',
        tension: 0.4,
        fill: true,
      },
    ],
  };

  const topicDistributionData = {
    labels: ['Completed', 'In Progress', 'Not Started'],
    datasets: [
      {
        data: [stats.conceptsLearned, 3, 7],
        backgroundColor: [
          'rgba(22, 163, 74, 0.7)',
          'rgba(59, 130, 246, 0.7)',
          'rgba(229, 231, 235, 0.7)',
        ],
        borderColor: [
          'rgba(22, 163, 74, 1)',
          'rgba(59, 130, 246, 1)',
          'rgba(229, 231, 235, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  if (loading) {
    return (
      <div className="progress-tracker">
        <div className="progress-header">
          <h2>Progress Tracker</h2>
          <p>Monitor your learning journey and achievements</p>
        </div>
        <div className="progress-content">
          <div className="loading-spinner">Loading your progress data...</div>
        </div>
      </div>
    );
  }

  // Removed error display since we're handling errors silently

  return (
    <div className="progress-tracker">
      <div className="progress-header">
        <h2>Progress Tracker</h2>
        <p>Monitor your learning journey and achievements</p>
      </div>
      
      <div className="progress-content">
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon">📊</div>
            <div className="stat-value">{stats.totalQuizzes}</div>
            <div className="stat-label">Quizzes Completed</div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon">🎯</div>
            <div className="stat-value">{stats.accuracy}%</div>
            <div className="stat-label">Accuracy</div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon">🧪</div>
            <div className="stat-value">{stats.conceptsLearned}</div>
            <div className="stat-label">Concepts Mastered</div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon">🔥</div>
            <div className="stat-value">{stats.currentStreak}</div>
            <div className="stat-label">Day Streak</div>
          </div>
        </div>
        
        <div className="charts-grid">
          <div className="chart-container">
            <h3>Concept Mastery</h3>
            <Bar 
              data={conceptProgressData}
              options={{
                responsive: true,
                plugins: {
                  legend: { display: false },
                  tooltip: { enabled: true }
                },
                scales: {
                  y: {
                    beginAtZero: true,
                    max: 100,
                    title: { display: true, text: 'Mastery (%)' }
                  }
                }
              }}
            />
          </div>
          
          <div className="chart-container">
            <h3>Quiz Performance</h3>
            <Line 
              data={quizPerformanceData}
              options={{
                responsive: true,
                plugins: {
                  legend: { display: false },
                  tooltip: { enabled: true }
                },
                scales: {
                  y: {
                    beginAtZero: true,
                    max: 100,
                    title: { display: true, text: 'Score (%)' }
                  }
                }
              }}
            />
          </div>
          
          <div className="chart-container donut-chart">
            <h3>Topic Distribution</h3>
            <Doughnut 
              data={topicDistributionData}
              options={{
                responsive: true,
                plugins: {
                  legend: { position: 'bottom' }
                },
                cutout: '70%'
              }}
            />
          </div>
          
          <div className="chart-container">
            <h3>Recent Activity</h3>
            {stats.recentActivity && stats.recentActivity.length > 0 ? (
              <div className="activity-list">
                {stats.recentActivity.map((activity, index) => (
                  <div key={index} className="activity-item">
                    <div className="activity-icon">{activity.type === 'quiz' ? '📝' : '🧪'}</div>
                    <div className="activity-details">
                      <div className="activity-title">{activity.title}</div>
                      <div className="activity-meta">
                        {activity.score !== undefined && <span className="activity-score">{activity.score}%</span>}
                        <span className="activity-date">{new Date(activity.date).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-activity">
                <p>No recent activity to display</p>
              </div>
            )}
          </div>
        </div>
        
        <div className="recommendations">
          <h3>Recommended Next Steps</h3>
          <div className="recommendation-cards">
            <div className="recommendation-card">
              <div className="recommendation-icon">🔍</div>
              <h4>Review Weak Areas</h4>
              <p>Focus on Chemical Bonding concepts to improve your understanding</p>
              <button className="recommendation-button">Start Review</button>
            </div>
            
            <div className="recommendation-card">
              <div className="recommendation-icon">📝</div>
              <h4>Take Practice Quiz</h4>
              <p>Test your knowledge on Acids & Bases with a practice quiz</p>
              <button className="recommendation-button">Start Quiz</button>
            </div>
            
            <div className="recommendation-card">
              <div className="recommendation-icon">🧩</div>
              <h4>Explore New Concept</h4>
              <p>Ready to learn about Thermodynamics? Start the new module</p>
              <button className="recommendation-button">Explore</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProgressTracker;
