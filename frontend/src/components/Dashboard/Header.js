import React from 'react';
import './Header.css';

const Header = ({ user }) => {
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  const getRoleBasedMessage = () => {
    switch (user.role) {
      case 'student':
        return 'Ready to explore chemistry concepts?';
      case 'teacher':
        return 'Manage your students and content';
      case 'admin':
        return 'Monitor system performance';
      default:
        return 'Welcome to ChemConcept Bridge';
    }
  };

  return (
    <header className="dashboard-header">
      <div className="header-content">
        <div className="header-left">
          <h1 className="header-title">
            {getGreeting()}, {user.name}!
          </h1>
          <p className="header-subtitle">
            {getRoleBasedMessage()}
          </p>
        </div>
        
        <div className="header-right">
          <div className="header-actions">
            <button className="action-btn notification-btn">
              <span className="btn-icon">🔔</span>
              <span className="notification-badge">3</span>
            </button>
            
            <button className="action-btn settings-btn">
              <span className="btn-icon">⚙️</span>
            </button>
            
            <div className="user-menu">
              <div className="user-avatar">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div className="user-info">
                <div className="user-name">{user.name}</div>
                <div className="user-role">{user.role.charAt(0).toUpperCase() + user.role.slice(1)}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
