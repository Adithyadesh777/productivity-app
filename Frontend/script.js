const API_URL = "http://127.0.0.1:5000";

function createTask() {
    const title = document.getElementById("taskTitle").value;

    if (!title) {
        alert("Please enter a task");
        return;
    }

    fetch(`${API_URL}/tasks`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ title })
    })
    .then(res => res.json())
    .then(() => {
        document.getElementById("taskTitle").value = "";
        loadTasks();
    });
}

function loadTasks() {
    fetch(`${API_URL}/tasks`)
        .then(res => res.json())
        .then(tasks => {
            const list = document.getElementById("taskList");
            list.innerHTML = "";

            tasks.forEach(task => {
                const li = document.createElement("li");
                li.textContent = task.title;
                list.appendChild(li);
            });
        });
}

loadTasks();
