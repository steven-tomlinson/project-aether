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
            model="gemini-2.0-flash",
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
    Uses Gemini 2.0 Flash to analyze the ENTIRE text and break it down into cinematic scenes.
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
        # We use the Flash model as it has a large context window (1M tokens) suitable for full books
        response = client.models.generate_content(
            model="gemini-2.0-flash",
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
    # 1. Deep Analysis (Gemini 2.0 Flash)
    print(f"Ingesting {filename} ({len(content)} chars)... Sending to Gemini 2.0 Flash...")
    
    analysis = analyze_full_content(content)
    
    if not analysis or not analysis.get("scenes"):
        # Fallback to simple chunking if AI fails
        print("AI Analysis failed, falling back to simple chunking.")
        raw_chunks = chunk_text(content, chunk_size=1500)
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
