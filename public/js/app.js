// ====== UTILITIES ======
function formatTime(seconds) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

function showToast(message, type = 'success') {
  const container = document.getElementById('toastContainer');
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  const icons = { success: 'fa-check-circle', error: 'fa-exclamation-circle', info: 'fa-info-circle' };
  const colors = { success: 'var(--accent)', error: 'var(--danger)', info: 'var(--info)' };
  toast.innerHTML = `<i class="fas ${icons[type]}" style="color:${colors[type]}"></i> ${message}`;
  container.appendChild(toast);
  setTimeout(() => toast.remove(), 3000);
}

function updateBalanceDisplay(amount) {
  document.getElementById('balanceAmount').textContent = '$' + amount.toFixed(2);
}

async function loadBalance() {
  try {
    const res = await fetch(`/api/user/${getUserEmail()}`);
    const data = await res.json();
    updateBalanceDisplay(data.balance);
    return data.balance;
  } catch(e) {
    return 0;
  }
}

// ====== MAIN CONTENT ROUTER ======
function renderMainContent() {
  const main = document.getElementById('mainContent');
  if (currentPage === 'numbers') renderNumbersPage(main);
  else if (currentPage === 'history') renderHistoryPage(main);
  else if (currentPage === 'pricing') renderPricingPage(main);
  else if (currentPage === 'api') renderApiPage(main);
  else if (currentPage === 'help') renderHelpPage(main);
  else if (currentPage === 'settings') renderSettingsPage(main);
  else if (currentPage === 'contacts') renderContactsPage(main);
  else if (currentPage === 'timer') renderTimerPage(main);
  else if (currentPage === 'deposit') {
    renderDepositPage(main);
    loadBalance().then(function(b) {
      var el = document.getElementById('depositCurrentBalance');
      if (el) el.textContent = '$' + b.toFixed(2);
    });
    loadDepositHistory();
  }
}

// ====== NUMBER OPERATIONS ======
function copyNumber(phone) {
  navigator.clipboard.writeText(phone.replace(/\s/g, '')).then(() => {
    showToast(translations[currentLang]['Number copied to clipboard'], 'success');
  }).catch(() => showToast(translations[currentLang]['Copy failed'], 'error'));
}

async function cancelNumber(id) {
  try {
    const res = await fetch(`/api/numbers/${id}`, { method: 'DELETE' });
    const data = await res.json();
    if (data.error) { showToast(data.error, 'error'); return; }
    updateBalanceDisplay(data.balance);
    renderMainContent();
    showToast(translations[currentLang]['Number cancelled, balance refunded'], 'info');
  } catch(e) { showToast(translations[currentLang]['Error cancelling number'], 'error'); }
}

async function refreshNumber(id) {
  try {
    const res = await fetch(`/api/numbers/${id}/expire`, { method: 'POST' });
    const data = await res.json();
    renderMainContent();
    showToast(translations[currentLang]['Requesting new number...'], 'info');
  } catch(e) { showToast(translations[currentLang]['Error refreshing number'], 'error'); }
}

function setFilter(filter) {
  currentFilter = filter;
  renderMainContent();
}

function refreshAllNumbers() {
  showToast(translations[currentLang]['All numbers refreshed'], 'info');
  renderMainContent();
}

// ====== NAVIGATION ======
document.querySelectorAll('.nav-link').forEach(link => {
  link.addEventListener('click', function() {
    document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
    this.classList.add('active');
    currentPage = this.dataset.page;
    if (currentPage === 'history') loadHistory();
    else if (currentPage === 'numbers') loadNumbers();
    renderMainContent();
  });
});

// ====== SEARCH ======
document.getElementById('serviceSearch').addEventListener('input', function() {
  renderSidebar(this.value);
});

// ====== KEYBOARD ======
document.addEventListener('keydown', function(e) {
  if (e.key === 'Escape') closeModal();
});

// ====== LOAD DATA FROM BACKEND ======
async function loadNumbers() {
  try {
    const res = await fetch(`/api/numbers/${getUserEmail()}`);
    activeNumbers = await res.json();
  } catch(e) { activeNumbers = []; }
}

async function loadHistory() {
  try {
    const res = await fetch(`/api/history/${getUserEmail()}`);
    historyData = await res.json();
  } catch(e) { historyData = []; }
}

// ====== TIMER: CHECK FOR EXPIRED NUMBERS EVERY SECOND ======
setInterval(async () => {
  let changed = false;
  activeNumbers.forEach(n => {
    const timeLeft = n.time_left ?? n.timeLeft ?? 0;
    const totalTime = n.total_time ?? n.totalTime ?? 1;
    if (n.status === 'waiting' && timeLeft > 0) {
      const newTime = timeLeft - 1;
      n.time_left = newTime;
      n.timeLeft = newTime;
      const timerEl = document.getElementById(`timer-${n.id}`);
      if (timerEl) timerEl.textContent = formatTime(newTime);
      const card = document.getElementById(`card-${n.id}`);
      if (card) {
        const bar = card.querySelector('.timer-bar-fill');
        if (bar) bar.style.width = (newTime / totalTime * 100) + '%';
      }
      if (newTime <= 0) {
        n.status = 'expired';
        changed = true;
        fetch(`/api/numbers/${n.id}/expire`, { method: 'POST' }).catch(() => {});
        showToast(translations[currentLang]['Number expired, balance refunded'], 'error');
      }
    }
  });
  if (changed) {
    await loadBalance();
    renderMainContent();
  }
}, 1000);

// ====== AUTO-REFRESH: Check backend for new SMS codes every 5 seconds ======
setInterval(async () => {
  if (currentPage === 'numbers' && activeNumbers.some(n => n.status === 'waiting')) {
    await loadNumbers();
    renderMainContent();
  }
}, 5000);

// ====== CHECK IF RETURNING FROM CRYPTOMUS PAYMENT ======
function checkDepositReturn() {
  var params = new URLSearchParams(window.location.search);
  var depositStatus = params.get('deposit');
  var ref = params.get('ref');
  if (depositStatus === 'success' && ref) {
    showToast(translations[currentLang]['Payment submitted! Balance will update after confirmation.'], 'info');
    window.history.replaceState({}, '', window.location.pathname);
  }
}
checkDepositReturn();

// ====== USER MENU ======
document.querySelector('.user-info').addEventListener('click', function() {
  const dropdown = document.querySelector('.user-dropdown');
  dropdown.style.display = dropdown.style.display === 'block' ? 'none' : 'block';
});

// ====== LANGUAGE MENU ======
document.querySelector('.language-btn').addEventListener('click', function(e) {
  e.stopPropagation();
  const dropdown = document.querySelector('.language-dropdown');
  dropdown.style.display = dropdown.style.display === 'block' ? 'none' : 'block';
});

// Close dropdowns when clicking outside
document.addEventListener('click', function(e) {
  if (!e.target.closest('.user-menu')) {
    const dropdown = document.querySelector('.user-dropdown');
    if (dropdown) dropdown.style.display = 'none';
  }
  if (!e.target.closest('.language-menu')) {
    const langDropdown = document.querySelector('.language-dropdown');
    if (langDropdown) langDropdown.style.display = 'none';
  }
});

// Mobile hamburger menu
document.getElementById('hamburger').addEventListener('click', function() {
  const navLinks = document.querySelector('.nav-links');
  navLinks.classList.toggle('show');
});

function deleteAccount() {
  if (confirm(translations[currentLang]['Are you sure you want to delete your account? This action cannot be undone.'])) {
    showToast(translations[currentLang]['Account deletion not implemented yet'], 'error');
  }
}

// ====== TRANSLATIONS (ENGLISH, CHINESE, RUSSIAN) ======
const translations = {
  en: {
    'Home': 'Home', 'History': 'History', 'Pricing': 'Pricing', 'API': 'API', 'Help': 'Help', 'Settings': 'Settings', 'Contacts': 'Contacts', 'Add Funds': 'Add Funds', 'Notifications': 'Notifications', 'Logout': 'Logout', 'Delete Account': 'Delete Account', 'Language': 'Language', 'English': 'English', 'Chinese': 'Chinese', 'Russian': 'Russian',
    'Welcome to SMS Virtual Code': 'Welcome to SMS Virtual Code', 'Get started with virtual numbers': 'Get started with virtual numbers', 'Login': 'Login', 'Signup': 'Signup', 'Email': 'Email', 'Password': 'Password', 'Confirm Password': 'Confirm Password', 'Forgot Password?': 'Forgot Password?', 'Create Account': 'Create Account', 'Already have an account?': 'Already have an account?', 'Sign In': 'Sign In',
    'Recommended': 'Recommended', 'Popular Services': 'Popular Services', 'Social Media': 'Social Media', 'E-Commerce': 'E-Commerce', 'Search services...': 'Search services...', 'Get Virtual Number': 'Get Virtual Number', 'Service': 'Service', 'Select a service...': 'Select a service...', 'Country / Region': 'Country / Region', 'Select country...': 'Select country...', 'Payment Method': 'Payment Method', 'USDT': 'USDT', 'Tether - Lowest fees': 'Tether - Lowest fees', 'Bitcoin': 'Bitcoin', 'BTC': 'BTC', 'Ethereum': 'Ethereum', 'ETH': 'ETH', 'Cancel': 'Cancel', 'Get Number': 'Get Number',
    'Number copied to clipboard': 'Number copied to clipboard', 'Copy failed': 'Copy failed', 'Number cancelled, balance refunded': 'Number cancelled, balance refunded', 'Error cancelling number': 'Error cancelling number', 'Requesting new number...': 'Requesting new number...', 'Error refreshing number': 'Error refreshing number', 'All numbers refreshed': 'All numbers refreshed', 'Number expired, balance refunded': 'Number expired, balance refunded', 'Payment submitted! Balance will update after confirmation.': 'Payment submitted! Balance will update after confirmation.', 'Account deletion not implemented yet': 'Account deletion not implemented yet', 'Are you sure you want to delete your account? This action cannot be undone.': 'Are you sure you want to delete your account? This action cannot be undone.', 'Are you sure you want to cancel this number?': 'Are you sure you want to cancel this number?', 'Language changed to': 'Language changed to', 'Error': 'Error', 'Success': 'Success', 'Info': 'Info'
  },
  zh: {
    'Home': '首页', 'History': '历史', 'Pricing': '价格', 'API': 'API', 'Help': '帮助', 'Settings': '设置', 'Contacts': '联系人', 'Add Funds': '充值', 'Notifications': '通知', 'Logout': '登出', 'Delete Account': '删除账户', 'Language': '语言', 'English': '英语', 'Chinese': '中文', 'Russian': '俄语',
    'Welcome to SMS Virtual Code': '欢迎使用 SMS Virtual Code', 'Get started with virtual numbers': '开始使用虚拟号码', 'Login': '登录', 'Signup': '注册', 'Email': '邮箱', 'Password': '密码', 'Confirm Password': '确认密码', 'Forgot Password?': '忘记密码？', 'Create Account': '创建账户', 'Already have an account?': '已有账户？', 'Sign In': '登录',
    'Recommended': '推荐', 'Popular Services': '热门服务', 'Social Media': '社交媒体', 'E-Commerce': '电子商务', 'Search services...': '搜索服务...', 'Get Virtual Number': '获取虚拟号码', 'Service': '服务', 'Select a service...': '选择服务...', 'Country / Region': '国家/地区', 'Select country...': '选择国家...', 'Payment Method': '支付方式', 'USDT': 'USDT', 'Tether - Lowest fees': 'Tether - 最低费用', 'Bitcoin': '比特币', 'BTC': 'BTC', 'Ethereum': '以太坊', 'ETH': 'ETH', 'Cancel': '取消', 'Get Number': '获取号码',
    'Number copied to clipboard': '号码已复制到剪贴板', 'Copy failed': '复制失败', 'Number cancelled, balance refunded': '号码已取消，余额已退款', 'Error cancelling number': '取消号码时出错', 'Requesting new number...': '正在请求新号码...', 'Error refreshing number': '刷新号码时出错', 'All numbers refreshed': '所有号码已刷新', 'Number expired, balance refunded': '号码已过期，余额已退款', 'Payment submitted! Balance will update after confirmation.': '支付已提交！确认后余额将更新。', 'Account deletion not implemented yet': '账户删除功能尚未实现', 'Language changed to': '语言已更改为', 'Error': '错误', 'Success': '成功', 'Info': '信息'
  },
  ru: {
    'Home': 'Главная', 'History': 'История', 'Pricing': 'Цены', 'API': 'API', 'Help': 'Помощь', 'Settings': 'Настройки', 'Contacts': 'Контакты', 'Add Funds': 'Пополнить', 'Notifications': 'Уведомления', 'Logout': 'Выйти', 'Delete Account': 'Удалить аккаунт', 'Language': 'Язык', 'English': 'Английский', 'Chinese': 'Китайский', 'Russian': 'Русский',
    'Welcome to SMS Virtual Code': 'Добро пожаловать в SMS Virtual Code', 'Get started with virtual numbers': 'Начните с виртуальными номерами', 'Login': 'Войти', 'Signup': 'Регистрация', 'Email': 'Email', 'Password': 'Пароль', 'Confirm Password': 'Подтвердить пароль', 'Forgot Password?': 'Забыли пароль?', 'Create Account': 'Создать аккаунт', 'Already have an account?': 'Уже есть аккаунт?', 'Sign In': 'Войти',
    'Recommended': 'Рекомендуемые', 'Popular Services': 'Популярные сервисы', 'Social Media': 'Социальные сети', 'E-Commerce': 'Электронная коммерция', 'Search services...': 'Поиск сервисов...', 'Get Virtual Number': 'Получить виртуальный номер', 'Service': 'Сервис', 'Select a service...': 'Выберите сервис...', 'Country / Region': 'Страна / Регион', 'Select country...': 'Выберите страну...', 'Payment Method': 'Способ оплаты', 'USDT': 'USDT', 'Tether - Lowest fees': 'Tether - Минимальные комиссии', 'Bitcoin': 'Bitcoin', 'BTC': 'BTC', 'Ethereum': 'Ethereum', 'ETH': 'ETH', 'Cancel': 'Отмена', 'Get Number': 'Получить номер',
    'Number copied to clipboard': 'Номер скопирован в буфер обмена', 'Copy failed': 'Ошибка копирования', 'Number cancelled, balance refunded': 'Номер отменен, баланс возвращен', 'Error cancelling number': 'Ошибка отмены номера', 'Requesting new number...': 'Запрос нового номера...', 'Error refreshing number': 'Ошибка обновления номера', 'All numbers refreshed': 'Все номера обновлены', 'Number expired, balance refunded': 'Номер истек, баланс возвращен', 'Payment submitted! Balance will update after confirmation.': 'Платеж отправлен! Баланс обновится после подтверждения.', 'Account deletion not implemented yet': 'Удаление аккаунта пока не реализовано', 'Language changed to': 'Язык изменен на', 'Error': 'Ошибка', 'Success': 'Успех', 'Info': 'Информация'
  }
};

// Default language
let currentLang = localStorage.getItem('language') || 'en';

// ====== LANGUAGE FUNCTIONS ======
function changeLanguage(lang) {
  currentLang = lang;
  localStorage.setItem('language', lang);

  // Update the language button in the top right
  const langBtn = document.querySelector('.language-btn');
  if (langBtn) {
    const flagMap = { en: '🇬🇧', zh: '🇨🇳', ru: '🇷🇺' };
    const labelMap = { en: 'EN', zh: '中文', ru: 'RU' };
    langBtn.innerHTML = `<span class="language-flag">${flagMap[lang]}</span><span class="language-label">${labelMap[lang]}</span><i class="fas fa-chevron-down"></i>`;
  }

  // Update the dropdown options
  const langDropdown = document.querySelector('.language-dropdown');
  if (langDropdown) {
    langDropdown.innerHTML = `
      <button onclick="changeLanguage('en')"><span>🇬🇧</span> ${translations[currentLang]['English']}</button>
      <button onclick="changeLanguage('zh')"><span>🇨🇳</span> ${translations[currentLang]['Chinese']}</button>
      <button onclick="changeLanguage('ru')"><span>🇷🇺</span> ${translations[currentLang]['Russian']}</button>
    `;
  }

  // Change all text on the screen to the selected language
  applyTranslations();

  showToast(`${translations[currentLang]['Language changed to']} ${translations[currentLang][lang === 'en' ? 'English' : lang === 'zh' ? 'Chinese' : 'Russian']}`, 'info');
}

function applyTranslations() {
  // Translate navigation, buttons, labels, headings, etc.
  document.querySelectorAll('.nav-link, button, label, h1, h2, h3, h4, h5, h6, .sidebar-title, .modal-title, .form-label').forEach(el => {
    const text = el.textContent.trim();
    if (translations[currentLang][text]) {
      el.textContent = translations[currentLang][text];
    }
  });

  // Translate input placeholders
  document.querySelectorAll('input[placeholder]').forEach(input => {
    const placeholder = input.getAttribute('placeholder');
    if (translations[currentLang][placeholder]) {
      input.setAttribute('placeholder', translations[currentLang][placeholder]);
    }
  });

  // Translate dropdown options
  document.querySelectorAll('option').forEach(option => {
    const text = option.textContent.trim();
    if (translations[currentLang][text]) {
      option.textContent = translations[currentLang][text];
    }
  });
}

// Apply language as soon as the page loads
document.addEventListener('DOMContentLoaded', function() {
  changeLanguage(currentLang);
});

// ====== BOOT SEQUENCE ======
const originalShowApp = showApp;
showApp = async function() {
  originalShowApp();
  await loadBalance();
  await loadNumbers();
  currentPage = 'numbers';
  renderMainContent();
};

const originalLoadNumbers = loadNumbers;
loadNumbers = async function() {
  await originalLoadNumbers();
};

// Start the app
checkSession();