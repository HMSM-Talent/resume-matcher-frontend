import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegistrationPage';
import DashboardPage from './pages/CompanyDashboardPage';
import HistoryPage from './pages/HistoryPage';
import UploadResumePage from './pages/UploadResumePage';
import UploadJDPage from './pages/UploadJDPage';
import CandidateDashboardPage from './pages/CandidateDashboardPage';
import CompanyDashboardPage from './pages/CompanyDashboardPage';
import JobSearchPage from './pages/JobSearchPage';
import CompanyJobDetailPage from './pages/CompanyJobDetailPage';

import './App.css';

// Protected Route component
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('accessToken');
  
  if (!token) {
    return <Navigate to="/" replace />;
  }

  return children;
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/jobs" element={<JobSearchPage />} />
          <Route path="/candidate/dashboard" element={<CandidateDashboardPage />} />
          <Route path="/company/dashboard" element={<CompanyDashboardPage />} />
          <Route path="/company/jobs/:jobId" element={<CompanyJobDetailPage />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/history"
            element={
              <ProtectedRoute>
                <HistoryPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/upload-resume"
            element={
              <ProtectedRoute>
                <UploadResumePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/upload-jd"
            element={
              <ProtectedRoute>
                <UploadJDPage />
              </ProtectedRoute>
            }
          />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;