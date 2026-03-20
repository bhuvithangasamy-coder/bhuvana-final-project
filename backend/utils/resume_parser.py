from pypdf import PdfReader
import re
from typing import Dict, List

COMMON_SKILLS = [
    'Python', 'JavaScript', 'Java', 'TypeScript', 'React', 'Node.js',
    'Django', 'Flask', 'Express', 'PostgreSQL', 'MongoDB', 'MySQL',
    'AWS', 'Azure', 'GCP', 'Docker', 'Kubernetes', 'Git',
    'HTML', 'CSS', 'Tailwind', 'Vue', 'Angular', 'Next.js',
    'REST API', 'GraphQL', 'SQL', 'NoSQL', 'Pandas', 'NumPy',
    'Machine Learning', 'Deep Learning', 'TensorFlow', 'Scikit-learn',
    'Communication', 'Leadership', 'Problem Solving', 'Teamwork',
    'VS Code', 'Linux', 'Windows', 'Mac', 'Agile', 'Scrum',
    'Figma', 'Adobe XD', 'Photoshop', 'Illustrator', 'Blender'
]

def extract_text_from_pdf(file_path: str) -> str:
    """Extract text from PDF file"""
    try:
        text = ""
        with open(file_path, 'rb') as pdf_file:
            pdf_reader = PdfReader(pdf_file)
            for page in pdf_reader.pages:
                text += page.extract_text()
        return text
    except Exception as e:
        print(f"Error extracting PDF: {str(e)}")
        return ""

def extract_email(text: str) -> str:
    """Extract email from resume text"""
    email_pattern = r'[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}'
    match = re.search(email_pattern, text)
    return match.group(0) if match else ""

def extract_phone(text: str) -> str:
    """Extract phone number from resume text"""
    phone_pattern = r'(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}'
    match = re.search(phone_pattern, text)
    return match.group(0) if match else ""

def extract_skills(text: str) -> List[str]:
    """Extract skills from resume text"""
    found_skills = []
    text_lower = text.lower()
    for skill in COMMON_SKILLS:
        if skill.lower() in text_lower:
            found_skills.append(skill)
    return list(set(found_skills))

def calculate_ats_score(text: str, skills: List[str]) -> int:
    """Calculate ATS score based on resume content"""
    score = 0
    
    # Check for standard sections
    sections = ['experience', 'education', 'skills', 'projects', 'certifications']
    for section in sections:
        if section in text.lower():
            score += 15
    
    # Skills bonus
    score += min(len(skills) * 2, 30)
    
    # Keywords bonus
    keywords = ['achieved', 'developed', 'implemented', 'led', 'managed', 'designed']
    for keyword in keywords:
        if keyword in text.lower():
            score += 2
    
    # Cap at 100
    return min(score, 100)

def parse_resume(file_path: str) -> Dict:
    """Parse resume and extract information"""
    text = extract_text_from_pdf(file_path)
    
    if not text:
        return {
            'success': False,
            'error': 'Could not extract text from PDF',
            'skills': [],
            'ats_score': 0
        }
    
    skills = extract_skills(text)
    ats_score = calculate_ats_score(text, skills)
    email = extract_email(text)
    phone = extract_phone(text)
    
    return {
        'success': True,
        'skills': skills,
        'ats_score': ats_score,
        'email': email,
        'phone': phone,
        'text_preview': text[:500]
    }
