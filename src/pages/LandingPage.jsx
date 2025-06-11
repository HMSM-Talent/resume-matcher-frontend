import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import './LandingPage.css';
import axios from 'axios';

const LandingPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [jobs, setJobs] = useState([]);
  const [filteredJobs, setFilteredJobs] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/jobs`);
        setJobs(response.data);
      } catch (error) {
        console.error('Error fetching jobs:', error);
      }
    };
    fetchData();
  }, []); // Empty dependency array since we only want to fetch on mount

  const handleSearch = (e) => {
    e.preventDefault();
    const filtered = jobs.filter(job => 
      job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.location.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredJobs(filtered);
  };

  return (
    <div className="landing-container">
      <Navbar />

      {/* Hero Section */}
      <header className="hero-section">
        <div className="hero-content">
          <h1>Find Your Perfect Match</h1>
          <p>Our AI-powered platform helps you discover opportunities that match your skills and aspirations.</p>
          <div className="hero-buttons">
            <Link to="/register" className="get-started-btn">Get Started</Link>
            <Link to="/login" className="sign-in-btn">Sign In</Link>
          </div>
        </div>
      </header>

      {/* Job Search Bar */}
      <section className="search-section">
        <form onSubmit={handleSearch} className="search-form">
          <input
            type="text"
            placeholder="Company / Title / Job"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
          <button type="submit" className="search-button">
            Search Jobs
          </button>
        </form>
      </section>

      {/* Features */}
      <section className="features">
        <h2>Why Choose HMSM Talent?</h2>
        <div className="features-grid">
          <div className="feature-item">
            <span>🎯</span>
            <h3>Smart Matching</h3>
            <p>Our AI Algorithm matches your skills with the perfect job opportunities.</p>
          </div>
          <div className="feature-item">
            <span>⚡</span>
            <h3>Fast Processing</h3>
            <p>Instant match results and fast application flow.</p>
          </div>
          <div className="feature-item">
            <span>📈</span>
            <h3>Career Growth</h3>
            <p>Continuous learning and development opportunities.</p>
          </div>
        </div>
      </section>
    

      
      {/* Footer */}
      <Footer />
    </div>
  );
};

export default LandingPage;




