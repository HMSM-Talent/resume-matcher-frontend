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

function PrivateRoute({ children, allowedRoles }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role.toLowerCase())) {
    return <Navigate to="/" />;
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
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      
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