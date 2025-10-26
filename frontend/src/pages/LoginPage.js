import React, { useState } from "react";
import "./LoginPage.css";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { auth } from "../firebase";

function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [rememberMe, setRememberMe] = useState(false);

  // 🌐 Use Render backend when deployed, localhost otherwise
  const API_BASE_URL =
    process.env.REACT_APP_API_BASE_URL ||
    "https://backend-project-1-sjrn.onrender.com/api";

  // Email validation
  const validateEmail = (value) => {
    if (!value) return "Email is required";
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(value)) return "Invalid email address";
    return "";
  };

  // Password validation
  const validatePassword = (value) => {
    if (!value) return "Password is required";
    if (value.length < 6) return "Password must be at least 6 characters";
    if (!/[A-Z]/.test(value)) return "Password must contain at least one uppercase letter";
    if (!/[0-9]/.test(value)) return "Password must contain at least one number";
    return "";
  };

  // ======================
  // 📧 Email/Password Login
  // ======================
  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    const emailError = validateEmail(email);
    const passwordError = validatePassword(password);
    if (emailError || passwordError) {
      setError(emailError || passwordError);
      return;
    }

    setLoading(true);
    try {
      const { data } = await axios.post(`${API_BASE_URL}/auth/login`, {
        email,
        password,
        rememberMe,
      });

      localStorage.setItem("token", data.token);
      localStorage.setItem("userName", data.user.name);
      localStorage.setItem("userRole", data.user.role);

      const next =
        data.user.role === "admin"
          ? "/admin-dashboard"
          : data.user.role === "teacher"
          ? "/teacher-dashboard"
          : "/student-dashboard";

      navigate(next);
    } catch (err) {
      console.error("Login error:", err);
      setError(
        err.response?.data?.message ||
          (err.message === "Network Error"
            ? "Network error. Check your internet connection."
            : "Login failed. Please try again.")
      );
    } finally {
      setLoading(false);
    }
  };

  // ======================
  // 🔐 Google Login
  // ======================
  const handleGoogleLogin = async () => {
    setError("");
    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);

      // Get Google ID token from Firebase
      const credential = GoogleAuthProvider.credentialFromResult(result);
      const tokenId = credential?.idToken;

      if (!tokenId) throw new Error("Failed to retrieve Google token");

      // Send token to backend for verification
      const { data } = await axios.post(`${API_BASE_URL}/auth/google-login`, {
        tokenId,
      });

      localStorage.setItem("token", data.token);
      localStorage.setItem("userName", data.user.name);
      localStorage.setItem("userRole", data.user.role);

      const next =
        data.user.role === "admin"
          ? "/admin-dashboard"
          : data.user.role === "teacher"
          ? "/teacher-dashboard"
          : "/student-dashboard";

      navigate(next);
    } catch (err) {
      console.error("Google login error:", err);

      if (err.code === "auth/popup-closed-by-user") {
        setError("Google login was cancelled.");
      } else if (err.code === "auth/popup-blocked") {
        setError("Popup blocked. Allow popups for this site.");
      } else if (err.code === "auth/unauthorized-domain") {
        setError("Unauthorized domain. Add this site in Firebase console.");
      } else {
        setError("Google login failed. Please try again.");
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
            alt="logo"
            className="chem-logo"
          />
          <h2>ChemConcept Bridge</h2>
          <p>Empowering Students to Master Chemistry Concepts with AI</p>
        </div>

        <form onSubmit={handleLogin}>
          <label>Email Address</label>
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="off"
          />

          <label>Password</label>
          <input
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="new-password"
          />

          <label className="remember-me">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
            />
            Remember Me
          </label>

          {error && <p className="error-message">{error}</p>}

          <button className="login-btn" type="submit" disabled={loading}>
            {loading ? "Authenticating..." : "Sign In"}
          </button>

          <div className="divider">
            <span>OR</span>
          </div>

          <button
            type="button"
            className="google-btn"
            onClick={handleGoogleLogin}
            disabled={loading}
          >
            {loading ? "Connecting..." : "Sign in with Google"}
          </button>

          <div className="register-links">
            <p>
              Don’t have an account? <Link to="/register">Register Now</Link>
            </p>
            <Link to="/generate-password">Generate Secure Password</Link>
          </div>
        </form>
      </div>
    </div>
  );
}

export default LoginPage;
