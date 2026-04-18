// ====== UTILITY FUNCTIONS ======
function togglePasswordVisibility(inputId) {
  const input = document.getElementById(inputId);
  const icon = document.getElementById(inputId + 'Icon');
  if (input.type === 'password') {
    input.type = 'text';
    icon.className = 'fas fa-eye-slash';
  } else {
    input.type = 'password';
    icon.className = 'fas fa-eye';
  }
}

function getServiceListHTML() {
  const popularServices = services.filter(s => s.category === 'recommended' || s.category === 'social' || s.category === 'ecommerce').slice(0, 16);
  
  return popularServices.map(s => `
    <div onclick="openServiceModal('${s.id}', '${s.name}')" style="padding:20px 14px;background:var(--bg-card);border:1px solid var(--border);border-radius:14px;text-align:center;box-shadow:var(--shadow-sm);transition:all 0.2s;cursor:pointer;"
         onmouseover="this.style.boxShadow='var(--shadow-md)';this.style.transform='translateY(-2px)';this.style.backgroundColor='rgba(13,155,122,0.05)'"
         onmouseout="this.style.boxShadow='var(--shadow-sm)';this.style.transform='translateY(0)';this.style.backgroundColor='var(--bg-card)'">
      <div class="service-icon ${s.iconClass}" style="width:48px;height:48px;border-radius:12px;display:flex;align-items:center;justify-content:center;margin:0 auto 12px;font-size:20px;">
        <i class="${s.icon}"></i>
      </div>
      <div style="font-size:13px;font-weight:600;margin-bottom:6px;">${s.name}</div>
      <div style="font-size:14px;font-weight:700;color:var(--accent);">$${s.price.toFixed(2)}</div>
      <div style="font-size:10px;color:var(--text-muted);margin-top:2px;">per number</div>
    </div>
  `).join('');
}

function openServiceModal(serviceId, serviceName) {
  // Find service in the services array by id first, then by name as fallback
  const service = services.find(s => s.id === serviceId) || services.find(s => s.name.toLowerCase() === serviceName.toLowerCase());
  if (!service) return;
  
  if (isLoggedIn()) {
    // User is logged in - navigate to app and open modal with service
    localStorage.setItem('pendingServiceModal', JSON.stringify(service));
    showApp();
    // Open the modal after a brief delay to ensure app is rendered
    setTimeout(() => {
      openModal(service);
    }, 100);
  } else {
    // User is not logged in - show modal for demo or redirect to signup
    // Store the service to use after signup
    localStorage.setItem('selectedService', JSON.stringify(service));
    
    // Show a promotional modal
    const promoModal = document.getElementById('promoModal');
    if (!promoModal) {
      // Create modal if doesn't exist
      const modal = document.createElement('div');
      modal.id = 'promoModal';
      modal.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.5);display:flex;align-items:center;justify-content:center;z-index:9999;';
      modal.innerHTML = `
        <div style="background:white;padding:40px;border-radius:16px;max-width:400px;text-align:center;box-shadow:0 20px 60px rgba(0,0,0,0.3);">
          <h2 style="font-size:22px;font-weight:700;margin-bottom:12px;">Get Started Today</h2>
          <p style="font-size:14px;color:var(--text-secondary);margin-bottom:24px;">Create an account to get virtual numbers for ${service ? service.name : 'services'} verification codes.</p>
          <div style="display:flex;gap:12px;">
            <button onclick="document.getElementById('promoModal').remove();showSignup();" style="flex:1;padding:12px 16px;background:var(--accent);color:white;border:none;border-radius:8px;font-weight:600;cursor:pointer;">
              Sign Up Free
            </button>
            <button onclick="document.getElementById('promoModal').remove();showLogin();" style="flex:1;padding:12px 16px;background:var(--bg-card);border:1px solid var(--border);border-radius:8px;font-weight:600;cursor:pointer;">
              Log In
            </button>
          </div>
        </div>
      `;
      document.body.appendChild(modal);
    } else {
      promoModal.style.display = 'flex';
    }
  }
}

function getReferralCodeFromUrl() {
  const params = new URLSearchParams(window.location.search);
  const code = params.get('ref');
  if (code) {
    localStorage.setItem('referralCode', code);
  }
}
getReferralCodeFromUrl();

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
  // Check sessionStorage first (temporary session), then localStorage (persistent)
  let saved = sessionStorage.getItem('smsvc_user');
  let storageType = 'session';

  if (!saved) {
    saved = localStorage.getItem('smsvc_user');
    storageType = 'local';
  }

  if (saved) {
    try {
      currentUser = JSON.parse(saved);
      showApp();
    } catch (e) {
      // Clear corrupted data
      if (storageType === 'session') {
        sessionStorage.removeItem('smsvc_user');
      } else {
        localStorage.removeItem('smsvc_user');
      }
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

function showForgotPassword() {
  document.getElementById('authPages').style.display = 'block';
  document.getElementById('appPages').style.display = 'none';
  renderForgotPassword();
}

function showApp() {
  document.getElementById('authPages').style.display = 'none';
  document.getElementById('appPages').style.display = 'block';
  document.getElementById('userEmailDisplay').textContent = currentUser.email;
  document.getElementById('userAvatarDisplay').textContent = currentUser.email.substring(0, 2).toUpperCase();
  renderSidebar();
}

function logout() {
  currentUser = null;
  localStorage.removeItem('smsvc_user');
  sessionStorage.removeItem('smsvc_user');
  showLanding();
  showToast('Logged out successfully', 'info');
}

// ====== API CALLS ======
async function apiSignup(email, password, referralCode) {
  const payload = { email, password };
  if (referralCode) payload.referral = referralCode;
  const res = await fetch('/api/auth/signup', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
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

async function apiForgotPassword(email) {
  const res = await fetch('/api/auth/forgot-password', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email })
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
    <section style="padding:120px 40px 40px;background:linear-gradient(180deg,rgba(13,155,122,0.12),rgba(255,255,255,0));">
      <div style="max-width:900px;margin:0 auto;text-align:center;">
        <h1 style="font-size:42px;font-weight:800;line-height:1.05;margin-bottom:20px;">Receive SMS Online with Temporary Numbers</h1>
        <p style="font-size:16px;color:var(--text-secondary);max-width:760px;margin:0 auto 18px;line-height:1.8;">When signing up for social media platforms, messaging apps, or various online services, SMS verification is often required.</p>
        <p style="font-size:16px;color:var(--text-secondary);max-width:760px;margin:0 auto 32px;line-height:1.8;">If you prefer not to purchase a new SIM card every time, you can use our service. We provide temporary phone numbers that allow you to receive SMS online instantly, anytime you need.</p>
      </div>
    </section>

    <section style="padding:0 40px 40px;">
      <div style="max-width:900px;margin:0 auto;display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:18px;">
        <div style="background:var(--bg-card);border:1px solid var(--border);border-radius:16px;padding:24px;box-shadow:var(--shadow-sm);">
          <h3 style="font-size:16px;font-weight:700;margin-bottom:12px;">Global SMS Coverage</h3>
          <p style="font-size:14px;color:var(--text-secondary);line-height:1.7;">Access numbers from over 30 countries with a pool of more than 1 million active numbers.</p>
        </div>
        <div style="background:var(--bg-card);border:1px solid var(--border);border-radius:16px;padding:24px;box-shadow:var(--shadow-sm);">
          <h3 style="font-size:16px;font-weight:700;margin-bottom:12px;">Loyalty Rewards Program</h3>
          <p style="font-size:14px;color:var(--text-secondary);line-height:1.7;">Enjoy exclusive benefits and perks designed for our regular and VIP users.</p>
        </div>
        <div style="background:var(--bg-card);border:1px solid var(--border);border-radius:16px;padding:24px;box-shadow:var(--shadow-sm);">
          <h3 style="font-size:16px;font-weight:700;margin-bottom:12px;">Flexible Payment Methods</h3>
          <p style="font-size:14px;color:var(--text-secondary);line-height:1.7;">Easily top up your balance using e-wallets, bank cards, or cryptocurrency.</p>
        </div>
        <div style="background:var(--bg-card);border:1px solid var(--border);border-radius:16px;padding:24px;box-shadow:var(--shadow-sm);">
          <h3 style="font-size:16px;font-weight:700;margin-bottom:12px;">Daily Number Refresh</h3>
          <p style="font-size:14px;color:var(--text-secondary);line-height:1.7;">Our system is updated every day with new, clean numbers ready to use.</p>
        </div>
        <div style="background:var(--bg-card);border:1px solid var(--border);border-radius:16px;padding:24px;box-shadow:var(--shadow-sm);">
          <h3 style="font-size:16px;font-weight:700;margin-bottom:12px;">Affiliate Opportunities</h3>
          <p style="font-size:14px;color:var(--text-secondary);line-height:1.7;">Invite others to join and earn rewards through our affiliate program.</p>
        </div>
        <div style="background:var(--bg-card);border:1px solid var(--border);border-radius:16px;padding:24px;box-shadow:var(--shadow-sm);">
          <h3 style="font-size:16px;font-weight:700;margin-bottom:12px;">Advanced API Integration</h3>
          <p style="font-size:14px;color:var(--text-secondary);line-height:1.7;">Develop and automate your registration processes with our simple and powerful API.</p>
        </div>
      </div>
    </section>

    <section style="padding:40px 40px;">
      <div style="max-width:900px;margin:0 auto;">
        <h2 style="font-size:32px;font-weight:700;text-align:center;letter-spacing:-0.5px;margin-bottom:24px;">Why use temporary phone numbers</h2>
        <div style="background:var(--bg-card);border:1px solid var(--border);border-radius:18px;padding:30px;box-shadow:var(--shadow-sm);">
          <p style="font-size:15px;color:var(--text-secondary);line-height:1.8;margin-bottom:20px;">When creating accounts, most websites require a valid mobile number, and typically only one account is allowed per number. By using temporary numbers, you can create and manage multiple accounts without limitations. This is especially useful for webmasters, marketers, and social media professionals who rely on multiple profiles for their work.</p>
          <p style="font-size:15px;color:var(--text-secondary);line-height:1.8;margin-bottom:20px;"><strong>Protect your privacy</strong><br>Your personal phone number can reveal sensitive details. Using temporary numbers helps keep your identity and information secure.</p>
          <p style="font-size:15px;color:var(--text-secondary);line-height:1.8;margin-bottom:20px;"><strong>Avoid scams and unwanted charges</strong><br>Some websites request phone numbers for downloads or access, which may lead to hidden subscriptions or spam. Temporary numbers help you avoid these risks.</p>
          <p style="font-size:15px;color:var(--text-secondary);line-height:1.8;margin-bottom:20px;"><strong>Take advantage of promotions</strong><br>Many platforms offer rewards or bonuses in exchange for phone verification. With temporary numbers, you can participate more freely without restrictions.</p>
          <p style="font-size:15px;color:var(--text-secondary);line-height:1.8;"><strong>Bypass regional restrictions</strong><br>Certain services limit access based on location. Temporary numbers from different countries allow you to register and use platforms without geographic barriers.</p>
        </div>
      </div>
    </section>

    <!-- PRODUCT LIST -->
    <section style="padding:0 40px 60px;">
      <div style="max-width:900px;margin:0 auto;">
        <h2 style="font-size:28px;font-weight:700;text-align:center;letter-spacing:-1px;margin-bottom:8px;">Available Services</h2>
        <p style="font-size:14px;color:var(--text-secondary);text-align:center;margin-bottom:32px;">Choose from 200+ services starting at $0.35</p>
        <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:12px;">
          ${getServiceListHTML()}
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
          <div style="position:relative;">
            <input type="password" id="loginPassword" placeholder="Enter your password" style="width:100%;padding:11px 40px 11px 14px;background:var(--bg-primary);border:1px solid var(--border);border-radius:10px;font-size:14px;font-family:inherit;color:var(--text-primary);outline:none;transition:border-color 0.2s;" onfocus="this.style.borderColor='var(--accent)'" onblur="this.style.borderColor='var(--border)'" onkeydown="if(event.key==='Enter')handleLogin()">
            <button type="button" onclick="togglePasswordVisibility('loginPassword')" style="position:absolute;right:10px;top:50%;transform:translateY(-50%);background:none;border:none;color:var(--text-secondary);cursor:pointer;font-size:14px;">
              <i class="fas fa-eye" id="loginPasswordIcon"></i>
            </button>
          </div>
          <div style="text-align:right;margin-top:8px;">
            <a href="#" onclick="event.preventDefault();showForgotPassword()" style="font-size:12px;color:var(--accent);text-decoration:none;">Forgot password?</a>
          </div>
        </div>

        <button class="btn btn-primary" style="width:100%;justify-content:center;padding:12px;" onclick="handleLogin()" id="loginBtn">
          Log In
        </button>

        <div style="margin-top:16px;display:flex;align-items:center;gap:8px;">
          <input type="checkbox" id="rememberMe" style="width:16px;height:16px;accent-color:var(--accent);">
          <label for="rememberMe" style="font-size:12px;color:var(--text-secondary);cursor:pointer;">Remember me</label>
        </div>
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
        <p style="font-size:13px;color:var(--text-secondary);margin-bottom:28px;">Use a valid email address when you sign up.</p>

        <div id="signupError" style="display:none;padding:10px 14px;background:rgba(217,48,37,0.06);border:1px solid rgba(217,48,37,0.15);border-radius:10px;font-size:13px;color:var(--danger);margin-bottom:16px;"></div>


        <div style="margin-bottom:18px;">
          <label style="display:block;font-size:12px;font-weight:600;color:var(--text-secondary);margin-bottom:8px;text-transform:uppercase;letter-spacing:0.5px;">Email</label>
          <input type="email" id="signupEmail" placeholder="you@example.com" style="width:100%;padding:11px 14px;background:var(--bg-primary);border:1px solid var(--border);border-radius:10px;font-size:14px;font-family:inherit;color:var(--text-primary);outline:none;transition:border-color 0.2s;" onfocus="this.style.borderColor='var(--accent)'" onblur="this.style.borderColor='var(--border)'">
        </div>

        <div style="margin-bottom:18px;">
          <label style="display:block;font-size:12px;font-weight:600;color:var(--text-secondary);margin-bottom:8px;text-transform:uppercase;letter-spacing:0.5px;">Password</label>
          <div style="position:relative;">
            <input type="password" id="signupPassword" placeholder="Min 6 characters" style="width:100%;padding:11px 40px 11px 14px;background:var(--bg-primary);border:1px solid var(--border);border-radius:10px;font-size:14px;font-family:inherit;color:var(--text-primary);outline:none;transition:border-color 0.2s;" onfocus="this.style.borderColor='var(--accent)'" onblur="this.style.borderColor='var(--border)'">
            <button type="button" onclick="togglePasswordVisibility('signupPassword')" style="position:absolute;right:10px;top:50%;transform:translateY(-50%);background:none;border:none;color:var(--text-secondary);cursor:pointer;font-size:14px;">
              <i class="fas fa-eye" id="signupPasswordIcon"></i>
            </button>
          </div>
        </div>

        <div style="margin-bottom:24px;">
          <label style="display:block;font-size:12px;font-weight:600;color:var(--text-secondary);margin-bottom:8px;text-transform:uppercase;letter-spacing:0.5px;">Confirm Password</label>
          <div style="position:relative;">
            <input type="password" id="signupConfirm" placeholder="Re-enter password" style="width:100%;padding:11px 40px 11px 14px;background:var(--bg-primary);border:1px solid var(--border);border-radius:10px;font-size:14px;font-family:inherit;color:var(--text-primary);outline:none;transition:border-color 0.2s;" onfocus="this.style.borderColor='var(--accent)'" onblur="this.style.borderColor='var(--border)'" onkeydown="if(event.key==='Enter')handleSignup()">
            <button type="button" onclick="togglePasswordVisibility('signupConfirm')" style="position:absolute;right:10px;top:50%;transform:translateY(-50%);background:none;border:none;color:var(--text-secondary);cursor:pointer;font-size:14px;">
              <i class="fas fa-eye" id="signupConfirmIcon"></i>
            </button>
          </div>
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

  setTimeout(() => document.getElementById('signupEmail').focus(), 100);
}

function renderForgotPassword() {
  const container = document.getElementById('authPages');
  container.innerHTML = `
    <nav style="position:fixed;top:0;left:0;right:0;height:60px;background:rgba(255,255,255,0.95);backdrop-filter:blur(16px);border-bottom:1px solid var(--border);display:flex;align-items:center;justify-content:space-between;padding:0 40px;z-index:100;">
      <div style="display:flex;align-items:center;gap:10px;cursor:pointer;" onclick="showLanding()">
        <div style="width:36px;height:36px;background:linear-gradient(135deg,var(--accent),#087a60);border-radius:10px;display:flex;align-items:center;justify-content:center;color:#fff;font-size:16px;">
          <i class="fas fa-comment-dots"></i>
        </div>
        <span style="font-weight:700;font-size:18px;">SMS Virtual <span style="color:var(--accent);">Code</span></span>
      </div>
      <div style="font-size:13px;color:var(--text-secondary);">Remember your password? <a href="#" onclick="event.preventDefault();showLogin()" style="color:var(--accent);font-weight:600;text-decoration:none;">Log in</a></div>
    </nav>

    <div style="max-width:400px;margin:120px auto 0;padding:0 20px;">
      <div style="background:var(--bg-card);border:1px solid var(--border);border-radius:20px;padding:36px;box-shadow:var(--shadow-md);">
        <h2 style="font-size:24px;font-weight:700;margin-bottom:6px;">Reset password</h2>
        <p style="font-size:13px;color:var(--text-secondary);margin-bottom:28px;">Enter your email address and we'll send you a link to reset your password.</p>

        <div id="forgotError" style="display:none;padding:10px 14px;background:rgba(217,48,37,0.06);border:1px solid rgba(217,48,37,0.15);border-radius:10px;font-size:13px;color:var(--danger);margin-bottom:16px;"></div>

        <div id="forgotSuccess" style="display:none;padding:10px 14px;background:rgba(13,155,122,0.06);border:1px solid rgba(13,155,122,0.15);border-radius:10px;font-size:13px;color:var(--accent);margin-bottom:16px;"></div>

        <div style="margin-bottom:24px;">
          <label style="display:block;font-size:12px;font-weight:600;color:var(--text-secondary);margin-bottom:8px;text-transform:uppercase;letter-spacing:0.5px;">Email</label>
          <input type="email" id="forgotEmail" placeholder="you@example.com" style="width:100%;padding:11px 14px;background:var(--bg-primary);border:1px solid var(--border);border-radius:10px;font-size:14px;font-family:inherit;color:var(--text-primary);outline:none;transition:border-color 0.2s;" onfocus="this.style.borderColor='var(--accent)'" onblur="this.style.borderColor='var(--border)'" onkeydown="if(event.key==='Enter')handleForgotPassword()">
        </div>

        <button class="btn btn-primary" style="width:100%;justify-content:center;padding:12px;" onclick="handleForgotPassword()" id="forgotBtn">
          Send Reset Link
        </button>

        <p style="font-size:11px;color:var(--text-muted);text-align:center;margin-top:16px;line-height:1.5;">
          Don't have an account? <a href="#" onclick="event.preventDefault();showSignup()" style="color:var(--accent);text-decoration:none;">Sign up</a>
        </p>
      </div>
    </div>
  `;

  setTimeout(() => document.getElementById('forgotEmail').focus(), 100);
}

// ====== FORM HANDLERS ======
async function handleLogin() {
  const email = document.getElementById('loginEmail').value.trim();
  const password = document.getElementById('loginPassword').value;
  const rememberMe = document.getElementById('rememberMe').checked;
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
      currentUser = { email: data.email, rememberMe: rememberMe };
      if (rememberMe) {
        localStorage.setItem('smsvc_user', JSON.stringify(currentUser));
      } else {
        sessionStorage.setItem('smsvc_user', JSON.stringify(currentUser));
      }
      showApp();
      showToast('Welcome back!', 'success');
    }
  } catch (e) {
    errorEl.style.display = 'block';
    errorEl.textContent = 'Connection error. Is the server running?';
  }

  btn.textContent = 'Log In';
  btn.disabled = false;
}

async function handleSignup() {
  const email = document.getElementById('signupEmail').value.trim();
  const password = document.getElementById('signupPassword').value;
  const confirm = document.getElementById('signupConfirm').value;
  const errorEl = document.getElementById('signupError');

  if (!email || !password || !confirm) {
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
    const referralCode = localStorage.getItem('referralCode');
    const data = await apiSignup(email, password, referralCode);
    if (data.error) {
      errorEl.style.display = 'block';
      errorEl.textContent = data.error;
    } else {
      currentUser = { email: data.email };
      localStorage.setItem('smsvc_user', JSON.stringify(currentUser));
      localStorage.removeItem('referralCode');
      showApp();
      showToast('Account created! $6.00 credits added.', 'success');
      
      // Open modal with selected service if available
      setTimeout(() => {
        const selectedServiceStr = localStorage.getItem('selectedService');
        if (selectedServiceStr) {
          try {
            const service = JSON.parse(selectedServiceStr);
            openModal(service);
            localStorage.removeItem('selectedService');
          } catch(e) {}
        }
      }, 100);
    }
  } catch (e) {
    errorEl.style.display = 'block';
    errorEl.textContent = 'Connection error. Is the server running?';
  }

  btn.textContent = 'Create Account';
  btn.disabled = false;
}

async function handleForgotPassword() {
  const email = document.getElementById('forgotEmail').value.trim();
  const errorEl = document.getElementById('forgotError');
  const successEl = document.getElementById('forgotSuccess');

  errorEl.style.display = 'none';
  successEl.style.display = 'none';

  if (!email) {
    errorEl.style.display = 'block';
    errorEl.textContent = 'Please enter your email address.';
    return;
  }

  const btn = document.getElementById('forgotBtn');
  btn.textContent = 'Sending...';
  btn.disabled = true;

  try {
    const data = await apiForgotPassword(email);
    if (data.error) {
      errorEl.style.display = 'block';
      errorEl.textContent = data.error;
    } else {
      successEl.style.display = 'block';
      successEl.textContent = 'If an account with that email exists, we\'ve sent you a password reset link.';
    }
  } catch (e) {
    errorEl.style.display = 'block';
    errorEl.textContent = 'Connection error. Is the server running?';
  }

  btn.textContent = 'Send Reset Link';
  btn.disabled = false;
}