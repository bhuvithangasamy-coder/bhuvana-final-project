import os
from typing import Dict
import random

# Try to import google-genai for AI responses
try:
    from google import genai
    from google.genai import types
    GEMINI_AVAILABLE = True
except ImportError:
    GEMINI_AVAILABLE = False

from typing import Dict, List, Any

# Career-related Q&A database for fallback
CAREER_QA: Dict[str, Any] = {
    'interview': {
        'keywords': ['interview', 'prepare', 'tip', 'question', 'answer'],
        'responses': [
            "For interviews, remember to: 1) Research the company thoroughly 2) Practice common questions 3) Use the STAR method (Situation, Task, Action, Result) 4) Ask thoughtful questions 5) Follow up with gratitude.",
            "Interview tips: Arrive 15 minutes early, dress professionally, maintain eye contact, speak clearly, listen carefully, and always be honest about your experience.",
            "Common interview questions to prepare: Tell me about yourself, Why do you want this job, What are your strengths/weaknesses, Tell me about a challenge you overcame, Where do you see yourself in 5 years?"
        ]
    },
    'resume': {
        'keywords': ['resume', 'cv', 'portfolio', 'ats', 'format'],
        'responses': [
            "Resume best practices: 1) Keep it to 1-2 pages 2) Use clear formatting 3) Include quantifiable achievements 4) Tailor to the job description 5) Use action verbs 6) Update regularly.",
            "To improve ATS score: Use keywords from the job description, keep formatting simple, include relevant skills, use standard fonts, and avoid images/graphics.",
            "Resume tips: Start with a strong summary, use bullet points, focus on achievements not duties, include metrics and results, keep it scannable with clear headers."
        ]
    },
    'skills': {
        'keywords': ['skill', 'learn', 'develop', 'technology', 'course'],
        'responses': [
            "Top in-demand skills: Python, JavaScript, React, AWS, Machine Learning, Data Science, Cloud Computing, DevOps, Full Stack Development.",
            "How to develop skills: 1) Take online courses 2) Build projects 3) Contribute to open source 4) Read documentation 5) Practice regularly 6) Join communities.",
            "Skill development path: Start with fundamentals, build projects, contribute to real-world problems, get feedback, practice, and keep learning new technologies."
        ]
    },
    'job search': {
        'keywords': ['job', 'search', 'find', 'apply', 'opportunity'],
        'responses': [
            "Job search strategies: 1) Use multiple platforms 2) Network actively 3) Follow companies on social media 4) Attend meetups 5) Join job communities 6) Contact recruiters.",
            "Where to find jobs: LinkedIn, Indeed, glassdoor, GitHub Jobs, RemoteOK, AngelList, Twitter job boards, company websites, recruiters.",
            "Job application tips: Customize your resume, write a compelling cover letter, follow application instructions, apply regularly, track applications, and practice interviews."
        ]
    },
    'career': {
        'keywords': ['career', 'goal', 'path', 'progression', 'growth'],
        'responses': [
            "Career growth tips: 1) Set clear goals 2) Seek mentorship 3) Take on challenging projects 4) Develop leadership skills 5) Network professionally 6) Keep learning.",
            "Career progression: Entry Level → Mid-Level → Senior → Lead/Manager. Focus on skills, experience, and leadership at each stage.",
            "Building a successful career: Define your goals, develop relevant skills, build a strong network, contribute to projects, seek feedback, and continuously adapt."
        ]
    },
    'salary': {
        'keywords': ['salary', 'negotiate', 'pay', 'compensation', 'offer'],
        'responses': [
            "Salary negotiation tips: 1) Research market rates 2) Know your worth 3) Prepare your pitch 4) Practice negotiation 5) Consider benefits too 6) Get it in writing.",
            "How to evaluate an offer: Consider salary, benefits, growth opportunities, work-life balance, company culture, location, and job responsibilities.",
            "Market rates vary by: Experience level, location, company size, industry, skills, and education. Research on Glassdoor, Levels.fyi, and Payscale."
        ]
    },
    'networking': {
        'keywords': ['network', 'connect', 'professional', 'linkedin', 'community'],
        'responses': [
            "Networking strategies: 1) Attend events 2) Join online communities 3) Reach out to professionals 4) Share knowledge 5) Be genuine 6) Follow up regularly.",
            "LinkedIn tips: Optimize your profile, share content, engage with posts, join groups, apply to relevant jobs, and connect with professionals in your field.",
            "Building relationships: Be authentic, provide value, stay in touch, offer help, attend events, and maintain meaningful connections over time."
        ]
    },
    'default': {
        'keywords': [],
        'responses': [
            "I'm here to help with career advice! Ask me about interviews, resume tips, skill development, job search strategies, career growth, salary negotiation, or networking.",
            "Feel free to ask me anything related to career development, job hunting, interviews, resume building, or professional growth.",
            "What aspect of your career would you like help with? I can assist with interviews, resumes, skills, job search, networking, or general career advice."
        ]
    }
}

def get_response(user_question: str) -> Dict:
    """Get response to career question, preferably using AI."""
    user_question_lower = user_question.lower()
    
    # Try using Gemini AI first if available and API key is set
    try:
        # Load env automatically from dotenv if needed (app.py likely did).
        api_key = os.environ.get('GEMINI_API_KEY')
        if GEMINI_AVAILABLE and api_key:
            client = genai.Client(api_key=api_key)
            
            # Using standard gemini-1.5-flash model
            ai_response = client.models.generate_content(
                model='gemini-1.5-flash',
                contents=user_question,
                config=types.GenerateContentConfig(
                    system_instruction="You are an expert career advisor and job search assistant. "
                                       "Answer questions related to jobs, interviews, resumes, "
                                       "career growth, networking, or salary negotiations in a helpful, "
                                       "concise, and practical manner. Use Markdown. "
                                       "If a question is completely unrelated to jobs or careers, "
                                       "politely refuse to answer and guide them back to career topics."
                )
            )
            
            # Simple category inference
            matched_category = 'ai_generated'
            for category, data in CAREER_QA.items():
                if category != 'default':
                    for keyword in data['keywords']:
                        if keyword in user_question_lower:
                            matched_category = category
                            break
                if matched_category != 'ai_generated':
                    break
                    
            return {
                'success': True,
                'response': ai_response.text,
                'category': matched_category
            }
    except Exception as e:
        print(f"AI Generation Failed: {str(e)}. Falling back to local data.")
        pass # Fallback to local QA code below
    
    # Fallback routing to static local categories if no API key or Error occurs
    matched_category = 'default'
    for category, data in CAREER_QA.items():
        if category != 'default':
            for keyword in data['keywords']:
                if keyword in user_question_lower:
                    matched_category = category
                    break
        if matched_category != 'default':
            break
    
    # Get response from matched category
    responses = CAREER_QA[matched_category]['responses']
    
    # Simple random selection
    response = random.choice(responses)
    
    return {
        'success': True,
        'response': response,
        'category': matched_category
    }
