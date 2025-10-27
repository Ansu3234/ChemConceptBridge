import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import "./LoginPage.css";

function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const validatePassword = (value) => {
    if (!value) return "Password is required";
    if (value.length < 6) return "Password must be at least 6 characters";
    if (!/[A-Z]/.test(value)) return "Password must contain at least one uppercase letter";
    if (!/[0-9]/.test(value)) return "Password must contain at least one number";
    return "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    const passwordError = validatePassword(password);
    if (passwordError) {
      setError(passwordError);
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);
    
    // Use the same API base URL pattern
    const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000/api';

    try {
      const res = await axios.post(
        `${API_BASE_URL}/auth/reset-password/${token}`,
        { password }
      );
      setMessage(res.data.message || "Password reset successful! Redirecting to login...");
      setTimeout(() => navigate("/login"), 2000);
    } catch (err) {
      console.error("Reset password error:", err);
      
      // More detailed error handling
      if (err.response?.status === 400) {
        setError(err.response?.data?.message || "Invalid or expired reset token");
      } else if (err.response?.status === 500) {
        setError("Server error. Please try again later.");
      } else if (err.message === 'Network Error') {
        setError("Network error. Please check your internet connection.");
      } else {
        setError(err.response?.data?.error || "Failed to reset password. Please try again.");
      }
      setMessage("");
    } finally {
      setLoading(false);
    }
  };

  // Show error if no token is present
  if (!token) {
    return (
      <div className="login-container">
        <div className="login-card">
          <h2>Reset Password</h2>
          <p className="error-message">Invalid reset link. Please request a new password reset.</p>
          <button className="login-btn" onClick={() => navigate('/forgot-password')} style={{ marginTop: '20px' }}>
            Request New Reset Link
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="login-container">
      <div className="login-card">
        <h2>Reset Password</h2>
        <p style={{ fontSize: '14px', color: '#666', marginBottom: '20px', textAlign: 'center' }}>
          Enter your new password below
        </p>
        <form onSubmit={handleSubmit}>
          <label htmlFor="password">New Password</label>
          <input
            type="password"
            id="password"
            placeholder="Enter new password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="new-password"
            required
          />
          
          <label htmlFor="confirmPassword" style={{ marginTop: '18px' }}>Confirm Password</label>
          <input
            type="password"
            id="confirmPassword"
            placeholder="Confirm new password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            autoComplete="new-password"
            required
          />

          {error && <p className="error-message" style={{ marginTop: '10px' }}>{error}</p>}
          {message && <p className="success-message" style={{ marginTop: '10px' }}>{message}</p>}
          
          <button className="login-btn" type="submit" disabled={loading} style={{ marginTop: '20px' }}>
            {loading ? "Resetting..." : "Reset Password"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default ResetPassword;
