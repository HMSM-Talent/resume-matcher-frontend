import axios from 'axios';


// Create an Axios instance
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL, // This points to your Django backend API
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;