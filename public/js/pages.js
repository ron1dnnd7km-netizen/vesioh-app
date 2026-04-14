function renderNumbersPage(main) {
  var filtered = currentFilter === 'all'
    ? activeNumbers
    : activeNumbers.filter(function(n) { return n.status === currentFilter; });

  var activeCount = activeNumbers.filter(function(n) { return n.status !== 'expired'; }).length;
  var waitCount = activeNumbers.filter(function(n) { return n.status === 'waiting'; }).length;
  var recvCount = activeNumbers.filter(function(n) { return n.status === 'received'; }).length;
  var expCount = activeNumbers.filter(function(n) { return n.status === 'expired'; }).length;

  main.innerHTML = '<div class="page-header">' +
    '<h1 class="page-title">Active Numbers</h1>' +
    '<div class="page-actions">' +
    '<button class="btn btn-secondary" onclick="refreshAllNumbers()"><i class="fas fa-sync-alt"></i> Refresh</button>' +
    '<button class="btn btn-primary" onclick="openModal()"><i class="fas fa-plus"></i> Get Number</button>' +
    '</div></div>' +

    '<div class="stats-grid">' +
    '<div class="stat-card"><div class="stat-label">Active Numbers</div><div class="stat-value green">' + activeCount + '</div><div class="stat-change up"><i class="fas fa-arrow-up"></i> Real-time</div></div>' +
    '<div class="stat-card"><div class="stat-label">Waiting for SMS</div><div class="stat-value yellow">' + waitCount + '</div><div class="stat-change up"><i class="fas fa-clock"></i> In progress</div></div>' +
    '<div class="stat-card"><div class="stat-label">Codes Received</div><div class="stat-value blue">' + recvCount + '</div><div class="stat-change up"><i class="fas fa-check"></i> Today</div></div>' +
    '<div class="stat-card"><div class="stat-label">Expired</div><div class="stat-value red">' + expCount + '</div><div class="stat-change down"><i class="fas fa-times"></i> Timed out</div></div>' +
    '</div>' +

    '<div class="section-header"><div class="section-title">Number List <span class="count-badge">' + filtered.length + '</span></div>' +
    '<div class="filter-tabs">' +
    '<button class="filter-tab ' + (currentFilter === 'all' ? 'active' : '') + '" onclick="setFilter(\'all\')">All</button>' +
    '<button class="filter-tab ' + (currentFilter === 'waiting' ? 'active' : '') + '" onclick="setFilter(\'waiting\')">Waiting</button>' +
    '<button class="filter-tab ' + (currentFilter === 'received' ? 'active' : '') + '" onclick="setFilter(\'received\')">Received</button>' +
    '<button class="filter-tab ' + (currentFilter === 'expired' ? 'active' : '') + '" onclick="setFilter(\'expired\')">Expired</button>' +
    '</div></div>' +

    '<div class="active-numbers">' +
    (filtered.length === 0
      ? '<div class="empty-state"><i class="fas fa-inbox"></i><h3>No numbers found</h3><p>Get a new virtual number to receive SMS codes</p></div>'
      : filtered.map(renderNumberCard).join('')) +
    '</div>' +

    '<div style="margin-top:20px;"><div class="section-header"><div class="section-title">Available Services</div></div>' +
    '<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:12px;">' +
    getDashboardServiceListHTML() +
    '</div></div>';
}

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
    { name: 'WhatsApp', icon: 'fab fa-whatsapp', color: '#25d366', bg: 'rgba(37,211,102,0.1)', price: '0.70', id: 'wa-us' },
    { name: 'Telegram', icon: 'fab fa-telegram-plane', color: '#24a1de', bg: 'rgba(36,161,222,0.1)', price: '0.45', id: 'tg' },
    { name: 'Facebook', icon: 'fab fa-facebook-f', color: '#1877f2', bg: 'rgba(24,119,242,0.1)', price: '0.50', id: 'fb-us' },
    { name: 'Instagram', icon: 'fab fa-instagram', color: '#e1306c', bg: 'rgba(225,48,108,0.1)', price: '0.60', id: 'ig' },
    { name: 'Google', icon: 'fab fa-google', color: '#4285f4', bg: 'rgba(66,133,244,0.1)', price: '0.35', id: 'google' },
    { name: 'Twitter / X', icon: 'fab fa-x-twitter', color: '#1da1f2', bg: 'rgba(29,161,242,0.1)', price: '0.55', id: 'twitter' },
    { name: 'TikTok', icon: 'fab fa-tiktok', color: '#cc0044', bg: 'rgba(255,0,80,0.06)', price: '0.55', id: 'tiktok' },
    { name: 'Discord', icon: 'fab fa-discord', color: '#5865f2', bg: 'rgba(88,101,242,0.1)', price: '0.40', id: 'discord' },
    { name: 'Amazon', icon: 'fab fa-amazon', color: '#e68a00', bg: 'rgba(255,153,0,0.1)', price: '0.90', id: 'amazon' },
    { name: 'Microsoft', icon: 'fab fa-microsoft', color: '#0078d4', bg: 'rgba(0,120,212,0.1)', price: '0.50', id: 'ms' },
    { name: 'Fiverr', icon: 'fab fa-font-awesome', color: '#00af50', bg: 'rgba(0,175,80,0.1)', price: '0.80', id: 'fiverr' },
    { name: 'PayPal', icon: 'fab fa-paypal', color: '#003087', bg: 'rgba(0,48,135,0.1)', price: '0.85', id: 'paypal' }
  ];
  return items.map(function(s) {
    return '<div style="padding:16px 12px;background:var(--bg-card);border:1px solid var(--border);border-radius:12px;text-align:center;box-shadow:var(--shadow-sm);cursor:pointer;transition:all 0.2s;" ' +
      'onmouseover="this.style.boxShadow=\'var(--shadow-md)\';this.style.borderColor=\'var(--accent)\'" ' +
      'onmouseout="this.style.boxShadow=\'var(--shadow-sm)\';this.style.borderColor=\'var(--border)\'" ' +
      'onclick="openModal(services.find(function(x){return x.id===\'' + s.id + '\'}))">' +
      '<div style="width:40px;height:40px;border-radius:10px;background:' + s.bg + ';display:flex;align-items:center;justify-content:center;margin:0 auto 10px;font-size:16px;color:' + s.color + ';">' +
      '<i class="' + s.icon + '"></i></div>' +
      '<div style="font-size:12px;font-weight:600;margin-bottom:4px;">' + s.name + '</div>' +
      '<div style="font-size:13px;font-weight:700;color:var(--accent);">$' + s.price + '</div></div>';
  }).join('');
}

function renderHistoryPage(main) {
  var rows = '';
  if (historyData.length === 0) {
    rows = '<div class="empty-state"><i class="fas fa-history"></i><h3>No history yet</h3><p>Your SMS code history will appear here</p></div>';
  } else {
    rows = historyData.map(function(h) {
      var codeHTML = h.code ? '<div class="history-code">' + h.code + '</div>' : '';
      var serviceName = h.service_name || 'Unknown Service';
      return '<div class="history-item"><div class="history-icon other"><i class="fas fa-sms"></i></div>' +
        '<div class="history-info"><div class="history-service">' + serviceName + '</div>' +
        '<div class="history-detail"><span style="font-family:JetBrains Mono,monospace;">' + h.phone + '</span><span>$' + h.cost.toFixed(2) + '</span></div></div>' +
        codeHTML + '<span class="history-status ' + h.status + '">' + (h.status === 'success' ? 'Success' : 'Failed') + '</span></div>';
    }).join('');
  }
  main.innerHTML = '<div class="page-header"><h1 class="page-title">SMS History</h1>' +
    '<div class="page-actions"><button class="btn btn-secondary" onclick="showToast(\'Export coming soon\',\'info\')"><i class="fas fa-download"></i> Export</button></div></div>' +
    '<div class="history-section"><div class="history-list">' + rows + '</div></div>';
}

function renderPricingPage(main) {
  var tiers = [
    { name: 'Starter', price: '5.00', features: ['10 SMS codes', 'Basic services', 'US numbers only', 'Email support'], hl: false },
    { name: 'Pro', price: '15.00', features: ['50 SMS codes', 'All services', 'Multi-country', 'Priority support', 'API access'], hl: true },
    { name: 'Business', price: '50.00', features: ['200 SMS codes', 'All services', 'All countries', 'Dedicated support', 'API access', 'Webhooks', 'Bulk orders'], hl: false }
  ];
  main.innerHTML = '<div class="page-header"><h1 class="page-title">Pricing Plans</h1></div>' +
    '<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:20px;max-width:900px;">' +
    tiers.map(function(t) {
      var cls = t.hl ? 'stat-card pricing-highlight' : 'stat-card';
      var titleColor = t.hl ? 'var(--accent)' : 'var(--text-muted)';
      var valueColor = t.hl ? 'var(--accent)' : 'var(--text-primary)';
      var btnCls = t.hl ? 'btn btn-primary' : 'btn btn-secondary';
      var btnText = t.hl ? 'Get Started' : 'Select Plan';
      var feats = t.features.map(function(f) {
        return '<div style="display:flex;align-items:center;gap:8px;font-size:13px;color:var(--text-secondary);"><i class="fas fa-check" style="color:var(--accent);font-size:10px;"></i> ' + f + '</div>';
      }).join('');
      return '<div class="' + cls + '" style="padding:28px 24px;">' +
        '<div style="font-size:11px;text-transform:uppercase;letter-spacing:1.5px;color:' + titleColor + ';font-weight:600;margin-bottom:12px;">' + t.name + '</div>' +
        '<div style="font-size:36px;font-weight:700;color:' + valueColor + ';letter-spacing:-2px;">$' + t.price + '</div>' +
        '<div style="font-size:12px;color:var(--text-muted);margin-top:4px;margin-bottom:20px;">credits</div>' +
        '<div style="display:flex;flex-direction:column;gap:10px;">' + feats + '</div>' +
        '<button class="' + btnCls + '" style="width:100%;margin-top:24px;justify-content:center;" onclick="showToast(\'Coming soon\',\'info\')">' + btnText + '</button></div>';
    }).join('') + '</div>';
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
  var faqs = [
    { q: 'How long does it take to receive an SMS code?', a: 'Most codes arrive within 10 seconds to 3 minutes. Some services may take longer.' },
    { q: 'What happens if I don\'t receive a code?', a: 'If no code is received within 20 minutes, the number expires and cost is refunded automatically.' },
    { q: 'Can I use the same number for multiple services?', a: 'Each number is assigned to a single service. You need a new number for each service.' },
    { q: 'Which countries and services are supported?', a: 'We support 50+ countries and 200+ services including WhatsApp, Facebook, Google, Telegram.' },
    { q: 'How do I add balance to my account?', a: 'Click "Add Funds" in the navbar. We accept cryptocurrency via Cryptomus (USDT, BTC, ETH).' }
  ];
  main.innerHTML = '<div class="page-header"><h1 class="page-title">Help Center</h1></div>' +
    '<div style="max-width:700px;display:flex;flex-direction:column;gap:12px;">' +
    faqs.map(function(f) {
      return '<div class="stat-card" style="cursor:pointer;" onclick="toggleFaq(this)">' +
        '<div style="display:flex;align-items:center;justify-content:space-between;">' +
        '<h3 style="font-size:14px;font-weight:600;">' + f.q + '</h3>' +
        '<i class="fas fa-chevron-down" style="color:var(--text-muted);font-size:12px;transition:transform 0.2s;"></i></div>' +
        '<div class="faq-answer"><p style="font-size:13px;color:var(--text-secondary);line-height:1.7;padding-top:12px;">' + f.a + '</p></div></div>';
    }).join('') + '</div>';
}

function toggleFaq(el) {
  var answer = el.querySelector('.faq-answer');
  var icon = el.querySelector('.fa-chevron-down');
  if (!answer.style.maxHeight || answer.style.maxHeight === '0px') {
    answer.style.maxHeight = '200px';
    icon.style.transform = 'rotate(180deg)';
  } else {
    answer.style.maxHeight = '0px';
    icon.style.transform = 'rotate(0)';
  }
}

function renderDepositPage(main) {
  main.innerHTML = '<div class="page-header"><h1 class="page-title">Add Balance</h1></div>' +
    '<div style="max-width:600px;">' +
    '<div class="stat-card" style="margin-bottom:24px;padding:24px;">' +
    '<div style="display:flex;align-items:center;justify-content:space-between;">' +
    '<div><div style="font-size:12px;color:var(--text-muted);text-transform:uppercase;letter-spacing:1px;font-weight:600;margin-bottom:4px;">Current Balance</div>' +
    '<div style="font-size:32px;font-weight:700;color:var(--accent);letter-spacing:-1px;" id="depositCurrentBalance">$0.00</div></div>' +
    '<div style="width:56px;height:56px;background:var(--accent-dim);border-radius:14px;display:flex;align-items:center;justify-content:center;">' +
    '<i class="fas fa-wallet" style="font-size:22px;color:var(--accent);"></i></div></div></div>' +
    '<div class="stat-card" style="margin-bottom:20px;padding:24px;">' +
    '<h3 style="font-size:14px;font-weight:600;margin-bottom:16px;">Select Amount</h3>' +
    '<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-bottom:16px;">' +
    '<div class="dep-amt" onclick="selectDepositAmount(5,this)" style="padding:14px;background:var(--bg-primary);border:1px solid var(--border);border-radius:10px;text-align:center;cursor:pointer;transition:all 0.2s;" onmouseover="this.style.borderColor=\'var(--accent)\'" onmouseout="if(!this.dataset.sel)this.style.borderColor=\'var(--border)\'"><div style="font-size:18px;font-weight:700;">$5</div></div>' +
    '<div class="dep-amt" onclick="selectDepositAmount(10,this)" style="padding:14px;background:var(--bg-primary);border:1px solid var(--border);border-radius:10px;text-align:center;cursor:pointer;transition:all 0.2s;" onmouseover="this.style.borderColor=\'var(--accent)\'" onmouseout="if(!this.dataset.sel)this.style.borderColor=\'var(--border)\'"><div style="font-size:18px;font-weight:700;">$10</div></div>' +
    '<div class="dep-amt" data-sel="1" onclick="selectDepositAmount(20,this)" style="padding:14px;background:var(--accent-dim);border:2px solid var(--accent);border-radius:10px;text-align:center;cursor:pointer;transition:all 0.2s;"><div style="font-size:18px;font-weight:700;color:var(--accent);">$20</div><div style="font-size:10px;color:var(--accent);">Popular</div></div>' +
    '<div class="dep-amt" onclick="selectDepositAmount(50,this)" style="padding:14px;background:var(--bg-primary);border:1px solid var(--border);border-radius:10px;text-align:center;cursor:pointer;transition:all 0.2s;" onmouseover="this.style.borderColor=\'var(--accent)\'" onmouseout="if(!this.dataset.sel)this.style.borderColor=\'var(--border)\'"><div style="font-size:18px;font-weight:700;">$50</div></div>' +
    '<div class="dep-amt" onclick="selectDepositAmount(100,this)" style="padding:14px;background:var(--bg-primary);border:1px solid var(--border);border-radius:10px;text-align:center;cursor:pointer;transition:all 0.2s;" onmouseover="this.style.borderColor=\'var(--accent)\'" onmouseout="if(!this.dataset.sel)this.style.borderColor=\'var(--border)\'"><div style="font-size:18px;font-weight:700;">$100</div></div>' +
    '<div style="padding:14px;background:var(--bg-primary);border:1px solid var(--border);border-radius:10px;text-align:center;">' +
    '<div style="font-size:11px;color:var(--text-muted);margin-bottom:6px;">Custom</div>' +
    '<input type="number" id="customAmount" placeholder="$" min="1" max="1000" style="width:100%;border:none;background:none;text-align:center;font-size:18px;font-weight:700;font-family:inherit;color:var(--text-primary);outline:none;" oninput="selectCustomAmount(this.value)">' +
    '</div></div></div>' +
    '<div class="stat-card" style="margin-bottom:20px;padding:24px;">' +
    '<h3 style="font-size:14px;font-weight:600;margin-bottom:16px;">Payment Method</h3>' +
    '<div style="display:flex;flex-direction:column;gap:10px;">' +
    '<div class="dep-meth" data-sel="1" onclick="selectPaymentMethod(\'usdt\',this)" style="display:flex;align-items:center;gap:14px;padding:14px 16px;background:var(--accent-dim);border:2px solid var(--accent);border-radius:12px;cursor:pointer;transition:all 0.2s;">' +
    '<div style="width:40px;height:40px;background:#26a17b;border-radius:8px;display:flex;align-items:center;justify-content:center;"><i class="fas fa-dollar-sign" style="color:#fff;font-size:18px;"></i></div>' +
    '<div style="flex:1;"><div style="font-size:14px;font-weight:600;">USDT</div><div style="font-size:11px;color:var(--text-muted);">Tether - Lowest fees</div></div>' +
    '<div style="width:20px;height:20px;border-radius:50%;border:2px solid var(--accent);display:flex;align-items:center;justify-content:center;"><div style="width:10px;height:10px;border-radius:50%;background:var(--accent);"></div></div></div>' +
    '<div class="dep-meth" onclick="selectPaymentMethod(\'btc\',this)" style="display:flex;align-items:center;gap:14px;padding:14px 16px;background:var(--bg-primary);border:1px solid var(--border);border-radius:12px;cursor:pointer;transition:all 0.2s;" onmouseover="this.style.borderColor=\'var(--text-muted)\'" onmouseout="if(!this.dataset.sel)this.style.borderColor=\'var(--border)\'">' +
    '<div style="width:40px;height:40px;background:#f7931a;border-radius:8px;display:flex;align-items:center;justify-content:center;"><i class="fab fa-bitcoin" style="color:#fff;font-size:18px;"></i></div>' +
    '<div style="flex:1;"><div style="font-size:14px;font-weight:600;">Bitcoin</div><div style="font-size:11px;color:var(--text-muted);">BTC</div></div>' +
    '<div style="width:20px;height:20px;border-radius:50%;border:2px solid var(--border);display:flex;align-items:center;justify-content:center;"><div style="width:10px;height:10px;border-radius:50%;background:transparent;"></div></div></div>' +
    '<div class="dep-meth" onclick="selectPaymentMethod(\'eth\',this)" style="display:flex;align-items:center;gap:14px;padding:14px 16px;background:var(--bg-primary);border:1px solid var(--border);border-radius:12px;cursor:pointer;transition:all 0.2s;" onmouseover="this.style.borderColor=\'var(--text-muted)\'" onmouseout="if(!this.dataset.sel)this.style.borderColor=\'var(--border)\'">' +
    '<div style="width:40px;height:40px;background:#627eea;border-radius:8px;display:flex;align-items:center;justify-content:center;"><i class="fab fa-ethereum" style="color:#fff;font-size:18px;"></i></div>' +
    '<div style="flex:1;"><div style="font-size:14px;font-weight:600;">Ethereum</div><div style="font-size:11px;color:var(--text-muted);">ETH</div></div>' +
    '<div style="width:20px;height:20px;border-radius:50%;border:2px solid var(--border);display:flex;align-items:center;justify-content:center;"><div style="width:10px;height:10px;border-radius:50%;background:transparent;"></div></div></div>' +
    '</div></div>' +
    '<button class="btn btn-primary" style="width:100%;justify-content:center;padding:16px;font-size:15px;margin-bottom:24px;" onclick="processDeposit()" id="depositPayBtn">' +
    '<i class="fas fa-lock" style="font-size:13px;"></i> Pay $20.00 Securely</button>' +
    '<div style="display:flex;align-items:center;gap:8px;justify-content:center;margin-bottom:24px;">' +
    '<i class="fas fa-shield-alt" style="color:var(--text-muted);font-size:12px;"></i>' +
    '<span style="font-size:11px;color:var(--text-muted);">You will be redirected to a secure payment page. Balance updates automatically.</span></div>' +
    '<div class="stat-card" style="padding:24px;">' +
    '<h3 style="font-size:14px;font-weight:600;margin-bottom:16px;">Recent Deposits</h3>' +
    '<div id="depositHistoryList"><div style="text-align:center;padding:20px;color:var(--text-muted);font-size:13px;">Loading...</div></div>' +
    '</div></div>';
}

var selectedDepositAmount = 20;
var selectedPaymentMethod = 'usdt';

function selectDepositAmount(amount, el) {
  selectedDepositAmount = amount;
  document.getElementById('customAmount').value = '';
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
    var dot = opt.querySelector('div:last-child div');
    if (dot) dot.style.background = 'transparent';
    var circle = opt.querySelector('div:last-child');
    if (circle) circle.style.borderColor = 'var(--border)';
  });
  el.style.background = 'var(--accent-dim)';
  el.style.border = '2px solid var(--accent)';
  el.dataset.sel = '1';
  var dot = el.querySelector('div:last-child div');
  if (dot) dot.style.background = 'var(--accent)';
  var circle = el.querySelector('div:last-child');
  if (circle) circle.style.borderColor = 'var(--accent)';
}

function updatePayButton() {
  var btn = document.getElementById('depositPayBtn');
  if (btn) btn.innerHTML = '<i class="fas fa-lock" style="font-size:13px;"></i> Pay $' + selectedDepositAmount.toFixed(2) + ' Securely';
}

async function processDeposit() {
  if (selectedDepositAmount < 2) {
    showToast('Minimum deposit is $2.00', 'error');
    return;
  }
  var btn = document.getElementById('depositPayBtn');
  btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Creating payment...';
  btn.disabled = true;
  try {
    var res = await fetch('/api/deposit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: getUserEmail(),
        amount: selectedDepositAmount,
        method: selectedPaymentMethod
      })
    });
    var data = await res.json();
    if (data.error) {
      showToast(data.error, 'error');
    } else if (data.url) {
      window.location.href = data.url;
    } else {
      showToast('Unexpected response', 'error');
    }
  } catch (err) {
    showToast('Connection error. Try again.', 'error');
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
      var methodLabels = { usdt: 'USDT', btc: 'BTC', eth: 'ETH', stripe: 'Card', paypal: 'PayPal' };
      var methodLabel = methodLabels[d.method] || d.method;
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