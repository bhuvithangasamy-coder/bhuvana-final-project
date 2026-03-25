from flask import Blueprint, request, jsonify, send_file, current_app
from models import Resume, Job, Application, ApplicationHistory, ApplicationNote, User
from utils.jwt_utils import token_required
from utils.job_matcher import match_jobs, TEST_JOBS
import os
from database import db
from utils.email_service import get_base_template, send_email, send_job_posting_notification
from utils.async_email import enqueue_job_notification
from datetime import datetime

jobs_bp = Blueprint('jobs', __name__)

@jobs_bp.route('/matches', methods=['GET'])
@token_required
def get_job_matches(payload):
    """Get job matches based on user's resume"""
    from database import db
    try:
        user_id = payload['user_id']
        resume = Resume.query.filter_by(user_id=user_id).first()
        
        if not resume:
            return jsonify({
                'message': 'No resume found. Please upload your resume first.',
                'jobs': []
            }), 200
        
        # Build job list from DB jobs and demo TEST_JOBS so recruiter-posted jobs surface
        db_jobs = []
        try:
            from models import Job, Recruiter
            jobs_q = Job.query.filter_by(status='Active').all()
            for j in jobs_q:
                # convert skills string to list
                skills_list = []
                if j.skills:
                    if isinstance(j.skills, str):
                        skills_list = [s.strip() for s in j.skills.split(',') if s.strip()]
                    elif isinstance(j.skills, (list, tuple)):
                        skills_list = list(j.skills)

                company_name = 'Employer'
                if getattr(j, 'company_name', None):
                    company_name = j.company_name
                else:
                    try:
                        r = Recruiter.query.get(j.recruiter_id)
                        if r and getattr(r, 'company_name', None):
                            company_name = r.company_name
                    except Exception:
                        pass

                db_jobs.append({
                    'id': j.id,
                    'title': j.title,
                    'company': company_name,
                    'location': j.location,
                    'job_type': j.job_type,
                    'vacancies': j.vacancies,
                    'created_at': j.created_at.isoformat() if hasattr(j, 'created_at') and j.created_at else None,
                    'salary': j.salary,
                    'required_skills': skills_list,
                    'description': j.description
                })
        except Exception:
            db_jobs = []

        all_jobs_for_matching = db_jobs + TEST_JOBS

        # Match jobs with resume skills
        matched_jobs = match_jobs(resume.skills, all_jobs_for_matching)
        
        return jsonify({
            'message': 'Job matches retrieved successfully',
            'jobs': matched_jobs,
            'resume_skills': resume.skills
        }), 200
        
    except Exception as e:
        return jsonify({'message': f'Error: {str(e)}'}), 500

@jobs_bp.route('/all', methods=['GET'])
@token_required
def get_all_jobs(payload):
    """Get all available jobs"""
    try:
        jobs_out = []
        try:
            from models import Job, Recruiter
            db_jobs = Job.query.filter_by(status='Active').all()
            for j in db_jobs:
                company_name = 'Employer'
                if getattr(j, 'company_name', None):
                    company_name = j.company_name
                else:
                    try:
                        r = Recruiter.query.get(j.recruiter_id)
                        if r and getattr(r, 'company_name', None):
                            company_name = r.company_name
                    except Exception:
                        pass

                skills_list = []
                if j.skills:
                    if isinstance(j.skills, str):
                        skills_list = [s.strip() for s in j.skills.split(',') if s.strip()]
                    elif isinstance(j.skills, (list, tuple)):
                        skills_list = list(j.skills)

                jobs_out.append({
                    'id': j.id,
                    'title': j.title,
                    'company': company_name,
                    'location': j.location,
                    'job_type': j.job_type,
                    'vacancies': j.vacancies,
                    'created_at': j.created_at.isoformat() if hasattr(j, 'created_at') and j.created_at else None,
                    'salary': j.salary,
                    'required_skills': skills_list,
                    'description': j.description
                })
        except Exception:
            jobs_out = []

        # include demo TEST_JOBS after DB jobs
        jobs_out = jobs_out + TEST_JOBS

        return jsonify({
            'message': 'All jobs retrieved successfully',
            'jobs': jobs_out,
            'total': len(jobs_out)
        }), 200
        
    except Exception as e:
        return jsonify({'message': f'Error: {str(e)}'}), 500

@jobs_bp.route('/search', methods=['GET'])
@token_required
def search_jobs(payload):
    """Search jobs based on query and location filters"""
    try:
        query = request.args.get('q', '').strip().lower()
        location = request.args.get('location', '').strip().lower()
        
        filtered_jobs = TEST_JOBS.copy()
        
        # Filter by search query
        if query:
            filtered_jobs = [
                job for job in filtered_jobs
                if (query in job.get('title', '').lower() or
                    query in job.get('company', '').lower() or
                    any(query in skill.lower() for skill in job.get('required_skills', [])))
            ]
        
        # Filter by location
        if location:
            filtered_jobs = [
                job for job in filtered_jobs
                if location in job.get('location', '').lower()
            ]
        
        return jsonify({
            'message': 'Jobs search completed successfully',
            'jobs': filtered_jobs,
            'total': len(filtered_jobs)
        }), 200
        
    except Exception as e:
        return jsonify({'message': f'Error: {str(e)}'}), 500

@jobs_bp.route('/apply', methods=['POST'])
@token_required
def apply_for_job(payload):
    """Handle job application and send confirmation/notification emails"""
    try:
        user_id = payload['user_id']
        from models import User
        user = User.query.get(user_id)
        
        if not user:
            return jsonify({'message': 'User not found'}), 404
            
        data = request.form
        if not data and request.is_json:
            data = request.get_json()
            
        if not data:
            return jsonify({'message': 'No data provided'}), 400
            
        job_title = data.get('job_title', 'Unknown Position')
        company = data.get('company', 'Unknown Company')
        
        candidate_name = data.get('firstName', '') + ' ' + data.get('lastName', '')
        if not candidate_name.strip():
            candidate_name = user.username
            
        phone = data.get('phone', '')
        job_id_str = data.get('job_id')
        
        resume_path = ""
        file = request.files.get('file')
        if file and file.filename:
            from werkzeug.utils import secure_filename
            from config import Config
            import os
            import time
            filename = f"{int(time.time())}_{secure_filename(file.filename)}"
            filepath = os.path.join(Config.RESUME_FOLDER, filename)
            file.save(filepath)
            resume_path = filepath
            
        # Optional: Save application to database here
        from database import db
        if job_id_str:
            try:
                job_id = int(job_id_str)
                from models import Application
                new_app = Application(
                    job_id=job_id,
                    name=candidate_name,
                    email=user.email,
                    phone=phone,
                    resume=resume_path,
                    status='Pending'
                )
                db.session.add(new_app)
                db.session.commit()
            except Exception as db_err:
                print(f"Error saving application: {db_err}")
        
        # Send confirmation email to candidate
        try:
            from utils.email_service import send_application_confirmation, send_recruiter_notification
            
            # Email candidate
            send_application_confirmation(
                candidate_email=user.email,
                candidate_name=candidate_name,
                job_title=job_title,
                company_name=company
            )
            
            # Notify recruiter
            send_recruiter_notification(
                candidate_name=candidate_name,
                candidate_email=user.email,
                job_title=job_title,
                company_name=company
            )
        except Exception as email_err:
            print(f"Failed to send application emails: {email_err}")
            
        return jsonify({
            'message': 'Application submitted successfully',
        }), 200
        
    except Exception as e:
        return jsonify({'message': f'Error: {str(e)}'}), 500

@jobs_bp.route('/recruiter_dashboard', methods=['GET'])
@token_required
def recruiter_dashboard(payload):
    """Get dashboard stats for a job poster/recruiter"""
    try:
        recruiter_id = payload['user_id']
        
        from models import Job, Application
        
        total_jobs = Job.query.filter_by(recruiter_id=recruiter_id).count()
        active_jobs = Job.query.filter_by(recruiter_id=recruiter_id, status='Active').count()
        expired_jobs = Job.query.filter_by(recruiter_id=recruiter_id, status='Expired').count()
        
        applications = Application.query.join(Job).filter(Job.recruiter_id == recruiter_id).count()
        # Debug logs: print counts and recruiter id
        try:
            print(f"DEBUG recruiter_dashboard: recruiter_id={recruiter_id}, total_jobs={total_jobs}, active_jobs={active_jobs}, expired_jobs={expired_jobs}, applications={applications}")
        except Exception:
            pass
        
        return jsonify({
            "total_jobs": total_jobs,
            "active_jobs": active_jobs,
            "expired_jobs": expired_jobs,
            "applications": applications
        }), 200
        
    except Exception as e:
        return jsonify({'message': f'Error: {str(e)}'}), 500


@jobs_bp.route('/post', methods=['POST'])
@token_required
def post_job(payload):
    """Create a new job posting (for recruiters/job posters)"""
    from database import db
    try:
        data = request.get_json() or {}

        title = data.get('title')
        company_name = data.get('company_name')
        location = data.get('location')
        salary = data.get('salary')
        job_type = data.get('job_type')
        vacancies_raw = data.get('vacancies')
        vacancies = None
        if vacancies_raw and str(vacancies_raw).strip():
            try:
                vacancies = int(vacancies_raw)
            except ValueError:
                pass
        skills = data.get('skills')
        description = data.get('description')

        experience = data.get('experience')
        deadline_str = data.get('application_deadline')
        application_deadline = None
        if deadline_str:
            try:
                application_deadline = datetime.fromisoformat(deadline_str.replace('Z', '+00:00'))
            except Exception as dt_err:
                print(f"Error parsing date: {dt_err}")

        if not title or not location:
            return jsonify({'message': 'Title and location are required'}), 400

        # Use payload user_id as recruiter id for simplicity
        recruiter_id = payload.get('user_id')

        job = Job(
            recruiter_id=recruiter_id,
            title=title,
            company_name=company_name,
            location=location,
            salary=salary,
            job_type=job_type,
            vacancies=vacancies,
            skills=skills,
            description=description,
            experience=experience,
            application_deadline=application_deadline,
            status='Active'
        )

        db.session.add(job)
        db.session.commit()
        try:
            print(f"DEBUG post_job: created job id={job.id}, recruiter_id={job.recruiter_id}, title={job.title}")
        except Exception:
            pass

        # Enqueue background notification task (non-blocking)
        try:
            app_obj = current_app._get_current_object()
            enqueue_job_notification(app_obj, job.id, job.title, getattr(job, 'company_name', 'Employer'))
        except Exception as notify_err:
            print(f"Failed to enqueue job notifications: {notify_err}")

        return jsonify({'message': 'Job posted successfully', 'job': {
            'id': job.id,
            'title': job.title,
            'location': job.location,
            'salary': job.salary,
            'job_type': job.job_type,
            'vacancies': job.vacancies,
            'created_at': job.created_at.isoformat() if hasattr(job, 'created_at') and job.created_at else None,
            'skills': job.skills,
            'description': job.description,
            'experience': job.experience,
            'application_deadline': job.application_deadline.isoformat() if job.application_deadline else None,
            'status': job.status
        }}), 201

    except Exception as e:
        db.session.rollback()
        return jsonify({'message': f'Error: {str(e)}'}), 500


@jobs_bp.route('/update/<int:job_id>', methods=['PUT', 'PATCH'])
@token_required
def update_job(payload, job_id):
    """Update an existing job posting"""
    from database import db
    from models import Job
    try:
        job = Job.query.get(job_id)
        if not job:
            return jsonify({'message': 'Job not found'}), 404
        
        # Check authorization
        if job.recruiter_id != payload.get('user_id'):
            return jsonify({'message': 'Forbidden'}), 403

        data = request.get_json() or {}
        
        if 'title' in data:
            job.title = data['title']
        if 'location' in data:
            job.location = data['location']
        if 'salary' in data:
            job.salary = data['salary']
        if 'job_type' in data:
            job.job_type = data['job_type']
        if 'vacancies' in data:
            vacs_raw = data['vacancies']
            if vacs_raw and str(vacs_raw).strip():
                try:
                    job.vacancies = int(vacs_raw)
                except ValueError:
                    job.vacancies = None
            else:
                job.vacancies = None
        if 'skills' in data:
            job.skills = data['skills']
        if 'description' in data:
            job.description = data['description']
        if 'experience' in data:
            job.experience = data['experience']
        if 'status' in data:
            job.status = data['status']
            
        deadline_str = data.get('application_deadline')
        if deadline_str:
            try:
                job.application_deadline = datetime.fromisoformat(deadline_str.replace('Z', '+00:00'))
            except Exception as dt_err:
                print(f"Error parsing date: {dt_err}")

        db.session.commit()
        return jsonify({'message': 'Job updated successfully'}), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': f'Error: {str(e)}'}), 500

@jobs_bp.route('/status/<int:job_id>', methods=['PUT', 'PATCH'])
@token_required
def update_job_status(payload, job_id):
    """Change job status (Active, Closed, Expired, Archived)"""
    from database import db
    from models import Job
    try:
        data = request.get_json() or {}
        new_status = data.get('status')
        if not new_status:
             return jsonify({'message': 'Status is required'}), 400

        job = Job.query.get(job_id)
        if not job:
            return jsonify({'message': 'Job not found'}), 404
            
        if job.recruiter_id != payload.get('user_id'):
            return jsonify({'message': 'Forbidden'}), 403
            
        job.status = new_status
        db.session.commit()
        return jsonify({'message': f'Job status updated to {new_status}'}), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': f'Error: {str(e)}'}), 500

@jobs_bp.route('/my_jobs', methods=['GET'])
@token_required
def my_jobs(payload):
    """Return jobs created by the authenticated recruiter"""
    try:
        from models import Job
        recruiter_id = payload.get('user_id')
        jobs = Job.query.filter_by(recruiter_id=recruiter_id).all()

        jobs_data = []
        for j in jobs:
            jobs_data.append({
                'id': j.id,
                'title': j.title,
                'company_name': j.company_name,
                'location': j.location,
                'salary': j.salary,
                'job_type': j.job_type,
                'vacancies': j.vacancies,
                'skills': j.skills,
                'description': j.description,
                'experience': j.experience,
                'application_deadline': j.application_deadline.isoformat() if hasattr(j, 'application_deadline') and j.application_deadline else None,
                'status': j.status,
                'created_at': j.created_at.isoformat() if hasattr(j, 'created_at') and j.created_at else None
            })

        return jsonify({'message': 'My jobs retrieved', 'jobs': jobs_data}), 200
    except Exception as e:
        return jsonify({'message': f'Error: {str(e)}'}), 500


@jobs_bp.route('/applications/<int:job_id>', methods=['GET'])
@token_required
def get_applications(payload, job_id):
    """Return applications for a specific job (recruiter-only)"""
    try:
        from models import Application, Job

        job = Job.query.get(job_id)
        if not job:
            return jsonify({'message': 'Job not found'}), 404

        # Only the recruiter who owns the job or an admin can view applications
        if job.recruiter_id != payload.get('user_id'):
            from models import User
            user = User.query.get(payload.get('user_id'))
            if not user or user.role != 'admin':
                return jsonify({'message': 'Forbidden'}), 403

        apps = Application.query.filter_by(job_id=job_id).all()
        apps_data = []
        for a in apps:
            apps_data.append({
                'id': a.id,
                'name': a.name,
                'email': a.email,
                'phone': getattr(a, 'phone', ''),
                'resume': a.resume,
                'status': a.status
            })

        return jsonify(apps_data), 200

    except Exception as e:
        return jsonify({'message': f'Error: {str(e)}'}), 500


@jobs_bp.route('/applications/all', methods=['GET'])
@token_required
def get_all_applications(payload):
    """Return all applications for the recruiter's jobs"""
    try:
        from models import Application, Job, User
        
        user_id = payload.get('user_id')
        user = User.query.get(user_id)
        
        if user.role == 'admin':
            apps = Application.query.all()
        else:
            apps = Application.query.join(Job).filter(Job.recruiter_id == user_id).all()
            
        apps_data = []
        for a in apps:
            job = Job.query.get(a.job_id)
            apps_data.append({
                'id': a.id,
                'name': a.name,
                'email': a.email,
                'phone': getattr(a, 'phone', ''),
                'resume': a.resume,
                'status': a.status,
                'job_id': a.job_id,
                'job_title': job.title if job else 'Unknown Job'
            })

        return jsonify(apps_data), 200

    except Exception as e:
        return jsonify({'message': f'Error: {str(e)}'}), 500


@jobs_bp.route('/applications/<int:app_id>/resume', methods=['GET'])
@token_required
def get_application_resume(payload, app_id):
    """Serve the resume file attached to an application (if available)"""
    try:
        from models import Application, Job, User, Resume

        app = Application.query.get(app_id)
        if not app:
            return jsonify({'message': 'Application not found'}), 404

        # Ensure requester is job owner or admin
        job = Job.query.get(app.job_id)
        if not job:
            return jsonify({'message': 'Related job not found'}), 404

        requester = User.query.get(payload.get('user_id'))
        if job.recruiter_id != payload.get('user_id') and (not requester or requester.role != 'admin'):
            return jsonify({'message': 'Forbidden'}), 403

        resume_ref = app.resume or ''

        # If resume_ref is a file path on disk
        if resume_ref and os.path.exists(resume_ref):
            filename = os.path.basename(resume_ref)
            return send_file(resume_ref, as_attachment=True, download_name=filename)

        # Try to locate in Resume table by filename or path
        resume = Resume.query.filter((Resume.file_path == resume_ref) | (Resume.filename == resume_ref)).first()
        if resume and os.path.exists(resume.file_path):
            filename = os.path.basename(resume.file_path)
            return send_file(resume.file_path, as_attachment=True, download_name=filename)

        return jsonify({'message': 'Resume not available'}), 404

    except Exception as e:
        return jsonify({'message': f'Error: {str(e)}'}), 500


@jobs_bp.route('/update_status/<int:app_id>', methods=['POST'])
@token_required
def update_application_status(payload, app_id):
    """Update the status of an application (accept/reject)"""
    from database import db
    try:
        data = request.get_json() or {}
        new_status = data.get('status')
        if new_status not in ['Pending', 'Selected', 'Rejected']:
            return jsonify({'message': 'Invalid status'}), 400

        from models import Application, Job

        app = Application.query.get(app_id)
        if not app:
            return jsonify({'message': 'Application not found'}), 404

        job = Job.query.get(app.job_id)
        if not job:
            return jsonify({'message': 'Related job not found'}), 404

        # Only job owner or admin can update status
        from models import User
        user = User.query.get(payload.get('user_id'))
        if job.recruiter_id != payload.get('user_id') and (not user or user.role != 'admin'):
            return jsonify({'message': 'Forbidden'}), 403

        old_status = app.status
        app.status = new_status

        # record status change in history
        hist = ApplicationHistory(
            application_id=app.id,
            status=new_status,
            changed_by=payload.get('user_id'),
            changed_at=datetime.utcnow(),
            note=None
        )
        db.session.add(hist)
        db.session.commit()

        return jsonify({'message': 'Status updated', 'application': {
            'id': app.id,
            'status': app.status
        }}), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({'message': f'Error: {str(e)}'}), 500


@jobs_bp.route('/applications/<int:app_id>/history', methods=['GET'])
@token_required
def get_application_history(payload, app_id):
    try:
        app = Application.query.get(app_id)
        if not app:
            return jsonify({'message': 'Application not found'}), 404

        # Authorization: only job owner or admin
        job = Job.query.get(app.job_id)
        requester = User.query.get(payload.get('user_id'))
        if job.recruiter_id != payload.get('user_id') and (not requester or requester.role != 'admin'):
            return jsonify({'message': 'Forbidden'}), 403

        history = ApplicationHistory.query.filter_by(application_id=app_id).order_by(ApplicationHistory.changed_at.asc()).all()
        return jsonify({'history': [h.to_dict() for h in history]}), 200
    except Exception as e:
        return jsonify({'message': f'Error: {str(e)}'}), 500


@jobs_bp.route('/applications/<int:app_id>/note', methods=['POST'])
@token_required
def add_application_note(payload, app_id):
    try:
        data = request.get_json() or {}
        content = data.get('content')
        if not content:
            return jsonify({'message': 'Note content required'}), 400

        app = Application.query.get(app_id)
        if not app:
            return jsonify({'message': 'Application not found'}), 404

        job = Job.query.get(app.job_id)
        requester = User.query.get(payload.get('user_id'))
        if job.recruiter_id != payload.get('user_id') and (not requester or requester.role != 'admin'):
            return jsonify({'message': 'Forbidden'}), 403

        note = ApplicationNote(application_id=app_id, author_id=payload.get('user_id'), content=content)
        db.session.add(note)
        db.session.commit()

        return jsonify({'message': 'Note added', 'note': note.to_dict()}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': f'Error: {str(e)}'}), 500


@jobs_bp.route('/applications/<int:app_id>/notes', methods=['GET'])
@token_required
def get_application_notes(payload, app_id):
    try:
        app = Application.query.get(app_id)
        if not app:
            return jsonify({'message': 'Application not found'}), 404

        job = Job.query.get(app.job_id)
        requester = User.query.get(payload.get('user_id'))
        if job.recruiter_id != payload.get('user_id') and (not requester or requester.role != 'admin'):
            return jsonify({'message': 'Forbidden'}), 403

        notes = ApplicationNote.query.filter_by(application_id=app_id).order_by(ApplicationNote.created_at.asc()).all()
        return jsonify({'notes': [n.to_dict() for n in notes]}), 200
    except Exception as e:
        return jsonify({'message': f'Error: {str(e)}'}), 500


@jobs_bp.route('/applications/<int:app_id>/message', methods=['POST'])
@token_required
def message_applicant(payload, app_id):
    try:
        data = request.get_json() or {}
        subject = data.get('subject') or 'Message from recruiter'
        body = data.get('body')
        if not body:
            return jsonify({'message': 'Message body required'}), 400

        app = Application.query.get(app_id)
        if not app:
            return jsonify({'message': 'Application not found'}), 404

        job = Job.query.get(app.job_id)
        requester = User.query.get(payload.get('user_id'))
        if job.recruiter_id != payload.get('user_id') and (not requester or requester.role != 'admin'):
            return jsonify({'message': 'Forbidden'}), 403

        content_html = f"<p>{body}</p><p>Regards,<br/>Recruiting Team</p>"
        html = get_base_template(content_html)
        sent = send_email(app.email, subject, html)

        if not sent:
            return jsonify({'message': 'Failed to send message (email not configured)'}), 500

        return jsonify({'message': 'Message sent'}), 200
    except Exception as e:
        return jsonify({'message': f'Error: {str(e)}'}), 500
