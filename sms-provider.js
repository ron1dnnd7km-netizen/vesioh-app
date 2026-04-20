var SMS_API_KEY = process.env.SMS_API_KEY || 'YOUR_API_KEY_HERE';

var smsBus = {
  apiBase: 'https://sms-bus.com/api',
  
  getNumber: async function(service, country) {
    try {
      var url = this.apiBase + '/order/create';
      var response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer ' + SMS_API_KEY,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          service: service,
          country: country
        })
      });
      var text = await response.text();
      let data;
      try { data = JSON.parse(text); } catch (e) { return { success: false, error: 'SMS-Bus returned: ' + text }; }

      if (data.success && data.data && data.data.id) {
        return { success: true, requestId: String(data.data.id), phone: data.data.phone };
      }

      return { success: false, error: data.message || data.error || 'No numbers available. Try a different country.' };
    } catch (err) { return { success: false, error: 'Connection failed: ' + err.message }; }
  },

  checkCode: async function(requestId) {
    try {
      var url = this.apiBase + '/order/sms?order_id=' + requestId;
      var response = await fetch(url, {
        headers: { 'Authorization': 'Bearer ' + SMS_API_KEY }
      });
      var text = await response.text();
      let data;
      try { data = JSON.parse(text); } catch (e) { return { success: false, waiting: true }; }

      if (data.success && data.data && data.data.sms) {
        return { success: true, code: data.data.sms };
      }
      if (data.data && data.data.status === 'pending') {
        return { success: false, waiting: true };
      }
      return { success: false, waiting: true };
    } catch (err) { return { success: false, waiting: true, error: err.message }; }
  },

  cancel: async function(requestId) {
    try {
      var url = this.apiBase + '/order/delete?order_id=' + requestId;
      var response = await fetch(url, {
        method: 'POST',
        headers: { 'Authorization': 'Bearer ' + SMS_API_KEY }
      });
      var data = await response.json();
      return data.success === true;
    } catch (err) { return false; }
  },

  complete: async function(requestId) {
    try {
      var url = this.apiBase + '/order/finish?order_id=' + requestId;
      var response = await fetch(url, {
        method: 'POST',
        headers: { 'Authorization': 'Bearer ' + SMS_API_KEY }
      });
      var data = await response.json();
      return data.success === true;
    } catch (err) { return false; }
  },

  getServiceCode: function(serviceName) {
    var map = {
      'WhatsApp': 'whatsapp', 'Telegram': 'telegram', 'Facebook': 'facebook',
      'Instagram': 'instagram', 'Google': 'google', 'Twitter / X': 'twitter',
      'TikTok': 'tiktok', 'Discord': 'discord', 'Amazon': 'amazon',
      'Microsoft': 'microsoft', 'Fiverr': 'fiverr', 'PayPal': 'paypal',
      'Steam': 'steam', 'Uber': 'uber', 'Lyft': 'lyft'
    };
    return map[serviceName] || 'whatsapp';
  },

  getCountryCode: function(country) {
    var map = {
      'US': 'us', 'UK': 'gb', 'DE': 'de', 'FR': 'fr', 'CA': 'ca',
      'AU': 'au', 'JP': 'jp', 'NL': 'nl'
    };
    return map[country] || 'us';
  }
};

module.exports = smsBus;
