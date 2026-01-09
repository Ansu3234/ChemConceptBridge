import React, { useEffect, useState } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import api from '../apiClient';

const decodeRole = () => {
  const token = localStorage.getItem('token');
  if (!token) return null;
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.role;
  } catch { return null; }
};

const TeacherAttemptsPage = () => {
  const { id } = useParams();
  const [attempts, setAttempts] = useState([]);
  const [loading, setLoading] = useState(true);
  const role = decodeRole();

  useEffect(() => {
    if (!id) return;
    const load = async () => {
      try {
        const res = await api.get(`/experiments/${id}/attempts`);
        setAttempts(res.data || []);
      } catch (err) {
        console.error('Failed to load attempts', err);
      } finally { setLoading(false); }
    };
    load();
  }, [id]);

  if (!role || (role !== 'teacher' && role !== 'admin')) {
    return <Navigate to="/" replace />;
  }

  if (loading) return <div>Loading attempts…</div>;

  return (
    <div style={{ padding: 16 }}>
      <h2>Attempts for Experiment</h2>
      {attempts.length === 0 && <div>No attempts recorded yet.</div>}
      <div style={{ display: 'grid', gap: 12, marginTop: 12 }}>
        {attempts.map(a => (
          <AttemptCard key={a._id} attempt={a} expId={id} onSaved={() => {
            // refresh
            setAttempts(prev => prev.map(x => x._id === a._id ? { ...x } : x));
            // reload list
            api.get(`/experiments/${id}/attempts`).then(r => setAttempts(r.data)).catch(()=>{});
          }} />
        ))}
      </div>
    </div>
  );
};

const AttemptCard = ({ attempt, expId, onSaved }) => {
  const [feedback, setFeedback] = React.useState(attempt.feedback || '');
  const [saving, setSaving] = React.useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.put(`/experiments/${expId}/attempts/${attempt._id}`, { feedback });
      if (onSaved) onSaved();
    } catch (err) {
      console.error('Save feedback failed', err);
      alert('Save failed');
    } finally { setSaving(false); }
  };

  return (
    <div style={{ border: '1px solid #e6e6e6', padding: 12, borderRadius: 6 }}>
      <div><strong>Student:</strong> {attempt.student?.name || attempt.student?.email || 'Unknown'}</div>
      <div><strong>When:</strong> {new Date(attempt.createdAt).toLocaleString()}</div>
      <div><strong>pH readings:</strong> {(attempt.pHReadings || []).join(', ')}</div>
      <div><strong>Observations:</strong> {attempt.observations}</div>
      <details style={{ marginTop: 8 }}>
        <summary>Responses (JSON)</summary>
        <pre style={{ whiteSpace: 'pre-wrap' }}>{JSON.stringify(attempt.responses, null, 2)}</pre>
      </details>
      <div style={{ marginTop: 8 }}>
        <label><strong>Feedback</strong></label>
        <textarea value={feedback} onChange={e => setFeedback(e.target.value)} style={{ width: '100%', minHeight: 80 }} />
        <div style={{ marginTop: 8 }}>
          <button className="btn btn-primary" onClick={handleSave} disabled={saving}>{saving ? 'Saving...' : 'Save Feedback'}</button>
        </div>
      </div>
    </div>
  );
};

export default TeacherAttemptsPage;
