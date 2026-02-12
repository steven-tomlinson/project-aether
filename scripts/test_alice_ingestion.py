
import os
import sys
import json
from dotenv import load_dotenv
from backend.ingestor import process_book_content

# Load environment variables
load_dotenv() 

def test_alice_ingestion():
    # Read Alice in Wonderland
    alice_path = "docs/alice-in-wonderland.txt"
    if not os.path.exists(alice_path):
        print(f"Error: {alice_path} not found.")
        return

    with open(alice_path, "r", encoding="utf-8") as f:
        content = f.read()

    print(f"Loaded Alice in Wonderland: {len(content)} chars.")
    
    # Run Ingestion
    result = process_book_content("Alice in Wonderland", content)
    
    # Validation logic
    print("\n--- Validation Results ---")
    
    # 1. Metadata Check
    title = result.get("title")
    print(f"Title: {title} ... {'[PASS]' if 'Wonderland' in title else '[FAIL]'}")
    
    author = result.get("author")
    print(f"Author: {author} ... {'[PASS]' if 'Carroll' in author else '[FAIL]'}")
    
    # 2. Scene Check
    scenes = result.get("scenes", [])
    print(f"Scenes Extracted: {len(scenes)} ... {'[PASS]' if len(scenes) > 0 else '[FAIL]'}")
    
    if scenes:
        first_scene = scenes[0]
        print(f"First Scene Heading: {first_scene.get('heading')}")
        print(f"First Scene Image Prompt: {first_scene.get('imagePrompt')}")
        print(f"First Scene Video Prompt: {first_scene.get('videoPrompt')}")
        
        # Check for Vibe
        if "detailed" in first_scene.get('imagePrompt', '').lower() or "style" in first_scene.get('imagePrompt', '').lower():
             print("Prompts appear descriptive ... [PASS]")
        else:
             print("Prompts might be weak ... [WARN]")

    # 3. Theme Check
    theme = result.get("theme", {})
    print(f"Theme Font: {theme.get('font')} ... [INFO]")
    
    # Dump Manifest
    with open("alice_manifest.json", "w", encoding="utf-8") as f:
        json.dump(result, f, indent=2)
    print("\nManifest saved to alice_manifest.json")

if __name__ == "__main__":
    test_alice_ingestion()
