import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import './LoginPage.css';

function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [emailTouched, setEmailTouched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const validateEmail = (value) => {
    if (!value) return 'Email is required';
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(value)) return 'Invalid email address';
    return '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setEmailTouched(true);
    setError('');
    setMessage('');
    const emailError = validateEmail(email);
    if (emailError) {
      setError(emailError);
      return;
    }
    setLoading(true);
    
    // Use the same API base URL pattern as LoginPage
    const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000/api';
    
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/forgot-password`, { email });
      setMessage(response.data.message || 'Password reset email sent! Check your inbox for reset instructions.');
    } catch (err) {
      // Provide more specific error messages based on error type
      if (err.response?.status === 400) {
        if (err.response?.data?.message === 'User not found') {
          setError('No account found with this email address.');
        } else {
          setError(err.response?.data?.message || 'Failed to send reset email');
        }
      } else if (err.response?.status === 500) {
        setError('Server error. Please try again later.');
      } else if (err.message === 'Network Error') {
        setError('Network error. Please check your internet connection.');
      } else {
        setError('Failed to send reset email. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h2>Forgot Password</h2>
        <form onSubmit={handleSubmit}>
          <label htmlFor="email">Email Address</label>
          <input
            id="email"
            type="email"
            placeholder="Enter your email address"
            value={email}
            onChange={e => setEmail(e.target.value)}
            onBlur={() => setEmailTouched(true)}
            className={emailTouched && validateEmail(email) ? 'input-error' : ''}
            autoComplete="off"
          />
          {emailTouched && validateEmail(email) && (
            <p className="error-message">{validateEmail(email)}</p>
          )}
          {error && <p className="error-message" style={{ marginTop: 10 }}>{error}</p>}
          {message && <p className="success-message" style={{ marginTop: 10 }}>{message}</p>}
          <button
            className="login-btn"
            type="submit"
            disabled={loading}
            style={{ marginTop: 20 }}
          >
            {loading ? (
              <>
                <span className="spinner" style={{
                  display: 'inline-block',
                  width: '16px',
                  height: '16px',
                  border: '2px solid rgba(255,255,255,0.3)',
                  borderRadius: '50%',
                  borderTopColor: '#fff',
                  animation: 'spin 0.8s linear infinite',
                  marginRight: '8px',
                  verticalAlign: 'middle'
                }}></span>
                Sending...
              </>
            ) : 'Send Reset Link'}
          </button>
          <div className="register-links">
            <Link to="/login">Back to Login</Link>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ForgotPassword;
