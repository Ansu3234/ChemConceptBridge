import React, { useEffect, useState } from 'react';
import api from '../apiClient';
import { Link } from 'react-router-dom';

const ExperimentsPage = () => {
  const [exps, setExps] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await api.get('/experiments');
        setExps(res.data || []);
      } catch (err) {
        console.error('Could not load experiments', err);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  if (loading) return <div>Loading experiments…</div>;

  return (
    <div style={{ padding: 20 }}>
      <h2>Available Virtual Labs</h2>
      <div style={{ display: 'grid', gap: 12, marginTop: 12 }}>
        {exps.map(e => (
          <div key={e._id} style={{ border: '1px solid #ddd', padding: 12, borderRadius: 6 }}>
            <h3>{e.title}</h3>
            <p>{e.description}</p>
            <div style={{ display: 'flex', gap: 8 }}>
              <Link to={`/experiments/${e._id}`} className="btn btn-primary">Open Lab</Link>
              <Link to={`/experiments/${e._id}`} className="btn btn-secondary">Preview</Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ExperimentsPage;
