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
    console.log('Response received:', {
      url: response.config.url,
      status: response.status,
      data: response.data
    });
    return response;
  },
  (error) => {
    console.error('API Error:', {
      url: error.config?.url,
      status: error.response?.status,
      data: error.response?.data,
      message: error.message
    });
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

// RESUME MANAGEMENT
export const uploadResume = async (formData) => {
  return api.post('/resumes/upload/', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

export const getResume = async () => {
  return api.get('/resumes/');
};

// JOB DESCRIPTION MANAGEMENT
export const uploadJobDescription = async (formData) => {
  return api.post('/job-descriptions/upload/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
    },
    });
};

// JOB SEARCH AND APPLICATIONS
export const searchJobDescriptions = (params) => {
  return api.get('/job-descriptions/search/', { 
    params: {
      ...params,
      // Ensure minScore is sent as a number
      minScore: params.minScore ? Number(params.minScore) : undefined
    } 
  });
};

export const getJobDescription = (id) => {
  return api.get(`/job-descriptions/${id}/`);
};

export const getJobDescriptions = (params = {}) => {
  return api.get('/job-descriptions/', { params });
};

export const getJobApplications = async (jobId = null) => {
  try {
    if (jobId) {
      // For company viewing specific job applications
      return api.get(`/company/job/${jobId}/applications/`);
    } else {
      // For candidate viewing their applications
      console.log('Fetching application history...');
      const response = await api.get('/applications/history/');
      console.log('Raw application history response:', response);
      
      // The response is now a direct array of applications
      if (Array.isArray(response.data)) {
        // Transform the data to match the expected format
        const transformedData = {
          data: response.data.map(app => ({
            id: app.id,
            job: app.job,
            job_title: app.job_title,
            company_name: app.company_name,
            job_file_url: app.job_file_url,
            status: app.status,
            applied_at: app.applied_at,
            updated_at: app.updated_at,
            similarity_score: app.similarity_score,
            company_feedback: app.company_feedback
          }))
        };
        console.log('Transformed application data:', transformedData);
        return transformedData;
      }
      throw new Error('Invalid response format: expected an array of applications');
    }
  } catch (error) {
    console.error('Application history error:', {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message,
      stack: error.stack
    });
    
    if (error.response?.status === 401) {
      throw new Error('Please log in to view your applications');
    } else if (error.response?.status === 403) {
      throw new Error('You do not have permission to view applications');
    } else if (error.response?.data?.error) {
      throw new Error(error.response.data.error);
    } else if (error.response?.data?.detail) {
      throw new Error(error.response.data.detail);
    }
    throw error;
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
export const getApplicationHistory = async () => {
  try {
    const response = await api.get('/applications/history/');
    console.log('Application history response:', response);
    return response.data;
  } catch (error) {
    console.error('Error fetching application history:', error);
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
    console.log('Closing job:', jobId, 'with reason:', reason);
    const response = await api.post(`/job-descriptions/${jobId}/close/`, { reason });
    console.log('Close job response:', response);
    return response;
  } catch (error) {
    console.error('Error closing job:', error);
    console.error('Error response data:', error.response?.data);
    console.error('Error response status:', error.response?.status);
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