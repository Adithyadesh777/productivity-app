from models import Task, MicroTask
from database import db
from services.anti_procrastination import generate_micro_tasks


def create_task_with_micro_tasks(title, description=None):
    task = Task(title=title, description=description)
    db.session.add(task)
    db.session.commit()

    micro_titles = generate_micro_tasks(title)

    print("Generated micro-tasks:", micro_titles)

    for mt in micro_titles:
        micro_task = MicroTask(title=mt, task_id=task.id)
        db.session.add(micro_task)

    db.session.commit()

    print("Micro-tasks saved to DB")

    return task
