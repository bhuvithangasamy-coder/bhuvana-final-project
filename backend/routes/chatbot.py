from flask import Blueprint, request, jsonify
from utils.jwt_utils import token_required
from utils.chatbot_handler import get_response

chatbot_bp = Blueprint('chatbot', __name__)

@chatbot_bp.route('/ask', methods=['POST'])
@token_required
def ask_question(payload):
    """Ask AI chatbot a career question"""
    try:
        data = request.get_json()
        
        if not data or not data.get('question'):
            return jsonify({'message': 'No question provided'}), 400
        
        question = data.get('question').strip()
        
        if len(question) < 3:
            return jsonify({'message': 'Question too short'}), 400
        
        # Get response from chatbot handler
        result = get_response(question)
        
        return jsonify({
            'message': 'Answer generated successfully',
            'question': question,
            'answer': result['response'],
            'category': result['category']
        }), 200
        
    except Exception as e:
        return jsonify({'message': f'Error: {str(e)}'}), 500

@chatbot_bp.route('/suggestions', methods=['GET'])
@token_required
def get_suggestions(payload):
    """Get chatbot suggestions"""
    try:
        suggestions = [
            "How do I prepare for a technical interview?",
            "What are the most in-demand programming skills?",
            "How do I negotiate my salary?",
            "Tips for writing an effective resume",
            "How to build a professional network?",
            "What should I learn next to advance my career?"
        ]
        
        return jsonify({
            'suggestions': suggestions
        }), 200
        
    except Exception as e:
        return jsonify({'message': f'Error: {str(e)}'}), 500
