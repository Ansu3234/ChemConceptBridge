import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Dashboard.css';
import Sidebar from './Sidebar';
import Header from './Header';
import StudentDashboard from './StudentDashboard';
import TeacherDashboard from './TeacherDashboard';
import AdminDashboard from './AdminDashboard';
import { isTokenExpired, getUserFromToken, clearAuth } from '../../utils/tokenManager';

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      console.log('No token found, redirecting to login');
      navigate('/login', { replace: true });
      return;
    }

    // Check if token is expired
    if (isTokenExpired()) {
      console.log('Token expired, redirecting to login');
      clearAuth();
      navigate('/login', { replace: true });
      return;
    }

    // Get user from token
    const userData = getUserFromToken();
    if (!userData) {
      console.error('Invalid token format');
      clearAuth();
      navigate('/login', { replace: true });
      return;
    }

    setUser({
      id: userData.id,
      role: userData.role,
      name: localStorage.getItem('userName') || 'User'
    });

    // Only redirect if role doesn't match the current dashboard
    const currentPath = window.location.pathname;
    if (userData.role === 'admin' && currentPath !== '/admin-dashboard') {
      navigate('/admin-dashboard', { replace: true });
    } else if (userData.role === 'teacher' && currentPath !== '/teacher-dashboard') {
      navigate('/teacher-dashboard', { replace: true });
    } else if (userData.role === 'student' && currentPath !== '/student-dashboard') {
      navigate('/student-dashboard', { replace: true });
    }

    setLoading(false);
  }, [navigate]);

  const handleLogout = () => {
    clearAuth();
    navigate('/', { replace: true });
  };

  if (loading || !user) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading your dashboard...</p>
      </div>
    );
  }

  const renderDashboardContent = () => {
    switch (user.role) {
      case 'student':
        return <StudentDashboard activeTab={activeTab} setActiveTab={setActiveTab} user={user} />;
      case 'teacher':
        return <TeacherDashboard activeTab={activeTab} setActiveTab={setActiveTab} user={user} />;
      case 'admin':
        return <AdminDashboard activeTab={activeTab} setActiveTab={setActiveTab} user={user} />;
      default:
        return <div>Invalid user role</div>;
    }
  };

  return (
    <div className="dashboard-container">
      <Sidebar 
        user={user} 
        activeTab={activeTab} 
        setActiveTab={setActiveTab}
        onLogout={handleLogout}
      />
      <div className="main-content">
        <Header user={user} />
        <div className="dashboard-content">
          {renderDashboardContent()}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
