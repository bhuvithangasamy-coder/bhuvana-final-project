#!/usr/bin/env python3
"""
Test script to simulate resume upload flow end-to-end.
This creates a user, logs in, and uploads a test PDF to diagnose issues.
"""
import sys
import os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'backend'))

from app import create_app
from database import db
from models import User
from utils.jwt_utils import generate_token
import requests
from io import BytesIO

# Initialize app
app = create_app()

print("=" * 60)
print("Resume Upload Test Suite")
print("=" * 60)

with app.app_context():
    # Check database
    print("\n1. Checking database...")
    try:
        user_count = User.query.count()
        print(f"   ✓ Database connected. Users in DB: {user_count}")
    except Exception as e:
        print(f"   ✗ Database error: {e}")
        sys.exit(1)

    # Create or get test user
    print("\n2. Setting up test user...")
    test_email = "tester@example.com"
    test_user = User.query.filter_by(email=test_email).first()
    if not test_user:
        test_user = User(username="tester", email=test_email, password="hashed_pwd")
        db.session.add(test_user)
        db.session.commit()
        print(f"   ✓ Created test user: {test_email}")
    else:
        print(f"   ✓ Using existing test user: {test_email}")

    # Generate token
    print("\n3. Generating JWT token...")
    token = generate_token(test_user.id, test_user.username, test_user.email)
    print(f"   ✓ Token: {token[:50]}...")

    # Create test PDF
    print("\n4. Creating test PDF...")
    pdf_content = b"%PDF-1.4\n1 0 obj\n<< /Type /Catalog >>\nendobj\nxref\n0 1\n0000000000 65535 f\ntrailer\n<< /Size 1 /Root 1 0 R >>\nstartxref\n45\n%%EOF"
    print(f"   ✓ Test PDF created ({len(pdf_content)} bytes)")

    # Test upload via API
    print("\n5. Testing upload endpoint...")
    try:
        files = {'file': ('test_resume.pdf', BytesIO(pdf_content), 'application/pdf')}
        headers = {'Authorization': f'Bearer {token}'}
        
        response = requests.post(
            'http://localhost:5000/api/resume/upload',
            files=files,
            headers=headers
        )
        
        print(f"   Response status: {response.status_code}")
        print(f"   Response body: {response.text[:200]}")
        
        if response.status_code == 200:
            print("   ✓ Upload successful!")
            data = response.json()
            print(f"   ATS Score: {data.get('resume', {}).get('ats_score')}")
            print(f"   Skills: {data.get('resume', {}).get('skills')}")
        else:
            print(f"   ✗ Upload failed: {response.json()}")
    except requests.exceptions.ConnectionError:
        print("   ✗ Cannot connect to backend on localhost:5000")
        print("   Make sure backend is running: python backend/app.py")
    except Exception as e:
        print(f"   ✗ Error: {e}")

print("\n" + "=" * 60)
print("Test complete.")
print("=" * 60)
