import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { registerCandidate, registerCompany } from '../api/api';
import './RegistrationPage.css';

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
  
      const { access, refresh } = response.data;
      localStorage.setItem('accessToken', access);
      localStorage.setItem('refreshToken', refresh);
      navigate('/dashboard');
  
    } catch (err) {
      console.error('Full Registration Error:', err);
  
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
        } else if (errorData.detail) {
          errorMessage = errorData.detail;
        }
      }
  
      setError(errorMessage);
  
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-container">
      <div className="register-card">
        <h1>Create Account</h1>
        <p className="subtitle">Join our platform today</p>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit} className="register-form">
          <div className="form-group">
            <label htmlFor="userType">I am a:</label>
            <select
              id="userType"
              name="userType"
              value={userType}
              onChange={handleUserTypeChange}
              required
            >
              <option value="candidate">Job Seeker</option>
              <option value="company">Company</option>
            </select>
          </div>

          {userType === 'candidate' && (
            <>
              <div className="form-group">
                <label htmlFor="first_name">First Name</label>
                <input
                  type="text"
                  id="first_name"
                  name="first_name"
                  value={formData.first_name}
                  onChange={handleChange}
                  required
                  placeholder="Enter your first name"
                />
              </div>

              <div className="form-group">
                <label htmlFor="last_name">Last Name</label>
                <input
                  type="text"
                  id="last_name"
                  name="last_name"
                  value={formData.last_name}
                  onChange={handleChange}
                  required
                  placeholder="Enter your last name"
                />
              </div>
            </>
          )}

          {userType === 'company' && (
            <div className="form-group">
              <label htmlFor="company_name">Company Name</label>
              <input
                type="text"
                id="company_name"
                name="company_name"
                value={formData.company_name}
                onChange={handleChange}
                required
                placeholder="Enter your company name"
              />
            </div>
          )}

          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
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
            <label htmlFor="phone_number">Phone Number</label>
            <input
              type="tel"
              id="phone_number"
              name="phone_number"
              value={formData.phone_number}
              onChange={handleChange}
              placeholder="Enter your phone number"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              placeholder="Create a password"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password2">Confirm Password</label>
            <input
              type="password"
              id="password2"
              name="password2"
              value={formData.password2}
              onChange={handleChange}
              required
              placeholder="Confirm your password"
            />
          </div>

          <button
            type="submit"
            className="register-button"
            disabled={loading}
          >
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>

        <p className="login-link">
          Already have an account?{' '}
          <Link to="/">Sign in here</Link>
        </p>
      </div>
    </div>
  );
}

export default RegistrationPage;