from flask import Blueprint, request, jsonify
from werkzeug.utils import secure_filename
from app import db
from config import Config
from models import Resume, User
from utils.jwt_utils import token_required
from utils.resume_parser import parse_resume
import os

resume_bp = Blueprint('resume', __name__)

ALLOWED_EXTENSIONS = {'pdf'}

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@resume_bp.route('/upload', methods=['POST'])
@token_required
def upload_resume(payload):
    """Upload and parse resume"""
    try:
        user_id = payload['user_id']
        user = User.query.get(user_id)
        
        if not user:
            return jsonify({'message': 'User not found'}), 404
        
        if 'file' not in request.files:
            return jsonify({'message': 'No file provided'}), 400
        
        file = request.files['file']
        
        if file.filename == '':
            return jsonify({'message': 'No file selected'}), 400
        
        if not allowed_file(file.filename):
            return jsonify({'message': 'Only PDF files are allowed'}), 400
        
        # Save file
        filename = secure_filename(f"resume_{user_id}_{file.filename}")
        filepath = os.path.join(Config.RESUME_FOLDER, filename)
        file.save(filepath)
        
        # Parse resume
        parse_result = parse_resume(filepath)
        
        if not parse_result['success']:
            os.remove(filepath)
            return jsonify({'message': parse_result['error']}), 400
        
        # Delete old resume if exists
        old_resume = Resume.query.filter_by(user_id=user_id).first()
        if old_resume:
            old_filepath = old_resume.file_path
            if os.path.exists(old_filepath):
                os.remove(old_filepath)
            db.session.delete(old_resume)
        
        # Save to database
        resume = Resume(
            user_id=user_id,
            filename=file.filename,
            file_path=filepath,
            ats_score=parse_result['ats_score'],
            skills=parse_result['skills'],
            extracted_data={
                'email': parse_result.get('email'),
                'phone': parse_result.get('phone')
            }
        )
        
        db.session.add(resume)
        db.session.commit()
        
        return jsonify({
            'message': 'Resume uploaded successfully',
            'resume': {
                'id': resume.id,
                'filename': resume.filename,
                'ats_score': resume.ats_score,
                'skills': resume.skills,
                'uploaded_at': resume.created_at.isoformat()
            }
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': f'Error: {str(e)}'}), 500

@resume_bp.route('/get', methods=['GET'])
@token_required
def get_resume(payload):
    """Get user's resume"""
    try:
        user_id = payload['user_id']
        resume = Resume.query.filter_by(user_id=user_id).first()
        
        if not resume:
            return jsonify({'message': 'No resume found'}), 404
        
        return jsonify({
            'resume': {
                'id': resume.id,
                'filename': resume.filename,
                'ats_score': resume.ats_score,
                'skills': resume.skills,
                'uploaded_at': resume.created_at.isoformat()
            }
        }), 200
        
    except Exception as e:
        return jsonify({'message': f'Error: {str(e)}'}), 500

@resume_bp.route('/delete', methods=['DELETE'])
@token_required
def delete_resume(payload):
    """Delete resume"""
    try:
        user_id = payload['user_id']
        resume = Resume.query.filter_by(user_id=user_id).first()
        
        if not resume:
            return jsonify({'message': 'No resume found'}), 404
        
        # Delete file
        if os.path.exists(resume.file_path):
            os.remove(resume.file_path)
        
        db.session.delete(resume)
        db.session.commit()
        
        return jsonify({'message': 'Resume deleted successfully'}), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': f'Error: {str(e)}'}), 500
