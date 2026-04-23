function getCategoryKey(cat) {
  if (!cat) return 'recommended';
  var c = cat.toLowerCase().trim();
  
  if (c.includes('recommend')) return 'recommended';
  if (c.includes('popular') || c.includes('top')) return 'popular';
  if (c.includes('social') || c.includes('messenger') || c.includes('chat')) return 'social';
  if (c.includes('ecommerce') || c.includes('e-commerce') || c.includes('market') || c.includes('shop') || c.includes('store')) return 'ecommerce';
  
  // If it's something else (like "Email", "Payments", etc), put it in Recommended so it doesn't disappear
  return 'recommended'; 
}

function renderSidebar(filter = '') {
  // If services isn't loaded yet, stop
  if (typeof services === 'undefined' || !services) return;

  var query = filter.trim().toLowerCase();
  
  // SAFE FILTER
  var filtered = services.filter(function(s) {
    if (!query) return true;
    return (s.name || '').toLowerCase().includes(query) ||
      (s.region || '').toLowerCase().includes(query) ||
      (s.category || '').toLowerCase().includes(query);
  });

  var groups = {
    recommended: document.getElementById('recommendedList'),
    popular: document.getElementById('popularList'),
    social: document.getElementById('socialList'),
    ecommerce: document.getElementById('ecommerceList'),
  };

  // Clear existing lists
  Object.values(groups).forEach(function(group) {
    if (group) group.innerHTML = '';
  });

  // Add filtered services to their correct boxes
  filtered.forEach(function(service) {
    // Use the smart matcher to find the right box
    var catKey = getCategoryKey(service.category);
    var container = groups[catKey];
    
    if (!container) return;

    var ico = getServiceIconData(service.name, service.id, service.icon);

    var item = document.createElement('div');
    item.className = 'service-item';
    item.setAttribute('role', 'button');
    item.setAttribute('tabindex', '0');
    item.setAttribute('aria-label', service.name + ' ' + (service.region || '') + ' - $' + (service.price || 0).toFixed(2));
    
    item.innerHTML = 
      '<div class="service-icon" style="background:' + ico.bg + ';color:' + ico.color + ';">' + ico.html + '</div>' +
      '<div class="service-info">' +
        '<div class="service-name">' + service.name + '</div>' +
        '<div class="service-region">' + (service.region || '') + '</div>' +
        (service.available !== undefined && service.available !== null ? '<div class="service-available">' + service.available.toLocaleString() + ' pc</div>' : '') +
      '</div>' +
      '<div class="service-price">$' + (service.price || 0).toFixed(2) + '</div>';

    item.addEventListener('click', function() { openModalById(service.id); });
    item.addEventListener('keydown', function(e) {
      if (e.key === 'Enter' || e.key === ' ') openModalById(service.id);
    });

    container.appendChild(item);
  });

  // Hide sections that ended up empty, show sections that have items
  Object.entries(groups).forEach(function(entry) {
    var key = entry[0];
    var listEl = entry[1];
    var section = listEl ? listEl.closest('.sidebar-section') : null;
    if (section) {
      section.style.display = listEl && listEl.children.length ? '' : 'none';
    }
  });
}