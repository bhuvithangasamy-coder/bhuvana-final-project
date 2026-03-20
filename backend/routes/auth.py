from flask import Blueprint, request, jsonify, session
from werkzeug.security import generate_password_hash, check_password_hash
from models import User
from utils.jwt_utils import generate_token, token_required
import re

auth_bp = Blueprint('auth', __name__)

def is_valid_email(email):
    """Validate email format"""
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return re.match(pattern, email)

@auth_bp.route('/register', methods=['POST'])
def register():
    """Register new user"""
    from database import db
    try:
        data = request.get_json()
        
        if not data or not data.get('email') or not data.get('password') or not data.get('username'):
            return jsonify({'message': 'Missing required fields'}), 400
        
        email = data.get('email').lower().strip()
        username = data.get('username').lower().strip()
        password = data.get('password')
        
        # Validation
        if not is_valid_email(email):
            return jsonify({'message': 'Invalid email format'}), 400
        
        if len(password) < 6:
            return jsonify({'message': 'Password must be at least 6 characters'}), 400
        
        if len(username) < 2:
            return jsonify({'message': 'Username must be at least 2 characters'}), 400
        
        # Check if user exists
        if User.query.filter_by(email=email).first():
            return jsonify({'message': 'Email already registered'}), 400
        
        if User.query.filter_by(username=username).first():
            return jsonify({'message': 'Username already taken'}), 400
        
        # Set role (default: job_seeker)
        role = data.get('role', 'job_seeker')
        if role not in ['job_seeker', 'job_poster', 'admin']:
            role = 'job_seeker'
        # Create user
        user = User(
            username=username,
            email=email,
            password=generate_password_hash(password),
            role=role
        )
        
        db.session.add(user)
        db.session.commit()

        # Send welcome email asynchronously or fire-and-forget
        try:
            from utils.email_service import send_welcome_email
            send_welcome_email(user.email, user.username)
        except Exception as email_err:
            print(f"Failed to send welcome email: {email_err}")
        
        token = generate_token(user.id, user.username, user.email)
        
        return jsonify({
            'message': 'User registered successfully',
            'user': {
                'id': user.id,
                'username': user.username,
                'email': user.email,
                'role': user.role,
                'created_at': user.created_at.isoformat()
            },
            'token': token
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': f'Error: {str(e)}'}), 500

@auth_bp.route('/login', methods=['POST'])
def login():
    """Login user"""
    try:
        data = request.get_json()
        
        if not data or not data.get('email') or not data.get('password'):
            return jsonify({'message': 'Missing email or password'}), 400
        
        email = data.get('email').lower().strip()
        password = data.get('password')
        
        user = User.query.filter_by(email=email).first()
        
        if not user or not check_password_hash(user.password, password):
            return jsonify({'message': 'Invalid email or password'}), 401
        
        # Store role in session for convenience (also returned in JWT payload)
        try:
            session['role'] = user.role
            session['user_id'] = user.id
        except Exception:
            # If sessions are not configured, continue without failing login
            pass

        token = generate_token(user.id, user.username, user.email)
        
        return jsonify({
            'message': 'Login successful',
            'user': {
                'id': user.id,
                'username': user.username,
                'email': user.email,
                'role': user.role,
                'created_at': user.created_at.isoformat()
            },
            'token': token
        }), 200
        
    except Exception as e:
        return jsonify({'message': f'Error: {str(e)}'}), 500

# Endpoint to switch user role
@auth_bp.route('/switch-role', methods=['POST'])
@token_required
def switch_role(payload):
    """Switch user role"""
    from database import db
    try:
        user = User.query.get(payload['user_id'])
        if not user:
            return jsonify({'message': 'User not found'}), 404
        data = request.get_json()
        new_role = data.get('role')
        if new_role not in ['job_seeker', 'job_poster', 'admin']:
            return jsonify({'message': 'Invalid role'}), 400
        user.role = new_role
        db.session.commit()
        return jsonify({'message': f'Role switched to {new_role}', 'role': user.role}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': f'Error: {str(e)}'}), 500

@auth_bp.route('/profile', methods=['GET'])
@token_required
def get_profile(payload):
    """Get user profile"""
    try:
        user = User.query.get(payload['user_id'])
        
        if not user:
            return jsonify({'message': 'User not found'}), 404
        
        return jsonify({
            'user': {
                'id': user.id,
                'username': user.username,
                'email': user.email,
                'role': user.role,
                'created_at': user.created_at.isoformat()
            }
        }), 200
        
    except Exception as e:
        return jsonify({'message': f'Error: {str(e)}'}), 500

@auth_bp.route('/verify-token', methods=['GET'])
@token_required
def verify_token(payload):
    """Verify if token is valid"""
    return jsonify({
        'valid': True,
        'user_id': payload.get('user_id')
    }), 200

@auth_bp.route('/forgot-password', methods=['POST'])
def forgot_password():
    """Handle forgot password request"""
    try:
        data = request.get_json()
        if not data or not data.get('email'):
            return jsonify({'message': 'Email is required'}), 400
            
        email = data.get('email').lower().strip()
        user = User.query.filter_by(email=email).first()
        
        if user:
            from utils.jwt_utils import generate_reset_token
            from utils.email_service import send_password_reset_email
            
            reset_token = generate_reset_token(user.id, user.email)
            reset_link = f"http://localhost:5173/reset-password?token={reset_token}"
            
            try:
                send_password_reset_email(user.email, reset_link)
            except Exception as email_err:
                print(f"Failed to send reset email: {email_err}")
                
        # Always return 200 to prevent email enumeration
        return jsonify({'message': 'If an account exists with that email, a password reset link has been sent.'}), 200
        
    except Exception as e:
        return jsonify({'message': f'Error: {str(e)}'}), 500

@auth_bp.route('/reset-password', methods=['POST'])
def reset_password():
    """Reset password using token"""
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
        
        if not payload:
            return jsonify({'message': 'Invalid or expired reset token'}), 400
            
        user_id = payload.get('reset_user_id')
        user = User.query.get(user_id)
        
        if not user:
            return jsonify({'message': 'User not found'}), 404
            
        user.password = generate_password_hash(new_password)
        db.session.commit()
        
        return jsonify({'message': 'Password has been reset successfully'}), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': f'Error: {str(e)}'}), 500

@auth_bp.route('/change-password', methods=['POST'])
@token_required
def change_password(payload):
    """Change user password"""
    from database import db
    try:
        user_id = payload.get('user_id')
        user = User.query.get(user_id)
        
        if not user:
            return jsonify({'message': 'User not found'}), 404
            
        data = request.get_json()
        
        if not data or not data.get('oldPassword') or not data.get('newPassword'):
            return jsonify({'message': 'Missing old or new password'}), 400
            
        old_password = data.get('oldPassword')
        new_password = data.get('newPassword')
        
        if len(new_password) < 6:
            return jsonify({'message': 'New password must be at least 6 characters'}), 400
            
        if not check_password_hash(user.password, old_password):
            return jsonify({'message': 'Incorrect current password'}), 401
            
        user.password = generate_password_hash(new_password)
        db.session.commit()
        
        return jsonify({'message': 'Password changed successfully'}), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': f'Error: {str(e)}'}), 500

@auth_bp.route('/verify-email', methods=['POST'])
@token_required
def verify_email(payload):
    """Mock endpoint to send verification email"""
    try:
        user_id = payload.get('user_id')
        user = User.query.get(user_id)
        
        if not user:
            return jsonify({'message': 'User not found'}), 404
            
        # In a real app, send email logic goes here
        
        return jsonify({'message': f'Verification email sent to {user.email}'}), 200
        
    except Exception as e:
        return jsonify({'message': f'Error: {str(e)}'}), 500
