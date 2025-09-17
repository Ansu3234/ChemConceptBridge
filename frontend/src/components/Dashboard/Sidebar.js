import React, { useState } from 'react';
import './Sidebar.css';
import PerformanceDashboard from '../Progress/PerformanceDashboard';
import GamifiedTracker from '../Gamification/GamifiedTracker';
import ConfidenceMeter from '../Progress/ConfidenceMeter';
import MoleculeAnimation from '../MoleculeAnimation/MoleculeAnimation';
import PeriodicTable from '../PeriodicTable/PeriodicTable';

const Sidebar = ({ user, activeTab, setActiveTab, onLogout }) => {
  const [selectedModule, setSelectedModule] = useState('');

  const getMenuItems = () => {
    const baseItems = [
      { id: 'overview', label: 'Overview', icon: '📊' },
      { id: 'concepts', label: 'Concepts', icon: '🧪' },
      { id: 'quizzes', label: 'Quizzes', icon: '📝' },
      { id: 'progress', label: 'Progress', icon: '📈' },
    ];

    if (user.role === 'student') {
      return [
        ...baseItems,
        { id: 'concept-map', label: 'Concept Map', icon: '🗺️' },
        { id: 'remediation', label: 'Remediation', icon: '🔧' },
  { id: 'confidence', label: 'Confidence Meter', icon: '📏' },
  { id: 'molecule', label: 'Molecule Animation', icon: '⚛️' },
  { id: 'periodic-table', label: 'Periodic Table', icon: '📅' },
        { id: 'chemical-equations', label: 'Chemical Equations', icon: '🧮' },
        { id: 'chemistry-calculator', label: 'Chemistry Calculator', icon: '🧑‍🔬' },
        { id: 'leaderboard', label: 'Leaderboard', icon: '🏆' },
      ];
    } else if (user.role === 'teacher') {
      return [
        ...baseItems,
        { id: 'students', label: 'Students', icon: '👥' },
        { id: 'analytics', label: 'Analytics', icon: '📊' },
        { id: 'content', label: 'Content Management', icon: '📚' },
      ];
    } else if (user.role === 'admin') {
      return [
        ...baseItems,
        { id: 'users', label: 'User Management', icon: '👥' },
        { id: 'system', label: 'System Settings', icon: '⚙️' },
        { id: 'reports', label: 'Reports', icon: '📋' },
      ];
    }

    return baseItems;
  };

  const menuItems = getMenuItems();

  const handleNav = (module) => {
    setSelectedModule(module);
    setActiveTab(module);
  };

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <div className="logo">
          <span className="logo-icon">🧪</span>
          <span className="logo-text">ChemConcept Bridge</span>
        </div>
      </div>

      <div className="sidebar-content">
        <div className="user-info">
          <div className="user-avatar">
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div className="user-details">
            <div className="user-name">{user.name}</div>
            <div className="user-role">{user.role.charAt(0).toUpperCase() + user.role.slice(1)}</div>
          </div>
        </div>

        <nav className="sidebar-nav">
          {menuItems.map((item) => (
            <button
              key={item.id}
              className={`nav-item ${activeTab === item.id ? 'active' : ''}`}
              onClick={() => setActiveTab(item.id)}
            >
              <span className="nav-icon">{item.icon}</span>
              <span className="nav-label">{item.label}</span>
            </button>
          ))}
          <button
            className={`nav-item ${activeTab === 'performance' ? 'active' : ''}`}
            onClick={() => handleNav('performance')}
          >
            <span className="nav-icon">📊</span>
            <span className="nav-label">Performance Dashboard</span>
          </button>
          <button
            className={`nav-item ${activeTab === 'gamified' ? 'active' : ''}`}
            onClick={() => handleNav('gamified')}
          >
            <span className="nav-icon">🎮</span>
            <span className="nav-label">Gamified Progress</span>
          </button>
          {/* Only one nav button for each module, handled by menuItems */}
        </nav>

  {selectedModule === 'performance' && <PerformanceDashboard />}
  {selectedModule === 'gamified' && <GamifiedTracker />}
  {selectedModule === 'confidence' && <ConfidenceMeter />}
  {selectedModule === 'molecule' && <MoleculeAnimation />}
  {selectedModule === 'periodic-table' && <PeriodicTable />}
      </div>

      <div className="sidebar-footer">
        <button className="logout-btn" onClick={onLogout}>
          <span className="logout-icon">🚪</span>
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
