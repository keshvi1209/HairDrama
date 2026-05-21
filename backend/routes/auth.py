from flask import Blueprint, jsonify, request, redirect, current_app
from services.supabase_client import get_supabase, get_supabase_admin
from services.auth_middleware import require_auth
from flask import g

auth_bp = Blueprint("auth", __name__)


@auth_bp.route("/google", methods=["GET"])
def google_login():
    """Initiate Google OAuth flow via Supabase."""
    supabase = get_supabase()
    frontend_url = current_app.config["FRONTEND_URL"]
    redirect_to = f"{frontend_url}/auth/callback"

    response = supabase.auth.sign_in_with_oauth({
        "provider": "google",
        "options": {"redirect_to": redirect_to}
    })
    return jsonify({"url": response.url})


@auth_bp.route("/me", methods=["GET"])
@require_auth
def me():
    """Get current authenticated user profile."""
    user = g.user
    supabase = get_supabase_admin()

    profile = supabase.table("profiles").select("*").eq("id", user.id).single().execute()
    data = profile.data or {}

    return jsonify({
        "id": user.id,
        "email": user.email,
        "name": data.get("full_name") or user.user_metadata.get("full_name", ""),
        "avatar_url": data.get("avatar_url") or user.user_metadata.get("avatar_url", ""),
    })


@auth_bp.route("/logout", methods=["POST"])
@require_auth
def logout():
    return jsonify({"message": "Logged out"})
