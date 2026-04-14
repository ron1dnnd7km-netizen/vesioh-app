// ====== EDIT SERVICES HERE ======
// To add a new service: copy one block, change values
// iconClass options: fb, fiverr, wa, telegram, twitter, amazon, 
//   google, instagram, tiktok, discord, microsoft, uber, paypal, steam, other

const services = [
  {
    id: 'fb-us',           // unique ID (no spaces)
    name: 'Facebook',      // display name
    region: 'United States',
    country: 'US',         // must match a country code below
    icon: 'fab fa-facebook-f',
    iconClass: 'fb',       // controls the icon background color
    price: 0.50,           // cost per number
    category: 'recommended' // recommended | popular | social | ecommerce
  },
  {
    id: 'wa-us',
    name: 'WhatsApp',
    region: 'United States',
    country: 'US',
    icon: 'fab fa-whatsapp',
    iconClass: 'wa',
    price: 0.70,
    category: 'recommended'
  },
  // ... paste the rest from your current file
];

// ====== EDIT COUNTRIES HERE ======
const countries = [
  { code: 'US', name: 'United States', flag: '🇺🇸', prefix: '+1' },
  { code: 'UK', name: 'United Kingdom', flag: '🇬🇧', prefix: '+44' },
  // ... paste the rest
];

// Active numbers and history start empty — backend will provide them
let activeNumbers = [];
let historyData = [];
let balance = 6.00;