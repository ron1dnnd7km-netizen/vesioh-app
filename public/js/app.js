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
  else if (currentPage === 'deposit') {
  renderDepositPage(main);
  loadBalance().then(function(b) {
    var el = document.getElementById('depositCurrentBalance');
    if (el) el.textContent = '$' + b.toFixed(2);
  });
  loadDepositHistory();
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

// ====== BOOT ======
checkSession();