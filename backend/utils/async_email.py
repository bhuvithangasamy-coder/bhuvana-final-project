from concurrent.futures import ThreadPoolExecutor
from typing import Any

executor = ThreadPoolExecutor(max_workers=4)

def enqueue_job_notification(app: Any, job_id: int, job_title: str, company_name: str):
    """Submit a background task to notify job seekers about a new job.

    `app` should be the Flask app object (use `current_app._get_current_object()` when calling).
    """
    def task():
        try:
            with app.app_context():
                from models import User
                from utils.email_service import send_job_posting_notification

                seekers = User.query.filter_by(role='job_seeker').all()
                for s in seekers:
                    try:
                        send_job_posting_notification(s.email, job_title, company_name, job_id)
                    except Exception as e:
                        # log and continue
                        print(f"Failed to send job notification to {getattr(s, 'email', None)}: {e}")
        except Exception as e:
            print(f"Background job notification failed: {e}")

    executor.submit(task)
