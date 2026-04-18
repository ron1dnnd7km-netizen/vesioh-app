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

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// ====== AUTH: SIGNUP ======
app.post('/api/auth/signup', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'All fields are required' });
  if (password.length < 6) return res.status(400).json({ error: 'Password must be at least 6 characters' });
  const existing = db.prepare('SELECT email FROM users WHERE email = ?').get(email);
  if (existing) return res.status(400).json({ error: 'Email already registered' });
  const hash = bcrypt.hashSync(password, 10);
  db.prepare('INSERT INTO users (email, name, password, balance) VALUES (?, ?, ?, 6.00)').run(email, email, hash);
  res.json({ email, name: email, message: 'Account created. $6.00 credits added.' });
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

// ====== GET USER BALANCE ======
app.get('/api/user/:email', (req, res) => {
  const user = db.prepare('SELECT balance, name FROM users WHERE email = ?').get(req.params.email);
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json({ balance: user.balance, name: user.name });
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
  const user = db.prepare('SELECT balance FROM users WHERE email = ?').get(email);
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
      if (!result.success) return res.status(400).json({ error: result.error || 'No numbers available. Try a different country.' });
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

// ====== CRYPTOMUS SIGN ======
function cryptomusSign(bodyString, apiKey) {
  var hmac = crypto.createHmac('sha256', apiKey);
  hmac.update(bodyString);
  return hmac.digest('hex');
}

// ====== DEPOSIT ======
app.post('/api/deposit', async (req, res) => {
  const { email, amount, method } = req.body;
  if (!email || !amount || !method) return res.status(400).json({ error: 'All fields required' });
  if (amount < 2) return res.status(400).json({ error: 'Minimum deposit is $2.00' });
  if (amount > 1000) return res.status(400).json({ error: 'Maximum deposit is $1,000.00' });

  const reference = 'DEP-' + Date.now().toString(36).toUpperCase() + '-' + Math.random().toString(36).substring(2, 6).toUpperCase();
  db.prepare('INSERT INTO deposits (email, amount, method, status, reference) VALUES (?, ?, ?, ?, ?)').run(email, amount, method, 'pending', reference);

  try {
    var merchantUuid = process.env.CRYPTOMUS_MERCHANT_UUID;
    var apiKey = process.env.CRYPTOMUS_API_KEY;

    // Build body WITH merchant field
    var bodyObj = {
      merchant: merchantUuid,
      amount: String(amount),
      currency: 'USDT',
      network: 'tron', // TRC20 network for USDT
      callback_url: process.env.FRONTEND_URL + '/api/deposit/callback',
      return_url: process.env.FRONTEND_URL + '/?deposit=success&ref=' + reference,
      order_id: reference,
      lifetime: 3600
    };

    var bodyString = JSON.stringify(bodyObj);
    var sign = cryptomusSign(bodyString, apiKey);

    console.log('=== CRYPTOMUS DEBUG ===');
    console.log('Merchant UUID:', merchantUuid);
    console.log('API Key (first 10):', apiKey ? apiKey.substring(0, 10) + '...' : 'MISSING');
    console.log('Body string:', bodyString);
    console.log('Sign:', sign);

    // Add timeout to prevent hanging
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

    var cryptoResponse = await fetch('https://api.cryptomus.com/v1/payment', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'sign': sign
      },
      body: bodyString,
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    var cryptoData = await cryptoResponse.json();
    console.log('Response:', JSON.stringify(cryptoData));
    console.log('=== END DEBUG ===');

    if (!cryptoResponse.ok) {
      throw new Error(`Cryptomus API error: ${cryptoResponse.status} ${cryptoResponse.statusText}`);
    }

    if (cryptoData.state === 0 && cryptoData.result && cryptoData.result.url) {
      res.json({
        success: true,
        url: cryptoData.result.url,
        reference: reference,
        message: 'Redirecting to payment...'
      });
    } else {
      var errMsg = cryptoData.message || cryptoData.error || JSON.stringify(cryptoData);
      db.prepare('UPDATE deposits SET status = ? WHERE reference = ?').run('failed', reference);
      res.status(500).json({ error: 'Cryptomus error: ' + errMsg });
    }
  } catch (err) {
    console.error('Cryptomus Error:', err.message);
    db.prepare('UPDATE deposits SET status = ? WHERE reference = ?').run('failed', reference);

    // Handle different types of errors
    if (err.name === 'AbortError') {
      res.status(500).json({ error: 'Payment request timed out. Please try again.' });
    } else if (err.message.includes('fetch')) {
      res.status(500).json({ error: 'Network error connecting to payment service. Please try again.' });
    } else {
      res.status(500).json({ error: 'Payment error: ' + err.message });
    }
  }
});

// ====== CRYPTOMUS CALLBACK ======
app.post('/api/deposit/callback', async (req, res) => {
  try {
    var data = req.body;
    console.log('Cryptomus callback:', JSON.stringify(data));
    if (data.status === 'paid' || data.status === 'paid_over') {
      var reference = data.order_id;
      var deposit = db.prepare('SELECT * FROM deposits WHERE reference = ? AND status = ?').get(reference, 'pending');
      if (deposit) {
        var received = parseFloat(data.payment_amount_usd) || deposit.amount;
        db.prepare('UPDATE deposits SET status = ? WHERE reference = ?').run('completed', reference);
        db.prepare('UPDATE users SET balance = balance + ? WHERE email = ?').run(received, deposit.email);
        console.log('Deposit approved: ' + reference + ' $' + received + ' for ' + deposit.email);
      }
    }
    res.json({ ok: true });
  } catch (err) {
    console.error('Callback error:', err.message);
    res.status(500).json({ error: 'Callback failed' });
  }
});

// ====== GET DEPOSITS ======
app.get('/api/deposits/:email', (req, res) => {
  const rows = db.prepare('SELECT * FROM deposits WHERE email = ? ORDER BY created_at DESC').all(req.params.email);
  res.json(rows);
});

// ====== START ======
const PORT = process.env.PORT || 3000;

app.use(function(req, res) {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log('Server started on port ' + PORT);
});