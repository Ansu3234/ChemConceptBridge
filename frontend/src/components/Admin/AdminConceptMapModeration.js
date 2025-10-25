import React, { useEffect, useState } from 'react';
import api from '../../apiClient';

const AdminConceptMapModeration = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [reviewNote, setReviewNote] = useState('');
  const [tags, setTags] = useState(''); // comma separated
  const [board, setBoard] = useState('');

  const fetchPending = async () => {
    try {
      setLoading(true);
      setError('');
      const { data } = await api.get('/concept-map/admin/pending');
      setItems(data || []);
    } catch (e) {
      setError(e?.response?.data?.message || 'Failed to load pending concept maps');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPending(); }, []);

  const approve = async (id) => {
    try {
      setLoading(true);
      setError('');
      const payload = { note: reviewNote || undefined };
      const t = (tags || '').split(',').map(s => s.trim()).filter(Boolean);
      if (t.length) payload.tags = t;
      if (board) payload.syllabus = { board };
      await api.patch(`/concept-map/${id}/approve`, payload);
      await fetchPending();
      setReviewNote(''); setTags(''); setBoard('');
    } catch (e) {
      setError(e?.response?.data?.message || 'Failed to approve');
    } finally {
      setLoading(false);
    }
  };

  const reject = async (id) => {
    try {
      setLoading(true);
      setError('');
      await api.patch(`/concept-map/${id}/reject`, { note: reviewNote || undefined });
      await fetchPending();
      setReviewNote(''); setTags(''); setBoard('');
    } catch (e) {
      setError(e?.response?.data?.message || 'Failed to reject');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dashboard-card">
      <h3>Concept Map Moderation</h3>
      {error && <div style={{ color: 'red', marginBottom: 12 }}>{error}</div>}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 12 }}>
        <input placeholder="Review note (optional)" value={reviewNote} onChange={e => setReviewNote(e.target.value)} />
        <input placeholder="Tags (comma separated)" value={tags} onChange={e => setTags(e.target.value)} />
        <select value={board} onChange={e => setBoard(e.target.value)}>
          <option value="">Board (optional)</option>
          <option>NCERT</option>
          <option>NEET</option>
          <option>Other</option>
        </select>
        <button onClick={fetchPending} disabled={loading}>{loading ? 'Loading...' : 'Refresh'}</button>
      </div>
      <ul style={{ paddingLeft: 16 }}>
        {items.map(item => (
          <li key={item._id} style={{ marginBottom: 12 }}>
            <strong>{item.title}</strong> — {item.topic} — {item.difficulty}
            <div style={{ marginTop: 6 }}>
              <button onClick={() => approve(item._id)} disabled={loading} style={{ color: '#16a34a' }}>Approve</button>
              <button onClick={() => reject(item._id)} disabled={loading} style={{ marginLeft: 8, color: '#dc2626' }}>Reject</button>
            </div>
          </li>
        ))}
        {!loading && items.length === 0 && <li>No items in pending queue.</li>}
      </ul>
    </div>
  );
};

export default AdminConceptMapModeration;