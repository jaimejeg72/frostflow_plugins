/**
 * FrostFlow Retoucher Plugin — Photoshop UXP (v0.0.1)
 * Jaime Esteva Photography
 */

// ──────────────────────────────────────────────
// CONFIGURATION & ENDPOINTS
// ──────────────────────────────────────────────
const API_BASE = 'https://jaimeestevaphotographer.com/frostflow/backend/api.php';
const API_KEY  = 'FrostflowJM_Secret_Key_2026';
const PIN_LENGTH = 4;
const POLL_INTERVAL = 60000; // 60s background sync

// ──────────────────────────────────────────────
// GLOBAL APP STATE
// ──────────────────────────────────────────────
let isAuthenticated  = false;
let editorId         = null;
let editorName       = '';
let role             = '';
let currentPinDigits = [];

let assignedProjects = [];
let allPendingImages = [];

let activeDocName    = null;
let activeBaseName   = null;
let currentMatch     = null;
let currentMatches   = [];

let pollTimer        = null;
let docCheckTimer    = null;

// ──────────────────────────────────────────────
// PHOTOSHOP UXP HELPERS
// ──────────────────────────────────────────────
function getPhotoshopApp() {
  try {
    const ps = require('photoshop');
    return ps ? ps.app : null;
  } catch (e) {
    return null;
  }
}

function getActiveDocumentName() {
  const app = getPhotoshopApp();
  if (!app) return null;

  let activeDoc = null;
  try {
    activeDoc = app.activeDocument;
  } catch (e) {}

  if (!activeDoc && app.documents && app.documents.length > 0) {
    activeDoc = app.documents[0];
  }

  if (!activeDoc) return null;

  let name = activeDoc.name || activeDoc.title || '';
  if (name.includes('/') || name.includes('\\')) {
    name = name.split(/[/\\]/).pop();
  }
  return name;
}

/**
 * Remove file extension regardless of whether it's .jpg, .psd, .nef, .arw, etc.
 * Returns lowercase trimmed string.
 */
function stripExtension(filename) {
  if (!filename) return '';
  const clean = filename.split(/[/\\]/).pop().trim();
  const lastDot = clean.lastIndexOf('.');
  if (lastDot <= 0) return clean.toLowerCase();
  return clean.substring(0, lastDot).toLowerCase().trim();
}

// ──────────────────────────────────────────────
// API REQUEST HELPER
// ──────────────────────────────────────────────
async function fetchAPI(params, method = 'GET', bodyData = null) {
  try {
    const url = API_BASE + '?' + new URLSearchParams(params).toString();
    const options = {
      method,
      headers: {
        'X-API-KEY': API_KEY
      }
    };

    if (bodyData) {
      if (bodyData instanceof FormData) {
        options.body = bodyData;
      } else {
        options.headers['Content-Type'] = 'application/json';
        options.body = JSON.stringify(bodyData);
      }
    }

    const response = await fetch(url, options);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    return await response.json();
  } catch (err) {
    console.error('API Fetch Error:', err);
    throw err;
  }
}

// ──────────────────────────────────────────────
// UI NAVIGATION & TOASTS
// ──────────────────────────────────────────────
function showView(viewId) {
  const views = ['view-idle', 'view-not-found', 'view-disambiguation', 'view-tasks'];
  views.forEach(id => {
    const el = document.getElementById(id);
    if (el) el.style.display = (id === viewId) ? (id === 'view-tasks' ? 'flex' : 'flex') : 'none';
  });
}

function showToast(message, isError = false) {
  const toast = document.getElementById('toast-msg');
  const toastText = document.getElementById('toast-text');
  const toastIcon = document.getElementById('toast-icon');

  if (!toast || !toastText) return;

  toastText.textContent = message;
  toastIcon.textContent = isError ? '❌' : 'ℹ️';
  toast.classList.toggle('error', isError);
  toast.classList.add('show');

  setTimeout(() => {
    toast.classList.remove('show');
  }, 3500);
}

// ──────────────────────────────────────────────
// PIN PAD AUTHENTICATION
// ──────────────────────────────────────────────
function updatePinDots() {
  for (let i = 0; i < PIN_LENGTH; i++) {
    const dot = document.getElementById(`dot-${i}`);
    if (dot) {
      dot.classList.remove('filled', 'error');
      if (i < currentPinDigits.length) dot.classList.add('filled');
    }
  }
}

function shakeDots() {
  const dotsEl = document.getElementById('pin-dots');
  if (!dotsEl) return;
  dotsEl.classList.remove('shaking');
  void dotsEl.offsetWidth; // Force reflow
  dotsEl.classList.add('shaking');

  for (let i = 0; i < PIN_LENGTH; i++) {
    const dot = document.getElementById(`dot-${i}`);
    if (dot) {
      dot.classList.remove('filled');
      dot.classList.add('error');
    }
  }

  setTimeout(() => {
    dotsEl.classList.remove('shaking');
    currentPinDigits = [];
    updatePinDots();
  }, 600);
}

function showPinError(msg) {
  const errEl = document.getElementById('pin-error');
  if (errEl) {
    errEl.textContent = msg;
    setTimeout(() => { errEl.textContent = ''; }, 3500);
  }
}

async function verifyPin(pin) {
  try {
    const formData = new FormData();
    formData.append('pin', pin);
    formData.append('device_name', 'Photoshop Plugin');
    formData.append('device_type', 'editor');

    const data = await fetchAPI({ action: 'editor_login' }, 'POST', formData);

    if (data && data.success) {
      onLoginSuccess(data);
    } else {
      shakeDots();
      showPinError(data.message || 'PIN incorrecto.');
    }
  } catch (err) {
    shakeDots();
    showPinError('No se pudo conectar al servidor.');
  }
}

function onLoginSuccess(authData) {
  isAuthenticated = true;
  editorId   = authData.editor_id;
  editorName = authData.editor_name || 'Editor';
  role       = authData.role || 'editor';

  saveSession();

  document.getElementById('view-pin').style.display = 'none';
  document.getElementById('main-ui').style.display  = 'flex';
  document.getElementById('user-name').textContent  = editorName;

  loadEditorData();
  startTimers();
}

function onLogout() {
  isAuthenticated  = false;
  editorId         = null;
  editorName       = '';
  role             = '';
  currentPinDigits = [];
  assignedProjects = [];
  allPendingImages = [];

  clearSession();
  stopTimers();

  updatePinDots();
  document.getElementById('view-pin').style.display = 'flex';
  document.getElementById('main-ui').style.display  = 'none';
}

// Save & Load session in localStorage / UXP Storage
function saveSession() {
  try {
    const session = { editorId, editorName, role };
    localStorage.setItem('frostflow_plugin_session', JSON.stringify(session));
  } catch (e) {}
}

function loadSession() {
  try {
    const sessionStr = localStorage.getItem('frostflow_plugin_session');
    if (sessionStr) {
      const session = JSON.parse(sessionStr);
      if (session && session.editorId) {
        onLoginSuccess(session);
      }
    }
  } catch (e) {}
}

function clearSession() {
  try {
    localStorage.removeItem('frostflow_plugin_session');
  } catch (e) {}
}

// ──────────────────────────────────────────────
// LOAD ASSIGNED PROJECTS & PENDING TASKS
// ──────────────────────────────────────────────
async function loadEditorData() {
  if (!isAuthenticated || !editorId) return;

  const btnRefresh = document.getElementById('btn-refresh');
  if (btnRefresh) btnRefresh.classList.add('spinning');

  try {
    // 1. Fetch assigned projects
    const projRes = await fetchAPI({ action: 'list_projects', editor_id: editorId });
    if (projRes && projRes.success) {
      assignedProjects = projRes.projects || [];
    }

    // 2. Fetch all assigned pending images + tasks across editor projects
    const imgRes = await fetchAPI({ action: 'get_pending_images', role: 'editor' });
    if (imgRes && imgRes.success) {
      allPendingImages = imgRes.images || [];
    }

    evaluateActiveDocument();
  } catch (err) {
    showToast('Error al actualizar datos.', true);
  } finally {
    if (btnRefresh) btnRefresh.classList.remove('spinning');
  }
}

// ──────────────────────────────────────────────
// ACTIVE DOCUMENT EVALUATION & MATCHING
// ──────────────────────────────────────────────
async function evaluateActiveDocument() {
  if (!isAuthenticated) return;

  const rawDocName = getActiveDocumentName();
  if (!rawDocName) {
    activeDocName = null;
    activeBaseName = null;
    currentMatch = null;
    currentMatches = [];
    showView('view-idle');
    return;
  }

  const baseName = stripExtension(rawDocName);
  activeDocName = rawDocName;
  activeBaseName = baseName;

  // Search matches by stripping extensions on both sides
  const matches = allPendingImages.filter(img => {
    const imgBase = stripExtension(img.ff_image_filename);
    return imgBase === baseName;
  });

  currentMatches = matches;

  if (matches.length === 1) {
    // Exact single match found
    setActiveMatch(matches[0]);
  } else if (matches.length > 1) {
    // Multiple matches found across projects -> Disambiguation UI
    renderDisambiguation(matches);
  } else {
    // 0 matches found in pending cache -> query server for exact/base filename if image completed
    currentMatch = null;
    document.getElementById('not-found-filename').textContent = baseName;
    showView('view-not-found');
  }
}

function setActiveMatch(imageObj) {
  currentMatch = imageObj;

  // Find project details from assignedProjects cache
  const proj = assignedProjects.find(p => p.ff_project_id == imageObj.ff_project_id) || {
    ff_project_name: imageObj.ff_project_name || 'Proyecto',
    ff_project_is_paid: 0
  };

  // Render project header
  document.getElementById('project-name').textContent = proj.ff_project_name || 'Proyecto';

  // Render payment status
  const isPaid = parseInt(proj.ff_project_is_paid) === 1;
  const payBadge = document.getElementById('payment-status-badge');
  if (payBadge) {
    payBadge.textContent = isPaid ? 'PAGADO' : 'PENDIENTE';
    payBadge.className = `status-badge ${isPaid ? 'paid' : 'unpaid'}`;
  }

  // Render filename (clean without extension)
  document.getElementById('photo-filename').textContent = stripExtension(imageObj.ff_image_filename);

  // Render Tasks
  renderTasksList(imageObj.tasks || []);

  showView('view-tasks');
}

function renderDisambiguation(matches) {
  const listEl = document.getElementById('disambiguation-list');
  if (!listEl) return;

  listEl.innerHTML = matches.map((img, idx) => `
    <div class="project-select-item" data-idx="${idx}">
      <div class="project-select-name">📁 ${img.ff_project_name || 'Proyecto #' + img.ff_project_id}</div>
      <div class="project-select-meta">Imagen: ${img.ff_image_filename} · ${img.tasks ? img.tasks.length : 0} tareas</div>
    </div>
  `).join('');

  listEl.querySelectorAll('.project-select-item').forEach(item => {
    item.addEventListener('click', () => {
      const idx = parseInt(item.dataset.idx);
      if (matches[idx]) {
        setActiveMatch(matches[idx]);
      }
    });
  });

  showView('view-disambiguation');
}

// ──────────────────────────────────────────────
// RENDER & HANDLE TASKS CHECKLIST
// ──────────────────────────────────────────────
function renderTasksList(tasks) {
  const container = document.getElementById('tasks-list');
  const counterEl = document.getElementById('progress-counter');
  const fillEl    = document.getElementById('progress-bar-fill');
  const bannerEl  = document.getElementById('completed-banner');

  if (!container) return;

  const total = tasks.length;
  const doneCount = tasks.filter(t => t.ff_task_status === 'done').length;

  if (counterEl) counterEl.textContent = `${doneCount}/${total}`;
  if (fillEl) {
    const pct = total > 0 ? Math.round((doneCount / total) * 100) : 0;
    fillEl.style.width = `${pct}%`;
  }

  if (bannerEl) {
    bannerEl.style.display = (total > 0 && doneCount === total) ? 'flex' : 'none';
  }

  if (total === 0) {
    container.innerHTML = '<div class="empty-state-desc" style="padding: 10px;">No hay tareas asignadas a esta foto.</div>';
    return;
  }

  container.innerHTML = tasks.map(t => {
    const isDone = t.ff_task_status === 'done';
    return `
      <div class="task-item ${isDone ? 'done' : ''}" data-task-id="${t.ff_task_id}">
        <div class="task-checkbox">
          <svg class="task-checkbox-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
        </div>
        <span class="task-label">${t.ff_task_description}</span>
      </div>
    `;
  }).join('');

  container.querySelectorAll('.task-item').forEach(item => {
    item.addEventListener('click', () => {
      const taskId = parseInt(item.dataset.taskId);
      const task = tasks.find(t => t.ff_task_id == taskId);
      if (task) {
        const newStatus = (task.ff_task_status === 'done') ? 'pending' : 'done';
        toggleTask(task, newStatus);
      }
    });
  });
}

async function toggleTask(taskObj, newStatus) {
  // Optimistic update local UI
  const oldStatus = taskObj.ff_task_status;
  taskObj.ff_task_status = newStatus;

  if (currentMatch && currentMatch.tasks) {
    renderTasksList(currentMatch.tasks);
  }

  try {
    const formData = new FormData();
    formData.append('task_id', taskObj.ff_task_id);
    formData.append('status', newStatus);

    const data = await fetchAPI({ action: 'update_task_status' }, 'POST', formData);

    if (!data || !data.success) {
      throw new Error('API failed');
    }
  } catch (err) {
    // Revert state on error
    taskObj.ff_task_status = oldStatus;
    if (currentMatch && currentMatch.tasks) {
      renderTasksList(currentMatch.tasks);
    }
    showToast('Error al actualizar tarea en el servidor.', true);
  }
}

async function markAllTasksDone() {
  if (!currentMatch || !currentMatch.tasks) return;

  const pendingTasks = currentMatch.tasks.filter(t => t.ff_task_status !== 'done');
  if (pendingTasks.length === 0) return;

  for (const t of pendingTasks) {
    await toggleTask(t, 'done');
  }

  showToast('¡Todas las tareas marcadas como realizadas!');
}

// ──────────────────────────────────────────────
// EVENT LISTENERS & SETUP
// ──────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  // PIN Pad clicks
  const pinPad = document.getElementById('pin-pad');
  if (pinPad) {
    pinPad.addEventListener('pointerdown', (e) => {
      e.preventDefault();
      const key = e.target.closest('.pin-key');
      if (!key) return;

      const val = key.dataset.val;
      if (val === 'clear') {
        currentPinDigits = [];
        updatePinDots();
        return;
      }
      if (val === 'del') {
        currentPinDigits.pop();
        updatePinDots();
        return;
      }

      if (currentPinDigits.length < PIN_LENGTH) {
        currentPinDigits.push(val);
        updatePinDots();

        if (currentPinDigits.length === PIN_LENGTH) {
          const pin = currentPinDigits.join('');
          setTimeout(() => verifyPin(pin), 120);
        }
      }
    });
  }

  // Header buttons
  document.getElementById('btn-refresh').addEventListener('click', loadEditorData);
  document.getElementById('btn-logout').addEventListener('click', onLogout);
  document.getElementById('btn-mark-all').addEventListener('click', markAllTasksDone);

  // Check saved session
  loadSession();
});

// ──────────────────────────────────────────────
// TIMERS & PHOTOSHOP NOTIFICATION LISTENERS
// ──────────────────────────────────────────────
function startTimers() {
  stopTimers();

  // Listen to active document switches in Photoshop UXP
  try {
    const ps = require('photoshop');
    if (ps && ps.action) {
      ps.action.addNotificationListener(
        ['select', 'open', 'make', 'activate', 'close', 'save'],
        () => evaluateActiveDocument()
      );
    }
  } catch (e) {}

  // Safety poll for active document changes (every 1.5s)
  docCheckTimer = setInterval(() => {
    const docName = getActiveDocumentName();
    if (docName !== activeDocName) {
      evaluateActiveDocument();
    }
  }, 1500);

  // Background data sync from server (every 60s)
  pollTimer = setInterval(() => {
    loadEditorData();
  }, POLL_INTERVAL);
}

function stopTimers() {
  if (docCheckTimer) clearInterval(docCheckTimer);
  if (pollTimer) clearInterval(pollTimer);
}
