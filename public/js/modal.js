let selectedService = null;
let selectedCountry = null;
let customServiceName = '';

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
      <div style="font-size: 12px; color: var(--text-secondary); margin-top: 8px;">Cost: $${finalPrice.toFixed(2)} for ${selectedCountry.name}</div>
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
        cost: finalPrice
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

    // Success - show success message then close
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
    startSimulation();
    
    // Auto close after 2 seconds
    setTimeout(() => {
      closeModal();
      showToast('Number ' + data.phone + ' activated for ' + serviceName, 'success');
    }, 2000);

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
