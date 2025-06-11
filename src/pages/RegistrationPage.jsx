import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import './RegistrationPage.css';

function RegistrationPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    userType: 'candidate' // default to candidate
  });
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
    if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = validateForm();
    
    if (Object.keys(newErrors).length === 0) {
      try {
        // TODO: Add your API call here
        console.log('Form submitted:', formData);
        navigate('/login'); // Redirect to login page after successful registration
      } catch (error) {
        console.error('Registration error:', error);
        setErrors({ submit: 'Registration failed. Please try again.' });
      }
    } else {
      setErrors(newErrors);
    }
  };

  return (
    <div className="page-container">
      <Navbar />
      <div className="registration-page">
        <div className="registration-container">
          <div className="registration-header">
            <h1>Create Your Account</h1>
            <p>Join HMSM Talent to find your perfect match</p>
          </div>

          <form onSubmit={handleSubmit} className="registration-form">
            <div className="form-group">
              <label htmlFor="firstName">First Name</label>
              <input
                type="text"
                id="firstName"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                className={errors.firstName ? 'error' : ''}
              />
              {errors.firstName && <span className="error-message">{errors.firstName}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="lastName">Last Name</label>
              <input
                type="text"
                id="lastName"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                className={errors.lastName ? 'error' : ''}
              />
              {errors.lastName && <span className="error-message">{errors.lastName}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={errors.email ? 'error' : ''}
              />
              {errors.email && <span className="error-message">{errors.email}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className={errors.password ? 'error' : ''}
              />
              {errors.password && <span className="error-message">{errors.password}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword">Confirm Password</label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                className={errors.confirmPassword ? 'error' : ''}
              />
              {errors.confirmPassword && <span className="error-message">{errors.confirmPassword}</span>}
            </div>

            <div className="form-group">
              <label>I am a:</label>
              <div className="user-type-options">
                <label className="radio-label">
                  <input
                    type="radio"
                    name="userType"
                    value="candidate"
                    checked={formData.userType === 'candidate'}
                    onChange={handleChange}
                  />
                  Job Seeker
                </label>
                <label className="radio-label">
                  <input
                    type="radio"
                    name="userType"
                    value="company"
                    checked={formData.userType === 'company'}
                    onChange={handleChange}
                  />
                  Company
                </label>
              </div>
            </div>

            {errors.submit && <div className="error-message submit-error">{errors.submit}</div>}

            <button type="submit" className="submit-button">Create Account</button>
          </form>

          <div className="login-link">
            Already have an account? <Link to="/login">Sign in</Link>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}

export default RegistrationPage;