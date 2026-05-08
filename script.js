const taskInput = document.getElementById('taskInput');
const taskDate = document.getElementById('taskDate');
const taskTime = document.getElementById('taskTime');
const taskStatus = document.getElementById('taskStatus');
const addBtn = document.getElementById('addBtn');
const todoList = document.getElementById('todoList');
const doingList = document.getElementById('doingList');
const doneList = document.getElementById('doneList');
const clock = document.getElementById('clock');
const dateNow = document.getElementById('dateNow');
const calendar = document.getElementById('calendar');
const monthYear = document.getElementById('monthYear');
const prevMonth = document.getElementById('prevMonth');
const nextMonth = document.getElementById('nextMonth');
const themeToggle = document.getElementById('themeToggle');

let tasks = [];
let current = new Date();

function uid() { return Date.now() + Math.random().toString(16).slice(2); }
function formatDate(d) { return new Intl.DateTimeFormat('id-ID', { weekday:'long', year:'numeric', month:'long', day:'numeric' }).format(d); }
function updateClock() {
  const now = new Date();
  clock.textContent = now.toLocaleTimeString('id-ID');
  dateNow.textContent = formatDate(now);
}
function applyTheme(theme) {
  document.body.dataset.theme = theme;
  themeToggle.textContent = theme === 'dark' ? '☀️ Light Mode' : '🌙 Dark Mode';
  localStorage.setItem('miawlist-theme', theme);
}
function initTheme() {
  const saved = localStorage.getItem('miawlist-theme');
  const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  applyTheme(saved || (prefersDark ? 'dark' : 'light'));
}
function addTask() {
  const title = taskInput.value.trim();
  if (!title) return;
  tasks.push({ id: uid(), title, date: taskDate.value, time: taskTime.value, status: taskStatus.value, done: false });
  taskInput.value = '';
  taskDate.value = '';
  taskTime.value = '';
  taskStatus.value = 'todo';
  render();
}
function renderTasks() {
  const groups = { todo: [], doing: [], done: [] };
  tasks.forEach(t => groups[t.status].push(t));
  const make = (t) => `
    <div class="task ${t.done ? 'done' : ''}">
      <div class="task-top">
        <div>
          <div class="task-title">${t.done ? '✅ ' : ''}${t.title}</div>
          <div class="task-meta">${t.date || 'Tanpa tanggal'}${t.time ? ' • ' + t.time : ''}</div>
        </div>
      </div>
      <div class="task-actions">
        <button class="check" onclick="toggleDone('${t.id}')">${t.done ? 'Batal centang' : 'Centang'}</button>
        <button class="move" onclick="moveTask('${t.id}')">Pindah</button>
        <button class="del" onclick="deleteTask('${t.id}', false)">Hapus</button>
      </div>
    </div>`;
  todoList.innerHTML = groups.todo.map(make).join('');
  doingList.innerHTML = groups.doing.map(make).join('');
  doneList.innerHTML = groups.done.map(make).join('');
}
function renderCalendar() {
  const y = current.getFullYear();
  const m = current.getMonth();
  const first = new Date(y, m, 1);
  const last = new Date(y, m + 1, 0);
  const start = first.getDay();
  const days = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
  monthYear.textContent = new Intl.DateTimeFormat('id-ID', { month:'long', year:'numeric' }).format(current);
  calendar.innerHTML = days.map(d => `<div class="weekday">${d}</div>`).join('');
  for (let i = 0; i < start; i++) calendar.innerHTML += '<div></div>';
  const todayStr = new Date().toISOString().slice(0,10);
  for (let d = 1; d <= last.getDate(); d++) {
    const dateStr = `${y}-${String(m+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
    const count = tasks.filter(t => t.date === dateStr).length;
    calendar.innerHTML += `<div class="day ${dateStr === todayStr ? 'today' : ''}"><div class="num">${d}</div>${count ? `<div class="task-count">${count} tugas</div>` : ''}</div>`;
  }
}
function render() { renderTasks(); renderCalendar(); }
function toggleDone(id) {
  tasks = tasks.map(t => t.id === id ? { ...t, done: !t.done, status: !t.done ? 'done' : t.status === 'done' ? 'todo' : t.status } : t);
  render();
}
function moveTask(id) {
  const order = ['todo', 'doing', 'done'];
  tasks = tasks.map(t => t.id === id ? { ...t, status: order[(order.indexOf(t.status) + 1) % 3], done: order[(order.indexOf(t.status) + 1) % 3] === 'done' } : t);
  render();
}
function deleteTask(id, force=true) {
  const task = tasks.find(t => t.id === id);
  if (!task) return;
  if (force || task.done) tasks = tasks.filter(t => t.id !== id);
  render();
}
addBtn.addEventListener('click', addTask);
taskInput.addEventListener('keydown', e => { if (e.key === 'Enter') addTask(); });
prevMonth.addEventListener('click', () => { current.setMonth(current.getMonth() - 1); renderCalendar(); });
nextMonth.addEventListener('click', () => { current.setMonth(current.getMonth() + 1); renderCalendar(); });
themeToggle.addEventListener('click', () => applyTheme(document.body.dataset.theme === 'dark' ? 'light' : 'dark'));
setInterval(updateClock, 1000);
initTheme();
updateClock();
render();
window.toggleDone = toggleDone;
window.moveTask = moveTask;
window.deleteTask = deleteTask;