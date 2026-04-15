// DOM Elements
const taskInput = document.getElementById('taskInput');
const addBtn = document.getElementById('addBtn');
const todoList = document.getElementById('todoList');
const emptyState = document.getElementById('emptyState');
const filterBtns = document.querySelectorAll('.filter-btn');
const totalCount = document.getElementById('totalCount');
const completedCount = document.getElementById('completedCount');
const pendingCount = document.getElementById('pendingCount');

// Modal Elements
const editModal = document.getElementById('editModal');
const editInput = document.getElementById('editInput');
const saveBtn = document.getElementById('saveBtn');
const cancelBtn = document.getElementById('cancelBtn');
const closeBtn = document.querySelector('.close');

// State
let todos = JSON.parse(localStorage.getItem('todos')) || [];
let currentFilter = 'all';
let editingId = null;

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    renderTodos();
    updateStats();
});

// Event Listeners
addBtn.addEventListener('click', addTodo);
taskInput.addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        addTodo();
    }
});

filterBtns.forEach(btn => {
    btn.addEventListener('click', function() {
        filterBtns.forEach(b => b.classList.remove('active'));
        this.classList.add('active');
        currentFilter = this.dataset.filter;
        renderTodos();
    });
});

saveBtn.addEventListener('click', saveEdit);
cancelBtn.addEventListener('click', closeEditModal);
closeBtn.addEventListener('click', closeEditModal);
editInput.addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        saveEdit();
    }
});

// Add Todo
function addTodo() {
    const taskText = taskInput.value.trim();

    if (taskText === '') {
        alert('Please enter a task!');
        return;
    }

    const newTodo = {
        id: Date.now(),
        text: taskText,
        completed: false,
        createdAt: new Date().toLocaleString()
    };

    todos.push(newTodo);
    saveTodos();
    renderTodos();
    updateStats();
    taskInput.value = '';
    taskInput.focus();
}

// Render Todos
function renderTodos() {
    todoList.innerHTML = '';

    let filteredTodos = todos;

    if (currentFilter === 'completed') {
        filteredTodos = todos.filter(todo => todo.completed);
    } else if (currentFilter === 'pending') {
        filteredTodos = todos.filter(todo => !todo.completed);
    }

    if (filteredTodos.length === 0) {
        emptyState.classList.add('show');
        return;
    } else {
        emptyState.classList.remove('show');
    }

    filteredTodos.forEach(todo => {
        const li = document.createElement('li');
        li.className = `todo-item ${todo.completed ? 'completed' : ''}`;
        li.innerHTML = `
            <input 
                type="checkbox" 
                class="checkbox" 
                ${todo.completed ? 'checked' : ''}
                onchange="toggleTodo(${todo.id})"
            >
            <span class="todo-text" title="${todo.text}">${escapeHtml(todo.text)}</span>
            <div class="todo-actions">
                <button class="edit-btn" onclick="openEditModal(${todo.id})">Edit</button>
                <button class="delete-btn" onclick="deleteTodo(${todo.id})">Delete</button>
            </div>
        `;
        todoList.appendChild(li);
    });
}

// Toggle Todo Completion
function toggleTodo(id) {
    const todo = todos.find(t => t.id === id);
    if (todo) {
        todo.completed = !todo.completed;
        saveTodos();
        renderTodos();
        updateStats();
    }
}

// Delete Todo
function deleteTodo(id) {
    if (confirm('Are you sure you want to delete this task?')) {
        todos = todos.filter(t => t.id !== id);
        saveTodos();
        renderTodos();
        updateStats();
    }
}

// Open Edit Modal
function openEditModal(id) {
    editingId = id;
    const todo = todos.find(t => t.id === id);
    if (todo) {
        editInput.value = todo.text;
        editModal.classList.add('show');
        editInput.focus();
        editInput.select();
    }
}

// Close Edit Modal
function closeEditModal() {
    editModal.classList.remove('show');
    editingId = null;
    editInput.value = '';
}

// Save Edit
function saveEdit() {
    const newText = editInput.value.trim();

    if (newText === '') {
        alert('Task cannot be empty!');
        return;
    }

    const todo = todos.find(t => t.id === editingId);
    if (todo) {
        todo.text = newText;
        saveTodos();
        renderTodos();
        closeEditModal();
    }
}

// Update Stats
function updateStats() {
    const total = todos.length;
    const completed = todos.filter(t => t.completed).length;
    const pending = total - completed;

    totalCount.textContent = total;
    completedCount.textContent = completed;
    pendingCount.textContent = pending;
}

// Save Todos to LocalStorage
function saveTodos() {
    localStorage.setItem('todos', JSON.stringify(todos));
}

// Escape HTML to prevent XSS
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

// Close modal when clicking outside
window.addEventListener('click', function(e) {
    if (e.target === editModal) {
        closeEditModal();
    }
});
