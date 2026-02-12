
import os
import time
import json
from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field
import google.generativeai as genai
from google.generativeai.types import HarmCategory, HarmBlockThreshold
from dotenv import load_dotenv

# Define Schemas for Extraction

class BookMetadata(BaseModel):
    title: str = Field(..., description="The title of the book.")
    author: str = Field(..., description="The author of the book.")
    publication_year: str = Field(..., description="Year of publication. Use 'Unknown' if not found.")
    source: str = Field(..., description="Source of the text (e.g., Project Gutenberg, User Upload).")
    genre: str = Field(..., description="Primary genre of the story (e.g., Sci-Fi, Horror, Fantasy).")
    tone: str = Field(..., description="Overall tone (e.g., Dark, Whimsical, Tense).")
    setting: str = Field(..., description="Primary setting (e.g., Victorian London, Mars Colony).")
    
class Scene(BaseModel):
    heading: str = Field(..., description="A short title for the scene.")
    start_char: int = Field(..., description="The character index where the scene starts in the source text.")
    end_char: int = Field(..., description="The character index where the scene ends.")
    summary: str = Field(..., description="A brief summary of the scene's events.")
    image_prompt: str = Field(..., description="A highly detailed visual description of the scene for an image generator (Nano Banana). Include style, lighting, and key elements.")
    video_prompt: str = Field(..., description="A description of the motion and action in the scene for a video generator (Veo). Focus on movement.")

class BookAnalysis(BaseModel):
    metadata: BookMetadata
    scenes: List[Scene]

class LangExtractService:
    def __init__(self, api_key: str = None):
        load_dotenv()
        # Prioritize VITE_GOOGLE_API_KEY if it exists and looks like a standard Google API Key (AIza...)
        # as Gemini 401s were happening with the current GEMINI_API_KEY
        self.api_key = api_key or os.getenv("GEMINI_API_KEY")
        vite_key = os.getenv("VITE_GOOGLE_API_KEY")
        
        if vite_key and vite_key.startswith("AIza") and (not self.api_key or not self.api_key.startswith("AIza")):
            print("Detected valid VITE_GOOGLE_API_KEY. Using as primary for Gemini.")
            self.api_key = vite_key
            
        # Configure the legacy SDK
        genai.configure(api_key=self.api_key)
        
        # Priority list for graceful degradation
        self.models = [
            "gemini-2.5-flash",        # Confirmed Working
        ]

    def extract_analysis(self, text: str) -> Dict[str, Any]:
        """
        Orchestrates the extraction process.
        Tries SDK first, then falls back to direct REST API if SDK fails (common in some envs).
        """
        prompt = """
        Analyze the provided book text.
        Split the ENTIRE book into 10-20 major scenes or chapters.
        Ensure every part of the book is covered by a scene (contiguous).
        Output a JSON object with this structure:
        {
          "metadata": {
            "title": "Book Title",
            "author": "Author Name",
            "publication_year": "Year or Unknown",
            "source": "Source",
            "genre": "Genre",
            "tone": "Tone",
            "setting": "Setting"
          },
          "scenes": [
            {
              "heading": "Scene Title",
              "start_char": 0,
              "end_char": 100,
              "summary": "Summary",
              "image_prompt": "Visual prompt...",
              "video_prompt": "Motion prompt..."
            }
          ]
        }
        IMPORTANT: 'start_char' and 'end_char' must be integers.
        """
        
        last_error = None

        for model_id in self.models:
            print(f"Attempting extraction with model: {model_id}...")
            try:
                # Try REST API directly as it is most robust for API Keys in this env
                return self._extract_via_rest(model_id, prompt, text)
                
            except Exception as e:
                import traceback
                print(f"Model {model_id} failed. Error: {str(e)}")
                # traceback.print_exc()
                last_error = e
                time.sleep(1) 
                continue
        
        print("All models failed extraction.")
        if last_error:
            raise last_error
        return {}

    def _extract_via_rest(self, model_id: str, prompt: str, text: str) -> Dict[str, Any]:
        """
        Direct REST call to bypass SDK auth issues.
        """
        import requests
        
        # Clean model ID for URL (remove -latest if present for v1beta)
        if "latest" in model_id:
            model_id = model_id.replace("-latest", "")
            
        url = f"https://generativelanguage.googleapis.com/v1beta/models/{model_id}:generateContent?key={self.api_key}"
        
        headers = {"Content-Type": "application/json"}
        data = {
            "contents": [{
                "parts": [
                    {"text": prompt},
                    {"text": text}
                ]
            }],
            "generationConfig": {
                "response_mime_type": "application/json"
            }
        }
        
        response = requests.post(url, headers=headers, json=data)
        response.raise_for_status()
        
        result = response.json()
        
        # Parse result
        try:
            content = result["candidates"][0]["content"]["parts"][0]["text"]
            data = json.loads(content)
            return self._process_analysis(data, text)
        except (KeyError, IndexError, json.JSONDecodeError) as e:
            print(f"Failed to parse REST response: {e}")
            raise e

    def _process_analysis(self, data: Dict[str, Any], full_text: str) -> Dict[str, Any]:
        """
        Post-processes the raw JSON from Gemini to match the application's manifest structure.
        - Slices text using start/end chars.
        - Maps snake_case to camelCase.
        """
        metadata = data.get("metadata", {})
        raw_scenes = data.get("scenes", [])
        
        processed_scenes = []
        for s in raw_scenes:
            # Safe text slicing
            start = s.get("start_char", 0)
            end = s.get("end_char", 0)
            
            # Clamp to bounds
            # Handle potential string errors if LLM outputs strings for ints
            try:
                start = int(start)
                end = int(end)
            except:
                start = 0
                end = 0

            start = max(0, start)
            end = min(len(full_text), end)
            
            scene_text = full_text[start:end]
            
            processed_scenes.append({
                "heading": s.get("heading", "Untitled"),
                "text": scene_text,
                "summary": s.get("summary", ""),
                "imagePrompt": s.get("image_prompt", ""), # Map to camelCase
                "videoPrompt": s.get("video_prompt", ""), # Map to camelCase
                "start_char": start,
                "end_char": end
            })
            
        return {
            "metadata": metadata,
            "scenes": processed_scenes
        }

