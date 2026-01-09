import React, { useEffect, useState } from 'react';
import api from '../apiClient';
import { useNavigate, useParams } from 'react-router-dom';

const ExperimentEditorPage = () => {
  const { id } = useParams();
  const [form, setForm] = useState({ title: '', description: '', animation: 'neutralization', apparatus: [], steps: [''], expectedResult: '', safetyPrecautions: '', principles: '' });
  const navigate = useNavigate();

  useEffect(() => {
    if (!id) return;
    const load = async () => {
      try {
        const res = await api.get(`/experiments/${id}`);
        const e = res.data;
        setForm({
          title: e.title || '',
          description: e.description || '',
          animation: e.animation || 'neutralization',
          apparatus: e.apparatus || [],
          steps: e.steps && e.steps.length ? e.steps : [''],
          expectedResult: e.expectedResult || '',
          safetyPrecautions: e.safetyPrecautions || '',
          principles: e.principles || ''
        });
      } catch (err) { console.error(err); }
    };
    load();
  }, [id]);

  const updateField = (k, v) => setForm(prev => ({ ...prev, [k]: v }));

  const save = async () => {
    try {
      if (id) await api.put(`/experiments/${id}`, form);
      else await api.post('/experiments', form);
      navigate('/admin/experiments');
    } catch (err) {
      console.error('Save failed', err);
      alert('Save failed');
    }
  };

  return (
    <div style={{ padding: 16 }}>
      <h2>{id ? 'Edit' : 'Create'} Experiment</h2>
      <div style={{ display: 'grid', gap: 8, maxWidth: 800 }}>
        <label>Title</label>
        <input value={form.title} onChange={e => updateField('title', e.target.value)} />
        <label>Description</label>
        <textarea value={form.description} onChange={e => updateField('description', e.target.value)} />
        <label>Animation</label>
        <select value={form.animation} onChange={e => updateField('animation', e.target.value)}>
          <option value="neutralization">Neutralization</option>
          <option value="combustion">Combustion</option>
          <option value="crystallization">Crystallization</option>
          <option value="redox">Redox</option>
        </select>
        <label>Apparatus (comma separated)</label>
        <input value={form.apparatus.join(', ')} onChange={e => updateField('apparatus', e.target.value.split(',').map(s => s.trim()))} />
        <label>Steps (one per line)</label>
        <textarea value={form.steps.join('\n')} onChange={e => updateField('steps', e.target.value.split('\n').map(s => s.trim()))} />
        <label>Expected Result</label>
        <textarea value={form.expectedResult} onChange={e => updateField('expectedResult', e.target.value)} />
        <label>Safety Precautions</label>
        <textarea value={form.safetyPrecautions} onChange={e => updateField('safetyPrecautions', e.target.value)} />
        <label>Principles</label>
        <textarea value={form.principles} onChange={e => updateField('principles', e.target.value)} />

        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn-primary" onClick={save}>Save</button>
          <button className="btn btn-secondary" onClick={() => navigate('/admin/experiments')}>Cancel</button>
        </div>
      </div>
    </div>
  );
};

export default ExperimentEditorPage;
