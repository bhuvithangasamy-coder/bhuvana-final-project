from app import create_app
from database import db
from models import Application
import os

app = create_app()
with app.app_context():
    apps = Application.query.all()
    for a in apps:
        if not a.phone:
            a.phone = "+1 (555) 123-4567"
        if not a.resume:
            # Create a fake resume file
            from config import Config
            os.makedirs(Config.RESUME_FOLDER, exist_ok=True)
            fake_path = os.path.join(Config.RESUME_FOLDER, "fake_resume.pdf")
            with open(fake_path, "wb") as f:
                f.write(b"Fake resume content")
            a.resume = fake_path
    db.session.commit()
    print("Updated test applications")
