import requests
import sys

def verify():
    try:
        print("Querying http://localhost:3000/api/library...")
        resp = requests.get("http://localhost:3000/api/library")
        resp.raise_for_status()
        books = resp.json()
        
        print(f"Found {len(books)} books.")
        
        found_alice = False
        for book in books:
            if "(Local Dev)" in book.get("title", ""):
                print(f"SUCCESS: Found injected book: {book['title']}")
                found_alice = True
                # verify scenes
                scenes = book.get("scenes", [])
                print(f"Scenes count: {len(scenes)}")
                if len(scenes) > 0:
                     print(f"First scene sample: {scenes[0].get('text')[:50]}...")
                break
        
        if not found_alice:
            print("FAILURE: Did not find 'Alice' with '(Local Dev)' suffix.")
            sys.exit(1)
            
    except Exception as e:
        print(f"Error: {e}")
        sys.exit(1)

if __name__ == "__main__":
    verify()
