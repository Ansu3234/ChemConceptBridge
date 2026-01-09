import React, { useState, useMemo } from 'react';
import './ModuleDashboard.css';

const RegisterModuleDashboard = ({ testResults }) => {
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const moduleData = {
    file: 'real-student-dashboard.spec.js',
    module: 'Student Dashboard & Registration',
    tests: [
      { name: 'should display student dashboard after login', status: 'passed', time: 4.2, browsers: ['chromium'] },
      { name: 'should display welcome message', status: 'passed', time: 3.1, browsers: ['chromium', 'firefox'] },
      { name: 'should display navigation menu', status: 'passed', time: 2.8, browsers: ['chromium'] },
      { name: 'should display progress section', status: 'passed', time: 3.5, browsers: ['chromium'] },
      { name: 'should display quiz section', status: 'failed', time: 30.2, browsers: ['chromium'], error: 'Quiz section not found' },
      { name: 'should display concept section', status: 'passed', time: 3.9, browsers: ['chromium'] },
      { name: 'should allow navigation to quiz', status: 'passed', time: 4.3, browsers: ['chromium'] },
      { name: 'should allow navigation to concepts', status: 'passed', time: 4.1, browsers: ['chromium'] },
      { name: 'should allow navigation to performance', status: 'failed', time: 28.5, browsers: ['firefox'], error: 'Performance link not visible' },
      { name: 'should display user menu/profile', status: 'passed', time: 3.6, browsers: ['chromium'] },
      { name: 'should have logout option in menu', status: 'passed', time: 4.2, browsers: ['chromium'] }
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
        <h1>📚 Student Dashboard & Registration Test Dashboard</h1>
        <p className="subtitle">Student interface and dashboard navigation tests</p>
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
        <p>Student Dashboard tests validate the main interface after authentication:</p>
        <ul>
          <li>✅ Dashboard rendering and welcome messages</li>
          <li>✅ Navigation menu and core sections</li>
          <li>✅ Progress tracking display</li>
          <li>✅ Quiz and concept module access</li>
          <li>✅ User profile and logout functionality</li>
        </ul>
      </div>
    </div>
  );
};

export default RegisterModuleDashboard;
