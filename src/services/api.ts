import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  withCredentials: true,
});

import { logoutUser } from './auth';

api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response && error.response.status === 401) {
      // Clear the local user session
      logoutUser();
      // Redirect to the login page
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
