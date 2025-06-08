import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { login } from '../api/api';
import '../styles/Dashboard.css';

function LoginPage() {
  const navigate = useNavigate();
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
      const response = await login(formData);
      const { access, refresh, user } = response.data;

      // Store tokens
      localStorage.setItem('accessToken', access);
      localStorage.setItem('refreshToken', refresh);
      
      // Store complete user data
      const userData = {
        ...user,
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        email: user.email,
        role: user.role,
        company_name: user.company_name || '',
        phone_number: user.phone_number || ''
      };
      localStorage.setItem('userData', JSON.stringify(userData));

      // Dynamic redirection based on user role
      if (user.role === 'candidate') {
        navigate('/candidate/dashboard');
      } else if (user.role === 'company') {
        navigate('/company/dashboard');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
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
    <div className="dashboard-container">
      <div className="dashboard-content" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {/* Main Content */}
        <main className="dashboard-main" style={{ 
          maxWidth: '480px', 
          width: '100%',
          margin: '2rem auto',
          padding: '2.5rem',
          backgroundColor: '#ffffff',
          borderRadius: '12px',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
        }}>
          <div className="dashboard-header" style={{ marginBottom: '2rem', textAlign: 'center' }}>
            <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Welcome Back</h1>
            <p className="subtitle" style={{ fontSize: '1.1rem', color: '#666' }}>Sign in to your account</p>
          </div>

          <div className="filters-section" style={{ padding: '0 1rem' }}>
            {error && <div className="error-message" role="alert" style={{ marginBottom: '1.5rem' }}>{error}</div>}

            <form onSubmit={handleSubmit} className="space-y-4" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div className="filter-group" style={{ marginBottom: '0.5rem' }}>
                <label htmlFor="email" style={{ fontSize: '1rem', marginBottom: '0.5rem', display: 'block' }}>Email</label>
                <input
                  autoComplete="username"
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  placeholder="Enter your email"
                  style={{ 
                    width: '100%',
                    padding: '0.75rem 1rem',
                    fontSize: '1rem',
                    borderRadius: '8px',
                    border: '1px solid #e2e8f0'
                  }}
                />
              </div>

              <div className="filter-group" style={{ marginBottom: '0.5rem' }}>
                <label htmlFor="password" style={{ fontSize: '1rem', marginBottom: '0.5rem', display: 'block' }}>Password</label>
                <input
                  autoComplete="current-password"
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  placeholder="Enter your password"
                  style={{ 
                    width: '100%',
                    padding: '0.75rem 1rem',
                    fontSize: '1rem',
                    borderRadius: '8px',
                    border: '1px solid #e2e8f0'
                  }}
                />
              </div>

              <div className="button-group" style={{
                marginTop: '1rem',
                display: 'flex',
                justifyContent: 'center',
                width: '100%'
              }}>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={loading}
                  style={{
                    width: '50%',
                    padding: '0.875rem',
                    fontSize: '1.1rem',
                    fontWeight: '600',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center'
                  }}
                >
                  {loading ? 'Signing in...' : 'Sign In'}
                </button>
              </div>

              <p className="text-center text-gray-600 mt-6" style={{ fontSize: '1rem' }}>
                Don't have an account?{' '}
                <Link to="/register" className="text-blue-600 hover:underline" style={{ fontWeight: '500', cursor: 'pointer' }}>
                  Register here
                </Link>
              </p>
            </form>
          </div>
        </main>
      </div>
    </div>
  );
}

export default LoginPage;