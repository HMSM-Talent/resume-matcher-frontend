import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { registerCandidate, registerCompany } from '../api/api';
import '../styles/Dashboard.css';

function RegistrationPage() {
  const navigate = useNavigate();
  const [userType, setUserType] = useState('candidate');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    password2: '',
    first_name: '',
    last_name: '',
    phone_number: '',
    company_name: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleUserTypeChange = (e) => {
    const newType = e.target.value;
    setUserType(newType);
    setFormData({
      email: '',
      password: '',
      password2: '',
      first_name: '',
      last_name: '',
      phone_number: '',
      company_name: ''
    });
  };

  const validateForm = () => {
    if (formData.password !== formData.password2) {
      setError('Passwords do not match');
      return false;
    }
    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters long');
      return false;
    }

    if (userType === 'candidate' && (!formData.first_name || !formData.last_name)) {
      setError('First name and last name are required for candidates');
      return false;
    }

    if (userType === 'company' && !formData.company_name) {
      setError('Company name is required for companies');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
  
    if (!validateForm()) return;
    setLoading(true);
  
    try {
      let payload;
      let response;
  
      if (userType === 'candidate') {
        payload = {
          email: formData.email,
          password: formData.password,
          password2: formData.password2,
          first_name: formData.first_name,
          last_name: formData.last_name,
          profile: {
            phone_number: formData.phone_number,
          }
        };
        response = await registerCandidate(payload);
      } else {
        payload = {
          email: formData.email,
          password: formData.password,
          password2: formData.password2,
          profile: {
            phone_number: formData.phone_number,
            company_name: formData.company_name
          }
        };
        response = await registerCompany(payload);
      }
  
      const { access, refresh, user } = response.data;
      localStorage.setItem('accessToken', access);
      localStorage.setItem('refreshToken', refresh);
      localStorage.setItem('userData', JSON.stringify(user));

      if (user.role === 'candidate') {
        navigate('/candidate/dashboard');
      } else if (user.role === 'company') {
        navigate('/company/dashboard');
      } else {
        navigate('/dashboard');
      }
  
    } catch (err) {
      const errorData = err.response?.data;
      let errorMessage = 'Registration failed. Please try again.';
  
      if (errorData) {
        if (typeof errorData === 'object') {
          const errorMessages = Object.entries(errorData)
            .map(([field, messages]) =>
              `${field}: ${Array.isArray(messages) ? messages.join(', ') : messages}`
            )
            .join('\n');
          errorMessage = errorMessages || errorData.detail || errorMessage;
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
          maxWidth: '600px', 
          width: '100%',
          margin: '2rem auto',
          padding: '2.5rem',
          backgroundColor: '#ffffff',
          borderRadius: '12px',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
        }}>
          <div className="dashboard-header" style={{ marginBottom: '2rem', textAlign: 'center' }}>
            <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Create Account</h1>
            <p className="subtitle" style={{ fontSize: '1.1rem', color: '#666' }}>Join our platform today</p>
          </div>

          <div className="filters-section" style={{ padding: '0 1rem' }}>
            {error && <div className="error-message" role="alert" style={{ marginBottom: '1.5rem' }}>{error}</div>}

            <form onSubmit={handleSubmit} className="space-y-4" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div className="filter-group" style={{ marginBottom: '1rem' }}>
                <label style={{ fontSize: '1rem', marginBottom: '0.75rem', display: 'block' }}>I am a:</label>
                <div className="flex gap-4" style={{ display: 'flex', gap: '1rem' }}>
                  <label className="flex items-center gap-2 cursor-pointer" style={{ flex: 1 }}>
                    <input
                      type="radio"
                      name="userType"
                      value="candidate"
                      checked={userType === 'candidate'}
                      onChange={handleUserTypeChange}
                      style={{ width: '1.25rem', height: '1.25rem' }}
                    />
                    <span style={{ fontSize: '1rem' }}>Candidate</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer" style={{ flex: 1 }}>
                    <input
                      type="radio"
                      name="userType"
                      value="company"
                      checked={userType === 'company'}
                      onChange={handleUserTypeChange}
                      style={{ width: '1.25rem', height: '1.25rem' }}
                    />
                    <span style={{ fontSize: '1rem' }}>Company</span>
                  </label>
                </div>
              </div>

              <div className="filter-group" style={{ marginBottom: '0.5rem' }}>
                <label htmlFor="email" style={{ fontSize: '1rem', marginBottom: '0.5rem', display: 'block' }}>Email</label>
                <input
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

              {userType === 'candidate' && (
                <>
                  <div className="filter-group" style={{ marginBottom: '0.5rem' }}>
                    <label htmlFor="first_name" style={{ fontSize: '1rem', marginBottom: '0.5rem', display: 'block' }}>First Name</label>
                    <input
                      type="text"
                      id="first_name"
                      name="first_name"
                      value={formData.first_name}
                      onChange={handleChange}
                      required
                      placeholder="Enter your first name"
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
                    <label htmlFor="last_name" style={{ fontSize: '1rem', marginBottom: '0.5rem', display: 'block' }}>Last Name</label>
                    <input
                      type="text"
                      id="last_name"
                      name="last_name"
                      value={formData.last_name}
                      onChange={handleChange}
                      required
                      placeholder="Enter your last name"
                      style={{ 
                        width: '100%',
                        padding: '0.75rem 1rem',
                        fontSize: '1rem',
                        borderRadius: '8px',
                        border: '1px solid #e2e8f0'
                      }}
                    />
                  </div>
                </>
              )}

              {userType === 'company' && (
                <div className="filter-group" style={{ marginBottom: '0.5rem' }}>
                  <label htmlFor="company_name" style={{ fontSize: '1rem', marginBottom: '0.5rem', display: 'block' }}>Company Name</label>
                  <input
                    type="text"
                    id="company_name"
                    name="company_name"
                    value={formData.company_name}
                    onChange={handleChange}
                    required
                    placeholder="Enter your company name"
                    style={{ 
                      width: '100%',
                      padding: '0.75rem 1rem',
                      fontSize: '1rem',
                      borderRadius: '8px',
                      border: '1px solid #e2e8f0'
                    }}
                  />
                </div>
              )}

              <div className="filter-group" style={{ marginBottom: '0.5rem' }}>
                <label htmlFor="password" style={{ fontSize: '1rem', marginBottom: '0.5rem', display: 'block' }}>Password</label>
                <input
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

              <div className="filter-group" style={{ marginBottom: '0.5rem' }}>
                <label htmlFor="confirmPassword" style={{ fontSize: '1rem', marginBottom: '0.5rem', display: 'block' }}>Confirm Password</label>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.password2}
                  onChange={handleChange}
                  required
                  placeholder="Confirm your password"
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
                    textAlign: 'center'
                  }}
                >
                  {loading ? 'Creating Account...' : 'Create Account'}
                </button>
              </div>

              <p className="text-center text-gray-600 mt-6" style={{ fontSize: '1rem' }}>
                Already have an account?{' '}
                <Link to="/" className="text-blue-600 hover:underline" style={{ fontWeight: '500', cursor: 'pointer' }}>
                  Sign in here
                </Link>
              </p>
            </form>
          </div>
        </main>
      </div>
    </div>
  );
}

export default RegistrationPage;