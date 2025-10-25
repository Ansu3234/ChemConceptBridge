import React, { useEffect, useMemo, useState } from 'react';
import api from '../../apiClient';
import '../ConceptMap/ConceptMap.css';
import ConceptMap from '../ConceptMap/ConceptMap';

const DIFFICULTY_OPTIONS = ['Beginner', 'Intermediate', 'Advanced'];
const BOARD_OPTIONS = ['NCERT', 'NEET', 'Other'];

// Simple pill for status
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

const TeacherConceptMapManager = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Filters
  const [topic, setTopic] = useState('');
  const [difficulty, setDifficulty] = useState('');
  const [board, setBoard] = useState('');
  const [showMine, setShowMine] = useState(true); // default to own maps
  const [status, setStatus] = useState(''); // show all/any by default when mine=true

  // Create/edit form state
  const emptyForm = {
    title: '', description: '', topic: '', difficulty: 'Beginner',
    nodes: [], links: [], status: 'draft', syllabus: { board: '' }
  };
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);

  const queryParams = useMemo(() => {
    const p = new URLSearchParams();
    if (topic) p.set('topic', topic);
    if (difficulty) p.set('difficulty', difficulty);
    if (board) p.set('board', board);
    if (showMine) p.set('mine', 'true');
    if (status) p.set('status', status);
    return p.toString();
  }, [topic, difficulty, board, showMine, status]);

  const fetchItems = async () => {
    try {
      setLoading(true);
      setError('');
      const url = `/concept-map${queryParams ? `?${queryParams}` : ''}`;
      const res = await api.get(url);
      setItems(res.data || []);
    } catch (e) {
      setError(e?.response?.data?.message || 'Failed to load concept maps');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [queryParams]);

  const startCreate = () => {
    setEditingId(null);
    setForm(emptyForm);
  };

  const startEdit = (item) => {
    setEditingId(item._id);
    setForm({
      title: item.title || '',
      description: item.description || '',
      topic: item.topic || '',
      difficulty: item.difficulty || 'Beginner',
      nodes: item.nodes || [],
      links: item.links || [],
      status: item.status || 'draft',
      syllabus: item.syllabus || { board: '' },
    });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError('');
      if (editingId) {
        await api.put(`/concept-map/${editingId}`, form);
      } else {
        await api.post('/concept-map', form);
      }
      setForm(emptyForm);
      setEditingId(null);
      await fetchItems();
    } catch (e) {
      setError(e?.response?.data?.message || 'Failed to save');
    } finally {
      setLoading(false);
    }
  };

  const submitForReview = async (id) => {
    try {
      setLoading(true);
      setError('');
      await api.patch(`/concept-map/${id}/submit`);
      await fetchItems();
    } catch (e) {
      setError(e?.response?.data?.message || 'Failed to submit for review');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dashboard-card">
      <h3>My Concept Maps</h3>
      <div className="filters" style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 12 }}>
        <input placeholder="Topic" value={topic} onChange={(e) => setTopic(e.target.value)} />
        <select value={difficulty} onChange={(e) => setDifficulty(e.target.value)}>
          <option value="">All Difficulty</option>
          {DIFFICULTY_OPTIONS.map(d => <option key={d} value={d}>{d}</option>)}
        </select>
        <select value={board} onChange={(e) => setBoard(e.target.value)}>
          <option value="">All Boards</option>
          {BOARD_OPTIONS.map(b => <option key={b} value={b}>{b}</option>)}
        </select>
        <label style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
          <input type="checkbox" checked={showMine} onChange={(e) => setShowMine(e.target.checked)} />
          Show my items
        </label>
        <select value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="">Any Status</option>
          <option value="draft">Draft</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>
        <button onClick={fetchItems}>Refresh</button>
        <button onClick={startCreate}>New Map</button>
      </div>

      {error && <div style={{ color: 'red', marginBottom: 12 }}>{error}</div>}

      {/* Editor */}
      <form onSubmit={handleSave} style={{ display: 'grid', gap: 8, marginBottom: 16 }}>
        <input placeholder="Title" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required />
        <textarea placeholder="Description" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} required />
        <input placeholder="Topic" value={form.topic} onChange={e => setForm({ ...form, topic: e.target.value })} required />
        <select value={form.difficulty} onChange={e => setForm({ ...form, difficulty: e.target.value })}>
          {DIFFICULTY_OPTIONS.map(d => <option key={d} value={d}>{d}</option>)}
        </select>
        <select value={form.syllabus?.board || ''} onChange={e => setForm({ ...form, syllabus: { ...(form.syllabus || {}), board: e.target.value } })}>
          <option value="">Board (optional)</option>
          {BOARD_OPTIONS.map(b => <option key={b} value={b}>{b}</option>)}
        </select>

        {/* Visual Concept Map Editor */}
        <div style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: 8 }}>
          <ConceptMap
            nodes={form.nodes}
            links={form.links}
            onChange={({ nodes, links }) => setForm({ ...form, nodes, links })}
          />
        </div>

        <div style={{ display: 'flex', gap: 8 }}>
          <button type="submit" disabled={loading}>{editingId ? 'Save Changes' : 'Create Draft'}</button>
          {editingId && form.status === 'draft' && (
            <button type="button" onClick={() => submitForReview(editingId)}>Submit for Review</button>
          )}
        </div>
      </form>

      {/* List */}
      <ul style={{ paddingLeft: 16 }}>
        {items.map(item => (
          <li key={item._id} style={{ marginBottom: 12 }}>
            <strong>{item.title}</strong> — {item.topic} — {item.difficulty} — {item.syllabus?.board || '—'}
            <span style={{ marginLeft: 8 }}><StatusBadge status={item.status} /></span>
            <button style={{ marginLeft: 8 }} onClick={() => startEdit(item)}>Edit</button>
            {item.status === 'draft' && (
              <button style={{ marginLeft: 6 }} onClick={() => submitForReview(item._id)}>Submit</button>
            )}
          </li>
        ))}
        {!loading && items.length === 0 && <li>No concept maps match the current filters.</li>}
      </ul>
    </div>
  );
};

export default TeacherConceptMapManager;