from flask import Flask
from database import db
from services.task_service import create_task_with_micro_tasks

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///productivity.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db.init_app(app)

import models

with app.app_context():
    db.create_all()
@app.route("/")
def home():
    return "THIS IS MY APP.PY FILE"

@app.route("/test-create-task")
def test_create_task():
    task = create_task_with_micro_tasks("Write productivity app report")
    return "Task and micro-tasks created successfully"

if __name__ == "__main__":
    app.run(debug=True)
