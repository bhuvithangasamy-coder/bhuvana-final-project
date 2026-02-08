from flask import Blueprint, request, jsonify
from werkzeug.utils import secure_filename
import os
from app import db
from models import PhotoAnalysis
from utils.jwt_utils import token_required
# from utils.photo_analyzer import analyze_photo  # Disabled due to OpenCV dependency
from config import Config

photo_bp = Blueprint('photo', __name__)

ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'webp'}

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def mock_analyze_photo(file_path: str):
    """Mock photo analysis without OpenCV"""
    return {
        'success': True,
        'professionalism': 82,
        'lighting': 75,
        'background': 78,
        'composition': 85,
        'overall': 80,
        'feedback': [
            '✓ Professional appearance maintained',
            '✓ Face is well-positioned in frame',
            '✓ Background is neutral and appropriate'
        ],
        'suggestions': [
            'Improve lighting by positioning light source to the side',
            'Consider a more neutral background',
            'Ensure camera is at eye level for better composition'
        ]
    }

@photo_bp.route('/upload', methods=['POST'])
@token_required
def upload_photo(payload):
    """Upload and analyze a professional photo"""
    try:
        user_id = payload.get('user_id')
        
        # Check if file is present
        if 'file' not in request.files:
            return jsonify({'message': 'No file provided'}), 400
        
        file = request.files['file']
        
        if file.filename == '':
            return jsonify({'message': 'No file selected'}), 400
        
        if not allowed_file(file.filename):
            return jsonify({'message': 'Only image files allowed (png, jpg, jpeg, gif, webp)'}), 400
        
        # Create uploads directory if not exists
        os.makedirs(Config.PHOTO_FOLDER, exist_ok=True)
        
        # Save file
        filename = secure_filename(f"{user_id}_{file.filename}")
        file_path = os.path.join(Config.PHOTO_FOLDER, filename)
        file.save(file_path)
        
        # Analyze photo (using mock for now)
        analysis_result = mock_analyze_photo(file_path)
        
        # Delete existing photo analysis if any
        PhotoAnalysis.query.filter_by(user_id=user_id).delete()
        
        # Save analysis to database
        photo_analysis = PhotoAnalysis(
            user_id=user_id,
            filename=filename,
            file_path=file_path,
            professionalism_score=analysis_result['professionalism'],
            lighting_score=analysis_result['lighting'],
            background_score=analysis_result['background'],
            composition_score=analysis_result['composition'],
            overall_score=analysis_result['overall'],
            feedback=analysis_result['feedback'],
            suggestions=analysis_result['suggestions']
        )
        
        db.session.add(photo_analysis)
        db.session.commit()
        
        return jsonify({
            'message': 'Photo uploaded and analyzed successfully',
            'filename': filename,
            'analysis': {
                'professionalism': round(analysis_result['professionalism'], 2),
                'lighting': round(analysis_result['lighting'], 2),
                'background': round(analysis_result['background'], 2),
                'composition': round(analysis_result['composition'], 2),
                'overall': round(analysis_result['overall'], 2),
                'feedback': analysis_result['feedback'],
                'suggestions': analysis_result['suggestions']
            }
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': f'Error: {str(e)}'}), 500

@photo_bp.route('/get', methods=['GET'])
@token_required
def get_photo_analysis(payload):
    """Get user's photo analysis"""
    try:
        user_id = payload.get('user_id')
        
        photo_analysis = PhotoAnalysis.query.filter_by(user_id=user_id).first()
        
        if not photo_analysis:
            return jsonify({'message': 'No photo analysis found'}), 404
        
        return jsonify({
            'message': 'Photo analysis retrieved successfully',
            'filename': photo_analysis.filename,
            'analysis': {
                'professionalism': round(photo_analysis.professionalism_score, 2),
                'lighting': round(photo_analysis.lighting_score, 2),
                'background': round(photo_analysis.background_score, 2),
                'composition': round(photo_analysis.composition_score, 2),
                'overall': round(photo_analysis.overall_score, 2),
                'feedback': photo_analysis.feedback,
                'suggestions': photo_analysis.suggestions
            },
            'uploaded_at': photo_analysis.analyzed_at.isoformat() if hasattr(photo_analysis, 'analyzed_at') else None
        }), 200
        
    except Exception as e:
        return jsonify({'message': f'Error: {str(e)}'}), 500

@photo_bp.route('/delete', methods=['DELETE'])
@token_required
def delete_photo(payload):
    """Delete user's photo and analysis"""
    try:
        user_id = payload.get('user_id')
        
        photo_analysis = PhotoAnalysis.query.filter_by(user_id=user_id).first()
        
        if not photo_analysis:
            return jsonify({'message': 'No photo to delete'}), 404
        
        # Delete file from disk
        if os.path.exists(photo_analysis.file_path):
            os.remove(photo_analysis.file_path)
        
        # Delete from database
        db.session.delete(photo_analysis)
        db.session.commit()
        
        return jsonify({'message': 'Photo deleted successfully'}), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': f'Error: {str(e)}'}), 500

@photo_bp.route('/sample-analysis', methods=['GET'])
@token_required
def sample_analysis(payload):
    """Get a sample analysis for demonstration"""
    try:
        sample = {
            'filename': 'sample_photo.jpg',
            'analysis': {
                'professionalism': 85.5,
                'lighting': 78.3,
                'background': 82.1,
                'composition': 88.9,
                'overall': 83.7,
                'feedback': [
                    '✓ Professional appearance maintained',
                    '✓ Face is well-centered in the frame',
                    '✓ Background is neutral and non-distracting'
                ],
                'suggestions': [
                    'Improve lighting: consider a simple desk lamp positioned to the side',
                    'Ensure consistent, bright background without shadows',
                    'Position camera at eye level for best composition'
                ]
            }
        }
        
        return jsonify({
            'message': 'Sample analysis retrieved',
            'sample': sample
        }), 200
        
    except Exception as e:
        return jsonify({'message': f'Error: {str(e)}'}), 500
