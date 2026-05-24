import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from flask import current_app
import logging
import urllib.request
import json

logger = logging.getLogger(__name__)

def send_email_via_resend(to_email: str, subject: str, html_body: str):
    """Send an email via Resend HTTP API."""
    api_key = current_app.config.get("RESEND_API_KEY")
    from_email = current_app.config.get("RESEND_FROM_EMAIL", "onboarding@resend.dev")

    if not api_key:
        logger.warning("Resend API key not configured — skipping Resend send.")
        return False

    url = "https://api.resend.com/emails"
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json"
    }
    data = {
        "from": f"HairDrama Tasks <{from_email}>",
        "to": [to_email],
        "subject": subject,
        "html": html_body
    }

    try:
        req = urllib.request.Request(
            url,
            data=json.dumps(data).encode("utf-8"),
            headers=headers,
            method="POST"
        )
        # Use a reasonable 5 second timeout
        with urllib.request.urlopen(req, timeout=5) as response:
            res_body = json.loads(response.read().decode("utf-8"))
            if response.status in [200, 201]:
                logger.info(f"Email sent via Resend to {to_email}: {subject} (ID: {res_body.get('id')})")
                return True
            else:
                logger.error(f"Resend API returned non-success status {response.status}: {res_body}")
                return False
    except Exception as e:
        logger.error(f"Failed to send email via Resend to {to_email}: {e}")
        return False


def send_email(to_email: str, subject: str, html_body: str, text_body: str = None):
    """Send an email. Tries Resend HTTP API first (if configured), then Gmail SMTP as fallback."""
    # Try Resend API if API key is provided
    resend_key = current_app.config.get("RESEND_API_KEY")
    if resend_key:
        logger.info(f"Attempting to send email via Resend to {to_email}")
        if send_email_via_resend(to_email, subject, html_body):
            return True
        logger.warning("Resend delivery failed; falling back to Gmail SMTP...")

    # Fallback to Gmail SMTP
    gmail_user = current_app.config.get("GMAIL_USER")
    gmail_password = current_app.config.get("GMAIL_APP_PASSWORD")

    if not gmail_user or not gmail_password:
        logger.warning("Gmail credentials not configured — skipping email send.")
        return False

    msg = MIMEMultipart("alternative")
    msg["Subject"] = subject
    msg["From"] = f"HairDrama Tasks <{gmail_user}>"
    msg["To"] = to_email

    if text_body:
        msg.attach(MIMEText(text_body, "plain"))
    msg.attach(MIMEText(html_body, "html"))

    try:
        with smtplib.SMTP("smtp.gmail.com", 587, timeout=5) as server:
            server.starttls()  # Upgrade connection to secure SSL/TLS
            server.login(gmail_user, gmail_password)
            server.sendmail(gmail_user, to_email, msg.as_string())
        logger.info(f"Email sent via SMTP to {to_email}: {subject}")
        return True
    except Exception as e:
        logger.error(f"Failed to send email via SMTP to {to_email}: {e}")
        return False


def send_task_created_email(assignee_email: str, assignee_name: str, task_title: str,
                             task_description: str, creator_name: str, task_id: str):
    frontend_url = current_app.config.get("FRONTEND_URL", "http://localhost:3001")
    task_link = f"{frontend_url}/dashboard"

    subject = f"✂️ New Task Assigned: {task_title}"
    html_body = f"""
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body {{ font-family: 'Georgia', serif; background: #0a0a0a; color: #f5f0eb; margin: 0; padding: 0; }}
        .container {{ max-width: 600px; margin: 40px auto; background: #111; border: 1px solid #c9a84c; border-radius: 2px; overflow: hidden; }}
        .header {{ background: #0a0a0a; padding: 40px 32px 28px; border-bottom: 1px solid #c9a84c; }}
        .logo {{ font-size: 28px; letter-spacing: 6px; color: #c9a84c; text-transform: uppercase; font-weight: 300; }}
        .logo span {{ color: #f5f0eb; }}
        .body {{ padding: 36px 32px; }}
        h2 {{ color: #c9a84c; font-size: 14px; letter-spacing: 3px; text-transform: uppercase; margin: 0 0 24px; font-weight: 400; }}
        .task-card {{ background: #1a1a1a; border-left: 3px solid #c9a84c; padding: 20px 24px; margin: 20px 0; border-radius: 1px; }}
        .task-title {{ font-size: 20px; color: #f5f0eb; margin: 0 0 8px; font-weight: 400; }}
        .task-desc {{ color: #888; font-size: 14px; line-height: 1.6; margin: 0; }}
        p {{ color: #bbb; line-height: 1.7; font-size: 14px; }}
        .cta {{ display: inline-block; margin: 24px 0 0; padding: 14px 32px; background: #c9a84c; color: #0a0a0a; text-decoration: none; letter-spacing: 2px; font-size: 11px; text-transform: uppercase; font-weight: 600; }}
        .footer {{ padding: 24px 32px; border-top: 1px solid #222; color: #444; font-size: 12px; letter-spacing: 1px; }}
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo">Hair<span>Drama</span></div>
        </div>
        <div class="body">
          <h2>New Task Assigned to You</h2>
          <p>Hello {assignee_name},</p>
          <p><strong style="color:#f5f0eb">{creator_name}</strong> has assigned you a new task:</p>
          <div class="task-card">
            <div class="task-title">{task_title}</div>
            {f'<p class="task-desc">{task_description}</p>' if task_description else ''}
          </div>
          <a href="{task_link}" class="cta">Move to Dashboard →</a>
        </div>
        <div class="footer">HairDrama — Fashion Task Management</div>
      </div>
    </body>
    </html>
    """
    send_email(assignee_email, subject, html_body)


def send_task_completed_email(creator_email: str, creator_name: str, task_title: str,
                               completer_name: str, task_id: str):
    frontend_url = current_app.config.get("FRONTEND_URL", "http://localhost:3001")
    task_link = f"{frontend_url}/dashboard"

    subject = f"✅ Task Completed: {task_title}"
    html_body = f"""
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body {{ font-family: 'Georgia', serif; background: #0a0a0a; color: #f5f0eb; margin: 0; padding: 0; }}
        .container {{ max-width: 600px; margin: 40px auto; background: #111; border: 1px solid #c9a84c; border-radius: 2px; overflow: hidden; }}
        .header {{ background: #0a0a0a; padding: 40px 32px 28px; border-bottom: 1px solid #c9a84c; }}
        .logo {{ font-size: 28px; letter-spacing: 6px; color: #c9a84c; text-transform: uppercase; font-weight: 300; }}
        .logo span {{ color: #f5f0eb; }}
        .body {{ padding: 36px 32px; }}
        h2 {{ color: #5db87a; font-size: 14px; letter-spacing: 3px; text-transform: uppercase; margin: 0 0 24px; font-weight: 400; }}
        .task-card {{ background: #1a1a1a; border-left: 3px solid #5db87a; padding: 20px 24px; margin: 20px 0; border-radius: 1px; }}
        .task-title {{ font-size: 20px; color: #f5f0eb; margin: 0; font-weight: 400; }}
        p {{ color: #bbb; line-height: 1.7; font-size: 14px; }}
        .cta {{ display: inline-block; margin: 24px 0 0; padding: 14px 32px; background: #c9a84c; color: #0a0a0a; text-decoration: none; letter-spacing: 2px; font-size: 11px; text-transform: uppercase; font-weight: 600; }}
        .footer {{ padding: 24px 32px; border-top: 1px solid #222; color: #444; font-size: 12px; letter-spacing: 1px; }}
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo">Hair<span>Drama</span></div>
        </div>
        <div class="body">
          <h2>Task Completed</h2>
          <p>Hello {creator_name},</p>
          <p><strong style="color:#f5f0eb">{completer_name}</strong> has completed your task:</p>
          <div class="task-card">
            <div class="task-title">{task_title}</div>
          </div>
          <a href="{task_link}" class="cta">Move to Dashboard →</a>
        </div>
        <div class="footer">HairDrama — Fashion Task Management</div>
      </div>
    </body>
    </html>
    """
    send_email(creator_email, subject, html_body)
