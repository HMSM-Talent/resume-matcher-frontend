import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

export const setAuthToken = (token) => {
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common['Authorization'];
  }
};

// API functions
export const registerCandidate = (data) => {
  return api.post('/accounts/candidate/register/', data);
};

export const registerCompany = (data) => {
  return api.post('/accounts/company/register/', data);
};

export const login = (data) => {
  return api.post('/accounts/token/', data);
};

export const refreshToken = (refresh) => {
  return api.post('/accounts/token/refresh/', { refresh });
};

export const getCurrentUser = () => {
  return api.get('/accounts/me/');
};

export default api;