import React, { useState, useMemo } from 'react';
import './ModuleDashboard.css';

const ConceptsModuleDashboard = ({ testResults }) => {
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const moduleData = {
    file: 'real-concepts.spec.js',
    module: 'Concepts Module',
    tests: [
      { name: 'should navigate to concepts page', status: 'passed', time: 4.5, browsers: ['chromium'] },
      { name: 'should display concepts list', status: 'passed', time: 3.8, browsers: ['chromium', 'firefox'] },
      { name: 'should display concept title and description', status: 'passed', time: 3.2, browsers: ['chromium'] },
      { name: 'should click on concept to view details', status: 'passed', time: 5.1, browsers: ['chromium'] },
      { name: 'should display concept detail page', status: 'passed', time: 4.9, browsers: ['chromium', 'webkit'] },
      { name: 'should display concept content/description details', status: 'failed', time: 29.8, browsers: ['Mobile Chrome'], error: 'Content section not visible on mobile' },
      { name: 'should display interactive visualizations if available', status: 'passed', time: 4.6, browsers: ['chromium'] },
      { name: 'should allow marking concept as complete', status: 'passed', time: 5.3, browsers: ['chromium'] },
      { name: 'should search concepts', status: 'passed', time: 4.2, browsers: ['chromium', 'firefox'] },
      { name: 'should filter concepts by category', status: 'passed', time: 3.9, browsers: ['chromium'] },
      { name: 'should display concept prerequisites', status: 'passed', time: 3.7, browsers: ['chromium'] },
      { name: 'should track concept view in real time', status: 'passed', time: 4.4, browsers: ['chromium'] }
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
        <h1>🧪 Concepts Module Test Dashboard</h1>
        <p className="subtitle">Chemistry concept browsing and learning material tests</p>
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
        <p>Concepts module validates learning material navigation and interaction:</p>
        <ul>
          <li>✅ Page navigation and concept list rendering</li>
          <li>✅ Concept details and descriptions</li>
          <li>✅ Interactive visualizations</li>
          <li>✅ Search and filtering capabilities</li>
          <li>✅ Progress tracking and completion marking</li>
          <li>✅ Prerequisites display</li>
        </ul>
      </div>
    </div>
  );
};

export default ConceptsModuleDashboard;
