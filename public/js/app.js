/* v2 */
// ====== SAFE GLOBAL STATE ======
if (!window.currentPage) window.currentPage = 'numbers';
if (!window.activeNumbers) window.activeNumbers = [];
if (!window.historyData) window.historyData = [];
if (!window.currentFilter) window.currentFilter = 'all';
if (!window.refreshInterval) window.refreshInterval = null;
if (!window.autoRefreshInterval) window.autoRefreshInterval = null;

// ====== DOM READY ======
document.addEventListener('DOMContentLoaded', function() {
  initSidebar();
  initNavigation();
  initSearch();
  initDropdowns();
  initKeyboard();
  changeLanguage(currentLang);
  checkDepositReturn();
  startIntervals();
  bootSequence();
});

// ====== MOBILE SIDEBAR (dropdown style) ======
function initSidebar() {
  var hamburger = document.getElementById('hamburger');
  var sidebar = document.getElementById('sidebar');
  var overlay = document.getElementById('sidebarOverlay');
  if (!hamburger || !sidebar) return;

  if (!overlay) {
    overlay = document.createElement('div');
    overlay.id = 'sidebarOverlay';
    overlay.className = 'sidebar-overlay';
    document.body.appendChild(overlay);
  }

  hamburger.addEventListener('click', function(e) {
    e.stopPropagation();
    if (sidebar.classList.contains('active')) {
      closeMobileSidebar();
    } else {
      var emailEl = document.getElementById('mobileEmail');
      if (emailEl && typeof getUserEmail === 'function') emailEl.textContent = getUserEmail();
      sidebar.classList.add('active');
      overlay.style.display = 'block';
      requestAnimationFrame(function() { overlay.classList.add('visible'); });
    }
  });

  overlay.addEventListener('click', closeMobileSidebar);

  var mobileLangBtn = document.getElementById('mobileLangBtn');
  var mobileLangDrop = document.getElementById('mobileLangDrop');
  if (mobileLangBtn && mobileLangDrop) {
    mobileLangBtn.addEventListener('click', function(e) {
      e.stopPropagation();
      var isOpen = mobileLangDrop.classList.contains('show');
      mobileLangDrop.classList.toggle('show', !isOpen);
      mobileLangBtn.classList.toggle('open', !isOpen);
    });
  }

  if (sidebar) {
    sidebar.addEventListener('click', function(e) {
      if (mobileLangBtn && mobileLangDrop) {
        if (!mobileLangBtn.contains(e.target) && !mobileLangDrop.contains(e.target)) {
          mobileLangDrop.classList.remove('show');
          mobileLangBtn.classList.remove('open');
        }
      }
    });
  }
}

function closeMobileSidebar() {
  var sidebar = document.getElementById('sidebar');
  var overlay = document.getElementById('sidebarOverlay');
  if (sidebar) sidebar.classList.remove('active');
  if (overlay) {
    overlay.classList.remove('visible');
    setTimeout(function() { overlay.style.display = 'none'; }, 200);
  }
  var mobileLangDrop = document.getElementById('mobileLangDrop');
  var mobileLangBtn = document.getElementById('mobileLangBtn');
  if (mobileLangDrop) mobileLangDrop.classList.remove('show');
  if (mobileLangBtn) mobileLangBtn.classList.remove('open');
}

// ====== Aliases for mobile HTML onclick handlers ======
window.handleNav = function(page) { goToPage(page); };
window.closeSidebar = function() { closeMobileSidebar(); };

// ====== Mobile language setter ======
window.setMobileLang = function(name, flag) {
  var mName = document.getElementById('mobileLangName');
  if (mName) mName.textContent = name;

  var mobileLangDrop = document.getElementById('mobileLangDrop');
  var mobileLangBtn = document.getElementById('mobileLangBtn');
  if (mobileLangDrop) mobileLangDrop.classList.remove('show');
  if (mobileLangBtn) mobileLangBtn.classList.remove('open');

  var dFlag = document.getElementById('desktopLangFlag');
  var dLabel = document.getElementById('desktopLangLabel');
  if (dFlag) dFlag.textContent = flag;
  if (dLabel) dLabel.textContent = name;

  var langMap = { 'English': 'en', 'العربية': 'ar', 'Français': 'fr', 'Español': 'es', 'Deutsch': 'de', 'Türkçe': 'tr' };
  var langCode = langMap[name] || 'en';
  changeLanguage(langCode);

  closeMobileSidebar();
};

window.toggleMobileLang = function() {
  var mobileLangBtn = document.getElementById('mobileLangBtn');
  var mobileLangDrop = document.getElementById('mobileLangDrop');
  if (!mobileLangBtn || !mobileLangDrop) return;
  var isOpen = mobileLangDrop.classList.contains('show');
  mobileLangDrop.classList.toggle('show', !isOpen);
  mobileLangBtn.classList.toggle('open', !isOpen);
};

// ====== NAVIGATION ======
function getPageFromHash() {
  var hash = window.location.hash.replace('#', '').trim();
  var pageMap = { 'numbers': 'numbers', 'home': 'numbers', 'add-funds': 'deposit', 'deposit': 'deposit', 'history': 'history', 'api': 'api', 'referral': 'settings', 'settings': 'settings', 'help': 'help', 'contacts': 'contacts' };
  return pageMap[hash] || hash || 'numbers';
}

function updateHash(page) {
  if (window.location.hash.replace('#', '') !== page) {
    window.history.replaceState(null, '', '#' + page);
  }
}

function goToPage(page) {
  closeMobileSidebar();
  var pageMap = { 'home': 'numbers', 'add-funds': 'deposit' };
  page = pageMap[page] || page;
  window.currentPage = page;
  updateHash(page);

  document.querySelectorAll('.nav-link').forEach(function(l) { l.classList.remove('active'); });
  var btn = document.querySelector(".nav-link[data-page='" + page + "']");
  if (btn) btn.classList.add('active');

  document.querySelectorAll('.dropdown-menu button[data-page]').forEach(function(b) { b.classList.remove('active-link'); });
  var mobileBtn = document.querySelector(".dropdown-menu button[data-page='" + page + "']");
  if (mobileBtn) mobileBtn.classList.add('active-link');

  Promise.resolve(preLoadPageData(page)).then(function() {
    renderMainContent();
  });
}

function navigateTo(page) { goToPage(page); }

function initNavigation() {
  document.querySelectorAll('.nav-link[data-page]').forEach(function(link) {
    link.addEventListener('click', function() { goToPage(this.dataset.page); });
  });
}

window.addEventListener('hashchange', function() {
  var page = getPageFromHash();
  if (page !== window.currentPage) goToPage(page);
});

function preLoadPageData(page) {
  if (page === 'history') {
    return loadHistory();
  } else if (page === 'numbers') {
    return loadNumbers();
  } else if (page === 'deposit') {
    var balancePromise = loadBalance().then(function(b) {
      var el = document.getElementById('depositCurrentBalance');
      if (el) el.textContent = '$' + b.toFixed(2);
    });
    var historyPromise = (typeof loadDepositHistory === 'function') ? loadDepositHistory() : Promise.resolve();
    return Promise.all([balancePromise, historyPromise]);
  }
  return Promise.resolve();
}

// ====== SEARCH & DROPDOWNS ======
function initSearch() {
  var searchInput = document.getElementById('serviceSearch');
  if (searchInput) searchInput.addEventListener('input', function() { if (typeof renderSidebar === 'function') renderSidebar(this.value); });
}

function initDropdowns() {
  var userInfo = document.querySelector('.user-info');
  var langBtn = document.getElementById('desktopLangBtn');
  if (userInfo) userInfo.addEventListener('click', function(e) { e.stopPropagation(); toggleDropdown('.user-dropdown'); });
  if (langBtn) langBtn.addEventListener('click', function(e) { e.stopPropagation(); toggleDropdown('#desktopLangDrop'); });
  document.addEventListener('click', function(e) {
    if (!e.target.closest('.user-menu')) closeDropdown('.user-dropdown');
    if (!e.target.closest('.language-menu')) closeDropdown('#desktopLangDrop');
  });
}

function toggleDropdown(sel) { var d = document.querySelector(sel); if (d) d.style.display = d.style.display === 'block' ? 'none' : 'block'; }
function closeDropdown(sel) { var d = document.querySelector(sel); if (d) d.style.display = 'none'; }

function initKeyboard() {
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
      if (typeof closeModal === 'function') closeModal();
      closeDropdown('.user-dropdown');
      closeDropdown('#desktopLangDrop');
      closeMobileSidebar();
    }
  });
}

// ====== INTERVALS ======
function startIntervals() {
  refreshInterval = setInterval(checkExpiredNumbers, 1000);
  autoRefreshInterval = setInterval(autoRefreshNumbers, 5000);
}

function stopIntervals() {
  if (refreshInterval) clearInterval(refreshInterval);
  if (autoRefreshInterval) clearInterval(autoRefreshInterval);
}

async function checkExpiredNumbers() {
  if (!window.activeNumbers || window.activeNumbers.length === 0) return;
  var changed = false;
  window.activeNumbers.forEach(function(n) {
    var timeLeft = n.time_left ?? n.timeLeft ?? 0;
    var totalTime = n.total_time ?? n.totalTime ?? 1;
    if ((n.status === 'waiting' || n.status === 'received') && timeLeft > 0) {
      var newTime = timeLeft - 1; n.time_left = newTime; n.timeLeft = newTime;

      var timerEl = document.getElementById('timer-' + n.id);
      if (timerEl) timerEl.textContent = formatTime(newTime);
      var card = document.getElementById('card-' + n.id);
      if (card) { var bar = card.querySelector('.timer-bar-fill'); if (bar) bar.style.width = (newTime / totalTime * 100) + '%'; }

      var activeTimer = document.getElementById('timer-active-' + n.id);
      if (activeTimer) activeTimer.textContent = formatTime(newTime);

      var waitTimer = document.getElementById('timer-wait-' + n.id);
      if (waitTimer) waitTimer.textContent = formatTime(newTime);

      if (activeTimer) {
        var activeCard = activeTimer.closest('div[style*="border-radius:14px"]');
        if (activeCard) {
          var bars = activeCard.querySelectorAll('div[style*="height:3px"]');
          if (bars[0]) { var fill = bars[0].firstElementChild; if (fill) fill.style.width = (newTime / totalTime * 100) + '%'; }
        }
      }
      if (waitTimer) {
        var waitCard = waitTimer.closest('div[style*="border-radius:14px"]');
        if (waitCard) {
          var wBars = waitCard.querySelectorAll('div[style*="height:3px"]');
          if (wBars[0]) { var wFill = wBars[0].firstElementChild; if (wFill) wFill.style.width = (newTime / totalTime * 100) + '%'; }
        }
      }

      if (newTime <= 0) { n.status = 'expired'; changed = true; fetch('/api/numbers/' + n.id + '/expire', { method: 'POST' }).catch(function() {}); showToast(translations[currentLang]['Number expired'], 'error'); }
    }
  });
  if (changed) { await loadBalance(); await loadNumbers(); if (window.currentPage === 'numbers') renderMainContent(); }
}

async function autoRefreshNumbers() {
  // Only auto-refresh on the numbers page to fetch fresh data from server
  if (window.currentPage !== 'numbers' || !window.activeNumbers) return;
  var needsRefresh = window.activeNumbers.some(function(n) { return n.status === 'waiting' || n.status === 'received'; });
  if (needsRefresh) {
    await loadNumbers();
    // Only re-render if we're still on numbers page
    if (window.currentPage === 'numbers') renderMainContent();
  }
}

// ====== UTILITIES ======
function formatTime(seconds) { var m = Math.floor(seconds / 60); var s = seconds % 60; return String(m).padStart(2, '0') + ':' + String(s).padStart(2, '0'); }

function showToast(message, type) {
  type = type || 'success'; var container = document.getElementById('toastContainer'); if (!container) return;
  var toast = document.createElement('div'); toast.className = 'toast ' + type;
  var icons = { success: 'fa-check-circle', error: 'fa-exclamation-circle', info: 'fa-info-circle' };
  var colors = { success: 'var(--accent)', error: 'var(--danger)', info: 'var(--info)' };
  toast.innerHTML = '<i class="fas ' + (icons[type]||icons.info) + '" style="color:' + (colors[type]||colors.info) + '"></i> ' + message;
  container.appendChild(toast); setTimeout(function() { if (toast.parentNode) toast.remove(); }, 3000);
}

function updateBalanceDisplay(amount) { var el = document.getElementById('balanceAmount'); if (el) el.textContent = '$' + amount.toFixed(2); }
window.syncBalance = updateBalanceDisplay;

// ====== API CALLS ======
async function loadBalance() {
  if (typeof getUserEmail !== 'function') return 0;
  try { var res = await fetch('/api/user/' + getUserEmail()); if (!res.ok) throw new Error(); var data = await res.json(); updateBalanceDisplay(data.balance); return data.balance; } catch(e) { return 0; }
}

async function loadNumbers() {
  if (typeof getUserEmail !== 'function') { window.activeNumbers = []; return; }
  try { var res = await fetch('/api/numbers/' + getUserEmail()); if (!res.ok) throw new Error(); window.activeNumbers = await res.json(); } catch(e) { window.activeNumbers = []; }
}

async function loadHistory() {
  if (typeof getUserEmail !== 'function') { window.historyData = []; return; }
  try {
    var res = await fetch('/api/history/' + getUserEmail());
    if (!res.ok) throw new Error('HTTP ' + res.status);
    window.historyData = await res.json();
  } catch(e) { window.historyData = []; }
}

// ====== MAIN CONTENT ROUTER ======
function renderMainContent() {
  var main = document.getElementById('mainContent');
  if (!main) return;
  var page = window.currentPage;
  var functionName = 'render' + page.charAt(0).toUpperCase() + page.slice(1) + 'Page';
  if (typeof window[functionName] === 'function') {
    window[functionName](main);
  } else {
    main.innerHTML = '<div class="empty-state"><i class="fas fa-exclamation-triangle"></i><p>Page "' + page + '" is missing.</p></div>';
  }
  if (page === 'deposit') {
    loadBalance().then(function(b) { var el = document.getElementById('depositCurrentBalance'); if (el) el.textContent = '$' + b.toFixed(2); });
    if (typeof loadDepositHistory === 'function') loadDepositHistory();
  }
}

// ====== NUMBER OPERATIONS ======
function copyNumber(phone) {
  var cleanPhone = phone.replace(/\s/g, '');
  navigator.clipboard.writeText(cleanPhone).then(function() { showToast(translations[currentLang]['Number copied to clipboard'], 'success'); }).catch(function() { showToast(translations[currentLang]['Copy failed'], 'error'); });
}

async function cancelNumber(id) {
  if (!confirm(translations[currentLang]['Are you sure you want to cancel this number?'])) return;
  try { var res = await fetch('/api/numbers/' + id, { method: 'DELETE' }); if (!res.ok) throw new Error(); var data = await res.json(); if (data.error) { showToast(data.error, 'error'); return; } updateBalanceDisplay(data.balance); renderMainContent(); showToast(translations[currentLang]['Number cancelled, balance refunded'], 'info'); } catch(e) { showToast(translations[currentLang]['Error cancelling number'], 'error'); }
}

async function refreshNumber(id) {
  try { var res = await fetch('/api/numbers/' + id + '/expire', { method: 'POST' }); if (!res.ok) throw new Error(); renderMainContent(); showToast(translations[currentLang]['Requesting new number...'], 'info'); } catch(e) { showToast(translations[currentLang]['Error refreshing number'], 'error'); }
}

function setFilter(filter) { window.currentFilter = filter; renderMainContent(); }
function refreshAllNumbers() { showToast(translations[currentLang]['All numbers refreshed'], 'info'); renderMainContent(); }

// ====== DEPOSIT RETURN CHECK ======
function checkDepositReturn() {
  var params = new URLSearchParams(window.location.search); if (params.get('deposit') === 'success') { showToast(translations[currentLang]['Payment submitted! Balance will update after confirmation.'], 'info'); window.history.replaceState({}, '', window.location.pathname); }
}

// ====== USER ACTIONS ======
window.handleLogout = function() {
  closeMobileSidebar();
  showToast('Logging out...', 'info');
  if (typeof logout === 'function') logout();
};

window.handleDeleteAccount = function() {
  closeMobileSidebar();
  deleteAccount();
};

function deleteAccount() { if (confirm(translations[currentLang]['Are you sure you want to delete your account? This action cannot be undone.'])) showToast(translations[currentLang]['Account deletion not implemented yet'], 'error'); }

// ====== TRANSLATIONS ======
var translations = {
  en: { 'Home':'Home','History':'History','Pricing':'Pricing','API':'API','Help':'Help','Settings':'Settings','Contacts':'Contacts','Add Funds':'Add Funds','Logout':'Logout','Delete Account':'Delete Account','English':'English','Chinese':'Chinese','Russian':'Russian','Search services...':'Search services...','Get Virtual Number':'Get Virtual Number','Service':'Service','Select a service...':'Select a service...','Country / Region':'Country / Region','Select country...':'Select country...','Payment Method':'Payment Method','Cancel':'Cancel','Get Number':'Get Number','Number copied to clipboard':'Number copied to clipboard','Copy failed':'Copy failed','Number cancelled, balance refunded':'Number cancelled, balance refunded','Error cancelling number':'Error cancelling number','Requesting new number...':'Requesting new number...','Error refreshing number':'Error refreshing number','All numbers refreshed':'All numbers refreshed','Number expired, balance refunded':'Number expired, balance refunded','Payment submitted! Balance will update after confirmation.':'Payment submitted! Balance will update after confirmation.','Account deletion not implemented yet':'Account deletion not implemented yet','Are you sure you want to delete your account? This action cannot be undone.':'Are you sure you want to delete your account? This action cannot be undone.','Are you sure you want to cancel this number?':'Are you sure you want to cancel this number?','Language changed to':'Language changed to','Error':'Error','Success':'Success','Info':'Info' },
  zh: { 'Home':'首页','History':'历史','Pricing':'价格','API':'API','Help':'帮助','Settings':'设置','Contacts':'联系人','Add Funds':'充值','Logout':'登出','Delete Account':'删除账户','English':'英语','Chinese':'中文','Russian':'俄语','Search services...':'搜索服务...','Get Virtual Number':'获取虚拟号码','Service':'服务','Select a service...':'选择服务...','Country / Region':'国家/地区','Select country...':'选择国家...','Payment Method':'支付方式','Cancel':'取消','Get Number':'获取号码','Number copied to clipboard':'号码已复制到剪贴板','Copy failed':'复制失败','Number cancelled, balance refunded':'号码已取消，余额已退款','Error cancelling number':'取消号码时出错','Requesting new number...':'正在请求新号码...','Error refreshing number':'刷新号码时出错','All numbers refreshed':'所有号码已刷新','Number expired, balance refunded':'号码已过期，余额已退款','Payment submitted! Balance will update after confirmation.':'支付已提交！确认后余额将更新。','Account deletion not implemented yet':'账户删除功能尚未实现','Are you sure you want to delete your account? This action cannot be undone.':'确定要删除账户吗？此操作无法撤销。','Are you sure you want to cancel this number?':'确定要取消此号码吗？','Language changed to':'语言已更改为','Error':'错误','Success':'成功','Info':'信息' },
  ru: { 'Home':'Главная','History':'История','Pricing':'Цены','API':'API','Help':'Помощь','Settings':'Настройки','Contacts':'Контакты','Add Funds':'Пополнить','Logout':'Выйти','Delete Account':'Удалить аккаунт','English':'Английский','Chinese':'Китайский','Russian':'Русский','Search services...':'Поиск сервисов...','Get Virtual Number':'Получить виртуальный номер','Service':'Сервис','Select a service...':'Выберите сервис...','Country / Region':'Страна / Регион','Select country...':'Выберите страну...','Payment Method':'Способ оплаты','Cancel':'Отмена','Get Number':'Получить номер','Number copied to clipboard':'Номер скопирован','Copy failed':'Ошибка копирования','Number cancelled, balance refunded':'Номер отменен, баланс возвращен','Error cancelling number':'Ошибка отмены','Requesting new number...':'Запрос нового номера...','Error refreshing number':'Ошибка обновления','All numbers refreshed':'Все номера обновлены','Number expired, balance refunded':'Номер истек, баланс возвращен','Payment submitted! Balance will update after confirmation.':'Платеж отправлен! Баланс обновится после подтверждения.','Account deletion not implemented yet':'Удаление аккаунта пока не реализовано','Are you sure you want to delete your account? This action cannot be undone.':'Вы уверены? Это действие нельзя отменить.','Are you sure you want to cancel this number?':'Вы уверены, что хотите отменить этот номер?','Language changed to':'Язык изменен на','Error':'Ошибка','Success':'Успех','Info':'Информация' }
};

var currentLang = localStorage.getItem('language') || 'en';

var langData = {
  en: { flag: '🇺🇸', label: 'English' },
  ar: { flag: '🇸🇦', label: 'العربية' },
  fr: { flag: '🇫🇷', label: 'Français' },
  es: { flag: '🇪🇸', label: 'Español' },
  de: { flag: '🇩🇪', label: 'Deutsch' },
  tr: { flag: '🇹🇷', label: 'Türkçe' },
  zh: { flag: '🇨🇳', label: '中文' },
  ru: { flag: '🇷🇺', label: 'Русский' }
};

function changeLanguage(lang) {
  currentLang = lang;
  localStorage.setItem('language', lang);

  var info = langData[lang] || langData.en;

  var dFlag = document.getElementById('desktopLangFlag');
  var dLabel = document.getElementById('desktopLangLabel');
  if (dFlag) dFlag.textContent = info.flag;
  if (dLabel) dLabel.textContent = info.label;

  var langDropdown = document.getElementById('desktopLangDrop');
  if (langDropdown) {
    var html = '';
    var langs = ['en', 'ar', 'fr', 'es', 'de', 'tr', 'zh', 'ru'];
    langs.forEach(function(code) {
      var d = langData[code];
      if (d) html += '<button type="button" onclick="changeLanguage(\'' + code + '\')"><span>' + d.flag + '</span> ' + d.label + '</button>';
    });
    langDropdown.innerHTML = html;
  }

  var mName = document.getElementById('mobileLangName');
  if (mName) mName.textContent = info.label;

  applyTranslations();
  
  // THE FIX FOR YOUR PREVIOUS ERROR IS ON THIS NEXT LINE:
  showToast((translations[currentLang]?.['Language changed to'] || 'Language changed to') + ' ' + info.label, 'info');
}

// Desktop language setter (called from HTML onclick)
window.setLang = function(name, flag) {
  var langMap = { 'English': 'en', 'العربية': 'ar', 'Français': 'fr', 'Español': 'es', 'Deutsch': 'de', 'Türkçe': 'tr', '中文': 'zh', 'Русский': 'ru' };
  changeLanguage(langMap[name] || 'en');
  closeDropdown('#desktopLangDrop');
};

function applyTranslations() {
  var t = translations[currentLang];
  if (!t) return;
  document.querySelectorAll('.nav-link, button, label, h1, h2, h3, h4, h5, h6, .sidebar-title, .modal-title, .form-label').forEach(function(el) { var text = el.textContent.trim(); if (t[text]) el.textContent = t[text]; });
  document.querySelectorAll('input[placeholder]').forEach(function(input) { var ph = input.getAttribute('placeholder'); if (t[ph]) input.setAttribute('placeholder', t[ph]); });
  document.querySelectorAll('option').forEach(function(opt) { var text = opt.textContent.trim(); if (t[text]) opt.textContent = t[text]; });
}

// ====== BOOT ======
async function bootSequence() {
  if (typeof showApp === 'function') {
    var orig = showApp;
    showApp = async function() {
      await orig();
      await loadBalance();
      await loadNumbers();
      window.currentPage = getPageFromHash();
      // Load page data before rendering (fixes history empty on refresh)
      await preLoadPageData(window.currentPage);
      renderMainContent();
    };
  }
  if (typeof checkSession === 'function') checkSession();
}