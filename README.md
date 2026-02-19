
# AI Voice Mock Interviewer - Backend

This is the backend for the AI Voice Mock Interviewer, built with FastAPI. It handles speech-to-text, text-to-speech, LLM-based interview logic using Ollama, and persistent memory with ChromaDB.

## Architecture Diagram
```
[User Voice] -> [Whisper STT] -> [FastAPI] -> [ChromaDB Memory]
                                    |
                                [Ollama LLM (Llama3)]
                                    |
[User Reply] <- [Coqui TTS] <--- [FastAPI]
```

## Installation Steps

1. **Create Virtual Environment**
   ```bash
   python -m venv venv
   source venv/bin/activate  # Windows: venv\Scripts\activate
   ```

2. **Install Requirements**
   ```bash
   pip install -r requirements.txt
   ```

3. **Install Ollama**
   Download from [ollama.com](https://ollama.com) and run:
   ```bash
   ollama pull llama3
   ```

4. **Prepare Directories**
   ```bash
   mkdir uploads audio_outputs chromadb_storage
   ```

5. **Run FastAPI**
   ```bash
   uvicorn app.main:app --reload --port 8000
   ```

## How to Test APIs
- Swagger UI: `http://localhost:8000/docs`
- Register: `POST /register`
- Login: `POST /login`
- Upload Resume: `POST /upload_resume` (requires JWT)

## How Voice Flow Works
1. Frontend captures audio and sends it to `/process_voice`.
2. Backend uses **Whisper** to convert audio to text.
3. Text is sent to **Ollama** with a specialized HR System Prompt.
4. **ChromaDB** tracks conversation context.
5. Ollama's text response is converted to audio using **Coqui TTS**.
6. The path to the audio file and the transcript are returned to the frontend.
