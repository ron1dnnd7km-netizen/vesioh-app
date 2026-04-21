var SMS_API_KEY = process.env.SMS_API_KEY || 'YOUR_API_KEY_HERE';
var apiBase = 'https://sms-bus.com/api/control';

// DYNAMIC MAPS (Will be filled automatically from SMS-Bus API)
var dynamicServiceMap = {};
var dynamicCountryMap = {};

var smsBus = {
  // This function is called by server.js on startup
  setMaps: function(serviceMap, countryMap) {
    dynamicServiceMap = serviceMap;
    dynamicCountryMap = countryMap;
    console.log("[SMS-PROVIDER] Loaded " + Object.keys(dynamicServiceMap).length + " services and " + Object.keys(dynamicCountryMap).length + " countries from API.");
  },

  getNumber: async function(service, country) {
    try {
      var url = apiBase + '/get/number?token=' + SMS_API_KEY + '&country_id=' + country + '&project_id=' + service;
      
      console.log("[SMS-PROVIDER] Calling: ", url);

      var response = await fetch(url);
      var data = await response.json();

      if (data.code === 200 && data.data && data.data.request_id) {
        console.log("[SUCCESS] Got number:", data.data.number);
        return { success: true, requestId: String(data.data.request_id), phone: data.data.number };
      }

      var errorMsg = data.message || 'No numbers available. Try a different country.';
      if (data.code === 50002) errorMsg = 'No numbers available for this country/service combination.';
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
      if (data.code === 50101) return { success: false, waiting: true };
      if (data.code === 50102) return { success: false, waiting: false, error: 'Number expired' };
      
      return { success: false, waiting: true, error: data.message };
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

  complete: async function(requestId) { return true; },

  getServiceCode: function(serviceName, serviceId) {
    if (serviceId && dynamicServiceMap[serviceId.toLowerCase()]) {
      return dynamicServiceMap[serviceId.toLowerCase()];
    }
    
    // NO FALLBACK. If the API provider doesn't have it, fail cleanly.
    console.error("[SMS-PROVIDER] ERROR: Service '" + serviceId + "' is not supported by the API.");
    return null; 
  },

  getCountryCode: function(country) {
    if (!country) {
      console.error("[SMS-PROVIDER] ERROR: No country was selected.");
      return null;
    }
    
    if (dynamicCountryMap[country.toLowerCase()]) {
      return dynamicCountryMap[country.toLowerCase()];
    }
    
    // NO FALLBACK. If the API provider doesn't have it, fail cleanly.
    console.error("[SMS-PROVIDER] ERROR: Country '" + country + "' is not supported by the API.");
    return null;
  }
};

module.exports = smsBus;