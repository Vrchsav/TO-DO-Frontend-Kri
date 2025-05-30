import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear token and redirect to login if unauthorized
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth services
export const authService = {
  login: async (email, password) => {
    const response = await api.post('/users/login', { email, password });
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
    }
    return response.data;
  },

  register: async (userData) => {
    const response = await api.post('/users/register', userData);
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
    }
    return response.data;
  },

  logout: () => {
    localStorage.removeItem('token');
  }
};

// Todo services
export const todoService = {
  getTodos: async (params = {}) => {
    const response = await api.get('/todos', { params });
    return response.data;
  },

  createTodo: async (todoData) => {
    const response = await api.post('/todos', todoData);
    return response.data;
  },

  updateTodo: async (id, todoData) => {
    const response = await api.put(`/todos/${id}`, todoData);
    return response.data;
  },

  deleteTodo: async (id) => {
    const response = await api.delete(`/todos/${id}`);
    return response.data;
  }
};

export default api; 