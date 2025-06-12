import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { login as apiLogin } from '../api/api';
import { useAuth } from '../contexts/AuthContext';
import '../styles/Login.css';

function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value.trim() }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await apiLogin(formData);
      console.log('Login Response:', response.data); // Debug log
      const { access, refresh, user } = response.data;

      // Store tokens directly first
      localStorage.setItem('accessToken', access);
      localStorage.setItem('refreshToken', refresh);
      localStorage.setItem('userData', JSON.stringify(user));

      // Use the AuthContext's login function
      login(user, access, refresh);

      console.log('Stored tokens:', { // Debug log
        accessToken: localStorage.getItem('accessToken'),
        refreshToken: localStorage.getItem('refreshToken'),
        userData: localStorage.getItem('userData')
      });

      // Navigate based on user role
      if (user.role.toLowerCase() === 'candidate') {
        navigate('/candidate/dashboard');
      } else if (user.role.toLowerCase() === 'company') {
        navigate('/company/dashboard');
      } else {
        // If role is unknown, redirect to home
        navigate('/');
      }
    } catch (err) {
      console.error('Login Error:', err); // Debug log
      let errorMessage = 'Failed to login. Please try again.';
      const errorData = err.response?.data;
      if (errorData) {
        if (typeof errorData === 'object') {
          const messages = Object.entries(errorData)
            .map(([field, msg]) => `${field}: ${Array.isArray(msg) ? msg.join(', ') : msg}`)
            .join('\n');
          errorMessage = messages || errorData.detail || errorMessage;
        } else if (typeof errorData === 'string') {
          errorMessage = errorData;
        }
      }
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="login-container">
      <section className="login-card">
        <h1>Welcome Back</h1>
        <p className="subtitle">Sign in to your account</p>

        {error && <div className="error-message" role="alert">{error}</div>}

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              autoComplete="username"
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="Enter your email"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              autoComplete="current-password"
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              placeholder="Enter your password"
            />
          </div>

          <button type="submit" className="login-button" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <p className="register-link">
          Don't have an account? <Link to="/register">Register here</Link>
        </p>
      </section>
    </main>
  );
}

export default LoginPage;