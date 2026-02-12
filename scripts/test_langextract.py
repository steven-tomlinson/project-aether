
import os
import sys
import json
from dotenv import load_dotenv
import langextract
from langextract.core import data

# Load environment variables
load_dotenv() # Defaults to .env in CWD
api_key = os.getenv("GEMINI_API_KEY")

if not api_key:
    print("Error: GEMINI_API_KEY not found in backend/.env")
    sys.exit(1)

# Read sample text
with open("scripts/sample_book.txt", "r", encoding="utf-8") as f:
    text = f.read()

# Define Examples (Few-Shot)
# We want to extract Metadata and Scenes

examples = [
    data.ExampleData(
        text="The sprawling neon city of Neo-Tokyo hummed with energy. It was 2049. Rain slicked the streets as Kaito ran from the corporate security drones. He dived into a dark alleyway, panting.",
        extractions=[
            data.Extraction(
                extraction_class="Metadata",
                extraction_text="The sprawling neon city of Neo-Tokyo hummed with energy. It was 2049.",
                attributes={
                    "genre": "Cyberpunk",
                    "tone": "Tense, Atmospheric",
                    "setting": "Neo-Tokyo, 2049"
                }
            ),
            data.Extraction(
                extraction_class="Scene",
                extraction_text="Rain slicked the streets as Kaito ran from the corporate security drones. He dived into a dark alleyway, panting.",
                attributes={
                    "summary": "Kaito chases through the rain-slicked streets of Neo-Tokyo, escaping drones.",
                    "visual_prompt": "Cyberpunk alleyway, neon signs reflecting on wet pavement, dark shadows, man running, high contrast, cinematic lighting.",
                    "video_prompt": "Camera tracking a man running through a rainy futuristic alley, drones flying overhead with searchlights."
                }
            )
        ]
    )
]

print("Initializing extraction...")

try:
    # Call extract
    result = langextract.extract(
        text_or_documents=text,
        prompt_description="Extract the book's Metadata (Genre, Tone, Setting) and break the narrative into Scenes. For each Scene, provide a summary and generative prompts for images and video.",
        examples=examples,
        model_id="gemini-2.5-flash", # Using 2.5 Flash as per strict user requirement
        api_key=api_key,
        max_char_buffer=2000 # Allow larger chunks
    )

    print("\nExtraction Successful!")
    print("-" * 30)
    
    # Process Results
    extractions = result.extractions
    if extractions:
        for ext in extractions:
            print(f"Class: {ext.extraction_class}")
            print(f"Text: {ext.extraction_text[:50]}...")
            print(f"Attributes: {json.dumps(ext.attributes, indent=2)}")
            print(f"Interval: {ext.char_interval}")
            print("-" * 20)
    else:
        print("No extractions found.")

except Exception as e:
    print(f"Extraction failed: {e}")
