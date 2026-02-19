
export interface User {
  email: string;
  name: string;
}

export interface InterviewResult {
  rating: number;
  strengths: string[];
  weaknesses: string[];
  suggestions: string[];
  recommended_roles: string[];
}

export interface HistoryItem {
  id: string;
  date: string;
  rating: number;
  feedback: string;
  job_suggestions: string[];
}

export interface VoiceResponse {
  transcript: string;
  audio_url: string;
  is_last_question: boolean;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
}
