let selectedService = null;
let selectedCountry = null;
let customServiceName = '';
let selectedPaymentMethod = 'wallet'; // Pay from wallet balance

// ====== MODAL MANAGEMENT ======

function openModalById(serviceId) {
  const service = services.find(s => s.id === serviceId);
  if (!service) return;
  openModal(service);
}

function openModal(presetService = null) {
  const overlay = document.getElementById('modalOverlay');
  selectedService = presetService || null;
  selectedCountry = presetService ? countries.find(c => c.code === presetService.country) : null;
  customServiceName = '';
  selectedPaymentMethod = 'crypto'; // Reset to default

  updateModalBody();
  overlay.classList.add('show');
}

function updateModalBody() {
  const modalBody = document.querySelector('.modal-body');
  const countryPrice = selectedCountry ? (selectedCountry.basePrice || 0.50) : 0;
  const finalPrice = selectedCountry && selectedService ? countryPrice : 0;

  // Build Service Dropdown
  const uniqueServices = [];
  const seen = new Set();
  services.forEach(s => {
    if (!seen.has(s.name)) { seen.add(s.name); uniqueServices.push(s); }
  });
  const serviceOptions = uniqueServices.map(s => 
    `<option value="${s.id}" ${selectedService && selectedService.id === s.id ? 'selected' : ''}>${s.name}</option>`
  ).join('');

  // Build Country Dropdown
  const countryOptions = countries.map(c => 
    `<option value="${c.code}" ${selectedCountry && selectedCountry.code === c.code ? 'selected' : ''}>${c.flag} ${c.name}</option>`
  ).join('');

  // Show custom input if "Any other" is selected
  const showCustomInput = selectedService && selectedService.id === 'any-other';
  const canGetNumber = selectedService && selectedCountry && (selectedService.id !== 'any-other' || customServiceName.trim().length > 0);

  modalBody.innerHTML = `
    <div class="form-group">
      <label class="form-label">Service</label>
      <select class="form-select" id="modalService">
        <option value="">Select a service...</option>
        ${serviceOptions}
      </select>
    </div>
    
    <div class="form-group">
      <label class="form-label">Country / Region</label>
      <select class="form-select" id="modalCountry">
        <option value="">Select country...</option>
        ${countryOptions}
      </select>
    </div>
    
    <div class="form-group" id="customServiceInput" style="display: ${showCustomInput ? 'block' : 'none'};">
      <label class="form-label">Custom Service Name</label>
      <input type="text" class="form-input" id="customServiceName" placeholder="Enter service name..." value="${customServiceName}">
    </div>

    ${selectedService && selectedCountry ? `
      <div class="form-group">
        <div style="display: flex; justify-content: space-between; align-items: center; padding: 12px; background: var(--bg-secondary); border-radius: 8px; margin-bottom: 16px;">
          <div>
            <div style="font-weight: 600; color: var(--text-primary);">Cost: $${finalPrice.toFixed(2)}</div>
            <div style="font-size: 12px; color: var(--text-muted);">${selectedService.name} in ${selectedCountry.name}</div>
          </div>
          <button class="btn btn-primary" id="getNumberBtn" onclick="getNumber()" ${!canGetNumber ? 'disabled' : ''}>
            <i class="fas fa-plus"></i> Get Number
          </button>
        </div>
      </div>
    ` : `
      <div style="text-align: center; padding: 20px; color: var(--text-muted); font-size: 14px;">
        Select a service and country to get a virtual number
      </div>
    `}
  `;
}

function closeModal() {
  document.getElementById('modalOverlay').classList.remove('show');
}

function selectPaymentMethod(method, element) {
  selectedPaymentMethod = method;
  // Re-render the modal body to update the UI borders/colors
  updateModalBody();
}


// ====== API ACTIONS ======

async function getNumber() {
  if (!selectedService || !selectedCountry || (selectedService.id === 'any-other' && !customServiceName.trim())) {
    showToast('Please select a service, country and service name', 'error');
    updateModalBody();
    return;
  }

  const modalBody = document.querySelector('.modal-body');
  const countryPrice = selectedCountry.basePrice || 0.50;
  const finalPrice = countryPrice;

  // Show loading state
  modalBody.innerHTML = `
    <div style="text-align: center; padding: 40px 20px;">
      <i class="fas fa-spinner fa-spin" style="font-size: 24px; color: var(--accent); margin-bottom: 16px;"></i>
      <div style="font-size: 16px; font-weight: 600; margin-bottom: 8px;">Charging wallet...</div>
      <div style="font-size: 13px; color: var(--text-muted);">Please wait while we assign your number</div>
      <div style="font-size: 12px; color: var(--text-secondary); margin-top: 8px;">Cost: $${finalPrice.toFixed(2)}</div>
    </div>
  `;

  try {
    const serviceName = selectedService.id === 'any-other' ? customServiceName.trim() : selectedService.name;
    const serviceId = selectedService.id === 'any-other' ? `custom-${Date.now()}` : selectedService.id;

    const res = await fetch('/api/numbers/request', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: getUserEmail(),
        serviceName: serviceName,
        serviceId: serviceId,
        countryCode: selectedCountry.code,
        cost: finalPrice,
        paymentMethod: 'wallet'
      })
    });
    
    const data = await res.json();

    if (data.error) {
      updateModalBody();
      showToast(data.error, 'error');
      return;
    }

    // Success screen
    modalBody.innerHTML = `
      <div style="text-align: center; padding: 40px 20px;">
        <i class="fas fa-check-circle" style="font-size: 48px; color: var(--accent); margin-bottom: 16px;"></i>
        <div style="font-size: 18px; font-weight: 600; margin-bottom: 8px;">Number Activated!</div>
        <div style="font-size: 16px; color: var(--text-primary); margin-bottom: 4px;">${data.phone}</div>
        <div style="font-size: 13px; color: var(--text-muted);">Waiting for SMS code...</div>
      </div>
    `;

    updateBalanceDisplay(data.balance);
    await loadNumbers();
    renderMainContent();

    setTimeout(() => {
      closeModal();
      showToast('Number ' + data.phone + ' activated', 'success');
      showNumberTimer(data.id, data.phone, serviceName, 1200);
    }, 2000);

  } catch(e) {
    updateModalBody();
    showToast('Error requesting number', 'error');
  }
}

function copyNumber(phone) {
  navigator.clipboard.writeText(phone).then(() => {
    showToast('Number copied!', 'success');
  }).catch(() => {
    showToast('Failed to copy', 'error');
  });
}

async function refreshNumber(numberId) {
  showToast('Checking for SMS...', 'info');
  try {
    const res = await fetch(`/api/numbers/${numberId}`);
    const data = await res.json();
    if (data.code) {
      showToast(`SMS Received! Code: ${data.code}`, 'success');
      setTimeout(() => showPage('numbers'), 2000);
    } else {
      showToast('No SMS received yet.', 'info');
    }
  } catch (e) {
    showToast('Error refreshing', 'error');
  }
}

async function cancelNumber(numberId) {
  if (!confirm('Cancel this number? Your balance will be refunded.')) return;
  try {
    const res = await fetch(`/api/numbers/${numberId}`, { method: 'DELETE' });
    const data = await res.json();
    showToast(data.message || 'Number cancelled', 'success');
    showPage('numbers');
  } catch (e) {
    showToast('Error cancelling', 'error');
  }
}


// ====== TIMER PAGE ======

function showNumberTimer(numberId, phone, serviceName, timeLeft) {
  currentPage = 'timer';
  const main = document.getElementById('mainContent');

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

    const minutes = Math.floor(timer.timeLeft / 60);
    const seconds = timer.timeLeft % 60;
    const progressPercent = (timer.timeLeft / 1200) * 100;

    const timerText = document.querySelector('.timer-text');
    if (timerText) {
      timerText.innerHTML = `
        <div style="font-size: 36px; font-weight: 700; color: var(--text-primary);">${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}</div>
        <div style="font-size: 14px; color: var(--text-muted);">minutes remaining</div>
      `;
    }

    const progress = document.querySelector('.timer-progress');
    if (progress) {
      const angle = (progressPercent / 100) * 360;
      progress.style.clipPath = `polygon(50% 50%, 50% 0%, ${50 + 50 * Math.cos((angle * Math.PI / 180) - Math.PI/2)}% ${50 + 50 * Math.sin((angle * Math.PI / 180) - Math.PI/2)}%)`;
    }

    if (timer.timeLeft === 300) showTimerNotification('5 minutes remaining!', 'warning');
    else if (timer.timeLeft === 60) showTimerNotification('1 minute remaining!', 'danger');

  }, 1000);
}

function showTimerNotification(message, type = 'info') {
  const notifications = document.getElementById('timerNotifications');
  if (notifications) {
    const colorVar = type === 'warning' ? 'warning' : type === 'danger' ? 'danger' : 'accent';
    notifications.innerHTML = `<div style="color: var(--${colorVar}); font-weight: 600;">${message}</div>`;
  }
  showToast(message, type);
}

function timerExpired() {
  const timer = window.currentTimer;
  if (!timer) return;

  const timerContainer = document.querySelector('.timer-container');
  if (timerContainer) {
    timerContainer.innerHTML = `
      <div style="text-align: center; padding: 60px 20px;">
        <i class="fas fa-clock" style="font-size: 64px; color: var(--danger); margin-bottom: 20px;"></i>
        <h2 style="font-size: 24px; font-weight: 700; margin-bottom: 12px;">Number Expired</h2>
        <p style="font-size: 16px; color: var(--text-muted); margin-bottom: 30px;">This number is no longer active.</p>
        <div style="display: flex; gap: 12px; justify-content: center;">
          <button class="btn btn-primary" onclick="openModal()"><i class="fas fa-plus"></i> Get New Number</button>
          <button class="btn btn-secondary" onclick="showPage('numbers')"><i class="fas fa-list"></i> View Numbers</button>
        </div>
      </div>
    `;
  }
}


// ====== EVENT DELEGATION (Fixes the dropdown bug) ======

document.querySelector('.modal-body').addEventListener('change', function(e) {
  if (e.target.id === 'modalService') {
    selectedService = services.find(s => s.id === e.target.value) || null;
    customServiceName = '';
    updateModalBody();
  } 
  else if (e.target.id === 'modalCountry') {
    selectedCountry = countries.find(c => c.code === e.target.value) || null;
    updateModalBody();
  }
  else if (e.target.id === 'customServiceName') {
    customServiceName = e.target.value.trim();
  }
});

document.getElementById('modalClose').addEventListener('click', closeModal);
document.getElementById('modalOverlay').addEventListener('click', function(e) {
  if (e.target === this) closeModal();
});