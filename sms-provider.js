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
    return true;
  },

  getServiceCode: function(serviceName) {
    // EXACT IDs from your SMS-BUS dashboard list
    var map = {
      'Telegram': '1',
      'PayPal': '2',
      'TikTok': '3',
      'WhatsApp': '5',
      'Google': '8',
      'Microsoft': '11',
      'Uber': '13',
      'Coinbase': '19',
      'Bumble': '60',
      'Cash App': '63',
      'OpenAI/ChatGPT': '52',
      'Line': '81',
      'Tinder': '82',
      'Facebook': '83',
      'Twitter / X': '85',
      'Nike': '87',
      'Amazon': '88',
      'Instagram': '89',
      'Netflix': '90',
      'Discord': '94',
      'Venmo': '98',
      'Snapchat': '115',
      'Fiverr': '117',
      'Etsy': '129',
      'Steam': '152',
      'Lyft': '178',
      'LinkedIn': '196',
      'Roblox': '210',
      'Binance': '287'
    };
    return map[serviceName] || '5'; // Defaults to WhatsApp if not in the list
  },

  getCountryCode: function(country) {
    // IDs from your SMS-BUS dashboard (1=USA, etc.)
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
