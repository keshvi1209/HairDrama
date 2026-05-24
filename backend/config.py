import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    SECRET_KEY = os.environ.get("SECRET_KEY", "dev-secret-key-change-in-prod")
    
    # Supabase
    SUPABASE_URL = os.environ.get("SUPABASE_URL")
    SUPABASE_ANON_KEY = os.environ.get("SUPABASE_ANON_KEY")
    SUPABASE_SERVICE_ROLE_KEY = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")

    # Google OAuth
    GOOGLE_CLIENT_ID = os.environ.get("GOOGLE_CLIENT_ID")
    GOOGLE_CLIENT_SECRET = os.environ.get("GOOGLE_CLIENT_SECRET")

    # Gmail SMTP
    GMAIL_USER = os.environ.get("GMAIL_USER")
    GMAIL_APP_PASSWORD = os.environ.get("GMAIL_APP_PASSWORD")

    # Resend API (for deployed environments)
    RESEND_API_KEY = os.environ.get("RESEND_API_KEY")
    RESEND_FROM_EMAIL = os.environ.get("RESEND_FROM_EMAIL", "onboarding@resend.dev")

    # Brevo API (Ideal for deployed free-tier assignments without custom domains)
    BREVO_API_KEY = os.environ.get("BREVO_API_KEY")
    BREVO_SENDER_EMAIL = os.environ.get("BREVO_SENDER_EMAIL")

    # CORS
    ALLOWED_ORIGINS = os.environ.get("ALLOWED_ORIGINS", "http://localhost:3001").split(",")

    # Frontend URL (for redirect after OAuth)
    FRONTEND_URL = os.environ.get("FRONTEND_URL", "http://localhost:3001")
