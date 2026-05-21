from functools import wraps
from flask import request, jsonify, g
from services.supabase_client import get_supabase_admin

def require_auth(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        auth_header = request.headers.get("Authorization", "")
        if not auth_header.startswith("Bearer "):
            return jsonify({"error": "Missing or invalid authorization header"}), 401

        token = auth_header.split(" ", 1)[1]
        try:
            supabase = get_supabase_admin()
            user_response = supabase.auth.get_user(token)
            if not user_response or not user_response.user:
                return jsonify({"error": "Invalid or expired token"}), 401
            g.user = user_response.user
            g.token = token
        except Exception as e:
            return jsonify({"error": "Authentication failed", "detail": str(e)}), 401

        return f(*args, **kwargs)
    return decorated
