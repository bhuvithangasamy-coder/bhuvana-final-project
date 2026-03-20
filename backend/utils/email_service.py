import os
from flask_mail import Message
from email_config import mail
from flask import current_app

RECRUITER_EMAIL = os.environ.get('RECRUITER_EMAIL', 'recruiter@example.com')

# Basic CSS for emails
HTML_STYLE = """
<style>
    body { font-family: 'Helvetica Neue', Arial, sans-serif; background-color: #f9fafb; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 20px; border-radius: 8px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05); }
    .header { text-align: center; padding-bottom: 20px; border-bottom: 2px solid #f3f4f6; }
    .logo { font-size: 24px; font-weight: bold; color: #4f46e5; text-decoration: none; }
    .content { padding: 30px 0; color: #374151; line-height: 1.6; }
    .footer { text-align: center; padding-top: 20px; border-top: 2px solid #f3f4f6; font-size: 12px; color: #9ca3af; }
    .btn { display: inline-block; padding: 10px 20px; background-color: #4f46e5; color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: bold; margin-top: 15px; }
    .job-details { background-color: #f3f4f6; padding: 15px; border-radius: 6px; margin: 15px 0; }
</style>
"""

def send_email(to_email, subject, html_content):
    """Core function to send an email using Flask-Mail"""
    sender = current_app.config.get('MAIL_USERNAME')
    if not sender:
        print(f"Warning: Mocking email to {to_email}. Ensure MAIL_USERNAME is set.")
        return False
        
    try:
        msg = Message(subject=subject,
                      sender=sender,
                      recipients=[to_email],
                      html=html_content)
        
        mail.send(msg)
        print(f"Email sent successfully to {to_email}")
        return True
    except Exception as e:
        print(f"Error sending email to {to_email}: {str(e)}")
        return False

def get_base_template(content_html):
    """Wraps email content in standard layout"""
    return f"""
    <!DOCTYPE html>
    <html>
    <head>
        {HTML_STYLE}
    </head>
    <body>
        <div class="container">
            <div class="header">
                <div class="logo">✨ Job Portal</div>
            </div>
            <div class="content">
                {content_html}
            </div>
            <div class="footer">
                <p>&copy; 2026 Job Portal Ecosystem. All rights reserved.</p>
                <p>If you have any questions, reply to this email.</p>
            </div>
        </div>
    </body>
    </html>
    """

def send_welcome_email(user_email, username):
    """Send welcome email to new users"""
    subject = "Welcome to Job Portal"
    content = f"""
        <h2>Welcome aboard, <span style="text-transform: capitalize;">{username}</span>!</h2>
        <p>Thank you for creating an account with our Job Portal. We're excited to help you take the next step in your career journey.</p>
        <p>You can now:</p>
        <ul>
            <li>Upload your resume for AI-powered analysis</li>
            <li>Get matched with top jobs in your field</li>
            <li>Take technical assessments to prove your skills</li>
        </ul>
        <a href="http://localhost:5173/dashboard" class="btn" style="color: #ffffff;">Go to Dashboard</a>
    """
    html_message = get_base_template(content)
    return send_email(user_email, subject, html_message)


def send_application_confirmation(candidate_email, candidate_name, job_title, company_name):
    """Send application confirmation to candidate"""
    subject = "Application Received - Job Portal"
    content = f"""
        <h2>Application Received</h2>
        <p>Hi <span style="text-transform: capitalize;">{candidate_name}</span>,</p>
        <p>Your application was successfully submitted. We have notified the recruiter.</p>
        <div class="job-details">
            <strong>Job Title:</strong> {job_title}<br/>
            <strong>Company:</strong> {company_name}<br/>
        </div>
        <p>The recruiting team will review your profile and get back to you if your qualifications match their needs. You can track your applications in your dashboard.</p>
        <a href="http://localhost:5173/dashboard" class="btn" style="color: #ffffff;">View Applied Jobs</a>
    """
    html_message = get_base_template(content)
    return send_email(candidate_email, subject, html_message)


def send_recruiter_notification(candidate_name, candidate_email, job_title, company_name):
    """Send new application notification to the recruiter"""
    subject = f"New Candidate Application: {job_title}"
    content = f"""
        <h2>New Application Alert</h2>
        <p>A new candidate has just applied for a position at <strong>{company_name}</strong>.</p>
        <div class="job-details">
            <strong>Candidate Name:</strong> <span style="text-transform: capitalize;">{candidate_name}</span><br/>
            <strong>Candidate Email:</strong> <a href="mailto:{candidate_email}">{candidate_email}</a><br/>
            <strong>Position:</strong> {job_title}<br/>
        </div>
        <p>Please review their profile and resume via your employer portal.</p>
        <a href="http://localhost:5173/dashboard" class="btn" style="color: #ffffff;">Review Candidate</a>
    """
    html_message = get_base_template(content)
    return send_email(RECRUITER_EMAIL, subject, html_message)


def send_job_posting_notification(recipient_email, job_title, company_name, job_id=None):
    """Notify users about a new job posting"""
    subject = f"New Job Posted: {job_title} at {company_name}"
    link = f"http://localhost:5173/jobs/{job_id}" if job_id else "http://localhost:5173/jobs"
    content = f"""
        <h2>New Job Posted</h2>
        <p>A new job matching your interests has been posted at <strong>{company_name}</strong>.</p>
        <div class="job-details">
            <strong>Job Title:</strong> {job_title}<br/>
        </div>
        <p>Click below to view and apply for the position.</p>
        <a href="{link}" class="btn" style="color: #ffffff;">View Job</a>
    """
    html_message = get_base_template(content)
    return send_email(recipient_email, subject, html_message)


def send_password_reset_email(user_email, reset_link):
    """Send password reset email to user"""
    subject = "Password Reset - Job Portal"
    content = f"""
        <h2>Password Reset Request</h2>
        <p>You recently requested to reset your password for your Job Portal account. Click the button below to reset it.</p>
        <p>If you did not request a password reset, please ignore this email or contact support if you have concerns.</p>
        <a href="{reset_link}" class="btn" style="color: #ffffff;">Reset Password</a>
        <p style="margin-top: 20px; font-size: 14px; color: #6b7280;">This password reset link is only valid for 1 hour.</p>
    """
    html_message = get_base_template(content)
    return send_email(user_email, subject, html_message)
