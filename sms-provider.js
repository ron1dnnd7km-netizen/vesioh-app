var SMS_API_KEY = process.env.SMS_API_KEY || 'YOUR_API_KEY_HERE';
var SMS_PROVIDER = process.env.SMS_PROVIDER || 'sms-activate';

var smsActivate = {

  getNumber: async function(service, country) {
    try {
      var url = 'https://sms-activate.org/stubs/handler_api.php?api_key=' + SMS_API_KEY + '&action=getNumber&service=' + service + '&country=' + country;
      var response = await fetch(url);
      var text = String(await response.text());

      if (text.indexOf('ACCESS_NUMBER') !== -1) {
        var parts = text.split(':');
        return { success: true, requestId: parts[1], phone: parts[2] };
      }

      if (text.indexOf('NO_NUMBERS') !== -1) {
        return { success: false, error: 'No numbers available. Try a different country.' };
      }

      if (text.indexOf('ERROR') !== -1) {
        return { success: false, error: text };
      }

      return { success: false, error: 'Provider says: ' + text };
    } catch (err) {
      return { success: false, error: 'Connection failed: ' + err.message };
    }
  },

  checkCode: async function(requestId) {
    try {
      var url = 'https://sms-activate.org/stubs/handler_api.php?api_key=' + SMS_API_KEY + '&action=getStatus&id=' + requestId;
      var response = await fetch(url);
      var text = String(await response.text());

      if (text.indexOf('STATUS_OK:') !== -1) {
        var code = text.split(':')[1];
        return { success: true, code: code };
      }

      if (text.indexOf('STATUS_WAIT') !== -1) {
        return { success: false, waiting: true };
      }

      if (text.indexOf('STATUS_CANCEL') !== -1) {
        return { success: false, waiting: false, error: 'Cancelled' };
      }

      return { success: false, waiting: false, error: text };
    } catch (err) {
      return { success: false, waiting: true, error: err.message };
    }
  },

  cancel: async function(requestId) {
    try {
      var url = 'https://sms-activate.org/stubs/handler_api.php?api_key=' + SMS_API_KEY + '&action=setStatus&status=8&id=' + requestId;
      var response = await fetch(url);
      var text = String(await response.text());
      return text.indexOf('ACCESS_CANCEL') !== -1;
    } catch (err) {
      return false;
    }
  },

  complete: async function(requestId) {
    try {
      var url = 'https://sms-activate.org/stubs/handler_api.php?api_key=' + SMS_API_KEY + '&action=setStatus&status=6&id=' + requestId;
      var response = await fetch(url);
      var text = String(await response.text());
      return text.indexOf('ACCESS_ACTIVATION') !== -1;
    } catch (err) {
      return false;
    }
  },

  getBalance: async function() {
    try {
      var url = 'https://sms-activate.org/stubs/handler_api.php?api_key=' + SMS_API_KEY + '&action=getBalance';
      var response = await fetch(url);
      var text = String(await response.text());
      if (text.indexOf('ACCESS_BALANCE:') !== -1) {
        return text.split(':')[1];
      }
      return null;
    } catch (err) {
      return null;
    }
  },

  getServiceCode: function(serviceName) {
    var map = {
      'WhatsApp': 'wa',
      'Telegram': 'tg',
      'Facebook': 'fb',
      'Instagram': 'ig',
      'Google': 'go',
      'Twitter / X': 'tw',
      'TikTok': 'tt',
      'Discord': 'dc',
      'Amazon': 'am',
      'Microsoft': 'ms',
      'Fiverr': 'fv',
      'PayPal': 'pp',
      'Steam': 'st',
      'Uber': 'ub',
      'Lyft': 'lf'
    };
    return map[serviceName] || 'wa';
  },

  getCountryCode: function(country) {
    var map = {
      'US': '0',
      'UK': '22',
      'DE': '77',
      'FR': '33',
      'CA': '1',
      'AU': '46',
      'JP': '79',
      'NL': '55'
    };
    return map[country] || '0';
  }
};

var fiveSim = {

  getNumber: async function(service, country) {
    try {
      var url = 'https://5sim.net/v1/user/buy/activation/' + country + '/' + service + '/any';
      var response = await fetch(url, {
        headers: { 'Authorization': 'Bearer ' + SMS_API_KEY }
      });
      var data = await response.json();
      if (data.id) {
        return { success: true, requestId: String(data.id), phone: data.phone };
      }
      return { success: false, error: data.message || 'No numbers available' };
    } catch (err) {
      return { success: false, error: 'Connection failed: ' + err.message };
    }
  },

  checkCode: async function(requestId) {
    try {
      var url = 'https://5sim.net/v1/user/check/' + requestId;
      var response = await fetch(url, {
        headers: { 'Authorization': 'Bearer ' + SMS_API_KEY }
      });
      var data = await response.json();
      if (data.sms && data.sms.length > 0) {
        return { success: true, code: data.sms[0].code };
      }
      return { success: false, waiting: true };
    } catch (err) {
      return { success: false, waiting: true, error: err.message };
    }
  },

  cancel: async function(requestId) {
    try {
      await fetch('https://5sim.net/v1/user/cancel/' + requestId, {
        headers: { 'Authorization': 'Bearer ' + SMS_API_KEY },
        method: 'POST'
      });
      return true;
    } catch (err) {
      return false;
    }
  },

  complete: async function(requestId) {
    try {
      await fetch('https://5sim.net/v1/user/finish/' + requestId, {
        headers: { 'Authorization': 'Bearer ' + SMS_API_KEY },
        method: 'POST'
      });
      return true;
    } catch (err) {
      return false;
    }
  },

  getServiceCode: function(serviceName) {
    var map = {
      'WhatsApp': 'whatsapp',
      'Telegram': 'telegram',
      'Facebook': 'facebook',
      'Instagram': 'instagram',
      'Google': 'google',
      'Twitter / X': 'twitter',
      'TikTok': 'tiktok',
      'Discord': 'discord',
      'Amazon': 'amazon',
      'Microsoft': 'microsoft'
    };
    return map[serviceName] || 'whatsapp';
  },

  getCountryCode: function(country) {
    var map = {
      'US': 'usa',
      'UK': 'uk',
      'DE': 'germany',
      'FR': 'france',
      'CA': 'canada',
      'AU': 'australia',
      'JP': 'japan',
      'NL': 'netherlands'
    };
    return map[country] || 'usa';
  }
};

var smsMan = {
  apiBase: 'https://sms-man.com/api',

  getNumber: async function(service, country) {
    try {
      var url = this.apiBase + '/get-sms?apikey=' + SMS_API_KEY + '&service=' + service + '&country=' + country;
      var response = await fetch(url);
      var text = String(await response.text());
      var data = {};
      try {
        data = JSON.parse(text);
      } catch (e) {
        return { success: false, error: 'SMS-Man returned an unexpected response: ' + text };
      }

      if (data.status === 'success' || data.id || data.request_id) {
        return { success: true, requestId: String(data.id || data.request_id), phone: data.phone || data.number };
      }

      return { success: false, error: data.error || data.message || 'No numbers available. Try a different country.' };
    } catch (err) {
      return { success: false, error: 'Connection failed: ' + err.message };
    }
  },

  checkCode: async function(requestId) {
    try {
      var url = this.apiBase + '/get-sms-status?apikey=' + SMS_API_KEY + '&id=' + requestId;
      var response = await fetch(url);
      var text = String(await response.text());
      var data = {};
      try {
        data = JSON.parse(text);
      } catch (e) {
        if (text.indexOf('STATUS_OK') !== -1) {
          return { success: true, code: text.split(':')[1] };
        }
        return { success: false, waiting: true };
      }

      if (data.status === 'success' && data.code) {
        return { success: true, code: data.code };
      }

      if (data.status === 'waiting' || data.status === 'pending') {
        return { success: false, waiting: true };
      }

      return { success: false, waiting: false, error: data.error || text };
    } catch (err) {
      return { success: false, waiting: true, error: err.message };
    }
  },

  cancel: async function(requestId) {
    try {
      var url = this.apiBase + '/set-status?apikey=' + SMS_API_KEY + '&id=' + requestId + '&status=8';
      var response = await fetch(url);
      var text = String(await response.text());
      return text.indexOf('ACCESS_CANCEL') !== -1 || text.indexOf('success') !== -1;
    } catch (err) {
      return false;
    }
  },

  complete: async function(requestId) {
    try {
      var url = this.apiBase + '/set-status?apikey=' + SMS_API_KEY + '&id=' + requestId + '&status=6';
      await fetch(url);
      return true;
    } catch (err) {
      return false;
    }
  },

  getServiceCode: function(serviceName) {
    var map = {
      'WhatsApp': 'whatsapp',
      'Telegram': 'telegram',
      'Facebook': 'facebook',
      'Instagram': 'instagram',
      'Google': 'google',
      'Twitter / X': 'twitter',
      'TikTok': 'tiktok',
      'Discord': 'discord',
      'Amazon': 'amazon',
      'Microsoft': 'microsoft'
    };
    return map[serviceName] || 'whatsapp';
  },

  getCountryCode: function(country) {
    var map = {
      'US': 'usa',
      'UK': 'uk',
      'DE': 'germany',
      'FR': 'france',
      'CA': 'canada',
      'AU': 'australia',
      'JP': 'japan',
      'NL': 'netherlands'
    };
    return map[country] || 'usa';
  }
};

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
      var data = await response.json();

      if (data.success && data.data && data.data.id) {
        return { success: true, requestId: String(data.data.id), phone: data.data.phone };
      }

      return { success: false, error: data.message || 'No numbers available. Try a different country.' };
    } catch (err) {
      return { success: false, error: 'Connection failed: ' + err.message };
    }
  },

  checkCode: async function(requestId) {
    try {
      var url = this.apiBase + '/order/sms?order_id=' + requestId;
      var response = await fetch(url, {
        headers: { 'Authorization': 'Bearer ' + SMS_API_KEY }
      });
      var data = await response.json();

      if (data.success && data.data && data.data.sms) {
        return { success: true, code: data.data.sms };
      }

      if (data.data && data.data.status === 'pending') {
        return { success: false, waiting: true };
      }

      return { success: false, waiting: true };
    } catch (err) {
      return { success: false, waiting: true, error: err.message };
    }
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
    } catch (err) {
      return false;
    }
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
    } catch (err) {
      return false;
    }
  },

  getBalance: async function() {
    try {
      var url = this.apiBase + '/user/profile';
      var response = await fetch(url, {
        headers: { 'Authorization': 'Bearer ' + SMS_API_KEY }
      });
      var data = await response.json();
      if (data.success && data.data && data.data.balance !== undefined) {
        return data.data.balance;
      }
      return null;
    } catch (err) {
      return null;
    }
  },

  getServiceCode: function(serviceName) {
    var map = {
      'WhatsApp': 'whatsapp',
      'Telegram': 'telegram',
      'Facebook': 'facebook',
      'Instagram': 'instagram',
      'Google': 'google',
      'Twitter / X': 'twitter',
      'TikTok': 'tiktok',
      'Discord': 'discord',
      'Amazon': 'amazon',
      'Microsoft': 'microsoft',
      'Fiverr': 'fiverr',
      'PayPal': 'paypal',
      'Steam': 'steam',
      'Uber': 'uber',
      'Lyft': 'lyft'
    };
    return map[serviceName] || 'whatsapp';
  },

  getCountryCode: function(country) {
    var map = {
      'US': 'us',
      'UK': 'gb',
      'DE': 'de',
      'FR': 'fr',
      'CA': 'ca',
      'AU': 'au',
      'JP': 'jp',
      'NL': 'nl'
    };
    return map[country] || 'us';
  }
};

var smsBus = {
  apiBase: 'https://sms-bus.com/api/v2',
  
  getNumber: async function(service, country) {
    try {
      var url = this.apiBase + '?action=getNumber&token=' + SMS_API_KEY + '&service=' + service + '&country=' + country;
      var response = await fetch(url);
      var text = await response.text();
      var data = {};
      try {
        data = JSON.parse(text);
      } catch (e) {
        return { success: false, error: 'SMS-Bus returned: ' + text };
      }

      if (data.id || data.phone) {
        return { success: true, requestId: String(data.id), phone: data.phone };
      }

      return { success: false, error: data.error || data.message || 'No numbers available. Try a different country.' };
    } catch (err) {
      return { success: false, error: 'Connection failed: ' + err.message };
    }
  },

  checkCode: async function(requestId) {
    try {
      var url = this.apiBase + '?action=getCode&token=' + SMS_API_KEY + '&id=' + requestId;
      var response = await fetch(url);
      var text = await response.text();
      var data = {};
      try {
        data = JSON.parse(text);
      } catch (e) {
        return { success: false, waiting: true };
      }

      if (data.code || data.sms) {
        return { success: true, code: data.code || data.sms };
      }

      if (data.status === 'waiting' || data.status === 'pending') {
        return { success: false, waiting: true };
      }

      return { success: false, waiting: false, error: data.error || text };
    } catch (err) {
      return { success: false, waiting: true, error: err.message };
    }
  },

  cancel: async function(requestId) {
    try {
      var url = this.apiBase + '?action=banNumber&token=' + SMS_API_KEY + '&id=' + requestId;
      await fetch(url);
      return true;
    } catch (err) {
      return false;
    }
  },

  complete: async function(requestId) {
    try {
      var url = this.apiBase + '?action=endNumber&token=' + SMS_API_KEY + '&id=' + requestId;
      await fetch(url);
      return true;
    } catch (err) {
      return false;
    }
  },

  getServiceCode: function(serviceName) {
    var map = {
      'WhatsApp': 'whatsapp',
      'Telegram': 'telegram',
      'Facebook': 'facebook',
      'Instagram': 'instagram',
      'Google': 'google',
      'Twitter / X': 'twitter',
      'TikTok': 'tiktok',
      'Discord': 'discord'
    };
    return map[serviceName] || 'whatsapp';
  },

  getCountryCode: function(country) {
    var map = {
      'US': 'usa',
      'UK': 'uk',
      'DE': 'germany',
      'FR': 'france',
      'CA': 'canada',
      'AU': 'australia',
      'JP': 'japan',
      'NL': 'netherlands'
    };
    return map[country] || 'russia';
  }
};

function getProvider() {
  if (SMS_PROVIDER === '5sim') return fiveSim;
  if (SMS_PROVIDER.indexOf('sms-man') !== -1) return smsMan;
  if (SMS_PROVIDER.indexOf('sms-bus') !== -1) return smsBus;
  return smsActivate;
}

module.exports = getProvider();