// ====== EDIT SERVICES HERE ======
// To add a new service: copy one block, change values
// iconClass options: fb, fiverr, wa, telegram, twitter, amazon,
//   google, instagram, tiktok, discord, microsoft, uber, paypal, steam, other

const services = [
  // ===== RECOMMENDED =====
  { id: 'wa-us', name: 'WhatsApp', region: 'United States', country: 'US', icon: 'fab fa-whatsapp', iconClass: 'wa', price: 0.70, category: 'recommended' },

  // ===== ANY OTHER =====
  { id: 'any-other', name: 'Any other', region: 'United States', country: 'US', icon: 'fas fa-question-circle', iconClass: 'other', price: 0.50, category: 'recommended' },

  // ===== POPULAR =====
  { id: 'alibaba', name: 'Alibaba', region: 'United States', country: 'US', icon: 'fab fa-alipay', iconClass: 'other', price: 0.85, category: 'popular' },
  { id: 'xiaomi', name: 'Xiaomi', region: 'United States', country: 'US', icon: 'fas fa-mobile-alt', iconClass: 'other', price: 0.75, category: 'popular' },
  { id: 'mega', name: 'MEGA', region: 'United States', country: 'US', icon: 'fas fa-cloud', iconClass: 'other', price: 0.60, category: 'popular' },
  { id: 'monobank', name: 'Monobank', region: 'United States', country: 'US', icon: 'fas fa-university', iconClass: 'other', price: 0.55, category: 'popular' },
  { id: 'ashley-madison', name: 'Ashley Madison', region: 'United States', country: 'US', icon: 'fas fa-heart', iconClass: 'other', price: 0.80, category: 'popular' },
  { id: 'magicbricks', name: 'Magicbricks', region: 'United States', country: 'US', icon: 'fas fa-home', iconClass: 'other', price: 0.70, category: 'popular' },
  { id: 'gett', name: 'Gett', region: 'United States', country: 'US', icon: 'fas fa-taxi', iconClass: 'other', price: 0.65, category: 'popular' },
  { id: 'snappfood', name: 'SnappFood', region: 'United States', country: 'US', icon: 'fas fa-utensils', iconClass: 'other', price: 0.60, category: 'popular' },
  { id: 'roblox', name: 'Roblox', region: 'United States', country: 'US', icon: 'fas fa-gamepad', iconClass: 'other', price: 0.50, category: 'popular' },
  { id: 'bolt', name: 'Bolt', region: 'United States', country: 'US', icon: 'fas fa-bolt', iconClass: 'other', price: 0.55, category: 'popular' },
  { id: 'autotrader', name: 'Autotrader', region: 'United States', country: 'US', icon: 'fas fa-car', iconClass: 'other', price: 0.75, category: 'popular' },
  { id: 'chalkboard', name: 'Chalkboard', region: 'United States', country: 'US', icon: 'fas fa-chalkboard', iconClass: 'other', price: 0.65, category: 'popular' },
  { id: 'google-chat', name: 'Google Chat', region: 'United States', country: 'US', icon: 'fab fa-google', iconClass: 'google', price: 0.45, category: 'popular' },
  { id: 'swarail', name: 'SwaRail', region: 'United States', country: 'US', icon: 'fas fa-train', iconClass: 'other', price: 0.70, category: 'popular' },
  { id: 'dundle', name: 'Dundle', region: 'United States', country: 'US', icon: 'fas fa-shopping-bag', iconClass: 'other', price: 0.60, category: 'popular' },
  { id: 'switips', name: 'Switips', region: 'United States', country: 'US', icon: 'fas fa-lightbulb', iconClass: 'other', price: 0.55, category: 'popular' },
  { id: '32red', name: '32red', region: 'United States', country: 'US', icon: 'fas fa-dice', iconClass: 'other', price: 0.80, category: 'popular' },
  { id: 'zeenow', name: 'ZeeNow', region: 'United States', country: 'US', icon: 'fas fa-tv', iconClass: 'other', price: 0.65, category: 'popular' },
  { id: 'ininal', name: 'Ininal', region: 'United States', country: 'US', icon: 'fas fa-credit-card', iconClass: 'other', price: 0.50, category: 'popular' },
  { id: 'kazanexpress', name: 'KazanExpress', region: 'United States', country: 'US', icon: 'fas fa-truck', iconClass: 'other', price: 0.60, category: 'popular' },
  { id: 'swvl', name: 'Swvl', region: 'United States', country: 'US', icon: 'fas fa-bus', iconClass: 'other', price: 0.55, category: 'popular' },
  { id: 'bykea', name: 'Bykea', region: 'United States', country: 'US', icon: 'fas fa-motorcycle', iconClass: 'other', price: 0.65, category: 'popular' },
  { id: 'jkf', name: 'JKF', region: 'United States', country: 'US', icon: 'fas fa-plane', iconClass: 'other', price: 0.75, category: 'popular' },
  { id: 'alfursan', name: 'AlFursan', region: 'United States', country: 'US', icon: 'fas fa-users', iconClass: 'other', price: 0.70, category: 'popular' },
  { id: 'tennents', name: 'Tennents', region: 'United States', country: 'US', icon: 'fas fa-beer', iconClass: 'other', price: 0.60, category: 'popular' },
  { id: 'nobroker', name: 'NoBroker', region: 'United States', country: 'US', icon: 'fas fa-building', iconClass: 'other', price: 0.65, category: 'popular' },
  { id: 'mrq', name: 'MrQ', region: 'United States', country: 'US', icon: 'fas fa-shopping-cart', iconClass: 'other', price: 0.55, category: 'popular' },
  { id: 'mewt', name: 'Mewt', region: 'United States', country: 'US', icon: 'fas fa-cat', iconClass: 'other', price: 0.50, category: 'popular' },
  { id: 'grupo-madero', name: 'Grupo Madero', region: 'United States', country: 'US', icon: 'fas fa-utensils', iconClass: 'other', price: 0.75, category: 'popular' },
  { id: 'skroutz', name: 'Skroutz', region: 'United States', country: 'US', icon: 'fas fa-search', iconClass: 'other', price: 0.60, category: 'popular' },
  { id: 'pingpong', name: 'PingPong', region: 'United States', country: 'US', icon: 'fas fa-table-tennis-paddle-ball', iconClass: 'other', price: 0.55, category: 'popular' },
  { id: 'gamekit', name: 'Gamekit', region: 'United States', country: 'US', icon: 'fas fa-gamepad', iconClass: 'other', price: 0.50, category: 'popular' },
  { id: '1688', name: '1688', region: 'United States', country: 'US', icon: 'fab fa-alipay', iconClass: 'other', price: 0.80, category: 'popular' },
  { id: 'airtasker', name: 'Airtasker', region: 'United States', country: 'US', icon: 'fas fa-tasks', iconClass: 'other', price: 0.65, category: 'popular' },
  { id: 'likee', name: 'Likee', region: 'United States', country: 'US', icon: 'fas fa-video', iconClass: 'other', price: 0.55, category: 'popular' },
  { id: 'monese', name: 'Monese', region: 'United States', country: 'US', icon: 'fas fa-euro-sign', iconClass: 'other', price: 0.60, category: 'popular' },
  { id: 'yaay', name: 'Yaay', region: 'United States', country: 'US', icon: 'fas fa-smile', iconClass: 'other', price: 0.50, category: 'popular' },
  { id: '4fun', name: '4Fun', region: 'United States', country: 'US', icon: 'fas fa-laugh', iconClass: 'other', price: 0.55, category: 'popular' },
  { id: 'mosgram', name: 'MosGram', region: 'United States', country: 'US', icon: 'fas fa-envelope', iconClass: 'other', price: 0.60, category: 'popular' },
  { id: 'kcex', name: 'KCEX', region: 'United States', country: 'US', icon: 'fas fa-exchange-alt', iconClass: 'other', price: 0.70, category: 'popular' },
  { id: 'taovip', name: 'TAOVIP', region: 'United States', country: 'US', icon: 'fab fa-alipay', iconClass: 'other', price: 0.65, category: 'popular' },
  { id: 'huntthemouse', name: 'HuntTheMouse', region: 'United States', country: 'US', icon: 'fas fa-mouse-pointer', iconClass: 'other', price: 0.55, category: 'popular' },
  { id: 'mocamoca', name: 'MocaMoca', region: 'United States', country: 'US', icon: 'fas fa-coffee', iconClass: 'other', price: 0.50, category: 'popular' },

  // ===== SOCIAL MEDIA =====
  { id: 'fb-us', name: 'Facebook', region: 'United States', country: 'US', icon: 'fab fa-facebook-f', iconClass: 'fb', price: 0.50, category: 'social' },
  { id: 'ig', name: 'Instagram', region: 'United States', country: 'US', icon: 'fab fa-instagram', iconClass: 'instagram', price: 0.60, category: 'social' },
  { id: 'tiktok', name: 'TikTok', region: 'United States', country: 'US', icon: 'fab fa-tiktok', iconClass: 'tiktok', price: 0.55, category: 'social' },
  { id: 'discord', name: 'Discord', region: 'United States', country: 'US', icon: 'fab fa-discord', iconClass: 'discord', price: 0.40, category: 'social' },
  { id: 'tg', name: 'Telegram', region: 'United States', country: 'US', icon: 'fab fa-telegram-plane', iconClass: 'telegram', price: 0.45, category: 'social' },
  { id: 'twitter', name: 'Twitter / X', region: 'United States', country: 'US', icon: 'fab fa-x-twitter', iconClass: 'twitter', price: 0.55, category: 'social' },

  // ===== E-COMMERCE =====
  { id: 'amazon', name: 'Amazon', region: 'United States', country: 'US', icon: 'fab fa-amazon', iconClass: 'amazon', price: 0.90, category: 'ecommerce' },
  { id: 'paypal', name: 'PayPal', region: 'United States', country: 'US', icon: 'fab fa-paypal', iconClass: 'paypal', price: 0.85, category: 'ecommerce' },
  { id: 'fiverr', name: 'Fiverr', region: 'United States', country: 'US', icon: 'fab fa-font-awesome', iconClass: 'fiverr', price: 0.80, category: 'ecommerce' },
  { id: 'uber', name: 'Uber', region: 'United States', country: 'US', icon: 'fab fa-uber', iconClass: 'uber', price: 0.75, category: 'ecommerce' },
  { id: 'lyft', name: 'Lyft', region: 'United States', country: 'US', icon: 'fas fa-car', iconClass: 'lyft', price: 0.70, category: 'ecommerce' },
  { id: 'steam', name: 'Steam', region: 'United States', country: 'US', icon: 'fab fa-steam', iconClass: 'steam', price: 0.65, category: 'ecommerce' },
  { id: 'ms', name: 'Microsoft', region: 'United States', country: 'US', icon: 'fab fa-microsoft', iconClass: 'microsoft', price: 0.50, category: 'ecommerce' },
  { id: 'google', name: 'Google', region: 'United States', country: 'US', icon: 'fab fa-google', iconClass: 'google', price: 0.35, category: 'ecommerce' },
];

services.forEach((service, index) => {
  if (service.available === undefined) {
    service.available = 10579 - ((index * 73) % 5000);
  }
});

// ====== EDIT COUNTRIES HERE =====nconst countries = [
  { code: 'US', name: 'United States', flag: '🇺🇸', prefix: '+1', basePrice: 0.50 },
  { code: 'UK', name: 'United Kingdom', flag: '🇬🇧', prefix: '+44', basePrice: 0.65 },
  { code: 'DE', name: 'Germany', flag: '🇩🇪', prefix: '+49', basePrice: 0.60 },
  { code: 'FR', name: 'France', flag: '🇫🇷', prefix: '+33', basePrice: 0.55 },
  { code: 'CA', name: 'Canada', flag: '🇨🇦', prefix: '+1', basePrice: 0.60 },
  { code: 'AU', name: 'Australia', flag: '🇦🇺', prefix: '+61', basePrice: 0.70 },
  { code: 'JP', name: 'Japan', flag: '🇯🇵', prefix: '+81', basePrice: 0.80 },
  { code: 'NL', name: 'Netherlands', flag: '🇳🇱', prefix: '+31', basePrice: 0.55 },
  { code: 'BJ', name: 'Benin', flag: '🇧🇯', prefix: '+229', basePrice: 3.00 },
  { code: 'SD', name: 'Sudan', flag: '🇸🇩', prefix: '+249', basePrice: 3.00 },
  { code: 'RE', name: 'Reunion', flag: '🇷🇪', prefix: '+262', basePrice: 3.00 },
  { code: 'DZ', name: 'Algeria', flag: '🇩🇿', prefix: '+213', basePrice: 3.00 },
  { code: 'BO', name: 'Bolivia', flag: '🇧🇴', prefix: '+591', basePrice: 3.00 },
  { code: 'ZM', name: 'Zambia', flag: '🇿🇲', prefix: '+260', basePrice: 3.00 },
  { code: 'KZ', name: 'Kazakhstan', flag: '🇰🇿', prefix: '+7', basePrice: 4.00 },
  { code: 'SS', name: 'South Sudan', flag: '🇸🇸', prefix: '+211', basePrice: 4.00 },
  { code: 'MV', name: 'Maldives', flag: '🇲🇻', prefix: '+960', basePrice: 4.00 },
  { code: 'LK', name: 'Sri Lanka', flag: '🇱🇰', prefix: '+94', basePrice: 4.00 },
  { code: 'ER', name: 'Eritrea', flag: '🇪🇷', prefix: '+291', basePrice: 4.00 },
  { code: 'AM', name: 'Armenia', flag: '🇦🇲', prefix: '+374', basePrice: 4.00 },
  { code: 'IR', name: 'Iran', flag: '🇮🇷', prefix: '+98', basePrice: 4.00 },
  { code: 'KM', name: 'Comoros', flag: '🇰🇲', prefix: '+269', basePrice: 4.00 },
  { code: 'EC', name: 'Ecuador', flag: '🇪🇨', prefix: '+593', basePrice: 4.00 },
  { code: 'LB', name: 'Lebanon', flag: '🇱🇧', prefix: '+961', basePrice: 4.00 },
  { code: 'IL', name: 'Israel', flag: '🇮🇱', prefix: '+972', basePrice: 5.00 },
  { code: 'EG', name: 'Egypt', flag: '🇪🇬', prefix: '+20', basePrice: 5.00 },
  { code: 'RS', name: 'Serbia', flag: '🇷🇸', prefix: '+381', basePrice: 10.00 },
  { code: 'SG', name: 'Singapore', flag: '🇸🇬', prefix: '+65', basePrice: 14.00 },
  { code: 'CN', name: 'China', flag: '🇨🇳', prefix: '+86', basePrice: 14.00 },
  { code: 'TW', name: 'Taiwan', flag: '🇹🇼', prefix: '+886', basePrice: 137.00 },
];

// Active numbers and history start empty — backend will provide them
let activeNumbers = [];

let historyData = [];

let balance = 6.00;