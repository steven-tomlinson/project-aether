from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
import os
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(title="Project Aether Backend")

# CORS Configuration
origins = [
    "http://localhost:5173",  # Vite default
    "http://127.0.0.1:5173",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:3001",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Pydantic Models (Mirroring Frontend Types) ---

class Theme(BaseModel):
    primaryColor: str
    font: str
    backgroundStyle: str

class AudioProfile(BaseModel):
    narratorVoice: str
    ambientTrack: str

class Scene(BaseModel):
    id: int
    text: str
    imagePrompt: str
    videoPrompt: Optional[str] = None
    # These are optional as they are generated later/lazy
    generatedImageUrl: Optional[str] = None
    generatedAudioUrl: Optional[str] = None

class BookManifest(BaseModel):
    id: str
    title: str
    author: str
    publicationYear: int
    description: str
    coverImage: str
    tags: List[str]
    theme: Theme
    audioProfile: AudioProfile
    scenes: List[Scene]

# --- Endpoints ---

@app.get("/")
async def root():
    return {"message": "Project Aether Backend Online"}

from ingestor import process_book_content

@app.post("/api/ingest", response_model=BookManifest)
async def ingest_book(file: UploadFile = File(...)):
    content = await file.read()
    # Decode assuming utf-8, fallback to latin-1
    try:
        text_content = content.decode("utf-8")
    except UnicodeDecodeError:
        text_content = content.decode("latin-1")
        
    manifest = process_book_content(file.filename, text_content)
    return manifest

class GenerationRequest(BaseModel):
    book_id: str
    scene_id: int
    prompt: str
    voice: Optional[str] = "Aoede"

from ingestor import generate_image_for_scene, generate_audio_for_scene

@app.post("/api/generate/image")
async def generate_image(req: GenerationRequest):
    url = generate_image_for_scene(req.book_id, req.scene_id, req.prompt)
    return {"url": url}

@app.post("/api/generate/audio")
async def generate_audio(req: GenerationRequest):
    url = generate_audio_for_scene(req.book_id, req.scene_id, req.prompt, req.voice)
    return {"url": url}
