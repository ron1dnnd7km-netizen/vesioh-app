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

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// ====== AUTH ======
app.post('/api/auth/signup', async function(req, res) {
  var email = req.body.email;
  var password = req.body.password;
  if (!email || !password) return res.status(400).json({ error: 'All fields are required' });
  if (password.length < 6) return res.status(400).json({ error: 'Password must be at least 6 characters' });
  
  var existing = await db.prepare('SELECT email FROM users WHERE email = $1').get(email);
  if (existing) return res.status(400).json({ error: 'Email already registered' });
  
  var hash = bcrypt.hashSync(password, 10);
  await db.prepare('INSERT INTO users (email, password, balance) VALUES ($1, $2, DEFAULT)').run(email, hash);
  res.json({ email: email, message: 'Account created successfully.' });
});

app.post('/api/auth/login', async function(req, res) {
  var email = req.body.email;
  var password = req.body.password;
  if (!email || !password) return res.status(400).json({ error: 'All fields are required' });
  
  var user = await db.prepare('SELECT * FROM users WHERE email = $1').get(email);
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
app.get('/api/user/:email', async function(req, res) {
  try {
    var email = req.params.email;
    var user = await db.prepare('SELECT balance, referral_code FROM users WHERE email = $1').get(email);
    if (!user) return res.status(404).json({ error: 'User not found' });

    var referralCode = user.referral_code;
    if (!referralCode) {
      referralCode = 'REF-' + crypto.randomBytes(3).toString('hex').toUpperCase();
      await db.prepare('UPDATE users SET referral_code = $1 WHERE email = $2').run(referralCode, email);
    }

    var countResult = await db.prepare('SELECT COUNT(*) as total FROM users WHERE referred_by = $1').get(email);
    var totalReferrals = countResult ? parseInt(countResult.total) : 0;

    var historyResult = await db.prepare("SELECT COALESCE(SUM(cost), 0) as total_spent FROM history WHERE email IN (SELECT email FROM users WHERE referred_by = $1) AND status = 'success'").get(email);
    var totalCommissions = historyResult ? (parseFloat(historyResult.total_spent) * 0.05) : 0;

    var referrals = [];
    try {
      var referredUsers = await db.prepare('SELECT email, created_at FROM users WHERE referred_by = $1 ORDER BY created_at DESC').all(email);
      for (var i = 0; i < referredUsers.length; i++) {
        var refEmail = referredUsers[i].email;
        var spentResult = await db.prepare("SELECT COALESCE(SUM(cost), 0) as total FROM history WHERE email = $1 AND status = 'success'").get(refEmail);
        var spent = spentResult ? parseFloat(spentResult.total) : 0;
        var commission = spent * 0.05;
        referrals.push({
          email: refEmail,
          earned: '$' + commission.toFixed(2),
          status: commission > 0 ? 'Paid' : 'Pending',
          date: new Date(referredUsers[i].created_at).toLocaleDateString()
        });
      }
    } catch (e) {
      console.log('Referrals skipped:', e.message);
    }

    var withdrawals = [];
    try {
      var wdRows = await db.prepare('SELECT method, amount, status, created_at FROM withdrawals WHERE email = $1 ORDER BY created_at DESC').all(email);
      withdrawals = wdRows.map(function(w) {
        return {
          method: w.method === 'crypto' ? 'Crypto' : w.method === 'giftcard' ? 'Gift Card' : w.method,
          amount: '$' + parseFloat(w.amount).toFixed(2),
          status: w.status.charAt(0).toUpperCase() + w.status.slice(1),
          date: new Date(w.created_at).toLocaleDateString()
        };
      });
    } catch (e) {
      console.log('Withdrawals skipped:', e.message);
    }

    res.json({
      balance: user.balance,
      refCode: referralCode,
      referralCount: totalReferrals,
      totalCommissions: totalCommissions,
      referrals: referrals,
      withdrawals: withdrawals
    });
  } catch (err) {
    console.error('User API error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/user/refcode', async function(req, res) {
  try {
    var { email, refCode } = req.body;
    if (!email || !refCode) return res.status(400).json({ error: 'Missing data' });
    var user = await db.prepare('SELECT referral_code FROM users WHERE email = $1').get(email);
    if (!user) return res.status(404).json({ error: 'User not found' });
    if (!user.referral_code) {
      await db.prepare('UPDATE users SET referral_code = $1 WHERE email = $2').run(refCode, email);
    }
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ====== PLISIO HELPER ======
async function createPlisioInvoice(amount, currency, reference, email) {
  var apiKey = process.env.PLISIO_SECRET_KEY;
  if (!apiKey) throw new Error('Plisio API key not configured in .env');

  // Use backend URL for callbacks (Plisio sends to your server, not user's browser)
  var backendUrl = process.env.BACKEND_URL || process.env.FRONTEND_URL;

  var params = new URLSearchParams({
    source_currency: 'USD',
    source_amount: amount,
    order_number: reference,
    order_name: 'SonVerify deposit - ' + email,
    currency: (currency || 'TRX').toUpperCase(),
    email: email,
    callback_url: backendUrl + '/api/deposit/plisio-callback?json=true',
    // These URLs are correct - user is redirected here after payment
    success_invoice_url: process.env.FRONTEND_URL + '/?deposit=success&ref=' + reference,
    fail_invoice_url: process.env.FRONTEND_URL + '/?deposit=failed&ref=' + reference,
    api_key: apiKey
  });

  var response = await fetch('https://api.plisio.net/api/v1/invoices/new?' + params.toString(), { method: 'GET' });
  var data = await response.json();

  if (data.status !== 'success') throw new Error(data.data?.message || 'Plisio error: ' + JSON.stringify(data));
  if (!data.data.invoice_url) throw new Error('No invoice URL returned from Plisio');
  return data.data;
}

// ====== DEPOSIT: FLUTTERWAVE (Bank / Card) ======
// ====== DEPOSIT: FLUTTERWAVE (Bank / Card / Mobile Money) ======
var localCurrencyRates = {
  NGN: 1500,
  GHS: 15,
  KES: 150,
  ZAR: 18,
  UGX: 3700,
  TZS: 2500,
  RWF: 1300,
  XOF: 600,
  XAF: 600,
  EGP: 30,
  MAD: 10
};

app.post('/api/deposit/flutterwave', async function(req, res) {
  var email = req.body.email;
  var amount = req.body.amount;
  var targetCurrency = req.body.currency || 'USD';

  if (!email || !amount) return res.status(400).json({ error: 'All fields required' });
  if (amount < 2) return res.status(400).json({ error: 'Minimum deposit is $2.00' });
  if (amount > 1000) return res.status(400).json({ error: 'Maximum deposit is $1,000.00' });

  // Convert USD to local currency if needed
  var flutterAmount = amount;
  var rate = localCurrencyRates[targetCurrency];
  if (targetCurrency !== 'USD' && rate) {
    flutterAmount = Math.round(amount * rate);
  }

  var reference = 'DEP-' + Date.now().toString(36).toUpperCase() + '-' + Math.random().toString(36).substring(2, 6).toUpperCase();
  
  // Store USD amount in database
  await db.prepare('INSERT INTO deposits (email, amount, method, status, reference) VALUES ($1, $2, $3, $4, $5)').run(email, amount, 'flutterwave', 'pending', reference);

  try {
    var paymentOptions = ['card'];
    if (targetCurrency !== 'USD') {
      paymentOptions.push('banktransfer', 'mobilemoney');
    }

    var flutterRes = await fetch('https://api.flutterwave.com/v3/payments', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + process.env.FLUTTERWAVE_SECRET_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        tx_ref: reference,
        amount: flutterAmount,
        currency: targetCurrency,
        payment_options: paymentOptions,
        hosted_payment: 1,
        redirect_url: process.env.FRONTEND_URL + '/?deposit=success&ref=' + reference,
        customer: {
          email: email,
          name: email.split('@')[0]
        },
        customizations: {
          title: 'SonVerify - Top Up Balance',
          description: 'Add $' + amount.toFixed(2) + ' to your account'
        }
      })
    });

    var flutterData = await flutterRes.json();

    if (flutterData.status === 'success') {
      await db.prepare('UPDATE deposits SET reference = $1 WHERE reference = $2').run(flutterData.data.tx_ref, reference);
      res.json({ payment_link: flutterData.data.link });
    } else {
      await db.prepare('UPDATE deposits SET status = $1 WHERE reference = $2').run('failed', reference);
      res.status(500).json({ error: flutterData.message || 'Flutterwave error' });
    }
  } catch (err) {
    console.error('Flutterwave deposit error:', err.message);
    await db.prepare('UPDATE deposits SET status = $1 WHERE reference = $2').run('failed', reference);
    res.status(500).json({ error: 'Payment error: ' + err.message });
  }
});

// ====== FLUTTERWAVE WEBHOOK ======
app.post('/api/webhook/flutterwave', async function(req, res) {
  try {
    var secretHash = process.env.FLUTTERWAVE_WEBHOOK_SECRET;
    var signature = req.headers['verif-hash'];
    if (signature !== secretHash) return res.status(401).end();

    var payload = req.body;
    if (payload.event === 'charge.completed' && payload.data.status === 'successful') {
      var txRef = payload.data.tx_ref;
      var deposit = await db.prepare('SELECT * FROM deposits WHERE reference = $1 AND status = $2').get(txRef, 'pending');

      if (deposit) {
        // Credit the USD amount stored in database, not the local currency
        var paidAmount = deposit.amount;
        await db.prepare('UPDATE deposits SET status = $1 WHERE reference = $2').run('completed', txRef);
        await db.prepare('UPDATE users SET balance = balance + $1 WHERE email = $2').run(paidAmount, deposit.email);
        console.log('Flutterwave credited:', deposit.email, '$' + paidAmount);
      }
    }
    res.status(200).json({ status: 'ok' });
  } catch (err) {
    console.error('Flutterwave webhook error:', err.message);
    res.status(500).end();
  }
});
// ====== DEPOSIT: PLISIO (Crypto) ======
app.post('/api/deposit/plisio', async function(req, res) {
  var email = req.body.email;
  var amount = req.body.amount;
  var payCurrency = req.body.pay_currency || 'TRX';

  if (!email || !amount) return res.status(400).json({ error: 'All fields required' });
  if (amount < 2) return res.status(400).json({ error: 'Minimum deposit is $2.00' });
  if (amount > 1000) return res.status(400).json({ error: 'Maximum deposit is $1,000.00' });

  var reference = 'DEP-' + Date.now().toString(36).toUpperCase() + '-' + Math.random().toString(36).substring(2, 6).toUpperCase();
  
  await db.prepare('INSERT INTO deposits (email, amount, method, status, reference, pay_currency) VALUES ($1, $2, $3, $4, $5, $6)').run(email, amount, 'crypto', 'pending', reference, payCurrency);

  try {
    var result = await createPlisioInvoice(amount, payCurrency, reference, email);
    res.json({ invoice_url: result.invoice_url, reference: reference });
  } catch (err) {
    console.error('Plisio deposit error:', err.message);
    await db.prepare('UPDATE deposits SET status = $1 WHERE reference = $2').run('failed', reference);
    res.status(500).json({ error: 'Payment error: ' + err.message });
  }
});

// ====== PLISIO CALLBACK ======
app.post('/api/deposit/plisio-callback', async function(req, res) {
  try {
    var status = req.body.status;
    var orderId = req.body.order_number;
    console.log('Plisio callback: status=' + status + ' order=' + orderId);

    if (status === 'completed') {
      var deposit = await db.prepare('SELECT * FROM deposits WHERE reference = $1 AND status = $2').get(orderId, 'pending');
      if (deposit) {
        var creditAmount = parseFloat(req.body.source_amount) || deposit.amount;
        await db.prepare('UPDATE deposits SET status = $1 WHERE reference = $2').run('completed', orderId);
        await db.prepare('UPDATE users SET balance = balance + $1 WHERE email = $2').run(creditAmount, deposit.email);
        console.log('Credited: ' + orderId + ' $' + creditAmount + ' -> ' + deposit.email);
      }
    } else if (status === 'expired' || status === 'cancelled') {
      await db.prepare('UPDATE deposits SET status = $1 WHERE reference = $2 AND status = $3').run('failed', orderId, 'pending');
    }
    res.json({ status: 'ok' });
  } catch (err) {
    console.error('Callback error:', err.message);
    res.status(200).json({ status: 'ok' });
  }
});

// ====== NUMBERS ======
app.get('/api/numbers/:email', async function(req, res) {
  var rows = await db.prepare('SELECT * FROM numbers WHERE email = $1 ORDER BY created_at DESC').all(req.params.email);
  res.json(rows);
});

app.post('/api/numbers/request', async function(req, res) {
  var email = req.body.email;
  var serviceName = req.body.serviceName;
  var serviceId = req.body.serviceId;
  var countryCode = req.body.countryCode;
  var cost = req.body.cost;

  var user = await db.prepare('SELECT balance FROM users WHERE email = $1').get(email);
  if (!user) return res.status(404).json({ error: 'User not found' });
  if (user.balance < cost) return res.status(400).json({ error: 'Insufficient balance' });

  var useRealProvider = process.env.SMS_API_KEY && process.env.SMS_API_KEY !== 'YOUR_API_KEY_HERE';
  var realPhone = null;
  var providerRequestId = null;

  if (useRealProvider) {
    try {
      var provider = require('./sms-provider');
      var serviceCode = provider.getServiceCode(serviceName, serviceId);
      if (!serviceCode) return res.status(400).json({ error: 'This service is currently not supported by our provider.' });

      var countryCodeForProvider = provider.getCountryCode(countryCode);
      if (!countryCodeForProvider) return res.status(400).json({ error: 'This country is currently not supported by our provider.' });

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

  await db.prepare('UPDATE users SET balance = balance - $1 WHERE email = $2').run(cost, email);
  
  var insertResult = await db.prepare('INSERT INTO numbers (email, service_name, service_id, phone, status, time_left, total_time, cost, provider_request_id) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING id').run(email, serviceName, serviceId, realPhone, 'waiting', 600, 600, cost, providerRequestId);
  var numberId = insertResult.rows[0].id;

  await db.prepare('INSERT INTO history (email, service_name, phone, code, status, cost) VALUES ($1, $2, $3, NULL, $4, $5)').run(email, serviceName, realPhone, 'pending', cost);

  if (useRealProvider && providerRequestId) {
    startPolling(numberId, providerRequestId, serviceName);
  }

  res.json({ id: numberId, phone: realPhone, status: 'waiting', timeLeft: 600, totalTime: 600, cost: cost, balance: user.balance - cost });
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
        await db.prepare('UPDATE numbers SET status = $1, code = $2, sms_text = $3 WHERE id = $4').run('received', result.code, smsText, numberId);
        await db.prepare('INSERT INTO history (email, service_name, phone, code, status, cost) SELECT email, service_name, phone, $1, $2, cost FROM numbers WHERE id = $3').run(result.code, 'success', numberId);
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
  var num = await db.prepare('SELECT * FROM numbers WHERE id = $1').get(req.params.id);
  if (!num) return res.status(404).json({ error: 'Number not found' });
  if (num.status !== 'waiting') return res.status(400).json({ error: 'Can only cancel waiting numbers' });
  
  if (num.provider_request_id) {
    try { var provider = require('./sms-provider'); await provider.cancel(num.provider_request_id); } catch (err) { console.error('Cancel error:', err.message); }
  }
  
  await db.prepare('UPDATE users SET balance = balance + $1 WHERE email = $2').run(num.cost, num.email);
  await db.prepare('DELETE FROM numbers WHERE id = $1').run(req.params.id);
  
  var user = await db.prepare('SELECT balance FROM users WHERE email = $1').get(num.email);
  res.json({ message: 'Cancelled and refunded', balance: user.balance });
});

app.post('/api/numbers/:id/expire', async function(req, res) {
  var num = await db.prepare('SELECT * FROM numbers WHERE id = $1').get(req.params.id);
  if (!num) return res.status(404).json({ error: 'Number not found' });
  
  await db.prepare('UPDATE users SET balance = balance + $1 WHERE email = $2').run(num.cost, num.email);
  await db.prepare('UPDATE numbers SET status = $1, time_left = 0 WHERE id = $2').run('expired', req.params.id);
  await db.prepare('INSERT INTO history (email, service_name, phone, code, status, cost) VALUES ($1, $2, $3, NULL, $4, $5)').run(num.email, num.service_name, num.phone, 'failed', num.cost);
  
  var user = await db.prepare('SELECT balance FROM users WHERE email = $1').get(num.email);
  res.json({ balance: user.balance });
});

app.post('/api/numbers/:id/receive', async function(req, res) {
  var code = req.body.code;
  var smsText = req.body.smsText;
  var num = await db.prepare('SELECT * FROM numbers WHERE id = $1 AND status = $2').get(req.params.id, 'waiting');
  if (!num) return res.status(404).json({ error: 'Number not found or not waiting' });
  
  await db.prepare('UPDATE numbers SET status = $1, code = $2, sms_text = $3 WHERE id = $4').run('received', code, smsText, req.params.id);
  await db.prepare('INSERT INTO history (email, service_name, phone, code, status, cost) VALUES ($1, $2, $3, $4, $5, $6)').run(num.email, num.service_name, num.phone, code, 'success', num.cost);
  
  res.json({ message: 'Code received', code: code });
});

// ====== HISTORY ======
app.get('/api/history/:email', async function(req, res) {
  var rows = await db.prepare('SELECT * FROM history WHERE email = $1 ORDER BY created_at DESC').all(req.params.email);
  res.json(rows);
});

app.post('/api/simulate/:id', async function(req, res) {
  var num = await db.prepare('SELECT * FROM numbers WHERE id = $1 AND status = $2').get(req.params.id, 'waiting');
  if (!num) return res.json({ message: 'No waiting number found' });
  
  var code = String(Math.floor(100000 + Math.random() * 900000));
  var smsText = 'Your ' + num.service_name + ' verification code is ' + code + '. Do not share it with anyone.';
  
  await db.prepare('UPDATE numbers SET status = $1, code = $2, sms_text = $3 WHERE id = $4').run('received', code, smsText, num.id);
  await db.prepare('INSERT INTO history (email, service_name, phone, code, status, cost) VALUES ($1, $2, $3, $4, $5, $6)').run(num.email, num.service_name, num.phone, code, 'success', num.cost);
  
  res.json({ message: 'Simulated SMS received', code: code, phone: num.phone, service: num.service_name });
});

// ====== DEPOSITS HISTORY ======
app.get('/api/deposits/:email', async function(req, res) {
  var rows = await db.prepare('SELECT * FROM deposits WHERE email = $1 ORDER BY created_at DESC').all(req.params.email);
  res.json(rows);
});

// ====== REFERRAL SYSTEM ======
app.get('/api/referral/code/:email', async function(req, res) {
  var user = await db.prepare('SELECT referral_code FROM users WHERE email = $1').get(req.params.email);
  if (!user) return res.status(404).json({ error: 'User not found' });
  
  var code = user.referral_code;
  if (!code) {
    code = 'REF-' + crypto.randomBytes(3).toString('hex').toUpperCase();
    await db.prepare('UPDATE users SET referral_code = $1 WHERE email = $2').run(code, req.params.email);
  }
  
  var frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
  res.json({ 
    code: code, 
    link: frontendUrl + '/?ref=' + code 
  });
});

app.post('/api/referral/track', async function(req, res) {
  var { referrerEmail, referredEmail } = req.body;
  if (!referrerEmail || !referredEmail) return res.status(400).json({ error: 'Missing data' });
  if (referrerEmail === referredEmail) return res.status(400).json({ error: 'Cannot refer yourself' });

  var existingRef = await db.prepare('SELECT referred_by FROM users WHERE email = $1').get(referredEmail);
  if (existingRef && existingRef.referred_by) {
    return res.json({ message: 'Already tracked' });
  }

  await db.prepare('UPDATE users SET referred_by = $1 WHERE email = $2').run(referrerEmail, referredEmail);
  res.json({ success: true });
});

app.get('/api/referral/stats/:email', async function(req, res) {
  var email = req.params.email;
  
  var countResult = await db.prepare('SELECT COUNT(*) as total FROM users WHERE referred_by = $1').get(email);
  var totalReferrals = countResult ? countResult.total : 0;
  
  var historyResult = await db.prepare("SELECT COALESCE(SUM(cost), 0) as total_spent FROM history WHERE email IN (SELECT email FROM users WHERE referred_by = $1) AND status = 'success'").get(email);
  var totalEarnings = historyResult ? (historyResult.total_spent * 0.05) : 0;
  
  var referredUsers = await db.prepare('SELECT email, created_at FROM users WHERE referred_by = $1 ORDER BY created_at DESC').all(email);
  
  res.json({
    totalReferrals: totalReferrals,
    totalEarnings: totalEarnings.toFixed(2),
    list: referredUsers
  });
});

// ====== WITHDRAWAL REQUEST ======
app.post('/api/withdraw', async function(req, res) {
  try {
    var email = req.body.email;
    var method = req.body.method;
    var address = req.body.address;
    var amount = parseFloat(req.body.amount);

    if (!email || !method || !address || !amount) {
      return res.status(400).json({ error: 'All fields are required' });
    }
    if (amount < 1) {
      return res.status(400).json({ error: 'Minimum withdrawal is $1.00' });
    }

    var historyResult = await db.prepare("SELECT COALESCE(SUM(cost), 0) as total_spent FROM history WHERE email IN (SELECT email FROM users WHERE referred_by = $1) AND status = 'success'").get(email);
    var totalCommissions = historyResult ? (parseFloat(historyResult.total_spent) * 0.05) : 0;

    var withdrawnResult = await db.prepare("SELECT COALESCE(SUM(amount), 0) as total FROM withdrawals WHERE email = $1 AND status != 'rejected'").get(email);
    var alreadyWithdrawn = withdrawnResult ? parseFloat(withdrawnResult.total) : 0;
    var available = totalCommissions - alreadyWithdrawn;

    if (amount > available) {
      return res.status(400).json({ error: 'Insufficient commission balance. Available: $' + available.toFixed(2) });
    }

    await db.prepare('INSERT INTO withdrawals (email, method, address, amount, status) VALUES ($1, $2, $3, $4, $5)').run(email, method, address, amount, 'pending');

    res.json({ success: true, message: 'Withdrawal request submitted' });
  } catch (err) {
    console.error('Withdrawal error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// ====== ADMIN AUTH ======
var ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'SonVerify2025';
console.log('ADMIN_PASSWORD is:', ADMIN_PASSWORD);

app.post('/api/admin/login', function(req, res) {
  if (req.body.password === ADMIN_PASSWORD) {
    res.json({ success: true });
  } else {
    res.status(401).json({ error: 'Invalid admin password' });
  }
});

function requireAdmin(req, res, next) {
  var token = req.headers['authorization'];
  if (!token || token !== 'Bearer admin-' + ADMIN_PASSWORD) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
}

// ====== ADMIN: DASHBOARD STATS ======
app.get('/api/admin/stats', requireAdmin, async function(req, res) {
  try {
    var userCount = await db.prepare('SELECT COUNT(*) as total FROM users').get();
    var balanceResult = await db.prepare('SELECT COALESCE(SUM(balance), 0) as total FROM users').get();
    var activeNumbers = await db.prepare("SELECT COUNT(*) as total FROM numbers WHERE status IN ('waiting', 'received')").get();
    var todayDeposits = await db.prepare("SELECT COALESCE(SUM(amount), 0) as total FROM deposits WHERE status = 'completed' AND created_at >= CURRENT_DATE").get();
    var totalDeposits = await db.prepare("SELECT COALESCE(SUM(amount), 0) as total FROM deposits WHERE status = 'completed'").get();
    var pendingWithdrawals = await db.prepare("SELECT COUNT(*) as total FROM withdrawals WHERE status = 'pending'").get();
    var totalCommissions = await db.prepare("SELECT COALESCE(SUM(cost), 0) as total FROM history WHERE status = 'success' AND email IN (SELECT email FROM users WHERE referred_by IS NOT NULL)").get();
    var referralCount = await db.prepare("SELECT COUNT(*) as total FROM users WHERE referred_by IS NOT NULL").get();

    res.json({
      totalUsers: parseInt(userCount.total),
      totalBalance: parseFloat(balanceResult.total),
      activeNumbers: parseInt(activeNumbers.total),
      todayDeposits: parseFloat(todayDeposits.total),
      totalDeposits: parseFloat(totalDeposits.total),
      pendingWithdrawals: parseInt(pendingWithdrawals.total),
      totalCommissions: parseFloat(totalCommissions.total) * 0.05,
      totalReferrals: parseInt(referralCount.total)
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ====== ADMIN: ALL USERS ======
app.get('/api/admin/users', requireAdmin, async function(req, res) {
  try {
    var search = req.query.search || '';
    var page = parseInt(req.query.page) || 1;
    var limit = 20;
    var offset = (page - 1) * limit;

    var whereClause = search ? "WHERE email ILIKE $" + 1 + " OR referral_code ILIKE $" + 1 : "";
    var params = search ? ['%' + search + '%'] : [];

    var countResult = await db.prepare('SELECT COUNT(*) as total FROM users ' + whereClause).get(...params);
    var users = await db.prepare('SELECT email, balance, referral_code, referred_by, created_at FROM users ' + whereClause + ' ORDER BY created_at DESC LIMIT ' + limit + ' OFFSET ' + offset).all(...params);

    var enriched = [];
    for (var i = 0; i < users.length; i++) {
      var u = users[i];
      var purchaseResult = await db.prepare("SELECT COALESCE(SUM(cost), 0) as total FROM history WHERE email = $1 AND status = 'success'").get(u.email);
      var refCountResult = await db.prepare('SELECT COUNT(*) as total FROM users WHERE referred_by = $1').get(u.email);
      enriched.push({
        email: u.email,
        balance: parseFloat(u.balance),
        referral_code: u.referral_code,
        referred_by: u.referred_by,
        created_at: u.created_at,
        total_spent: parseFloat(purchaseResult.total),
        referral_count: parseInt(refCountResult.total)
      });
    }

    res.json({
      users: enriched,
      total: parseInt(countResult.total),
      pages: Math.ceil(parseInt(countResult.total) / limit)
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ====== ADMIN: SINGLE USER DETAIL ======
app.get('/api/admin/user/:email', requireAdmin, async function(req, res) {
  try {
    var email = req.params.email;
    var user = await db.prepare('SELECT email, balance, referral_code, referred_by, created_at FROM users WHERE email = $1').get(email);
    if (!user) return res.status(404).json({ error: 'User not found' });

    var numbers = await db.prepare('SELECT * FROM numbers WHERE email = $1 ORDER BY created_at DESC LIMIT 50').all(email);
    var history = await db.prepare('SELECT * FROM history WHERE email = $1 ORDER BY created_at DESC LIMIT 50').all(email);
    var deposits = await db.prepare('SELECT * FROM deposits WHERE email = $1 ORDER BY created_at DESC').all(email);
    var withdrawals = await db.prepare('SELECT * FROM withdrawals WHERE email = $1 ORDER BY created_at DESC').all(email);
    var referredUsers = await db.prepare('SELECT email, created_at FROM users WHERE referred_by = $1 ORDER BY created_at DESC').all(email);

    res.json({
      user: user,
      numbers: numbers,
      history: history,
      deposits: deposits,
      withdrawals: withdrawals,
      referred_users: referredUsers
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ====== ADMIN: ADJUST USER BALANCE ======
app.post('/api/admin/user/:email/balance', requireAdmin, async function(req, res) {
  try {
    var email = req.params.email;
    var amount = parseFloat(req.body.amount);
    var reason = req.body.reason || 'Admin adjustment';

    if (isNaN(amount)) return res.status(400).json({ error: 'Invalid amount' });

    var user = await db.prepare('SELECT balance FROM users WHERE email = $1').get(email);
    if (!user) return res.status(404).json({ error: 'User not found' });

    await db.prepare('UPDATE users SET balance = balance + $1 WHERE email = $2').run(amount, email);

    var newBalance = await db.prepare('SELECT balance FROM users WHERE email = $1').get(email);
    res.json({ success: true, newBalance: parseFloat(newBalance.balance), adjustment: amount });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ====== ADMIN: ALL WITHDRAWALS ======
app.get('/api/admin/withdrawals', requireAdmin, async function(req, res) {
  try {
    var status = req.query.status || '';
    var page = parseInt(req.query.page) || 1;
    var limit = 20;
    var offset = (page - 1) * limit;

    var whereClause = status ? "WHERE w.status = $1" : "";
    var params = status ? [status] : [];

    var countResult = await db.prepare('SELECT COUNT(*) as total FROM withdrawals w ' + whereClause).get(...params);
    var rows = await db.prepare(
      'SELECT w.*, u.balance as user_balance FROM withdrawals w LEFT JOIN users u ON w.email = u.email ' + whereClause + ' ORDER BY w.created_at DESC LIMIT ' + limit + ' OFFSET ' + offset
    ).all(...params);

    res.json({
      withdrawals: rows,
      total: parseInt(countResult.total),
      pages: Math.ceil(parseInt(countResult.total) / limit)
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ====== ADMIN: APPROVE / REJECT WITHDRAWAL ======
app.post('/api/admin/withdrawal/:id', requireAdmin, async function(req, res) {
  try {
    var id = req.params.id;
    var action = req.body.action;
    var adminNote = req.body.note || '';

    if (action !== 'approve' && action !== 'reject') {
      return res.status(400).json({ error: 'Action must be approve or reject' });
    }

    var wd = await db.prepare('SELECT * FROM withdrawals WHERE id = $1').get(id);
    if (!wd) return res.status(404).json({ error: 'Withdrawal not found' });
    if (wd.status !== 'pending') return res.status(400).json({ error: 'Already processed' });

    var newStatus = action === 'approve' ? 'completed' : 'rejected';
    await db.prepare('UPDATE withdrawals SET status = $1 WHERE id = $2').run(newStatus, id);

    res.json({ success: true, status: newStatus });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ====== ADMIN: ALL DEPOSITS ======
app.get('/api/admin/deposits', requireAdmin, async function(req, res) {
  try {
    var status = req.query.status || '';
    var page = parseInt(req.query.page) || 1;
    var limit = 20;
    var offset = (page - 1) * limit;

    var whereClause = status ? "WHERE status = $1" : "";
    var params = status ? [status] : [];

    var countResult = await db.prepare('SELECT COUNT(*) as total FROM deposits ' + whereClause).get(...params);
    var rows = await db.prepare('SELECT * FROM deposits ' + whereClause + ' ORDER BY created_at DESC LIMIT ' + limit + ' OFFSET ' + offset).all(...params);

    res.json({
      deposits: rows,
      total: parseInt(countResult.total),
      pages: Math.ceil(parseInt(countResult.total) / limit)
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ====== ADMIN: ALL NUMBERS ======
app.get('/api/admin/numbers', requireAdmin, async function(req, res) {
  try {
    var status = req.query.status || '';
    var page = parseInt(req.query.page) || 1;
    var limit = 20;
    var offset = (page - 1) * limit;

    var whereClause = status ? "WHERE status = $1" : "";
    var params = status ? [status] : [];

    var countResult = await db.prepare('SELECT COUNT(*) as total FROM numbers ' + whereClause).get(...params);
    var rows = await db.prepare('SELECT * FROM numbers ' + whereClause + ' ORDER BY created_at DESC LIMIT ' + limit + ' OFFSET ' + offset).all(...params);

    res.json({
      numbers: rows,
      total: parseInt(countResult.total),
      pages: Math.ceil(parseInt(countResult.total) / limit)
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ====== ADMIN: DELETE USER ======
app.delete('/api/admin/user/:email', requireAdmin, async function(req, res) {
  try {
    var email = req.params.email;
    await db.prepare('DELETE FROM history WHERE email = $1').run(email);
    await db.prepare('DELETE FROM numbers WHERE email = $1').run(email);
    await db.prepare('DELETE FROM deposits WHERE email = $1').run(email);
    await db.prepare('DELETE FROM withdrawals WHERE email = $1').run(email);
    await db.prepare('DELETE FROM users WHERE email = $1').run(email);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ====== DEPOSIT STATUS CHECK (for frontend polling) ======
app.get('/api/deposit/status/:reference', async function(req, res) {
  try {
    var reference = req.params.reference;
    var deposit = await db.prepare('SELECT * FROM deposits WHERE reference = $1').get(reference);
    if (!deposit) return res.status(404).json({ error: 'Deposit not found' });
    res.json({
      status: deposit.status,
      amount: parseFloat(deposit.amount),
      method: deposit.method
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ====== PRICES BY COUNTRY ======
app.get('/api/prices/:countryCode', async function(req, res) {
  try {
    var countryCode = req.params.countryCode;
    var country = countries.find(function(c) { return c.code === countryCode; });
    var baseMultiplier = country ? (country.basePrice / 0.50) : 1;
    
    // Return prices adjusted by country
    var prices = {};
    if (typeof services !== 'undefined') {
      services.forEach(function(s) {
        prices[s.id] = parseFloat((s.price * baseMultiplier).toFixed(2));
      });
    }
    res.json(prices);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ====== TEST ROUTE (remove after debugging) ======
app.get('/api/test', function(req, res) {
  res.json({ 
    status: 'ok', 
    message: 'Server is running the latest code',
    timestamp: new Date().toISOString()
  });
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
    
    var cRes = await fetch('https://sms-bus.com/api/control/list/countries?token=' + process.env.SMS_API_KEY);
    var cData = await cRes.json();
    var countryMap = {};
    if (cData.code === 200 && cData.data) {
      Object.values(cData.data).forEach(function(c) { countryMap[c.code.toLowerCase()] = String(c.id); });
    }

    var pRes = await fetch('https://sms-bus.com/api/control/list/projects?token=' + process.env.SMS_API_KEY);
    var pData = await pRes.json();
    var serviceMap = {};
    if (pData.code === 200 && pData.data) {
      Object.values(pData.data).forEach(function(p) { serviceMap[p.code.toLowerCase()] = String(p.id); });
    }

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

server.on('clientError', function(err, socket) {
  if (err.code === 'HPE_INVALID_CONSTANT') return socket.destroy();
  socket.end('HTTP/1.1 400 Bad Request\r\n\r\n');
});