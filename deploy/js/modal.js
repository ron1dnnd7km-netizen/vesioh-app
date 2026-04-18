let selectedService = null;
let selectedCountry = null;
let customServiceName = '';
let selectedPaymentMethod = 'usdt';

function openModal(presetService = null) {
  const overlay = document.getElementById('modalOverlay');
  const serviceSelect = document.getElementById('modalService');
  const countrySelect = document.getElementById('modalCountry');

  const uniqueServices = [];
  const seen = new Set();
  services.forEach(s => {
    if (!seen.has(s.name)) { seen.add(s.name); uniqueServices.push(s); }
  });

  serviceSelect.innerHTML = '<option value="">Select a service...</option>' +
    uniqueServices.map(s => `<option value="${s.id}" ${presetService && presetService.id === s.id ? 'selected' : ''}>${s.name}</option>`).join('');

  countrySelect.innerHTML = '<option value="">Select country...</option>' +
    countries.map(c => `<option value="${c.code}" ${presetService && presetService.country === c.code ? 'selected' : ''}>${c.flag} ${c.name}</option>`).join('');

  selectedService = presetService || null;
  selectedCountry = presetService ? countries.find(c => c.code === presetService.country) : null;
  customServiceName = '';

  // Show custom input if "Any other" was preset
  if (presetService && presetService.id === 'any-other') {
    document.getElementById('customServiceInput').style.display = 'block';
  } else {
    document.getElementById('customServiceInput').style.display = 'none';
  }

  overlay.classList.add('show');
}

function closeModal() {
  document.getElementById('modalOverlay').classList.remove('show');
}
function selectPaymentMethod(method, element) {
  selectedPaymentMethod = method;
  // Update all payment buttons to show selection
  ['usdt', 'btc', 'eth'].forEach(m => {
    const btn = document.getElementById(`payment${m.toUpperCase()}`);
    if (btn) {
      const circle = btn.querySelector('div > div:first-child');
      if (m === method) {
        btn.style.borderColor = 'var(--accent)';
        btn.style.borderWidth = '2px';
        const inner = circle.querySelector('div');
        if (inner) inner.style.background = 'var(--accent)';
      } else {
        btn.style.borderColor = 'var(--border)';
        btn.style.borderWidth = '1px';
        const inner = circle.querySelector('div');
        if (inner) inner.style.background = 'transparent';
      }
    }
  });
}
async function autoGetNumber() {
  const modalBody = document.querySelector('.modal-body');

  // Calculate price based on country
  const countryPrice = selectedCountry.basePrice || 0.50;
  const serviceMultiplier = selectedService.id === 'any-other' ? 1.0 : 1.0; // Can adjust multipliers per service type
  const finalPrice = countryPrice * serviceMultiplier;

  // Show loading state
  modalBody.innerHTML = `
    <div style="text-align: center; padding: 40px 20px;">
      <i class="fas fa-spinner fa-spin" style="font-size: 24px; color: var(--accent); margin-bottom: 16px;"></i>
      <div style="font-size: 16px; font-weight: 600; margin-bottom: 8px;">Getting your number...</div>
      <div style="font-size: 13px; color: var(--text-muted);">Please wait while we assign a virtual number</div>
      <div style="font-size: 12px; color: var(--text-secondary); margin-top: 8px;">Payment: ${selectedPaymentMethod.toUpperCase()} | Cost: $${finalPrice.toFixed(2)}</div>
    </div>
  `;

  try {
    // Use custom service name if "Any other" is selected
    const serviceName = selectedService.id === 'any-other' && customServiceName ? customServiceName : selectedService.name;
    const serviceId = selectedService.id === 'any-other' && customServiceName ? `custom-${Date.now()}` : selectedService.id;

    const res = await fetch('/api/numbers/request', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: getUserEmail(),
        serviceName: serviceName,
        serviceId: serviceId,
        countryCode: selectedCountry.code,
        cost: finalPrice,
        paymentMethod: selectedPaymentMethod
      })
    });
    const data = await res.json();

    if (data.error) {
      // Show error and restore form
      modalBody.innerHTML = `
        <div class="form-group">
          <label class="form-label">Service</label>
          <select class="form-select" id="modalService"><option value="">Select a service...</option></select>
        </div>
        <div class="form-group">
          <label class="form-label">Country / Region</label>
          <select class="form-select" id="modalCountry"><option value="">Select country...</option></select>
        </div>
      `;
      showToast(data.error, 'error');
      return;
    }

    // Success - show success message then redirect to timer page
    modalBody.innerHTML = `
      <div style="text-align: center; padding: 40px 20px;">
        <i class="fas fa-check-circle" style="font-size: 48px; color: var(--accent); margin-bottom: 16px;"></i>
        <div style="font-size: 18px; font-weight: 600; margin-bottom: 8px;">Number Activated!</div>
        <div style="font-size: 16px; color: var(--text-primary); margin-bottom: 4px;">${data.phone}</div>
        <div style="font-size: 13px; color: var(--text-muted);">Waiting for SMS code...</div>
        <div style="font-size: 12px; color: var(--text-secondary); margin-top: 8px;">Charged: $${finalPrice.toFixed(2)}</div>
      </div>
    `;

    updateBalanceDisplay(data.balance);
    await loadNumbers();
    renderMainContent();

    // Auto close modal and redirect to timer page after 2 seconds
    setTimeout(() => {
      closeModal();
      showToast('Number ' + data.phone + ' activated for ' + serviceName, 'success');
      // Navigate to timer page with the number data
      showNumberTimer(data.id, data.phone, serviceName, 1200); // 20 minutes = 1200 seconds

  } catch(e) {
    // Show error and restore form
    modalBody.innerHTML = `
      <div class="form-group">
        <label class="form-label">Service</label>
        <select class="form-select" id="modalService"><option value="">Select a service...</option></select>
      </div>
      <div class="form-group">
        <label class="form-label">Country / Region</label>
        <select class="form-select" id="modalCountry"><option value="">Select country...</option></select>
      </div>
    `;
    showToast('Error requesting number', 'error');
  }
}

document.getElementById('modalService').addEventListener('change', function() {
  selectedService = services.find(s => s.id === this.value) || null;
  const customInput = document.getElementById('customServiceInput');
  const customField = document.getElementById('customServiceName');

  if (selectedService && selectedService.id === 'any-other') {
    customInput.style.display = 'block';
    customField.focus();
    customServiceName = customField.value;
  } else {
    customInput.style.display = 'none';
    customServiceName = '';
    customField.value = '';
  }

  if (selectedService && selectedCountry && (selectedService.id !== 'any-other' || customServiceName.trim())) {
    autoGetNumber();
  }
});

document.getElementById('modalCountry').addEventListener('change', function() {
  selectedCountry = countries.find(c => c.code === this.value) || null;
  if (selectedService && selectedCountry && (selectedService.id !== 'any-other' || customServiceName.trim())) {
    autoGetNumber();
  }
});

// Handle custom service name input
document.getElementById('customServiceName').addEventListener('input', function() {
  customServiceName = this.value.trim();
  if (selectedService && selectedCountry && selectedService.id === 'any-other' && customServiceName) {
    // Debounce the auto request to avoid too many calls while typing
    clearTimeout(this.debounceTimer);
    this.debounceTimer = setTimeout(() => {
      autoGetNumber();
    }, 1000);
  }
});

document.getElementById('modalClose').addEventListener('click', closeModal);
document.getElementById('modalOverlay').addEventListener('click', function(e) {
  if (e.target === this) closeModal();
});

// Alias for compatibility with buttons that call getNumber()
const getNumber = autoGetNumber;

// ====== NUMBER TIMER PAGE ======
function showNumberTimer(numberId, phone, serviceName, timeLeft) {
  currentPage = 'timer';
  const main = document.getElementById('mainContent');

  // Store timer data
  window.currentTimer = {
    numberId: numberId,
    phone: phone,
    serviceName: serviceName,
    timeLeft: timeLeft,
    startTime: Date.now()
  };

  renderTimerPage(main);
  startTimerCountdown();
}

function renderTimerPage(main) {
  const timer = window.currentTimer;
  if (!timer) return;

  const minutes = Math.floor(timer.timeLeft / 60);
  const seconds = timer.timeLeft % 60;
  const progressPercent = (timer.timeLeft / 1200) * 100; // 1200 seconds = 20 minutes

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
