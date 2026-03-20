from flask import Blueprint, request, jsonify
from app import db
from models import Assessment, AssessmentQuestion, UserAssessment
from utils.jwt_utils import token_required

assessments_bp = Blueprint('assessments', __name__)

# Sample assessments data
SAMPLE_ASSESSMENTS = [
    {
        'id': 1,
        'title': 'Quantitative Aptitude',
        'category': 'programming',
        'level': 'beginner',
        'duration': 15,
        'description': 'Test your quantitative and mathematical skills.',
        'questions': [
            {
                'id': 1,
                'question': 'A number is increased by 20% and then decreased by 20%. What is the net change?',
                'options': ['No change', '4% decrease', '4% increase', '2% decrease'],
                'correct': 1
            },
            {
                'id': 2,
                'question': 'The average of 5 numbers is 40. If one number is removed, the average becomes 35. What is the removed number?',
                'options': ['45', '50', '60', '65'],
                'correct': 2
            },
            {
                'id': 3,
                'question': 'The ratio of boys to girls in a class is 3:2. If there are 30 students, how many girls are there?',
                'options': ['10', '12', '15', '18'],
                'correct': 1
            },
            {
                'id': 4,
                'question': 'Find the simple interest on Rs. 5000 at 5% per annum for 2 years.',
                'options': ['400', '500', '600', '700'],
                'correct': 1
            },
            {
                'id': 5,
                'question': 'A can complete work in 10 days and B in 15 days. How long together?',
                'options': ['5', '6', '7', '8'],
                'correct': 1
            },
            {
                'id': 6,
                'question': 'A shopkeeper buys an item for Rs. 200 and sells it for Rs. 250. Profit percentage?',
                'options': ['20%', '25%', '30%', '35%'],
                'correct': 1
            },
            {
                'id': 7,
                'question': 'A car travels 60 km in 1 hour. What is its speed?',
                'options': ['50 km/h', '55 km/h', '60 km/h', '65 km/h'],
                'correct': 2
            },
            {
                'id': 8,
                'question': 'Find the next number: 2, 6, 12, 20, ?',
                'options': ['28', '30', '32', '36'],
                'correct': 1
            },
            {
                'id': 9,
                'question': 'If 4 workers complete a job in 8 days, how many days will 8 workers take?',
                'options': ['2', '4', '6', '8'],
                'correct': 1
            },
            {
                'id': 10,
                'question': 'What is 25% of 200?',
                'options': ['40', '45', '50', '60'],
                'correct': 2
            },
            {
                'id': 11,
                'question': 'If 5 pens cost Rs. 50, what is the cost of 8 pens?',
                'options': ['70', '80', '90', '100'],
                'correct': 1
            },
            {
                'id': 12,
                'question': 'Find the average of 10, 20, 30, 40.',
                'options': ['20', '25', '30', '35'],
                'correct': 1
            },
            {
                'id': 13,
                'question': 'An item costing Rs. 500 is sold at Rs. 450. Loss percentage?',
                'options': ['5%', '8%', '10%', '12%'],
                'correct': 2
            },
            {
                'id': 14,
                'question': 'A train travels 120 km in 2 hours. Speed?',
                'options': ['50 km/h', '60 km/h', '70 km/h', '80 km/h'],
                'correct': 1
            },
            {
                'id': 15,
                'question': 'Find the next number: 5, 10, 20, 40, ?',
                'options': ['60', '70', '80', '90'],
                'correct': 2
            },
        ]
    },
    {
        'id': 2,
        'title': 'Logical Reasoning Aptitude',
        'category': 'reasoning',
        'level': 'intermediate',
        'duration': 20,
        'description': 'Test your logical thinking and pattern recognition skills.',
        'questions': [
            {
                'id': 1,
                'question': 'Find the next number in the series: 2, 4, 8, 16, ?',
                'options': ['24', '30', '32', '34'],
                'correct': 2
            },
            {
                'id': 2,
                'question': 'If CAT is written as DBU, how is DOG written?',
                'options': ['EPH', 'EOG', 'EPG', 'EOH'],
                'correct': 0
            },
            {
                'id': 3,
                'question': "Pointing to a woman, Ravi said: 'She is the daughter of my mother’s only son.' How is the woman related to Ravi?",
                'options': ['Sister', 'Daughter', 'Mother', 'Niece'],
                'correct': 1
            },
            {
                'id': 4,
                'question': 'Find the missing number: 5, 10, 20, 40, ?',
                'options': ['60', '70', '80', '90'],
                'correct': 2
            },
            {
                'id': 5,
                'question': 'Which word does NOT belong to the group?',
                'options': ['Apple', 'Banana', 'Carrot', 'Mango'],
                'correct': 2
            },
            {
                'id': 6,
                'question': 'If A = 1, B = 2, C = 3, what is the value of CAB?',
                'options': ['312', '321', '213', '123'],
                'correct': 0
            },
            {
                'id': 7,
                'question': 'Find the odd one out.',
                'options': ['Square', 'Triangle', 'Circle', 'Cube'],
                'correct': 3
            },
            {
                'id': 8,
                'question': 'If Monday is the 1st day of the month, what day will be the 10th?',
                'options': ['Tuesday', 'Wednesday', 'Thursday', 'Friday'],
                'correct': 1
            },
            {
                'id': 9,
                'question': 'Which number replaces the question mark? 3, 9, 27, ?',
                'options': ['54', '72', '81', '90'],
                'correct': 2
            },
            {
                'id': 10,
                'question': 'A is taller than B, B is taller than C. Who is the tallest?',
                'options': ['A', 'B', 'C', 'Cannot determine'],
                'correct': 0
            },
            {
                'id': 11,
                'question': 'Find the missing letter: A, C, E, G, ?',
                'options': ['H', 'I', 'J', 'K'],
                'correct': 1
            },
            {
                'id': 12,
                'question': 'If 5 + 3 = 28, 4 + 2 = 24, then 6 + 2 = ?',
                'options': ['30', '32', '34', '36'],
                'correct': 1
            },
            {
                'id': 13,
                'question': 'Which shape has the most sides?',
                'options': ['Triangle', 'Square', 'Pentagon', 'Hexagon'],
                'correct': 3
            },
            {
                'id': 14,
                'question': 'Find the next number: 1, 3, 6, 10, ?',
                'options': ['12', '14', '15', '18'],
                'correct': 2
            },
            {
                'id': 15,
                'question': 'If all roses are flowers and some flowers are red, which statement is correct?',
                'options': ['All roses are red', 'Some roses may be red', 'No roses are red', 'All flowers are roses'],
                'correct': 1
            },
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
