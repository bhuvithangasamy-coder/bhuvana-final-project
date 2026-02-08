from flask import Blueprint, request, jsonify
from app import db
from models import Resume, Job
from utils.jwt_utils import token_required
from utils.job_matcher import match_jobs, TEST_JOBS

jobs_bp = Blueprint('jobs', __name__)

@jobs_bp.route('/matches', methods=['GET'])
@token_required
def get_job_matches(payload):
    """Get job matches based on user's resume"""
    try:
        user_id = payload['user_id']
        resume = Resume.query.filter_by(user_id=user_id).first()
        
        if not resume:
            return jsonify({
                'message': 'No resume found. Please upload your resume first.',
                'jobs': []
            }), 200
        
        # Match jobs with resume skills
        matched_jobs = match_jobs(resume.skills, TEST_JOBS)
        
        return jsonify({
            'message': 'Job matches retrieved successfully',
            'jobs': matched_jobs,
            'resume_skills': resume.skills
        }), 200
        
    except Exception as e:
        return jsonify({'message': f'Error: {str(e)}'}), 500

@jobs_bp.route('/all', methods=['GET'])
@token_required
def get_all_jobs(payload):
    """Get all available jobs"""
    try:
        return jsonify({
            'message': 'All jobs retrieved successfully',
            'jobs': TEST_JOBS
        }), 200
        
    except Exception as e:
        return jsonify({'message': f'Error: {str(e)}'}), 500

@jobs_bp.route('/<int:job_id>', methods=['GET'])
@token_required
def get_job_detail(payload, job_id):
    """Get job details"""
    try:
        job = next((j for j in TEST_JOBS if j['id'] == job_id), None)
        
        if not job:
            return jsonify({'message': 'Job not found'}), 404
        
        return jsonify({
            'message': 'Job details retrieved successfully',
            'job': job
        }), 200
        
    except Exception as e:
        return jsonify({'message': f'Error: {str(e)}'}), 500
