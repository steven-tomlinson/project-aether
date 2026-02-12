
import os
import sys
import logging
from dotenv import load_dotenv

# Ensure backend is in path
sys.path.append(os.getcwd())

from backend.services.langextract_service import LangExtractService

# Setup logging
logging.basicConfig(filename='langextract_debug.log', level=logging.DEBUG)

def test_service():
    print("Testing LangExtractService...")
    load_dotenv()
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        print("No API Key found!")
        return

    service = LangExtractService(api_key=api_key)
    
    # Short sample text
    # Read full Alice text
    with open('docs/alice-in-wonderland.txt', 'r', encoding='utf-8') as f:
        text = f.read()
    
    print(f"Input text length: {len(text)}")
    
    try:
        result = service.extract_analysis(text)
        print("Extraction Result:")
        import json
        print(json.dumps(result, indent=2))
    except Exception as e:
        print(f"Service Verification Failed: {e}")
        logging.exception("Service Verification Failed")

if __name__ == "__main__":
    test_service()
