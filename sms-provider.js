var SMS_API_KEY = process.env.SMS_API_KEY || 'YOUR_API_KEY_HERE';
var apiBase = 'https://sms-bus.com/api/control';

var smsBus = {
  getNumber: async function(service, country) {
    try {
      var url = apiBase + '/get/number?token=' + SMS_API_KEY + '&country_id=' + country + '&project_id=' + service;
      var response = await fetch(url);
      var data = await response.json();

      if (data.code === 200 && data.data && data.data.request_id) {
        return { success: true, requestId: String(data.data.request_id), phone: data.data.number };
      }

      var errorMsg = data.message || 'No numbers available. Try a different country.';
      if (data.code === 50002) errorMsg = 'No numbers available. Try a different country.';
      if (data.code === 50201) errorMsg = 'Insufficient balance in your SMS provider account.';
      if (data.code === 401) errorMsg = 'Invalid SMS API Key.';
      
      return { success: false, error: errorMsg };
    } catch (err) { return { success: false, error: 'Connection failed: ' + err.message }; }
  },

  checkCode: async function(requestId) {
    try {
      var url = apiBase + '/get/sms?token=' + SMS_API_KEY + '&request_id=' + requestId;
      var response = await fetch(url);
      var data = await response.json();

      if (data.code === 200 && data.data) {
        return { success: true, code: data.data };
      }
      if (data.code === 50101) {
        return { success: false, waiting: true };
      }
      return { success: false, waiting: false, error: data.message };
    } catch (err) { return { success: false, waiting: true, error: err.message }; }
  },

  cancel: async function(requestId) {
    try {
      var url = apiBase + '/cancel?token=' + SMS_API_KEY + '&request_id=' + requestId;
      var response = await fetch(url);
      var data = await response.json();
      return data.code === 200;
    } catch (err) { return false; }
  },

  complete: async function(requestId) {
    // SMS-BUS auto-completes when SMS is received or times out
    return true;
  },

  getServiceCode: function(serviceName) {
    // SMS-BUS uses NUMBERS for project_id (e.g., 1=Telegram, 2=PayPal)
    var map = {
      'WhatsApp': '1',
      'Telegram': '1',
      'Facebook': '2',
      'Instagram': '3',
      'Google': '4',
      'Twitter / X': '5',
      'TikTok': '6',
      'Discord': '7',
      'Amazon': '8',
      'Microsoft': '9',
      'Fiverr': '10',
      'PayPal': '2',
      'Steam': '11',
      'Uber': '12',
      'Lyft': '13'
    };
    return map[serviceName] || '1';
  },

  getCountryCode: function(country) {
    // SMS-BUS uses NUMBERS for country_id (e.g., 1=USA, 2=Russia)
    var map = {
      'US': '1',
      'UK': '2',
      'DE': '3',
      'FR': '4',
      'CA': '5',
      'AU': '6',
      'JP': '7',
      'NL': '8'
    };
    return map[country] || '1';
  }
};

module.exports = smsBus;
