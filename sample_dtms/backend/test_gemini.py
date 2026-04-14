import os
import google.generativeai as genai
from decouple import config

# Try to load API key from .env using decouple
api_key = config('GEMINI_API_KEY', default=None)
if not api_key:
    # Fallback to os.environ
    api_key = os.environ.get('GEMINI_API_KEY')

print(f"API Key found: {api_key[:5]}...{api_key[-5:]}" if api_key else "API Key not found")

if api_key:
    genai.configure(api_key=api_key)
    
    # Try gemini-1.5-flash
    print("Testing gemini-1.5-flash...")
    try:
        model = genai.GenerativeModel('gemini-1.5-flash')
        response = model.generate_content("Hello, are you working?")
        print(f"Response: {response.text}")
    except Exception as e:
        print(f"Error with gemini-1.5-flash: {e}")

    # Try gemini-2.5-flash (as currently in views.py)
    print("\nTesting gemini-2.5-flash...")
    try:
        model = genai.GenerativeModel('gemini-2.5-flash')
        response = model.generate_content("Hello, are you working?")
        print(f"Response: {response.text}")
    except Exception as e:
        print(f"Error with gemini-2.5-flash: {e}")
