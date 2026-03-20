import os
from datetime import timedelta

class Config:
    """Base configuration"""
    BASE_DIR = os.path.dirname(os.path.abspath(__file__))
    SQLALCHEMY_DATABASE_URI = f'sqlite:///{os.path.join(BASE_DIR, "resumeai.db")}'
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    JWT_SECRET_KEY = os.environ.get('JWT_SECRET_KEY', 'your-secret-key-change-in-production')
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(days=30)
    # Flask session secret key (used for server-side sessions if needed)
    SECRET_KEY = os.environ.get('SECRET_KEY', JWT_SECRET_KEY)
    UPLOAD_FOLDER = 'uploads'
    RESUME_FOLDER = 'uploads/resumes'
    PHOTO_FOLDER = 'uploads/photos'
    MAX_CONTENT_LENGTH = 16 * 1024 * 1024  # 16MB max file size
    
    # Ensure upload folders exist
    os.makedirs(UPLOAD_FOLDER, exist_ok=True)
    os.makedirs(RESUME_FOLDER, exist_ok=True)
    os.makedirs(PHOTO_FOLDER, exist_ok=True)
