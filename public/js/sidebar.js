function renderSidebar(filter = '') {
  const query = filter.trim().toLowerCase();
  const filtered = services.filter(s => {
    if (!query) return true;
    return s.name.toLowerCase().includes(query) ||
      s.region.toLowerCase().includes(query) ||
      s.category.toLowerCase().includes(query);
  });

  const groups = {
    recommended: document.getElementById('recommendedList'),
    popular: document.getElementById('popularList'),
    social: document.getElementById('socialList'),
    ecommerce: document.getElementById('ecommerceList'),
  };

  Object.values(groups).forEach(group => {
    if (group) group.innerHTML = '';
  });

  filtered.forEach(service => {
    const container = groups[service.category];
    if (!container) return;

    var ico = getServiceIconData(service.name, service.id, service.icon);

    const item = document.createElement('div');
    item.className = 'service-item';
    item.setAttribute('role', 'button');
    item.setAttribute('tabindex', '0');
    item.setAttribute('aria-label', `${service.name} ${service.region} - $${service.price.toFixed(2)}`);
    item.innerHTML = `
      <div class="service-icon" style="background:${ico.bg};color:${ico.color};">${ico.html}</div>
      <div class="service-info">
        <div class="service-name">${service.name}</div>
        <div class="service-region">${service.region}</div>
        ${service.available !== undefined && service.available !== null ? '<div class="service-available">' + service.available.toLocaleString() + ' pc</div>' : ''}
      </div>
      <div class="service-price">$${service.price.toFixed(2)}</div>
    `;

    item.addEventListener('click', () => openModalById(service.id));
    item.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') openModalById(service.id);
    });

    container.appendChild(item);
  });

  Object.entries(groups).forEach(([key, listEl]) => {
    const section = listEl ? listEl.closest('.sidebar-section') : null;
    if (section) {
      section.style.display = listEl && listEl.children.length ? '' : 'none';
    }
  });
}