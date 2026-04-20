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
      
      // 50101 = Still waiting (Keep polling!)
      if (data.code === 50101) {
        return { success: false, waiting: true };
      }
      
      // 50102 = Number expired/canceled (STOP polling!)
      if (data.code === 50102) {
        return { success: false, waiting: false, error: 'Number expired' };
      }
      
      // ANY OTHER ERROR: Assume still waiting to prevent giving up too early
      return { success: false, waiting: true, error: data.message };
    } catch (err) { 
      return { success: false, waiting: true, error: err.message }; 
    }
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
      'Telegram': '1', 'PayPal': '2', 'TikTok': '3', 'WhatsApp': '5',
      'Google': '8', 'Microsoft': '11', 'Uber': '13', 'Coinbase': '19',
      'Bumble': '60', 'Cash App': '63', 'OpenAI/ChatGPT': '52', 'Line': '81',
      'Tinder': '82', 'Facebook': '83', 'Twitter / X': '85', 'Nike': '87',
      'Amazon': '88', 'Instagram': '89', 'Netflix': '90', 'Discord': '94',
      'Venmo': '98', 'Snapchat': '115', 'Fiverr': '117', 'Etsy': '129',
      'Steam': '152', 'Lyft': '178', 'LinkedIn': '196', 'Roblox': '210',
      'Binance': '287', 'Apple': '105', 'OKX': '107', 'Shein': '179',
      'DeepSeek': '261', 'Claude': '131'
    };
    return map[serviceName] || '5'; // Defaults to WhatsApp if not in the list
  },

  getCountryCode: function(country) {
    // EXACT IDs from your SMS-BUS dashboard list
    var map = {
      'US': '5', 'USV': '236', 'RU': '1', 'UA': '4', 'GB': '25', 'DE': '48',
      'FR': '80', 'CA': '13', 'AU': '188', 'JP': '197', 'NL': '189', 'IN': '14',
      'BR': '224', 'MX': '212', 'ID': '7', 'PH': '8', 'VN': '10', 'TH': '57',
      'MY': '6', 'ES': '190', 'IT': '88', 'PL': '229', 'TR': '195', 'AE': '192',
      'SA': '191', 'EG': '232', 'NG': '231', 'ZA': '184', 'AR': '218', 'CO': '200',
      'RO': '11', 'KZ': '213', 'SG': '158', 'NZ': '69', 'DK': '206', 'AT': '198',
      'IE': '233', 'BE': '225', 'SE': '206', 'NO': '206', 'FI': '206', 'CH': '206',
      'BG': '225', 'HU': '206', 'GR': '206', 'HR': '206', 'SI': '206', 'SK': '206',
      'EE': '235', 'LV': '203', 'LT': '199', 'BY': '222', 'GE': '207', 'AM': '219',
      'AZ': '220', 'UZ': '228', 'KG': '228', 'TJ': '187', 'AF': '214', 'AL': '215',
      'DZ': '216', 'MA': '185', 'TN': '206', 'JO': '206', 'IL': '193', 'PS': '194',
      'IQ': '206', 'KW': '206', 'QA': '196', 'BH': '221', 'OM': '206', 'YE': '206',
      'PK': '206', 'BD': '183', 'MM': '186', 'KH': '211', 'LA': '32',
      'SG': '158', 'AU': '188', 'NZ': '69', 'FJ': '206', 'PG': '206',
      'CA': '13', 'MX': '212', 'GT': '206', 'CU': '206', 'CO': '200',
      'EC': '206', 'PE': '206', 'CL': '206', 'AR': '218', 'BR': '224', 'PY': '206',
      'UY': '206', 'BO': '204', 'CM': '208', 'BJ': '209', 'CI': '234',
      'SN': '206', 'ML': '206', 'NG': '231', 'GH': '206', 'KE': '226', 'TZ': '227',
      'ZA': '184', 'AO': '217', 'BW': '223', 'MG': '230'
    };
    return map[country] || '5';
  }
};

module.exports = smsBus;
