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

// FIXED: Changed all country codes to lowercase ISO standards to match frontend
const countries = [
  { code: 'us', name: 'United States', flag: '🇺🇸', prefix: '+1', basePrice: 2.90 },
  { code: 'gb', name: 'United Kingdom', flag: '🇬🇧', prefix: '+44', basePrice: 0.65 },
  { code: 'de', name: 'Germany', flag: '🇩🇪', prefix: '+49', basePrice: 0.60 },
  { code: 'fr', name: 'France', flag: '🇫🇷', prefix: '+33', basePrice: 0.55 },
  { code: 'ca', name: 'Canada', flag: '🇨🇦', prefix: '+1', basePrice: 0.60 },
  { code: 'au', name: 'Australia', flag: '🇦🇺', prefix: '+61', basePrice: 0.70 },
  { code: 'it', name: 'Italy', flag: '🇮🇹', prefix: '+39', basePrice: 0.50 },
  { code: 'es', name: 'Spain', flag: '🇪🇸', prefix: '+34', basePrice: 0.50 },
  { code: 'sa', name: 'Saudi Arabia', flag: '🇸🇦', prefix: '+966', basePrice: 0.50 },
  { code: 'ae', name: 'United Arab Emirates', flag: '🇦🇪', prefix: '+971', basePrice: 0.50 },
  { code: 'il', name: 'Israel', flag: '🇮🇱', prefix: '+972', basePrice: 0.50 },
  { code: 'ps', name: 'Palestine', flag: '🇵🇸', prefix: '+970', basePrice: 0.50 },
  { code: 'tr', name: 'Turkey', flag: '🇹🇷', prefix: '+90', basePrice: 0.50 },
  { code: 'qa', name: 'Qatar', flag: '🇶🇦', prefix: '+974', basePrice: 0.50 },
  { code: 'jp', name: 'Japan', flag: '🇯🇵', prefix: '+81', basePrice: 0.50 },
  { code: 'mg', name: 'Madagascar', flag: '🇲🇬', prefix: '+261', basePrice: 0.50 },
  { code: 'at', name: 'Austria', flag: '🇦🇹', prefix: '+43', basePrice: 0.50 },
  { code: 'ng', name: 'Nigeria', flag: '🇳🇬', prefix: '+234', basePrice: 0.50 },
  { code: 'lt', name: 'Lithuania', flag: '🇱🇹', prefix: '+370', basePrice: 0.50 },
  { code: 'eg', name: 'Egypt', flag: '🇪🇬', prefix: '+20', basePrice: 0.50 },
  { code: 'ie', name: 'Ireland', flag: '🇮🇪', prefix: '+353', basePrice: 0.50 },
  { code: 'ci', name: 'Ivory Coast', flag: '🇨🇮', prefix: '+225', basePrice: 0.50 },
  { code: 'sg', name: 'Singapore', flag: '🇸🇬', prefix: '+65', basePrice: 0.50 },
  { code: 'ee', name: 'Estonia', flag: '🇪🇪', prefix: '+372', basePrice: 0.50 },
  { code: 'vn', name: 'Vietnam', flag: '🇻🇳', prefix: '+84', basePrice: 0.50 },
  { code: 'ro', name: 'Romania', flag: '🇷🇴', prefix: '+40', basePrice: 0.50 },
  { code: 'th', name: 'Thailand', flag: '🇹🇭', prefix: '+66', basePrice: 0.50 },
  { code: 'in', name: 'India', flag: '🇮🇳', prefix: '+91', basePrice: 0.50 },
  { code: 'ru', name: 'Russia', flag: '🇷🇺', prefix: '+7', basePrice: 0.50 },
  { code: 'co', name: 'Colombia', flag: '🇨🇴', prefix: '+57', basePrice: 0.50 },
  { code: 'rs', name: 'Serbia', flag: '🇷🇸', prefix: '+381', basePrice: 0.50 },
  { code: 'ua', name: 'Ukraine', flag: '🇺🇦', prefix: '+380', basePrice: 0.50 },
  { code: 'cy', name: 'Cyprus', flag: '🇨🇾', prefix: '+357', basePrice: 0.50 },
  { code: 'lv', name: 'Latvia', flag: '🇱🇻', prefix: '+371', basePrice: 0.50 },
  { code: 'my', name: 'Malaysia', flag: '🇲🇾', prefix: '+60', basePrice: 0.50 },
  { code: 'bo', name: 'Bolivia', flag: '🇧🇴', prefix: '+591', basePrice: 0.50 },
  { code: 'id', name: 'Indonesia', flag: '🇮🇩', prefix: '+62', basePrice: 0.50 },
  { code: 'pa', name: 'Panama', flag: '🇵🇦', prefix: '+507', basePrice: 0.50 },
  { code: 'ph', name: 'Philippines', flag: '🇵🇭', prefix: '+63', basePrice: 0.50 },
  { code: 'dk', name: 'Denmark', flag: '🇩🇰', prefix: '+45', basePrice: 0.50 },
  { code: 'ge', name: 'Georgia', flag: '🇬🇪', prefix: '+995', basePrice: 0.50 },
  { code: 'cm', name: 'Cameroon', flag: '🇨🇲', prefix: '+237', basePrice: 0.50 },
  { code: 'bj', name: 'Benin', flag: '🇧🇯', prefix: '+229', basePrice: 0.50 },
  { code: 'nz', name: 'New Zealand', flag: '🇳🇿', prefix: '+64', basePrice: 0.50 },
  { code: 'ni', name: 'Nicaragua', flag: '🇳🇮', prefix: '+505', basePrice: 0.50 },
  { code: 'kh', name: 'Cambodia', flag: '🇰🇭', prefix: '+855', basePrice: 0.50 },
  { code: 'mx', name: 'Mexico', flag: '🇲🇽', prefix: '+52', basePrice: 0.50 },
  { code: 'kz', name: 'Kazakhstan', flag: '🇰🇿', prefix: '+7', basePrice: 0.50 },
  { code: 'af', name: 'Afghanistan', flag: '🇦🇫', prefix: '+93', basePrice: 0.50 },
  { code: 'al', name: 'Albania', flag: '🇦🇱', prefix: '+355', basePrice: 0.50 },
  { code: 'dz', name: 'Algeria', flag: '🇩🇿', prefix: '+213', basePrice: 0.50 },
  { code: 'ao', name: 'Angola', flag: '🇦🇴', prefix: '+244', basePrice: 0.50 },
  { code: 'ar', name: 'Argentina', flag: '🇦🇷', prefix: '+54', basePrice: 0.50 },
  { code: 'am', name: 'Armenia', flag: '🇦🇲', prefix: '+374', basePrice: 0.50 },
  { code: 'la', name: 'Laos', flag: '🇱🇦', prefix: '+856', basePrice: 0.50 },
  { code: 'bd', name: 'Bangladesh', flag: '🇧🇩', prefix: '+880', basePrice: 0.50 },
  { code: 'za', name: 'South Africa', flag: '🇿🇦', prefix: '+27', basePrice: 0.50 },
  { code: 'ma', name: 'Morocco', flag: '🇲🇦', prefix: '+212', basePrice: 0.50 },
  { code: 'mm', name: 'Myanmar', flag: '🇲🇲', prefix: '+95', basePrice: 0.50 },
  { code: 'tj', name: 'Tajikistan', flag: '🇹🇯', prefix: '+992', basePrice: 0.50 },
  { code: 'az', name: 'Azerbaijan', flag: '🇦🇿', prefix: '+994', basePrice: 0.50 },
  { code: 'bh', name: 'Bahrain', flag: '🇧🇭', prefix: '+973', basePrice: 0.50 },
  { code: 'nl', name: 'Netherlands', flag: '🇳🇱', prefix: '+31', basePrice: 0.50 },
  { code: 'by', name: 'Belarus', flag: '🇧🇾', prefix: '+375', basePrice: 0.50 },
  { code: 'bw', name: 'Botswana', flag: '🇧🇼', prefix: '+267', basePrice: 0.50 },
  { code: 'br', name: 'Brazil', flag: '🇧🇷', prefix: '+55', basePrice: 0.50 },
  { code: 'bg', name: 'Bulgaria', flag: '🇧🇬', prefix: '+359', basePrice: 0.50 },
  { code: 'ke', name: 'Kenya', flag: '🇰🇪', prefix: '+254', basePrice: 0.50 },
  { code: 'tz', name: 'Tanzania', flag: '🇹🇿', prefix: '+255', basePrice: 0.50 },
  { code: 'kg', name: 'Kyrgyzstan', flag: '🇰🇬', prefix: '+996', basePrice: 0.50 },
  { code: 'pl', name: 'Poland', flag: '🇵🇱', prefix: '+48', basePrice: 0.50 }
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
      
      // Pass both ID and Name for exact matching
      var serviceCode = provider.getServiceCode(serviceName, serviceId);
      
      // STOP if service not found in dynamic list
      if (!serviceCode) {
        return res.status(400).json({ error: 'This service is currently not supported by our provider.' });
      }

      var countryCodeForProvider = provider.getCountryCode(countryCode);
      
      // STOP if country not found in dynamic list
      if (!countryCodeForProvider) {
        return res.status(400).json({ error: 'This country is currently not supported by our provider.' });
      }

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
  var insertResult = db.prepare('INSERT INTO numbers (email, service_name, service_id, phone, status, time_left, total_time, cost, provider_request_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)').run(email, serviceName, serviceId, realPhone, 'waiting', 600, 600, cost, providerRequestId);

  // Add to history so users can see their purchase immediately
  db.prepare('INSERT INTO history (email, service_name, phone, code, status, cost) VALUES (?, ?, ?, ?, ?, ?)').run(email, serviceName, realPhone, null, 'pending', cost);

  if (useRealProvider && providerRequestId) {
    startPolling(insertResult.lastInsertRowid, providerRequestId, serviceName);
  }

  res.json({ id: insertResult.lastInsertRowid, phone: realPhone, status: 'waiting', timeLeft: 600, totalTime: 600, cost: cost, balance: user.balance - cost });
});

function startPolling(numberId, providerRequestId, serviceName) {
  var provider = require('./sms-provider');
  var attempts = 0;
  console.log("[POLL START] Starting polling for Number ID:", numberId, "Provider ID:", providerRequestId);
  
  var interval = setInterval(async function() {
    attempts++;
    try {
      console.log("[POLL CHECK " + attempts + "] Checking provider for ID:", providerRequestId);
      var result = await provider.checkCode(providerRequestId);
      console.log("[POLL RESULT] Got result:", JSON.stringify(result));
      
      if (result.success && result.code) {
        clearInterval(interval);
        var smsText = 'Your ' + serviceName + ' verification code is ' + result.code + '. Do not share it with anyone.';
        db.prepare('UPDATE numbers SET status = ?, code = ?, sms_text = ? WHERE id = ?').run('received', result.code, smsText, numberId);
        db.prepare('INSERT INTO history (email, service_name, phone, code, status, cost) SELECT email, service_name, phone, ?, ?, cost FROM numbers WHERE id = ?').run(result.code, 'success', numberId);
        provider.complete(providerRequestId).catch(function() {});
      }
      if (result.success === false && result.waiting === false) {
        console.log("[POLL STOP] Provider said no longer waiting.");
        clearInterval(interval);
      }
    } catch (err) {
      console.error('[POLL ERROR] Error checking code for ' + numberId + ':', err.message);
    }
    if (attempts >= 120) {
      console.log("[POLL STOP] Max attempts reached.");
      clearInterval(interval);
    }
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
app.use(function(req, res, next) {
  if (req.path.startsWith('/api')) return res.status(404).json({ error: 'API route not found' });
  if (req.path.includes('.')) return res.status(404).send('File not found');
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// ====== AUTO-LOAD SMS PROVIDER MAPS ON STARTUP ======
async function loadProviderMaps() {
  try {
    var provider = require('./sms-provider');
    
    // Fetch Countries
    var cRes = await fetch('https://sms-bus.com/api/control/list/countries?token=' + process.env.SMS_API_KEY);
    var cData = await cRes.json();
    var countryMap = {};
    if (cData.code === 200 && cData.data) {
      Object.values(cData.data).forEach(function(c) {
        countryMap[c.code.toLowerCase()] = String(c.id); // e.g. "gb" -> "25"
      });
    }

    // Fetch Services
    var pRes = await fetch('https://sms-bus.com/api/control/list/projects?token=' + process.env.SMS_API_KEY);
    var pData = await pRes.json();
    var serviceMap = {};
    if (pData.code === 200 && pData.data) {
      Object.values(pData.data).forEach(function(p) {
        serviceMap[p.code.toLowerCase()] = String(p.id); // e.g. "tk" -> "3"
      });
    }

    // Send the maps to sms-provider.js
    provider.setMaps(serviceMap, countryMap);
  } catch (err) {
    console.error('Failed to auto-load provider maps. Error:', err.message);
  }
}

loadProviderMaps();

// ====== START ======
var PORT = process.env.PORT || 3000;
var server = app.listen(PORT, function() {
  console.log('Server started on port ' + PORT);
});

// Fix Railway proxy crashing the server
server.on('clientError', function(err, socket) {
  if (err.code === 'HPE_INVALID_CONSTANT') return socket.destroy();
  socket.end('HTTP/1.1 400 Bad Request\r\n\r\n');
});