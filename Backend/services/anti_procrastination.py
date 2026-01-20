def generate_micro_tasks(task_title):
    """
    Breaks a task into very small actionable steps
    to reduce procrastination.
    """

    return [
        f"Open workspace for: {task_title}",
        f"Prepare resources for: {task_title}",
        f"Work on {task_title} for 5 minutes",
        f"Review progress on: {task_title}"
    ]
