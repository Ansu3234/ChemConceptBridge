import React, { useState, useEffect } from 'react';
import './QuizEngine.css';

const QuizEngine = () => {
  const [quizzes, setQuizzes] = useState([]);
  const [selectedQuiz, setSelectedQuiz] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [quizStarted, setQuizStarted] = useState(false);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [showResults, setShowResults] = useState(false);

  useEffect(() => {
    // Load available quizzes
    const mockQuizzes = [
      {
        id: 1,
        title: 'Acids and Bases Fundamentals',
        description: 'Test your understanding of acid-base concepts',
        difficulty: 'Intermediate',
        duration: 15,
        questions: 10,
        topic: 'acids-bases',
        questions: [
          {
            id: 1,
            question: 'What is the pH of a solution with [H⁺] = 1 × 10⁻³ M?',
            options: ['3', '7', '11', '14'],
            correct: 0,
            explanation: 'pH = -log[H⁺] = -log(1 × 10⁻³) = 3',
            misconceptions: {
              1: 'A pH of 7 is neutral, but this solution is acidic due to higher [H⁺].',
              2: 'A pH of 11 is basic, not acidic. Check your calculation.',
              3: 'A pH of 14 is highly basic, not acidic.'
            }
          },
          {
            id: 2,
            question: 'Which of the following is a strong acid?',
            options: ['CH₃COOH', 'HCl', 'H₂CO₃', 'HF'],
            correct: 1,
            explanation: 'HCl is a strong acid that completely dissociates in water',
            misconceptions: {
              0: 'CH₃COOH is a weak acid; it does not fully dissociate.',
              2: 'H₂CO₃ is a weak acid; it partially dissociates.',
              3: 'HF is a weak acid despite being a halide.'
            }
          },
          {
            id: 3,
            question: 'What happens when an acid and base react?',
            options: ['Formation of salt and water', 'Formation of gas', 'No reaction', 'Formation of precipitate'],
            correct: 0,
            explanation: 'Acid + Base → Salt + Water (neutralization reaction)',
            misconceptions: {
              1: 'Gas formation is not typical for acid-base neutralization.',
              2: 'Acids and bases do react; neutralization occurs.',
              3: 'Precipitate formation is not the main reaction here.'
            }
          }
        ]
      },
      {
        id: 2,
        title: 'Periodic Table Basics',
        description: 'Test your knowledge of elements and periodic trends',
        difficulty: 'Beginner',
        duration: 10,
        questions: 8,
        topic: 'periodic-table',
        questions: [
          {
            id: 1,
            question: 'How many elements are in the first period of the periodic table?',
            options: ['2', '8', '18', '32'],
            correct: 0,
            explanation: 'The first period contains only 2 elements: hydrogen and helium'
          },
          {
            id: 2,
            question: 'Which group contains the noble gases?',
            options: ['Group 1', 'Group 7', 'Group 8', 'Group 18'],
            correct: 3,
            explanation: 'Group 18 contains the noble gases (He, Ne, Ar, Kr, Xe, Rn)'
          }
        ]
      }
    ];
    setQuizzes(mockQuizzes);
  }, []);

  const startQuiz = (quiz) => {
    setSelectedQuiz(quiz);
    setQuizStarted(true);
    setCurrentQuestion(0);
    setAnswers({});
    setTimeLeft(quiz.duration * 60); // Convert minutes to seconds
    setQuizCompleted(false);
    setShowResults(false);
  };

  const handleAnswerSelect = (questionId, answerIndex) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answerIndex
    }));
  };

  const nextQuestion = () => {
    if (currentQuestion < selectedQuiz.questions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
    } else {
      finishQuiz();
    }
  };

  const previousQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(prev => prev - 1);
    }
  };

  const finishQuiz = () => {
    setQuizCompleted(true);
    calculateScore();
    setShowResults(true);
  };

  const calculateScore = () => {
    let correct = 0;
    selectedQuiz.questions.forEach(question => {
      if (answers[question.id] === question.correct) {
        correct++;
      }
    });
    setScore(Math.round((correct / selectedQuiz.questions.length) * 100));
  };

  const resetQuiz = () => {
    setSelectedQuiz(null);
    setQuizStarted(false);
    setQuizCompleted(false);
    setCurrentQuestion(0);
    setAnswers({});
    setScore(0);
    setShowResults(false);
  };

  // Timer effect
  useEffect(() => {
    if (quizStarted && !quizCompleted && timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && quizStarted) {
      finishQuiz();
    }
  }, [timeLeft, quizStarted, quizCompleted]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'Beginner': return '#16a34a';
      case 'Intermediate': return '#d97706';
      case 'Advanced': return '#dc2626';
      default: return '#64748b';
    }
  };

  if (showResults) {
    return (
      <div className="quiz-results">
        <div className="results-card">
          <h2>Quiz Results</h2>
          <div className="score-display">
            <div className="score-circle">
              <span className="score-value">{score}%</span>
            </div>
            <h3>Great job!</h3>
            <p>You answered {Object.keys(answers).length} out of {selectedQuiz.questions.length} questions</p>
          </div>
          
          <div className="results-breakdown">
            <h4>Question Review</h4>
            {selectedQuiz.questions.map((question, index) => {
              const userAnswer = answers[question.id];
              const isCorrect = userAnswer === question.correct;
              let misconceptionMsg = null;
              if (!isCorrect && userAnswer !== undefined && question.misconceptions && question.misconceptions[userAnswer] ) {
                misconceptionMsg = question.misconceptions[userAnswer];
              }
              return (
                <div key={question.id} className={`question-review ${isCorrect ? 'correct' : 'incorrect'}`}>
                  <div className="question-number">Q{index + 1}</div>
                  <div className="question-content">
                    <div className="question-text">{question.question}</div>
                    <div className="answer-feedback">
                      <strong>Your answer:</strong> {question.options[userAnswer] || 'Not answered'}
                      {!isCorrect && (
                        <>
                          <div><strong>Correct answer:</strong> {question.options[question.correct]}</div>
                          {misconceptionMsg && (
                            <div className="misconception-feedback"><strong>Misconception:</strong> {misconceptionMsg}</div>
                          )}
                        </>
                      )}
                      <div className="explanation">{question.explanation}</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          
          <div className="results-actions">
            <button className="btn btn-primary" onClick={resetQuiz}>
              Take Another Quiz
            </button>
            <button className="btn btn-secondary" onClick={() => setShowResults(false)}>
              Review Answers
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (quizStarted && selectedQuiz) {
    const question = selectedQuiz.questions[currentQuestion];
    const progress = ((currentQuestion + 1) / selectedQuiz.questions.length) * 100;

    return (
      <div className="quiz-container">
        <div className="quiz-header">
          <div className="quiz-info">
            <h2>{selectedQuiz.title}</h2>
            <div className="quiz-meta">
              <span className="question-counter">
                Question {currentQuestion + 1} of {selectedQuiz.questions.length}
              </span>
              <span className="timer">{formatTime(timeLeft)}</span>
            </div>
          </div>
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${progress}%` }}></div>
          </div>
        </div>

        <div className="quiz-content">
          <div className="question-card">
            <h3 className="question-text">{question.question}</h3>
            <div className="options">
              {question.options.map((option, index) => (
                <button
                  key={index}
                  className={`option ${answers[question.id] === index ? 'selected' : ''}`}
                  onClick={() => handleAnswerSelect(question.id, index)}
                >
                  <span className="option-letter">{String.fromCharCode(65 + index)}</span>
                  <span className="option-text">{option}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="quiz-navigation">
            <button 
              className="btn btn-secondary" 
              onClick={previousQuestion}
              disabled={currentQuestion === 0}
            >
              Previous
            </button>
            <button 
              className="btn btn-primary" 
              onClick={nextQuestion}
            >
              {currentQuestion === selectedQuiz.questions.length - 1 ? 'Finish Quiz' : 'Next'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="quiz-engine">
      <div className="quiz-header">
        <h2>Available Quizzes</h2>
        <p>Test your chemistry knowledge with our adaptive quiz system</p>
      </div>

      <div className="quiz-grid">
        {quizzes.map(quiz => (
          <div key={quiz.id} className="quiz-card">
            <div className="quiz-card-header">
              <h3>{quiz.title}</h3>
              <span 
                className="difficulty-badge"
                style={{ color: getDifficultyColor(quiz.difficulty) }}
              >
                {quiz.difficulty}
              </span>
            </div>
            
            <p className="quiz-description">{quiz.description}</p>
            
            <div className="quiz-meta">
              <div className="meta-item">
                <span className="meta-icon">⏱️</span>
                <span>{quiz.duration} min</span>
              </div>
              <div className="meta-item">
                <span className="meta-icon">📝</span>
                <span>{quiz.questions} questions</span>
              </div>
              <div className="meta-item">
                <span className="meta-icon">🧪</span>
                <span>{quiz.topic}</span>
              </div>
            </div>
            
            <button 
              className="btn btn-primary quiz-start-btn"
              onClick={() => startQuiz(quiz)}
            >
              Start Quiz
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default QuizEngine;
