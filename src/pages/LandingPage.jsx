import React from 'react';
import { Link } from 'react-router-dom';
import './LandingPage.css';

const LandingPage = () => {
  return (
    <div className="landing-container">
      {/* Navbar */}
      <nav className="landing-nav">
        <div className="logo">HMSM Talent</div>
        <div className="nav-links">
          <Link to="/login">Login</Link>
          <Link to="/register" className="register-btn">Register</Link>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="hero-section">
        <h1>Find Your Perfect Match</h1>
        <p>AI-powered platform that connects top candidates with ideal job opportunities.</p>
        <div className="cta-buttons">
          <Link to="/register" className="btn-primary">Get Started</Link>
          <Link to="/login" className="btn-secondary">Sign In</Link>
        </div>
      </header>

      {/* Features */}
      <section className="features">
        <h2>Why Choose HMSM Talent?</h2>
        <div className="feature-grid">
          <div className="feature-item">
            <span>🎯</span>
            <h3>AI Matching</h3>
            <p>Smart resume and job match scores using ML.</p>
          </div>
          <div className="feature-item">
            <span>⚡</span>
            <h3>Fast Processing</h3>
            <p>Instant match results and fast application flow.</p>
          </div>
          <div className="feature-item">
            <span>📊</span>
            <h3>Insightful Analytics</h3>
            <p>Track performance and understand what companies want.</p>
          </div>
          <div className="feature-item">
            <span>🔒</span>
            <h3>Secure Platform</h3>
            <p>Your data is protected with enterprise-grade security.</p>
          </div>
          <div className="feature-item">
            <span>🤝</span>
            <h3>Smart Networking</h3>
            <p>Connect with the right professionals and opportunities.</p>
          </div>
          <div className="feature-item">
            <span>📈</span>
            <h3>Career Growth</h3>
            <p>Continuous learning and development opportunities.</p>
          </div>
          <div className="feature-item">
            <span>🌐</span>
            <h3>Global Reach</h3>
            <p>Access opportunities from companies worldwide.</p>
          </div>
          <div className="feature-item">
            <span>💼</span>
            <h3>Job Alerts</h3>
            <p>Get notified about matching opportunities instantly.</p>
          </div>
          <div className="feature-item">
            <span>📱</span>
            <h3>Mobile Friendly</h3>
            <p>Access the platform anytime, anywhere.</p>
          </div>
        </div>
      </section>

      {/* Customer Reviews */}
      <section className="reviews-section">
        <h2>What Our Users Say</h2>
        <div className="reviews-grid">
          <div className="review-card">
            <div className="review-header">
              <div className="reviewer-avatar"></div>
              <div className="reviewer-info">
                <h4>Sarah Johnson</h4>
                <p>Software Engineer</p>
              </div>
            </div>
            <div className="review-content">
              "HMSM Talent helped me find my dream job! The AI matching was incredibly accurate and saved me so much time in my job search."
            </div>
            <div className="review-rating">★★★★★</div>
          </div>

          <div className="review-card">
            <div className="review-header">
              <div className="reviewer-avatar"></div>
              <div className="reviewer-info">
                <h4>Michael Chen</h4>
                <p>HR Manager</p>
              </div>
            </div>
            <div className="review-content">
              "As a recruiter, this platform has revolutionized our hiring process. The quality of matches is outstanding!"
            </div>
            <div className="review-rating">★★★★★</div>
          </div>

          <div className="review-card">
            <div className="review-header">
              <div className="reviewer-avatar"></div>
              <div className="reviewer-info">
                <h4>Emily Rodriguez</h4>
                <p>Product Manager</p>
              </div>
            </div>
            <div className="review-content">
              "The analytics features give me great insights into what employers are looking for. Highly recommended!"
            </div>
            <div className="review-rating">★★★★★</div>
          </div>
        </div>
      </section>

      {/* Quick Links */}
      <section className="quick-links">
        <h3>Quick Links</h3>
        <div className="links-grid">
          <div className="link-column">
            <h4>Candidates</h4>
            <ul>
              <li><Link to="/register">Create Account</Link></li>
              <li><Link to="/login">Sign In</Link></li>
              <li><Link to="/dashboard">View Dashboard</Link></li>
              <li><Link to="/history">Application History</Link></li>
            </ul>
          </div>
          <div className="link-column">
            <h4>Companies</h4>
            <ul>
              <li><Link to="/register">Post Jobs</Link></li>
              <li><Link to="/login">Company Login</Link></li>
              <li><Link to="/dashboard">View Candidates</Link></li>
              <li><Link to="/history">Hiring History</Link></li>
            </ul>
          </div>
          <div className="link-column">
            <h4>Resources</h4>
            <ul>
              <li><Link to="/help">About</Link></li>
              <li><Link to="/privacy">Privacy</Link></li>
              <li><Link to="/contact">Contact Us</Link></li>
              <li><Link to="/terms">Terms & Conditions</Link></li>
            </ul>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div>© 2025 HMSM Talent | Contact: support@hmsmtalent.com</div>
      </footer>
    </div>
  );
};

export default LandingPage;
