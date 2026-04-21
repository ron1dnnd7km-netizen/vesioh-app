function renderNumbersPage(main) {
  var activeOnlyNumbers = activeNumbers ? activeNumbers.filter(function(n) { return n.status === 'waiting' || n.status === 'received'; }) : [];
  var totalActive = activeOnlyNumbers.length;
  var waitingNumbers = activeOnlyNumbers;
  var waitingCount = waitingNumbers.length;

  var activeNumbersHTML = totalActive > 0
    ? waitingNumbers.map(renderActiveNumberCard).join('')
    : '<div style="padding:22px;border:1px dashed var(--border);border-radius:14px;color:var(--text-secondary);font-size:14px;">No active numbers yet. Buy one from below.</div>';

  // ====== ADDED THE SERVICE GRID HERE! ======
  var serviceGridHTML = '<div style="margin-top:24px;">' +
    '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px;">' +
      '<h2 style="font-size:16px;font-weight:700;display:flex;align-items:center;gap:8px;">' +
        '<i class="fas fa-shopping-cart" style="color:var(--accent);font-size:14px;"></i> Get Virtual Number</h2>' +
    '</div>' +
    '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(100px,1fr));gap:8px;">' +
      getDashboardServiceListHTML() +
    '</div>' +
  '</div>';

  // ====== THE FIX: ADDED main.innerHTML = AND + SIGNS ======
  main.innerHTML =

    /* ===== NUMBER & CODE COMBINED ===== */
    '<div style="background:var(--bg-card);border:1px solid var(--border);border-radius:18px;padding:24px;box-shadow:var(--shadow-sm);margin-bottom:28px;">' +
      '<div>' +
        '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:16px;">' +
          '<h2 style="font-size:18px;font-weight:700;display:flex;align-items:center;gap:10px;">' +
            '<i class="fas fa-phone-alt" style="color:var(--accent);font-size:15px;"></i> Active Numbers</h2>' +
          '<span style="font-size:12px;padding:3px 10px;border-radius:8px;font-weight:600;background:var(--accent-dim);color:var(--accent);">' + totalActive + ' active</span>' +
        '</div>' +
        '<div style="display:flex;flex-direction:column;gap:12px;">' + activeNumbersHTML + '</div>' +
      '</div>' +
    '</div>' +

    /* ===== IMPORTANT INFO SECTION ===== */
    '<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(250px,1fr));gap:12px;margin-bottom:28px;">' +
      '<div style="background:rgba(13,155,122,0.08);border:1px solid rgba(13,155,122,0.2);border-radius:12px;padding:16px;box-shadow:var(--shadow-sm);">' +
        '<h3 style="font-size:13px;font-weight:700;margin-bottom:8px;color:var(--accent);">No Cancellations Within 45s</h3>' +
        '<p style="font-size:12px;color:var(--text-secondary);line-height:1.5;">Orders cannot be canceled within 45 seconds after a number is purchased.</p>' +
      '</div>' +
      '<div style="background:rgba(13,155,122,0.08);border:1px solid rgba(13,155,122,0.2);border-radius:12px;padding:16px;box-shadow:var(--shadow-sm);">' +
        '<h3 style="font-size:13px;font-weight:700;margin-bottom:8px;color:var(--accent);">SMS Not Received?</h3>' +
        '<p style="font-size:12px;color:var(--text-secondary);line-height:1.5;">Try removing the country code from the number and attempt again.</p>' +
      '</div>' +
      '<div style="background:rgba(13,155,122,0.08);border:1px solid rgba(13,155,122,0.2);border-radius:12px;padding:16px;box-shadow:var(--shadow-sm);">' +
        '<h3 style="font-size:13px;font-weight:700;margin-bottom:8px;color:var(--accent);">Automatic Refunds</h3>' +
        '<p style="font-size:12px;color:var(--text-secondary);line-height:1.5;">Funds will be automatically refunded to your wallet if the request times out or is canceled.</p>' +
      '</div>' +
    '</div>' +

    /* ===== INFO SECTION ===== */
    '<div style="background:var(--bg-card);border:1px solid var(--border);border-radius:18px;padding:28px;box-shadow:var(--shadow-sm);margin-bottom:28px;">' +
      '<h2 style="font-size:22px;font-weight:700;margin-bottom:16px;">Why use temporary phone numbers</h2>' +
      '<p style="font-size:14px;color:var(--text-secondary);line-height:1.8;margin-bottom:14px;">When creating accounts, most websites require a valid mobile number. Temporary numbers let you create and manage multiple accounts without limitations.</p>' +
      '<p style="font-size:14px;color:var(--text-secondary);line-height:1.8;margin-bottom:14px;"><strong>Protect your privacy</strong> — Your personal phone number can reveal sensitive details. Using temporary numbers helps keep your identity secure.</p>' +
      '<p style="font-size:14px;color:var(--text-secondary);line-height:1.8;"><strong>Bypass regional restrictions</strong> — Temporary numbers from different countries allow you to register on platforms without geographic barriers.</p>' +
    '</div>' +

    /* ===== THIS ADDS THE BUTTONS TO THE PAGE ===== */
    serviceGridHTML;
}

/* ===== Card for combined Number + Code display ===== */
function renderActiveNumberCard(n) {
  var timeLeft = (n.time_left !== undefined && n.time_left !== null) ? n.time_left : (n.timeLeft || 0);
  var serviceName = n.service_name || (n.service ? n.service.name : 'Unknown');
  var countryFlag = n.country_flag || '🏳️';
  var minutes = Math.floor(timeLeft / 60);
  var seconds = timeLeft % 60;
  var timerDisplay = String(minutes).padStart(2, '0') + ':' + String(seconds).padStart(2, '0');
  
  var statusColors = { waiting: 'var(--warning)', received: 'var(--accent)', expired: 'var(--danger)' };
  var statusLabels = { waiting: 'Waiting', received: 'Received', expired: 'Timeout' };
  var statusColor = statusColors[n.status] || 'var(--text-muted)';
  var statusLabel = statusLabels[n.status] || n.status;

  var codeDisplay = '';
  if (n.status === 'received' && n.code) {
    codeDisplay = '<div style="font-family:JetBrains Mono,monospace;font-size:16px;font-weight:800;color:var(--accent);letter-spacing:3px;margin:0 8px;">' + n.code + '</div>';
  }

  var cancelBtn = (n.status === 'waiting' || n.status === 'received')
    ? '<button class="btn-sm cancel" onclick="cancelNumber(' + n.id + ')" style="padding:4px 8px;font-size:11px;background:var(--danger);color:white;border:none;border-radius:6px;cursor:pointer;"><i class="fas fa-times"></i></button>'
    : '';

  return '<div style="background:var(--bg-primary);border:1px solid var(--border);border-radius:12px;padding:12px;display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:8px;">' +
    '<div style="display:flex;align-items:center;gap:8px;flex:1;min-width:150px;">' +
      '<div style="font-size:16px;flex-shrink:0;">' + countryFlag + '</div>' +
      '<div class="service-icon ' + (n.service_id || 'other') + '" style="width:24px;height:24px;border-radius:6px;display:flex;align-items:center;justify-content:center;font-size:12px;flex-shrink:0;">' +
        '<i class="' + (n.service_icon || 'fas fa-mobile-alt') + '"></i>' +
      '</div>' +
      '<div style="font-family:JetBrains Mono,monospace;font-size:13px;font-weight:700;word-break:break-all;">' + n.phone + '</div>' +
      '<button class="btn-sm copy" onclick="copyNumber(\'' + n.phone + '\')" style="padding:4px 6px;font-size:10px;flex-shrink:0;"><i class="fas fa-copy"></i></button>' +
    '</div>' +
    codeDisplay +
    '<div style="display:flex;align-items:center;gap:6px;flex-shrink:0;">' +
      '<span style="font-family:JetBrains Mono,monospace;font-size:11px;font-weight:600;color:' + statusColor + ';min-width:35px;text-align:right;" id="timer-active-' + n.id + '">' + timerDisplay + '</span>' +
      '<span style="font-size:11px;font-weight:700;color:var(--accent);min-width:30px;text-align:right;">$' + n.cost.toFixed(2) + '</span>' +
      cancelBtn +
    '</div>' +
  '</div>';
}

/* ===== Card for "Code" panel — shows code, timeline, cancel ===== */
function renderWaitingCard(n) {
  var timeLeft = (n.time_left !== undefined && n.time_left !== null) ? n.time_left : (n.timeLeft || 0);
  var totalTime = (n.total_time !== undefined && n.total_time !== null) ? n.total_time : (n.totalTime || 1);
  var barWidth = n.status === 'expired' ? 0 : (timeLeft / totalTime * 100);
  var serviceName = n.service_name || (n.service ? n.service.name : 'Unknown');

  var timerDisplay = n.status === 'expired'
    ? '<span style="color:var(--danger);font-size:13px;"><i class="fas fa-times-circle"></i> Expired</span>'
    : '<span style="font-family:JetBrains Mono,monospace;font-size:14px;font-weight:600;" id="timer-wait-' + n.id + '">' + formatTime(timeLeft) + '</span>';

  var codeBlock = '';
  if (n.status === 'received' && n.code) {
    codeBlock = '<div style="margin-bottom:14px;">' +
      '<div style="font-size:11px;color:var(--accent);font-weight:600;text-transform:uppercase;letter-spacing:0.8px;margin-bottom:8px;">Verification Code</div>' +
      '<div style="display:flex;align-items:center;justify-content:space-between;background:var(--accent-dim);border:1px solid rgba(0,212,170,0.25);border-radius:10px;padding:12px 14px;">' +
        '<span style="font-family:JetBrains Mono,monospace;font-size:24px;font-weight:800;color:var(--accent);letter-spacing:5px;">' + n.code + '</span>' +
        '<button class="btn-sm copy" onclick="copyNumber(\'' + n.code + '\')" style="padding:6px 12px;"><i class="fas fa-copy"></i> Copy</button>' +
      '</div>' +
      (n.sms_text ? '<div style="font-size:12px;color:var(--text-muted);margin-top:6px;line-height:1.5;"><i class="fas fa-envelope" style="margin-right:4px;"></i>' + n.sms_text + '</div>' : '') +
    '</div>';
  } else {
    codeBlock = '<div style="margin-bottom:14px;">' +
      '<div style="display:flex;align-items:center;gap:6px;margin-bottom:8px;">' +
        '<span style="width:7px;height:7px;border-radius:50%;background:var(--warning);animation:blink 1.2s ease-in-out infinite;display:inline-block;"></span>' +
        '<span style="font-size:11px;color:var(--text-muted);font-weight:600;text-transform:uppercase;letter-spacing:0.8px;">Waiting for code...</span>' +
      '</div>' +
      '<div style="font-size:12px;color:var(--text-muted);font-style:italic;">No code received yet. Send SMS to the number.</div>' +
    '</div>';
  }

  var tlDot2Style = n.status === 'received'
    ? 'background:var(--accent);'
    : 'background:var(--warning);animation:blink 1.2s ease-in-out infinite;';
  var tlText2 = n.status === 'received'
    ? 'SMS received: ' + n.code
    : 'Waiting for SMS...';

  var timelineHTML = '<div style="margin-bottom:14px;">' +
    '<div style="font-size:11px;color:var(--text-muted);font-weight:600;text-transform:uppercase;letter-spacing:0.8px;margin-bottom:10px;">Timeline</div>' +
    '<div style="display:flex;flex-direction:column;gap:8px;padding-left:4px;">' +
      '<div style="display:flex;align-items:flex-start;gap:8px;">' +
        '<span style="width:7px;height:7px;border-radius:50%;background:var(--accent);margin-top:4px;flex-shrink:0;"></span>' +
        '<span style="font-size:12px;color:var(--text-secondary);">Number assigned</span>' +
      '</div>' +
      '<div style="display:flex;align-items:flex-start;gap:8px;">' +
        '<span style="width:7px;height:7px;border-radius:50%;' + tlDot2Style + 'margin-top:4px;flex-shrink:0;"></span>' +
        '<span style="font-size:12px;color:var(--text-secondary);">' + tlText2 + '</span>' +
      '</div>' +
    '</div>' +
  '</div>';

  var cancelHTML = '';
  if (n.status === 'waiting') {
    cancelHTML = '<button class="btn-sm cancel" onclick="cancelNumber(' + n.id + ')" style="width:100%;justify-content:center;padding:10px;font-size:13px;border-radius:10px;margin-top:4px;"><i class="fas fa-times"></i> Cancel</button>';
  }

  return '<div style="background:var(--bg-primary);border:1px solid var(--border);border-radius:14px;padding:16px;">' +
    '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px;">' +
      '<div style="font-size:14px;font-weight:600;">' + serviceName + '</div>' +
      timerDisplay +
    '</div>' +
    '<div style="height:3px;background:var(--border);border-radius:2px;overflow:hidden;margin-bottom:14px;"><div style="height:100%;width:' + barWidth + '%;background:' + (n.status === 'received' ? 'var(--accent)' : 'var(--warning)') + ';border-radius:2px;transition:width 1s linear;"></div></div>' +
    codeBlock +
    timelineHTML +
    cancelHTML +
  '</div>';
}

/* ===== Keep original renderNumberCard for history/other uses ===== */
function renderNumberCard(n) {
  var statusTexts = { waiting: 'Waiting for SMS...', received: 'Code received', expired: 'Number expired' };
  var smsBlock = '';
  if (n.status === 'received' && n.code) {
    smsBlock = '<div class="sms-content"><div class="sms-code">' + n.code + '</div>' +
      '<div class="sms-text">' + (n.sms_text || 'Your verification code is ' + n.code) + '</div>' +
      '<div class="sms-time"><i class="fas fa-clock"></i> Received just now</div></div>';
  }

  var timeLeft = (n.time_left !== undefined && n.time_left !== null) ? n.time_left : (n.timeLeft || 0);
  var totalTime = (n.total_time !== undefined && n.total_time !== null) ? n.total_time : (n.totalTime || 1);
  var timerHTML = n.status === 'expired'
    ? '<i class="fas fa-times-circle"></i> Expired'
    : '<span class="timer-dot"></span> <span id="timer-' + n.id + '">' + formatTime(timeLeft) + '</span>';

  var actions = '<button class="btn-sm copy" onclick="copyNumber(\'' + n.phone + '\')"><i class="fas fa-copy"></i> Copy</button>';
  if (n.status === 'waiting') {
    actions += '<button class="btn-sm cancel" onclick="cancelNumber(' + n.id + ')"><i class="fas fa-times"></i> Cancel</button>';
  }
  if (n.status === 'expired') {
    actions += '<button class="btn-sm refresh" onclick="refreshNumber(' + n.id + ')"><i class="fas fa-redo"></i> Retry</button>';
  }

  var barWidth = n.status === 'expired' ? 0 : (timeLeft / totalTime * 100);
  var serviceName = n.service_name || (n.service ? n.service.name : 'Unknown');
  var regionTag = 'UNK';
  if (n.service_id) {
    regionTag = n.service_id.split('-').pop().toUpperCase();
  } else if (n.service && n.service.id) {
    regionTag = n.service.id.split('-').pop().toUpperCase();
  }

  return '<div class="number-card ' + n.status + '" id="card-' + n.id + '">' +
    '<div class="number-top"><div class="number-left">' +
    '<div class="number-service-icon other"><i class="fas fa-sms"></i></div>' +
    '<div><div class="number-service-name">' + serviceName + '</div>' +
    '<div class="number-region-tag"><i class="fas fa-globe"></i> ' + regionTag + '</div></div></div>' +
    '<div class="number-right"><div class="number-phone">' + n.phone + '</div>' +
    '<div class="number-timer ' + n.status + '">' + timerHTML + '</div></div></div>' +
    smsBlock +
    '<div class="timer-bar"><div class="timer-bar-fill" style="width:' + barWidth + '%"></div></div>' +
    '<div class="number-bottom"><div class="number-status">' +
    '<span class="status-dot ' + n.status + '"></span>' +
    '<span class="status-text ' + n.status + '">' + statusTexts[n.status] + '</span>' +
    '<span style="color:var(--text-muted);margin-left:8px;font-size:11px;">Cost: $' + n.cost.toFixed(2) + '</span></div>' +
    '<div class="number-actions">' + actions + '</div></div></div>';
}

function getDashboardServiceListHTML() {
  var items = [
    { name: 'WhatsApp', icon: 'fab fa-whatsapp', color: '#25d366', bg: 'rgba(37,211,102,0.1)', price: '0.70', id: 'wa', region: 'Any' },
    { name: 'Telegram', icon: 'fab fa-telegram-plane', color: '#24a1de', bg: 'rgba(36,161,222,0.1)', price: '0.45', id: 'tg', region: 'Any' },
    { name: 'Facebook', icon: 'fab fa-facebook-f', color: '#1877f2', bg: 'rgba(24,119,242,0.1)', price: '0.50', id: 'fb', region: 'Any' },
    { name: 'Instagram', icon: 'fab fa-instagram', color: '#e1306c', bg: 'rgba(225,48,108,0.1)', price: '0.60', id: 'ig', region: 'Any' },
    { name: 'Google', icon: 'fab fa-google', color: '#4285f4', bg: 'rgba(66,133,244,0.1)', price: '0.35', id: 'google', region: 'Any' },
    { name: 'Twitter / X', icon: 'fab fa-x-twitter', color: '#1da1f2', bg: 'rgba(29,161,242,0.1)', price: '0.55', id: 'tw', region: 'Any' },
    { name: 'TikTok', icon: 'fab fa-tiktok', color: '#cc0044', bg: 'rgba(255,0,80,0.06)', price: '0.20', id: 'tk', region: 'Any' },
    { name: 'Discord', icon: 'fab fa-discord', color: '#5865f2', bg: 'rgba(88,101,242,0.1)', price: '0.40', id: 'discord', region: 'Any' },
    { name: 'Amazon', icon: 'fab fa-amazon', color: '#e68a00', bg: 'rgba(255,153,0,0.1)', price: '0.90', id: 'amz', region: 'Any' },
    { name: 'Microsoft', icon: 'fab fa-microsoft', color: '#0078d4', bg: 'rgba(0,120,212,0.1)', price: '0.50', id: 'microsoft', region: 'Any' },
    { name: 'Fiverr', icon: 'fab fa-font-awesome', color: '#00af50', bg: 'rgba(0,175,80,0.1)', price: '0.80', id: 'fiverr', region: 'Any' },
    { name: 'PayPal', icon: 'fab fa-paypal', color: '#003087', bg: 'rgba(0,48,135,0.1)', price: '0.85', id: 'pp', region: 'Any' }
  ];
  return items.map(function(s) {
    var service = services.find(function(x) { return x.id === s.id; }) || {};
    var availableText = service.available !== undefined ? service.available.toLocaleString() + ' pc' : '';
    return '<div style="padding:16px 12px;background:var(--bg-card);border:1px solid var(--border);border-radius:12px;text-align:center;box-shadow:var(--shadow-sm);cursor:pointer;transition:all 0.2s;" ' +
      'onmouseover="this.style.boxShadow=\'var(--shadow-md)\';this.style.borderColor=\'var(--accent)\'" ' +
      'onmouseout="this.style.boxShadow=\'var(--shadow-sm)\';this.style.borderColor=\'var(--border)\'" ' +
      'onclick="openModalById(\'' + s.id + '\')">' +
      '<div style="width:40px;height:40px;border-radius:10px;background:' + s.bg + ';display:flex;align-items:center;justify-content:center;margin:0 auto 10px;font-size:16px;color:' + s.color + ';">' +
      '<i class="' + s.icon + '"></i></div>' +
      '<div style="font-size:12px;font-weight:600;margin-bottom:6px;">' + s.name + '</div>' +
      '<div style="font-size:11px;color:var(--text-muted);margin-bottom:6px;">' + s.region + '</div>' +
      (availableText ? '<div style="font-size:11px;color:var(--text-secondary);margin-bottom:8px;">' + availableText + '</div>' : '') +
      '<div style="font-size:13px;font-weight:700;color:var(--accent);">$' + s.price + '</div></div>';
  }).join('');
}

function renderHistoryPage(main) {
  var rows = '';
  if (historyData.length === 0) {
    rows = '<div class="empty-state"><i class="fas fa-history"></i><h3>No history yet</h3><p>Your SMS code history will appear here</p></div>';
  } else {
    rows = historyData.map(function(h) {
      // Look up service from services array
      var service = services.find(function(s) { return s.name.toLowerCase() === h.service_name.toLowerCase(); });
      var countryFlag = '🏳️';
      var serviceIcon = service ? service.icon : 'fas fa-mobile-alt';
      var serviceId = service ? service.id : 'other';
      
      var statusColor, statusLabel;
      if (h.status === 'success') {
        statusColor = 'var(--accent)';
        statusLabel = 'Code Received';
      } else if (h.status === 'pending' || h.status === 'waiting') {
        statusColor = 'var(--warning)';
        statusLabel = 'Waiting';
      } else {
        statusColor = 'var(--danger)';
        statusLabel = 'Timeout';
      }
      
      var codeDisplay = h.code ? '<div style="font-family:JetBrains Mono,monospace;font-size:14px;font-weight:800;color:var(--accent);letter-spacing:2px;margin:0 6px;">' + h.code + '</div>' : '';
      
      return '<div style="background:var(--bg-primary);border:1px solid var(--border);border-radius:12px;padding:12px;display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:8px;">' +
        '<div style="display:flex;align-items:center;gap:8px;flex:1;min-width:150px;">' +
          '<div style="font-size:16px;flex-shrink:0;">' + countryFlag + '</div>' +
          '<div class="service-icon ' + serviceId + '" style="width:24px;height:24px;border-radius:6px;display:flex;align-items:center;justify-content:center;font-size:12px;flex-shrink:0;">' +
            '<i class="' + serviceIcon + '"></i>' +
          '</div>' +
          '<div style="font-family:JetBrains Mono,monospace;font-size:13px;font-weight:700;word-break:break-all;">' + h.phone + '</div>' +
          '<button class="btn-sm copy" onclick="copyNumber(\'' + h.phone + '\')" style="padding:4px 6px;font-size:10px;flex-shrink:0;"><i class="fas fa-copy"></i></button>' +
        '</div>' +
        codeDisplay +
        '<div style="display:flex;align-items:center;gap:6px;flex-shrink:0;">' +
          '<span style="font-size:10px;padding:3px 8px;border-radius:6px;font-weight:600;background:' + statusColor + '22;color:' + statusColor + ';white-space:nowrap;">' + statusLabel + '</span>' +
          '<span style="font-size:11px;font-weight:700;color:var(--accent);min-width:30px;text-align:right;">$' + h.cost.toFixed(2) + '</span>' +
        '</div>' +
      '</div>';
    }).join('');
  }
  main.innerHTML = '<div class="page-header"><h1 class="page-title">SMS History</h1>' +
    '<div class="page-actions"><button class="btn btn-secondary" onclick="showToast(\'Export coming soon\',\'info\')"><i class="fas fa-download"></i> Export</button></div></div>' +
    '<div style="background:var(--bg-card);border:1px solid var(--border);border-radius:18px;padding:24px;box-shadow:var(--shadow-sm);"><div style="display:flex;flex-direction:column;gap:12px;">' + rows + '</div></div>';
}

async function renderSettingsPage(main) {
  main.innerHTML = '<div class="page-header"><h1 class="page-title">Referral Program</h1></div>' +
    '<div style="max-width:980px;margin:0 auto;display:grid;gap:22px;">' +
      '<div style="background:var(--bg-card);border:1px solid var(--border);border-radius:18px;padding:26px;box-shadow:var(--shadow-sm);">' +
        '<h2 style="font-size:24px;font-weight:700;margin-bottom:10px;">Recommend the service and earn money</h2>' +
        '<p style="font-size:15px;color:var(--text-secondary);line-height:1.8;margin-bottom:18px;">Share your referral link with friends and earn 2% of every purchase made by users who sign up through your link.</p>' +
        '<button class="btn btn-secondary" style="margin-bottom:16px;" onclick="document.querySelectorAll(\'.nav-link\').forEach(function(l){l.classList.remove(\'active\')});document.querySelector(\"[data-page=help]\").classList.add(\'active\');currentPage=\'help\';renderMainContent();">Read more...</button>' +
      '</div>' +
      '<div style="display:grid;grid-template-columns:1fr 1fr;gap:22px;">' +
        '<div style="background:var(--bg-card);border:1px solid var(--border);border-radius:18px;padding:24px;box-shadow:var(--shadow-sm);">' +
          '<div style="font-size:12px;color:var(--text-muted);text-transform:uppercase;letter-spacing:1px;font-weight:600;margin-bottom:8px;">Your balance</div>' +
          '<div style="font-size:32px;font-weight:800;color:var(--accent);margin-bottom:8px;" id="referralBalance">$0.00</div>' +
          '<div style="font-size:13px;color:var(--text-secondary);line-height:1.7;">History of balance is available on the History page.</div>' +
        '</div>' +
        '<div style="background:var(--bg-card);border:1px solid var(--border);border-radius:18px;padding:24px;box-shadow:var(--shadow-sm);">' +
          '<div style="font-size:12px;color:var(--text-muted);text-transform:uppercase;letter-spacing:1px;font-weight:600;margin-bottom:8px;">Your REF code</div>' +
          '<div style="font-size:14px;color:var(--text-primary);line-height:1.6;margin-bottom:16px;word-break:break-all;" id="referralLink">Loading your referral link...</div>' +
          '<button class="btn btn-primary" style="width:100%;justify-content:center;" onclick="copyReferralLink()">Copy referral link</button>' +
        '</div>' +
      '</div>' +
      '<div style="background:var(--bg-card);border:1px solid var(--border);border-radius:18px;padding:24px;box-shadow:var(--shadow-sm);">' +
        '<h3 style="font-size:16px;font-weight:700;margin-bottom:10px;">How it works</h3>' +
        '<ul style="font-size:14px;color:var(--text-secondary);line-height:1.8;padding-left:18px;margin:0;">' +
          '<li>You earn 2% of every purchase made by a user who signs up with your referral link.</li>' +
          '<li>The bonus is automatically added to your balance.</li>' +
          '<li>Share your referral link on social media, chat, or email to grow your earnings.</li>' +
        '</ul>' +
      '</div>' +
    '</div>';

  try {
    const res = await fetch('/api/user/' + getUserEmail());
    if (!res.ok) throw new Error('Unable to load referral data');
    const data = await res.json();
    const referralCode = data.refCode || '';
    const linkEl = document.getElementById('referralLink');
    const balanceEl = document.getElementById('referralBalance');
    const url = referralCode ? window.location.origin + '/?ref=' + referralCode : 'Referral code unavailable';
    if (linkEl) {
      linkEl.textContent = url;
      linkEl.dataset.link = url;
    }
    if (balanceEl) {
      balanceEl.textContent = '$' + (data.balance || 0).toFixed(2);
    }
  } catch (err) {
    showToast(err.message, 'error');
  }
}

function copyReferralLink() {
  const el = document.getElementById('referralLink');
  if (!el || !el.dataset.link) {
    showToast('Referral link not ready yet', 'error');
    return;
  }
  navigator.clipboard.writeText(el.dataset.link).then(function() { showToast('Referral link copied', 'success'); }).catch(function() { showToast('Failed to copy', 'error'); });
}

function renderApiPage(main) {
  main.innerHTML = '<div class="page-header"><h1 class="page-title">API Documentation</h1></div>' +
    '<div class="stat-card" style="max-width:800px;">' +
    '<h3 style="font-size:15px;font-weight:600;margin-bottom:16px;">Quick Start</h3>' +
    '<p style="font-size:13px;color:var(--text-secondary);line-height:1.7;margin-bottom:20px;">Integrate SMS Virtual Code into your application using our RESTful API.</p>' +
    '<div class="code-block" style="margin-bottom:16px;"><pre style="color:var(--accent);">GET /api/v1/numbers/available\nAuthorization: Bearer YOUR_API_KEY\n\n{\n  "service": "whatsapp",\n  "country": "US"\n}</pre></div>' +
    '<div class="code-block" style="margin-bottom:16px;"><pre style="color:var(--info);">POST /api/v1/numbers/request\nAuthorization: Bearer YOUR_API_KEY\n\n{\n  "service": "whatsapp",\n  "country": "US"\n}</pre></div>' +
    '<div class="code-block"><pre style="color:var(--warning);">GET /api/v1/sms/{request_id}\n\n{\n  "code": "482910",\n  "text": "Your WhatsApp code is 482910"\n}</pre></div>' +
    '<div style="margin-top:20px;display:flex;gap:10px;">' +
    '<button class="btn btn-primary" onclick="showToast(\'API key copied\',\'success\')"><i class="fas fa-key"></i> Copy API Key</button>' +
    '<button class="btn btn-secondary" onclick="showToast(\'Full docs coming soon\',\'info\')"><i class="fas fa-book"></i> Full Docs</button></div></div>';
}

function renderHelpPage(main) {
  main.innerHTML = '<div class="page-header"><h1 class="page-title">Help Center</h1></div>' +
    '<div style="max-width:800px;display:flex;flex-direction:column;gap:16px;">' +
    '<h2 style="font-size:18px;font-weight:600;margin-bottom:8px;">Virtual Number Service – User Guide</h2>' +
    '<p style="font-size:14px;color:var(--text-secondary);line-height:1.6;">Stay updated by joining our Telegram Channel for the latest announcements, updates, and support.</p>' +
    '<p style="font-size:14px;color:var(--text-secondary);line-height:1.6;">If your purchased activations are not credited to your balance after payment, simply tap the "Restore Purchases" button in the app. If the issue continues, please contact support and provide a screenshot from your App Store or purchase history, or proof of payment from your bank for quick assistance.</p>' +
    '<p style="font-size:14px;color:var(--text-secondary);line-height:1.6;">Our service is simple and easy to use. First, order a number by selecting the service you need (for example, Tinder, WhatsApp, or any supported platform) and choose your preferred country. Once the number is issued, copy it and paste it into the registration form of the selected service. When the verification SMS is sent, it will appear directly in the app. You can then copy the confirmation code and complete your registration.</p>' +
    '<p style="font-size:14px;color:var(--text-secondary);line-height:1.6;">We offer two types of services. The first is Activations, which are short-term numbers available for approximately 20 minutes. These are ideal for quick verifications and allow you to receive one or more SMS depending on the selected service. The second option is Rent, which provides a number for up to 30 days. With this option, you can receive unlimited SMS, and by selecting "Full Rent," you can receive messages from any service, making it ideal for long-term use.</p>' +
    '<p style="font-size:14px;color:var(--text-secondary);line-height:1.6;">If you experience issues receiving SMS, wait at least 3 minutes and then cancel the activation. Your balance will be refunded automatically, and you can try purchasing another number. There are several factors that may affect message delivery. For better success rates, use a VPN or proxy that matches the country of the selected number, ensure you choose SMS verification instead of voice calls, and for some services like WhatsApp, reinstalling the app may help.</p>' +
    '<p style="font-size:14px;color:var(--text-secondary);line-height:1.6;">In case your registered account gets banned, it is recommended to use mobile proxies that match the geolocation of the purchased number or a mobile user agent. Please note that we only provide virtual numbers and do not control or manage account registrations. We advise users to follow best practices and research methods to avoid account restrictions.</p>' +
    '<p style="font-size:14px;color:var(--text-secondary);line-height:1.6;">Your privacy and security are important to us. Each number is assigned exclusively to one user during its usage period. SMS messages received are not shared or reused for the same service, ensuring that no one else can access your verification codes or accounts.</p>' +
    '<p style="font-size:14px;color:var(--text-secondary);line-height:1.6;">If you need further assistance, our support team is available to help. Please provide detailed information and screenshots when reporting any issues to ensure a faster resolution.</p>' +
    '</div>';
}

function renderContactsPage(main) {
  main.innerHTML = '<div class="page-header"><h1 class="page-title">Contacts</h1></div>' +
    '<div style="max-width:600px;display:flex;flex-direction:column;gap:16px;">' +
    '<div class="stat-card" style="padding:24px;">' +
    '<h3 style="font-size:16px;font-weight:600;margin-bottom:16px;">Get in Touch</h3>' +
    '<div style="display:flex;flex-direction:column;gap:12px;">' +
    '<div style="display:flex;align-items:center;gap:12px;">' +
    '<i class="fas fa-envelope" style="color:var(--accent);font-size:18px;"></i>' +
    '<div><div style="font-size:14px;font-weight:600;">Email</div><div style="font-size:14px;color:var(--text-secondary);">backwoti11@gmail.com</div></div>' +
    '</div>' +
    '<div style="display:flex;align-items:center;gap:12px;">' +
    '<i class="fas fa-phone" style="color:var(--accent);font-size:18px;"></i>' +
    '<div><div style="font-size:14px;font-weight:600;">Phone</div><div style="font-size:14px;color:var(--text-secondary);">+13146438883</div></div>' +
    '</div>' +
    '</div>' +
    '</div>' +
    '</div>';
}

/* ===== Deposit / Add Funds ===== */

var selectedDepositAmount = 20;
var selectedPaymentMethod = 'usdt';
var selectedCryptoCurrency = 'trx';

var depositMethodInfo = {
  usdt: {
    title: 'USDT-TRC20',
    subtitle: 'Confirmation: 5-10 minutes',
    note: 'Send USDT via TRC20 network. Do not use ERC20 or BEP20.',
    fee: 'Network fee: ~1 USDT'
  },
  stripe: {
    title: 'Bank Cards',
    subtitle: 'Confirmation: 1-5 minutes',
    note: 'Supports Visa, Mastercard and local bank cards.',
    fee: 'Processing fee: 2.5%'
  },
  crypto: {
    title: 'Cryptocurrency',
    subtitle: 'Confirmation: 5-30 minutes depending on network',
    note: 'Pay with BTC, ETH, LTC, DOGE, USDT and more through our secure gateway.',
    fee: 'Network fee varies by coin'
  }
};

var cryptoOptions = [
  { id: 'USDT_TRX', name: 'USDT TRC-20' },
  { id: 'TRX', name: 'TRON' },
  { id: 'BTC', name: 'Bitcoin' },
  { id: 'ETH', name: 'Ethereum' },
  { id: 'LTC', name: 'Litecoin' },
  { id: 'DOGE', name: 'Dogecoin' },
  { id: 'BNB', name: 'BNB Chain' },
  { id: 'SOL', name: 'Solana' }
];

function selectCryptoCurrency(currencyId, el) {
  selectedCryptoCurrency = currencyId;
  document.querySelectorAll('.crypto-pick').forEach(function(opt) {
    opt.style.background = 'var(--bg-primary)';
    opt.style.borderColor = 'var(--border)';
    opt.style.color = 'var(--text-secondary)';
  });
  el.style.background = 'var(--accent-dim)';
  el.style.borderColor = 'var(--accent)';
  el.style.color = 'var(--accent)';

  var minNote = document.getElementById('cryptoMinNote');
  if (minNote) {
    if (currencyId === 'USDT_TRX') {
      minNote.textContent = 'Note that the minimum amount for USDT TRC-20 is: US$5';
    } else {
      minNote.textContent = 'Note that the minimum amount is: US$2';
    }
  }

  updatePayButton();
}

function getCryptoPickerHTML() {
  return '<div id="cryptoPicker" style="margin-bottom:20px;">' +
    '<label style="display:block;font-size:14px;font-weight:600;margin-bottom:10px;">Select cryptocurrency</label>' +
    '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(130px,1fr));gap:8px;">' +
    cryptoOptions.map(function(c) {
      var isSelected = c.id === selectedCryptoCurrency;
      return '<div class="crypto-pick" onclick="selectCryptoCurrency(\'' + c.id + '\', this)" style="padding:10px 14px;border:1px solid ' + (isSelected ? 'var(--accent)' : 'var(--border)') + ';border-radius:10px;cursor:pointer;font-size:13px;font-weight:600;background:' + (isSelected ? 'var(--accent-dim)' : 'var(--bg-primary)') + ';color:' + (isSelected ? 'var(--accent)' : 'var(--text-secondary)') + ';transition:all 0.2s;text-align:center;">' + c.name + '</div>';
    }).join('') +
    '</div>' +
    '<div style="margin-top:10px;font-size:11px;color:var(--text-muted);display:flex;align-items:center;gap:6px;">' +
    '<i class="fas fa-shield-alt" style="color:var(--accent);"></i> Payments processed secure</div>' +
    '</div>';
}

function renderDepositPage(main) {
  var method = depositMethodInfo[selectedPaymentMethod] || depositMethodInfo.usdt;
  var cryptoPickerBlock = (selectedPaymentMethod === 'crypto') ? getCryptoPickerHTML() : '';

  main.innerHTML = '<div class="page-header"><div><h1 class="page-title">Top Up Balance</h1><div style="font-size:14px;color:var(--text-secondary);margin-top:8px;">Current balance: <strong id="depositCurrentBalance">$0.00</strong></div></div></div>' +
    '<div style="max-width:980px;display:grid;gap:24px;">' +
    '<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:16px;">' +
    '<div class="stat-card" style="padding:24px;min-height:180px;">' +
    '<div style="display:flex;align-items:center;gap:14px;margin-bottom:16px;"><div style="width:44px;height:44px;border-radius:14px;background:rgba(0,200,150,0.1);display:flex;align-items:center;justify-content:center;color:var(--accent);"><i class="fas fa-money-bill-wave" style="font-size:18px;"></i></div><div><div style="font-size:16px;font-weight:700;">USDT</div><div style="font-size:13px;color:var(--text-muted);">Confirmation: 5-10 minutes</div></div></div>' +
    '<div style="font-size:13px;color:var(--text-secondary);line-height:1.7;">Use USDT TRC20 to top up quickly with low fees and near-instant confirmation.</div>' +
    '<div style="margin-top:18px;"><button class="btn btn-outline dep-meth" data-method="usdt" onclick="selectPaymentMethod(\'usdt\', this)" style="width:100%;padding:12px;font-size:14px;">Select</button></div>' +
    '</div>' +
    '<div class="stat-card" style="padding:24px;min-height:180px;">' +
    '<div style="display:flex;align-items:center;gap:14px;margin-bottom:16px;"><div style="width:44px;height:44px;border-radius:14px;background:rgba(0,175,193,0.1);display:flex;align-items:center;justify-content:center;color:#00afc1;"><i class="fas fa-credit-card" style="font-size:18px;"></i></div><div><div style="font-size:16px;font-weight:700;">Bank Cards</div><div style="font-size:13px;color:var(--text-muted);">Confirmation: 1-5 minutes</div></div></div>' +
    '<div style="font-size:13px;color:var(--text-secondary);line-height:1.7;">Pay with cards and get balance instantly. Perfect when you need a smooth, simple checkout.</div>' +
    '<div style="margin-top:18px;"><button class="btn btn-outline dep-meth" data-method="stripe" onclick="selectPaymentMethod(\'stripe\', this)" style="width:100%;padding:12px;font-size:14px;">Select</button></div>' +
    '</div>' +
    '<div class="stat-card" style="padding:24px;min-height:180px;">' +
    '<div style="display:flex;align-items:center;gap:14px;margin-bottom:16px;"><div style="width:44px;height:44px;border-radius:14px;background:rgba(247,147,26,0.1);display:flex;align-items:center;justify-content:center;color:#f7931a;"><i class="fas fa-coins" style="font-size:18px;"></i></div><div><div style="font-size:16px;font-weight:700;">Cryptocurrency</div><div style="font-size:13px;color:var(--text-muted);">Secure crypto payment</div></div></div>' +
    '<div style="font-size:13px;color:var(--text-secondary);line-height:1.7;">Pay with USDT and crypto options through our secure gateway.</div>' +
    '<div style="margin-top:18px;"><button class="btn btn-outline dep-meth" data-method="crypto" onclick="selectPaymentMethod(\'crypto\', this)" style="width:100%;padding:12px;font-size:14px;">Select</button></div>' +
    '</div>' +
    '<div class="stat-card" style="padding:24px;">' +
    '<div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:16px;margin-bottom:24px;">' +
    '<div><div id="depositMethodTitle" style="font-size:20px;font-weight:700;margin-bottom:6px;">Top Up By ' + method.title + '</div>' +
    '<div id="depositMethodSubtitle" style="font-size:14px;color:var(--text-muted);">' + method.subtitle + '</div></div>' +
    '<div style="display:flex;flex-wrap:wrap;gap:10px;justify-content:flex-end;">' +
    '<button class="btn btn-outline dep-amt" data-amount="5" onclick="selectDepositAmount(5,this)" style="padding:12px 18px;font-size:14px;">US$5</button>' +
    '<button class="btn btn-outline dep-amt" data-amount="10" onclick="selectDepositAmount(10,this)" style="padding:12px 18px;font-size:14px;">US$10</button>' +
    '<button class="btn btn-primary dep-amt" data-amount="20" onclick="selectDepositAmount(20,this)" style="padding:12px 18px;font-size:14px;">US$20</button>' +
    '<button class="btn btn-outline dep-amt" data-amount="50" onclick="selectDepositAmount(50,this)" style="padding:12px 18px;font-size:14px;">US$50</button>' +
    '<button class="btn btn-outline dep-amt" data-amount="100" onclick="selectDepositAmount(100,this)" style="padding:12px 18px;font-size:14px;">US$100</button>' +
    '</div></div>' +
    cryptoPickerBlock +
    '<div style="margin-bottom:20px;"><label style="display:block;font-size:14px;font-weight:600;margin-bottom:10px;">Top up amount</label>' +
    '<input type="number" id="customAmount" placeholder="US$" min="2" max="1000" style="width:100%;padding:16px;border:1px solid var(--border);border-radius:12px;background:var(--bg-primary);font-size:16px;outline:none;" oninput="selectCustomAmount(this.value)"></div>' +
    '<div style="padding:20px;background:rgba(245,248,250,1);border:1px solid var(--border);border-radius:18px;margin-bottom:24px;">' +
    '<ul style="margin:0;padding:0 0 0 18px;color:var(--text-secondary);font-size:14px;line-height:1.8;">' +
    '<li id="cryptoMinNote">Note that the minimum amount is: US$2</li>' +
    '<li id="depositFeeNote">' + method.fee + '</li>' +
    '<li id="depositHintNote">' + method.note + '</li>' +
    '</ul></div>' +
    '<button class="btn btn-primary" style="width:100%;padding:16px;font-size:15px;margin-bottom:0;" onclick="processDeposit()" id="depositPayBtn">To Pay $' + selectedDepositAmount.toFixed(2) + '</button>' +
    '</div>' +
    '<div class="stat-card" style="padding:24px;">' +
    '<h3 style="font-size:14px;font-weight:600;margin-bottom:16px;">Recent Deposits</h3>' +
    '<div id="depositHistoryList"><div style="text-align:center;padding:20px;color:var(--text-muted);font-size:13px;">Loading...</div></div>' +
    '</div>' +
    '</div>';
  updateDepositDetails();
}

function updateDepositDetails() {
  var method = depositMethodInfo[selectedPaymentMethod] || depositMethodInfo.usdt;
  var titleEl = document.getElementById('depositMethodTitle');
  var subtitleEl = document.getElementById('depositMethodSubtitle');
  var feeNote = document.getElementById('depositFeeNote');
  var hintNote = document.getElementById('depositHintNote');
  if (titleEl) titleEl.textContent = 'Top Up By ' + method.title;
  if (subtitleEl) subtitleEl.textContent = method.subtitle;
  if (feeNote) feeNote.textContent = method.fee;
  if (hintNote) hintNote.textContent = method.note;
  updatePayButton();
}

function selectDepositAmount(amount, el) {
  selectedDepositAmount = amount;
  var customInput = document.getElementById('customAmount');
  if (customInput) customInput.value = '';
  document.querySelectorAll('.dep-amt').forEach(function(btn) {
    btn.style.background = 'var(--bg-primary)';
    btn.style.border = '1px solid var(--border)';
    delete btn.dataset.sel;
  });
  el.style.background = 'var(--accent-dim)';
  el.style.border = '2px solid var(--accent)';
  el.dataset.sel = '1';
  updatePayButton();
}

function selectCustomAmount(value) {
  var num = parseFloat(value);
  if (num > 0) {
    selectedDepositAmount = num;
    document.querySelectorAll('.dep-amt').forEach(function(btn) {
      btn.style.background = 'var(--bg-primary)';
      btn.style.border = '1px solid var(--border)';
      delete btn.dataset.sel;
    });
    updatePayButton();
  }
}

function selectPaymentMethod(method, el) {
  selectedPaymentMethod = method;
  document.querySelectorAll('.dep-meth').forEach(function(opt) {
    opt.style.background = 'var(--bg-primary)';
    opt.style.border = '1px solid var(--border)';
    delete opt.dataset.sel;
  });
  el.style.background = 'var(--accent-dim)';
  el.style.border = '2px solid var(--accent)';
  el.dataset.sel = '1';
  renderDepositPage(document.getElementById('mainContent'));
}

function updatePayButton() {
  var btn = document.getElementById('depositPayBtn');
  if (btn) {
    var label = 'Pay';
    if (selectedPaymentMethod === 'crypto') {
      var found = cryptoOptions.find(function(c) { return c.id === selectedCryptoCurrency; });
      label = 'Pay with ' + (found ? found.name : 'Crypto');
    }
    btn.innerHTML = '<i class="fas fa-lock" style="font-size:13px;"></i> ' + label + ' $' + selectedDepositAmount.toFixed(2) + ' Securely';
  }
}

async function processDeposit() {
  if (selectedCryptoCurrency === 'USDT_TRX' && selectedDepositAmount < 5) {
    showToast('Minimum for USDT TRC-20 is $5.00', 'error');
    return;
  }

  if (selectedDepositAmount < 2) {
    showToast('Minimum deposit is $2.00', 'error');
    return;
  }
  var btn = document.getElementById('depositPayBtn');
  btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Creating payment...';
  btn.disabled = true;

  try {
    var endpoint = '/api/deposit/nowpayments';
    var payload = {
      email: getUserEmail(),
      amount: selectedDepositAmount,
      pay_currency: selectedCryptoCurrency
    };

    var res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    var data = await res.json();
    if (data.error) {
      showToast(data.error, 'error');
    } else if (data.invoice_url) {
      window.location.href = data.invoice_url;
    } else {
      showToast('Unexpected response', 'error');
    }
  } catch (err) {
    showToast('Error: ' + err.message, 'error');
  }

  btn.innerHTML = '<i class="fas fa-lock" style="font-size:13px;"></i> Pay $' + selectedDepositAmount.toFixed(2) + ' Securely';
  btn.disabled = false;
}

async function loadDepositHistory() {
  try {
    var res = await fetch('/api/deposits/' + getUserEmail());
    var deposits = await res.json();
    var container = document.getElementById('depositHistoryList');
    if (!container) return;
    if (deposits.length === 0) {
      container.innerHTML = '<div style="text-align:center;padding:20px;color:var(--text-muted);font-size:13px;">No deposits yet</div>';
      return;
    }
    container.innerHTML = deposits.map(function(d) {
      var statusColor = d.status === 'completed' ? 'var(--accent)' : d.status === 'pending' ? 'var(--warning)' : 'var(--danger)';
      var statusText = d.status === 'completed' ? 'Completed' : d.status === 'pending' ? 'Pending' : 'Failed';
      var methodLabels = { usdt: 'USDT', btc: 'BTC', eth: 'ETH', ltc: 'LTC', doge: 'DOGE', bnb: 'BNB', sol: 'SOL', xrp: 'XRP', stripe: 'Card', usdc: 'USDC', matic: 'MATIC', ada: 'ADA', trx: 'TRX', usdttrc20: 'USDT TRC20' };
      var methodLabel = methodLabels[d.method] || methodLabels[d.pay_currency] || d.method || 'Unknown';
      var date = new Date(d.created_at);
      var timeStr = date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      var bgColor = d.status === 'completed' ? 'var(--accent-dim)' : d.status === 'pending' ? 'rgba(212,136,6,0.08)' : 'rgba(217,48,37,0.06)';
      return '<div style="display:flex;align-items:center;gap:14px;padding:12px 0;border-bottom:1px solid var(--border);">' +
        '<div style="flex:1;"><div style="font-size:13px;font-weight:600;">$' + d.amount.toFixed(2) + ' <span style="font-size:11px;color:var(--text-muted);font-weight:400;">' + methodLabel + '</span></div>' +
        '<div style="font-size:11px;color:var(--text-muted);">' + timeStr + '</div></div>' +
        '<span style="font-size:11px;padding:3px 10px;border-radius:6px;font-weight:600;background:' + bgColor + ';color:' + statusColor + ';">' + statusText + '</span></div>';
    }).join('');
  } catch (err) { /* silent */ }
}


// =======================================================================
// ===== BUY LOGIC =====
// =======================================================================

window.selectedBuyService = null;

window.openModalById = function(serviceId) {
  var service = services.find(function(s) { return s.id === serviceId; });
  
  if (!service) {
    console.error("Service not found for ID:", serviceId);
    showToast('Error: Service not found', 'error');
    return;
  }

  window.selectedBuyService = service;
  console.log("Preparing to buy:", service.id, service.name);

  var countryOptions = countries.map(function(c) {
    return '<option value="' + c.code + '">' + c.flag + ' ' + c.name + ' (+ $' + c.basePrice.toFixed(2) + ')</option>';
  }).join('');

  var modalHTML = '<div class="modal-overlay show" id="buyModalOverlay" onclick="if(event.target===this)closeBuyModal()">' +
    '<div class="modal" style="width:440px;">' +
      '<div class="modal-header">' +
        '<h2 class="modal-title">Get Virtual Number</h2>' +
        '<button class="modal-close" onclick="closeBuyModal()"><i class="fas fa-times"></i></button>' +
      '</div>' +
      '<div class="modal-body">' +
        '<div style="display:flex;align-items:center;gap:14px;margin-bottom:20px;padding:14px;background:var(--bg-primary);border-radius:12px;border:1px solid var(--border);">' +
          '<div class="service-icon ' + (service.iconClass || 'other') + '" style="width:44px;height:44px;border-radius:12px;display:flex;align-items:center;justify-content:center;font-size:18px;"><i class="' + service.icon + '"></i></div>' +
          '<div><div style="font-size:16px;font-weight:700;">' + service.name + '</div><div style="font-size:12px;color:var(--text-muted);">Base price: $' + service.price.toFixed(2) + '</div></div>' +
        '</div>' +
        '<div class="form-group">' +
          '<label class="form-label">Country / Region</label>' +
          '<select class="form-select" id="countrySelect">' + countryOptions + '</select>' +
        '</div>' +
      '</div>' +
      '<div class="modal-footer">' +
        '<button class="btn btn-secondary" onclick="closeBuyModal()">Cancel</button>' +
        '<button class="btn btn-primary" id="finalBuyBtn" onclick="executeBuyNumber()"><i class="fas fa-phone-alt"></i> Get Number</button>' +
      '</div>' +
    '</div>' +
  '</div>';

  var existing = document.getElementById('buyModalOverlay');
  if (existing) existing.remove();

  document.body.insertAdjacentHTML('beforeend', modalHTML);
};

window.closeBuyModal = function() {
  var modal = document.getElementById('buyModalOverlay');
  if (modal) modal.remove();
  window.selectedBuyService = null;
};

window.executeBuyNumber = function() {
  if (!window.selectedBuyService || !window.selectedBuyService.id) {
    showToast('Please select a service.', 'error');
    return;
  }

  // ===== FIX: CORRECTLY DEFINE VARIABLES =====
  var serviceCode = window.selectedBuyService.id;
  var serviceName = window.selectedBuyService.name;
  var servicePrice = window.selectedBuyService.price;
  var userEmail = (typeof getUserEmail === 'function') ? getUserEmail() : '';
  
  var countryDropdown = document.getElementById('countrySelect');
  var countryCode = countryDropdown ? countryDropdown.value : 'us';

  console.log("EXECUTING BUY -> Service ID:", serviceCode, "| Country:", countryCode);

  var btn = document.getElementById('finalBuyBtn');
  if (btn) { btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Buying...'; btn.disabled = true; }

  fetch('/api/numbers/request', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: userEmail,
      serviceName: serviceName,
      serviceId: serviceCode,
      countryCode: countryCode,
      cost: servicePrice
    })
  })
  .then(function(res) { return res.json(); })
  .then(function(data) {
    if (data.error) {
      showToast(data.error, 'error');
    } else {
      showToast('Number purchased successfully!', 'success');
      closeBuyModal();
      if (typeof loadBalance === 'function') loadBalance();
      if (typeof loadNumbers === 'function') {
         loadNumbers().then(function() {
            if (typeof renderMainContent === 'function') renderMainContent();
         });
      }
    }
  })
  .catch(function(err) {
    console.error("Buy error:", err);
    showToast('Failed to connect to server.', 'error');
  })
  .finally(function() {
    if (btn) {
      btn.innerHTML = '<i class="fas fa-phone-alt"></i> Get Number';
      btn.disabled = false;
    }
  });
};