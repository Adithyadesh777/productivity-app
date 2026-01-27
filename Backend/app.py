from flask import Flask, request, jsonify, render_template
from flask_cors import CORS
from extentions import db
import os

app = Flask(__name__, template_folder='Template', static_folder='Static')
CORS(app)

app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///productivity.db"
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

db.init_app(app)

from models import Task, MicroTask
from services.task_service import create_task_with_micro_tasks

@app.route("/")
def home():
    return "Backend Running"

@app.route("/ui")
def ui():
    return render_template("index.html")

@app.route("/tasks", methods=["POST"])
def create_task():
    data = request.json
    task = create_task_with_micro_tasks(data["title"])
    return jsonify({
        "message": "Task created",
        "task_id": task.id,
        "task": format_task(task)
    })

@app.route("/tasks", methods=["GET"])
def get_tasks():
    tasks = Task.query.order_by(Task.created_at.desc()).all()
    return jsonify([format_task(t) for t in tasks])

@app.route("/tasks/<int:task_id>/complete", methods=["PUT"])
def complete_task(task_id):
    task = Task.query.get(task_id)
    if not task:
        return jsonify({"error": "Task not found"}), 404
    task.is_completed = not task.is_completed
    db.session.commit()
    return jsonify({"message": "Task updated", "task": format_task(task)})

@app.route("/tasks/<int:task_id>/micro-tasks/<int:micro_task_id>/complete", methods=["PUT"])
def complete_micro_task(task_id, micro_task_id):
    micro_task = MicroTask.query.filter_by(id=micro_task_id, task_id=task_id).first()
    if not micro_task:
        return jsonify({"error": "Micro task not found"}), 404
    micro_task.is_completed = not micro_task.is_completed
    db.session.commit()
    task = Task.query.get(task_id)
    return jsonify({"message": "Micro task updated", "task": format_task(task)})

@app.route("/tasks/<int:task_id>", methods=["DELETE"])
def delete_task(task_id):
    task = Task.query.get(task_id)
    if not task:
        return jsonify({"error": "Task not found"}), 404
    db.session.delete(task)
    db.session.commit()
    return jsonify({"message": "Task deleted"})

@app.route("/tasks/<int:task_id>/micro-tasks", methods=["POST"])
def create_micro_task(task_id):
    task = Task.query.get(task_id)
    if not task:
        return jsonify({"error": "Task not found"}), 404
    
    data = request.json
    if not data.get("title"):
        return jsonify({"error": "Micro task title is required"}), 400
    
    micro_task = MicroTask(title=data["title"], task_id=task_id)
    db.session.add(micro_task)
    db.session.commit()
    
    return jsonify({
        "message": "Micro task created",
        "task": format_task(task)
    })

@app.route("/tasks/<int:task_id>/micro-tasks/<int:micro_task_id>", methods=["DELETE"])
def delete_micro_task(task_id, micro_task_id):
    micro_task = MicroTask.query.filter_by(id=micro_task_id, task_id=task_id).first()
    if not micro_task:
        return jsonify({"error": "Micro task not found"}), 404
    
    db.session.delete(micro_task)
    db.session.commit()
    
    task = Task.query.get(task_id)
    return jsonify({
        "message": "Micro task deleted",
        "task": format_task(task)
    })

def format_task(task):
    completed_micro = sum(1 for m in task.micro_tasks if m.is_completed)
    total_micro = len(task.micro_tasks)
    progress = (completed_micro / total_micro * 100) if total_micro > 0 else 0
    
    return {
        "id": task.id,
        "title": task.title,
        "is_completed": task.is_completed,
        "created_at": task.created_at.isoformat(),
        "micro_tasks": [
            {
                "id": m.id,
                "title": m.title,
                "is_completed": m.is_completed
            }
            for m in task.micro_tasks
        ],
        "progress": progress,
        "completed_micro_tasks": completed_micro,
        "total_micro_tasks": total_micro
    }

if __name__ == "__main__":
    with app.app_context():
        db.create_all()
    app.run(debug=True)
