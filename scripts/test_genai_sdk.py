import os
from google import genai
from dotenv import load_dotenv

load_dotenv()

api_key = os.getenv("GEMINI_API_KEY")
print(f"Key: {api_key[:10]}...")

client = genai.Client(api_key=api_key)
print(f"Client initialized: {client}")

try:
    print("Available Models:")
    for model in client.models.list():
        print(f" - {model.name}")
except Exception as e:
    print(f"List Error: {e}")

try:
    response = client.models.generate_content(
        model="gemini-2.0-flash", 
        contents="Say 'SDK Success'"
    )
    print(f"Response: {response.text}")
except Exception as e:
    print(f"Generate Error: {e}")
