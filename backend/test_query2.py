from app import create_app
from database import db
from models import Application, Job, User

app = create_app()
with app.app_context():
    jobs = Job.query.all()
    print("All jobs:", len(jobs))
    for j in jobs:
        print(f"Job {j.id}: '{j.title}' by recruiter {j.recruiter_id}")
    
    apps = Application.query.all()
    print("All apps:", len(apps))
    for a in apps:
        print(f"App {a.id} on job {a.job_id}")
