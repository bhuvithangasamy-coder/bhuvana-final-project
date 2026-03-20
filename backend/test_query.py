from app import create_app
from database import db
from models import Application, Job, User, Recruiter

app = create_app()
with app.app_context():
    apps = Application.query.all()
    print("All apps:", len(apps))
    if len(apps) > 0:
        print("First app job_id:", apps[0].job_id)

    users = User.query.filter((User.role == 'job_poster') | (User.role == 'admin')).all()
    for u in users:
        print(f"User {u.id}: {u.username} ({u.role})")
        try:
            # The query I wrote in jobs.py:
            joined_apps = Application.query.join(Job).filter(Job.recruiter_id == u.id).all()
            print("Joined Apps for user", u.id, ":", len(joined_apps), "applications")
            for a in joined_apps:
                print(f"  App {a.id} for Job {a.job_id}")
        except Exception as e:
            print("Error joining for user", u.id, type(e), e)
