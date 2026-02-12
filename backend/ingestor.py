import os
import json
from typing import List, Dict, Any
from google import genai
from google.genai import types
from dotenv import load_dotenv
from backend.services.langextract_service import LangExtractService

load_dotenv()

# Initialize Gemini Client for Generation (Image/Audio)
api_key = os.getenv("GEMINI_API_KEY")
client = genai.Client(api_key=api_key) if api_key else None

# Initialize LangExtract Service
lang_service = LangExtractService(api_key=api_key) if api_key else None

def chunk_text(text: str, chunk_size: int = 1000) -> List[str]:
    """
    Simple chunking by character count for MVP.
    In production, this should be by paragraphs or sentence boundaries.
    """
    return [text[i:i+chunk_size] for i in range(0, len(text), chunk_size)]

def process_book_content(filename: str, content: str) -> Dict[str, Any]:
    """
    Orchestrates the ingestion process with LangExtract.
    """
    print(f"Ingesting {filename} ({len(content)} chars)... Using LangExtract Service...")
    
    if not lang_service:
        print("LangExtract Service unavailable (missing API key). Using fallback.")
        return _fallback_process(filename, content)

    try:
        # 1. Deep Analysis (LangExtract)
        # We process the full text (up to a reasonable limit like 1M chars) 
        # as Gemini 1.5/2.0/3.0 have large context windows.
        
        # Safety cap at 500k chars to prevent memory issues with massive files
        analysis_text = content[:500000] 
        analysis_result = lang_service.extract_analysis(analysis_text)
        
        metadata = analysis_result.get("metadata", {})
        scenes = analysis_result.get("scenes", [])
        
        # If no scenes extracted (e.g. failure), fallback
        if not scenes:
            print("LangExtract returned no scenes. Fallback.")
            return _fallback_process(filename, content)

        print(f"LangExtract Successful. Metadata: {metadata.get('title')}. Scenes: {len(scenes)}")

        # 2. Enrich Manifest
        # Helper to map tone/setting to theme colors/audio (Vibe Logic)
        theme = _map_vibe_to_theme(metadata.get("tone", ""), metadata.get("setting", ""))
        audio_profile = _map_vibe_to_audio(metadata.get("tone", ""), metadata.get("genre", ""))

        # Ensure ID injection
        for i, s in enumerate(scenes):
            s["id"] = i
            s["generatedImageUrl"] = None
            s["generatedAudioUrl"] = None

        return {
            "id": filename.lower().replace(" ", "_").replace(".", "_"),
            "title": metadata.get("title", filename), 
            "author": metadata.get("author", "Unknown"), 
            "publicationYear": metadata.get("publicationYear", "2024"),
            "description": f"Vibe Coded by Gemini 3. {metadata.get('genre')} - {metadata.get('tone')}",
            "coverImage": "https://picsum.photos/400/600?grayscale", 
            "tags": [metadata.get("genre"), metadata.get("tone"), "Sci-Fi"], # Add defaults
            "theme": theme,
            "audioProfile": audio_profile,
            "scenes": scenes
        }
        
    except Exception as e:
        print(f"Error in process_book_content: {e}")
        return _fallback_process(filename, content)

def _fallback_process(filename: str, content: str) -> Dict[str, Any]:
    """
    Original simple ingestion logic using regex/chunking.
    """
    print("Executing Fallback Ingestion...")
    raw_chunks = chunk_text(content, chunk_size=1500)
    scenes = []
    for i, chunk in enumerate(raw_chunks):
        scenes.append({
            "id": i,
            "heading": f"Part {i+1}",
            "text": chunk,
            "imagePrompt": f"Illustration for part {i+1}",
            "videoPrompt": f"Cinematic shot of scene {i+1}",
            "generatedImageUrl": None,
            "generatedAudioUrl": None
        })
        
    return {
        "id": filename.lower().replace(" ", "_").replace(".", "_"),
        "title": filename, 
        "author": "Unknown", 
        "publicationYear": 2024,
        "description": "Fallback Ingestion",
        "coverImage": "https://picsum.photos/400/600?grayscale", 
        "tags": ["Fallback"],
        "theme": {
            "primaryColor": "#FF4500",
            "font": "Orbitron",
            "backgroundStyle": "pulp_texture"
        },
        "audioProfile": {
            "narratorVoice": "Aoede",
            "ambientTrack": "desert_wind"
        },
        "scenes": scenes
    }

def _map_vibe_to_theme(tone: str, setting: str) -> Dict[str, str]:
    """Maps extracted tone/setting to UI theme properties."""
    tone = tone.lower()
    setting = setting.lower()
    
    if "dark" in tone or "horror" in tone:
        return {"primaryColor": "#8B0000", "font": "Merriweather", "backgroundStyle": "noir_shadows"}
    elif "whimsical" in tone or "fantasy" in tone:
        return {"primaryColor": "#9370DB", "font": "Lora", "backgroundStyle": "verdant_forest"}
    elif "clean" in tone or "medical" in tone:
        return {"primaryColor": "#00CED1", "font": "Share Tech Mono", "backgroundStyle": "clinical_white"}
    else:
         return {"primaryColor": "#FF4500", "font": "Orbitron", "backgroundStyle": "pulp_texture"}

def _map_vibe_to_audio(tone: str, genre: str) -> Dict[str, str]:
    """Maps extracted tone/genre to Audio properties."""
    tone = tone.lower()
    genre = genre.lower()
    
    if "horror" in genre:
        return {"narratorVoice": "Charon", "ambientTrack": "subterranean_rumble"}
    elif "fantasy" in genre:
        return {"narratorVoice": "Puck", "ambientTrack": "wind_leaves"}
    else:
        return {"narratorVoice": "Aoede", "ambientTrack": "desert_wind"}

def generate_image_for_scene(book_id: str, scene_id: int, prompt: str) -> str:
    """
    Generates an image using Nano Banana Pro (Native Multimodal) via Gemini Client.
    Saves the image locally and returns the public path.
    """
    if not client:
        return "https://picsum.photos/800/600?grayscale" # Fallback

    try:
        print(f"GENERATING_IMAGE_NANO_BANANA: {book_id}_S{scene_id}")
        
        # Using Nano Banana Pro for high-quality native image generation
        response = client.models.generate_content(
            model="gemini-3.0-pro-image-preview",
            contents=[prompt],
            config=types.GenerateContentConfig(
                response_mime_type="image/png" 
            )
        )
        
        # Save to a directory served by FastAPI
        # We check both local and container paths
        base_dir = "/app/static/generated" if os.path.exists("/app/static") else "../dist/generated"
        if not os.path.exists(base_dir):
            os.makedirs(base_dir, exist_ok=True)
            
        filename = f"{book_id}_{scene_id}.png"
        filepath = os.path.join(base_dir, filename)
        
        # Extract image bytes from response
        if response.candidates and response.candidates[0].content.parts:
            image_part = response.candidates[0].content.parts[0]
            if hasattr(image_part, 'inline_data') and image_part.inline_data:
                with open(filepath, "wb") as f:
                    f.write(image_part.inline_data.data)
                
                print(f"IMAGE_SAVED: {filepath}")
                # Return the path relative to static root
                return f"/generated/{filename}"
        
        return "https://picsum.photos/800/600?grayscale"
    except Exception as e:
        print(f"Error generating image with Nano Banana: {e}")
        return "https://picsum.photos/800/600?grayscale"

def generate_audio_for_scene(book_id: str, scene_id: int, text: str, voice: str) -> str:
    """
    Generates narrative audio using Gemini-TTS (via model: gemini-3.0-flash native audio).
    """
    print(f"AUDIO_SYNTHESIS_INITIATED: {voice} reading {book_id}_S{scene_id}")
    # Return a sample audio file for the demo
    return "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3"

def generate_more_scenes(book_id: str, last_scene_id: int, context: str) -> List[Dict[str, Any]]:
    """
    Hallucinates/Generates new sections of a book based on its ID (Title) using Gemini 3.
    Used for starter books when full text isn't available or for continuing a story.
    """
    if not client:
        return []

    prompt = f"""
    You are an expert Archivist of Project Aether. 
    Retrieve and format 3 new sections of the book identified by: {book_id}.
    Starting Scene ID: {last_scene_id + 1}.
    Context provided: {context}

    Output valid JSON:
    [
        {{
            "id": {last_scene_id + 1},
            "heading": "Scene Title",
            "text": "The narrative content...",
            "imagePrompt": "Nano Banana style description...",
            "videoPrompt": "Veo style action..."
        }},
        ... (generate 3)
    ]
    """

    try:
        response = client.models.generate_content(
            model="gemini-3.0-flash", # Flash is fast and sufficient for this
            contents=[prompt],
            config=types.GenerateContentConfig(
                response_mime_type="application/json"
            )
        )
        scenes = json.loads(response.text)
        # Ensure generated audio/image placeholders are added
        for s in scenes:
            s["generatedImageUrl"] = None
            s["generatedAudioUrl"] = None
        return scenes
    except Exception as e:
        print(f"Error generating more scenes: {e}")
        return []
