import os
import google.generativeai as genai
from decouple import config

api_key = config('GEMINI_API_KEY', default=None)
if not api_key:
    # Try direct .env read if decouple fails
    try:
        from dotenv import load_dotenv
        load_dotenv()
        api_key = os.getenv('GEMINI_API_KEY')
    except:
        pass

print(f"API Key: {api_key[:5]}...{api_key[-5:]}" if api_key else "API Key: NOT FOUND")

if api_key:
    try:
        genai.configure(api_key=api_key)
        print("Listing models...")
        for m in genai.list_models():
            if 'generateContent' in m.supported_generation_methods:
                print(m.name)
    except Exception as e:
        print(f"Error: {e}")
