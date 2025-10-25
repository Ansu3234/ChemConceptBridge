import React, { useEffect, useState, useCallback } from 'react';
import api from '../../apiClient';
import './AdminConcepts.css';
import { toast } from 'react-toastify';

const emptyConcept = { title: '', description: '', topic: '', difficulty: 'medium', estimatedTime: 15 };

const AdminConcepts = () => {
  const [concepts, setConcepts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [creating, setCreating] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyConcept);
  const [submitting, setSubmitting] = useState(false);
  const [selectedItems, setSelectedItems] = useState([]);
  const [bulkAction, setBulkAction] = useState('');

  // Filters
  const [search, setSearch] = useState('');
  const [filterTopic, setFilterTopic] = useState('');
  const [filterDifficulty, setFilterDifficulty] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');

  const loadConcepts = async () => {
    setLoading(true);
    setError('');
    try {
      // Use server-side filtering when possible
      if (search.trim()) {
        const { data } = await api.get(`/concept/search/${encodeURIComponent(search.trim())}`, {
          params: {
            ...(filterTopic ? { topic: filterTopic } : {}),
            ...(filterDifficulty ? { difficulty: filterDifficulty } : {}),
            ...(filterStatus ? { status: filterStatus } : {}),
          },
        });
        setConcepts(data);
      } else {
        const { data } = await api.get('/concept', {
          params: {
            ...(filterTopic ? { topic: filterTopic } : {}),
            ...(filterDifficulty ? { difficulty: filterDifficulty } : {}),
            ...(filterStatus ? { status: filterStatus } : {}),
          },
        });
        setConcepts(data);
      }
    } catch (e) {
      setError(e.response?.data?.message || 'Failed to load concepts');
    } finally {
      setLoading(false);
    }
  };

  const loadConceptsCallback = useCallback(() => {
    loadConcepts();
  }, [search, filterTopic, filterDifficulty, filterStatus]);

  useEffect(() => { loadConceptsCallback(); }, [loadConceptsCallback]);

  const startCreate = () => {
    setEditingId(null);
    setForm(emptyConcept);
    setCreating(true);
  };

  const startEdit = (c) => {
    setEditingId(c._id);
    setForm({
      title: c.title || '',
      description: c.description || '',
      topic: c.topic || '',
      difficulty: c.difficulty || 'medium',
      estimatedTime: c.estimatedTime || 15,
    });
    setCreating(true);
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      if (editingId) {
        const { data } = await api.put(`/concept/${editingId}`, form);
        setConcepts(prev => prev.map(c => (c._id === editingId ? data : c)));
      } else {
        const { data } = await api.post('/concept', form);
        setConcepts(prev => [data, ...prev]);
      }
      setCreating(false);
      setEditingId(null);
      setForm(emptyConcept);
    } catch (e) {
      setError(e.response?.data?.message || 'Failed to save concept');
    } finally {
      setSubmitting(false);
    }
  };

  const onDeactivate = async (id) => {
    if (!window.confirm('Deactivate this concept?')) return;
    try {
      await api.delete(`/concept/${id}`);
      // Soft delete: mark inactive in UI
      setConcepts(prev => prev.map(c => (c._id === id ? { ...c, isActive: false } : c)));
      toast.success('Concept deactivated successfully');
    } catch (e) {
      setError(e.response?.data?.message || 'Failed to deactivate concept');
      toast.error(e.response?.data?.message || 'Failed to deactivate concept');
    }
  };
  
  const updateConceptStatus = async (id, status) => {
    try {
      const { data } = await api.patch(`/concept/${id}/status`, { status });
      setConcepts(prev => prev.map(c => (c._id === id ? data : c)));
      toast.success(`Concept ${status === 'approved' ? 'approved' : 'rejected'}`);
    } catch (e) {
      setError(e.response?.data?.message || `Failed to ${status} concept`);
      toast.error(e.response?.data?.message || `Failed to ${status} concept`);
    }
  };

  // Bulk operations
  const handleSelectItem = (id) => {
    setSelectedItems(prev => 
      prev.includes(id) 
        ? prev.filter(item => item !== id)
        : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedItems.length === concepts.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(concepts.map(c => c._id));
    }
  };

  const handleBulkAction = async () => {
    if (!bulkAction || selectedItems.length === 0) return;

    try {
      setSubmitting(true);
      
      switch (bulkAction) {
        case 'approve':
          await Promise.all(selectedItems.map(id => 
            api.patch(`/concept/${id}/status`, { status: 'approved' })
          ));
          toast.success(`${selectedItems.length} concepts approved`);
          break;
        case 'reject':
          await Promise.all(selectedItems.map(id => 
            api.patch(`/concept/${id}/status`, { status: 'rejected' })
          ));
          toast.success(`${selectedItems.length} concepts rejected`);
          break;
        case 'activate':
          await Promise.all(selectedItems.map(id => 
            api.patch(`/concept/${id}`, { isActive: true })
          ));
          toast.success(`${selectedItems.length} concepts activated`);
          break;
        case 'deactivate':
          await Promise.all(selectedItems.map(id => 
            api.patch(`/concept/${id}`, { isActive: false })
          ));
          toast.success(`${selectedItems.length} concepts deactivated`);
          break;
        case 'delete':
          if (window.confirm(`Are you sure you want to delete ${selectedItems.length} concepts?`)) {
            await Promise.all(selectedItems.map(id => api.delete(`/concept/${id}`)));
            toast.success(`${selectedItems.length} concepts deleted`);
          }
          break;
        default:
          toast.error('Invalid bulk action');
          break;
      }
      
      setSelectedItems([]);
      setBulkAction('');
      await loadConcepts();
    } catch (e) {
      toast.error('Bulk operation failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="admin-concepts">
      <div className="ac-header">
        <div>
          <h3>Concept Management</h3>
          <p className="ac-sub">Create, edit, and deactivate concepts.</p>
        </div>
        <div className="ac-actions">
          <div className="filters">
            <input
              className="filter-input"
              placeholder="Search concepts..."
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
            <select
              className="filter-select"
              value={filterStatus}
              onChange={e => setFilterStatus(e.target.value)}
            >
              <option value="">All statuses</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
            <select
              className="filter-select"
              value={sortBy}
              onChange={e => setSortBy(e.target.value)}
            >
              <option value="createdAt">Sort by Date</option>
              <option value="title">Sort by Title</option>
              <option value="topic">Sort by Topic</option>
              <option value="status">Sort by Status</option>
            </select>
            <select
              className="filter-select"
              value={sortOrder}
              onChange={e => setSortOrder(e.target.value)}
            >
              <option value="desc">Descending</option>
              <option value="asc">Ascending</option>
            </select>
          </div>
          <button className="btn primary" onClick={startCreate}>+ New Concept</button>
        </div>
      </div>

      {error && <div className="ac-alert error">{error}</div>}

      {selectedItems.length > 0 && (
        <div className="bulk-actions">
          <div className="bulk-info">
            <span>{selectedItems.length} item(s) selected</span>
          </div>
          <div className="bulk-controls">
            <select
              value={bulkAction}
              onChange={e => setBulkAction(e.target.value)}
              className="bulk-select"
            >
              <option value="">Choose action...</option>
              <option value="approve">Approve Selected</option>
              <option value="reject">Reject Selected</option>
              <option value="activate">Activate Selected</option>
              <option value="deactivate">Deactivate Selected</option>
              <option value="delete">Delete Selected</option>
            </select>
            <button
              className="btn primary"
              onClick={handleBulkAction}
              disabled={!bulkAction || submitting}
            >
              {submitting ? 'Processing...' : 'Apply'}
            </button>
            <button
              className="btn"
              onClick={() => setSelectedItems([])}
            >
              Clear Selection
            </button>
          </div>
        </div>
      )}

      {creating && (
        <form className="ac-form" onSubmit={onSubmit}>
          <div className="row">
            <div className="field">
              <label>Title</label>
              <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required />
            </div>
            <div className="field">
              <label>Topic</label>
              <input value={form.topic} onChange={e => setForm({ ...form, topic: e.target.value })} placeholder="e.g. Stoichiometry" />
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
            <div className="field">
              <label>Estimated Time (min)</label>
              <input type="number" min={1} value={form.estimatedTime} onChange={e => setForm({ ...form, estimatedTime: Number(e.target.value) })} />
            </div>
          </div>
          <div className="field">
            <label>Description</label>
            <textarea rows={4} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
          </div>
          <div className="row end">
            <button type="button" className="btn" onClick={() => { setCreating(false); setEditingId(null); }}>Cancel</button>
            <button className="btn primary" disabled={submitting}>{submitting ? 'Saving...' : (editingId ? 'Save Changes' : 'Create Concept')}</button>
          </div>
        </form>
      )}

      <div className="ac-table-wrapper">
        {loading ? (
          <div className="loading">Loading concepts...</div>
        ) : (
          <table className="ac-table">
            <thead>
              <tr>
                <th>
                  <input
                    type="checkbox"
                    checked={selectedItems.length === concepts.length && concepts.length > 0}
                    onChange={handleSelectAll}
                  />
                </th>
                <th>Title</th>
                <th>Topic</th>
                <th>Difficulty</th>
                <th>Est. Time</th>
                <th>Active</th>
                <th>Approval Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {concepts.map(c => (
                <tr key={c._id}>
                  <td>
                    <input
                      type="checkbox"
                      checked={selectedItems.includes(c._id)}
                      onChange={() => handleSelectItem(c._id)}
                    />
                  </td>
                  <td>{c.title}</td>
                  <td>{c.topic || '-'}</td>
                  <td>{c.difficulty || '-'}</td>
                  <td>{c.estimatedTime || '-'}</td>
                  <td>{c.isActive === false ? 'Inactive' : 'Active'}</td>
                  <td>
                    <span className={`status-badge ${c.status || 'pending'}`}>
                      {c.status ? (c.status.charAt(0).toUpperCase() + c.status.slice(1)) : 'Pending'}
                    </span>
                  </td>
                  <td>
                    <button className="btn" onClick={() => startEdit(c)}>Edit</button>{' '}
                    <button className="btn danger" onClick={() => onDeactivate(c._id)} disabled={c.isActive === false}>Deactivate</button>{' '}
                    {c.status !== 'approved' && (
                      <button className="btn success" onClick={() => updateConceptStatus(c._id, 'approved')}>Approve</button>
                    )}
                    {c.status !== 'rejected' && c.status !== 'pending' && (
                      <button className="btn warning" onClick={() => updateConceptStatus(c._id, 'rejected')}>Reject</button>
                    )}
                    {c.status === 'pending' && (
                      <button className="btn warning" onClick={() => updateConceptStatus(c._id, 'rejected')}>Reject</button>
                    )}
                  </td>
                </tr>
              ))}
              {concepts.length === 0 && (
                <tr><td colSpan={8} className="empty">No concepts found.</td></tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default AdminConcepts;