import urllib.request
import urllib.error
import json
import uuid

# 1. Register
uid = str(uuid.uuid4())[:8]
email = f"user_{uid}@example.com"
username = f"user_{uid}@"
password = "SecurePassword123!"

data = {
    "name": "Test User Name Minimum",
    "email": email,
    "username": username,
    "password": password,
    "role": "User"
}

req_reg = urllib.request.Request(
    "http://localhost:8000/api/auth/register/", 
    data=json.dumps(data).encode(), 
    headers={"Content-Type": "application/json"}
)

try:
    with urllib.request.urlopen(req_reg) as res:
        print("Register Success:", res.read().decode())
except urllib.error.HTTPError as e:
    print("Register HTTPError:", e.read().decode())
    exit(1)

# 2. Login
req_login = urllib.request.Request(
    "http://localhost:8000/api/auth/login/", 
    data=json.dumps({"email": email, "password": password}).encode(), 
    headers={"Content-Type": "application/json"}
)

access_token = None
try:
    with urllib.request.urlopen(req_login) as res:
        tokens = json.loads(res.read().decode())
        access_token = tokens.get("access")
        print("Login Success. Token received:", access_token is not None)
except urllib.error.HTTPError as e:
    print("Login HTTPError:", e.read().decode())
    exit(1)

# 3. Profile
req_profile = urllib.request.Request(
    "http://localhost:8000/api/auth/profile/", 
    headers={"Authorization": f"Bearer {access_token}"}
)

try:
    with urllib.request.urlopen(req_profile) as res:
        print("Profile Fetch Success:", res.read().decode())
except urllib.error.HTTPError as e:
    print("Profile HTTPError:", e.read().decode())
