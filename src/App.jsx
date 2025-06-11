import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegistrationPage from './pages/RegistrationPage';
import ContactPage from './pages/ContactPage';
import CandidateHistoryPage from './pages/HistoryPage';
import CompanyHistoryPage from './pages/CompanyHistoryPage';
import AboutPage from './pages/AboutPage';
import PrivacyTermsPage from './pages/PrivacyTermsPage';
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegistrationPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/application-history" element={<CandidateHistoryPage />} />
          <Route path="/hiring-history" element={<CompanyHistoryPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/privacy-terms" element={<PrivacyTermsPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;