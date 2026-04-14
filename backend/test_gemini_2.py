import os
import google.generativeai as genai
from decouple import config

api_key = config('GEMINI_API_KEY', default=None)
if not api_key:
    api_key = os.environ.get('GEMINI_API_KEY')

print(f"API Key: {api_key[:5]}...{api_key[-5:]}" if api_key else "API Key: NOT FOUND")

if api_key:
    genai.configure(api_key=api_key)
    for model_name in ['gemini-1.5-flash', 'gemini-2.5-flash']:
        print(f"\nTesting {model_name}...")
        try:
            model = genai.GenerativeModel(model_name)
            response = model.generate_content("Ping")
            print(f"SUCCESS: {response.text}")
        except Exception as e:
            print(f"FAILED: {e}")
