import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import Dashboard from './components/Dashboard/Dashboard';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import QuizStatsPage from './pages/QuizStatsPage';
import StudentProgressPage from './pages/StudentProgressPage';
import PerformanceDashboard from './components/Progress/PerformanceDashboard';
import { useState, useEffect } from 'react';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Protected route component - moved outside to prevent re-renders
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
      } else if (payload.role === 'admin') {
        return <Navigate to="/admin-dashboard" replace />;
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

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <Router>
      <ToastContainer position="top-right" autoClose={5000} hideProgressBar={false} newestOnTop closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />
        <Route path="/dashboard" element={<Navigate to={userRole === 'admin' ? '/admin-dashboard' : userRole === 'teacher' ? '/teacher-dashboard' : '/student-dashboard'} replace />} />
        <Route path="/admin-dashboard" element={<ProtectedRoute element={<Dashboard />} allowedRole="admin" />} />
        <Route path="/teacher-dashboard" element={<ProtectedRoute element={<Dashboard />} allowedRole="teacher" />} />
        <Route path="/student-dashboard" element={<ProtectedRoute element={<Dashboard />} allowedRole="student" />} />
        <Route path="/quiz/:quizId/stats" element={<ProtectedRoute element={<QuizStatsPage />} allowedRole="teacher" />} />
        <Route path="/student/:studentId/progress" element={<ProtectedRoute element={<StudentProgressPage />} allowedRole="teacher" />} />
        <Route path="/performance" element={<PerformanceDashboard />} />
      </Routes>
    </Router>
  );
}

export default App;
