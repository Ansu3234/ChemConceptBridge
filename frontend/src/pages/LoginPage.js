import React, { useState } from 'react';
import './LoginPage.css';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { auth } from '../firebase';

function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [emailTouched, setEmailTouched] = useState(false);
  const [passwordTouched, setPasswordTouched] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  // Email validation
  const validateEmail = (value) => {
    if (!value) return 'Email is required';
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(value)) return 'Invalid email address';
    return '';
  };

  // Password validation
  const validatePassword = (value) => {
    if (!value) return 'Password is required';
    if (value.length < 6) return 'Password must be at least 6 characters';
    if (!/[A-Z]/.test(value)) return 'Password must contain at least one uppercase letter';
    if (!/[0-9]/.test(value)) return 'Password must contain at least one number';
    return '';
  };

  // Email/password login
  const handleLogin = async (e) => {
    e.preventDefault();
    setEmailTouched(true);
    setPasswordTouched(true);
    setError('');

    const emailError = validateEmail(email);
    const passwordError = validatePassword(password);
    if (emailError || passwordError) {
      setError(emailError || passwordError);
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post('http://localhost:5000/api/auth/login', {
        email,
        password,
        rememberMe
      });
      const { token, user } = response.data;
      localStorage.setItem('token', token);
      localStorage.setItem('userName', user.name);
      localStorage.setItem('userRole', user.role);
      const next = user.role === 'admin' ? '/admin-dashboard' : user.role === 'teacher' ? '/teacher-dashboard' : '/student-dashboard';
      navigate(next);
    } catch (err) {
      // Provide more specific error messages based on error type
      if (err.response?.status === 400) {
        if (err.response?.data?.message === 'User not found') {
          setError('No account found with this email. Please check your email or register.');
        } else if (err.response?.data?.message === 'Invalid credentials') {
          setError('Incorrect password. Please try again or reset your password.');
        } else {
          setError(err.response?.data?.message || 'Login failed');
        }
      } else if (err.response?.status === 500) {
        setError('Server error. Please try again later.');
      } else if (err.message === 'Network Error') {
        setError('Network error. Please check your internet connection.');
      } else {
        setError('Login failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  // ✅ Fixed Google login handler
  const handleGoogleLogin = async () => {
    setError('');
    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);

      // ✅ Use Google OAuth ID token, not Firebase ID token
      const credential = GoogleAuthProvider.credentialFromResult(result);
      const tokenId = credential.idToken;

      if (!tokenId) {
        throw new Error('Failed to get Google ID token');
      }

      // Send Google ID token to backend
      const response = await axios.post('http://localhost:5000/api/auth/google-login', {
        tokenId
      });

      const { token, user } = response.data;
      localStorage.setItem('token', token);
      localStorage.setItem('userName', user.name);
      localStorage.setItem('userRole', user.role);
      const next = user.role === 'admin' ? '/admin-dashboard' : user.role === 'teacher' ? '/teacher-dashboard' : '/student-dashboard';
      navigate(next);
    } catch (err) {
      console.error('Google login error:', err);
      
      // Provide more specific error messages for Google login failures
      if (err.code === 'auth/popup-closed-by-user') {
        setError('Google login was cancelled. Please try again.');
      } else if (err.code === 'auth/popup-blocked') {
        setError('Google login popup was blocked. Please allow popups for this site.');
      } else if (err.code === 'auth/account-exists-with-different-credential') {
        setError('An account already exists with the same email. Please use a different login method.');
      } else if (err.response?.status === 500) {
        setError('Server error while processing Google login. Please try again later.');
      } else if (err.message === 'Network Error') {
        setError('Network error. Please check your internet connection.');
      } else {
        setError('Failed to process Google login. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="chem-header">
          <img
            src="https://cdn-icons-png.flaticon.com/512/2553/2553635.png"
            alt="colorful-chemistry-logo"
            className="chem-logo"
          />
          <h2>ChemConcept Bridge</h2>
          <p className="chem-subtext">
            Empowering School Students to Master Chemistry Concepts with AI
          </p>
        </div>
        <form onSubmit={handleLogin}>
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

          <label htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            onBlur={() => setPasswordTouched(true)}
            className={passwordTouched && validatePassword(password) ? 'input-error' : ''}
            autoComplete="new-password"
          />
          {passwordTouched && validatePassword(password) && (
            <p className="error-message">{validatePassword(password)}</p>
          )}

          <div className="login-options">
            <label htmlFor="rememberMe">
              <input
                id="rememberMe"
                type="checkbox"
                checked={rememberMe}
                onChange={e => setRememberMe(e.target.checked)}
              />
              Remember Me
            </label>
          </div>

          <div className="forgot-password-link">
            <Link to="/forgot-password">Forgot Password?</Link>
          </div>

          {error && <p className="error-message" style={{ marginTop: 10 }}>{error}</p>}

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
                Authenticating...
              </>
            ) : 'Sign In'}
          </button>

          <div className="divider"><span>OR</span></div>

          <button
            type="button"
            className="google-btn"
            onClick={handleGoogleLogin}
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="spinner" style={{
                  display: 'inline-block',
                  width: '14px',
                  height: '14px',
                  border: '2px solid rgba(52, 73, 94, 0.3)',
                  borderRadius: '50%',
                  borderTopColor: '#34495e',
                  animation: 'spin 0.8s linear infinite',
                  marginRight: '8px',
                  verticalAlign: 'middle'
                }}></span>
                Connecting...
              </>
            ) : 'Sign in with Google'}
          </button>

          <div className="register-links">
            <p>Don't have an account? <Link to="/register">Register Now</Link></p>
            <Link to="/generate-password">Generate Secure Password</Link>
          </div>
        </form>
      </div>
    </div>
  );
}

export default LoginPage;
