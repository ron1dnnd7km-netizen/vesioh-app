// FORCED TO USE SMS-BUS
var SMS_API_KEY = process.env.SMS_API_KEY || 'YOUR_API_KEY_HERE';
var SMS_PROVIDER = 'sms-bus'; 

var smsActivate = {
  getNumber: async function(service, country) {
    try {
      var url = 'https://sms-activate.org/stubs/handler_api.php?api_key=' + SMS_API_KEY + '&action=getNumber&service=' + service + '&country=' + country;
      var response = await fetch(url);
      var text = String(await response.text());
      if (text.indexOf('ACCESS_NUMBER') !== -1) { var parts = text.split(':'); return { success: true, requestId: parts[1], phone: parts[2] }; }
      if (text.indexOf('NO_NUMBERS') !== -1) { return { success: false, error: 'No numbers available. Try a different country.' }; }
      return { success: false, error: 'Provider says: ' + text };
    } catch (err) { return { success: false, error: 'Connection failed: ' + err.message }; }
  },
  checkCode: async function(requestId) {
    try {
      var url = 'https://sms-activate.org/stubs/handler_api.php?api_key=' + SMS_API_KEY + '&action=getStatus&id=' + requestId;
      var response = await fetch(url); var text = String(await response.text());
      if (text.indexOf('STATUS_OK:') !== -1) { return { success: true, code: text.split(':')[1] }; }
      if (text.indexOf('STATUS_WAIT') !== -1) { return { success: false, waiting: true }; }
      return { success: false, waiting: false, error: text };
    } catch (err) { return { success: false, waiting: true, error: err.message }; }
  },
  cancel: async function(requestId) { try { await fetch('https://sms-activate.org/stubs/handler_api.php?api_key=' + SMS_API_KEY + '&action=setStatus&status=8&id=' + requestId); return true; } catch (err) { return false; } },
  complete: async function(requestId) { try { await fetch('https://sms-activate.org/stubs/handler_api.php?api_key=' + SMS_API_KEY + '&action=setStatus&status=6&id=' + requestId); return true; } catch (err) { return false; } },
  getServiceCode: function(serviceName) { var map = { 'WhatsApp': 'wa', 'Telegram': 'tg', 'Facebook': 'fb', 'Instagram': 'ig', 'Google': 'go', 'Twitter / X': 'tw', 'TikTok': 'tt', 'Discord': 'dc' }; return map[serviceName] || 'wa'; },
  getCountryCode: function(country) { var map = { 'US': '0', 'UK': '22', 'DE': '77', 'FR': '33', 'CA': '1', 'AU': '46', 'JP': '79', 'NL': '55' }; return map[country] || '0'; }
};

var fiveSim = {
  getNumber: async function(service, country) {
    try {
      var url = 'https://5sim.net/v1/user/buy/activation/' + country + '/' + service + '/any';
      var response = await fetch(url, { headers: { 'Authorization': 'Bearer ' + SMS_API_KEY } });
      var text = await response.text(); let data;
      try { data = JSON.parse(text); } catch (e) { return { success: false, error: text || 'No numbers available' }; }
      if (data.id) { return { success: true, requestId: String(data.id), phone: data.phone }; }
      return { success: false, error: data.message || 'No numbers available' };
    } catch (err) { return { success: false, error: 'Connection failed: ' + err.message }; }
  },
  checkCode: async function(requestId) { try { var url = 'https://5sim.net/v1/user/check/' + requestId; var response = await fetch(url, { headers: { 'Authorization': 'Bearer ' + SMS_API_KEY } }); var data = await response.json(); if (data.sms && data.sms.length > 0) { return { success: true, code: data.sms[0].code }; } return { success: false, waiting: true }; } catch (err) { return { success: false, waiting: true, error: err.message }; } },
  cancel: async function(requestId) { try { await fetch('https://5sim.net/v1/user/cancel/' + requestId, { headers: { 'Authorization': 'Bearer ' + SMS_API_KEY }, method: 'POST' }); return true; } catch (err) { return false; } },
  complete: async function(requestId) { try { await fetch('https://5sim.net/v1/user/finish/' + requestId, { headers: { 'Authorization': 'Bearer ' + SMS_API_KEY }, method: 'POST' }); return true; } catch (err) { return false; } },
  getServiceCode: function(serviceName) { var map = { 'WhatsApp': 'whatsapp', 'Telegram': 'telegram', 'Facebook': 'facebook', 'Instagram': 'instagram', 'Google': 'google', 'Twitter / X': 'twitter', 'TikTok': 'tiktok', 'Discord': 'discord' }; return map[serviceName] || 'whatsapp'; },
  getCountryCode: function(country) { var map = { 'US': 'us', 'UK': 'gb', 'DE': 'de', 'FR': 'fr', 'CA': 'ca', 'AU': 'au', 'JP': 'jp', 'NL': 'nl' }; return map[country] || 'ru'; }
};

var smsBus = {
  apiBase: 'https://sms-bus.com/api/v2',
  
  getNumber: async function(service, country) {
    try {
      var url = this.apiBase + '?action=getNumber&token=' + SMS_API_KEY + '&service=' + service + '&country=' + country;
      var response = await fetch(url);
      var text = await response.text();
      var data = {};
      try { data = JSON.parse(text); } catch (e) { return { success: false, error: 'SMS-Bus returned: ' + text }; }

      if (data.id || data.phone) {
        return { success: true, requestId: String(data.id), phone: data.phone };
      }
      return { success: false, error: data.error || data.message || 'No numbers available. Try a different country.' };
    } catch (err) { return { success: false, error: 'Connection failed: ' + err.message }; }
  },

  checkCode: async function(requestId) {
    try {
      var url = this.apiBase + '?action=getCode&token=' + SMS_API_KEY + '&id=' + requestId;
      var response = await fetch(url);
      var text = await response.text();
      var data = {};
      try { data = JSON.parse(text); } catch (e) { return { success: false, waiting: true }; }

      if (data.code || data.sms) { return { success: true, code: data.code || data.sms }; }
      if (data.status === 'waiting' || data.status === 'pending') { return { success: false, waiting: true }; }
      return { success: false, waiting: false, error: data.error || text };
    } catch (err) { return { success: false, waiting: true, error: err.message }; }
  },

  cancel: async function(requestId) { try { await fetch(this.apiBase + '?action=banNumber&token=' + SMS_API_KEY + '&id=' + requestId); return true; } catch (err) { return false; } },
  complete: async function(requestId) { try { await fetch(this.apiBase + '?action=endNumber&token=' + SMS_API_KEY + '&id=' + requestId); return true; } catch (err) { return false; } },
  getServiceCode: function(serviceName) { var map = { 'WhatsApp': 'whatsapp', 'Telegram': 'telegram', 'Facebook': 'facebook', 'Instagram': 'instagram', 'Google': 'google', 'Twitter / X': 'twitter', 'TikTok': 'tiktok', 'Discord': 'discord' }; return map[serviceName] || 'whatsapp'; },
  getCountryCode: function(country) { var map = { 'US': 'usa', 'UK': 'uk', 'DE': 'germany', 'FR': 'france', 'CA': 'canada', 'AU': 'australia', 'JP': 'japan', 'NL': 'netherlands' }; return map[country] || 'russia'; }
};

// FORCED TO RETURN SMS-BUS
module.exports = smsBus;