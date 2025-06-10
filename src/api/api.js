import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to attach JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for automatic token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const refreshToken = localStorage.getItem('refreshToken');
        const response = await axios.post(`${api.defaults.baseURL}/auth/token/refresh/`, {
          refresh: refreshToken,
        });

        const { access } = response.data;
        localStorage.setItem('accessToken', access);
        originalRequest.headers.Authorization = `Bearer ${access}`;

        return api(originalRequest);
      } catch (refreshError) {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        window.location.href = '/';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// AUTHENTICATION
export const registerCandidate = (data) => {
  return api.post('/auth/candidate/register/', data);
};

export const registerCompany = (data) => {
  return api.post('/auth/company/register/', data);
};

export const login = (data) => {
  return api.post('/auth/login/', data);
};

export const refreshToken = (refresh) => {
  return api.post('/auth/token/refresh/', { refresh });
};

export const getCurrentUser = () => {
  return api.get('/auth/me/');
};

export const updateUserProfile = (userData) => {
  return api.patch('/auth/me/', userData);
};

// FILE UPLOADS
export const uploadResume = (formData) => {
  return api.post('/upload/resume/', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
};

export const uploadJobDescription = (formData) => {
  // Log the FormData contents for debugging
  for (let pair of formData.entries()) {
    console.log(pair[0] + ': ' + pair[1]);
  }

  return api.post('/upload/job-description/', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
      'Accept': 'application/json'
    }
  });
};

export const getSimilarityScores = () => {
  return api.get('/similarity-scores/', {
    params: {
      candidate_id: JSON.parse(localStorage.getItem('userData'))?.id
    }
  });
};

// JOB APPLICATIONS
export const applyForJob = (jobId) => {
  return api.post(`/jobs/job/${jobId}/apply/`);
};

// JOB SEARCH
export const searchJobs = (query = '', page = 1) => {
  const params = {};
  if (query) params.q = query;
  if (page > 1) params.page = page;
  
  return api.get('/jobs/search/', { params });
};

export default api;