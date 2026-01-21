const API_URL = "http://127.0.0.1:5000";

/* ---------------- TASK LOGIC ---------------- */

async function createTask() {
    const input = document.getElementById("taskTitle");
    const title = input.value.trim();

    if (!title) {
        alert("Please enter a task");
        return;
    }

    await fetch(`${API_URL}/tasks`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ title })
    });

    input.value = "";
    loadTasks();
}

async function loadTasks() {
    const response = await fetch(`${API_URL}/tasks`);
    const tasks = await response.json();

    const list = document.getElementById("taskList");
    list.innerHTML = "";

    tasks.forEach(task => {
        const li = document.createElement("li");
        li.innerHTML = `<strong>${task.title}</strong>`;

        const ul = document.createElement("ul");

        task.micro_tasks.forEach(micro => {
            const mi = document.createElement("li");
            mi.textContent = micro.title;
            ul.appendChild(mi);
        });

        li.appendChild(ul);
        list.appendChild(li);
    });
}

window.onload = loadTasks;

/* ---------------- FOCUS TIMER ---------------- */

let minutes = 25;
let seconds = 0;
let timerInterval = null;

function startTimer() {
    if (timerInterval) return;

    timerInterval = setInterval(() => {
        if (seconds === 0) {
            if (minutes === 0) {
                clearInterval(timerInterval);
                timerInterval = null;
                alert("🎉 Focus session completed! Great job!");
                return;
            }
            minutes--;
            seconds = 59;
        } else {
            seconds--;
        }

        updateTimerDisplay();
    }, 1000);
}

function resetTimer() {
    clearInterval(timerInterval);
    timerInterval = null;
    minutes = 25;
    seconds = 0;
    updateTimerDisplay();
}

function updateTimerDisplay() {
    document.getElementById("time").innerText =
        `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}
