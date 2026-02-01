import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth API
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data)
};

// Interview API
export const interviewAPI = {
  getDomains: () => api.get('/interview/domains'),
  getQuestions: (domain) => api.get(`/interview?domain=${domain}`),
  startInterview: (domain) => api.post('/interview/start', { domain })
};

// Answer API
export const answerAPI = {
  submit: (data) => api.post('/answer/submit', data),
  getAnswers: (interviewId) => api.get(`/answer/${interviewId}`)
};

// Report API
export const reportAPI = {
  generate: (interviewId) => api.get(`/report/generate/${interviewId}`),
  getAll: () => api.get('/report/user/all')
};

export default api;
