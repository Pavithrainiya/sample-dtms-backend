import os
import django
from decouple import config
import json

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from tasks.models import Submission, Task
from tasks.views import call_gemini_rest

def test_evaluate_simulation():
    submission = Submission.objects.first()
    if not submission:
        print("No submissions found to test.")
        return
        
    task = submission.task
    api_key = config('GEMINI_API_KEY', default=None)
    if not api_key:
        print("Error: Gemini API Key not configured.")
        return
        
    prompt = f"""
    You are an expert Talent Evaluator AI.
    Evaluate this user's submission against the task instructions.
    
    TASK TITLE: {task.title}
    TASK DESCRIPTION: {task.description}
    
    USER SUBMISSION CONTENT:
    {submission.content}
    
    Provide a JSON response strictly exactly matching this format with no markdown wrappers:
    {{
        "score": 85,
        "feedback": "Detailed constructive feedback here...",
        "recommended_status": "Reviewed"
    }}
    """
    
    print("Testing Simulation of evaluate action...")
    result = call_gemini_rest(prompt)
    if "error" in result:
        print(f"❌ Gemini Error: {result['error']}")
    else:
        text = result['text']
        print(f"✅ Gemini Response Text: {text}")
        try:
            import re
            match = re.search(r'\{.*\}', text, re.DOTALL)
            if match:
                cleaned_json = match.group(0)
            else:
                cleaned_json = text
            data = json.loads(cleaned_json)
            print(f"✅ Successfully parsed JSON: {data}")
        except Exception as e:
            print(f"❌ JSON Parse Error: {e}")

if __name__ == "__main__":
    test_evaluate_simulation()
