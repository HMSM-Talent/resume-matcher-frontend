import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegistrationPage';
import CandidateDashboardPage from './pages/CandidateDashboardPage';
import CompanyDashboardPage from './pages/CompanyDashboardPage';
import SearchJobsPage from './pages/SearchJobsPage';
import UploadResumePage from './pages/UploadResumePage';
import UploadJDPage from './pages/UploadJDPage';
import HomePage from './pages/HomePage';
import Layout from './components/Layout';
import './styles/App.css';
import './styles/Navbar.css';
import './styles/Dashboard.css';
import './styles/SearchJobs.css';
import './styles/Login.css';
import './styles/Register.css';
import './styles/Home.css';
import './styles/Upload.css';
import CandidateHistoryPage from './pages/CandidateHistoryPage';
import CompanyHistoryPage from './pages/CompanyHistoryPage';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function PrivateRoute({ children, allowedRoles }) {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        console.log('No user found, redirecting to login');
        navigate('/login');
      } else if (allowedRoles && !allowedRoles.includes(user.role.toLowerCase())) {
        console.log('User role not allowed, redirecting to home');
        navigate('/');
      }
    }
  }, [user, loading, allowedRoles, navigate]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return null;
  }

  if (allowedRoles && !allowedRoles.includes(user.role.toLowerCase())) {
    return null;
  }

  return <Layout>{children}</Layout>;
}

function AppRoutes() {
  const { user } = useAuth();

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={user ? (
        <Navigate to={user.role.toLowerCase() === 'candidate' ? '/candidate/dashboard' : '/company/dashboard'} />
      ) : (
        <HomePage />
      )} />
      <Route path="/login" element={user ? (
        <Navigate to={user.role.toLowerCase() === 'candidate' ? '/candidate/dashboard' : '/company/dashboard'} />
      ) : (
        <LoginPage />
      )} />
      <Route path="/register" element={user ? (
        <Navigate to={user.role.toLowerCase() === 'candidate' ? '/candidate/dashboard' : '/company/dashboard'} />
      ) : (
        <RegisterPage />
      )} />
      
      {/* Candidate Routes */}
      <Route 
        path="/candidate/dashboard" 
        element={
          <PrivateRoute allowedRoles={['candidate']}>
            <CandidateDashboardPage />
          </PrivateRoute>
        } 
      />
      <Route 
        path="/candidate/search" 
        element={
          <PrivateRoute allowedRoles={['candidate']}>
            <SearchJobsPage />
          </PrivateRoute>
        } 
      />
      <Route 
        path="/candidate/upload" 
        element={
          <PrivateRoute allowedRoles={['candidate']}>
            <UploadResumePage />
          </PrivateRoute>
        } 
      />
      <Route 
        path="/applications/history" 
        element={
          <PrivateRoute allowedRoles={['candidate']}>
            <CandidateHistoryPage />
          </PrivateRoute>
        } 
      />

      {/* Company Routes */}
      <Route 
        path="/company/dashboard" 
        element={
          <PrivateRoute allowedRoles={['company']}>
            <CompanyDashboardPage />
          </PrivateRoute>
        } 
      />
      <Route 
        path="/company/upload" 
        element={
          <PrivateRoute allowedRoles={['company']}>
            <UploadJDPage />
          </PrivateRoute>
        } 
      />
      <Route 
        path="/company/history" 
        element={
          <PrivateRoute allowedRoles={['company']}>
            <CompanyHistoryPage />
          </PrivateRoute>
        } 
      />
    </Routes>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </Router>
  );
}

export default App;