import React, { useEffect, useMemo, useState } from 'react';
import api from '../../apiClient';
import './TeacherConceptLibrary.css';

const DIFFICULTY_OPTIONS = ['Beginner', 'Intermediate', 'Advanced'];
const BOARD_OPTIONS = ['NCERT', 'NEET', 'Other'];

// Small pill for status
const StatusBadge = ({ status }) => {
  const color = {
    approved: '#16a34a',
    pending: '#d97706',
    draft: '#64748b',
    rejected: '#dc2626',
  }[status] || '#6b7280';
  return (
    <span className="status-badge" style={{ borderColor: color, color }}>{status}</span>
  );
};

const TeacherConceptLibrary = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Filters
  const [topic, setTopic] = useState('');
  const [difficulty, setDifficulty] = useState('');
  const [board, setBoard] = useState('');
  const [showMine, setShowMine] = useState(false); // authoring view

  const queryParams = useMemo(() => {
    const p = new URLSearchParams();
    if (topic) p.set('topic', topic);
    if (difficulty) p.set('difficulty', difficulty);
    if (board) p.set('board', board);
    if (showMine) p.set('mine', 'true');
    return p.toString();
  }, [topic, difficulty, board, showMine]);

  const fetchItems = async () => {
    try {
      setLoading(true);
      setError('');
      const url = `/concept${queryParams ? `?${queryParams}` : ''}`;
      const res = await api.get(url);
      setItems(res.data || []);
    } catch (e) {
      setError('Failed to load concepts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [queryParams]);

  return (
    <div className="teacher-lib">
      <div className="lib-header">
        <h3>Concept Library</h3>
        <div className="filters">
          <input
            type="text"
            placeholder="Topic (e.g., Organic Chemistry)"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
          />
          <select value={difficulty} onChange={(e) => setDifficulty(e.target.value)}>
            <option value="">All Difficulty</option>
            {DIFFICULTY_OPTIONS.map((d) => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
          <select value={board} onChange={(e) => setBoard(e.target.value)}>
            <option value="">All Boards</option>
            {BOARD_OPTIONS.map((b) => (
              <option key={b} value={b}>{b}</option>
            ))}
          </select>
          <label className="mine-toggle">
            <input type="checkbox" checked={showMine} onChange={(e) => setShowMine(e.target.checked)} />
            Show my items (any status)
          </label>
          <button onClick={fetchItems}>Refresh</button>
        </div>
      </div>

      {loading && <div className="info">Loading…</div>}
      {error && <div className="error">{error}</div>}

      <div className="grid">
        {items.map((c) => (
          <div key={c._id} className="card">
            <div className="card-header">
              <div className="title">{c.title}</div>
              <StatusBadge status={c.status} />
            </div>
            <div className="meta">
              <span className="topic">{c.topic}</span>
              <span className={`difficulty ${c.difficulty?.toLowerCase()}`}>{c.difficulty}</span>
              {c.syllabus?.board && <span className="board">{c.syllabus.board}</span>}
            </div>
            <div className="desc">{c.description}</div>
            <div className="footer">
              <span>Time: {c.estimatedTime} min</span>
              <span>Views: {c.views}</span>
            </div>
          </div>
        ))}
        {!loading && items.length === 0 && (
          <div className="empty">No concepts match the current filters.</div>
        )}
      </div>
    </div>
  );
};

export default TeacherConceptLibrary;