from typing import List, Dict

def calculate_match_percentage(resume_skills: List[str], job_required_skills: List[str]) -> int:
    """Calculate match percentage between resume skills and job requirements"""
    if not job_required_skills:
        return 0
    
    matched_skills = 0
    for skill in job_required_skills:
        for resume_skill in resume_skills:
            if skill.lower() == resume_skill.lower():
                matched_skills += 1
                break
    
    percentage = (matched_skills / len(job_required_skills)) * 100
    return min(int(percentage), 100)

def match_jobs(resume_skills: List[str], test_jobs: List[Dict]) -> List[Dict]:
    """Match jobs based on resume skills"""
    matched_jobs = []
    
    for job in test_jobs:
        match_percentage = calculate_match_percentage(
            resume_skills,
            job.get('required_skills', [])
        )
        
        job_data = job.copy()
        job_data['match'] = match_percentage
        
        matched_jobs.append(job_data)
    
    # Sort by match percentage (highest first)
    matched_jobs.sort(key=lambda x: x['match'], reverse=True)
    
    return matched_jobs

# Sample job listings for testing/demo
TEST_JOBS = [
    {
        'id': 1,
        'title': 'Senior Frontend Developer',
        'company': 'TechCorp Inc.',
        'location': 'Remote',
        'job_type': 'Full-time',
        'salary': '$120k - $150k',
        'required_skills': ['React', 'TypeScript', 'Tailwind CSS', 'Node.js'],
        'description': 'We are looking for an experienced Frontend Developer...'
    },
    {
        'id': 2,
        'title': 'Full Stack Engineer',
        'company': 'StartupXYZ',
        'location': 'New York, NY',
        'job_type': 'Full-time',
        'salary': '$100k - $130k',
        'required_skills': ['React', 'Python', 'PostgreSQL', 'AWS'],
        'description': 'Join our dynamic team as a Full Stack Engineer...'
    },
    {
        'id': 3,
        'title': 'React Developer',
        'company': 'Digital Agency Co.',
        'location': 'San Francisco, CA',
        'job_type': 'Contract',
        'salary': '$80 - $100/hr',
        'required_skills': ['React', 'JavaScript', 'CSS', 'REST API'],
        'description': 'We need a React Developer for a 6-month project...'
    },
    {
        'id': 4,
        'title': 'Software Engineer',
        'company': 'Enterprise Solutions',
        'location': 'Austin, TX',
        'job_type': 'Full-time',
        'salary': '$110k - $140k',
        'required_skills': ['Java', 'Spring Boot', 'React', 'Kubernetes'],
        'description': 'Help us build scalable software solutions...'
    },
    {
        'id': 5,
        'title': 'Python Developer',
        'company': 'Data Analytics Inc.',
        'location': 'Remote',
        'job_type': 'Full-time',
        'salary': '$100k - $130k',
        'required_skills': ['Python', 'Pandas', 'Machine Learning', 'SQL'],
        'description': 'Join our data science team as a Python Developer...'
    },
]
