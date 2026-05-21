from flask import Blueprint, jsonify, request, g
from services.supabase_client import get_supabase_admin
from services.auth_middleware import require_auth

users_bp = Blueprint("users", __name__)


@users_bp.route("", methods=["GET"])
@require_auth
def list_users():
    """List all users (for task assignment dropdown)."""
    supabase = get_supabase_admin()
    result = supabase.table("profiles").select("id, full_name, avatar_url, email").execute()
    return jsonify(result.data or [])


@users_bp.route("/profile", methods=["PATCH"])
@require_auth
def update_profile():
    supabase = get_supabase_admin()
    user_id = g.user.id
    data = request.get_json()

    allowed = ["full_name", "avatar_url"]
    updates = {k: v for k, v in data.items() if k in allowed}

    result = supabase.table("profiles").update(updates).eq("id", user_id).execute()
    return jsonify(result.data[0] if result.data else {})
