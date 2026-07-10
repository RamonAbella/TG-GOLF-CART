import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('tg-auth');
      delete api.defaults.headers.common['Authorization'];
    }
    return Promise.reject(error);
  }
);

export default api;
