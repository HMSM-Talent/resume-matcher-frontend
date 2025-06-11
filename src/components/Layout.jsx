import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCurrentUser } from '../api/api';
import Navbar from './Navbar';
import '../styles/Layout.css';

function Layout({ children }) {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await getCurrentUser();
        console.log('User data:', response.data); // Debug log
        setUser(response.data);
      } catch (err) {
        console.error('Error fetching user:', err); // Debug log
        setError(err.message || 'Failed to load user data');
        if (err.response?.status === 401) {
          navigate('/login');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [navigate]);

  if (loading) {
    return (
      <div className="layout">
        <div className="loading">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="layout">
        <div className="error-message">{error}</div>
      </div>
    );
  }

  return (
    <div className="layout">
      <Navbar user={user} />
      <main className="main-content">
        {children}
      </main>
    </div>
  );
}

export default Layout; 