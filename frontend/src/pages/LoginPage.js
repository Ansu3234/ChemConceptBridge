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
        password
      });
      const { token, user } = response.data;
      localStorage.setItem('token', token);
      localStorage.setItem('userName', user.name);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
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
      navigate('/dashboard');
    } catch (err) {
      console.error('Google login error:', err);
      setError('Failed to process Google login. Please try again.');
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
            autoComplete="username"
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
            autoComplete="current-password"
          />
          {passwordTouched && validatePassword(password) && (
            <p className="error-message">{validatePassword(password)}</p>
          )}

          {error && <p className="error-message" style={{ marginTop: 10 }}>{error}</p>}

          <button
            className="login-btn"
            type="submit"
            disabled={loading}
            style={{ marginTop: 20 }}
          >
            {loading ? 'Authenticating...' : 'Sign In'}
          </button>

          <div className="divider"><span>OR</span></div>

          <button
            type="button"
            className="google-btn"
            onClick={handleGoogleLogin}
            disabled={loading}
          >
            Sign in with Google
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
