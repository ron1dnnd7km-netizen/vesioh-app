function formatTime(seconds) { /* ... */ }
function generatePhone(prefix) { /* ... */ }
function showToast(message, type) { /* ... */ }
function updateBalance(amount) { /* ... */ }
function copyNumber(phone) { /* ... */ }
function cancelNumber(id) { /* ... */ }
function refreshNumber(id) { /* ... */ }
function simulateSmsReception(numberId) { /* ... */ }
function renderMainContent() { /* ... */ }
function setFilter(filter) { /* ... */ }

// Timer
setInterval(() => { /* ... */ }, 1000);

// Navigation
document.querySelectorAll('.nav-link').forEach(link => {
  link.addEventListener('click', function() { /* ... */ });
});

// Search
document.getElementById('serviceSearch').addEventListener('input', function() {
  renderSidebar(this.value);
});

// Keyboard
document.addEventListener('keydown', function(e) {
  if (e.key === 'Escape') closeModal();
});

// ====== START THE APP ======
renderSidebar();
renderMainContent();