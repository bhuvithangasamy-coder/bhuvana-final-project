import jwt
import os
from datetime import datetime, timedelta
from functools import wraps
from flask import request, jsonify
from config import Config

JWT_SECRET = Config.JWT_SECRET_KEY
JWT_ALGORITHM = 'HS256'

def generate_token(user_id, username, email, role='job_seeker'):
    """Generate JWT token"""
    payload = {
        'user_id': user_id,
        'username': username,
        'email': email,
        'role': role,
        'iat': datetime.utcnow(),
        'exp': datetime.utcnow() + timedelta(days=30)
    }
    token = jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)
    return token

def generate_reset_token(user_id, email, is_recruiter=False):
    """Generate short-lived JWT token for password reset"""
    payload = {
        'reset_user_id': user_id,
        'email': email,
        'is_recruiter': is_recruiter,
        'iat': datetime.utcnow(),
        'exp': datetime.utcnow() + timedelta(hours=1)
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)

def verify_reset_token(token):
    """Verify reset token"""
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        return payload if 'reset_user_id' in payload else None
    except:
        return None

def verify_token(token):
    """Verify JWT token"""
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        return payload
    except jwt.ExpiredSignatureError:
        return None
    except jwt.InvalidTokenError:
        return None

def token_required(f):
    """Decorator for protected routes"""
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        if 'Authorization' in request.headers:
            auth_header = request.headers['Authorization']
            try:
                token = auth_header.split(" ")[1]
            except IndexError:
                return jsonify({'message': 'Invalid token format'}), 401
        
        if not token:
            return jsonify({'message': 'Token is missing'}), 401
        
        payload = verify_token(token)
        if not payload:
            return jsonify({'message': 'Invalid or expired token'}), 401
        
        return f(payload, *args, **kwargs)
    return decorated
