import { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const response = await api.get('/accounts/me/');
      setUser(response.data);
    } catch (error) {
      // If token is invalid, clear it
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    const response = await api.post('/accounts/login/', { email, password });
    const { access, refresh } = response.data;
    
    localStorage.setItem('accessToken', access);
    localStorage.setItem('refreshToken', refresh);
    
    await checkAuth();
  };

  const register = async (userData) => {
    const response = await api.post('/accounts/register/', userData);
    const { access, refresh } = response.data;
    
    localStorage.setItem('accessToken', access);
    localStorage.setItem('refreshToken', refresh);
    
    await checkAuth();
  };

  const logout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    setUser(null);
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    checkAuth,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default useAuth; 