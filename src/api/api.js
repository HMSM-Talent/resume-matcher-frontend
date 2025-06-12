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

// Response interceptor for automatic token refresh and error handling
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Handle 401 Unauthorized errors
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (!refreshToken) {
          throw new Error('No refresh token available');
        }

        const response = await axios.post(`${api.defaults.baseURL}/auth/token/refresh/`, {
          refresh: refreshToken,
        });

        const { access } = response.data;
        localStorage.setItem('accessToken', access);
        originalRequest.headers.Authorization = `Bearer ${access}`;

        return api(originalRequest);
      } catch (refreshError) {
        // Clear tokens and redirect to login
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('userData');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    // Handle other error cases
    const errorMessage = error.response?.data?.detail || error.response?.data?.error || 'An error occurred';
    error.message = errorMessage;
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
  return api.post('/upload/job-description/', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
      'Accept': 'application/json'
    }
  });
};

// JOB SEARCH AND APPLICATIONS
export const searchJobDescriptions = (params) => {
  return api.get('/job-descriptions/search/', { params });
};

export const getJobDescription = (id) => {
  return api.get(`/job-descriptions/${id}/`);
};

export const getJobDescriptions = (params = {}) => {
  return api.get('/job-descriptions/', { params });
};

export const getJobApplications = async (params = {}) => {
  return api.get('/job-applications/', { params });
};

export const applyForJob = async (jobId) => {
  return api.post(`/job-descriptions/${jobId}/apply/`);
};

// SIMILARITY SCORES
export const getSimilarityScores = (params) => {
  return api.get('/similarity-scores/', { params });
};

// Job Applications API
export const getApplicationHistory = async (filters = {}) => {
  try {
    const params = new URLSearchParams();
    
    // Add status filter if not 'ALL'
    if (filters.status && filters.status !== 'ALL') {
      params.append('status', filters.status);
    }
    
    // Add search term if provided
    if (filters.search) {
      params.append('search', filters.search);
    }
    
    // Add date range filters
    if (filters.startDate) {
      params.append('start_date', filters.startDate);
    }
    if (filters.endDate) {
      params.append('end_date', filters.endDate);
    }
    
    // Add sorting parameters
    if (filters.sortBy) {
      params.append('ordering', filters.order === 'desc' ? `-${filters.sortBy}` : filters.sortBy);
    }
    
    const response = await api.get(`/applications/history/?${params.toString()}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const withdrawApplication = async (applicationId) => {
  return api.post(`/applications/${applicationId}/withdraw/`);
};

// Company Dashboard API
export const getCompanyActiveJobs = async () => {
  return await api.get('/company/dashboard/');
};

export const reviewApplication = async (applicationId, data) => {
  return await api.post(`/applications/${applicationId}/review/`, data);
};

export const closeJob = async (jobId, data) => {
  return await api.post(`/job-descriptions/${jobId}/close/`, data);
};

// Company History API
export const getCompanyJobHistory = async (params = {}) => {
  return api.get('/company/jobs/history/', { params });
};

export const reopenJob = async (jobId) => {
  return api.post(`/jobs/${jobId}/reopen/`);
};

export const exportJobApplications = async (jobId) => {
  return api.get(`/jobs/${jobId}/applications/export/`);
};

export const getCompanyHistory = async (params = {}) => {
  return await api.get('/company/history/', { params });
};

export default api;