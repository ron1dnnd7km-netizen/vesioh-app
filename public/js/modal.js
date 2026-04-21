let selectedService = null;
let selectedCountry = null;
let customServiceName = '';
let modalPaymentMethod = 'wallet';

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
  modalPaymentMethod = 'wallet';

  updateModalBody();
  overlay.classList.add('show');
}

function updateModalBody() {
  const modalBody = document.querySelector('.modal-body');
  const countryPrice = selectedCountry ? (selectedCountry.basePrice || 0.50) : 0;
  const finalPrice = selectedCountry && selectedService ? countryPrice : 0;

  const uniqueServices = [];
  const seen = new Set();
  services.forEach(s => {
    if (!seen.has(s.name)) { seen.add(s.name); uniqueServices.push(s); }
  });
  const serviceOptions = uniqueServices.map(s => 
    `<option value="${s.id}" ${selectedService && selectedService.id === s.id ? 'selected' : ''}>${s.name}</option>`
  ).join('');

  const countryOptions = countries.map(c => 
    `<option value="${c.code}" ${selectedCountry && selectedCountry.code === c.code ? 'selected' : ''}>${c.flag} ${c.name}</option>`
  ).join('');

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
  modalPaymentMethod = method;
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

  modalBody.innerHTML = `
    <div style="text-align: center; padding: 40px 20px;">
      <i class="fas fa-spinner fa-spin" style="font-size: 24px; color: var(--accent); margin-bottom: 16px;"></i>
      <div style="font-size: 16px; font-weight: 600; margin-bottom: 8px;">Charging wallet...</div>
      <div style="font-size: 13px; color: var(--text-muted);">Please wait while we assign your number</div>
      <div style="font-size: 12px; color: var(--text-secondary); margin-top: 8px;">Cost: $${countryPrice.toFixed(2)}</div>
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
        cost: countryPrice,
        paymentMethod: modalPaymentMethod
      })
    });
    
    const data = await res.json();

    if (data.error) {
      updateModalBody();
      showToast(data.error, 'error');
      return;
    }

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

    // Stay on numbers page — number appears in Number panel, code will arrive in Code panel
    window.currentPage = 'numbers';
    updateHash('numbers');
    document.querySelectorAll('.nav-link').forEach(function(l) { l.classList.remove('active'); });
    var homeBtn = document.querySelector("[data-page='numbers']");
    if (homeBtn) homeBtn.classList.add('active');
    renderMainContent();

    setTimeout(function() {
      closeModal();
      showToast('Number ' + data.phone + ' activated', 'success');
    }, 1500);

  } catch(e) {
    updateModalBody();
    showToast('Error requesting number', 'error');
  }
}

// ====== EVENT DELEGATION ======

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