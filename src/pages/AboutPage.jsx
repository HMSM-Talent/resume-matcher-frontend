import React from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import './AboutPage.css';

const AboutPage = () => {
  return (
    <div className="page-container">
      <Navbar />
      <div className="about-container">
        <div className="about-header">
          <h1>About HMSM Talent</h1>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default AboutPage; 