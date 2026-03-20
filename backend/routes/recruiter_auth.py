from flask import Blueprint, request, jsonify, session
from werkzeug.security import generate_password_hash, check_password_hash
from models import Recruiter
from utils.jwt_utils import generate_token, token_required
from functools import wraps
import re

recruiter_auth_bp = Blueprint('recruiter_auth', __name__)

def is_valid_email(email):
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return re.match(pattern, email)

def recruiter_token_required(f):
    """Decorator to ensure user is a recruiter"""
    @wraps(f)
    def decorated(*args, **kwargs):
        # We can reuse token_required logic but add role check
        token = None
        if 'Authorization' in request.headers:
            auth_header = request.headers['Authorization']
            try:
                token = auth_header.split(" ")[1]
            except IndexError:
                return jsonify({'message': 'Invalid token format'}), 401
                
        if not token:
            return jsonify({'message': 'Token is missing'}), 401
            
        from utils.jwt_utils import verify_token
        payload = verify_token(token)
        if not payload:
            return jsonify({'message': 'Invalid or expired token'}), 401
            
        if payload.get('role') not in ['super_admin', 'sub_recruiter', 'viewer']:
            return jsonify({'message': 'Access forbidden: Rectuiter role required'}), 403
            
        return f(payload, *args, **kwargs)
    return decorated


@recruiter_auth_bp.route('/register', methods=['POST'])
def register():
    from database import db
    try:
        data = request.get_json()
        
        required_fields = ['company_name', 'email', 'password', 'phone_number']
        for field in required_fields:
            if not data or not data.get(field):
                return jsonify({'message': f'Missing required field: {field}'}), 400
                
        email = data.get('email').lower().strip()
        company_name = data.get('company_name').strip()
        password = data.get('password')
        phone_number = data.get('phone_number').strip()
        
        if not is_valid_email(email):
            return jsonify({'message': 'Invalid email format'}), 400
        if len(password) < 6:
            return jsonify({'message': 'Password must be at least 6 characters'}), 400
            
        if Recruiter.query.filter_by(email=email).first():
            return jsonify({'message': 'Email already registered as a recruiter'}), 400
            
        recruiter = Recruiter(
            company_name=company_name,
            email=email,
            password=generate_password_hash(password),
            phone_number=phone_number,
            role='super_admin' # first one is super admin by default, or configurable
        )
        
        db.session.add(recruiter)
        db.session.commit()
        
        token = generate_token(recruiter.id, recruiter.company_name, recruiter.email, role=recruiter.role)
        
        return jsonify({
            'message': 'Recruiter registered successfully',
            'recruiter': {
                'id': recruiter.id,
                'company_name': recruiter.company_name,
                'email': recruiter.email,
                'role': recruiter.role
            },
            'token': token
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': f'Error: {str(e)}'}), 500


@recruiter_auth_bp.route('/login', methods=['POST'])
def login():
    try:
        data = request.get_json()
        
        if not data or not data.get('email') or not data.get('password'):
            return jsonify({'message': 'Missing email or password'}), 400
            
        email = data.get('email').lower().strip()
        password = data.get('password')
        
        recruiter = Recruiter.query.filter_by(email=email).first()
        
        if not recruiter or not check_password_hash(recruiter.password, password):
            return jsonify({'message': 'Invalid email or password'}), 401
            
        try:
            session['role'] = recruiter.role
            session['recruiter_id'] = recruiter.id
        except Exception:
            pass
            
        token = generate_token(recruiter.id, recruiter.company_name, recruiter.email, role=recruiter.role)
        
        return jsonify({
            'message': 'Login successful',
            'recruiter': {
                'id': recruiter.id,
                'company_name': recruiter.company_name,
                'email': recruiter.email,
                'role': recruiter.role
            },
            'token': token
        }), 200
        
    except Exception as e:
        return jsonify({'message': f'Error: {str(e)}'}), 500


@recruiter_auth_bp.route('/forgot-password', methods=['POST'])
def forgot_password():
    try:
        data = request.get_json()
        if not data or not data.get('email'):
            return jsonify({'message': 'Email is required'}), 400
            
        email = data.get('email').lower().strip()
        recruiter = Recruiter.query.filter_by(email=email).first()
        
        if recruiter:
            from utils.jwt_utils import generate_reset_token
            from utils.email_service import send_password_reset_email
            
            reset_token = generate_reset_token(recruiter.id, recruiter.email, is_recruiter=True)
            reset_link = f"http://localhost:5173/recruiter/reset-password?token={reset_token}"
            
            try:
                send_password_reset_email(recruiter.email, reset_link)
            except Exception as email_err:
                print(f"Failed to send reset email: {email_err}")
                
        return jsonify({'message': 'If an account exists with that email, a password reset link has been sent.'}), 200
        
    except Exception as e:
        return jsonify({'message': f'Error: {str(e)}'}), 500

@recruiter_auth_bp.route('/reset-password', methods=['POST'])
def reset_password():
    from database import db
    try:
        data = request.get_json()
        if not data or not data.get('token') or not data.get('password'):
            return jsonify({'message': 'Token and new password are required'}), 400
            
        token = data.get('token')
        new_password = data.get('password')
        
        if len(new_password) < 6:
            return jsonify({'message': 'Password must be at least 6 characters'}), 400
            
        from utils.jwt_utils import verify_reset_token
        payload = verify_reset_token(token)
        
        if not payload or not payload.get('is_recruiter'):
            return jsonify({'message': 'Invalid or expired reset token for recruiter'}), 400
            
        user_id = payload.get('reset_user_id')
        recruiter = Recruiter.query.get(user_id)
        
        if not recruiter:
            return jsonify({'message': 'Recruiter not found'}), 404
            
        recruiter.password = generate_password_hash(new_password)
        db.session.commit()
        
        return jsonify({'message': 'Password has been reset successfully'}), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': f'Error: {str(e)}'}), 500
