import React, { useState } from 'react';
import './Header.css';
import api from '../../apiClient';

const Header = ({ user }) => {
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  const getRoleBasedMessage = () => {
    switch (user.role) {
      case 'student':
        return 'Ready to explore chemistry concepts?';
      case 'teacher':
        return 'Manage your students and content';
      case 'admin':
        return 'Monitor system performance';
      default:
        return 'Welcome to ChemConcept Bridge';
    }
  };

  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [results, setResults] = useState({ concepts: [], quizzes: [] });

  const startVoice = async () => {
    try {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (!SpeechRecognition) return;
      const rec = new SpeechRecognition();
      rec.lang = 'en-US';
      rec.interimResults = false;
      rec.maxAlternatives = 1;
      setListening(true);
      rec.onresult = async (e) => {
        const text = e.results[0][0].transcript;
        setTranscript(text);
        try {
          const { data } = await api.get(`/search?q=${encodeURIComponent(text)}`);
          setResults({ concepts: data.concepts || [], quizzes: data.quizzes || [] });
        } catch {
          setResults({ concepts: [], quizzes: [] });
        } finally {
          setListening(false);
        }
      };
      rec.onerror = () => setListening(false);
      rec.onend = () => setListening(false);
      rec.start();
    } catch {
      setListening(false);
    }
  };

  return (
    <header className="dashboard-header">
      <div className="header-content">
        <div className="header-left">
          <h1 className="header-title">
            {getGreeting()}, {user.name}!
          </h1>
          <p className="header-subtitle">
            {getRoleBasedMessage()}
          </p>
        </div>
        
        <div className="header-right">
          <div className="header-actions">
            <div className="search-container">
              <input 
                type="text" 
                placeholder="Search concepts, quizzes..." 
                className="search-input"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    const query = e.target.value.trim();
                    if (query) {
                      setTranscript(query);
                      api.get(`/search?q=${encodeURIComponent(query)}`)
                        .then(({ data }) => setResults({ concepts: data.concepts || [], quizzes: data.quizzes || [] }))
                        .catch(() => setResults({ concepts: [], quizzes: [] }));
                    }
                  }
                }}
              />
            </div>
            <button className={`action-btn voice-btn ${listening ? 'listening' : ''}`} onClick={startVoice} title="Voice search">
              <span className="btn-icon">{listening ? '🎙️' : '🎤'}</span>
            </button>
            <button className="action-btn notification-btn">
              <span className="btn-icon">🔔</span>
              <span className="notification-badge">3</span>
            </button>
            
            <button className="action-btn settings-btn">
              <span className="btn-icon">⚙️</span>
            </button>
            
            <div className="user-menu">
              <div className="user-avatar">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div className="user-info">
                <div className="user-name">{user.name}</div>
                <div className="user-role">{user.role.charAt(0).toUpperCase() + user.role.slice(1)}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {transcript && (
        <div className="voice-results">
          <div className="vr-query">You said: <strong>{transcript}</strong></div>
          <div className="vr-section">
            <h4>Concepts</h4>
            <ul>
              {(results.concepts || []).map((c, i) => (
                <li key={i}>{c.title} — {c.topic} ({c.difficulty})</li>
              ))}
            </ul>
          </div>
          <div className="vr-section">
            <h4>Quizzes</h4>
            <ul>
              {(results.quizzes || []).map((q, i) => (
                <li key={i}>{q.title} — {q.topic} ({q.difficulty})</li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
