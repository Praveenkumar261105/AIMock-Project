
import axios from 'axios';
import { auth } from './firebase';

const BASE_URL = 'http://localhost:8000';

const api = axios.create({
  baseURL: BASE_URL,
});

api.interceptors.request.use(async (config) => {
  const user = auth.currentUser;
  if (user) {
    const token = await user.getIdToken();
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const interviewApi = {
  uploadResume: (formData: FormData) => api.post('/upload_resume', formData),
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
