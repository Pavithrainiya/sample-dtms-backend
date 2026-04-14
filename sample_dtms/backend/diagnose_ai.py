import os
import google.generativeai as genai
from decouple import config

# Load key directly
api_key = config('GEMINI_API_KEY', default='')
print(f"API Key loaded: {api_key[:10]}... (Total length: {len(api_key)})")

if not api_key:
    print("ERROR: No API Key found in .env!")
else:
    try:
        genai.configure(api_key=api_key)
        model = genai.GenerativeModel('gemini-1.5-flash')
        print("Testing content generation...")
        response = model.generate_content("Say 'Gemini is online'.")
        print(f"RESULT: {response.text}")
    except Exception as e:
        print(f"FAILED with error: {str(e)}")
