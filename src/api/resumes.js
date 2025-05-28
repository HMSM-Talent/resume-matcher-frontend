import api from './auth';

export const resumeService = {
  uploadResume: async (formData) => {
    const response = await api.post('/upload/resume/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  uploadJobDescription: async (formData) => {
    const response = await api.post('/upload/job-description/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  getSimilarityScores: async (params = {}) => {
    const response = await api.get('/similarity-scores/', { params });
    return response.data;
  },
}; 