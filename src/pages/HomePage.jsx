import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/Home.css';

function HomePage() {
  return (
    <div className="home-container">
      <header className="hero">
        <h1>Welcome to Resume Matcher</h1>
        <p>Find your perfect job match or hire the best talent</p>
        <div className="cta-buttons">
          <Link to="/register" className="btn btn-primary">Get Started</Link>
          <Link to="/login" className="btn btn-secondary">Sign In</Link>
        </div>
      </header>

      <section className="features">
        <div className="feature-card">
          <h3>For Candidates</h3>
          <ul>
            <li>Upload your resume</li>
            <li>Search for matching jobs</li>
            <li>Track your applications</li>
            <li>Get personalized job recommendations</li>
          </ul>
        </div>

        <div className="feature-card">
          <h3>For Companies</h3>
          <ul>
            <li>Post job descriptions</li>
            <li>Find matching candidates</li>
            <li>Review applications</li>
            <li>Manage your hiring process</li>
          </ul>
        </div>
      </section>

      <section className="how-it-works">
        <h2>How It Works</h2>
        <div className="steps">
          <div className="step">
            <div className="step-number">1</div>
            <h3>Create Account</h3>
            <p>Sign up as a candidate or company</p>
          </div>
          <div className="step">
            <div className="step-number">2</div>
            <h3>Upload Content</h3>
            <p>Add your resume or job description</p>
          </div>
          <div className="step">
            <div className="step-number">3</div>
            <h3>Find Matches</h3>
            <p>Get AI-powered matching results</p>
          </div>
        </div>
      </section>
    </div>
  );
}

export default HomePage; 