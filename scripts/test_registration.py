#!/usr/bin/env python3
"""
Simple script to test the registration endpoint without needing to use curl or browser
"""

import requests
import json
import sys
from datetime import datetime

BASE_URL = "http://localhost:8000/api/v1"
REGISTER_URL = f"{BASE_URL}/auth/register/"

def test_registration(email, full_name, password, country_code="uganda", role="student"):
    """Test the registration endpoint"""
    
    payload = {
        "email": email,
        "full_name": full_name,
        "password": password,
        "country_code": country_code,
        "role": role
    }
    
    print(f"\n📝 Testing Registration Endpoint")
    print(f"🔗 URL: {REGISTER_URL}")
    print(f"📦 Payload: {json.dumps(payload, indent=2)}")
    print("-" * 60)
    
    try:
        response = requests.post(REGISTER_URL, json=payload, timeout=5)
        
        print(f"✅ Status Code: {response.status_code}")
        print(f"📋 Response:")
        print(json.dumps(response.json(), indent=2))
        
        if response.status_code == 201:
            print(f"\n✨ SUCCESS! User registered:")
            user_data = response.json()
            print(f"   ID: {user_data.get('id')}")
            print(f"   Email: {user_data.get('email')}")
            print(f"   Role: {user_data.get('role')}")
            return True
        else:
            print(f"\n❌ Registration failed: {response.status_code}")
            return False
            
    except requests.exceptions.ConnectionError:
        print(f"❌ Connection Error: Is the backend running on {BASE_URL}?")
        print(f"   Run: ./start-backend.sh")
        return False
    except Exception as e:
        print(f"❌ Error: {str(e)}")
        return False

def main():
    print("=" * 60)
    print("🎯 Edify Backend Registration Test")
    print("=" * 60)
    
    # Generate unique email based on timestamp
    timestamp = datetime.now().strftime("%H%M%S")
    test_email = f"test-{timestamp}@edify.local"
    
    # Run test
    success = test_registration(
        email=test_email,
        full_name="Test User",
        password="TestPassword123",
        country_code="uganda",
        role="student"
    )
    
    print("\n" + "=" * 60)
    if success:
        print("✅ Backend is working! Proceed to frontend integration.")
    else:
        print("❌ Check backend status and try again.")
    print("=" * 60 + "\n")
    
    return 0 if success else 1

if __name__ == "__main__":
    sys.exit(main())
