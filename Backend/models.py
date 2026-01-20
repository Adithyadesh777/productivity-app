from datetime import datetime
from database import db

class Task(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(150), nullable=False)
    description = db.Column(db.Text)
    status = db.Column(db.String(20), default="pending")
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    
    micro_tasks = db.relationship('MicroTask', backref='task', lazy=True)


class MicroTask(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(150), nullable=False)
    completed = db.Column(db.Boolean, default=False)

    
    task_id = db.Column(db.Integer, db.ForeignKey('task.id'))
