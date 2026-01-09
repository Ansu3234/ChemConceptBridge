import React, { useState, useEffect } from 'react';
import TestResultsDashboard from '../components/TestResultsDashboard/TestResultsDashboard';
import './TestResultsPage.css';

const TestResultsPage = () => {
  const [testResults, setTestResults] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchTestResults();
  }, []);

  const fetchTestResults = async () => {
    try {
      setLoading(true);
      const response = await fetch('/test-results.json');
      if (response.ok) {
        const data = await response.json();
        setTestResults(data);
      } else {
        setTestResults(null);
      }
      setError(null);
    } catch (err) {
      console.log('Test results file not found, using default data');
      setError(null);
      setTestResults(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="test-results-page">
      {loading ? (
        <div className="loading">
          <div className="spinner"></div>
          <p>Loading test results...</p>
        </div>
      ) : error ? (
        <div className="error">
          <h2>Error Loading Results</h2>
          <p>{error}</p>
          <button onClick={fetchTestResults}>Retry</button>
        </div>
      ) : (
        <TestResultsDashboard testResults={testResults} />
      )}
    </div>
  );
};

export default TestResultsPage;
