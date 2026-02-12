import os
import sys
import json
from dotenv import load_dotenv

# App root to path
sys.path.append(os.getcwd())

from backend.ingestor import process_book_content

def regenerate():
    load_dotenv()
    print("Regenerating Alice Manifest...")
    
    # Read Alice text
    try:
        with open("docs/alice-in-wonderland.txt", "r", encoding="utf-8") as f:
            content = f.read()
    except FileNotFoundError:
        print("docs/alice-in-wonderland.txt not found!")
        return

    # Process using Ingestor (which uses LangExtractService with Gemini 2.5)
    manifest = process_book_content("Alice in Wonderland", content)
    
    if manifest:
        # Save to root (where React app reads it, or update VITE_STARTER_FOLDER_ID logic)
        # Actually the frontend reads manifests from `public/library` or similar usually.
        # But for this prototype, let's update `alice_manifest.json` in root if exists
        # or create it.
        
        output_path = "alice_manifest.json"
        with open(output_path, "w", encoding="utf-8") as f:
            json.dump(manifest, f, indent=2)
        print(f"Successfully saved to {output_path}")
        
        # Also log scenes count
        print(f"Extracted {len(manifest.get('scenes', []))} scenes.")
    else:
        print("Failed to generate manifest.")

if __name__ == "__main__":
    regenerate()
