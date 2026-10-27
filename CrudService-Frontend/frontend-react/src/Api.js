import axios from 'axios';

// Docker uses Nginx to forward /api requests to the backend.
// Local development uses the proxy defined in vite.config.js.
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

export function getErrorMessage(error) {
  if (error.response?.data?.message) {
    return error.response.data.message;
  }

  if (error.response?.data?.errors) {
    return Object.values(error.response.data.errors).join(' ');
  }

  if (error.code === 'ECONNABORTED') {
    return 'The request timed out. Please try again.';
  }

  if (!error.response) {
    return 'Cannot reach the API. Check that the backend and database are running.';
  }

  return `Request failed (${error.response.status}). Please try again.`;
}

export default api;