import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import Dashboard from './components/Dashboard/Dashboard';
import { useState, useEffect } from 'react';

function App() {
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in and get their role
    const token = localStorage.getItem('token');
    if (token) {
      try {
        // Decode JWT token to get user role
        const payload = JSON.parse(atob(token.split('.')[1]));
        setUserRole(payload.role);
      } catch (error) {
        console.error('Error decoding token:', error);
        localStorage.removeItem('token');
      }
    }
    setLoading(false);
  }, []);

  // Protected route component
  const ProtectedRoute = ({ element, allowedRole }) => {
    const token = localStorage.getItem('token');
    
    if (!token) {
      return <Navigate to="/login" replace />;
    }
    
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      if (payload.role !== allowedRole) {
        // Redirect to the appropriate dashboard based on role
        if (payload.role === 'teacher') {
          return <Navigate to="/teacher-dashboard" replace />;
        } else if (payload.role === 'student') {
          return <Navigate to="/student-dashboard" replace />;
        } else {
          return <Navigate to="/login" replace />;
        }
      }
      return element;
    } catch (error) {
      console.error('Error decoding token:', error);
      localStorage.removeItem('token');
      return <Navigate to="/login" replace />;
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/dashboard" element={<Navigate to={userRole === 'teacher' ? '/teacher-dashboard' : '/student-dashboard'} replace />} />
        <Route path="/teacher-dashboard" element={<ProtectedRoute element={<Dashboard />} allowedRole="teacher" />} />
        <Route path="/student-dashboard" element={<ProtectedRoute element={<Dashboard />} allowedRole="student" />} />
      </Routes>
    </Router>
  );
}

export default App;
