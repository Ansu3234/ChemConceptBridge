import React, { useEffect, useState } from 'react';
import api from '../apiClient';
import LabSimulation from '../components/LabSimulation/LabSimulation';
import { useParams } from 'react-router-dom';

const LabRunPage = () => {
  const { id } = useParams();
  const [experiment, setExperiment] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get(`/experiments/${id}`);
        setExperiment(res.data);
      } catch (err) {
        console.error('Failed to load experiment', err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  if (loading) return <div>Loading lab…</div>;
  if (!experiment) return <div>Experiment not found or access denied.</div>;

  // Convert backend experiment shape into the local LabSimulation-friendly shape
  const mapped = {
    id: experiment._id,
    name: experiment.title,
    description: experiment.description,
    apparatus: experiment.apparatus || [],
    steps: experiment.steps || [],
    animation: experiment.animation || 'neutralization',
    expectedResult: experiment.expectedResult || '',
    safetyPrecautions: experiment.safetyPrecautions || '',
    principles: experiment.principles || ''
  };

  // Decode role from token and pass to LabSimulation
  let role = 'student';
  try {
    const token = localStorage.getItem('token');
    if (token) {
      const payload = JSON.parse(atob(token.split('.')[1]));
      role = payload.role || 'student';
    }
  } catch (err) { /* ignore */ }

  return (
    <div style={{ padding: 12 }}>
      <h2>{experiment.title}</h2>
      <LabSimulation externalExperiment={mapped} role={role} experimentId={experiment._id} />
    </div>
  );
};

export default LabRunPage;
