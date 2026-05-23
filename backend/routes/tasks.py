from flask import Blueprint, jsonify, request, g
from services.supabase_client import get_supabase_admin
from services.auth_middleware import require_auth
from services.email_service import send_task_created_email, send_task_completed_email
import uuid

tasks_bp = Blueprint("tasks", __name__)


def get_user_profile(supabase, user_id: str):
    try:
        result = supabase.table("profiles").select("*").eq("id", user_id).single().execute()
        return result.data
    except:
        return None


@tasks_bp.route("", methods=["GET"])
@require_auth
def list_tasks():
    supabase = get_supabase_admin()
    user_id = g.user.id

    result = supabase.table("tasks").select(
        "*, creator:profiles!tasks_creator_id_fkey(id, full_name, avatar_url, email), "
        "assignee:profiles!tasks_assignee_id_fkey(id, full_name, avatar_url, email)"
    ).or_(
        f"creator_id.eq.{user_id},assignee_id.eq.{user_id}"
    ).order("created_at", desc=True).execute()

    return jsonify(result.data or [])


@tasks_bp.route("", methods=["POST"])
@require_auth
def create_task():
    supabase = get_supabase_admin()
    user_id = g.user.id
    data = request.get_json()

    if not data or not data.get("title"):
        return jsonify({"error": "Title is required"}), 400

    task = {
        "id": str(uuid.uuid4()),
        "title": data["title"],
        "description": data.get("description", ""),
        "status": "todo",
        "priority": data.get("priority", "medium"),
        "creator_id": user_id,
        "assignee_id": data.get("assignee_id"),
        "due_date": data.get("due_date"),
    }

    result = supabase.table("tasks").insert(task).execute()
    created = result.data[0] if result.data else task

    # Send email notification to assignee
    if task["assignee_id"] and task["assignee_id"] != user_id:
        try:
            assignee = get_user_profile(supabase, task["assignee_id"])
            creator = get_user_profile(supabase, user_id)
            if assignee and assignee.get("email"):
                send_task_created_email(
                    assignee_email=assignee["email"],
                    assignee_name=assignee.get("full_name", "there"),
                    task_title=task["title"],
                    task_description=task.get("description", ""),
                    creator_name=creator.get("full_name", "Someone") if creator else "Someone",
                    task_id=task["id"],
                )
        except Exception as e:
            pass  # Don't fail task creation if email fails

    return jsonify(created), 201


@tasks_bp.route("/<task_id>", methods=["GET"])
@require_auth
def get_task(task_id):
    supabase = get_supabase_admin()
    result = supabase.table("tasks").select(
        "*, creator:profiles!tasks_creator_id_fkey(id, full_name, avatar_url, email), "
        "assignee:profiles!tasks_assignee_id_fkey(id, full_name, avatar_url, email)"
    ).eq("id", task_id).single().execute()

    if not result.data:
        return jsonify({"error": "Task not found"}), 404

    return jsonify(result.data)


@tasks_bp.route("/<task_id>", methods=["PATCH"])
@require_auth
def update_task(task_id):
    supabase = get_supabase_admin()
    user_id = g.user.id
    data = request.get_json()

    # Fetch current task
    current = supabase.table("tasks").select("*").eq("id", task_id).single().execute()
    if not current.data:
        return jsonify({"error": "Task not found"}), 404

    task = current.data

    # Lock completed tasks
    if task.get("status") == "done":
        return jsonify({"error": "Completed tasks are locked and cannot be modified"}), 403

    allowed = ["title", "description", "status", "priority", "assignee_id", "due_date"]
    updates = {k: v for k, v in data.items() if k in allowed}

    # Enforce role-based and status-based editing permissions:
    # - Completed tasks are locked (handled above).
    # - In-Progress tasks: Only assignee can edit status. Creators and others locked (no change).
    # - To-Do tasks: Creator has full edit, Assignee has status-only edit.
    
    if task.get("status") == "in_progress":
        if task.get("assignee_id") != user_id:
            return jsonify({"error": "Only the assignee can update the status of an in-progress task. Creators cannot make changes."}), 403
        
        # User is the assignee. They can ONLY update 'status'.
        changed_fields = []
        for k, v in updates.items():
            if k != "status":
                old_val = task.get(k) or ""
                new_val = v or ""
                if str(old_val) != str(new_val):
                    changed_fields.append(k)
        
        if changed_fields:
            return jsonify({
                "error": f"Assignees are only permitted to update task status. You cannot edit: {', '.join(changed_fields)}"
            }), 403
        
        updates = {"status": updates.get("status")} if "status" in updates else {}

    elif task.get("status") == "todo":
        if task.get("creator_id") != user_id:
            if task.get("assignee_id") != user_id:
                return jsonify({"error": "Only the task creator or assignee can update this task"}), 403
            
            # User is the assignee. They can ONLY update 'status'.
            changed_fields = []
            for k, v in updates.items():
                if k != "status":
                    old_val = task.get(k) or ""
                    new_val = v or ""
                    if str(old_val) != str(new_val):
                        changed_fields.append(k)

            if changed_fields:
                return jsonify({
                    "error": f"Assignees are only permitted to update task status. You cannot edit: {', '.join(changed_fields)}"
                }), 403
            
            updates = {"status": updates.get("status")} if "status" in updates else {}

    if not updates:
        return jsonify(task)

    result = supabase.table("tasks").update(updates).eq("id", task_id).execute()
    updated = result.data[0] if result.data else {**task, **updates}

    # Notify creator when task is completed
    if updates.get("status") == "done" and task.get("status") != "done":
        try:
            creator = get_user_profile(supabase, task["creator_id"])
            completer = get_user_profile(supabase, user_id)
            if creator and creator.get("email") and creator["id"] != user_id:
                send_task_completed_email(
                    creator_email=creator["email"],
                    creator_name=creator.get("full_name", "there"),
                    task_title=task["title"],
                    completer_name=completer.get("full_name", "Someone") if completer else "Someone",
                    task_id=task_id,
                )
        except Exception:
            pass

    # Notify new assignee if task is newly assigned or reassigned
    if "assignee_id" in updates and updates["assignee_id"] != task.get("assignee_id"):
        new_assignee_id = updates["assignee_id"]
        if new_assignee_id and new_assignee_id != user_id:
            try:
                assignee = get_user_profile(supabase, new_assignee_id)
                creator = get_user_profile(supabase, task.get("creator_id") or user_id)
                if assignee and assignee.get("email"):
                    send_task_created_email(
                        assignee_email=assignee["email"],
                        assignee_name=assignee.get("full_name", "there"),
                        task_title=updated.get("title") or task.get("title"),
                        task_description=updated.get("description") or task.get("description", ""),
                        creator_name=creator.get("full_name", "Someone") if creator else "Someone",
                        task_id=task_id,
                    )
            except Exception:
                pass

    return jsonify(updated)


@tasks_bp.route("/<task_id>", methods=["DELETE"])
@require_auth
def delete_task(task_id):
    supabase = get_supabase_admin()
    user_id = g.user.id

    current = supabase.table("tasks").select("creator_id").eq("id", task_id).single().execute()
    if not current.data:
        return jsonify({"error": "Task not found"}), 404
    if current.data["creator_id"] != user_id:
        return jsonify({"error": "Only the task creator can delete this task"}), 403

    supabase.table("tasks").delete().eq("id", task_id).execute()
    return jsonify({"message": "Task deleted"}), 200
