import axios from 'axios';

const API_URL = `${import.meta.env.VITE_API_BASE_URL}/api`;

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
    const response = await api.post('/users', userData);
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
    }
    return response.data;
  },

  logout: () => {
    localStorage.removeItem('token');
  }
};

// User services
export const userService = {
  getUsers: async () => {
    const response = await api.get('/users');
    console.log('getUsers API response:', response);
    return response.data.data;
  },

  getCurrentUser: () => {
    // Get user info from token
    const token = localStorage.getItem('token');
    if (!token) return null;
    
    try {
      // Decode the JWT token to get user info
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));

      const userData = JSON.parse(jsonPayload);
      console.log('Decoded token user data:', userData);
      return userData;
    } catch (error) {
      console.error('Error decoding token:', error);
      return null;
    }
  }
};

// Todo services
export const todoService = {
  getTodos: async (params = {}) => {
    const response = await api.get('/todos', { params });
    return response.data;
  },

  getTodo: async (id) => {
    const response = await api.get(`/todos/${id}`);
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
  },

  addNote: async (todoId, content) => {
    const response = await api.post(`/todos/${todoId}/notes`, { content });
    return response.data;
  },

  getStats: async () => {
    const response = await api.get('/todos/stats');
    return response.data;
  }
};

export default api; 