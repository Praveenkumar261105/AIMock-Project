import axios from 'axios';

// Ensure this matches your FastAPI server port
export const BASE_URL = 'http://localhost:8000';

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000, // 10s timeout
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (!error.response) {
      console.error('Network Error - Is the backend running?', error.message);
    }
    return Promise.reject(error);
  }
);

export const authApi = {
  register: (data: any) => api.post('/register', data),
  login: (data: any) => api.post('/login', data),
};

export const interviewApi = {
  // Added a quick way to check if backend is alive
  checkHealth: () => axios.get(`${BASE_URL}/docs`), 
  
  uploadResume: (formData: FormData) => api.post('/upload_resume', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    }
  }),
  startInterview: () => api.post('/start_interview'),
  processVoice: (audioBlob: Blob) => {
    const formData = new FormData();
    formData.append('audio', audioBlob, 'voice.webm');
    return api.post('/process_voice', formData);
  },
  endInterview: () => api.post('/end_interview'),
  getHistory: () => api.get('/history'),
};

export default api;