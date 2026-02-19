import whisper
import torch
from TTS.api import TTS
import os
import uuid

# Models are now initialized as None and loaded on demand (Lazy Loading)
stt_model = None
tts_model = None

def get_stt_model():
    global stt_model
    if stt_model is None:
        print("Loading Whisper STT model (this may take a minute)...")
        stt_model = whisper.load_model("base")
    return stt_model

def get_tts_model():
    global tts_model
    if tts_model is None:
        print("Loading Coqui TTS model (this may take a minute)...")
        device = "cuda" if torch.cuda.is_available() else "cpu"
        # 'tts_models/en/ljspeech/vits' is a fast, high-quality local model
        tts_model = TTS("tts_models/en/ljspeech/vits").to(device)
    return tts_model

def transcribe_audio(file_path):
    model = get_stt_model()
    result = model.transcribe(file_path)
    return result["text"]

def text_to_speech(text, output_dir="audio_outputs"):
    os.makedirs(output_dir, exist_ok=True)
    filename = f"{uuid.uuid4()}.wav"
    file_path = os.path.join(output_dir, filename)
    
    model = get_tts_model()
    model.tts_to_file(text=text, file_path=file_path)
    return f"/audio/{filename}"