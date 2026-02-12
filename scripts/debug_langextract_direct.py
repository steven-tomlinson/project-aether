
import os
import langextract
from dotenv import load_dotenv

load_dotenv()
api_key = os.getenv("GEMINI_API_KEY")

def test_simple_extract():
    print("Testing simple LangExtract...")
    text = "John Doe is a 30 year old engineer living in New York."
    
    try:
        # Minimal usage without custom schema constraints first
        # Just text and a simple prompt
        results = langextract.extract(
            text_or_documents=text,
            prompt_description="Extract the person's name and age.",
            model_id="gemini-2.5-flash",
            api_key=api_key
        )
        print("Success!")
        print(results)
    except Exception as e:
        print(f"Failed: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    test_simple_extract()
