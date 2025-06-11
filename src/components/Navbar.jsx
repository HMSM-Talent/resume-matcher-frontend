import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './Navbar.css';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="logo">
          HMSM Talent
        </Link>
        
        <button className="menu-toggle" onClick={toggleMenu}>
          <span className={`hamburger ${isMenuOpen ? 'open' : ''}`}></span>
        </button>

        <div className={`nav-links ${isMenuOpen ? 'active' : ''}`}>
          <Link to="/" className="nav-link" onClick={() => setIsMenuOpen(false)}>Home</Link>
          <Link to="/hiring-history" className="nav-link" onClick={() => setIsMenuOpen(false)}>Hiring History</Link>
          <Link to="/application-history" className="nav-link" onClick={() => setIsMenuOpen(false)}>Application History</Link>
          <Link to="/login" className="nav-link" onClick={() => setIsMenuOpen(false)}>Login</Link>
          <Link to="/register" className="btn-register" onClick={() => setIsMenuOpen(false)}>Register</Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar; 