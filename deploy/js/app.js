// ====== UTILITIES ======
function formatTime(seconds) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

function showToast(message, type = 'success') {
  const container = document.getElementById('toastContainer');
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  const icons = { success: 'fa-check-circle', error: 'fa-exclamation-circle', info: 'fa-info-circle' };
  const colors = { success: 'var(--accent)', error: 'var(--danger)', info: 'var(--info)' };
  toast.innerHTML = `<i class="fas ${icons[type]}" style="color:${colors[type]}"></i> ${message}`;
  container.appendChild(toast);
  setTimeout(() => toast.remove(), 3000);
}

function updateBalanceDisplay(amount) {
  document.getElementById('balanceAmount').textContent = amount.toFixed(2);
}

async function loadBalance() {
  try {
    const res = await fetch(`/api/user/${getUserEmail()}`);
    const data = await res.json();
    updateBalanceDisplay(data.balance);
    return data.balance;
  } catch(e) {
    return 0;
  }
}

// ====== MAIN CONTENT ROUTER ======
function renderMainContent() {
  const main = document.getElementById('mainContent');
  if (currentPage === 'numbers') renderNumbersPage(main);
  else if (currentPage === 'history') renderHistoryPage(main);
  else if (currentPage === 'pricing') renderPricingPage(main);
  else if (currentPage === 'api') renderApiPage(main);
  else if (currentPage === 'help') renderHelpPage(main);
  else if (currentPage === 'contacts') renderContactsPage(main);
  else if (currentPage === 'timer') renderTimerPage(main);
  else if (currentPage === 'deposit') {
  renderDepositPage(main);
  loadBalance().then(function(b) {
    var el = document.getElementById('depositCurrentBalance');
    if (el) el.textContent = '$' + b.toFixed(2);
  });
  loadDepositHistory();
}

// ====== TIMER PAGE ======
function renderTimerPage(main) {
  // Call the timer page renderer from modal.js
  if (typeof window.currentTimer !== 'undefined' && window.currentTimer) {
    // Use the modal.js renderTimerPage function
    const timer = window.currentTimer;
    const minutes = Math.floor(timer.timeLeft / 60);
    const seconds = timer.timeLeft % 60;
    const progressPercent = (timer.timeLeft / 1200) * 100;

    main.innerHTML = `
      <div class="page-header">
        <h1 class="page-title">Number Timer</h1>
        <div class="page-actions">
          <button class="btn btn-secondary" onclick="showPage('numbers')">
            <i class="fas fa-arrow-left"></i> Back to Numbers
          </button>
        </div>
      </div>

      <div class="timer-container" style="max-width: 600px; margin: 0 auto; text-align: center; padding: 40px 20px;">
        <div class="timer-display" style="margin-bottom: 30px;">
          <div class="timer-circle" style="width: 200px; height: 200px; border-radius: 50%; border: 8px solid var(--border); margin: 0 auto 20px; position: relative; display: flex; align-items: center; justify-content: center;">
            <div class="timer-progress" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; border-radius: 50%; border: 8px solid var(--accent); clip-path: polygon(50% 50%, 50% 0%, ${50 + 50 * Math.cos((progressPercent/100) * 2 * Math.PI - Math.PI/2)}% ${50 + 50 * Math.sin((progressPercent/100) * 2 * Math.PI - Math.PI/2)}%);"></div>
            <div class="timer-text">
              <div style="font-size: 36px; font-weight: 700; color: var(--text-primary);">${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}</div>
              <div style="font-size: 14px; color: var(--text-muted);">minutes remaining</div>
            </div>
          </div>
        </div>

        <div class="number-info" style="background: var(--bg-card); border: 1px solid var(--border); border-radius: 16px; padding: 24px; margin-bottom: 30px;">
          <div style="font-size: 18px; font-weight: 600; margin-bottom: 8px;">${timer.serviceName}</div>
          <div style="font-size: 24px; font-weight: 700; color: var(--accent); margin-bottom: 16px;">${timer.phone}</div>
          <div style="font-size: 14px; color: var(--text-muted);">Send SMS to this number to receive verification codes</div>
        </div>

        <div class="timer-actions" style="display: flex; gap: 12px; justify-content: center; flex-wrap: wrap;">
          <button class="btn btn-primary" onclick="copyNumber('${timer.phone}')">
            <i class="fas fa-copy"></i> Copy Number
          </button>
          <button class="btn btn-secondary" onclick="refreshNumber(${timer.numberId})">
            <i class="fas fa-sync-alt"></i> Refresh
          </button>
          <button class="btn btn-danger" onclick="cancelNumber(${timer.numberId})">
            <i class="fas fa-times"></i> Cancel
          </button>
        </div>

        <div class="timer-notifications" style="margin-top: 30px; padding: 20px; background: var(--bg-secondary); border-radius: 12px;">
          <h3 style="font-size: 16px; font-weight: 600; margin-bottom: 12px;">Notifications</h3>
          <div id="timerNotifications" style="font-size: 14px; color: var(--text-muted);">
            Waiting for SMS code... You'll be notified when it arrives.
          </div>
        </div>
      </div>
    `;
    // Start the countdown
    startTimerCountdown();
  } else {
    main.innerHTML = '<div style="text-align: center; padding: 60px;"><h2>No active timer</h2><p>Get a number first to start the timer.</p></div>';
  }
}

function startTimerCountdown() {
  const timer = window.currentTimer;
  if (!timer) return;

  const interval = setInterval(() => {
    timer.timeLeft--;

    if (timer.timeLeft <= 0) {
      clearInterval(interval);
      timerExpired();
      return;
    }

    // Update display every second
    const minutes = Math.floor(timer.timeLeft / 60);
    const seconds = timer.timeLeft % 60;
    const progressPercent = (timer.timeLeft / 1200) * 100;

    // Update timer display
    const timerText = document.querySelector('.timer-text');
    if (timerText) {
      timerText.innerHTML = `
        <div style="font-size: 36px; font-weight: 700; color: var(--text-primary);">${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}</div>
        <div style="font-size: 14px; color: var(--text-muted);">minutes remaining</div>
      `;
    }

    // Update progress circle
    const progress = document.querySelector('.timer-progress');
    if (progress) {
      const angle = (progressPercent / 100) * 360;
      progress.style.clipPath = `polygon(50% 50%, 50% 0%, ${50 + 50 * Math.cos((angle * Math.PI / 180) - Math.PI/2)}% ${50 + 50 * Math.sin((angle * Math.PI / 180) - Math.PI/2)}%)`;
    }

    // Show warnings at certain intervals
    if (timer.timeLeft === 300) { // 5 minutes
      showTimerNotification('5 minutes remaining!', 'warning');
    } else if (timer.timeLeft === 60) { // 1 minute
      showTimerNotification('1 minute remaining!', 'danger');
    }

  }, 1000);
}

function showTimerNotification(message, type = 'info') {
  const notifications = document.getElementById('timerNotifications');
  if (notifications) {
    notifications.innerHTML = `<div style="color: var(--${type === 'warning' ? 'warning' : type === 'danger' ? 'danger' : 'accent'})">${message}</div>`;
  }
  showToast(message, type);
}

function timerExpired() {
  const timer = window.currentTimer;
  if (!timer) return;

  showTimerNotification('Number expired! Get a new one.', 'danger');

  // Update the page to show expired state
  const timerContainer = document.querySelector('.timer-container');
  if (timerContainer) {
    timerContainer.innerHTML = `
      <div style="text-align: center; padding: 60px 20px;">
        <i class="fas fa-clock" style="font-size: 64px; color: var(--danger); margin-bottom: 20px;"></i>
        <h2 style="font-size: 24px; font-weight: 700; margin-bottom: 12px;">Number Expired</h2>
        <p style="font-size: 16px; color: var(--text-muted); margin-bottom: 30px;">This number is no longer active. Get a new one to continue receiving SMS codes.</p>
        <div style="display: flex; gap: 12px; justify-content: center;">
          <button class="btn btn-primary" onclick="openModal()">
            <i class="fas fa-plus"></i> Get New Number
          </button>
          <button class="btn btn-secondary" onclick="showPage('numbers')">
            <i class="fas fa-list"></i> View Numbers
          </button>
        </div>
      </div>
    `;
  }
}

// ====== TIMER HELPER FUNCTIONS ======
function copyNumber(phone) {
  navigator.clipboard.writeText(phone).then(() => {
    showToast('Number copied to clipboard!', 'success');
  }).catch(() => {
    // Fallback for older browsers
    const textArea = document.createElement('textarea');
    textArea.value = phone;
    document.body.appendChild(textArea);
    textArea.select();
    document.execCommand('copy');
    document.body.removeChild(textArea);
    showToast('Number copied to clipboard!', 'success');
  });
}

function refreshNumber(numberId) {
  showToast('Refreshing number...', 'info');
  // TODO: Implement refresh logic with backend
  setTimeout(() => {
    showToast('Number refreshed successfully!', 'success');
  }, 1000);
}

function cancelNumber(numberId) {
  if (confirm('Are you sure you want to cancel this number?')) {
    showToast('Number cancelled', 'warning');
    // TODO: Implement cancel logic with backend
    showPage('numbers');
  }
}
}

// ====== NUMBER OPERATIONS ======
function copyNumber(phone) {
  navigator.clipboard.writeText(phone.replace(/\s/g, '')).then(() => {
    showToast('Number copied to clipboard', 'success');
  }).catch(() => showToast('Copy failed', 'error'));
}

async function cancelNumber(id) {
  try {
    const res = await fetch(`/api/numbers/${id}`, { method: 'DELETE' });
    const data = await res.json();
    if (data.error) { showToast(data.error, 'error'); return; }
    updateBalanceDisplay(data.balance);
    renderMainContent();
    showToast('Number cancelled, balance refunded', 'info');
  } catch(e) { showToast('Error cancelling number', 'error'); }
}

async function refreshNumber(id) {
  try {
    const res = await fetch(`/api/numbers/${id}/expire`, { method: 'POST' });
    const data = await res.json();
    // Request a new one
    renderMainContent();
    showToast('Requesting new number...', 'info');
  } catch(e) { showToast('Error refreshing number', 'error'); }
}

function setFilter(filter) {
  currentFilter = filter;
  renderMainContent();
}

function refreshAllNumbers() {
  showToast('All numbers refreshed', 'info');
  renderMainContent();
}

// ====== NAVIGATION ======
document.querySelectorAll('.nav-link').forEach(link => {
  link.addEventListener('click', function() {
    document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
    this.classList.add('active');
    currentPage = this.dataset.page;
    if (currentPage === 'history') loadHistory();
    else if (currentPage === 'numbers') loadNumbers();
    renderMainContent();
  });
});

// ====== SEARCH ======
document.getElementById('serviceSearch').addEventListener('input', function() {
  renderSidebar(this.value);
});

// ====== KEYBOARD ======
document.addEventListener('keydown', function(e) {
  if (e.key === 'Escape') closeModal();
});

// ====== LOAD NUMBERS FROM BACKEND ======
async function loadNumbers() {
  try {
    const res = await fetch(`/api/numbers/${getUserEmail()}`);
    activeNumbers = await res.json();
  } catch(e) { activeNumbers = []; }
}

async function loadHistory() {
  try {
    const res = await fetch(`/api/history/${getUserEmail()}`);
    historyData = await res.json();
  } catch(e) { historyData = []; }
}

// ====== TIMER: CHECK FOR EXPIRED NUMBERS ======
setInterval(async () => {
  let changed = false;
  activeNumbers.forEach(n => {
    const timeLeft = n.time_left ?? n.timeLeft ?? 0;
    const totalTime = n.total_time ?? n.totalTime ?? 1;
    if (n.status === 'waiting' && timeLeft > 0) {
      const newTime = timeLeft - 1;
      n.time_left = newTime;
      n.timeLeft = newTime;
      const timerEl = document.getElementById(`timer-${n.id}`);
      if (timerEl) timerEl.textContent = formatTime(newTime);
      const card = document.getElementById(`card-${n.id}`);
      if (card) {
        const bar = card.querySelector('.timer-bar-fill');
        if (bar) bar.style.width = (newTime / totalTime * 100) + '%';
      }
      if (newTime <= 0) {
        n.status = 'expired';
        changed = true;
        // Tell backend to refund
        fetch(`/api/numbers/${n.id}/expire`, { method: 'POST' }).catch(() => {});
        showToast(`Number expired, balance refunded`, 'error');
      }
    }
  });
  if (changed) {
    await loadBalance();
    renderMainContent();
  }
}, 1000);

// ====== SIMULATE SMS FOR WAITING NUMBERS ======
function startSimulation() {
  // Real SMS mode: polling happens on the backend (server.js)
  // No frontend simulation needed
  // Codes will appear when the backend receives them from the provider
}

// ====== BOOT ======
// This runs AFTER auth.js checkSession decides what to show
// showApp() is called by auth.js after login, which triggers this:
const originalShowApp = showApp;
showApp = async function() {
  originalShowApp();
  await loadBalance();
  await loadNumbers();
  renderMainContent();
  startSimulation();
};

// Override loadNumbers to also restart simulation
const originalLoadNumbers = loadNumbers;
loadNumbers = async function() {
  await originalLoadNumbers();
  startSimulation();
};

// ====== AUTO-REFRESH: Check backend for new codes every 5 seconds ======
setInterval(async () => {
  if (currentPage === 'numbers' && activeNumbers.some(n => n.status === 'waiting')) {
    await loadNumbers();
    renderMainContent();
  }
}, 5000);

// ====== CHECK IF RETURNING FROM PAYMENT ======
function checkDepositReturn() {
  var params = new URLSearchParams(window.location.search);
  var depositStatus = params.get('deposit');
  var ref = params.get('ref');
  if (depositStatus === 'success' && ref) {
    showToast('Payment submitted! Balance will update after confirmation.', 'info');
    // Clean URL
    window.history.replaceState({}, '', window.location.pathname);
  }
}
checkDepositReturn();

// ====== USER MENU ======
document.querySelector('.user-info').addEventListener('click', function() {
  const dropdown = document.querySelector('.user-dropdown');
  dropdown.style.display = dropdown.style.display === 'block' ? 'none' : 'block';
});

document.addEventListener('click', function(e) {
  if (!e.target.closest('.user-menu')) {
    const dropdown = document.querySelector('.user-dropdown');
    if (dropdown) dropdown.style.display = 'none';
  }
});

// Hamburger menu
document.getElementById('hamburger').addEventListener('click', function() {
  const navLinks = document.querySelector('.nav-links');
  navLinks.classList.toggle('show');
});

function deleteAccount() {
  if (confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
    // Implement delete account logic
    showToast('Account deletion not implemented yet', 'error');
  }
}

function changeLanguage(lang) {
  // Implement language change logic
  localStorage.setItem('language', lang);
  showToast(`Language changed to ${lang}`, 'info');
  // Reload or update UI for language
}

// ====== BOOT ======
checkSession();