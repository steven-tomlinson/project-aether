
try:
    import google.generativeai as old_genai
    print("google.generativeai is available.")
    print(f"Version: {old_genai.__version__}")
except ImportError:
    print("google.generativeai is NOT available.")

try:
    import google.genai as new_genai
    print("google.genai is available.")
except ImportError:
    print("google.genai is NOT available.")
