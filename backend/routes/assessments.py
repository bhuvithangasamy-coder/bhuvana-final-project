from flask import Blueprint, request, jsonify
from app import db
from models import Assessment, AssessmentQuestion, UserAssessment
from utils.jwt_utils import token_required

assessments_bp = Blueprint('assessments', __name__)

# Sample assessments data
SAMPLE_ASSESSMENTS = [
    {
        'id': 1,
        'title': 'Python Fundamentals',
        'category': 'programming',
        'level': 'beginner',
        'duration': 15,
        'description': 'Test your knowledge of Python basics',
        'questions': [
            {
                'id': 1,
                'question': 'What is the correct way to create a list in Python?',
                'options': [
                    'my_list = []',
                    'my_list = {}',
                    'my_list = ()',
                    'my_list = <>'
                ],
                'correct': 0
            },
            {
                'id': 2,
                'question': 'Which of the following is a mutable data type?',
                'options': [
                    'Tuple',
                    'String',
                    'List',
                    'Integer'
                ],
                'correct': 2
            },
            {
                'id': 3,
                'question': 'What does len() function do?',
                'options': [
                    'Returns the length of a string',
                    'Returns the type of an object',
                    'Returns the number of items in a sequence',
                    'Both A and C'
                ],
                'correct': 3
            }
        ]
    },
    {
        'id': 2,
        'title': 'React Concepts',
        'category': 'web-development',
        'level': 'intermediate',
        'duration': 20,
        'description': 'Test your understanding of React principles',
        'questions': [
            {
                'id': 1,
                'question': 'What is a React Hook?',
                'options': [
                    'A function that allows you to use state in functional components',
                    'A way to manage component lifecycle',
                    'A tool to reduce bundle size',
                    'A debugging utility'
                ],
                'correct': 0
            },
            {
                'id': 2,
                'question': 'Which hook is used for side effects in React?',
                'options': [
                    'useState',
                    'useEffect',
                    'useContext',
                    'useReducer'
                ],
                'correct': 1
            },
            {
                'id': 3,
                'question': 'What is the purpose of key prop in lists?',
                'options': [
                    'To improve performance',
                    'To uniquely identify elements',
                    'To store data',
                    'To prevent re-renders'
                ],
                'correct': 1
            }
        ]
    }
]

@assessments_bp.route('/list', methods=['GET'])
@token_required
def get_assessments(payload):
    """Get all available assessments"""
    try:
        assessments = []
        for asmt in SAMPLE_ASSESSMENTS:
            assessments.append({
                'id': asmt['id'],
                'title': asmt['title'],
                'category': asmt['category'],
                'level': asmt['level'],
                'duration': asmt['duration'],
                'description': asmt['description'],
                'questions_count': len(asmt['questions'])
            })
        
        return jsonify({
            'message': 'Assessments retrieved successfully',
            'assessments': assessments
        }), 200
        
    except Exception as e:
        return jsonify({'message': f'Error: {str(e)}'}), 500

@assessments_bp.route('/<int:assessment_id>', methods=['GET'])
@token_required
def get_assessment(payload, assessment_id):
    """Get specific assessment with questions"""
    try:
        assessment = next((a for a in SAMPLE_ASSESSMENTS if a['id'] == assessment_id), None)
        
        if not assessment:
            return jsonify({'message': 'Assessment not found'}), 404
        
        # Return assessment without showing correct answers
        return jsonify({
            'message': 'Assessment retrieved successfully',
            'id': assessment['id'],
            'title': assessment['title'],
            'category': assessment['category'],
            'level': assessment['level'],
            'duration': assessment['duration'],
            'description': assessment['description'],
            'questions': [
                {
                    'id': q['id'],
                    'question': q['question'],
                    'options': q['options']
                } for q in assessment['questions']
            ]
        }), 200
        
    except Exception as e:
        return jsonify({'message': f'Error: {str(e)}'}), 500

@assessments_bp.route('/submit', methods=['POST'])
@token_required
def submit_assessment(payload):
    """Submit assessment answers and get score"""
    try:
        data = request.get_json()
        user_id = payload.get('user_id')
        assessment_id = data.get('assessment_id')
        answers = data.get('answers')  # Dict of {question_id: answer_index}
        
        if not assessment_id or not answers:
            return jsonify({'message': 'Missing assessment_id or answers'}), 400
        
        assessment = next((a for a in SAMPLE_ASSESSMENTS if a['id'] == assessment_id), None)
        
        if not assessment:
            return jsonify({'message': 'Assessment not found'}), 404
        
        # Calculate score
        correct_count = 0
        total_questions = len(assessment['questions'])
        
        for question in assessment['questions']:
            q_id = question['id']
            if str(q_id) in answers:
                user_answer = answers[str(q_id)]
                if user_answer == question['correct']:
                    correct_count += 1
        
        score = (correct_count / total_questions) * 100 if total_questions > 0 else 0
        
        # Create user assessment record
        user_assessment = UserAssessment(
            user_id=user_id,
            assessment_id=assessment_id,
            score=score,
            completed=True
        )
        
        db.session.add(user_assessment)
        db.session.commit()
        
        return jsonify({
            'message': 'Assessment submitted successfully',
            'score': round(score, 2),
            'correct_answers': correct_count,
            'total_questions': total_questions,
            'passed': score >= 60  # 60% is passing
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': f'Error: {str(e)}'}), 500

@assessments_bp.route('/history', methods=['GET'])
@token_required
def get_history(payload):
    """Get user's assessment history"""
    try:
        user_id = payload.get('user_id')
        
        history = UserAssessment.query.filter_by(user_id=user_id).all()
        
        results = []
        for record in history:
            assessment = next((a for a in SAMPLE_ASSESSMENTS if a['id'] == record.assessment_id), None)
            if assessment:
                results.append({
                    'assessment_id': record.assessment_id,
                    'assessment_title': assessment['title'],
                    'score': round(record.score, 2),
                    'completed_at': record.created_at.isoformat() if hasattr(record, 'created_at') else None,
                    'passed': record.score >= 60
                })
        
        return jsonify({
            'message': 'History retrieved successfully',
            'history': results
        }), 200
        
    except Exception as e:
        return jsonify({'message': f'Error: {str(e)}'}), 500
