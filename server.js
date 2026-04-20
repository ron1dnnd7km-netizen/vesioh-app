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
  { code: 'IN', name: 'India', flag: '🇮🇳', prefix: '+91', basePrice: 0.20 },
  { code: 'BR', name: 'Brazil', flag: '🇧🇷', prefix: '+55', basePrice: 0.40 },
  { code: 'MX', name: 'Mexico', flag: '🇲🇽', prefix: '+52', basePrice: 0.30 },
  { code: 'ID', name: 'Indonesia', flag: '🇮🇩', prefix: '+62', basePrice: 0.25 },
  { code: 'PH', name: 'Philippines', flag: '🇵🇭', prefix: '+63', basePrice: 0.25 },
  { code: 'VN', name: 'Vietnam', flag: '🇻🇳', prefix: '+84', basePrice: 0.20 },
  { code: 'TH', name: 'Thailand', flag: '🇹🇭', prefix: '+66', basePrice: 0.25 },
  { code: 'MY', name: 'Malaysia', flag: '🇲🇾', prefix: '+60', basePrice: 0.30 },
  { code: 'ES', name: 'Spain', flag: '🇪🇸', prefix: '+34', basePrice: 0.50 },
  { code: 'IT', name: 'Italy', flag: '🇮🇹', prefix: '+39', basePrice: 0.55 },
  { code: 'PL', name: 'Poland', flag: '🇵🇱', prefix: '+48', basePrice: 0.45 },
  { code: 'TR', name: 'Turkey', flag: '🇹🇷', prefix: '+90', basePrice: 0.40 },
  { code: 'AE', name: 'UAE', flag: '🇦🇪', prefix: '+971', basePrice: 0.60 },
  { code: 'SA', name: 'Saudi Arabia', flag: '🇸🇦', prefix: '+966', basePrice: 0.50 },
  { code: 'EG', name: 'Egypt', flag: '🇪🇬', prefix: '+20', basePrice: 0.30 },
  { code: 'NG', name: 'Nigeria', flag: '🇳🇬', prefix: '+234', basePrice: 0.35 },
  { code: 'ZA', name: 'South Africa', flag: '🇿🇦', prefix: '+27', basePrice: 0.40 },
  { code: 'AR', name: 'Argentina', flag: '🇦🇷', prefix: '+54', basePrice: 0.35 },
  { code: 'CO', name: 'Colombia', flag: '🇨🇴', prefix: '+57', basePrice: 0.30 },
  { code: 'RO', name: 'Romania', flag: '🇷🇴', prefix: '+40', basePrice: 0.45 },
  { code: 'UA', name: 'Ukraine', flag: '🇺🇦', prefix: '+380', basePrice: 0.50 },
  { code: 'RU', name: 'Russia', flag: '🇷🇺', prefix: '+7', basePrice: 0.35 },
  { code: 'KZ', name: 'Kazakhstan', flag: '🇰🇿', prefix: '+7', basePrice: 0.40 },
  { code: 'SG', name: 'Singapore', flag: '🇸🇬', prefix: '+65', basePrice: 0.45 },
  { code: 'NZ', name: 'New Zealand', flag: '🇳🇿', prefix: '+64', basePrice: 0.75 }
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
  db.prepare('INSERT INTO users (email, password, balance) VALUES (?, ?, 0.00)').run(email, hash);
    res.json({ email: email, message: 'Account created successfully.' });
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
  var user = db.prepare('SELECT balance, email as refCode FROM users WHERE email = ?').get(req.params.email);
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json({ balance: user.balance, refCode: user.refCode });
});

// ====== PLISIO HELPER ======
async function createPlisioInvoice(amount, currency, reference, email) {
  var apiKey = process.env.PLISIO_SECRET_KEY;
  if (!apiKey) throw new Error('Plisio API key not configured in .env');

  // Plisio requires GET request with query parameters
  var params = new URLSearchParams({
    source_currency: 'USD',
    source_amount: amount,
    order_number: reference,
    order_name: 'SMS Virtual Code deposit - ' + email,
    currency: (currency || 'TRX').toUpperCase(),
    email: email,
    callback_url: process.env.FRONTEND_URL + '/api/deposit/plisio-callback?json=true',
    success_invoice_url: process.env.FRONTEND_URL + '/?deposit=success&ref=' + reference,
    fail_invoice_url: process.env.FRONTEND_URL + '/?deposit=failed',
    api_key: apiKey
  });

  // Notice the GET method and the correct api.plisio.net domain!
  var response = await fetch('https://api.plisio.net/api/v1/invoices/new?' + params.toString(), {
    method: 'GET'
  });

  var data = await response.json();

  if (data.status !== 'success') {
    throw new Error(data.data.message || 'Plisio error');
  }
  if (!data.data.invoice_url) {
    throw new Error('No invoice URL returned from Plisio');
  }
  return data.data;
}

// ====== DEPOSIT: CRYPTO ======
app.post('/api/deposit/nowpayments', async function(req, res) {
  var email = req.body.email;
  var amount = req.body.amount;
  var payCurrency = req.body.pay_currency || 'TRX';

  if (!email || !amount) return res.status(400).json({ error: 'All fields required' });
  if (amount < 2) return res.status(400).json({ error: 'Minimum deposit is $2.00' });
  if (amount > 1000) return res.status(400).json({ error: 'Maximum deposit is $1,000.00' });

  var reference = 'DEP-' + Date.now().toString(36).toUpperCase() + '-' + Math.random().toString(36).substring(2, 6).toUpperCase();
  db.prepare('INSERT INTO deposits (email, amount, method, status, reference, pay_currency) VALUES (?, ?, ?, ?, ?, ?)').run(email, amount, 'crypto', 'pending', reference, payCurrency);

  try {
    var result = await createPlisioInvoice(amount, payCurrency, reference, email);
    res.json({ success: true, invoice_url: result.invoice_url, reference: reference });
  } catch (err) {
    console.error('Crypto deposit error:', err.message);
    db.prepare('UPDATE deposits SET status = ? WHERE reference = ?').run('failed', reference);
    res.status(500).json({ error: 'Payment error: ' + err.message });
  }
});

// ====== PLISIO CALLBACK ======
app.post('/api/deposit/plisio-callback', function(req, res) {
  try {
    var status = req.body.status;
    var orderId = req.body.order_number;

    console.log('Plisio callback: status=' + status + ' order=' + orderId);

    if (status === 'completed') {
      var deposit = db.prepare('SELECT * FROM deposits WHERE reference = ? AND status = ?').get(orderId, 'pending');
      if (deposit) {
        var creditAmount = parseFloat(req.body.source_amount) || deposit.amount;
        db.prepare('UPDATE deposits SET status = ? WHERE reference = ?').run('completed', orderId);
        db.prepare('UPDATE users SET balance = balance + ? WHERE email = ?').run(creditAmount, deposit.email);
        console.log('Credited: ' + orderId + ' $' + creditAmount + ' -> ' + deposit.email);
      }
    } else if (status === 'expired' || status === 'cancelled') {
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
  console.log('STARTED POLLING FOR NUMBER:', numberId, 'REQUEST:', providerRequestId);
  var provider = require('./sms-provider');
  var attempts = 0;
    attempts++;
    try {
    var result = await provider.checkCode(providerRequestId);
      console.log('POLL CHECK (' + attempts + '):', JSON.stringify(result));
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
var server = app.listen(PORT, function() {
  console.log('Server started on port ' + PORT);
  console.log('Frontend URL:', process.env.FRONTEND_URL || 'MISSING');
});

// Fix Railway proxy crashing the server
server.on('clientError', function(err, socket) {
  if (err.code === 'HPE_INVALID_CONSTANT') return socket.destroy();
  socket.end('HTTP/1.1 400 Bad Request\r\n\r\n');
});