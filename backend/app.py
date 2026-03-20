from flask import Flask
from dotenv import load_dotenv
from flask_cors import CORS
from database import db
from config import Config
from email_config import mail

def create_app():
    # Load environment variables from .env file
    load_dotenv()
    app = Flask(__name__)
    app.config.from_object(Config)
    import os
    app.config.update(
        MAIL_SERVER='smtp.gmail.com',
        MAIL_PORT=587,
        MAIL_USERNAME=os.environ.get('MAIL_USERNAME'),
        MAIL_PASSWORD=os.environ.get('MAIL_PASSWORD'),
        MAIL_USE_TLS=True,
        MAIL_USE_SSL=False
    )
    mail.init_app(app)
    
    # Initialize extensions
    db.init_app(app)
    # Allow Authorization header for file uploads and protected routes
    CORS(app, resources={r"/api/*": {"origins": "*"}}, supports_credentials=True, allow_headers=["Content-Type", "Authorization"]) 
    
    # Register blueprints
    from routes.auth import auth_bp
    from routes.recruiter_auth import recruiter_auth_bp
    from routes.resume import resume_bp
    from routes.jobs import jobs_bp
    from routes.chatbot import chatbot_bp
    from routes.assessments import assessments_bp
    from routes.photo import photo_bp
    
    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(recruiter_auth_bp, url_prefix='/api/recruiter')
    app.register_blueprint(resume_bp, url_prefix='/api/resume')
    app.register_blueprint(jobs_bp, url_prefix='/api/jobs')
    app.register_blueprint(chatbot_bp, url_prefix='/api/chatbot')
    app.register_blueprint(assessments_bp, url_prefix='/api/assessments')
    app.register_blueprint(photo_bp, url_prefix='/api/photo')
    
    with app.app_context():
        db.create_all()
    
    return app

if __name__ == '__main__':
    app = create_app()
    app.run(debug=True, port=5000)
