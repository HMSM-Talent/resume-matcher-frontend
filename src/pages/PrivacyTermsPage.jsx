import React from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import './PrivacyTermsPage.css';

const PrivacyTermsPage = () => {
  return (
    <div className="page-container">
      <Navbar />
      <div className="privacy-terms-container">
        <h1>Privacy Policy & Terms of Service</h1>
      </div>
      <Footer />
    </div>
  );
};

export default PrivacyTermsPage; 