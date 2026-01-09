import React, { useEffect, useState } from 'react';
import api from '../apiClient';
import { Link, useNavigate } from 'react-router-dom';

const AdminExperimentsPage = () => {
  const [exps, setExps] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get('/experiments');
        setExps(res.data || []);
      } catch (err) {
        console.error('Failed to load experiments', err);
      } finally { setLoading(false); }
    };
    load();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this experiment?')) return;
    try {
      await api.delete(`/experiments/${id}`);
      setExps(prev => prev.filter(e => e._id !== id));
    } catch (err) {
      console.error('Delete failed', err);
      alert('Delete failed');
    }
  };

  if (loading) return <div>Loading…</div>;

  return (
    <div style={{ padding: 16 }}>
      <h2>Manage Experiments</h2>
      <div style={{ marginBottom: 12 }}>
        <button className="btn btn-primary" onClick={() => navigate('/admin/experiments/new')}>Create New Experiment</button>
      </div>
      <div style={{ display: 'grid', gap: 12 }}>
        {exps.map(e => (
          <div key={e._id} style={{ border: '1px solid #eee', padding: 12, borderRadius: 6 }}>
            <h3>{e.title}</h3>
            <p>{e.description}</p>
            <div style={{ display: 'flex', gap: 8 }}>
              <Link to={`/experiments/${e._id}`} className="btn btn-secondary">Open</Link>
              <Link to={`/admin/experiments/${e._id}/edit`} className="btn btn-primary">Edit</Link>
              <button className="btn btn-danger" onClick={() => handleDelete(e._id)}>Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminExperimentsPage;
