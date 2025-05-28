import axios from 'axios';

// Create axios instance with absolute URL
const api = axios.create({
  baseURL: 'http://127.0.0.1:8000',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor for debugging
api.interceptors.request.use(request => {
  console.log('Starting Request:', request);
  return request;
});

// Add response interceptor for debugging
api.interceptors.response.use(
  response => {
    console.log('Response:', response);
    return response;
  },
  error => {
    console.error('Response Error:', error);
    return Promise.reject(error);
  }
);

export const setAuthToken = (token) => {
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common['Authorization'];
  }
};

// API functions
export const registerCandidate = (data) => {
  console.log('Registering candidate with data:', data);
  return api.post('/api/auth/candidate/register/', data);
};

export const registerCompany = (data) => {
  console.log('Registering company with data:', data);
  return api.post('/api/auth/company/register/', data);
};

export const login = (data) => {
  console.log('Logging in with data:', data);
  return api.post('/api/token/', data);
};

export const refreshToken = (refresh) => {
  return api.post('/api/token/refresh/', { refresh });
};

export const getCurrentUser = () => {
  return api.get('/api/auth/me/');
};

// Resume upload
export const uploadResume = (formData) => {
  return api.post('/api/matcher/upload/resume/', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

// Job description upload
export const uploadJobDescription = (formData) => {
  return api.post('/api/matcher/upload/job-description/', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

// Get similarity scores
export const getSimilarityScores = (params = {}) => {
  return api.get('/api/matcher/similarity-scores/', { params });
};

export default api;