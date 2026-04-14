function getServiceListHTML() {
  const items = [
    { name: 'WhatsApp', icon: 'fab fa-whatsapp', color: '#25d366', bg: 'rgba(37,211,102,0.1)', price: '0.70' },
    { name: 'Telegram', icon: 'fab fa-telegram-plane', color: '#24a1de', bg: 'rgba(36,161,222,0.1)', price: '0.45' },
    { name: 'Facebook', icon: 'fab fa-facebook-f', color: '#1877f2', bg: 'rgba(24,119,242,0.1)', price: '0.50' },
    { name: 'Instagram', icon: 'fab fa-instagram', color: '#e1306c', bg: 'rgba(225,48,108,0.1)', price: '0.60' },
    { name: 'Google', icon: 'fab fa-google', color: '#4285f4', bg: 'rgba(66,133,244,0.1)', price: '0.35' },
    { name: 'Twitter / X', icon: 'fab fa-x-twitter', color: '#1da1f2', bg: 'rgba(29,161,242,0.1)', price: '0.55' },
    { name: 'TikTok', icon: 'fab fa-tiktok', color: '#cc0044', bg: 'rgba(255,0,80,0.06)', price: '0.55' },
    { name: 'Discord', icon: 'fab fa-discord', color: '#5865f2', bg: 'rgba(88,101,242,0.1)', price: '0.40' },
    { name: 'Amazon', icon: 'fab fa-amazon', color: '#e68a00', bg: 'rgba(255,153,0,0.1)', price: '0.90' },
    { name: 'Microsoft', icon: 'fab fa-microsoft', color: '#0078d4', bg: 'rgba(0,120,212,0.1)', price: '0.50' },
    { name: 'Fiverr', icon: 'fab fa-font-awesome', color: '#00af50', bg: 'rgba(0,175,80,0.1)', price: '0.80' },
    { name: 'PayPal', icon: 'fab fa-paypal', color: '#003087', bg: 'rgba(0,48,135,0.1)', price: '0.85' },
    { name: 'Steam', icon: 'fab fa-steam', color: '#4a90b8', bg: 'rgba(102,192,244,0.1)', price: '0.65' },
    { name: 'Uber', icon: 'fab fa-uber', color: '#333', bg: 'rgba(0,0,0,0.05)', price: '0.75' },
    { name: 'Lyft', icon: 'fas fa-car', color: '#cc0044', bg: 'rgba(255,0,80,0.06)', price: '0.70' },
    { name: 'Snapchat', icon: 'fab fa-snapchat', color: '#fffc00', bg: 'rgba(255,252,0,0.1)', price: '0.55' },
  ];

  return items.map(s => `
    <div style="padding:20px 14px;background:var(--bg-card);border:1px solid var(--border);border-radius:14px;text-align:center;box-shadow:var(--shadow-sm);transition:all 0.2s;cursor:default;"
         onmouseover="this.style.boxShadow='var(--shadow-md)';this.style.transform='translateY(-2px)'"
         onmouseout="this.style.boxShadow='var(--shadow-sm)';this.style.transform='translateY(0)'">
      <div style="width:48px;height:48px;border-radius:12px;background:${s.bg};display:flex;align-items:center;justify-content:center;margin:0 auto 12px;font-size:20px;color:${s.color};">
        <i class="${s.icon}"></i>
      </div>
      <div style="font-size:13px;font-weight:600;margin-bottom:6px;">${s.name}</div>
      <div style="font-size:14px;font-weight:700;color:var(--accent);">$${s.price}</div>
      <div style="font-size:10px;color:var(--text-muted);margin-top:2px;">per number</div>
    </div>
  `).join('');
}

// ====== AUTH STATE ======
let currentUser = null;

function isLoggedIn() {
  return currentUser !== null;
}

function getUserEmail() {
  return currentUser ? currentUser.email : '';
}

// ====== CHECK SESSION ON LOAD ======
function checkSession() {
  const saved = localStorage.getItem('smsvc_user');
  if (saved) {
    try {
      currentUser = JSON.parse(saved);
      showApp();
    } catch (e) {
      localStorage.removeItem('smsvc_user');
      showLanding();
    }
  } else {
    showLanding();
  }
}

// ====== SHOW/HIDE FUNCTIONS ======
function showLanding() {
  document.getElementById('authPages').style.display = 'block';
  document.getElementById('appPages').style.display = 'none';
  renderLanding();
}

function showLogin() {
  document.getElementById('authPages').style.display = 'block';
  document.getElementById('appPages').style.display = 'none';
  renderLogin();
}

function showSignup() {
  document.getElementById('authPages').style.display = 'block';
  document.getElementById('appPages').style.display = 'none';
  renderSignup();
}

function showApp() {
  document.getElementById('authPages').style.display = 'none';
  document.getElementById('appPages').style.display = 'block';
  document.getElementById('userEmailDisplay').textContent = currentUser.email;
  document.getElementById('userAvatarDisplay').textContent = currentUser.email.substring(0, 2).toUpperCase();
  renderSidebar();
  renderMainContent();
}

function logout() {
  currentUser = null;
  localStorage.removeItem('smsvc_user');
  showLanding();
  showToast('Logged out successfully', 'info');
}

// ====== API CALLS ======
async function apiSignup(name, email, password) {
  const res = await fetch('/api/auth/signup', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, password })
  });
  return await res.json();
}

async function apiLogin(email, password) {
  const res = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  return await res.json();
}

// ====== PAGE RENDERERS ======
function renderLanding() {
  const container = document.getElementById('authPages');
  container.innerHTML = `
    <!-- NAVBAR -->
    <nav style="position:fixed;top:0;left:0;right:0;height:60px;background:rgba(255,255,255,0.95);backdrop-filter:blur(16px);border-bottom:1px solid var(--border);display:flex;align-items:center;justify-content:space-between;padding:0 40px;z-index:100;">
      <div style="display:flex;align-items:center;gap:10px;">
        <div style="width:36px;height:36px;background:linear-gradient(135deg,var(--accent),#087a60);border-radius:10px;display:flex;align-items:center;justify-content:center;color:#fff;font-size:16px;">
          <i class="fas fa-comment-dots"></i>
        </div>
        <span style="font-weight:700;font-size:18px;">SMS Virtual <span style="color:var(--accent);">Code</span></span>
      </div>
      <div style="display:flex;gap:10px;">
        <button class="btn btn-secondary" onclick="showLogin()">Log In</button>
        <button class="btn btn-primary" onclick="showSignup()">Sign Up Free</button>
      </div>
    </nav>

    <!-- HERO -->
    <section style="padding:140px 40px 80px;text-align:center;max-width:800px;margin:0 auto;">
      <div style="display:inline-block;padding:6px 16px;background:var(--accent-dim);border:1px solid rgba(13,155,122,0.15);border-radius:20px;font-size:12px;font-weight:600;color:var(--accent);margin-bottom:24px;">
        Trusted by 50,000+ users worldwide
      </div>
      <h1 style="font-size:52px;font-weight:700;line-height:1.1;letter-spacing:-2px;margin-bottom:20px;">
        Receive SMS Codes<br><span style="color:var(--accent);">Instantly</span>
      </h1>
      <p style="font-size:18px;color:var(--text-secondary);line-height:1.6;margin-bottom:36px;max-width:560px;margin-left:auto;margin-right:auto;">
        Get virtual phone numbers for verification codes. Works with WhatsApp, Facebook, Telegram, Google, and 200+ services.
      </p>
      <div style="display:flex;gap:12px;justify-content:center;">
        <button class="btn btn-primary" style="padding:14px 32px;font-size:15px;" onclick="showSignup()">
          Get Started Free <i class="fas fa-arrow-right" style="margin-left:4px;"></i>
        </button>
        <button class="btn btn-secondary" style="padding:14px 32px;font-size:15px;" onclick="document.getElementById('howItWorks').scrollIntoView({behavior:'smooth'})">
          How It Works
        </button>
      </div>
      <p style="font-size:12px;color:var(--text-muted);margin-top:16px;">No credit card required. $6.00 free credits on signup.</p>
    </section>

    <!-- STATS BAR -->
    <section style="padding:0 40px 60px;">
      <div style="max-width:700px;margin:0 auto;display:grid;grid-template-columns:repeat(3,1fr);gap:20px;">
        <div style="text-align:center;padding:24px;background:var(--bg-card);border:1px solid var(--border);border-radius:14px;box-shadow:var(--shadow-sm);">
          <div style="font-size:32px;font-weight:700;color:var(--accent);letter-spacing:-1px;">200+</div>
          <div style="font-size:13px;color:var(--text-secondary);margin-top:4px;">Services Supported</div>
        </div>
        <div style="text-align:center;padding:24px;background:var(--bg-card);border:1px solid var(--border);border-radius:14px;box-shadow:var(--shadow-sm);">
          <div style="font-size:32px;font-weight:700;color:var(--accent);letter-spacing:-1px;">50+</div>
          <div style="font-size:13px;color:var(--text-secondary);margin-top:4px;">Countries</div>
        </div>
        <div style="text-align:center;padding:24px;background:var(--bg-card);border:1px solid var(--border);border-radius:14px;box-shadow:var(--shadow-sm);">
          <div style="font-size:32px;font-weight:700;color:var(--accent);letter-spacing:-1px;">10s</div>
          <div style="font-size:13px;color:var(--text-secondary);margin-top:4px;">Avg. Delivery Time</div>
        </div>
      </div>
    </section>

    <!-- HOW IT WORKS -->
    <section id="howItWorks" style="padding:60px 40px;">
      <div style="max-width:800px;margin:0 auto;">
        <h2 style="font-size:28px;font-weight:700;text-align:center;letter-spacing:-1px;margin-bottom:40px;">How It Works</h2>
        <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:24px;">
          <div style="text-align:center;padding:32px 20px;">
            <div style="width:56px;height:56px;background:var(--accent-dim);border-radius:14px;display:flex;align-items:center;justify-content:center;margin:0 auto 16px;font-size:22px;color:var(--accent);">
              <i class="fas fa-list"></i>
            </div>
            <h3 style="font-size:16px;font-weight:600;margin-bottom:8px;">1. Choose Service</h3>
            <p style="font-size:13px;color:var(--text-secondary);line-height:1.6;">Pick the service you need a verification code for from 200+ options.</p>
          </div>
          <div style="text-align:center;padding:32px 20px;">
            <div style="width:56px;height:56px;background:var(--accent-dim);border-radius:14px;display:flex;align-items:center;justify-content:center;margin:0 auto 16px;font-size:22px;color:var(--accent);">
              <i class="fas fa-phone"></i>
            </div>
            <h3 style="font-size:16px;font-weight:600;margin-bottom:8px;">2. Get Number</h3>
            <p style="font-size:13px;color:var(--text-secondary);line-height:1.6;">Receive a virtual phone number instantly. Copy it to the service.</p>
          </div>
          <div style="text-align:center;padding:32px 20px;">
            <div style="width:56px;height:56px;background:var(--accent-dim);border-radius:14px;display:flex;align-items:center;justify-content:center;margin:0 auto 16px;font-size:22px;color:var(--accent);">
              <i class="fas fa-key"></i>
            </div>
            <h3 style="font-size:16px;font-weight:600;margin-bottom:8px;">3. Receive Code</h3>
            <p style="font-size:13px;color:var(--text-secondary);line-height:1.6;">SMS code appears in your dashboard within seconds. Done.</p>
          </div>
        </div>
      </div>
    </section>

    <!-- PRODUCT LIST -->
    <section style="padding:60px 40px;">
      <div style="max-width:900px;margin:0 auto;">
        <h2 style="font-size:28px;font-weight:700;text-align:center;letter-spacing:-1px;margin-bottom:8px;">Available Services</h2>
        <p style="font-size:14px;color:var(--text-secondary);text-align:center;margin-bottom:32px;">Choose from 200+ services starting at $0.35</p>
        <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:12px;">
          ${getServiceListHTML()}
        </div>
      </div>
    </section>

    <!-- FEATURES -->
    <section style="padding:60px 40px;">
      <div style="max-width:800px;margin:0 auto;">
        <h2 style="font-size:28px;font-weight:700;text-align:center;letter-spacing:-1px;margin-bottom:40px;">Why Choose Us</h2>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;">
          <div style="padding:24px;background:var(--bg-card);border:1px solid var(--border);border-radius:14px;box-shadow:var(--shadow-sm);">
            <i class="fas fa-bolt" style="color:var(--accent);font-size:18px;margin-bottom:12px;display:block;"></i>
            <h3 style="font-size:14px;font-weight:600;margin-bottom:6px;">Instant Delivery</h3>
            <p style="font-size:12px;color:var(--text-secondary);line-height:1.6;">Most codes arrive in under 10 seconds.</p>
          </div>
          <div style="padding:24px;background:var(--bg-card);border:1px solid var(--border);border-radius:14px;box-shadow:var(--shadow-sm);">
            <i class="fas fa-globe" style="color:var(--accent);font-size:18px;margin-bottom:12px;display:block;"></i>
            <h3 style="font-size:14px;font-weight:600;margin-bottom:6px;">50+ Countries</h3>
            <p style="font-size:12px;color:var(--text-secondary);line-height:1.6;">Numbers from US, UK, Germany, France, and more.</p>
          </div>
          <div style="padding:24px;background:var(--bg-card);border:1px solid var(--border);border-radius:14px;box-shadow:var(--shadow-sm);">
            <i class="fas fa-shield-alt" style="color:var(--accent);font-size:18px;margin-bottom:12px;display:block;"></i>
            <h3 style="font-size:14px;font-weight:600;margin-bottom:6px;">Private & Secure</h3>
            <p style="font-size:12px;color:var(--text-secondary);line-height:1.6;">Numbers are temporary and never reused.</p>
          </div>
          <div style="padding:24px;background:var(--bg-card);border:1px solid var(--border);border-radius:14px;box-shadow:var(--shadow-sm);">
            <i class="fas fa-coins" style="color:var(--accent);font-size:18px;margin-bottom:12px;display:block;"></i>
            <h3 style="font-size:14px;font-weight:600;margin-bottom:6px;">Low Cost</h3>
            <p style="font-size:12px;color:var(--text-secondary);line-height:1.6;">Starting from $0.35 per number. No subscriptions.</p>
          </div>
        </div>
      </div>
    </section>

    <!-- FOOTER -->
    <footer style="padding:40px;text-align:center;border-top:1px solid var(--border);margin-top:40px;">
      <p style="font-size:13px;color:var(--text-muted);">SMS Virtual Code &copy; 2025. All rights reserved.</p>
    </footer>
  `;
}

function renderLogin() {
  const container = document.getElementById('authPages');
  container.innerHTML = `
    <nav style="position:fixed;top:0;left:0;right:0;height:60px;background:rgba(255,255,255,0.95);backdrop-filter:blur(16px);border-bottom:1px solid var(--border);display:flex;align-items:center;justify-content:space-between;padding:0 40px;z-index:100;">
      <div style="display:flex;align-items:center;gap:10px;cursor:pointer;" onclick="showLanding()">
        <div style="width:36px;height:36px;background:linear-gradient(135deg,var(--accent),#087a60);border-radius:10px;display:flex;align-items:center;justify-content:center;color:#fff;font-size:16px;">
          <i class="fas fa-comment-dots"></i>
        </div>
        <span style="font-weight:700;font-size:18px;">SMS Virtual <span style="color:var(--accent);">Code</span></span>
      </div>
      <div style="font-size:13px;color:var(--text-secondary);">Don't have an account? <a href="#" onclick="event.preventDefault();showSignup()" style="color:var(--accent);font-weight:600;text-decoration:none;">Sign up</a></div>
    </nav>

    <div style="max-width:400px;margin:120px auto 0;padding:0 20px;">
      <div style="background:var(--bg-card);border:1px solid var(--border);border-radius:20px;padding:36px;box-shadow:var(--shadow-md);">
        <h2 style="font-size:24px;font-weight:700;margin-bottom:6px;">Welcome back</h2>
        <p style="font-size:13px;color:var(--text-secondary);margin-bottom:28px;">Log in to your account to continue.</p>

        <div id="loginError" style="display:none;padding:10px 14px;background:rgba(217,48,37,0.06);border:1px solid rgba(217,48,37,0.15);border-radius:10px;font-size:13px;color:var(--danger);margin-bottom:16px;"></div>

        <div style="margin-bottom:18px;">
          <label style="display:block;font-size:12px;font-weight:600;color:var(--text-secondary);margin-bottom:8px;text-transform:uppercase;letter-spacing:0.5px;">Email</label>
          <input type="email" id="loginEmail" placeholder="you@example.com" style="width:100%;padding:11px 14px;background:var(--bg-primary);border:1px solid var(--border);border-radius:10px;font-size:14px;font-family:inherit;color:var(--text-primary);outline:none;transition:border-color 0.2s;" onfocus="this.style.borderColor='var(--accent)'" onblur="this.style.borderColor='var(--border)'">
        </div>

        <div style="margin-bottom:24px;">
          <label style="display:block;font-size:12px;font-weight:600;color:var(--text-secondary);margin-bottom:8px;text-transform:uppercase;letter-spacing:0.5px;">Password</label>
          <input type="password" id="loginPassword" placeholder="Enter your password" style="width:100%;padding:11px 14px;background:var(--bg-primary);border:1px solid var(--border);border-radius:10px;font-size:14px;font-family:inherit;color:var(--text-primary);outline:none;transition:border-color 0.2s;" onfocus="this.style.borderColor='var(--accent)'" onblur="this.style.borderColor='var(--border)'" onkeydown="if(event.key==='Enter')handleLogin()">
        </div>

        <button class="btn btn-primary" style="width:100%;justify-content:center;padding:12px;" onclick="handleLogin()" id="loginBtn">
          Log In
        </button>
      </div>
    </div>
  `;

  setTimeout(() => document.getElementById('loginEmail').focus(), 100);
}

function renderSignup() {
  const container = document.getElementById('authPages');
  container.innerHTML = `
    <nav style="position:fixed;top:0;left:0;right:0;height:60px;background:rgba(255,255,255,0.95);backdrop-filter:blur(16px);border-bottom:1px solid var(--border);display:flex;align-items:center;justify-content:space-between;padding:0 40px;z-index:100;">
      <div style="display:flex;align-items:center;gap:10px;cursor:pointer;" onclick="showLanding()">
        <div style="width:36px;height:36px;background:linear-gradient(135deg,var(--accent),#087a60);border-radius:10px;display:flex;align-items:center;justify-content:center;color:#fff;font-size:16px;">
          <i class="fas fa-comment-dots"></i>
        </div>
        <span style="font-weight:700;font-size:18px;">SMS Virtual <span style="color:var(--accent);">Code</span></span>
      </div>
      <div style="font-size:13px;color:var(--text-secondary);">Already have an account? <a href="#" onclick="event.preventDefault();showLogin()" style="color:var(--accent);font-weight:600;text-decoration:none;">Log in</a></div>
    </nav>

    <div style="max-width:400px;margin:120px auto 0;padding:0 20px;">
      <div style="background:var(--bg-card);border:1px solid var(--border);border-radius:20px;padding:36px;box-shadow:var(--shadow-md);">
        <h2 style="font-size:24px;font-weight:700;margin-bottom:6px;">Create account</h2>
        <p style="font-size:13px;color:var(--text-secondary);margin-bottom:28px;">Get $6.00 free credits when you sign up.</p>

        <div id="signupError" style="display:none;padding:10px 14px;background:rgba(217,48,37,0.06);border:1px solid rgba(217,48,37,0.15);border-radius:10px;font-size:13px;color:var(--danger);margin-bottom:16px;"></div>

        <div style="margin-bottom:18px;">
          <label style="display:block;font-size:12px;font-weight:600;color:var(--text-secondary);margin-bottom:8px;text-transform:uppercase;letter-spacing:0.5px;">Full Name</label>
          <input type="text" id="signupName" placeholder="John Doe" style="width:100%;padding:11px 14px;background:var(--bg-primary);border:1px solid var(--border);border-radius:10px;font-size:14px;font-family:inherit;color:var(--text-primary);outline:none;transition:border-color 0.2s;" onfocus="this.style.borderColor='var(--accent)'" onblur="this.style.borderColor='var(--border)'">
        </div>

        <div style="margin-bottom:18px;">
          <label style="display:block;font-size:12px;font-weight:600;color:var(--text-secondary);margin-bottom:8px;text-transform:uppercase;letter-spacing:0.5px;">Email</label>
          <input type="email" id="signupEmail" placeholder="you@example.com" style="width:100%;padding:11px 14px;background:var(--bg-primary);border:1px solid var(--border);border-radius:10px;font-size:14px;font-family:inherit;color:var(--text-primary);outline:none;transition:border-color 0.2s;" onfocus="this.style.borderColor='var(--accent)'" onblur="this.style.borderColor='var(--border)'">
        </div>

        <div style="margin-bottom:18px;">
          <label style="display:block;font-size:12px;font-weight:600;color:var(--text-secondary);margin-bottom:8px;text-transform:uppercase;letter-spacing:0.5px;">Password</label>
          <input type="password" id="signupPassword" placeholder="Min 6 characters" style="width:100%;padding:11px 14px;background:var(--bg-primary);border:1px solid var(--border);border-radius:10px;font-size:14px;font-family:inherit;color:var(--text-primary);outline:none;transition:border-color 0.2s;" onfocus="this.style.borderColor='var(--accent)'" onblur="this.style.borderColor='var(--border)'">
        </div>

        <div style="margin-bottom:24px;">
          <label style="display:block;font-size:12px;font-weight:600;color:var(--text-secondary);margin-bottom:8px;text-transform:uppercase;letter-spacing:0.5px;">Confirm Password</label>
          <input type="password" id="signupConfirm" placeholder="Re-enter password" style="width:100%;padding:11px 14px;background:var(--bg-primary);border:1px solid var(--border);border-radius:10px;font-size:14px;font-family:inherit;color:var(--text-primary);outline:none;transition:border-color 0.2s;" onfocus="this.style.borderColor='var(--accent)'" onblur="this.style.borderColor='var(--border)'" onkeydown="if(event.key==='Enter')handleSignup()">
        </div>

        <button class="btn btn-primary" style="width:100%;justify-content:center;padding:12px;" onclick="handleSignup()" id="signupBtn">
          Create Account
        </button>

        <p style="font-size:11px;color:var(--text-muted);text-align:center;margin-top:16px;line-height:1.5;">
          By signing up you agree to our Terms of Service and Privacy Policy.
        </p>
      </div>
    </div>
  `;

  setTimeout(() => document.getElementById('signupName').focus(), 100);
}

// ====== FORM HANDLERS ======
async function handleLogin() {
  const email = document.getElementById('loginEmail').value.trim();
  const password = document.getElementById('loginPassword').value;
  const errorEl = document.getElementById('loginError');

  if (!email || !password) {
    errorEl.style.display = 'block';
    errorEl.textContent = 'Please fill in all fields.';
    return;
  }

  const btn = document.getElementById('loginBtn');
  btn.textContent = 'Logging in...';
  btn.disabled = true;

  try {
    const data = await apiLogin(email, password);
    if (data.error) {
      errorEl.style.display = 'block';
      errorEl.textContent = data.error;
    } else {
      currentUser = { email: data.email, name: data.name };
      localStorage.setItem('smsvc_user', JSON.stringify(currentUser));
      showApp();
      showToast('Welcome back, ' + data.name, 'success');
    }
  } catch (e) {
    errorEl.style.display = 'block';
    errorEl.textContent = 'Connection error. Is the server running?';
  }

  btn.textContent = 'Log In';
  btn.disabled = false;
}

async function handleSignup() {
  const name = document.getElementById('signupName').value.trim();
  const email = document.getElementById('signupEmail').value.trim();
  const password = document.getElementById('signupPassword').value;
  const confirm = document.getElementById('signupConfirm').value;
  const errorEl = document.getElementById('signupError');

  if (!name || !email || !password || !confirm) {
    errorEl.style.display = 'block';
    errorEl.textContent = 'Please fill in all fields.';
    return;
  }
  if (password.length < 6) {
    errorEl.style.display = 'block';
    errorEl.textContent = 'Password must be at least 6 characters.';
    return;
  }
  if (password !== confirm) {
    errorEl.style.display = 'block';
    errorEl.textContent = 'Passwords do not match.';
    return;
  }

  const btn = document.getElementById('signupBtn');
  btn.textContent = 'Creating account...';
  btn.disabled = true;

  try {
    const data = await apiSignup(name, email, password);
    if (data.error) {
      errorEl.style.display = 'block';
      errorEl.textContent = data.error;
    } else {
      currentUser = { email: data.email, name: data.name };
      localStorage.setItem('smsvc_user', JSON.stringify(currentUser));
      showApp();
      showToast('Account created! $6.00 credits added.', 'success');
    }
  } catch (e) {
    errorEl.style.display = 'block';
    errorEl.textContent = 'Connection error. Is the server running?';
  }

  btn.textContent = 'Create Account';
  btn.disabled = false;
}