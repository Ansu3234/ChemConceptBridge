import React, { useState, useMemo } from 'react';
import './ModuleDashboard.css';

const QuizModuleDashboard = ({ testResults }) => {
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const moduleData = {
    file: 'real-quiz.spec.js',
    module: 'Quiz & Scoring Module',
    tests: [
      { name: 'should navigate to quiz page', status: 'passed', time: 4.3, browsers: ['chromium'] },
      { name: 'should display available quizzes', status: 'passed', time: 3.9, browsers: ['chromium', 'firefox'] },
      { name: 'should display quiz title and difficulty', status: 'passed', time: 3.1, browsers: ['chromium'] },
      { name: 'should click on quiz to start', status: 'passed', time: 5.2, browsers: ['chromium'] },
      { name: 'should start quiz and display first question', status: 'passed', time: 4.8, browsers: ['chromium'] },
      { name: 'should display quiz questions with options', status: 'passed', time: 4.5, browsers: ['chromium', 'webkit'] },
      { name: 'should answer quiz questions', status: 'passed', time: 3.7, browsers: ['chromium'] },
      { name: 'should navigate to next question', status: 'passed', time: 4.1, browsers: ['chromium'] },
      { name: 'should display quiz progress', status: 'passed', time: 3.6, browsers: ['chromium', 'firefox'] },
      { name: 'should submit quiz', status: 'passed', time: 5.9, browsers: ['chromium'] },
      { name: 'should display quiz results', status: 'failed', time: 30.5, browsers: ['Mobile Safari'], error: 'Results page timeout' },
      { name: 'should display score on results page', status: 'passed', time: 4.3, browsers: ['chromium'] },
      { name: 'should display feedback for answers', status: 'passed', time: 4.2, browsers: ['chromium'] },
      { name: 'should allow retaking quiz', status: 'passed', time: 4.6, browsers: ['chromium'] }
    ]
  };

  const stats = useMemo(() => {
    const tests = moduleData.tests;
    return {
      total: tests.length,
      passed: tests.filter(t => t.status === 'passed').length,
      failed: tests.filter(t => t.status === 'failed').length,
      skipped: tests.filter(t => t.status === 'skipped').length,
      flaky: tests.filter(t => t.status === 'flaky').length,
      passRate: ((tests.filter(t => t.status === 'passed').length / tests.length) * 100).toFixed(1),
      avgTime: (tests.reduce((sum, t) => sum + t.time, 0) / tests.length).toFixed(2)
    };
  }, []);

  const filteredTests = useMemo(() => {
    return moduleData.tests.filter(test => {
      const matchesStatus = filterStatus === 'all' || test.status === filterStatus;
      const matchesSearch = test.name.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesStatus && matchesSearch;
    });
  }, [filterStatus, searchQuery]);

  const getStatusColor = (status) => {
    const colors = {
      passed: '#10b981',
      failed: '#ef4444',
      skipped: '#6b7280',
      flaky: '#f59e0b'
    };
    return colors[status] || '#6b7280';
  };

  const getStatusBgColor = (status) => {
    const colors = {
      passed: '#dcfce7',
      failed: '#fee2e2',
      skipped: '#f3f4f6',
      flaky: '#fef3c7'
    };
    return colors[status] || '#f3f4f6';
  };

  return (
    <div className="module-dashboard">
      <div className="dashboard-header">
        <h1>📝 Quiz & Scoring Test Dashboard</h1>
        <p className="subtitle">Quiz execution and scoring system tests</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-label">Total Tests</div>
          <div className="stat-value">{stats.total}</div>
        </div>
        <div className="stat-card passed-bg">
          <div className="stat-label">Passed</div>
          <div className="stat-value">{stats.passed}</div>
        </div>
        <div className="stat-card failed-bg">
          <div className="stat-label">Failed</div>
          <div className="stat-value">{stats.failed}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Pass Rate</div>
          <div className="stat-value">{stats.passRate}%</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Avg Time</div>
          <div className="stat-value">{stats.avgTime}s</div>
        </div>
      </div>

      <div className="controls">
        <div className="search-box">
          <input
            type="text"
            placeholder="Search tests..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
        </div>
        <div className="filter-buttons">
          <button
            className={`filter-btn ${filterStatus === 'all' ? 'active' : ''}`}
            onClick={() => setFilterStatus('all')}
          >
            All ({stats.total})
          </button>
          <button
            className={`filter-btn ${filterStatus === 'passed' ? 'active' : ''}`}
            onClick={() => setFilterStatus('passed')}
            style={{ borderColor: getStatusColor('passed') }}
          >
            Passed ({stats.passed})
          </button>
          <button
            className={`filter-btn ${filterStatus === 'failed' ? 'active' : ''}`}
            onClick={() => setFilterStatus('failed')}
            style={{ borderColor: getStatusColor('failed') }}
          >
            Failed ({stats.failed})
          </button>
        </div>
      </div>

      <div className="tests-container">
        <div className="tests-list">
          {filteredTests.map((test, idx) => (
            <div key={idx} className="test-item">
              <div className="test-header">
                <div className="test-status-indicator" style={{ backgroundColor: getStatusColor(test.status) }}></div>
                <div className="test-info">
                  <h3 className="test-name">{test.name}</h3>
                  <div className="test-meta">
                    <span className="test-status" style={{ backgroundColor: getStatusBgColor(test.status), color: getStatusColor(test.status) }}>
                      {test.status.charAt(0).toUpperCase() + test.status.slice(1)}
                    </span>
                    <span className="test-time">⏱️ {test.time}s</span>
                  </div>
                </div>
              </div>
              <div className="test-browsers">
                {test.browsers.map((browser, i) => (
                  <span key={i} className="browser-tag">{browser}</span>
                ))}
              </div>
              {test.error && <div className="test-error">❌ {test.error}</div>}
            </div>
          ))}
        </div>
      </div>

      <div className="module-summary">
        <h3>📊 Summary</h3>
        <p>Quiz & Scoring module tests cover the complete assessment workflow:</p>
        <ul>
          <li>✅ Quiz discovery and navigation</li>
          <li>✅ Question presentation and difficulty levels</li>
          <li>✅ Answer submission and progress tracking</li>
          <li>✅ Score calculation and results display</li>
          <li>✅ Feedback and answer explanations</li>
          <li>✅ Quiz retake functionality</li>
        </ul>
      </div>
    </div>
  );
};

export default QuizModuleDashboard;
