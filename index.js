require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const db = require('./db');

const countries = [
  { code: 'US', name: 'United States', flag: '🇺🇸', prefix: '+1', basePrice: 0.50 },
  { code: 'UK', name: 'United Kingdom', flag: '🇬🇧', prefix: '+44', basePrice: 0.65 },
  { code: 'DE', name: 'Germany', flag: '🇩🇪', prefix: '+49', basePrice: 0.60 },
  { code: 'FR', name: 'France', flag: '🇫🇷', prefix: '+33', basePrice: 0.55 },
  { code: 'CA', name: 'Canada', flag: '🇨🇦', prefix: '+1', basePrice: 0.60 },
  { code: 'AU', name: 'Australia', flag: '🇦🇺', prefix: '+61', basePrice: 0.70 },
  { code: 'JP', name: 'Japan', flag: '🇯🇵', prefix: '+81', basePrice: 0.80 },
  { code: 'NL', name: 'Netherlands', flag: '🇳🇱', prefix: '+31', basePrice: 0.55 },
  { code: 'BJ', name: 'Benin', flag: '🇧🇯', prefix: '+229', basePrice: 3.00 },
  { code: 'SD', name: 'Sudan', flag: '🇸🇩', prefix: '+249', basePrice: 3.00 },
  { code: 'RE', name: 'Reunion', flag: '🇷🇪', prefix: '+262', basePrice: 3.00 },
  { code: 'DZ', name: 'Algeria', flag: '🇩🇿', prefix: '+213', basePrice: 3.00 },
  { code: 'BO', name: 'Bolivia', flag: '🇧🇴', prefix: '+591', basePrice: 3.00 },
  { code: 'ZM', name: 'Zambia', flag: '🇿🇲', prefix: '+260', basePrice: 3.00 },
  { code: 'KZ', name: 'Kazakhstan', flag: '🇰🇿', prefix: '+7', basePrice: 4.00 },
  { code: 'SS', name: 'South Sudan', flag: '🇸🇸', prefix: '+211', basePrice: 4.00 },
  { code: 'MV', name: 'Maldives', flag: '🇲🇻', prefix: '+960', basePrice: 4.00 },
  { code: 'LK', name: 'Sri Lanka', flag: '🇱🇰', prefix: '+94', basePrice: 4.00 },
  { code: 'ER', name: 'Eritrea', flag: '🇪🇷', prefix: '+291', basePrice: 4.00 },
  { code: 'AM', name: 'Armenia', flag: '🇦🇲', prefix: '+374', basePrice: 4.00 },
  { code: 'IR', name: 'Iran', flag: '🇮🇷', prefix: '+98', basePrice: 4.00 },
  { code: 'KM', name: 'Comoros', flag: '🇰🇲', prefix: '+269', basePrice: 4.00 },
  { code: 'EC', name: 'Ecuador', flag: '🇪🇨', prefix: '+593', basePrice: 4.00 },
  { code: 'LB', name: 'Lebanon', flag: '🇱🇧', prefix: '+961', basePrice: 4.00 },
  { code: 'IL', name: 'Israel', flag: '🇮🇱', prefix: '+972', basePrice: 5.00 },
  { code: 'EG', name: 'Egypt', flag: '🇪🇬', prefix: '+20', basePrice: 5.00 },
  { code: 'RS', name: 'Serbia', flag: '🇷🇸', prefix: '+381', basePrice: 10.00 },
  { code: 'SG', name: 'Singapore', flag: '🇸🇬', prefix: '+65', basePrice: 14.00 },
  { code: 'CN', name: 'China', flag: '🇨🇳', prefix: '+86', basePrice: 14.00 },
  { code: 'TW', name: 'Taiwan', flag: '🇹🇼', prefix: '+886', basePrice: 137.00 },
];

function generatePhone(prefix) {
  return `${prefix} ${Math.floor(Math.random()*900+100)} ${Math.floor(Math.random()*900+100)} ${Math.floor(Math.random()*9000+1000)}`;
}

function generateReferralCode() {
  let code;
  do {
    code = crypto.randomBytes(4).toString('hex');
  } while (db.prepare('SELECT email FROM users WHERE ref_code = ?').get(code));
  return code;
}

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// ====== AUTH: SIGNUP ======
app.post('/api/auth/signup', (req, res) => {
  const { email, password, referral } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'All fields are required' });
  if (password.length < 6) return res.status(400).json({ error: 'Password must be at least 6 characters' });
  const existing = db.prepare('SELECT email FROM users WHERE email = ?').get(email);
  if (existing) return res.status(400).json({ error: 'Email already registered' });
  const referrer = referral ? db.prepare('SELECT email FROM users WHERE ref_code = ?').get(referral) : null;
  const refCode = generateReferralCode();
  const hash = bcrypt.hashSync(password, 10);
  db.prepare('INSERT INTO users (email, password, balance, ref_code, referred_by) VALUES (?, ?, 6.00, ?, ?)')
    .run(email, hash, refCode, referrer ? referrer.email : null);
  res.json({ email, refCode, message: 'Account created. $6.00 credits added.' });
});

// ====== AUTH: LOGIN ======
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'All fields are required' });
  const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
  if (!user) return res.status(400).json({ error: 'Invalid email or password' });
  if (!user.password) return res.status(400).json({ error: 'This account has no password set' });
  if (!bcrypt.compareSync(password, user.password)) return res.status(400).json({ error: 'Invalid email or password' });
  res.json({ email: user.email, name: user.name });
});

// ====== AUTH: FORGOT PASSWORD ======
app.post('/api/auth/forgot-password', (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: 'Email is required' });
  const user = db.prepare('SELECT email FROM users WHERE email = ?').get(email);
  // Always return success for security (don't reveal if email exists)
  res.json({ message: 'If an account with that email exists, a password reset link has been sent.' });
});

// ====== GET USER BALANCE ======
app.get('/api/user/:email', (req, res) => {
  const user = db.prepare('SELECT balance, name, ref_code FROM users WHERE email = ?').get(req.params.email);
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json({ balance: user.balance, name: user.name, refCode: user.ref_code || null });
});

// ====== ADD BALANCE ======
app.post('/api/user/:email/balance', (req, res) => {
  const { amount } = req.body;
  if (!amount || amount <= 0) return res.status(400).json({ error: 'Invalid amount' });
  db.prepare('UPDATE users SET balance = balance + ? WHERE email = ?').run(amount, req.params.email);
  const user = db.prepare('SELECT balance FROM users WHERE email = ?').get(req.params.email);
  res.json({ balance: user.balance });
});

// ====== GET ACTIVE NUMBERS ======
app.get('/api/numbers/:email', (req, res) => {
  const rows = db.prepare('SELECT * FROM numbers WHERE email = ? ORDER BY created_at DESC').all(req.params.email);
  res.json(rows);
});

// ====== REQUEST NEW NUMBER ======
app.post('/api/numbers/request', async (req, res) => {
  const { email, serviceName, serviceId, countryCode, cost } = req.body;
  const user = db.prepare('SELECT balance, referred_by FROM users WHERE email = ?').get(email);
  if (!user) return res.status(404).json({ error: 'User not found' });
  if (user.balance < cost) return res.status(400).json({ error: 'Insufficient balance' });

  const useRealProvider = process.env.SMS_API_KEY && process.env.SMS_API_KEY !== 'YOUR_API_KEY_HERE';
  let realPhone = null;
  let providerRequestId = null;

  if (useRealProvider) {
    try {
      const provider = require('./sms-provider');
      const serviceCode = provider.getServiceCode(serviceName);
      const countryCodeForProvider = provider.getCountryCode(countryCode);
           const result = await provider.getNumber(serviceCode, countryCodeForProvider);
      if (!result.success || !result.phone) {
        const errorMsg = (typeof result === 'string') ? result : (result.error || result.message || 'No numbers available. Try a different country.');
        return res.status(400).json({ error: errorMsg });
      }
      realPhone = result.phone;
      providerRequestId = result.requestId;
    } catch (err) {
      console.error('SMS Provider Error:', err.message);
      return res.status(500).json({ error: 'Failed to get number from provider: ' + err.message });
    }
  } else {
    // Demo mode - generate fake number
    const country = countries.find(c => c.code === countryCode);
    if (!country) return res.status(400).json({ error: 'Invalid country code' });
    realPhone = generatePhone(country.prefix);
  }

  db.prepare('UPDATE users SET balance = balance - ? WHERE email = ?').run(cost, email);
  if (user.referred_by) {
    const referralBonus = parseFloat((cost * 0.02).toFixed(2));
    if (referralBonus > 0) {
      db.prepare('UPDATE users SET balance = balance + ? WHERE email = ?').run(referralBonus, user.referred_by);
    }
  }
  const insertResult = db.prepare(
    'INSERT INTO numbers (email, service_name, service_id, phone, status, time_left, total_time, cost, provider_request_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)'
  ).run(email, serviceName, serviceId, realPhone, 'waiting', 1200, 1200, cost, providerRequestId);

  if (useRealProvider && providerRequestId) {
    startPolling(insertResult.lastInsertRowid, providerRequestId, serviceName);
  }

  res.json({ id: insertResult.lastInsertRowid, phone: realPhone, status: 'waiting', timeLeft: 1200, totalTime: 1200, cost, balance: user.balance - cost });
});

// ====== REAL SMS POLLING ======
function startPolling(numberId, providerRequestId, serviceName) {
  const provider = require('./sms-provider');
  let attempts = 0;
  const maxAttempts = 120;
  const interval = setInterval(async () => {
    attempts++;
    try {
      const result = await provider.checkCode(providerRequestId);
      if (result.success && result.code) {
        clearInterval(interval);
        const smsText = 'Your ' + serviceName + ' verification code is ' + result.code + '. Do not share it with anyone.';
        db.prepare('UPDATE numbers SET status = ?, code = ?, sms_text = ? WHERE id = ?').run('received', result.code, smsText, numberId);
        db.prepare('INSERT INTO history (email, service_name, phone, code, status, cost) SELECT email, service_name, phone, ?, ?, cost FROM numbers WHERE id = ?').run(result.code, 'success', numberId);
        provider.complete(providerRequestId).catch(function() {});
        console.log('Code received for number ' + numberId + ': ' + result.code);
      }
      if (result.success === false && result.waiting === false) clearInterval(interval);
    } catch (err) {
      console.error('Polling error for ' + numberId + ':', err.message);
    }
    if (attempts >= maxAttempts) clearInterval(interval);
  }, 5000);
}

// ====== CANCEL NUMBER ======
app.delete('/api/numbers/:id', async (req, res) => {
  const num = db.prepare('SELECT * FROM numbers WHERE id = ?').get(req.params.id);
  if (!num) return res.status(404).json({ error: 'Number not found' });
  if (num.status !== 'waiting') return res.status(400).json({ error: 'Can only cancel waiting numbers' });
  if (num.provider_request_id) {
    try {
      const provider = require('./sms-provider');
      await provider.cancel(num.provider_request_id);
    } catch (err) {
      console.error('Provider cancel error:', err.message);
    }
  }
  db.prepare('UPDATE users SET balance = balance + ? WHERE email = ?').run(num.cost, num.email);
  db.prepare('DELETE FROM numbers WHERE id = ?').run(req.params.id);
  const user = db.prepare('SELECT balance FROM users WHERE email = ?').get(num.email);
  res.json({ message: 'Cancelled and refunded', balance: user.balance });
});

// ====== EXPIRE NUMBER ======
app.post('/api/numbers/:id/expire', (req, res) => {
  const num = db.prepare('SELECT * FROM numbers WHERE id = ?').get(req.params.id);
  if (!num) return res.status(404).json({ error: 'Number not found' });
  db.prepare('UPDATE users SET balance = balance + ? WHERE email = ?').run(num.cost, num.email);
  db.prepare('UPDATE numbers SET status = ?, time_left = 0 WHERE id = ?').run('expired', req.params.id);
  db.prepare('INSERT INTO history (email, service_name, phone, code, status, cost) VALUES (?, ?, ?, NULL, ?, ?)').run(num.email, num.service_name, num.phone, 'failed', num.cost);
  const user = db.prepare('SELECT balance FROM users WHERE email = ?').get(num.email);
  res.json({ balance: user.balance });
});

// ====== RECEIVE SMS CODE ======
app.post('/api/numbers/:id/receive', (req, res) => {
  const { code, smsText } = req.body;
  const num = db.prepare('SELECT * FROM numbers WHERE id = ? AND status = ?').get(req.params.id, 'waiting');
  if (!num) return res.status(404).json({ error: 'Number not found or not waiting' });
  db.prepare('UPDATE numbers SET status = ?, code = ?, sms_text = ? WHERE id = ?').run('received', code, smsText, req.params.id);
  db.prepare('INSERT INTO history (email, service_name, phone, code, status, cost) VALUES (?, ?, ?, ?, ?, ?)').run(num.email, num.service_name, num.phone, code, 'success', num.cost);
  res.json({ message: 'Code received', code });
});

// ====== GET HISTORY ======
app.get('/api/history/:email', (req, res) => {
  const rows = db.prepare('SELECT * FROM history WHERE email = ? ORDER BY created_at DESC').all(req.params.email);
  res.json(rows);
});

// ====== SIMULATE RECEIVE ======
app.post('/api/simulate/:id', (req, res) => {
  const num = db.prepare('SELECT * FROM numbers WHERE id = ? AND status = ?').get(req.params.id, 'waiting');
  if (!num) return res.json({ message: 'No waiting number found' });
  const code = String(Math.floor(100000 + Math.random() * 900000));
  const smsText = 'Your ' + num.service_name + ' verification code is ' + code + '. Do not share it with anyone.';
  db.prepare('UPDATE numbers SET status = ?, code = ?, sms_text = ? WHERE id = ?').run('received', code, smsText, req.params.id);
  db.prepare('INSERT INTO history (email, service_name, phone, code, status, cost) VALUES (?, ?, ?, ?, ?, ?)').run(num.email, num.service_name, num.phone, code, 'success', num.cost);
  res.json({ message: 'Simulated SMS received', code, phone: num.phone, service: num.service_name });
});

// ====== NOWPAYMENTS SIGNATURE VERIFICATION ======
function sortObjectKeys(obj) {
  if (typeof obj !== 'object' || obj === null) return obj;
  if (Array.isArray(obj)) return obj.map(sortObjectKeys);
  return Object.keys(obj).sort().reduce((acc, key) => {
    acc[key] = sortObjectKeys(obj[key]);
    return acc;
  }, {});
}

function verifyNowPaymentsSignature(payloadString, signature, ipnSecret) {
  var hmac = crypto.createHmac('sha512', ipnSecret);
  hmac.update(payloadString);
  return hmac.digest('hex') === signature;
}

// ====== NOWPAYMENTS DEPOSIT (CREATE INVOICE) ======
app.post('/api/deposit', async (req, res) => {
  const { email, amount, method } = req.body;
  if (!email || !amount) return res.status(400).json({ error: 'All fields required' });
  if (amount < 2) return res.status(400).json({ error: 'Minimum deposit is $2.00' });
  if (amount > 1000) return res.status(400).json({ error: 'Maximum deposit is $1,000.00' });

  const reference = 'DEP-' + Date.now().toString(36).toUpperCase() + '-' + Math.random().toString(36).substring(2, 6).toUpperCase();
  db.prepare('INSERT INTO deposits (email, amount, method, status, reference) VALUES (?, ?, ?, ?, ?)').run(email, amount, 'crypto', 'pending', reference);

  try {
    var apiKey = process.env.NOWPAYMENTS_API_KEY;
    var callbackUrl = process.env.FRONTEND_URL + '/api/deposit/nowpayments-callback';
    var successUrl = process.env.FRONTEND_URL + '/?deposit=success&ref=' + reference;

    var response = await fetch('https://api.nowpayments.io/v1/invoice', {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        price_amount: String(amount),
        price_currency: 'usd',
        order_id: reference,
        order_description: 'Deposit to Vesioh - ' + email,
        ipn_callback_url: callbackUrl,
        success_url: successUrl,
        cancel_url: process.env.FRONTEND_URL + '/?deposit=failed'
      })
    });

    var data = await response.json();
    if (data.invoice_url) {
      res.json({ success: true, url: data.invoice_url, reference: reference });
    } else {
      db.prepare('UPDATE deposits SET status = ? WHERE reference = ?').run('failed', reference);
      res.status(500).json({ error: data.message || 'Failed to create payment invoice' });
    }
  } catch (err) {
    console.error('NowPayments Error:', err.message);
    db.prepare('UPDATE deposits SET status = ? WHERE reference = ?').run('failed', reference);
    res.status(500).json({ error: 'Payment error: ' + err.message });
  }
});

// ====== NOWPAYMENTS IPN CALLBACK (AUTOMATIC BALANCE UPDATE) ======
app.post('/api/deposit/nowpayments-callback', async (req, res) => {
  try {
    var signature = req.headers['x-nowpayments-sig'] || req.body.rpm_sign;
    var sortedPayload = sortObjectKeys(req.body);
    var payloadString = JSON.stringify(sortedPayload);
    var ipnSecret = process.env.NOWPAYMENTS_IPN_SECRET;

    if (!verifyNowPaymentsSignature(payloadString, signature, ipnSecret)) {
      console.error('NowPayments IPN signature mismatch');
      return res.status(400).json({ error: 'Invalid signature' });
    }

    var paymentStatus = req.body.payment_status;
    var reference = req.body.order_id;

    if (paymentStatus === 'finished' || paymentStatus === 'confirmed') {
      var deposit = db.prepare('SELECT * FROM deposits WHERE reference = ? AND status = ?').get(reference, 'pending');
      if (deposit) {
        var received = parseFloat(req.body.actual_paid_amount) || deposit.amount;
        db.prepare('UPDATE deposits SET status = ? WHERE reference = ?').run('completed', reference);
        db.prepare('UPDATE users SET balance = balance + ? WHERE email = ?').run(received, deposit.email);
        console.log('Deposit approved: ' + reference + ' $' + received + ' for ' + deposit.email);
      }
    }
    res.json({ status: 'ok' });
  } catch (err) {
    console.error('NowPayments IPN Error:', err.message);
    res.status(500).json({ error: 'Callback failed' });
  }
});

// ====== START ======
const PORT = process.env.PORT || 3000;

app.use(function(req, res) {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log('Server started on port ' + PORT);
});