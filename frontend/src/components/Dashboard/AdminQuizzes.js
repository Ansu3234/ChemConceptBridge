import React, { useEffect, useState } from 'react';
import api from '../../apiClient';
import './AdminQuizzes.css';
import { toast } from 'react-toastify';

const emptyQuiz = { title: '', topic: '', difficulty: 'medium', description: '', questions: [] };

const defaultQuestion = () => ({
  text: '',
  options: ['', '', '', ''],
  correct: 0, // index 0..3
  explanation: '',
});

const AdminQuizzes = () => {
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [creating, setCreating] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyQuiz);
  const [submitting, setSubmitting] = useState(false);

  // Filters
  const [search, setSearch] = useState('');
  const [filterTopic, setFilterTopic] = useState('');
  const [filterDifficulty, setFilterDifficulty] = useState('');

  const loadQuizzes = async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await api.get('/quiz', {
        params: {
          ...(filterTopic ? { topic: filterTopic } : {}),
          ...(filterDifficulty ? { difficulty: filterDifficulty } : {}),
        },
      });
      const bySearch = (q) => {
        if (!search.trim()) return true;
        const s = search.trim().toLowerCase();
        return (q.title || '').toLowerCase().includes(s) || (q.topic || '').toLowerCase().includes(s);
      };
      setQuizzes(data.filter(bySearch));
    } catch (e) {
      setError(e.response?.data?.message || 'Failed to load quizzes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadQuizzes(); }, [search, filterTopic, filterDifficulty]);

  const startCreate = () => {
    setEditingId(null);
    setForm({ ...emptyQuiz, questions: [defaultQuestion()] });
    setCreating(true);
  };

  const startEdit = async (q) => {
    try {
      // Fetch full quiz to edit (includes questions)
      const { data } = await api.get(`/quiz/${q._id}`);
      setEditingId(q._id);
      setForm({
        title: data.title || '',
        topic: data.topic || '',
        difficulty: data.difficulty || 'medium',
        description: data.description || '',
        questions: (data.questions || []).map(qq => ({
          text: qq.text || '',
          options: qq.options || ['', '', '', ''],
          correct: typeof qq.correct === 'number' ? qq.correct : 0,
          explanation: qq.explanation || '',
        })),
      });
      setCreating(true);
    } catch (e) {
      setError(e.response?.data?.message || 'Failed to load quiz details');
    }
  };

  const addQuestion = () => setForm(f => ({ ...f, questions: [...f.questions, defaultQuestion()] }));
  const removeQuestion = (idx) => setForm(f => ({ ...f, questions: f.questions.filter((_, i) => i !== idx) }));
  const updateQuestion = (idx, patch) => setForm(f => ({ ...f, questions: f.questions.map((q, i) => i === idx ? { ...q, ...patch } : q) }));
  const updateOption = (qIdx, oIdx, value) => setForm(f => ({ ...f, questions: f.questions.map((q, i) => i === qIdx ? { ...q, options: q.options.map((o, j) => j === oIdx ? value : o) } : q) }));

  const onSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      if (editingId) {
        const { data } = await api.put(`/quiz/${editingId}` , form);
        setQuizzes(prev => prev.map(q => (q._id === editingId ? { ...q, ...data } : q)));
      } else {
        const { data } = await api.post('/quiz', form);
        setQuizzes(prev => [data, ...prev]);
      }
      setCreating(false);
      setEditingId(null);
      setForm(emptyQuiz);
      toast.success(editingId ? 'Quiz updated successfully' : 'Quiz created successfully');
    } catch (e) {
      const errorMsg = e.response?.data?.message || 'Failed to save quiz';
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setSubmitting(false);
    }
  };

  const toggleQuizStatus = async (id, currentStatus) => {
    const action = currentStatus ? 'deactivate' : 'activate';
    if (!window.confirm(`${action.charAt(0).toUpperCase() + action.slice(1)} this quiz?`)) return;
    
    try {
      const newStatus = !currentStatus;
      await api.patch(`/quiz/${id}/status`, { isActive: newStatus });
      setQuizzes(prev => prev.map(q => (q._id === id ? { ...q, isActive: newStatus } : q)));
      toast.success(`Quiz ${newStatus ? 'activated' : 'deactivated'} successfully`);
    } catch (e) {
      const errorMsg = e.response?.data?.message || `Failed to ${action} quiz`;
      setError(errorMsg);
      toast.error(errorMsg);
    }
  };
  
  const onDeactivate = async (id) => {
    if (!window.confirm('Deactivate this quiz?')) return;
    try {
      await api.delete(`/quiz/${id}`);
      setQuizzes(prev => prev.map(q => (q._id === id ? { ...q, isActive: false } : q)));
      toast.success('Quiz deactivated successfully');
    } catch (e) {
      const errorMsg = e.response?.data?.message || 'Failed to deactivate quiz';
      setError(errorMsg);
      toast.error(errorMsg);
    }
  };

  return (
    <div className="admin-quizzes">
      <div className="aq-header">
        <div>
          <h3>Quiz Management</h3>
          <p className="aq-sub">Create, edit, and deactivate quizzes.</p>
        </div>
        <div className="aq-actions">
          <div className="filters">
            <input
              className="filter-input"
              placeholder="Search quizzes..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            <input
              className="filter-input"
              placeholder="Filter by topic"
              value={filterTopic}
              onChange={e => setFilterTopic(e.target.value)}
            />
            <select
              className="filter-select"
              value={filterDifficulty}
              onChange={e => setFilterDifficulty(e.target.value)}
            >
              <option value="">All difficulties</option>
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
          </div>
          <button className="btn primary" onClick={startCreate}>+ New Quiz</button>
        </div>
      </div>

      {error && <div className="aq-alert error">{error}</div>}

      {creating && (
        <form className="aq-form" onSubmit={onSubmit}>
          <div className="row">
            <div className="field">
              <label>Title</label>
              <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required />
            </div>
            <div className="field">
              <label>Topic</label>
              <input value={form.topic} onChange={e => setForm({ ...form, topic: e.target.value })} />
            </div>
          </div>
          <div className="row">
            <div className="field">
              <label>Difficulty</label>
              <select value={form.difficulty} onChange={e => setForm({ ...form, difficulty: e.target.value })}>
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </div>
          </div>
          <div className="field">
            <label>Description</label>
            <textarea rows={3} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
          </div>

          <div className="questions">
            <div className="q-header">
              <h4>Questions</h4>
              <button type="button" className="btn" onClick={addQuestion}>+ Add Question</button>
            </div>
            {form.questions.map((q, idx) => (
              <div className="q-card" key={idx}>
                <div className="row">
                  <div className="field">
                    <label>Question Text</label>
                    <input value={q.text} onChange={e => updateQuestion(idx, { text: e.target.value })} required />
                  </div>
                  <div className="field">
                    <label>Correct Option</label>
                    <select value={q.correct} onChange={e => updateQuestion(idx, { correct: Number(e.target.value) })}>
                      <option value={0}>Option 1</option>
                      <option value={1}>Option 2</option>
                      <option value={2}>Option 3</option>
                      <option value={3}>Option 4</option>
                    </select>
                  </div>
                </div>
                <div className="options">
                  {q.options.map((opt, oIdx) => (
                    <div className="field" key={oIdx}>
                      <label>Option {oIdx + 1}</label>
                      <input value={opt} onChange={e => updateOption(idx, oIdx, e.target.value)} required />
                    </div>
                  ))}
                </div>
                <div className="field">
                  <label>Explanation</label>
                  <textarea rows={2} value={q.explanation} onChange={e => updateQuestion(idx, { explanation: e.target.value })} />
                </div>
                <div className="row end">
                  <button type="button" className="btn danger" onClick={() => removeQuestion(idx)} disabled={form.questions.length <= 1}>Remove</button>
                </div>
              </div>
            ))}
          </div>

          <div className="row end">
            <button type="button" className="btn" onClick={() => { setCreating(false); setEditingId(null); }}>Cancel</button>
            <button className="btn primary" disabled={submitting}>{submitting ? 'Saving...' : (editingId ? 'Save Changes' : 'Create Quiz')}</button>
          </div>
        </form>
      )}

      <div className="aq-table-wrapper">
        {loading ? (
          <div className="loading">Loading quizzes...</div>
        ) : (
          <table className="aq-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Topic</th>
                <th>Difficulty</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {quizzes.map(q => (
                <tr key={q._id}>
                  <td>{q.title}</td>
                  <td>{q.topic || '-'}</td>
                  <td>{q.difficulty || '-'}</td>
                  <td>
                    <span className={`status-badge ${q.isActive ? 'active' : 'inactive'}`}>
                      {q.isActive === false ? 'Inactive' : 'Active'}
                    </span>
                  </td>
                  <td>
                    <button className="btn" onClick={() => startEdit(q)}>Edit</button>{' '}
                    <button 
                      className={`btn ${q.isActive ? 'danger' : 'success'}`} 
                      onClick={() => toggleQuizStatus(q._id, q.isActive)}
                    >
                      {q.isActive ? 'Deactivate' : 'Activate'}
                    </button>{' '}
                    <a 
                      href={`/quiz/${q._id}`} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="btn info"
                    >
                      View
                    </a>{' '}
                    <a 
                      href={`/quiz/${q._id}/stats`} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="btn info"
                    >
                      Stats
                    </a>
                  </td>
                </tr>
              ))}
              {quizzes.length === 0 && (
                <tr><td colSpan={5} className="empty">No quizzes found.</td></tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default AdminQuizzes;