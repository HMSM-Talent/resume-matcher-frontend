import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api';
console.log('API Base URL:', API_URL); // Debug log

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// Request interceptor to attach JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('Request with token:', config.url); // Debug log
    } else {
      console.log('Request without token:', config.url); // Debug log
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for automatic token refresh and error handling
api.interceptors.response.use(
  (response) => {
    console.log('Response received:', response.config.url); // Debug log
    return response;
  },
  async (error) => {
    console.error('API Error:', {
      url: error.config?.url,
      status: error.response?.status,
      data: error.response?.data
    }); // Debug log

    const originalRequest = error.config;

    // Handle 401 Unauthorized errors
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // If token refresh is in progress, queue the request
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(token => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch(err => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (!refreshToken) {
          console.log('No refresh token available, redirecting to login');
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          localStorage.removeItem('userData');
          window.location.href = '/login';
          return Promise.reject(error);
        }

        console.log('Attempting to refresh token...');
        const response = await axios.post(`${API_URL}/auth/token/refresh/`, {
          refresh: refreshToken,
        });

        const { access } = response.data;
        console.log('Token refreshed successfully');
        localStorage.setItem('accessToken', access);
        originalRequest.headers.Authorization = `Bearer ${access}`;

        // Process any queued requests
        processQueue(null, access);
        isRefreshing = false;

        return api(originalRequest);
      } catch (refreshError) {
        console.error('Token refresh failed:', refreshError);
        processQueue(refreshError, null);
        isRefreshing = false;
        
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

export const uploadJobDescription = (data) => {
  // If data is FormData (file upload), use multipart/form-data
  if (data instanceof FormData) {
    return api.post('/upload/job-description/', data, {
      headers: {
        'Content-Type': 'multipart/form-data',
        'Accept': 'application/json'
      }
    });
  }
  // Otherwise, send as JSON
  return api.post('/upload/job-description/', data);
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

export const getJobApplications = async (jobId = null) => {
  if (jobId) {
    // For company viewing specific job applications
    return api.get(`/company/job/${jobId}/applications/`);
  } else {
    // For candidate viewing their applications
    return api.get('/applications/history/');
  }
};

export const getAllJobApplications = async (filters = {}) => {
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
    
    return api.get(`/job-applications/?${params.toString()}`);
  } catch (error) {
    throw error;
  }
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

// UUID validation function
const isValidUUID = (uuid) => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
};

// Company Dashboard API
export const getCompanyDashboard = async () => {
  try {
    console.log('Fetching company dashboard data...');
    const response = await api.get('/company/dashboard/');
    console.log('Dashboard API Response:', response);
    console.log('Dashboard Data:', response.data);
    return response;
  } catch (error) {
    console.error('Error in getCompanyDashboard:', error);
    if (error.response) {
      console.error('Error response data:', error.response.data);
      console.error('Error response status:', error.response.status);
    }
    throw error;
  }
};

export const closeJob = async (jobId, reason) => {
  try {
    console.log('Closing job with ID:', jobId, 'Type:', typeof jobId);
    
    // Validate UUID format
    if (!isValidUUID(jobId)) {
      throw new Error('Invalid job ID format. Expected UUID.');
    }
    
    console.log('Close reason:', reason);
    const response = await api.post(`/jobs/${jobId}/close/`, { reason });
    console.log('Close job response:', response);
    return response;
  } catch (error) {
    console.error('Error closing job:', error);
    if (error.response) {
      console.error('Error response data:', error.response.data);
      console.error('Error response status:', error.response.status);
    }
    throw error;
  }
};

export const reviewApplication = async (applicationId, { status, feedback }) => {
  return await api.post(`/company/application/${applicationId}/review`, { status, feedback });
};

// Company History API
export const getCompanyHistory = async (params = {}) => {
  try {
    console.log('Fetching company history with params:', params);
    const response = await api.get('/company/history/', { 
      params: {
        ...params,
        include_details: true
      }
    });
    console.log('Raw API Response:', response);
    console.log('Response Data:', response.data);
    console.log('Response Data Structure:', JSON.stringify(response.data, null, 2));
    return response;
  } catch (error) {
    console.error('Error in getCompanyHistory:', error);
    if (error.response) {
      console.error('Error response data:', error.response.data);
      console.error('Error response status:', error.response.status);
    }
    throw error;
  }
};

export const reopenJob = async (jobId) => {
  return api.post(`/jobs/${jobId}/reopen/`);
};

export const exportJobApplications = async (jobId) => {
  return api.get(`/jobs/${jobId}/applications/export/`);
};

export default api;