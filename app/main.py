from fastapi import FastAPI, Depends, UploadFile, File, HTTPException
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
import os
import shutil

from . import models, schemas, auth, database, resume_parser, utils, interview, memory

app = FastAPI()

# Root directory of the project
BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))

# Create tables
models.Base.metadata.create_all(bind=database.engine)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Health check
@app.get("/")
async def health():
    return {"status": "online", "message": "AI Voice Interviewer Backend is running"}

# Static files for audio - ensure absolute path
AUDIO_DIR = os.path.join(BASE_DIR, "audio_outputs")
os.makedirs(AUDIO_DIR, exist_ok=True)
app.mount("/audio", StaticFiles(directory=AUDIO_DIR), name="audio")

current_interview_id = {}

@app.post("/upload_resume")
async def upload_resume(resume: UploadFile = File(...), user: models.User = Depends(auth.get_current_user), db: Session = Depends(database.get_db)):
    UPLOAD_DIR = os.path.join(BASE_DIR, "uploads")
    os.makedirs(UPLOAD_DIR, exist_ok=True)
    file_path = os.path.join(UPLOAD_DIR, f"{user.id}_resume.pdf")
    
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(resume.file, buffer)
    
    parsed = resume_parser.parse_resume(file_path)
    db_resume = models.Resume(
        user_id=user.id,
        raw_text=parsed["raw_text"],
        skills=parsed["skills"],
        education=parsed["education"],
        experience=parsed["experience"],
        projects=parsed["projects"]
    )
    db.add(db_resume)
    db.commit()
    return {"message": "Resume uploaded successfully"}

@app.post("/start_interview")
async def start_interview(user: models.User = Depends(auth.get_current_user), db: Session = Depends(database.get_db)):
    resume = db.query(models.Resume).filter(models.Resume.user_id == user.id).order_by(models.Resume.uploaded_at.desc()).first()
    if not resume:
        raise HTTPException(status_code=400, detail="Please upload a resume first")
    
    new_interview = models.Interview(user_id=user.id)
    db.add(new_interview)
    db.commit()
    db.refresh(new_interview)
    current_interview_id[user.id] = new_interview.id
    
    greeting = f"Hello {user.name}. I'm your interviewer. I've reviewed your resume and noticed your background in {resume.skills}. Let's get started. Could you walk me through your most relevant professional experience?"
    audio_url = utils.text_to_speech(greeting, output_dir=AUDIO_DIR)
    
    memory.add_memory(user.id, new_interview.id, greeting, "AI")
    
    return {"transcript": greeting, "audio_url": audio_url, "is_last_question": False}

@app.post("/process_voice", response_model=schemas.VoiceResponse)
async def process_voice(audio: UploadFile = File(...), user: models.User = Depends(auth.get_current_user), db: Session = Depends(database.get_db)):
    iid = current_interview_id.get(user.id)
    if not iid:
        raise HTTPException(status_code=400, detail="No active interview session found.")
    
    temp_audio = os.path.join(AUDIO_DIR, f"temp_{user.id}.webm")
    with open(temp_audio, "wb") as buffer:
        shutil.copyfileobj(audio.file, buffer)
        
    user_text = utils.transcribe_audio(temp_audio)
    memory.add_memory(user.id, iid, user_text, "User")
    
    resume = db.query(models.Resume).filter(models.Resume.user_id == user.id).order_by(models.Resume.uploaded_at.desc()).first()
    resume_text = resume.raw_text[:2000] if resume and resume.raw_text else "General candidate"
    sys_prompt = interview.get_hr_system_prompt(resume_text)
    
    ai_response = interview.call_ollama(user_text, sys_prompt)
    is_last = any(phrase in ai_response.lower() for phrase in ["concludes our interview", "thank you", "goodbye"])
    
    audio_url = utils.text_to_speech(ai_response, output_dir=AUDIO_DIR)
    memory.add_memory(user.id, iid, ai_response, "AI")
    
    return {"transcript": ai_response, "audio_url": audio_url, "is_last_question": is_last}

@app.post("/end_interview")
async def end_interview(user: models.User = Depends(auth.get_current_user), db: Session = Depends(database.get_db)):
    iid = current_interview_id.get(user.id)
    if not iid:
        raise HTTPException(status_code=400, detail="No active interview")
        
    context = memory.get_context(user.id, iid)
    evaluation = interview.evaluate_candidate(context)
    
    db_interview = db.query(models.Interview).filter(models.Interview.id == iid).first()
    db_interview.rating = float(evaluation.get("rating", 5))
    db_interview.strengths = ", ".join(evaluation.get("strengths", []))
    db_interview.weaknesses = ", ".join(evaluation.get("weaknesses", []))
    db_interview.suggestions = ", ".join(evaluation.get("suggestions", []))
    db_interview.job_roles = ", ".join(evaluation.get("recommended_roles", []))
    
    db.commit()
    if user.id in current_interview_id:
        del current_interview_id[user.id]
    
    return evaluation

@app.get("/history")
async def get_history(user: models.User = Depends(auth.get_current_user), db: Session = Depends(database.get_db)):
    interviews = db.query(models.Interview).filter(models.Interview.user_id == user.id).order_by(models.Interview.interview_date.desc()).all()
    results = []
    for i in interviews:
        results.append({
            "id": str(i.id),
            "date": i.interview_date.isoformat(),
            "rating": i.rating or 0,
            "feedback": i.suggestions or "Interview session logged.",
            "job_suggestions": i.job_roles.split(", ") if i.job_roles else []
        })
    return results
