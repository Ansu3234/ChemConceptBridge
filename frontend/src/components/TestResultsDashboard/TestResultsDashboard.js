import React, { useState, useMemo } from 'react';
import './TestResultsDashboard.css';

const TestResultsDashboard = ({ testResults }) => {
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedFile, setExpandedFile] = useState(null);

  const defaultTestResults = [
    {
      file: 'real-login.spec.js',
      tests: [
        { name: 'should load login page', status: 'passed', time: 2.5, browsers: ['chromium', 'firefox', 'webkit'] },
        { name: 'should login successfully with real credentials', status: 'passed', time: 5.2, browsers: ['chromium'] },
        { name: 'should check if token is stored after login', status: 'passed', time: 3.8, browsers: ['chromium', 'firefox'] },
        { name: 'should persist session after page reload', status: 'passed', time: 4.1, browsers: ['chromium'] },
        { name: 'should navigate to dashboard after login', status: 'passed', time: 4.5, browsers: ['chromium', 'firefox', 'webkit'] },
        { name: 'should display user information in dashboard', status: 'passed', time: 3.9, browsers: ['chromium'] }
      ]
    },
    {
      file: 'real-student-dashboard.spec.js',
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
    },
    {
      file: 'real-concepts.spec.js',
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
    },
    {
      file: 'real-quiz.spec.js',
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
    },
    {
      file: 'real-misconception-detector.spec.js',
      tests: [
        { name: 'should navigate to misconception detector', status: 'passed', time: 4.1, browsers: ['chromium'] },
        { name: 'should display misconception detector page', status: 'passed', time: 3.8, browsers: ['chromium', 'firefox'] },
        { name: 'should display input field for student answer', status: 'passed', time: 2.9, browsers: ['chromium'] },
        { name: 'should accept student answer input', status: 'passed', time: 3.3, browsers: ['chromium'] },
        { name: 'should display analyze/detect button', status: 'passed', time: 2.6, browsers: ['chromium'] },
        { name: 'should analyze student answer for misconceptions', status: 'passed', time: 8.5, browsers: ['chromium'] },
        { name: 'should display misconception results', status: 'passed', time: 7.2, browsers: ['chromium', 'webkit'] },
        { name: 'should display misconception label/type', status: 'passed', time: 6.8, browsers: ['chromium'] },
        { name: 'should display confidence score', status: 'passed', time: 6.5, browsers: ['chromium', 'firefox'] },
        { name: 'should display explanation for misconception', status: 'passed', time: 6.9, browsers: ['chromium'] },
        { name: 'should provide remediation suggestions', status: 'failed', time: 30.2, browsers: ['chromium'], error: 'Remediation suggestions not displayed' },
        { name: 'should handle correct answer without misconception', status: 'passed', time: 7.1, browsers: ['chromium'] },
        { name: 'should display loading indicator while analyzing', status: 'passed', time: 5.3, browsers: ['chromium'] }
      ]
    },
    {
      file: 'real-logout.spec.js',
      tests: [
        { name: 'should logout successfully', status: 'passed', time: 4.7, browsers: ['chromium'] },
        { name: 'should clear authentication token on logout', status: 'passed', time: 3.9, browsers: ['chromium', 'firefox'] },
        { name: 'should redirect to login after logout', status: 'passed', time: 4.2, browsers: ['chromium'] },
        { name: 'should prevent access to protected routes after logout', status: 'passed', time: 5.1, browsers: ['chromium'] },
        { name: 'should handle session timeout gracefully', status: 'passed', time: 4.3, browsers: ['chromium'] },
        { name: 'should maintain session with valid token', status: 'passed', time: 3.8, browsers: ['chromium'] },
        { name: 'should display user info before logout', status: 'passed', time: 3.5, browsers: ['chromium'] },
        { name: 'should have accessible logout button in menu', status: 'passed', time: 3.7, browsers: ['chromium'] },
        { name: 'should logout from different pages', status: 'passed', time: 4.9, browsers: ['chromium'] },
        { name: 'should clear all session storage on logout', status: 'passed', time: 4.1, browsers: ['chromium'] }
      ]
    }
  ];

  const data = testResults || defaultTestResults;

  const stats = useMemo(() => {
    let total = 0, passed = 0, failed = 0, skipped = 0, flaky = 0;
    let totalTime = 0;

    data.forEach(file => {
      file.tests.forEach(test => {
        total++;
        totalTime += test.time;
        if (test.status === 'passed') passed++;
        else if (test.status === 'failed') failed++;
        else if (test.status === 'skipped') skipped++;
        else if (test.status === 'flaky') flaky++;
      });
    });

    return { total, passed, failed, skipped, flaky, totalTime: totalTime.toFixed(1) };
  }, [data]);

  const filteredData = useMemo(() => {
    return data.map(file => ({
      ...file,
      tests: file.tests.filter(test => {
        const matchesStatus = filterStatus === 'all' || test.status === filterStatus;
        const matchesSearch = test.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            file.file.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesStatus && matchesSearch;
      })
    })).filter(file => file.tests.length > 0);
  }, [data, filterStatus, searchQuery]);

  const getBrowserColor = (browser) => {
    const colors = {
      chromium: '#3498db',
      firefox: '#e74c3c',
      webkit: '#9b59b6',
      'Mobile Chrome': '#f39c12',
      'Mobile Safari': '#e91e63'
    };
    return colors[browser] || '#95a5a6';
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'passed':
        return '✓';
      case 'failed':
        return '✕';
      case 'skipped':
        return '⊘';
      case 'flaky':
        return '⚠';
      default:
        return '?';
    }
  };

  return (
    <div className="test-results-dashboard">
      <div className="dashboard-header">
        <h1>Test Results Summary</h1>
        <div className="timestamp">
          {new Date().toLocaleDateString('en-US', { 
            month: '2-digit', 
            day: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
          })} Total time: {stats.totalTime}s
        </div>
      </div>

      <div className="stats-container">
        <div className={`stat-card stat-all`}>
          <div className="stat-number">{stats.total}</div>
          <div className="stat-label">All</div>
        </div>
        <div className={`stat-card stat-passed`}>
          <div className="stat-number">{stats.passed}</div>
          <div className="stat-label">Passed</div>
        </div>
        <div className={`stat-card stat-failed`}>
          <div className="stat-number">{stats.failed}</div>
          <div className="stat-label">Failed</div>
        </div>
        <div className={`stat-card stat-flaky`}>
          <div className="stat-number">{stats.flaky}</div>
          <div className="stat-label">Flaky</div>
        </div>
        <div className={`stat-card stat-skipped`}>
          <div className="stat-number">{stats.skipped}</div>
          <div className="stat-label">Skipped</div>
        </div>
      </div>

      <div className="filters-section">
        <div className="search-box">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            placeholder="Search tests..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="filter-buttons">
          {['all', 'passed', 'failed', 'flaky', 'skipped'].map(status => (
            <button
              key={status}
              className={`filter-btn ${filterStatus === status ? 'active' : ''}`}
              onClick={() => setFilterStatus(status)}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="tests-container">
        {filteredData.map(file => (
          <div key={file.file} className="test-file-section">
            <div
              className="file-header"
              onClick={() => setExpandedFile(expandedFile === file.file ? null : file.file)}
            >
              <span className="expand-icon">{expandedFile === file.file ? '▼' : '▶'}</span>
              <span className="file-name">{file.file}</span>
              <span className="test-count">({file.tests.length})</span>
            </div>

            {expandedFile === file.file && (
              <div className="tests-list">
                {file.tests.map((test, idx) => (
                  <div key={idx} className={`test-item status-${test.status}`}>
                    <div className="test-header">
                      <span className={`status-icon icon-${test.status}`}>
                        {getStatusIcon(test.status)}
                      </span>
                      <span className="test-name">{test.name}</span>
                    </div>
                    <div className="test-details">
                      <div className="browsers">
                        {test.browsers.map(browser => (
                          <span
                            key={browser}
                            className="browser-tag"
                            style={{ backgroundColor: getBrowserColor(browser) }}
                          >
                            {browser}
                          </span>
                        ))}
                      </div>
                      <div className="test-time">{test.time.toFixed(1)}s</div>
                    </div>
                    {test.error && (
                      <div className="test-error">{test.error}</div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}

        {filteredData.length === 0 && (
          <div className="no-results">
            No tests found matching your criteria
          </div>
        )}
      </div>
    </div>
  );
};

export default TestResultsDashboard;
