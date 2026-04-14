import os
import django
import logging
from decouple import config

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from tasks.views import call_gemini_rest
from unittest.mock import patch, MagicMock

# Setup logging to capture output
logger = logging.getLogger('tasks.views')
logger.setLevel(logging.ERROR)
handler = logging.StreamHandler()
logger.addHandler(handler)

def test_key_scrubbing():
    print("\n--- Testing Gemini API Key Scrubbing ---")
    api_key = config('GEMINI_API_KEY', default='FAKE_KEY_12345')
    
    # Mock requests.post to raise an error containing the API key
    with patch('requests.post') as mock_post:
        mock_post.side_effect = Exception(f"Failed to connect to https://.../?key={api_key}")
        
        print(f"Original error would contain: {api_key}")
        result = call_gemini_rest("test prompt")
        
        if "[REDACTED_API_KEY]" in result['error']:
            print("✅ SUCCESS: API Key was scrubbed from the returned error message.")
        else:
            print("❌ FAILED: API Key was still present in the error message.")

def test_admin_rag_context():
    print("\n--- Testing Admin RAG Context (Logic Verification) ---")
    from accounts.models import User
    from tasks.models import Task, Submission
    from rest_framework.test import APIRequestFactory, force_authenticate
    from tasks.views import MissionAnalystView
    
    factory = APIRequestFactory()
    view = MissionAnalystView.as_view()
    
    admin = User.objects.filter(role='Admin').first()
    if not admin:
        print("⚠️ No Admin found, skipping.")
        return

    request = factory.post('/api/tasks/ai-analyst/', {'query': 'Give me a summary'}, format='json')
    force_authenticate(request, user=admin)
    
    # We won't actually call the API (to save credits), just check the context building logic
    with patch('tasks.views.call_gemini_rest') as mock_call:
        mock_call.return_value = {"text": "Mock Response"}
        response = view(request)
        
        # Check call arguments
        context_sent = mock_call.call_args[0][0]
        if "DTMS GLOBAL SYSTEM CONTEXT (ADMIN ACCESS):" in context_sent:
            print("✅ SUCCESS: Admin received global system context.")
        else:
            print("❌ FAILED: Admin did not receive global context.")

if __name__ == "__main__":
    test_key_scrubbing()
    test_admin_rag_context()
