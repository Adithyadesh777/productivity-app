const API_URL = '';  // Use relative URL since we're served from the same server

// Load tasks when page loads
document.addEventListener('DOMContentLoaded', () => {
    loadTasks();
    
    // Add event listener for Enter key in task input
    document.getElementById('taskInput').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            addTask();
        }
    });
});

// Add a new task
async function addTask() {
    const taskInput = document.getElementById('taskInput');
    const title = taskInput.value.trim();
    
    if (!title) {
        alert('Please enter a task title');
        return;
    }
    
    try {
        const response = await fetch(`${API_URL}/tasks`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ title })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            taskInput.value = '';
            loadTasks();
        } else {
            alert('Error creating task: ' + (data.error || 'Unknown error'));
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Failed to create task');
    }
}

// Load and display all tasks
async function loadTasks() {
    try {
        const response = await fetch(`${API_URL}/tasks`);
        const tasks = await response.json();
        
        displayTasks(tasks);
        updateStats(tasks);
    } catch (error) {
        console.error('Error loading tasks:', error);
    }
}

// Display tasks in the UI
function displayTasks(tasks) {
    const container = document.getElementById('tasksContainer');
    
    if (tasks.length === 0) {
        container.innerHTML = '<div class="empty-state"><p>📋 No tasks yet. Add one to get started!</p></div>';
        return;
    }
    
    container.innerHTML = tasks.map(task => {
        let taskHtml = `
            <div class="task-card ${task.is_completed ? 'completed' : ''}">
                <div class="task-header">
                    <input 
                        type="checkbox" 
                        class="task-checkbox" 
                        ${task.is_completed ? 'checked' : ''}
                        onchange="toggleTaskComplete(${task.id})"
                    >
                    <div class="task-title">${escapeHtml(task.title)}</div>
                    <div class="task-date">${formatDate(task.created_at)}</div>
                    <div class="task-actions">
                        <button class="btn btn-delete" onclick="deleteTask(${task.id})">Delete</button>
                    </div>
                </div>
        `;
        
        if (task.total_micro_tasks > 0) {
            taskHtml += `
                <div class="task-progress">
                    <div class="progress-label">
                        <span>Progress: ${task.completed_micro_tasks}/${task.total_micro_tasks}</span>
                        <span>${Math.round(task.progress)}%</span>
                    </div>
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${task.progress}%"></div>
                    </div>
                </div>
                
                <div class="micro-tasks">
                    <div class="micro-tasks-title">Sub-tasks:</div>
                    ${task.micro_tasks.map(microTask => `
                        <div class="micro-task-item ${microTask.is_completed ? 'completed' : ''}">
                            <input 
                                type="checkbox" 
                                class="micro-task-checkbox"
                                ${microTask.is_completed ? 'checked' : ''}
                                onchange="toggleMicroTaskComplete(${task.id}, ${microTask.id})"
                            >
                            <span class="micro-task-text">${escapeHtml(microTask.title)}</span>
                            <button class="btn-micro-delete" onclick="deleteMicroTask(${task.id}, ${microTask.id})" title="Delete sub-task">×</button>
                        </div>
                    `).join('')}
                </div>
                
                <div class="add-micro-task">
                    <input 
                        type="text" 
                        id="microTaskInput-${task.id}"
                        class="micro-task-input" 
                        placeholder="Add a sub-task..." 
                        onkeypress="if(event.key==='Enter') addMicroTask(${task.id})"
                    >
                    <button class="btn btn-secondary" onclick="addMicroTask(${task.id})">+ Add</button>
                </div>
            `;
        } else {
            taskHtml += `
                <div class="no-micro-tasks">
                    <p>No sub-tasks yet</p>
                    <div class="add-micro-task">
                        <input 
                            type="text" 
                            id="microTaskInput-${task.id}"
                            class="micro-task-input" 
                            placeholder="Add a sub-task..." 
                            onkeypress="if(event.key==='Enter') addMicroTask(${task.id})"
                        >
                        <button class="btn btn-secondary" onclick="addMicroTask(${task.id})">+ Add</button>
                    </div>
                </div>
            `;
        }
        
        taskHtml += `</div>`;
        return taskHtml;
    }).join('');
}

// Toggle task completion status
async function toggleTaskComplete(taskId) {
    try {
        const response = await fetch(`${API_URL}/tasks/${taskId}/complete`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            }
        });
        
        if (response.ok) {
            loadTasks();
        } else {
            alert('Error updating task');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Failed to update task');
    }
}

// Toggle micro task completion status
async function toggleMicroTaskComplete(taskId, microTaskId) {
    try {
        const response = await fetch(`${API_URL}/tasks/${taskId}/micro-tasks/${microTaskId}/complete`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            }
        });
        
        if (response.ok) {
            loadTasks();
        } else {
            alert('Error updating micro task');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Failed to update micro task');
    }
}

// Delete a micro task
async function deleteMicroTask(taskId, microTaskId) {
    if (!confirm('Delete this sub-task?')) {
        return;
    }
    
    try {
        const response = await fetch(`${API_URL}/tasks/${taskId}/micro-tasks/${microTaskId}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            }
        });
        
        if (response.ok) {
            loadTasks();
        } else {
            alert('Error deleting sub-task');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Failed to delete sub-task');
    }
}

// Add a new micro task
async function addMicroTask(taskId) {
    const input = document.getElementById(`microTaskInput-${taskId}`);
    const title = input.value.trim();
    
    if (!title) {
        alert('Please enter a sub-task title');
        return;
    }
    
    try {
        const response = await fetch(`${API_URL}/tasks/${taskId}/micro-tasks`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ title })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            input.value = '';
            loadTasks();
        } else {
            alert('Error adding sub-task: ' + (data.error || 'Unknown error'));
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Failed to add sub-task');
    }
}

// Delete a task
async function deleteTask(taskId) {
    console.log('Delete button clicked for task:', taskId);
    
    if (!confirm('Are you sure you want to delete this task?')) {
        console.log('Delete cancelled by user');
        return;
    }
    
    console.log('Confirmed delete for task:', taskId);
    console.log('Sending DELETE request to:', `/tasks/${taskId}`);
    
    try {
        const url = `/tasks/${taskId}`;
        console.log('Full URL:', url);
        
        const response = await fetch(url, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            }
        });
        
        console.log('Response received - Status:', response.status);
        console.log('Response ok:', response.ok);
        
        const data = await response.json();
        console.log('Response data:', data);
        
        if (response.ok) {
            console.log('Delete successful, reloading tasks');
            await new Promise(resolve => setTimeout(resolve, 300));
            await loadTasks();
        } else {
            alert('Error: ' + (data.error || 'Failed to delete task'));
        }
    } catch (error) {
        console.error('Fetch error:', error);
        alert('Failed to delete task: ' + error.message);
    }
}

// Update statistics
function updateStats(tasks) {
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(t => t.is_completed).length;
    const activeTasks = totalTasks - completedTasks;
    const completionRate = totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);
    
    document.getElementById('totalTasks').textContent = totalTasks;
    document.getElementById('completedTasks').textContent = completedTasks;
    document.getElementById('activeTasks').textContent = activeTasks;
    document.getElementById('completionRate').textContent = completionRate + '%';
}

// Utility function to escape HTML
function escapeHtml(text) {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, m => map[m]);
}

// Format date
function formatDate(dateString) {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (date.toDateString() === today.toDateString()) {
        return 'Today at ' + date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    } else if (date.toDateString() === yesterday.toDateString()) {
        return 'Yesterday at ' + date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    } else {
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: date.getFullYear() !== today.getFullYear() ? 'numeric' : undefined });
    }
}
