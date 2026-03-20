from database import db
from datetime import datetime

class User(db.Model):
    __tablename__ = 'users'
    
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password = db.Column(db.String(255), nullable=False)
    role = db.Column(db.String(20), nullable=False, default='job_seeker')  # job_seeker or job_poster
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    resumes = db.relationship('Resume', backref='user', lazy=True, cascade='all, delete-orphan')
    assessments = db.relationship('UserAssessment', backref='user', lazy=True, cascade='all, delete-orphan')
    photos = db.relationship('PhotoAnalysis', backref='user', lazy=True, cascade='all, delete-orphan')
    
    def __repr__(self):
        return f'<User {self.username}>'

class Resume(db.Model):
    __tablename__ = 'resumes'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    filename = db.Column(db.String(255), nullable=False)
    file_path = db.Column(db.String(255), nullable=False)
    ats_score = db.Column(db.Integer, default=0)
    skills = db.Column(db.JSON, default=list)
    extracted_data = db.Column(db.JSON, default=dict)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def __repr__(self):
        return f'<Resume {self.filename}>'

class Recruiter(db.Model):
    __tablename__ = 'recruiters'
    
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    company_name = db.Column(db.String(255), nullable=False)
    email = db.Column(db.String(255), unique=True, nullable=False)
    password = db.Column(db.String(255), nullable=False)
    phone_number = db.Column(db.String(50))
    role = db.Column(db.String(50), default='super_admin') # super_admin, sub_recruiter, viewer
    is_verified = db.Column(db.Boolean, default=False)
    
    logo_url = db.Column(db.String(500))
    website = db.Column(db.String(255))
    address = db.Column(db.Text)
    about = db.Column(db.Text)
    
    plan = db.Column(db.String(50), default='free')
    
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def __repr__(self):
        return f'<Recruiter {self.company_name}>'

class Job(db.Model):
    __tablename__ = 'jobs'
    
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    recruiter_id = db.Column(db.Integer, db.ForeignKey('recruiters.id'))
    title = db.Column(db.String(255))
    location = db.Column(db.String(255))
    salary = db.Column(db.String(255))
    job_type = db.Column(db.String(255))
    skills = db.Column(db.Text)
    description = db.Column(db.Text)
    experience = db.Column(db.String(100))
    application_deadline = db.Column(db.DateTime)
    status = db.Column(db.String(50), default='Active') # Active, Closed, Expired, Archived
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def __repr__(self):
        return f'<Job {self.title}>'

class Application(db.Model):
    __tablename__ = 'applications'
    
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    job_id = db.Column(db.Integer, db.ForeignKey('jobs.id'))
    name = db.Column(db.String(255))
    email = db.Column(db.String(255))
    phone = db.Column(db.String(255))
    resume = db.Column(db.Text)
    status = db.Column(db.String(50), default='Pending')
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    notes = db.Column(db.Text)
    
    def __repr__(self):
        return f'<Application {self.email}>'


class ApplicationHistory(db.Model):
    __tablename__ = 'application_history'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    application_id = db.Column(db.Integer, db.ForeignKey('applications.id'), nullable=False)
    status = db.Column(db.String(50))
    changed_by = db.Column(db.Integer)  # user id who changed status
    changed_at = db.Column(db.DateTime, default=datetime.utcnow)
    note = db.Column(db.Text)

    def to_dict(self):
        return {
            'id': self.id,
            'application_id': self.application_id,
            'status': self.status,
            'changed_by': self.changed_by,
            'changed_at': self.changed_at.isoformat() if self.changed_at else None,
            'note': self.note,
        }


class ApplicationNote(db.Model):
    __tablename__ = 'application_notes'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    application_id = db.Column(db.Integer, db.ForeignKey('applications.id'), nullable=False)
    author_id = db.Column(db.Integer)
    content = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'application_id': self.application_id,
            'author_id': self.author_id,
            'content': self.content,
            'created_at': self.created_at.isoformat() if self.created_at else None,
        }

class Assessment(db.Model):
    __tablename__ = 'assessments'
    
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(255), nullable=False)
    category = db.Column(db.String(100), nullable=False)
    level = db.Column(db.String(50), nullable=False)
    duration = db.Column(db.Integer)  # in minutes
    questions_count = db.Column(db.Integer, default=0)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relationships
    questions = db.relationship('AssessmentQuestion', backref='assessment', lazy=True, cascade='all, delete-orphan')
    user_assessments = db.relationship('UserAssessment', backref='assessment', lazy=True, cascade='all, delete-orphan')
    
    def __repr__(self):
        return f'<Assessment {self.title}>'

class AssessmentQuestion(db.Model):
    __tablename__ = 'assessment_questions'
    
    id = db.Column(db.Integer, primary_key=True)
    assessment_id = db.Column(db.Integer, db.ForeignKey('assessments.id'), nullable=False)
    question_text = db.Column(db.Text, nullable=False)
    option_a = db.Column(db.Text, nullable=False)
    option_b = db.Column(db.Text, nullable=False)
    option_c = db.Column(db.Text, nullable=False)
    option_d = db.Column(db.Text, nullable=False)
    correct_answer = db.Column(db.String(1), nullable=False)  # A, B, C, or D
    
    def __repr__(self):
        return f'<AssessmentQuestion {self.id}>'

class UserAssessment(db.Model):
    __tablename__ = 'user_assessments'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    assessment_id = db.Column(db.Integer, db.ForeignKey('assessments.id'), nullable=False)
    score = db.Column(db.Integer, default=0)
    completed = db.Column(db.Boolean, default=False)
    attempted_at = db.Column(db.DateTime, default=datetime.utcnow)
    completed_at = db.Column(db.DateTime)
    
    def __repr__(self):
        return f'<UserAssessment {self.user_id} - {self.assessment_id}>'

class PhotoAnalysis(db.Model):
    __tablename__ = 'photo_analysis'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    filename = db.Column(db.String(255), nullable=False)
    file_path = db.Column(db.String(255), nullable=False)
    professionalism_score = db.Column(db.Integer, default=0)
    lighting_score = db.Column(db.Integer, default=0)
    background_score = db.Column(db.Integer, default=0)
    composition_score = db.Column(db.Integer, default=0)
    overall_score = db.Column(db.Integer, default=0)
    feedback = db.Column(db.JSON, default=list)
    suggestions = db.Column(db.JSON, default=list)
    analyzed_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def __repr__(self):
        return f'<PhotoAnalysis {self.filename}>'
