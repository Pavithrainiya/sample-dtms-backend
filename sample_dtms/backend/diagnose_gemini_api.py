import os
import django
from decouple import config

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from tasks.views import call_gemini_rest

def diagnose_gemini():
    api_key = config('GEMINI_API_KEY', default='Missing')
    print(f"Using API Key: {api_key[:10]}...")
    
    prompt = "Say hello"
    print(f"\nTesting prompt: {prompt}")
    result = call_gemini_rest(prompt)
    
    if "error" in result:
        print(f"❌ Error: {result['error']}")
    else:
        print(f"✅ Success: {result['text'][:100]}...")

if __name__ == "__main__":
    diagnose_gemini()
