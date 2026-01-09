import React, { useEffect, useState } from 'react';
import api from '../apiClient';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, Filler } from 'chart.js';
import { Bar } from 'react-chartjs-2';
import './MLModelsPage.css';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

function MLModelsPage() {
  const [metrics, setMetrics] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [chartUrl, setChartUrl] = useState('');

  const fetchResults = async () => {
    try {
      setError('');
      const { data } = await api.get('/ml/results');
      setMetrics(Array.isArray(data) ? data : []);
      // Set chart URL with timestamp to force refresh
      if (data && data.length > 0) {
        setChartUrl(`${process.env.REACT_APP_API_BASE_URL || 'http://localhost:10000/api'}/ml/chart?t=${Date.now()}`);
      }
    } catch (e) {
      console.error('Failed to fetch results:', e);
      setMetrics([]);
    }
  };

  useEffect(() => {
    fetchResults();
    // Refresh results every 5 seconds if metrics are empty
    if (metrics.length === 0) {
      const interval = setInterval(fetchResults, 5000);
      return () => clearInterval(interval);
    }
  }, []);

  const runTraining = async () => {
    try {
      setLoading(true);
      setError('');
      setSuccess('');
      
      const response = await api.post('/ml/train');
      
      if (response.data.success) {
        setSuccess(`✅ Training completed! Models trained: ${response.data.models?.join(', ') || 'All'}`);
        await fetchResults();
      }
    } catch (e) {
      console.error('Training error:', e);
      setError(e.response?.data?.error || e.response?.data?.details || 'Training failed. Please check if Python is installed and dependencies are available.');
    } finally {
      setLoading(false);
    }
  };

  // Prepare chart data
  const chartData = metrics.length > 0 ? {
    labels: metrics.map(m => m.model),
    datasets: [
      {
        label: 'Accuracy (%)',
        data: metrics.map(m => m.accuracy),
        backgroundColor: 'rgba(25, 118, 210, 0.6)',
        borderColor: 'rgba(25, 118, 210, 1)',
        borderWidth: 1,
      },
      {
        label: 'Precision (%)',
        data: metrics.map(m => m.precision),
        backgroundColor: 'rgba(46, 125, 50, 0.6)',
        borderColor: 'rgba(46, 125, 50, 1)',
        borderWidth: 1,
      },
      {
        label: 'Recall (%)',
        data: metrics.map(m => m.recall),
        backgroundColor: 'rgba(237, 108, 2, 0.6)',
        borderColor: 'rgba(237, 108, 2, 1)',
        borderWidth: 1,
      },
      {
        label: 'F1-Score (%)',
        data: metrics.map(m => m.f1_score),
        backgroundColor: 'rgba(156, 39, 176, 0.6)',
        borderColor: 'rgba(156, 39, 176, 1)',
        borderWidth: 1,
      },
    ],
  } : null;

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'ML Models Performance Comparison',
        font: { size: 16 },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
        title: {
          display: true,
          text: 'Score (%)',
        },
      },
    },
  };

  // Find best model
  const bestModel = metrics.length > 0 ? metrics.reduce((best, current) => 
    (current.accuracy > best.accuracy) ? current : best
  , metrics[0]) : null;

  return (
    <div className="ml-models-page">
      <div className="ml-models-header">
        <h1>Machine Learning Models Comparison</h1>
        <p className="ml-models-subtitle">
          Train and compare 5 ML models: <strong>K-Nearest Neighbors (KNN)</strong>, <strong>Naive Bayes</strong>, 
          <strong> Decision Tree</strong>, <strong>Support Vector Machine (SVM)</strong>, and <strong>Backpropagation Neural Network</strong>
        </p>
      </div>

      <div className="ml-models-actions">
        <button 
          onClick={runTraining} 
          disabled={loading}
          className={`train-btn ${loading ? 'loading' : ''}`}
        >
          {loading ? '🔄 Training Models...' : '🚀 Train All Models'}
        </button>
        <button 
          onClick={fetchResults}
          className="refresh-btn"
          disabled={loading}
        >
          🔄 Refresh Results
        </button>
      </div>

      {error && (
        <div className="alert alert-error">
          <strong>Error:</strong> {error}
        </div>
      )}

      {success && (
        <div className="alert alert-success">
          {success}
        </div>
      )}

      {bestModel && (
        <div className="best-model-banner">
          <h3>🏆 Best Performing Model</h3>
          <p>
            <strong>{bestModel.model}</strong> with <strong>{bestModel.accuracy}%</strong> accuracy
            and <strong>{bestModel.f1_score}%</strong> F1-Score
          </p>
        </div>
      )}

      {metrics.length > 0 ? (
        <>
          <div className="metrics-table-container">
            <h2>Model Performance Metrics</h2>
            <table className="metrics-table">
              <thead>
                <tr>
                  <th>Model</th>
                  <th>Accuracy (%)</th>
                  <th>Precision (%)</th>
                  <th>Recall (%)</th>
                  <th>F1-Score (%)</th>
                </tr>
              </thead>
              <tbody>
                {metrics.map((m, idx) => (
                  <tr key={idx} className={bestModel && m.model === bestModel.model ? 'best-row' : ''}>
                    <td><strong>{m.model}</strong></td>
                    <td className="metric-value">{m.accuracy.toFixed(2)}</td>
                    <td className="metric-value">{m.precision.toFixed(2)}</td>
                    <td className="metric-value">{m.recall.toFixed(2)}</td>
                    <td className="metric-value">{m.f1_score.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="charts-container">
            <div className="chart-wrapper">
              <h2>Performance Comparison Chart</h2>
              {chartData && (
                <div className="chart-box">
                  <Bar data={chartData} options={chartOptions} />
                </div>
              )}
            </div>

            {chartUrl && (
              <div className="chart-wrapper">
                <h2>Detailed Comparison Visualization</h2>
                <div className="chart-image-container">
                  <img 
                    alt="ML Models Comparison Chart" 
                    src={chartUrl}
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'block';
                    }}
                  />
                  <p style={{ display: 'none', color: '#666' }}>
                    Chart image not available. Please train models first.
                  </p>
                </div>
              </div>
            )}
          </div>

          <div className="model-descriptions">
            <h2>Model Descriptions</h2>
            <div className="model-cards">
              <div className="model-card">
                <h3>K-Nearest Neighbors (KNN)</h3>
                <p>Instance-based learning algorithm that classifies based on the majority vote of k nearest neighbors.</p>
              </div>
              <div className="model-card">
                <h3>Naive Bayes</h3>
                <p>Probabilistic classifier based on Bayes' theorem with strong independence assumptions between features.</p>
              </div>
              <div className="model-card">
                <h3>Decision Tree</h3>
                <p>Tree-based model that splits data based on feature values to make decisions.</p>
              </div>
              <div className="model-card">
                <h3>Support Vector Machine (SVM)</h3>
                <p>Finds optimal hyperplane to separate classes using support vectors.</p>
              </div>
              <div className="model-card">
                <h3>Backpropagation Neural Network</h3>
                <p>Multi-layer perceptron trained with backpropagation algorithm for complex pattern recognition.</p>
              </div>
            </div>
          </div>
        </>
      ) : (
        <div className="empty-state">
          <p>📊 No model results available. Click "Train All Models" to start training.</p>
          <p className="info-text">
            Training will: (1) Generate synthetic student performance data, 
            (2) Train all 5 ML models, and (3) Generate comparison visualizations.
          </p>
        </div>
      )}
    </div>
  );
}

export default MLModelsPage;

