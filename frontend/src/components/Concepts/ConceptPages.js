import React, { useEffect, useMemo, useState } from 'react';
import './ConceptPages.css';
import api from '../../apiClient';
import AcidBaseConcept from './AcidBaseConcept';
import PeriodicTableConcept from './PeriodicTableConcept';
import BondingConcept from './BondingConcept';
import ThermodynamicsConcept from './ThermodynamicsConcept';

// Map concept topic names to rich content components
const topicToComponent = (topic = '') => {
  switch (topic.toLowerCase()) {
    case 'acids & bases':
      return AcidBaseConcept;
    case 'periodic table':
      return PeriodicTableConcept;
    case 'chemical bonding':
      return BondingConcept;
    case 'thermodynamics':
      return ThermodynamicsConcept;
    default:
      return null;
  }
};

const getDifficultyColor = (difficulty) => {
  switch (difficulty) {
    case 'Beginner': return '#16a34a';
    case 'Intermediate': return '#d97706';
    case 'Advanced': return '#dc2626';
    default: return '#64748b';
  }
};

const ConceptPages = () => {
  const [concepts, setConcepts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeId, setActiveId] = useState(null);

  // Fetch approved + active concepts for public view
  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        setError('');
        const { data } = await api.get('/concept');
        const visible = (data || []).filter(c => c.status === 'approved' && c.isActive !== false);
        setConcepts(visible);
        if (visible.length) setActiveId(visible[0]._id);
      } catch (e) {
        setError(e?.response?.data?.message || 'Failed to load concepts');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const activeConcept = useMemo(() => concepts.find(c => c._id === activeId) || null, [concepts, activeId]);

  const handleMarkCompleted = async (topic) => {
    try {
      if (!topic) return;
      await api.post('/user/complete-concept', { topic });
      window.dispatchEvent(new Event('concept-completed'));
      alert(`Marked as completed: ${topic}`);
    } catch (err) {
      alert('Failed to mark concept as completed');
    }
  };

  const renderContent = () => {
    if (!activeConcept) return null;

    const Rich = topicToComponent(activeConcept.topic);
    if (Rich) {
      return (
        <>
          <Rich />
          <div style={{ marginTop: 16 }}>
            <button className="complete-btn" onClick={() => handleMarkCompleted(activeConcept.topic)}>Mark as Completed</button>
          </div>
        </>
      );
    }

    // Fallback to model content/description for topics without a custom page
    return (
      <div style={{ padding: 12 }}>
        <h3>{activeConcept.title}</h3>
        <p style={{ whiteSpace: 'pre-wrap' }}>{activeConcept.description}</p>
        {activeConcept?.content?.overview && (
          <>
            <h4>Overview</h4>
            <p style={{ whiteSpace: 'pre-wrap' }}>{activeConcept.content.overview}</p>
          </>
        )}
        {Array.isArray(activeConcept?.content?.examples) && activeConcept.content.examples.length > 0 && (
          <>
            <h4>Examples</h4>
            <ul>
              {activeConcept.content.examples.map((ex, idx) => <li key={idx}>{ex}</li>)}
            </ul>
          </>
        )}
        <div style={{ marginTop: 16 }}>
          <button className="complete-btn" onClick={() => handleMarkCompleted(activeConcept.topic)}>Mark as Completed</button>
        </div>
      </div>
    );
  };

  return (
    <div className="concept-pages">
      <div className="concept-sidebar">
        <h3>Chemistry Concepts</h3>
        {loading && <div style={{ padding: 8 }}>Loading…</div>}
        {error && <div style={{ padding: 8, color: 'red' }}>{error}</div>}
        <div className="concept-list">
          {concepts.map(concept => (
            <div
              key={concept._id}
              className={`concept-item ${activeId === concept._id ? 'active' : ''}`}
              onClick={() => setActiveId(concept._id)}
            >
              <div className="concept-icon">📘</div>
              <div className="concept-info">
                <div className="concept-title">{concept.title}</div>
                <div className="concept-description">{concept.description}</div>
                <div className="concept-meta">
                  <span
                    className="difficulty-badge"
                    style={{ color: getDifficultyColor(concept.difficulty) }}
                  >
                    {concept.difficulty}
                  </span>
                  <span className="time-estimate">{concept.estimatedTime} min</span>
                </div>
              </div>
            </div>
          ))}
          {!loading && concepts.length === 0 && (
            <div style={{ padding: 8, color: '#64748b' }}>No approved concepts yet.</div>
          )}
        </div>
      </div>

      <div className="concept-content">
        {renderContent()}
      </div>
    </div>
  );
};

export default ConceptPages;