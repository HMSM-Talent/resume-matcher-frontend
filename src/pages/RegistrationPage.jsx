import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { registerCandidate, registerCompany } from '../api/api';
import './RegistrationPage.css';

function RegistrationPage() {
  const navigate = useNavigate();
  const [userType, setUserType] = useState('candidate'); // 'candidate' or 'company'
  const [formData, setFormData] = useState({
    // Common fields
    email: '',
    password: '',
    password2: '', // Added for password confirmation
    phone_number: '',
    first_name: '',
    last_name: '',
    
    // Company fields
    company_name: '',
    industry: '',
    company_size: '',
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
    setUserType(e.target.value);
    // Reset form data when switching user types
    setFormData({
      email: '',
      password: '',
      password2: '',
      phone_number: '',
      first_name: '',
      last_name: '',
      company_name: '',
      industry: '',
      company_size: '',
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
    if (userType === 'candidate') {
      if (!formData.first_name || !formData.last_name) {
        setError('First name and last name are required');
        return false;
      }
    } else {
      if (!formData.company_name || !formData.industry) {
        setError('Company name and industry are required');
        return false;
      }
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      // Prepare registration data based on user type
      const registrationData = {
        email: formData.email,
        password: formData.password,
        phone_number: formData.phone_number,
      };

      if (userType === 'candidate') {
        registrationData.first_name = formData.first_name;
        registrationData.last_name = formData.last_name;
      } else {
        registrationData.company_name = formData.company_name;
        registrationData.industry = formData.industry;
        registrationData.company_size = formData.company_size;
      }
      
      console.log('Submitting registration with data:', registrationData);
      
      // Use the appropriate registration function based on user type
      const response = userType === 'candidate' 
        ? await registerCandidate(registrationData)
        : await registerCompany(registrationData);
      
      console.log('Registration response:', response);
      
      const { access, refresh } = response.data;
      
      // Store tokens
      localStorage.setItem('accessToken', access);
      localStorage.setItem('refreshToken', refresh);
      
      // Redirect to dashboard
      navigate('/dashboard');
    } catch (err) {
      console.error('Registration error:', err);
      // Enhanced error handling to show more detailed error messages
      const errorData = err.response?.data;
      let errorMessage = 'Registration failed. Please try again.';
      
      if (errorData) {
        if (typeof errorData === 'object') {
          // Handle multiple validation errors
          const errorMessages = Object.entries(errorData)
            .map(([field, messages]) => `${field}: ${Array.isArray(messages) ? messages.join(', ') : messages}`)
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

          {/* Common fields */}
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

          {/* Candidate-specific fields */}
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

          {/* Company-specific fields */}
          {userType === 'company' && (
            <>
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

              <div className="form-group">
                <label htmlFor="industry">Industry</label>
                <input
                  type="text"
                  id="industry"
                  name="industry"
                  value={formData.industry}
                  onChange={handleChange}
                  required
                  placeholder="Enter your industry"
                />
              </div>

              <div className="form-group">
                <label htmlFor="company_size">Company Size</label>
                <select
                  id="company_size"
                  name="company_size"
                  value={formData.company_size}
                  onChange={handleChange}
                >
                  <option value="">Select company size</option>
                  <option value="1-10">1-10 employees</option>
                  <option value="11-50">11-50 employees</option>
                  <option value="51-200">51-200 employees</option>
                  <option value="201-500">201-500 employees</option>
                  <option value="501+">501+ employees</option>
                </select>
              </div>
            </>
          )}

          {/* Password fields */}
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