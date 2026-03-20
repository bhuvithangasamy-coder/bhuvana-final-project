from app import create_app
from database import db
from models import Application, Job, User

app = create_app()
with app.app_context():
    # Insert dummy app to job 1 and job 2 if they exist
    j1 = Job.query.get(1)
    if j1:
        app1 = Application(job_id=j1.id, name="Test User 1", email="test1@example.com", status="Pending")
        db.session.add(app1)
        print("Added app to job 1")
    
    j2 = Job.query.get(2)
    if j2:
        app2 = Application(job_id=j2.id, name="Test User 2", email="test2@example.com", status="Pending")
        db.session.add(app2)
        print("Added app to job 2")
        
    db.session.commit()
    print("Database committed")
