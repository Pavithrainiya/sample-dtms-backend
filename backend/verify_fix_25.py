import os
import google.generativeai as genai
from decouple import config
import re
import json

def verify_gemini_fix():
    print("--- DTMS Gemini Fix Verification (gemini-2.5-flash) ---")
    
    # 1. Test Environment Loading
    api_key = config('GEMINI_API_KEY', default=None)
    if not api_key:
        print("❌ FAILED: GEMINI_API_KEY not found via decouple.config")
        return
    else:
        print(f"✅ SUCCESS: API Key found ({api_key[:5]}...{api_key[-5:]})")

    # 2. Test Model Connectivity
    print("\nTesting connectivity with 'gemini-2.5-flash'...")
    try:
        genai.configure(api_key=api_key)
        model = genai.GenerativeModel('gemini-2.5-flash')
        
        prompt = "Return exactly: {\"status\": \"ok\"}"
        response = model.generate_content(prompt)
        print(f"Raw Response: {response.text}")
        
        # 3. Test Robust JSON Parsing (Logic from views.py)
        text = response.text
        match = re.search(r'\{.*\}', text, re.DOTALL)
        if match:
            cleaned_json = match.group(0)
            print(f"Extracted JSON: {cleaned_json}")
            data = json.loads(cleaned_json)
            print(f"✅ SUCCESS: JSON parsed correctly. Status: {data.get('status')}")
        else:
            print("❌ FAILED: Could not extract JSON from response")
            
    except Exception as e:
        print(f"❌ FAILED: Gemini API Error: {str(e)}")

if __name__ == "__main__":
    verify_gemini_fix()
