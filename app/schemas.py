
from pydantic import BaseModel, EmailStr
from datetime import datetime
from typing import List, Optional

class UserBase(BaseModel):
    name: str
    email: EmailStr

class UserCreate(UserBase):
    password: str

class UserResponse(UserBase):
    id: int
    created_at: datetime
    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class ResumeResponse(BaseModel):
    id: int
    skills: str
    uploaded_at: datetime
    class Config:
        from_attributes = True

class VoiceResponse(BaseModel):
    transcript: str
    audio_url: str
    is_last_question: bool

class InterviewResponse(BaseModel):
    id: int
    rating: float
    feedback: str
    job_suggestions: List[str]
    date: datetime
