from extentions import db
from models import Task, MicroTask

def create_task_with_micro_tasks(title):
    task = Task(title=title)
    db.session.add(task)
    db.session.commit()

    steps = [
        "Break task into steps",
        "Start first small step",
        "Finish remaining steps"
    ]

    for s in steps:
        db.session.add(MicroTask(title=s, task_id=task.id))

    db.session.commit()
    return task
