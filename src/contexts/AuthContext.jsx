import { createContext, useContext, useState, useEffect } from 'react';
import { getCurrentUser, refreshToken } from '../api/api';

// Create the context with a default value
const AuthContext = createContext({
  user: null,
  loading: true,
  error: null,
  login: () => {},
  logout: () => {},
});

// Create the provider component
const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const checkTokenExpiration = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) return false;

      // Try to get current user to validate token
      const response = await getCurrentUser();
      setUser(response.data);
      return true;
    } catch (err) {
      console.error('Token validation error:', err);
      return false;
    }
  };

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const isValid = await checkTokenExpiration();
        if (!isValid) {
          console.log('No valid token found');
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          localStorage.removeItem('userData');
        }
      } catch (err) {
        console.error('Auth initialization error:', err);
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('userData');
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = async (userData, accessToken, refreshToken) => {
    try {
      console.log('Login called with:', { userData, accessToken, refreshToken });
      setUser(userData);
      localStorage.setItem('accessToken', accessToken);
      if (refreshToken) {
        localStorage.setItem('refreshToken', refreshToken);
      }
      localStorage.setItem('userData', JSON.stringify(userData));
      console.log('Login successful, user data stored');
    } catch (err) {
      console.error('Login error:', err);
      throw err;
    }
  };

  const logout = () => {
    console.log('Logout called');
    setUser(null);
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('userData');
  };

  const value = {
    user,
    loading,
    error,
    login,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

// Create the hook
const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Export everything as a single object
export {
  AuthContext,
  AuthProvider,
  useAuth,
}; 