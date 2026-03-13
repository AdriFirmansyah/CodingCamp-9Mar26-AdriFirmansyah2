// =========================================================
// 1. TEMA & BACKGROUND ACAK (RANDOM GRADIENT & DYNAMIC COLOR)
// =========================================================
const themeToggle = document.getElementById('theme-toggle');
const body = document.getElementById('app-body');

// Fungsi untuk membuat warna acak menggunakan format HSL
function applyRandomBackground(isDark) {
    // HSL (Hue, Saturation, Lightness)
    const hue1 = Math.floor(Math.random() * 360);
    const hue2 = (hue1 + Math.floor(Math.random() * 50) + 40) % 360; 

    // KUNCI DARK MODE
    const light1 = isDark ? Math.floor(Math.random() * 15) + 10 : Math.floor(Math.random() * 15) + 75;
    const light2 = isDark ? Math.floor(Math.random() * 15) + 10 : Math.floor(Math.random() * 15) + 75;

    const color1 = `hsl(${hue1}, 70%, ${light1}%)`;
    const color2 = `hsl(${hue2}, 70%, ${light2}%)`;

    // Terapkan ke background HTML
    body.style.background = `linear-gradient(135deg, ${color1} 0%, ${color2} 100%)`;
    body.style.backgroundSize = "200% 200%"; 

    // --- LOGIKA WARNA DINAMIS ---
    const accentLight = isDark ? 65 : 45; 
    
    // 1. Warna Utama (Accent) untuk teks h2 dan border
    const accentColor = `hsl(${hue1}, 80%, ${accentLight}%)`;
    
    // 2. Warna Tombol Pomodoro (Menggunakan Teori Roda Warna)
    const startColor = `hsl(${hue1}, 80%, ${accentLight}%)`; // Searah tema
    const pauseColor = `hsl(${(hue1 + 45) % 360}, 80%, ${accentLight}%)`; // Bergeser 45 derajat (Analogous)
    const resetColor = `hsl(${(hue1 + 180) % 360}, 80%, ${accentLight}%)`; // Berlawanan 180 derajat (Complementary)
    
    // Kirim variabel warna ke CSS
    document.documentElement.style.setProperty('--dynamic-accent', accentColor);
    document.documentElement.style.setProperty('--dynamic-start', startColor);
    document.documentElement.style.setProperty('--dynamic-pause', pauseColor);
    document.documentElement.style.setProperty('--dynamic-reset', resetColor);
}

// Cek Local Storage untuk tema yang tersimpan
const savedTheme = localStorage.getItem('theme') || 'light';
const isInitiallyDark = savedTheme === 'dark';

if (isInitiallyDark) {
    document.documentElement.setAttribute('data-theme', 'dark');
}

// Terapkan warna acak SAAT PERTAMA KALI WEB DIMUAT
applyRandomBackground(isInitiallyDark);

// Fungsi untuk mengganti tema (Terang/Gelap)
themeToggle.addEventListener('click', () => {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    if (currentTheme === 'dark') {
        document.documentElement.removeAttribute('data-theme');
        localStorage.setItem('theme', 'light');
        applyRandomBackground(false); 
    } else {
        document.documentElement.setAttribute('data-theme', 'dark');
        localStorage.setItem('theme', 'dark');
        applyRandomBackground(true); 
    }
});

// Fungsi untuk mengatur sapaan berdasarkan waktu
function updateGreeting(hour) {
    const greetingText = document.getElementById('greeting-text');
    if (hour >= 5 && hour < 12) {
        greetingText.innerText = 'Good morning, ';
    } else if (hour >= 12 && hour < 17) {
        greetingText.innerText = 'Good afternoon, ';
    } else if (hour >= 17 && hour < 20) {
        greetingText.innerText = 'Good evening, ';
    } else {
        greetingText.innerText = 'Good night, ';
    }
}


// =========================================================
// 2. JAM, TANGGAL & NAMA USER
// =========================================================
const clockEl = document.getElementById('clock');
const dateEl = document.getElementById('date');
const userNameEl = document.getElementById('user-name');

const savedName = localStorage.getItem('username');
if (savedName) userNameEl.innerText = savedName;

userNameEl.addEventListener('blur', () => {
    localStorage.setItem('username', userNameEl.innerText);
});

userNameEl.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
        e.preventDefault();
        userNameEl.blur(); 
    }
});

function updateClock() {
    const now = new Date();
    
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    clockEl.innerText = `${hours}:${minutes}`;

    const options = { weekday: 'long', month: 'long', day: 'numeric' };
    dateEl.innerText = now.toLocaleDateString('en-US', options);

    updateGreeting(now.getHours());
}
setInterval(updateClock, 1000); 
updateClock(); 


// =========================================================
// 3. POMODORO TIMER
// =========================================================
let timerInterval;
let timeLeft = 25 * 60; 
let isRunning = false;

const timerDisplay = document.getElementById('timer-display');
const customTimeInput = document.getElementById('custom-time');

function updateTimerDisplay() {
    const m = String(Math.floor(timeLeft / 60)).padStart(2, '0');
    const s = String(timeLeft % 60).padStart(2, '0');
    timerDisplay.innerText = `${m}:${s}`;
}

document.getElementById('btn-start').addEventListener('click', () => {
    if (isRunning) return; 
    isRunning = true;
    timerInterval = setInterval(() => {
        if (timeLeft > 0) {
            timeLeft--;
            updateTimerDisplay();
        } else {
            clearInterval(timerInterval);
            isRunning = false;
            alert("Time's up! Great focus session.");
        }
    }, 1000);
});

document.getElementById('btn-pause').addEventListener('click', () => {
    clearInterval(timerInterval);
    isRunning = false;
});

document.getElementById('btn-reset').addEventListener('click', () => {
    clearInterval(timerInterval);
    isRunning = false;
    let newMinutes = parseInt(customTimeInput.value);
    if (isNaN(newMinutes) || newMinutes < 1) newMinutes = 25; 
    timeLeft = newMinutes * 60;
    updateTimerDisplay();
});


// =========================================================
// 4. TO-DO LIST (CRUD)
// =========================================================
let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
const todoForm = document.getElementById('todo-form');
const todoInput = document.getElementById('todo-input');
const todoList = document.getElementById('todo-list');

function saveAndRenderTasks() {
    localStorage.setItem('tasks', JSON.stringify(tasks));
    renderTasks();
}

function renderTasks() {
    todoList.innerHTML = ''; 
    
    tasks.sort((a, b) => a.completed - b.completed);

    tasks.forEach(task => {
        const li = document.createElement('li');
        li.className = `task-item ${task.completed ? 'completed' : ''}`;
        
        li.innerHTML = `
            <div class="task-content" onclick="toggleTask(${task.id})">
                <i class="${task.completed ? 'fas fa-check-circle' : 'far fa-circle'}"></i>
                <span class="task-text">${task.text}</span>
            </div>
            <div class="task-actions">
                <button onclick="editTask(${task.id})" title="Edit"><i class="fas fa-edit"></i></button>
                <button onclick="deleteTask(${task.id})" class="delete-btn" title="Delete"><i class="fas fa-trash"></i></button>
            </div>
        `;
        todoList.appendChild(li);
    });
}

todoForm.addEventListener('submit', (e) => {
    e.preventDefault(); 
    const text = todoInput.value.trim();
    
    if (text === '') return; 
    
    const isDuplicate = tasks.some(t => t.text.toLowerCase() === text.toLowerCase());
    if (isDuplicate) {
        alert("Task already exists!");
        return;
    }

    const newTask = {
        id: Date.now(), 
        text: text,
        completed: false
    };
    
    tasks.push(newTask);
    todoInput.value = ''; 
    saveAndRenderTasks();
});

window.toggleTask = function(id) {
    const task = tasks.find(t => t.id === id);
    if (task) {
        task.completed = !task.completed;
        saveAndRenderTasks();
    }
};

window.deleteTask = function(id) {
    tasks = tasks.filter(t => t.id !== id); 
    saveAndRenderTasks();
};

window.editTask = function(id) {
    const task = tasks.find(t => t.id === id);
    if (!task) return;
    
    const newText = prompt("Edit your task:", task.text);
    if (newText !== null && newText.trim() !== "") {
        task.text = newText.trim();
        saveAndRenderTasks();
    }
};

renderTasks(); 


// =========================================================
// 5. QUICK LINKS
// =========================================================
let links = JSON.parse(localStorage.getItem('links')) || [];
const linkForm = document.getElementById('link-form');
const linksContainer = document.getElementById('links-container');

function saveAndRenderLinks() {
    localStorage.setItem('links', JSON.stringify(links));
    renderLinks();
}

function renderLinks() {
    linksContainer.innerHTML = '';
    
    links.forEach(link => {
        const a = document.createElement('a');
        a.href = link.url;
        a.className = 'link-item';
        a.target = '_blank'; 
        
        a.innerHTML = `
            <span>${link.name}</span>
            <button class="delete-link" onclick="deleteLink(event, ${link.id})"><i class="fas fa-times"></i></button>
        `;
        linksContainer.appendChild(a);
    });
}

linkForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const nameInput = document.getElementById('link-name');
    const urlInput = document.getElementById('link-url');
    
    let url = urlInput.value.trim();
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
        url = 'https://' + url;
    }

    const newLink = {
        id: Date.now(),
        name: nameInput.value.trim(),
        url: url
    };
    
    links.push(newLink);
    nameInput.value = '';
    urlInput.value = '';
    saveAndRenderLinks();
});

window.deleteLink = function(event, id) {
    event.preventDefault(); 
    links = links.filter(l => l.id !== id);
    saveAndRenderLinks();
};

renderLinks();