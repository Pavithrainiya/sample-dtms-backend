import urllib.request
import urllib.error
import json

data = json.dumps({"username": "test@test.com", "password": "TestPassword123!"}).encode('utf-8')
req = urllib.request.Request("http://localhost:8000/api/auth/login/", data=data, headers={"Content-Type": "application/json"})

try:
    with urllib.request.urlopen(req) as response:
        print("Success:", response.read().decode())
except urllib.error.HTTPError as e:
    print("HTTPError:", e.code)
    print("Body:", e.read().decode())
