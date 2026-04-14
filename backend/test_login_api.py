import requests
import json

print("=" * 60)
print("TESTING LOGIN API")
print("=" * 60)

# Test data
email = "pavithrakumaran010622@gmail.com"
password = "Sahana@123"

print(f"\nAttempting login with:")
print(f"Email: {email}")
print(f"Password: {password}")

# Make request
url = "http://localhost:8000/api/auth/login/"
data = {
    "email": email,
    "password": password
}

print(f"\nPOST {url}")
print(f"Data: {json.dumps(data, indent=2)}")

try:
    response = requests.post(url, json=data)
    print(f"\nStatus Code: {response.status_code}")
    print(f"Response: {json.dumps(response.json(), indent=2)}")
    
    if response.status_code == 200:
        print("\n✅ LOGIN SUCCESSFUL!")
    else:
        print("\n❌ LOGIN FAILED!")
        
except Exception as e:
    print(f"\n❌ ERROR: {e}")
    print(f"Response text: {response.text if 'response' in locals() else 'No response'}")
