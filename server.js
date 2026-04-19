require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');

var db;
try {
  db = require('./db');
} catch (err) {
  console.error('FATAL: Cannot load db.js - ' + err.message);
  process.exit(1);
}

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
  { code: 'IL', name: 'Israel', flag: '🇮🇷', prefix: '+972', basePrice: 5.00 },
  { code: 'EG', name: 'Egypt', flag: '🇪🇬', prefix: '+20', basePrice: 5.00 },
  { code: 'RS', name: 'Serbia', flag: '🇷🇸', prefix: '+381', basePrice: 10.00 },
  { code: 'SG', name: 'Singapore', flag: '🇸🇬', prefix: '+65', basePrice: 14.00 },
  { code: 'CN', name: 'China', flag: '🇨🇳', prefix: '+86', basePrice: 14.00 },
  { code: 'TW', name: 'Taiwan', flag: '🇹🇼', prefix: '+886', basePrice: 137.00 }
];

function generatePhone(prefix) {
  return prefix + ' ' + Math.floor(Math.random() * 900 + 100) + ' ' + Math.floor(Math.random() * 900 + 100) + ' ' + Math.floor(Math.random() * 9000 + 1000);
}

function sortObjectKeys(obj) {
  if (typeof obj !== 'object' || obj === null) return obj;
  if (Array.isArray(obj)) return obj.map(sortObjectKeys);
  var sorted = {};
  Object.keys(obj).sort().forEach(function(key) {
    sorted[key] = sortObjectKeys(obj[key]);
  });
  return sorted;
}

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// ====== AUTH ======
app.post('/api/auth/signup', function(req, res) {
  var email = req.body.email;
  var password = req.body.password;
  if (!email || !password) return res.status(400).json({ error: 'All fields are required' });
  if (password.length < 6) return res.status(400).json({ error: 'Password must be at least 6 characters' });
  var existing = db.prepare('SELECT email FROM users WHERE email = ?').get(email);
  if (existing) return res.status(400).json({ error: 'Email already registered' });
  var hash = bcrypt.hashSync(password, 10);
  db.prepare('INSERT INTO users (email, password, balance) VALUES (?, ?, 6.00)').run(email, hash);
  res.json({ email: email, message: 'Account created. $6.00 credits added.' });
});

app.post('/api/auth/login', function(req, res) {
  var email = req.body.email;
  var password = req.body.password;
  if (!email || !password) return res.status(400).json({ error: 'All fields are required' });
  var user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
  if (!user) return res.status(400).json({ error: 'Invalid email or password' });
  if (!user.password) return res.status(400).json({ error: 'This account has no password set' });
  if (!bcrypt.compareSync(password, user.password)) return res.status(400).json({ error: 'Invalid email or password' });
  res.json({ email: user.email, name: user.name });
});

app.post('/api/auth/forgot-password', function(req, res) {
  if (!req.body.email) return res.status(400).json({ error: 'Email is required' });
  res.json({ message: 'If an account with that email exists, a password reset link has been sent.' });
});

// ====== USER ======
app.get('/api/user/:email', function(req, res) {
  var user = db.prepare('SELECT balance FROM users WHERE email = ?').get(req.params.email);
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json({ balance: user.balance });
});

app.post('/api/user/:email/balance', function(req, res) {
  var amount = req.body.amount;
  if (!amount || amount <= 0) return res.status(400).json({ error: 'Invalid amount' });
  db.prepare('UPDATE users SET balance = balance + ? WHERE email = ?').run(amount, req.params.email);
  var user = db.prepare('SELECT balance FROM users WHERE email = ?').get(req.params.email);
  res.json({ balance: user.balance });
});

// ====== NOWPAYMENTS HELPER ======
async function createNowInvoice(amount, payCurrency, reference, email) {
  var apiKey = process.env.NOWPAYMENTS_API_KEY;
  if (!apiKey) throw new Error('NowPayments API key not configured in .env');

  var body = {
    price_amount: amount,
    price_currency: 'usd',
    pay_currency: payCurrency,
    order_id: reference,
    order_description: 'SMS Virtual Code deposit - ' + email,
    ipn_callback_url: process.env.FRONTEND_URL + '/api/deposit/nowpayments-callback',
    success_url: process.env.FRONTEND_URL + '/?deposit=success&ref=' + reference,
    cancel_url: process.env.FRONTEND_URL + '/?deposit=failed'
  };

  var controller = new AbortController();
  var timer = setTimeout(function() { controller.abort(); }, 30000);

  var response = await fetch('https://api.nowpayments.io/v1/invoice', {
    method: 'POST',
    headers: { 'x-api-key': apiKey, 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    signal: controller.signal
  });

  clearTimeout(timer);
  var data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'NowPayments error ' + response.status);
  }
  if (!data.invoice_url) {
    throw new Error(data.message || 'No invoice URL returned');
  }
  return data;
}

// ====== DEPOSIT: USDT & CARDS ======
app.post('/api/deposit', async function(req, res) {
  var email = req.body.email;
  var amount = req.body.amount;
  var method = req.body.method;

  if (!email || !amount) return res.status(400).json({ error: 'All fields required' });
  if (amount < 2) return res.status(400).json({ error: 'Minimum deposit is $2.00' });
  if (amount > 1000) return res.status(400).json({ error: 'Maximum deposit is $1,000.00' });

  var reference = 'DEP-' + Date.now().toString(36).toUpperCase() + '-' + Math.random().toString(36).substring(2, 6).toUpperCase();

  if (method === 'stripe') {
    db.prepare('INSERT INTO deposits (email, amount, method, status, reference) VALUES (?, ?, ?, ?, ?)').run(email, amount, 'stripe', 'failed', reference);
    return res.status(400).json({ error: 'Card payments coming soon. Use USDT or Cryptocurrency.' });
  }

  var payCurrency = req.body.pay_currency || 'usdttrc20';
  
  db.prepare('INSERT INTO deposits (email, amount, method, status, reference, pay_currency) VALUES (?, ?, ?, ?, ?, ?)').run(email, amount, method, 'pending', reference, payCurrency);

  try {
    var result = await createNowInvoice(amount, payCurrency, reference, email);
    res.json({ success: true, url: result.invoice_url, reference: reference });
  } catch (err) {
    console.error('Deposit error:', err.message);
    db.prepare('UPDATE deposits SET status = ? WHERE reference = ?').run('failed', reference);
    res.status(500).json({ error: 'Payment error: ' + err.message });
  }
});

// ====== DEPOSIT: CRYPTO PICKER ======
app.post('/api/deposit/nowpayments', async function(req, res) {
  var email = req.body.email;
  var amount = req.body.amount;
  var payCurrency = req.body.pay_currency;

  if (!email || !amount || !payCurrency) return res.status(400).json({ error: 'All fields required' });
  if (amount < 2) return res.status(400).json({ error: 'Minimum deposit is $2.00' });
  if (amount > 1000) return res.status(400).json({ error: 'Maximum deposit is $1,000.00' });

  var reference = 'DEP-' + Date.now().toString(36).toUpperCase() + '-' + Math.random().toString(36).substring(2, 6).toUpperCase();
  db.prepare('INSERT INTO deposits (email, amount, method, status, reference, pay_currency) VALUES (?, ?, ?, ?, ?, ?)').run(email, amount, 'crypto', 'pending', reference, payCurrency);

  try {
    var result = await createNowInvoice(amount, payCurrency, reference, email);
    res.json({ success: true, invoice_url: result.invoice_url, reference: reference });
  } catch (err) {
    console.error('Crypto deposit error:', err.message);
    db.prepare('UPDATE deposits SET status = ? WHERE reference = ?').run('failed', reference);
    res.status(500).json({ error: 'Payment error: ' + err.message });
  }
});

// ====== NOWPAYMENTS CALLBACK ======
app.post('/api/deposit/nowpayments-callback', function(req, res) {
  try {
    var signature = req.headers['x-nowpayments-sig'] || '';
    var ipnSecret = process.env.NOWPAYMENTS_IPN_SECRET;

    if (ipnSecret && signature) {
      var sorted = sortObjectKeys(req.body);
      var payloadStr = JSON.stringify(sorted);
      var hmac = crypto.createHmac('sha512', ipnSecret);
      hmac.update(payloadStr);
      var calculated = hmac.digest('hex');
      if (calculated.toLowerCase() !== signature.toLowerCase()) {
        console.error('NowPayments callback: bad signature');
        return res.status(400).json({ error: 'Invalid signature' });
      }
    }

    var status = req.body.payment_status;
    var orderId = req.body.order_id;

    console.log('NowPayments callback: status=' + status + ' order=' + orderId);

    if (status === 'finished' || status === 'confirmed') {
      var deposit = db.prepare('SELECT * FROM deposits WHERE reference = ? AND status = ?').get(orderId, 'pending');
      if (deposit) {
        var creditAmount = parseFloat(req.body.price_amount) || deposit.amount;
        db.prepare('UPDATE deposits SET status = ? WHERE reference = ?').run('completed', orderId);
        db.prepare('UPDATE users SET balance = balance + ? WHERE email = ?').run(creditAmount, deposit.email);
        console.log('Credited: ' + orderId + ' $' + creditAmount + ' -> ' + deposit.email);
      }
    } else if (status === 'failed' || status === 'expired' || status === 'reversed') {
      db.prepare('UPDATE deposits SET status = ? WHERE reference = ? AND status = ?').run('failed', orderId, 'pending');
    }

    res.json({ status: 'ok' });
  } catch (err) {
    console.error('Callback error:', err.message);
    res.status(200).json({ status: 'ok' });
  }
});

// ====== NUMBERS ======
app.get('/api/numbers/:email', function(req, res) {
  var rows = db.prepare('SELECT * FROM numbers WHERE email = ? ORDER BY created_at DESC').all(req.params.email);
  res.json(rows);
});

app.post('/api/numbers/request', async function(req, res) {
  var email = req.body.email;
  var serviceName = req.body.serviceName;
  var serviceId = req.body.serviceId;
  var countryCode = req.body.countryCode;
  var cost = req.body.cost;

  var user = db.prepare('SELECT balance FROM users WHERE email = ?').get(email);
  if (!user) return res.status(404).json({ error: 'User not found' });
  if (user.balance < cost) return res.status(400).json({ error: 'Insufficient balance' });

  var useRealProvider = process.env.SMS_API_KEY && process.env.SMS_API_KEY !== 'YOUR_API_KEY_HERE';
  var realPhone = null;
  var providerRequestId = null;

  if (useRealProvider) {
    try {
      var provider = require('./sms-provider');
      var serviceCode = provider.getServiceCode(serviceName);
      var countryCodeForProvider = provider.getCountryCode(countryCode);
      var result = await provider.getNumber(serviceCode, countryCodeForProvider);
      if (!result.success) return res.status(400).json({ error: result.error || 'No numbers available. Try a different country.' });
      realPhone = result.phone;
      providerRequestId = result.requestId;
    } catch (err) {
      console.error('SMS Provider Error:', err.message);
      return res.status(500).json({ error: 'Failed to get number from provider: ' + err.message });
    }
  } else {
    var country = countries.find(function(c) { return c.code === countryCode; });
    if (!country) return res.status(400).json({ error: 'Invalid country code' });
    realPhone = generatePhone(country.prefix);
  }

  db.prepare('UPDATE users SET balance = balance - ? WHERE email = ?').run(cost, email);
  var insertResult = db.prepare('INSERT INTO numbers (email, service_name, service_id, phone, status, time_left, total_time, cost, provider_request_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)').run(email, serviceName, serviceId, realPhone, 'waiting', 1200, 1200, cost, providerRequestId);

  if (useRealProvider && providerRequestId) {
    startPolling(insertResult.lastInsertRowid, providerRequestId, serviceName);
  }

  res.json({ id: insertResult.lastInsertRowid, phone: realPhone, status: 'waiting', timeLeft: 1200, totalTime: 1200, cost: cost, balance: user.balance - cost });
});

function startPolling(numberId, providerRequestId, serviceName) {
  var provider = require('./sms-provider');
  var attempts = 0;
  var interval = setInterval(async function() {
    attempts++;
    try {
      var result = await provider.checkCode(providerRequestId);
      if (result.success && result.code) {
        clearInterval(interval);
        var smsText = 'Your ' + serviceName + ' verification code is ' + result.code + '. Do not share it with anyone.';
        db.prepare('UPDATE numbers SET status = ?, code = ?, sms_text = ? WHERE id = ?').run('received', result.code, smsText, numberId);
        db.prepare('INSERT INTO history (email, service_name, phone, code, status, cost) SELECT email, service_name, phone, ?, ?, cost FROM numbers WHERE id = ?').run(result.code, 'success', numberId);
        provider.complete(providerRequestId).catch(function() {});
      }
      if (result.success === false && result.waiting === false) clearInterval(interval);
    } catch (err) {
      console.error('Polling error for ' + numberId + ':', err.message);
    }
    if (attempts >= 120) clearInterval(interval);
  }, 5000);
}

app.delete('/api/numbers/:id', async function(req, res) {
  var num = db.prepare('SELECT * FROM numbers WHERE id = ?').get(req.params.id);
  if (!num) return res.status(404).json({ error: 'Number not found' });
  if (num.status !== 'waiting') return res.status(400).json({ error: 'Can only cancel waiting numbers' });
  if (num.provider_request_id) {
    try { var provider = require('./sms-provider'); await provider.cancel(num.provider_request_id); } catch (err) { console.error('Cancel error:', err.message); }
  }
  db.prepare('UPDATE users SET balance = balance + ? WHERE email = ?').run(num.cost, num.email);
  db.prepare('DELETE FROM numbers WHERE id = ?').run(req.params.id);
  var user = db.prepare('SELECT balance FROM users WHERE email = ?').get(num.email);
  res.json({ message: 'Cancelled and refunded', balance: user.balance });
});

app.post('/api/numbers/:id/expire', function(req, res) {
  var num = db.prepare('SELECT * FROM numbers WHERE id = ?').get(req.params.id);
  if (!num) return res.status(404).json({ error: 'Number not found' });
  db.prepare('UPDATE users SET balance = balance + ? WHERE email = ?').run(num.cost, num.email);
  db.prepare('UPDATE numbers SET status = ?, time_left = 0 WHERE id = ?').run('expired', req.params.id);
  db.prepare('INSERT INTO history (email, service_name, phone, code, status, cost) VALUES (?, ?, ?, NULL, ?, ?)').run(num.email, num.service_name, num.phone, 'failed', num.cost);
  var user = db.prepare('SELECT balance FROM users WHERE email = ?').get(num.email);
  res.json({ balance: user.balance });
});

app.post('/api/numbers/:id/receive', function(req, res) {
  var code = req.body.code;
  var smsText = req.body.smsText;
  var num = db.prepare('SELECT * FROM numbers WHERE id = ? AND status = ?').get(req.params.id, 'waiting');
  if (!num) return res.status(404).json({ error: 'Number not found or not waiting' });
  db.prepare('UPDATE numbers SET status = ?, code = ?, sms_text = ? WHERE id = ?').run('received', code, smsText, req.params.id);
  db.prepare('INSERT INTO history (email, service_name, phone, code, status, cost) VALUES (?, ?, ?, ?, ?, ?)').run(num.email, num.service_name, num.phone, code, 'success', num.cost);
  res.json({ message: 'Code received', code: code });
});

// ====== HISTORY ======
app.get('/api/history/:email', function(req, res) {
  var rows = db.prepare('SELECT * FROM history WHERE email = ? ORDER BY created_at DESC').all(req.params.email);
  res.json(rows);
});

app.post('/api/simulate/:id', function(req, res) {
  var num = db.prepare('SELECT * FROM numbers WHERE id = ? AND status = ?').get(req.params.id, 'waiting');
  if (!num) return res.json({ message: 'No waiting number found' });
  var code = String(Math.floor(100000 + Math.random() * 900000));
  var smsText = 'Your ' + num.service_name + ' verification code is ' + code + '. Do not share it with anyone.';
  db.prepare('UPDATE numbers SET status = ?, code = ?, sms_text = ? WHERE id = ?').run('received', code, smsText, num.id);
  db.prepare('INSERT INTO history (email, service_name, phone, code, status, cost) VALUES (?, ?, ?, ?, ?, ?)').run(num.email, num.service_name, num.phone, code, 'success', num.cost);
  res.json({ message: 'Simulated SMS received', code: code, phone: num.phone, service: num.service_name });
});

// ====== DEPOSITS HISTORY ======
app.get('/api/deposits/:email', function(req, res) {
  var rows = db.prepare('SELECT * FROM deposits WHERE email = ? ORDER BY created_at DESC').all(req.params.email);
  res.json(rows);
});

// ====== CATCH-ALL ======
app.use(function(req, res) {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// ====== START ======
var PORT = process.env.PORT || 3000;
app.listen(PORT, function() {
  console.log('Server started on port ' + PORT);
  console.log('NowPayments API Key:', process.env.NOWPAYMENTS_API_KEY ? 'SET' : 'MISSING');
  console.log('NowPayments IPN Secret:', process.env.NOWPAYMENTS_IPN_SECRET ? 'SET' : 'MISSING');
  console.log('Frontend URL:', process.env.FRONTEND_URL || 'MISSING');
});