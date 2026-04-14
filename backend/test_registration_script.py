import requests
import json

def test_registration():
    url = "http://127.0.0.1:8000/api/auth/register/"
    data = {
        "name": "Test User",
        "email": "test@example.com",
        "password": "password123",
        "phone_number": "1234567890",
        "country": "India",
        "skills": "React, Python",
        "experience": "5 years",
        "role": "User"
    }
    
    # Try with JSON first
    print("Testing registration with JSON...")
    try:
        response = requests.post(url, json=data)
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.text}")
    except Exception as e:
        print(f"Error: {e}")

    # Try with MultiPart if JSON fails
    print("\nTesting registration with MultiPart...")
    try:
        response = requests.post(url, data=data)
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.text}")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    test_registration()
