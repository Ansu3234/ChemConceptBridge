import React, { useState, useEffect } from 'react';
import './ChemicalEquations.css';
import api from '../../apiClient';

const ChemicalEquations = () => {
  const [equations, setEquations] = useState([]);
  const [selectedEquation, setSelectedEquation] = useState(null);
  const [userAnswer, setUserAnswer] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showHints, setShowHints] = useState(false);

  useEffect(() => {
    fetchEquations();
  }, []);

  // Fallback sample equations when backend has no data
  const getMockEquations = () => ([
    {
      equationString: 'H2 + O2 -> H2O',
      balancedEquationString: '2H2 + O2 -> 2H2O',
      topic: 'Combustion',
      difficulty: 'Beginner',
      explanation: 'Hydrogen combusts with oxygen to form water. Balance atoms on both sides.',
      hints: ['Count atoms', 'Balance H2O first', 'Adjust coefficients only']
    },
    {
      equationString: 'Na + Cl2 -> NaCl',
      balancedEquationString: '2Na + Cl2 -> 2NaCl',
      topic: 'Synthesis',
      difficulty: 'Beginner',
      explanation: 'Sodium reacts with chlorine to form sodium chloride.',
      hints: ['Na is +1', 'Cl is -1', 'Match ionic charges']
    },
    {
      equationString: 'CaCO3 + HCl -> CaCl2 + H2O + CO2',
      balancedEquationString: 'CaCO3 + 2HCl -> CaCl2 + H2O + CO2',
      topic: 'Acid-Base Reactions',
      difficulty: 'Intermediate',
      explanation: 'Neutralization and gas evolution reaction.',
      hints: ['Double displacement', 'Balance H and O last']
    }
  ]);

  const fetchEquations = async () => {
    try {
      setLoading(true);
      setError('');
      const { data } = await api.get('/chemical-equations');
      const list = Array.isArray(data) && data.length > 0 ? data : getMockEquations();
      if (!Array.isArray(data) || data.length === 0) {
        setError('Showing sample equations (no server data found)');
      }
      setEquations(list);
    } catch (e) {
      setEquations(getMockEquations());
      setError('Failed to load equations. Showing sample data instead.');
    } finally {
      setLoading(false);
    }
  };

  const selectEquation = (equation) => {
    setSelectedEquation(equation);
    setUserAnswer('');
    setResult(null);
    setShowHints(false);
  };

  const checkAnswer = async () => {
    if (!selectedEquation || !userAnswer.trim()) return;
    try {
      setLoading(true);
      if (selectedEquation._id) {
        const { data } = await api.post(`/chemical-equations/${selectedEquation._id}/check-balance`, {
          userEquation: userAnswer
        });
        setResult(data);
      } else {
        const isCorrect = userAnswer.trim().toLowerCase() === selectedEquation.balancedEquationString.trim().toLowerCase();
        setResult({
          isCorrect,
          correctAnswer: selectedEquation.balancedEquationString,
          explanation: selectedEquation.explanation,
          hints: selectedEquation.hints || []
        });
      }
    } catch (e) {
      setError('Failed to check answer');
    } finally {
      setLoading(false);
    }
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'Beginner': return '#10b981';
      case 'Intermediate': return '#f59e0b';
      case 'Advanced': return '#ef4444';
      default: return '#6b7280';
    }
  };

  if (loading && equations.length === 0) {
    return <div className="loading">Loading chemical equations...</div>;
  }

  return (
    <div className="chemical-equations">
      <div className="ce-header">
        <h2>Chemical Equations</h2>
        <p>Practice balancing chemical equations and master stoichiometry</p>
      </div>

      {error && <div className="error">{error}</div>}

      <div className="ce-content">
        <div className="equations-list">
          <h3>Available Equations</h3>
          <div className="equations-grid">
            {equations.map(equation => (
              <div 
                key={equation._id} 
                className={`equation-card ${selectedEquation?._id === equation._id ? 'selected' : ''}`}
                onClick={() => selectEquation(equation)}
              >
                <div className="equation-header">
                  <span 
                    className="difficulty-badge"
                    style={{ backgroundColor: getDifficultyColor(equation.difficulty) }}
                  >
                    {equation.difficulty}
                  </span>
                  <span className="topic">{equation.topic}</span>
                </div>
                <div className="equation-text">{equation.equationString}</div>
                <div className="equation-stats">
                  <span>Attempts: {equation.attempts || 0}</span>
                  <span>Success: {Math.round(equation.successRate || 0)}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="practice-area">
          {selectedEquation ? (
            <div className="practice-card">
              <h3>Balance This Equation</h3>
              <div className="equation-to-balance">
                <div className="original-equation">
                  <strong>Original:</strong> {selectedEquation.equationString}
                </div>
                <div className="balanced-equation">
                  <strong>Balanced:</strong> {selectedEquation.balancedEquationString}
                </div>
              </div>

              <div className="input-section">
                <label htmlFor="user-answer">Your Answer:</label>
                <input
                  id="user-answer"
                  type="text"
                  value={userAnswer}
                  onChange={(e) => setUserAnswer(e.target.value)}
                  placeholder="Enter balanced equation (e.g., 2H2 + O2 → 2H2O)"
                  className="answer-input"
                />
                <div className="button-group">
                  <button 
                    onClick={checkAnswer} 
                    disabled={!userAnswer.trim() || loading}
                    className="check-btn"
                  >
                    {loading ? 'Checking...' : 'Check Answer'}
                  </button>
                  <button 
                    onClick={() => setShowHints(!showHints)}
                    className="hints-btn"
                  >
                    {showHints ? 'Hide Hints' : 'Show Hints'}
                  </button>
                </div>
              </div>

              {showHints && selectedEquation.hints && selectedEquation.hints.length > 0 && (
                <div className="hints-section">
                  <h4>Hints:</h4>
                  <ul>
                    {selectedEquation.hints.map((hint, index) => (
                      <li key={index}>{hint}</li>
                    ))}
                  </ul>
                </div>
              )}

              {result && (
                <div className={`result-section ${result.isCorrect ? 'correct' : 'incorrect'}`}>
                  <div className="result-header">
                    {result.isCorrect ? '✅ Correct!' : '❌ Incorrect'}
                  </div>
                  {!result.isCorrect && (
                    <div className="correct-answer">
                      <strong>Correct Answer:</strong> {result.correctAnswer}
                    </div>
                  )}
                  {result.explanation && (
                    <div className="explanation">
                      <strong>Explanation:</strong> {result.explanation}
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="no-selection">
              <h3>Select an Equation</h3>
              <p>Choose an equation from the list to start practicing</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChemicalEquations;
