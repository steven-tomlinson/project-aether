import os
import json
from typing import List, Dict, Any
from google import genai
from google.genai import types
from dotenv import load_dotenv

load_dotenv()

# Initialize Gemini Client
api_key = os.getenv("GEMINI_API_KEY")
client = genai.Client(api_key=api_key) if api_key else None

def chunk_text(text: str, chunk_size: int = 1000) -> List[str]:
    """
    Simple chunking by character count for MVP.
    In production, this should be by paragraphs or sentence boundaries.
    """
    return [text[i:i+chunk_size] for i in range(0, len(text), chunk_size)]

def analyze_vibe(text_sample: str) -> Dict[str, Any]:
    """
    Uses Gemini Flash to extract the 'Vibe' (Theme & Audio Profile).
    """
    if not client:
        # Fallback for when API key is missing
        return {
            "theme": {
                "primaryColor": "#FF4500",
                "font": "Orbitron",
                "backgroundStyle": "pulp_texture"
            },
            "audioProfile": {
                "narratorVoice": "Aoede",
                "ambientTrack": "desert_wind"
            },
            "tags": ["Analysis Failed", "check-api-key"]
        }

    prompt = """
    Analyze the following text sample from a book.
    Determine the Genre, Tone, and Setting.
    Based on this, recommend:
    1. A CSS Primary Color (hex code).
    2. A Font (options: 'Orbitron', 'Share Tech Mono', 'Merriweather', 'Lora').
    3. A Background Style Keyword (options: 'pulp_texture', 'industrial_blueprint', 'noir_shadows', 'clinical_white', 'verdant_forest').
    4. An Audio Narrator Voice (options: 'Aoede', 'Charon', 'Fenrir', 'Puck', 'Kore', 'Zephyr').
    5. An Ambient Track (options: 'desert_wind', 'computer_hum', 'subterranean_rumble', 'wind_leaves', 'dripping_water', 'hospital_beeps', 'silence').
    6. Three short tags describing the book.

    Return ONLY a valid JSON object with this structure:
    {
        "theme": { "primaryColor": "...", "font": "...", "backgroundStyle": "..." },
        "audioProfile": { "narratorVoice": "...", "ambientTrack": "..." },
        "tags": ["...", "...", "..."]
    }
    """

    try:
        response = client.models.generate_content(
            model="gemini-3.0-flash",
            contents=[prompt, text_sample],
            config=types.GenerateContentConfig(
                response_mime_type="application/json"
            )
        )
        return json.loads(response.text)
    except Exception as e:
        print(f"Error analyzing vibe: {e}")
        return {
            "theme": {"primaryColor": "#000000", "font": "Arial", "backgroundStyle": "default"},
            "audioProfile": {"narratorVoice": "default", "ambientTrack": "silence"},
            "tags": ["Error"]
        }

def analyze_full_content(text: str) -> Dict[str, Any]:
    """
    Uses Gemini 3.0 Pro (The Brain) to analyze the ENTIRE text and break it down into cinematic scenes.
    Generates prompts for 'Nano Banana' (Images) and 'Veo' (Video).
    """
    if not client:
        return {"scenes": [], "vibe": {}}

    prompt = """
    You are an expert Director of Intent (Vibe Coder) for Project Aether, powered by Gemini 3. 
    Analyze the following Science Fiction text (Full Content).
    
    1.  **Vibe Analysis**: Determine the Genre, Tone, Setting, and Audio/Visual Style.
    2.  **Scene Segmentation**: Break the story down into key narrative scenes (approx 5-10 major scenes max for this demo, or legitimate chapter breaks if short).
    3.  **Prompt Engineering**:
        *   **Image Prompt (Nano Banana)**: consistently styled, detailed visual description for the scene. Use keywords like 'pulp art', 'cinematic lighting', 'highly detailed'.
        *   **Video Prompt (Veo)**: A description of the *motion* and *action* in the scene for video generation (e.g., "Camera pans across the red desert," "The character approaches the glowing artifact").

    Output valid JSON:
    {
        "theme": { "primaryColor": "#HEX", "font": "FontName", "backgroundStyle": "style_keyword" },
        "audioProfile": { "narratorVoice": "VoiceName", "ambientTrack": "track_id" },
        "tags": ["tag1", "tag2", "tag3"],
        "scenes": [
            {
                "id": 1,
                "heading": "Scene Title",
                "text": "The full text content of this scene...", 
                "imagePrompt": "Nano Banana style: ...",
                "videoPrompt": "Veo style: ..."
            }
        ]
    }
    """

    try:
        # Using Gemini 3.0 Pro for deep narrative analysis
        response = client.models.generate_content(
            model="gemini-3.0-pro",
            contents=[prompt, text],
            config=types.GenerateContentConfig(
                response_mime_type="application/json"
            )
        )
        return json.loads(response.text)
    except Exception as e:
        print(f"Error in deep analysis: {e}")
        return None

def process_book_content(filename: str, content: str) -> Dict[str, Any]:
    """
    Orchestrates the ingestion process with Deep Analysis.
    """
    # 1. Deep Analysis (Gemini 3.0 Pro)
    print(f"Ingesting {filename} ({len(content)} chars)... Sending to Gemini 3.0 Pro...")
    
    analysis = analyze_full_content(content)
    
    if not analysis or not analysis.get("scenes"):
        # Fallback to simple chunking if AI fails
        print("AI Analysis failed, falling back to simple chunking.")
        raw_chunks = chunk_text(content, chunk_size=1500)
        # Fallback to 3.0 Flash for quick vibe
        vibe_data = analyze_vibe(content[:5000])
        scenes = []
        for i, chunk in enumerate(raw_chunks):
            scenes.append({
                "id": i,
                "heading": f"Part {i+1}",
                "text": chunk,
                "imagePrompt": f"Illustration for part {i+1}: {vibe_data['tags'][0]} style.",
                "videoPrompt": f"Cinematic shot of {vibe_data['tags'][0]} scene.",
                "generatedImageUrl": None,
                "generatedAudioUrl": None
            })
    else:
        print("AI Analysis Successful. Structuring manifest.")
        vibe_data = analysis # Flattened structure in our new prompt
        scenes = analysis.get("scenes", [])
        # Ensure ID injection if missing
        for i, s in enumerate(scenes):
            s["id"] = i
            s["generatedImageUrl"] = None
            s["generatedAudioUrl"] = None

    # Construct Manifest
    return {
        "id": filename.lower().replace(" ", "_").replace(".", "_"),
        "title": filename, 
        "author": "Unknown", 
        "publicationYear": 2024,
        "description": f"Vibe Coded by Gemini 3. {', '.join(vibe_data.get('tags', []))}",
        "coverImage": "https://picsum.photos/400/600?grayscale", 
        "tags": vibe_data.get('tags', ["Sci-Fi"]),
        "theme": vibe_data.get('theme', {
            "primaryColor": "#FF4500",
            "font": "Orbitron",
            "backgroundStyle": "pulp_texture"
        }),
        "audioProfile": vibe_data.get('audioProfile', {
            "narratorVoice": "Aoede",
            "ambientTrack": "desert_wind"
        }),
        "scenes": scenes
    }

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
