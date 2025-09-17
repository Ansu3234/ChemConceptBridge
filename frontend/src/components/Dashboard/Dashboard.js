import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Dashboard.css';
import Sidebar from './Sidebar';
import Header from './Header';
import StudentDashboard from './StudentDashboard';
import TeacherDashboard from './TeacherDashboard';
import AdminDashboard from './AdminDashboard';

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    // Decode token to get user info
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      setUser({
        id: payload.id,
        role: payload.role,
        name: localStorage.getItem('userName') || 'User'
      });
      
      // Redirect to the appropriate dashboard based on role and current URL
      const currentPath = window.location.pathname;
      if (payload.role === 'teacher' && currentPath !== '/teacher-dashboard') {
        navigate('/teacher-dashboard');
      } else if (payload.role === 'student' && currentPath !== '/student-dashboard') {
        navigate('/student-dashboard');
      }
    } catch (error) {
      console.error('Error decoding token:', error);
      localStorage.removeItem('token');
      navigate('/login');
    }
    setLoading(false);
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userName');
    navigate('/');
  };

  if (loading) {
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
        return <StudentDashboard activeTab={activeTab} setActiveTab={setActiveTab} />;
      case 'teacher':
        return <TeacherDashboard activeTab={activeTab} setActiveTab={setActiveTab} />;
      case 'admin':
        return <AdminDashboard activeTab={activeTab} setActiveTab={setActiveTab} />;
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
