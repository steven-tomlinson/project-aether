import os
import requests
from dotenv import load_dotenv

load_dotenv()

keys = {
    "GEMINI_API_KEY": os.getenv("GEMINI_API_KEY"),
    "VITE_GOOGLE_API_KEY": os.getenv("VITE_GOOGLE_API_KEY")
}

models = ["gemini-2.5-flash", "gemini-3.0-flash"]

print("--- Auth Diagnostic ---")

for key_name, key_val in keys.items():
    if not key_val:
        print(f"Skipping {key_name} (Empty)")
        continue
    
    print(f"\nTesting {key_name}: {key_val[:10]}...")
    
    for model in models:
        # Method 1: Query Param
        url_query = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={key_val}"
        try:
            resp = requests.post(url_query, json={"contents": [{"parts": [{"text": "hi"}]}]})
            print(f"  {model} (Query Param): {resp.status_code}")
            if resp.status_code == 200:
                print(f"    SUCCESS with {key_name} and Query Param!")
        except Exception as e:
            print(f"  {model} (Query Param) Error: {e}")

        # Method 2: Bearer Token
        url_bearer = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent"
        try:
            headers = {"Authorization": f"Bearer {key_val}"}
            resp = requests.post(url_bearer, headers=headers, json={"contents": [{"parts": [{"text": "hi"}]}]})
            print(f"  {model} (Bearer Token): {resp.status_code}")
            if resp.status_code == 200:
                print(f"    SUCCESS with {key_name} and Bearer Token!")
        except Exception as e:
            print(f"  {model} (Bearer Token) Error: {e}")
