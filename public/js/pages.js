/* ===== REAL BRAND ICON MAPPER ===== */
function getServiceIconData(serviceName, serviceId, existingIcon) {
  var name = (serviceName || '').toLowerCase();
  var id = (serviceId || '').toLowerCase();
  var icon = (existingIcon || '').trim();
  
  // CHECK IF IT'S A REAL IMAGE URL
  var isImage = /\.(png|jpg|jpeg|gif|svg|webp)(\?.*)?$/i.test(icon) || icon.indexOf('http') === 0 || icon.indexOf('/') === 0;
  if (isImage) {
    return { 
      html: '<img src="' + icon + '" style="width:100%;height:100%;object-fit:contain;" onerror="this.outerHTML=\'<i class=fas fa-globe></i>\'">', 
      color: '#374151', 
      bg: 'rgba(0,0,0,0.04)' 
    };
  }
  
  // Map of icon class → brand color
    // CHECK IF IT'S A REAL IMAGE URL
  var isImage = /\.(png|jpg|jpeg|gif|svg|webp)(\?.*)?$/i.test(icon) || icon.indexOf('http') === 0 || icon.indexOf('/') === 0;
  if (isImage) {
    return { 
      html: '<img src="' + icon + '" style="width:100%;height:100%;object-fit:contain;" onerror="this.outerHTML=\'<i class=fas fa-globe></i>\'">', 
      color: '#374151', 
      bg: 'rgba(0,0,0,0.04)' 
    };
  }

  // ===== FORCE REAL LOGOS BY SERVICE NAME =====
  var nameImageMap = {
    'whatsapp': 'https://upload.wikimedia.org/wikipedia/commons/a/a7/2062095_application_chat_communication_logo_whatsapp_icon.svg',
    'telegram': 'https://upload.wikimedia.org/wikipedia/commons/8/82/Telegram_logo.svg',
    'facebook': 'https://upload.wikimedia.org/wikipedia/commons/5/51/Facebook_f_logo_%282019%29.svg',
    'instagram': 'https://upload.wikimedia.org/wikipedia/commons/9/95/Instagram_logo_2022.svg',
    'tiktok': 'https://upload.wikimedia.org/wikipedia/commons/6/61/Tiktok_hyper.png',
    'google': 'https://upload.wikimedia.org/wikipedia/commons/2/2f/Google_2015_logo.svg',
    'netflix': 'https://upload.wikimedia.org/wikipedia/commons/0/09/Netflix_Icon.svg',
    'twitter': 'https://upload.wikimedia.org/wikipedia/commons/c/ce/X_logo_2023.svg',
    'x ': 'https://upload.wikimedia.org/wikipedia/commons/c/ce/X_logo_2023.svg',
    'discord': 'https://upload.wikimedia.org/wikipedia/fr/4/4f/Discord_Logo_sans_text.svg',
    'steam': 'https://upload.wikimedia.org/wikipedia/commons/8/83/Steam_icon_logo.svg',
    'uber': 'https://upload.wikimedia.org/wikipedia/commons/5/58/Uber_logo_2018.svg',
    'spotify': 'https://upload.wikimedia.org/wikipedia/commons/1/19/Spotify_logo_without_text.svg',
    'twitch': 'https://upload.wikimedia.org/wikipedia/commons/d/d0/Twitch_logo.svg',
    'linkedin': 'https://upload.wikimedia.org/wikipedia/commons/0/01/LinkedIn_Logo.svg',
    'snapchat': 'https://upload.wikimedia.org/wikipedia/commons/e/e5/Snapchat_logo.svg',
    'pinterest': 'https://upload.wikimedia.org/wikipedia/commons/5/53/Pinterest_logo.svg',
    'reddit': 'https://upload.wikimedia.org/wikipedia/commons/9/95/Reddit_logo_and_wordmark.svg',
    'youtube': 'https://upload.wikimedia.org/wikipedia/commons/0/09/YouTube_full-color_icon_%282017%29.svg',
    'fiverr': 'https://upload.wikimedia.org/wikipedia/commons/5/51/Fiverr_logo.svg',
    'ebay': 'https://upload.wikimedia.org/wikipedia/commons/1/1b/EBay_logo.svg',
    'apple': 'https://upload.wikimedia.org/wikipedia/commons/f/fa/Apple_logo_black.svg',
    'microsoft': 'https://upload.wikimedia.org/wikipedia/commons/4/44/Microsoft_logo.svg',
    'amazon': 'https://upload.wikimedia.org/wikipedia/commons/a/a9/Amazon_logo.svg',
    'paypal': 'https://upload.wikimedia.org/wikipedia/commons/b/b5/PayPal_logo_%28old%29.svg',
    'venmo': 'https://upload.wikimedia.org/wikipedia/commons/8/85/Venmo_logo_2021.svg',
    'cash app': 'https://upload.wikimedia.org/wikipedia/commons/3/3f/Square_Cash_App_logo.svg',
    'binance': 'https://upload.wikimedia.org/wikipedia/commons/d/d0/Binance_logo.svg',
    'coinbase': 'https://upload.wikimedia.org/wikipedia/commons/8/86/Coinbase_logo.svg',
    'airbnb': 'https://upload.wikimedia.org/wikipedia/commons/6/69/Airbnb_Logo_B%C3%A9lo.svg',
    'booking': 'https://upload.wikimedia.org/wikipedia/commons/2/29/Booking.com_logo.svg',
    'booking.com': 'https://upload.wikimedia.org/wikipedia/commons/2/29/Booking.com_logo.svg',
    'nike': 'https://upload.wikimedia.org/wikipedia/commons/a/a6/Logo_NIKE.svg',
    'openai': 'https://upload.wikimedia.org/wikipedia/commons/4/4d/OpenAI_Logo.svg',
    'chatgpt': 'https://upload.wikimedia.org/wikipedia/commons/4/4d/OpenAI_Logo.svg',
    'viber': 'https://upload.wikimedia.org/wikipedia/commons/9/9e/Viber_logo.svg',
    'signal': 'https://upload.wikimedia.org/wikipedia/commons/6/60/Signal-Logo-Ultramarine_%282024%29.svg',
    'skype': 'https://upload.wikimedia.org/wikipedia/commons/7/7e/Skype_logo_%282019%E2%80%93present%29.svg',
    'line': 'https://upload.wikimedia.org/wikipedia/commons/3/3e/LINE_logo.svg',
    'vk': 'https://upload.wikimedia.org/wikipedia/commons/f/f7/VKontakte_logo.svg',
    'tinder': 'https://upload.wikimedia.org/wikipedia/commons/c/cb/Tinder_logo.svg',
    'bumble': 'https://upload.wikimedia.org/wikipedia/commons/b/b0/Bumble_logo.svg',
    'hinge': 'https://upload.wikimedia.org/wikipedia/commons/5/5f/Hinge_logo.svg',
    'yandex': 'https://upload.wikimedia.org/wikipedia/commons/5/51/Yandex_logo.svg',
    'baidu': 'https://upload.wikimedia.org/wikipedia/commons/9/91/Baidu_logo.svg',
    'shopee': 'https://upload.wikimedia.org/wikipedia/commons/8/8e/Shopee_logo.svg',
    'temu': 'https://upload.wikimedia.org/wikipedia/commons/a/a7/Temu_logo.svg',
    'shein': 'https://upload.wikimedia.org/wikipedia/commons/8/82/Shein_logo.svg',
    'walmart': 'https://upload.wikimedia.org/wikipedia/commons/1/14/Walmart_logo.svg',
    'truecaller': 'https://upload.wikimedia.org/wikipedia/commons/4/4d/Truecaller_logo.svg',
    'authy': 'https://upload.wikimedia.org/wikipedia/commons/4/40/Authy_logo.svg',
    'chime': 'https://upload.wikimedia.org/wikipedia/commons/d/d8/Chime_logo.svg',
    'nvidia': 'https://upload.wikimedia.org/wikipedia/commons/2/22/Nvidia_logo.svg',
    'badoo': 'https://upload.wikimedia.org/wikipedia/commons/7/7e/Badoo_logo.svg',
    'vk': 'https://upload.wikimedia.org/wikipedia/commons/f/f7/VKontakte_logo.svg',
    'roblox': 'https://upload.wikimedia.org/wikipedia/commons/f/ff/Roblox_logo.svg',
    'pubg': 'https://upload.wikimedia.org/wikipedia/commons/2/28/PUBG_logo.svg',
    'slack': 'https://upload.wikimedia.org/wikipedia/commons/d/d5/Slack_icon_2019.svg',
    'github': 'https://upload.wikimedia.org/wikipedia/commons/9/91/GitHub_logo.svg',
    'snapchat': 'https://upload.wikimedia.org/wikipedia/commons/e/e5/Snapchat_logo.svg',
    'alipay': 'https://upload.wikimedia.org/wikipedia/commons/d/d5/Alipay_logo_%282021%29.svg',
  };
  
  // Check if service name matches a known brand with a real logo
  var nameKeys = Object.keys(nameImageMap).sort(function(a, b) { return b.length - a.length; });
  for (var img_i = 0; img_i < nameKeys.length; img_i++) {
    if (name.indexOf(nameKeys[img_i]) !== -1) {
      var imgUrl = nameImageMap[nameKeys[img_i]];
      return {
        html: '<img src="' + imgUrl + '" style="width:100%;height:100%;object-fit:contain;" onerror="this.outerHTML=\'<i class=fas fa-globe></i>\'">',
        color: '#374151',
        bg: 'rgba(0,0,0,0.04)'
      };
    }
  }
  var iconColorMap = {
    'fab fa-whatsapp':        { color: '#25D366', bg: 'rgba(37,211,102,0.12)' },
    'fab fa-whatsapp-plane':  { color: '#26A5E4', bg: 'rgba(38,165,228,0.12)' },
    'fab fa-telegram-plane':  { color: '#26A5E4', bg: 'rgba(38,165,228,0.12)' },
    'fab fa-telegram':        { color: '#26A5E4', bg: 'rgba(38,165,228,0.12)' },
    'fab fa-facebook-f':      { color: '#1877F2', bg: 'rgba(24,119,242,0.12)' },
    'fab fa-facebook':        { color: '#1877F2', bg: 'rgba(24,119,242,0.12)' },
    'fab fa-meta':            { color: '#0668E1', bg: 'rgba(6,104,225,0.12)' },
    'fab fa-instagram':       { color: '#E4405F', bg: 'rgba(228,64,95,0.12)' },
    'fab fa-x-twitter':       { color: '#000000', bg: 'rgba(0,0,0,0.08)' },
    'fab fa-tiktok':          { color: '#000000', bg: 'rgba(0,0,0,0.08)' },
    'fab fa-google':          { color: '#4285F4', bg: 'rgba(66,133,244,0.12)' },
    'fab fa-youtube':         { color: '#FF0000', bg: 'rgba(255,0,0,0.12)' },
    'fab fa-amazon':          { color: '#FF9900', bg: 'rgba(255,153,0,0.12)' },
    'fab fa-discord':         { color: '#5865F2', bg: 'rgba(88,101,242,0.12)' },
    'fab fa-microsoft':       { color: '#00A4EF', bg: 'rgba(0,164,239,0.12)' },
    'fab fa-uber':            { color: '#000000', bg: 'rgba(0,0,0,0.08)' },
    'fab fa-paypal':          { color: '#003087', bg: 'rgba(0,48,135,0.12)' },
    'fab fa-steam':           { color: '#1B2838', bg: 'rgba(27,40,56,0.12)' },
    'fab fa-font-awesome':    { color: '#00B22D', bg: 'rgba(0,178,45,0.12)' },
    'fab fa-snapchat':        { color: '#FFFC00', bg: 'rgba(255,252,0,0.18)' },
    'fab fa-linkedin':        { color: '#0A66C2', bg: 'rgba(10,102,194,0.12)' },
    'fab fa-linkedin-in':     { color: '#0A66C2', bg: 'rgba(10,102,194,0.12)' },
    'fab fa-vk':              { color: '#0077FF', bg: 'rgba(0,119,255,0.12)' },
    'fab fa-skype':           { color: '#00AFF0', bg: 'rgba(0,175,240,0.12)' },
    'fab fa-twitch':          { color: '#9146FF', bg: 'rgba(145,70,255,0.12)' },
    'fab fa-bitcoin':         { color: '#F7931A', bg: 'rgba(247,147,26,0.12)' },
    'fab fa-ethereum':        { color: '#627EEA', bg: 'rgba(98,126,234,0.12)' },
    'fab fa-netflix':         { color: '#E50914', bg: 'rgba(229,9,20,0.12)' },
    'fab fa-disney':          { color: '#113CCF', bg: 'rgba(17,60,207,0.12)' },
    'fab fa-airbnb':          { color: '#FF5A5F', bg: 'rgba(255,90,95,0.12)' },
    'fab fa-yahoo':           { color: '#6001D2', bg: 'rgba(96,1,210,0.12)' },
    'fab fa-alipay':          { color: '#1677FF', bg: 'rgba(22,119,255,0.12)' },
    'fab fa-ebay':            { color: '#E53238', bg: 'rgba(229,50,56,0.12)' },
    'fab fa-bilibili':        { color: '#00A1D6', bg: 'rgba(0,161,214,0.12)' },
    'fab fa-weibo':           { color: '#E6162D', bg: 'rgba(230,22,45,0.12)' },
    'fab fa-weixin':          { color: '#07C160', bg: 'rgba(7,193,96,0.12)' },
    'fab fa-line':            { color: '#00C300', bg: 'rgba(0,195,0,0.12)' },
    'fab fa-viber':           { color: '#7360F2', bg: 'rgba(115,96,242,0.12)' },
    'fab fa-nike':            { color: '#111111', bg: 'rgba(17,17,17,0.08)' },
    'fab fa-baidu':           { color: '#2932E1', bg: 'rgba(41,50,225,0.12)' },
    'fab fa-git':             { color: '#F05032', bg: 'rgba(240,80,50,0.12)' },
    'fab fa-stripe-s':        { color: '#635BFF', bg: 'rgba(99,91,255,0.12)' },
    'fab fa-odnoklassniki':   { color: '#EE8208', bg: 'rgba(238,130,8,0.12)' },
    'fab fa-yandex':          { color: '#FF0000', bg: 'rgba(255,0,0,0.12)' },
    'fab fa-spotify':         { color: '#1DB954', bg: 'rgba(29,185,84,0.12)' },
    'fab fa-reddit-alien':    { color: '#FF4500', bg: 'rgba(255,69,0,0.12)' },
    'fab fa-pinterest-p':     { color: '#BD081C', bg: 'rgba(189,8,28,0.12)' },
    'fab fa-venmo':           { color: '#3D95CE', bg: 'rgba(61,149,206,0.12)' },
    'fab fa-apple':           { color: '#000000', bg: 'rgba(0,0,0,0.08)' },
    'fab fa-slack':           { color: '#4A154B', bg: 'rgba(74,21,75,0.12)' },
    'fab fa-github':          { color: '#181717', bg: 'rgba(24,23,23,0.10)' },
  };

  // 1) If data.js already has an icon, use it with brand color
  if (icon && iconColorMap[icon]) {
    var mapped = iconColorMap[icon];
    return { html: '<i class="' + icon + '"></i>', color: mapped.color, bg: mapped.bg };
  }

  // 2) Name/ID based mapping for services with generic icons in data.js
  var nameMap = {
    'whatsapp':              { icon: 'fab fa-whatsapp',       color: '#25D366', bg: 'rgba(37,211,102,0.12)' },
    'telegram':              { icon: 'fab fa-telegram',       color: '#26A5E4', bg: 'rgba(38,165,228,0.12)' },
    'facebook':              { icon: 'fab fa-facebook-f',     color: '#1877F2', bg: 'rgba(24,119,242,0.12)' },
    'instagram':             { icon: 'fab fa-instagram',      color: '#E4405F', bg: 'rgba(228,64,95,0.12)' },
    'threads':               { icon: 'fab fa-instagram',      color: '#E4405F', bg: 'rgba(228,64,95,0.12)' },
    'tiktok':                { icon: 'fab fa-tiktok',         color: '#000000', bg: 'rgba(0,0,0,0.08)' },
    'douyin':                { icon: 'fab fa-tiktok',         color: '#000000', bg: 'rgba(0,0,0,0.08)' },
    'twitter':               { icon: 'fab fa-x-twitter',      color: '#000000', bg: 'rgba(0,0,0,0.08)' },
    'google':                { icon: 'fab fa-google',         color: '#4285F4', bg: 'rgba(66,133,244,0.12)' },
    'gmail':                 { icon: 'fab fa-google',         color: '#EA4335', bg: 'rgba(234,67,53,0.12)' },
    'youtube':               { icon: 'fab fa-youtube',        color: '#FF0000', bg: 'rgba(255,0,0,0.12)' },
    'amazon':                { icon: 'fab fa-amazon',         color: '#FF9900', bg: 'rgba(255,153,0,0.12)' },
    'discord':               { icon: 'fab fa-discord',        color: '#5865F2', bg: 'rgba(88,101,242,0.12)' },
    'microsoft':             { icon: 'fab fa-microsoft',      color: '#00A4EF', bg: 'rgba(0,164,239,0.12)' },
    'outlook':               { icon: 'fab fa-microsoft',      color: '#0078D4', bg: 'rgba(0,120,212,0.12)' },
    'uber':                  { icon: 'fab fa-uber',           color: '#000000', bg: 'rgba(0,0,0,0.08)' },
    'paypal':                { icon: 'fab fa-paypal',         color: '#003087', bg: 'rgba(0,48,135,0.12)' },
    'steam':                 { icon: 'fab fa-steam',          color: '#1B2838', bg: 'rgba(27,40,56,0.12)' },
    'fiverr':                { icon: 'fab fa-font-awesome',   color: '#00B22D', bg: 'rgba(0,178,45,0.12)' },
    'snapchat':              { icon: 'fab fa-snapchat',       color: '#FFFC00', bg: 'rgba(255,252,0,0.18)' },
    'linkedin':              { icon: 'fab fa-linkedin-in',    color: '#0A66C2', bg: 'rgba(10,102,194,0.12)' },
    'vkontakte':             { icon: 'fab fa-vk',             color: '#0077FF', bg: 'rgba(0,119,255,0.12)' },
    'в контакте':            { icon: 'fab fa-vk',             color: '#0077FF', bg: 'rgba(0,119,255,0.12)' },
    'skype':                 { icon: 'fab fa-skype',          color: '#00AFF0', bg: 'rgba(0,175,240,0.12)' },
    'twitch':                { icon: 'fab fa-twitch',         color: '#9146FF', bg: 'rgba(145,70,255,0.12)' },
    'tinder':                { icon: 'fas fa-fire',           color: '#FE3C72', bg: 'rgba(254,60,114,0.12)' },
    'signal':                { icon: 'fas fa-comment-dots',   color: '#3A76F0', bg: 'rgba(58,118,240,0.12)' },
    'viber':                 { icon: 'fab fa-viber',          color: '#7360F2', bg: 'rgba(115,96,242,0.12)' },
    'line':                  { icon: 'fab fa-line',           color: '#00C300', bg: 'rgba(0,195,0,0.12)' },
    'kakaotalk':             { icon: 'fas fa-comment',        color: '#FEE500', bg: 'rgba(254,229,0,0.15)' },
    'netflix':               { icon: 'fab fa-netflix',        color: '#E50914', bg: 'rgba(229,9,20,0.12)' },
    'disney+':               { icon: 'fab fa-disney',         color: '#113CCF', bg: 'rgba(17,60,207,0.12)' },
    'openai':                { icon: 'fas fa-brain',          color: '#10A37F', bg: 'rgba(16,163,127,0.12)' },
    'chatgpt':               { icon: 'fas fa-brain',          color: '#10A37F', bg: 'rgba(16,163,127,0.12)' },
    'claude':                { icon: 'fas fa-brain',          color: '#D97706', bg: 'rgba(217,119,6,0.12)' },
    'deepseek':              { icon: 'fas fa-brain',          color: '#4F46E5', bg: 'rgba(79,70,229,0.12)' },
    'airbnb':                { icon: 'fab fa-airbnb',         color: '#FF5A5F', bg: 'rgba(255,90,95,0.12)' },
    'booking.com':           { icon: 'fas fa-hotel',          color: '#003580', bg: 'rgba(0,53,128,0.12)' },
    'yahoo':                 { icon: 'fab fa-yahoo',          color: '#6001D2', bg: 'rgba(96,1,210,0.12)' },
    'coinbase':              { icon: 'fas fa-circle-dollar-to-slot', color: '#0052FF', bg: 'rgba(0,82,255,0.12)' },
    'binance':               { icon: 'fas fa-coins',          color: '#F0B90B', bg: 'rgba(240,185,11,0.12)' },
    'bybit':                 { icon: 'fas fa-coins',          color: '#F7A600', bg: 'rgba(247,166,0,0.12)' },
    'okx':                   { icon: 'fas fa-coins',          color: '#000000', bg: 'rgba(0,0,0,0.08)' },
    'mexc':                  { icon: 'fas fa-coins',          color: '#0052FF', bg: 'rgba(0,82,255,0.12)' },
    'bitget':                { icon: 'fas fa-coins',          color: '#00F0FF', bg: 'rgba(0,240,255,0.12)' },
    'venmo':                 { icon: 'fab fa-venmo',          color: '#3D95CE', bg: 'rgba(61,149,206,0.12)' },
    'cash app':              { icon: 'fas fa-dollar-sign',    color: '#00C853', bg: 'rgba(0,200,83,0.12)' },
    'wise':                  { icon: 'fas fa-exchange-alt',   color: '#9FE870', bg: 'rgba(0,100,60,0.12)' },
    'skrill':                { icon: 'fas fa-credit-card',    color: '#8621A8', bg: 'rgba(134,33,168,0.12)' },
    'uphold':                { icon: 'fas fa-arrows-alt-v',   color: '#06B6D4', bg: 'rgba(6,182,212,0.12)' },
    'lyft':                  { icon: 'fas fa-car',            color: '#FF00BF', bg: 'rgba(255,0,191,0.12)' },
    'bolt':                  { icon: 'fas fa-bolt',           color: '#34D058', bg: 'rgba(52,208,88,0.12)' },
    'grab':                  { icon: 'fas fa-taxi',           color: '#00B14F', bg: 'rgba(0,177,79,0.12)' },
    'aliexpress':            { icon: 'fab fa-alipay',         color: '#FF4747', bg: 'rgba(255,71,71,0.12)' },
    'taobao':                { icon: 'fab fa-alipay',         color: '#FF5000', bg: 'rgba(255,80,0,0.12)' },
    'ebay':                  { icon: 'fab fa-ebay',           color: '#E53238', bg: 'rgba(229,50,56,0.12)' },
    'shopee':                { icon: 'fas fa-shopping-bag',   color: '#EE4D2D', bg: 'rgba(238,77,45,0.12)' },
    'temu':                  { icon: 'fas fa-shopping-bag',   color: '#FB6527', bg: 'rgba(251,101,39,0.12)' },
    'nike':                  { icon: 'fab fa-nike',           color: '#111111', bg: 'rgba(17,17,17,0.08)' },
    'walmart':               { icon: 'fas fa-shopping-cart',  color: '#0071CE', bg: 'rgba(0,113,206,0.12)' },
    'bilibili':              { icon: 'fab fa-bilibili',       color: '#00A1D6', bg: 'rgba(0,161,214,0.12)' },
    'weibo':                 { icon: 'fab fa-weibo',          color: '#E6162D', bg: 'rgba(230,22,45,0.12)' },
    'xiaohongshu':           { icon: 'fas fa-sticky-note',    color: '#FF2442', bg: 'rgba(255,36,66,0.12)' },
    'rednote':               { icon: 'fas fa-sticky-note',    color: '#FF2442', bg: 'rgba(255,36,66,0.12)' },
    'roblox':                { icon: 'fas fa-gamepad',        color: '#E2231A', bg: 'rgba(226,35,26,0.12)' },
    'pubg':                  { icon: 'fas fa-gamepad',        color: '#F2A900', bg: 'rgba(242,169,0,0.12)' },
    'baidu':                 { icon: 'fab fa-baidu',          color: '#2932E1', bg: 'rgba(41,50,225,0.12)' },
    'yandex':                { icon: 'fab fa-yandex',         color: '#FF0000', bg: 'rgba(255,0,0,0.12)' },
    'zalo':                  { icon: 'fas fa-comment',        color: '#0068FF', bg: 'rgba(0,104,255,0.12)' },
    'zoho':                  { icon: 'fas fa-building',       color: '#D7282D', bg: 'rgba(215,40,45,0.12)' },
    'vercel':                { icon: 'fas fa-code',           color: '#000000', bg: 'rgba(0,0,0,0.08)' },
    'truecaller':            { icon: 'fas fa-phone',          color: '#0F82FF', bg: 'rgba(15,130,255,0.12)' },
    'authy':                 { icon: 'fas fa-shield-alt',     color: '#EC1C24', bg: 'rgba(236,28,36,0.12)' },
    'tradingview':           { icon: 'fas fa-chart-line',     color: '#2962FF', bg: 'rgba(41,98,255,0.12)' },
    'nvidia':                { icon: 'fas fa-microchip',      color: '#76B900', bg: 'rgba(118,185,0,0.12)' },
    'foodpanda':             { icon: 'fas fa-utensils',       color: '#D70C64', bg: 'rgba(215,12,100,0.12)' },
    'glovo':                 { icon: 'fas fa-utensils',       color: '#F6C744', bg: 'rgba(246,199,68,0.12)' },
    'wolt':                  { icon: 'fas fa-utensils',       color: '#336BFF', bg: 'rgba(51,107,255,0.12)' },
    'careem':                { icon: 'fas fa-taxi',           color: '#4CB050', bg: 'rgba(76,176,80,0.12)' },
    'blablacar':             { icon: 'fas fa-car',            color: '#0066FF', bg: 'rgba(0,102,255,0.12)' },
    'razer':                 { icon: 'fas fa-gamepad',        color: '#00FF00', bg: 'rgba(0,255,0,0.12)' },
    'ubisoft':               { icon: 'fas fa-gamepad',        color: '#0070FF', bg: 'rgba(0,112,255,0.12)' },
    'shein':                 { icon: 'fas fa-tshirt',         color: '#000000', bg: 'rgba(0,0,0,0.08)' },
    'zara':                  { icon: 'fas fa-tshirt',         color: '#000000', bg: 'rgba(0,0,0,0.08)' },
    'depop':                 { icon: 'fas fa-tshirt',         color: '#FF2D55', bg: 'rgba(255,45,85,0.12)' },
    'vinted':                { icon: 'fas fa-tshirt',         color: '#00C1B5', bg: 'rgba(0,193,181,0.12)' },
    'poshmark':              { icon: 'fas fa-tshirt',         color: '#C80C5A', bg: 'rgba(200,12,90,0.12)' },
    'etsy':                  { icon: 'fas fa-palette',        color: '#F1641E', bg: 'rgba(241,100,30,0.12)' },
    'olx':                   { icon: 'fas fa-tag',            color: '#3276D1', bg: 'rgba(50,118,209,0.12)' },
    'swiggy':                { icon: 'fas fa-utensils',       color: '#FC8019', bg: 'rgba(252,128,25,0.12)' },
    'flipkart':              { icon: 'fas fa-shopping-cart',  color: '#2874F0', bg: 'rgba(40,116,240,0.12)' },
    'wildberries':           { icon: 'fas fa-shopping-bag',   color: '#A80044', bg: 'rgba(168,0,68,0.12)' },
    'ozon':                  { icon: 'fas fa-shopping-cart',  color: '#005BFF', bg: 'rgba(0,91,255,0.12)' },
    'trendyol':              { icon: 'fas fa-shopping-bag',   color: '#F22E52', bg: 'rgba(242,46,82,0.12)' },
    'meituan':               { icon: 'fas fa-utensils',       color: '#FFC300', bg: 'rgba(255,195,0,0.12)' },
    'pof':                   { icon: 'fas fa-fish',           color: '#004B8D', bg: 'rgba(0,75,141,0.12)' },
    'badoo':                 { icon: 'fas fa-heart',          color: '#7B2D8E', bg: 'rgba(123,45,142,0.12)' },
    'bumble':                { icon: 'fas fa-bolt',           color: '#FFC629', bg: 'rgba(255,198,41,0.12)' },
    'hinge':                 { icon: 'fas fa-heart',          color: '#7B61FF', bg: 'rgba(123,97,255,0.12)' },
    'likee':                 { icon: 'fas fa-video',          color: '#EE1D52', bg: 'rgba(238,29,82,0.12)' },
    'rumble':                { icon: 'fas fa-video',          color: '#85C742', bg: 'rgba(133,199,66,0.12)' },
    'kwai':                  { icon: 'fas fa-video',          color: '#FF4906', bg: 'rgba(255,73,6,0.12)' },
    'azar':                  { icon: 'fas fa-video',          color: '#FF5722', bg: 'rgba(255,87,34,0.12)' },
    'gitcoin':               { icon: 'fab fa-git',            color: '#0ACF83', bg: 'rgba(10,207,131,0.12)' },
    'wechat':                { icon: 'fab fa-weixin',         color: '#07C160', bg: 'rgba(7,193,96,0.12)' },
    'weixin':                { icon: 'fab fa-weixin',         color: '#07C160', bg: 'rgba(7,193,96,0.12)' },
    'booking':               { icon: 'fas fa-hotel',          color: '#003580', bg: 'rgba(0,53,128,0.12)' },
    'ticketmaster':          { icon: 'fas fa-ticket-alt',     color: '#026DFE', bg: 'rgba(2,109,254,0.12)' },
    'jd':                    { icon: 'fas fa-shopping-cart',  color: '#E4393C', bg: 'rgba(228,57,60,0.12)' },
    '京东':                  { icon: 'fas fa-shopping-cart',  color: '#E4393C', bg: 'rgba(228,57,60,0.12)' },
    'chime':                 { icon: 'fas fa-university',     color: '#00A3E0', bg: 'rgba(0,163,224,0.12)' },
    'bofa':                  { icon: 'fas fa-university',     color: '#012169', bg: 'rgba(1,33,105,0.12)' },
    'bank of america':       { icon: 'fas fa-university',     color: '#012169', bg: 'rgba(1,33,105,0.12)' },
    'sber':                  { icon: 'fas fa-university',     color: '#21A038', bg: 'rgba(33,160,56,0.12)' },
    'caixa':                 { icon: 'fas fa-university',     color: '#003C71', bg: 'rgba(0,60,113,0.12)' },
    'go2bank':               { icon: 'fas fa-university',     color: '#0072CE', bg: 'rgba(0,114,206,0.12)' },
    'monese':                { icon: 'fas fa-euro-sign',      color: '#14CCCC', bg: 'rgba(20,204,204,0.12)' },
    'paypay':                { icon: 'fas fa-credit-card',    color: '#FF0000', bg: 'rgba(255,0,0,0.12)' },
    'picpay':                { icon: 'fas fa-credit-card',    color: '#21C25E', bg: 'rgba(33,194,94,0.12)' },
    'papara':                { icon: 'fas fa-credit-card',    color: '#6C3FC5', bg: 'rgba(108,63,197,0.12)' },
    'paysafe':               { icon: 'fas fa-credit-card',    color: '#F05A22', bg: 'rgba(240,90,34,0.12)' },
    'affirm':                { icon: 'fas fa-credit-card',    color: '#4A90D9', bg: 'rgba(74,144,217,0.12)' },
    'credit karma':          { icon: 'fas fa-chart-line',     color: '#29B6F6', bg: 'rgba(41,182,246,0.12)' },
    'any other':             { icon: 'fas fa-globe',          color: '#0d9b7a', bg: 'rgba(13,155,122,0.12)' },
    'any':                   { icon: 'fas fa-globe',          color: '#0d9b7a', bg: 'rgba(13,155,122,0.12)' },
  };
  
  // Match by name (longer keys first)
  var keys = Object.keys(nameMap).sort(function(a, b) { return b.length - a.length; });
  for (var i = 0; i < keys.length; i++) {
     if (name.indexOf(keys[i]) !== -1) { var m = nameMap[keys[i]]; return { html: '<i class="' + m.icon + '"></i>', color: m.color, bg: m.bg }; }
  }
  
  // Match by id
  var idMap = {
    'wa': 'whatsapp', 'tg': 'telegram', 'fb': 'facebook', 'ig': 'instagram',
    'tk': 'tiktok', 'tw': 'twitter', 'vb': 'viber', 'sk': 'skype',
    'nf': 'netflix', 'ub': 'uber', 'gv': 'google'
  };
  if (idMap[id]) { var m2 = nameMap[idMap[id]]; return { html: '<i class="' + m2.icon + '"></i>', color: m2.color, bg: m2.bg }; }
  
  // If data.js had an icon but no color match, use generic dark color
  if (icon) {
    return { html: '<i class="' + icon + '"></i>', color: '#374151', bg: 'rgba(55,65,81,0.08)' };
  }
  
  // Default fallback
  return { html: '<i class="fas fa-mobile-alt"></i>', color: 'var(--text-secondary)', bg: 'rgba(0,0,0,0.05)' };
}

function renderNumbersPage(main) {
  var activeOnlyNumbers = activeNumbers ? activeNumbers.filter(function(n) { return n.status === 'waiting' || n.status === 'received'; }) : [];
  var totalActive = activeOnlyNumbers.length;
  var waitingNumbers = activeNumbers;

  var activeNumbersHTML = totalActive > 0
    ? waitingNumbers.map(renderActiveNumberCard).join('')
    : '<div style="padding:22px;border:1px dashed var(--border);border-radius:14px;color:var(--text-secondary);font-size:14px;">No active numbers yet. Buy one from below.</div>';

  var mobileSearchHTML = '<div class="mobile-search-wrapper" style="margin-bottom:20px;">' +
    '<div style="position:relative;">' +
      '<i class="fas fa-search" style="position:absolute;left:14px;top:50%;transform:translateY(-50%);color:var(--text-muted);font-size:13px;"></i>' +
      '<input type="text" id="mobileServiceSearch" placeholder="Search services..." style="width:100%;padding:12px 14px 12px 40px;background:var(--bg-card);border:1px solid var(--border);border-radius:12px;color:var(--text-primary);font-size:14px;font-family:inherit;outline:none;transition:all 0.2s;" onfocus="this.style.borderColor=\'var(--accent)\';this.style.boxShadow=\'0 0 0 3px var(--accent-dim)\'" onblur="this.style.borderColor=\'var(--border)\';this.style.boxShadow=\'none\'" oninput="filterMobileServices(this.value)">' +
    '</div>' +
  '</div>';

  var serviceGridHTML = '<div id="mobileServiceGridWrapper" style="margin-bottom:28px;">' +
    '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:16px;">' +
      '<h2 style="font-size:18px;font-weight:700;display:flex;align-items:center;gap:10px;">' +
        '<i class="fas fa-shopping-cart" style="color:var(--accent);font-size:16px;"></i> Get Virtual Number</h2>' +
    '</div>' +
    '<div id="mobileServiceGrid" style="display:grid;grid-template-columns:repeat(auto-fill,minmax(120px,1fr));gap:10px;">' +
      getDashboardServiceListHTML() +
    '</div>' +
  '</div>';

  var activeSectionHTML = '<div id="activeNumbersSection" style="background:var(--bg-card);border:1px solid var(--border);border-radius:18px;padding:24px;box-shadow:var(--shadow-sm);margin-bottom:28px;">' +
    '<div>' +
      '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:16px;">' +
        '<h2 style="font-size:18px;font-weight:700;display:flex;align-items:center;gap:10px;">' +
          '<i class="fas fa-phone-alt" style="color:var(--accent);font-size:15px;"></i> Active Numbers</h2>' +
        '<span style="font-size:12px;padding:3px 10px;border-radius:8px;font-weight:600;background:var(--accent-dim);color:var(--accent);">' + totalActive + ' active</span>' +
      '</div>' +
      '<div style="display:flex;flex-direction:column;gap:12px;">' + activeNumbersHTML + '</div>' +
    '</div>' +
  '</div>';

  var infoSectionsHTML = 
    '<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(250px,1fr));gap:12px;margin-bottom:28px;">' +
      '<div style="background:rgba(13,155,122,0.08);border:1px solid rgba(13,155,122,0.2);border-radius:12px;padding:16px;box-shadow:var(--shadow-sm);">' +
        '<h3 style="font-size:13px;font-weight:700;margin-bottom:8px;color:var(--accent);">No Cancellations Within 45s</h3>' +
        '<p style="font-size:12px;color:var(--text-secondary);line-height:1.5;">Orders cannot be canceled within 45 seconds after a number is purchased.</p>' +
      '</div>' +
      '<div style="background:rgba(13,155,122,0.08);border:1px solid rgba(13,155,122,0.2);border-radius:12px;padding:16px;box-shadow:var(--shadow-sm);">' +
        '<h3 style="font-size:13px;font-weight:700;margin-bottom:8px;color:var(--accent);">SMS Not Received?</h3>' +
        '<p style="font-size:12px;color:var(--text-secondary);line-height:1.5;">Try removing the country code from the number and attempt again.</p>' +
      '</div>' +
      '<div style="background:rgba(13,155,122,0.08);border:1px solid rgba(13,155,122,0.2);border-radius:12px;padding:16px;box-shadow:var(--shadow-sm);">' +
        '<h3 style="font-size:13px;font-weight:700;margin-bottom:8px;color:var(--accent);">Automatic Refunds</h3>' +
        '<p style="font-size:12px;color:var(--text-secondary);line-height:1.5;">Funds will be automatically refunded to your wallet if the request times out or is canceled.</p>' +
      '</div>' +
    '</div>' +
    '<div style="background:var(--bg-card);border:1px solid var(--border);border-radius:18px;padding:28px;box-shadow:var(--shadow-sm);margin-bottom:28px;">' +
      '<h2 style="font-size:22px;font-weight:700;margin-bottom:16px;">Why use temporary phone numbers</h2>' +
      '<p style="font-size:14px;color:var(--text-secondary);line-height:1.8;margin-bottom:14px;">When creating accounts, most websites require a valid mobile number. Temporary numbers let you create and manage multiple accounts without limitations.</p>' +
      '<p style="font-size:14px;color:var(--text-secondary);line-height:1.8;margin-bottom:14px;"><strong>Protect your privacy</strong> — Your personal phone number can reveal sensitive details. Using temporary numbers helps keep your identity secure.</p>' +
      '<p style="font-size:14px;color:var(--text-secondary);line-height:1.8;"><strong>Bypass regional restrictions</strong> — Temporary numbers from different countries allow you to register on platforms without geographic barriers.</p>' +
    '</div>';

  main.innerHTML = 
    mobileSearchHTML + 
    serviceGridHTML + 
    activeSectionHTML + 
    infoSectionsHTML;
}

/* ===== MOBILE SEARCH FILTER ===== */
window.filterMobileServices = function(query) {
  query = query.toLowerCase().trim();
  var grid = document.getElementById('mobileServiceGrid');
  if (!grid) return;

  var items = grid.children;
  for (var i = 0; i < items.length; i++) {
    var serviceName = items[i].textContent.toLowerCase();
    if (query === '' || serviceName.indexOf(query) !== -1) {
      items[i].style.display = ''; 
    } else {
      items[i].style.display = 'none'; 
    }
  }
};

 /* ===== Card for combined Number + Code display ===== */
function renderActiveNumberCard(n) {
  var timeLeft = (n.time_left !== undefined && n.time_left !== null) ? n.time_left : (n.timeLeft || 0);
  var serviceName = n.service_name || (n.service ? n.service.name : 'Unknown');
  var minutes = Math.floor(timeLeft / 60);
  var seconds = timeLeft % 60;
  var timerDisplay = String(minutes).padStart(2, '0') + ':' + String(seconds).padStart(2, '0');
  var existingIcon = n.service_icon || (n.service ? n.service.icon : '');
  var ico = getServiceIconData(serviceName, n.service_id, existingIcon);
  
  var countryFlag = '';
  if (n.country_flag) countryFlag = n.country_flag;
  if (!countryFlag && n.countryCode) {
    var cc = n.countryCode.toLowerCase();
    var c1 = (typeof countries !== 'undefined') ? countries.find(function(c) { return c.code === cc; }) : null;
    countryFlag = c1 ? c1.flag : '';
  }
  if (!countryFlag && n.country_code) {
    var cc2 = n.country_code.toLowerCase();
    var c2 = (typeof countries !== 'undefined') ? countries.find(function(c) { return c.code === cc2; }) : null;
    countryFlag = c2 ? c2.flag : '';
  }
  if (!countryFlag && n.phone) {
    var phone = n.phone.replace(/\s/g, '');
    if (phone.charAt(0) === '+') phone = phone.substring(1);
    if (phone.indexOf('44') === 0) countryFlag = '🇬🇧';
    else if (phone.indexOf('380') === 0) countryFlag = '🇺🇦';
    else if (phone.indexOf('971') === 0) countryFlag = '🇦🇪';
    else if (phone.indexOf('966') === 0) countryFlag = '🇸🇦';
    else if (phone.indexOf('353') === 0) countryFlag = '🇮🇪';
    else if (phone.indexOf('81') === 0) countryFlag = '🇯🇵';
    else if (phone.indexOf('62') === 0) countryFlag = '🇮🇩';
    else if (phone.indexOf('63') === 0) countryFlag = '🇵🇭';
    else if (phone.indexOf('84') === 0) countryFlag = '🇻🇳';
    else if (phone.indexOf('55') === 0) countryFlag = '🇧🇷';
    else if (phone.indexOf('49') === 0) countryFlag = '🇩🇪';
    else if (phone.indexOf('33') === 0) countryFlag = '🇫🇷';
    else if (phone.indexOf('39') === 0) countryFlag = '🇮🇹';
    else if (phone.indexOf('34') === 0) countryFlag = '🇪🇸';
    else if (phone.indexOf('61') === 0) countryFlag = '🇦🇺';
    else if (phone.indexOf('91') === 0) countryFlag = '🇮🇳';
    else if (phone.indexOf('90') === 0) countryFlag = '🇹🇷';
    else if (phone.indexOf('31') === 0) countryFlag = '🇳🇱';
    else if (phone.indexOf('48') === 0) countryFlag = '🇵🇱';
    else if (phone.indexOf('40') === 0) countryFlag = '🇷🇴';
    else if (phone.indexOf('43') === 0) countryFlag = '🇦🇹';
    else if (phone.indexOf('60') === 0) countryFlag = '🇲🇾';
    else if (phone.indexOf('65') === 0) countryFlag = '🇸🇬';
    else if (phone.indexOf('7') === 0) countryFlag = '🇷🇺';
    else if (phone.indexOf('1') === 0) countryFlag = '🇺🇸';
    else countryFlag = '🌍';
  }
  if (!countryFlag) countryFlag = '🌍';
  
  var phoneDisplay = (n.phone.charAt(0) !== '+' ? '+' : '') + n.phone;
  var phoneCopy = phoneDisplay;
  
  var statusColors = { waiting: 'var(--warning)', received: 'var(--accent)', expired: 'var(--danger)' };
  var statusLabels = { waiting: 'Waiting', received: 'Received', expired: 'Timeout' };
  var statusColor = statusColors[n.status] || 'var(--text-muted)';
  var statusLabel = statusLabels[n.status] || n.status;

  var codeDisplay = '';
  if (n.status === 'received' && n.code) {
    codeDisplay = '<div style="font-family:JetBrains Mono,monospace;font-size:16px;font-weight:800;color:var(--accent);letter-spacing:3px;margin:0 8px;">' + n.code + '</div>';
  }

  var cancelBtn = (n.status === 'waiting' || n.status === 'received')
    ? '<button class="btn-sm cancel" onclick="cancelNumber(' + n.id + ')" style="padding:4px 8px;font-size:11px;background:var(--danger);color:white;border:none;border-radius:6px;cursor:pointer;"><i class="fas fa-times"></i></button>'
    : '';

  return '<div style="background:var(--bg-primary);border:1px solid var(--border);border-radius:12px;padding:12px;display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:8px;">' +
    '<div style="display:flex;align-items:center;gap:8px;flex:1;min-width:150px;">' +
      '<div style="font-size:18px;flex-shrink:0;">' + countryFlag + '</div>' +
      '<div style="width:28px;height:28px;border-radius:7px;display:flex;align-items:center;justify-content:center;font-size:14px;flex-shrink:0;background:' + ico.bg + ';color:' + ico.color + ';">' +
        ico.html +
      '</div>' +
      '<div style="font-family:JetBrains Mono,monospace;font-size:13px;font-weight:700;word-break:break-all;">' + phoneDisplay + '</div>' +
      '<button class="btn-sm copy" onclick="copyNumber(\'' + phoneCopy + '\')" style="padding:4px 6px;font-size:10px;flex-shrink:0;"><i class="fas fa-copy"></i></button>' +
    '</div>' +
    codeDisplay +
    '<div style="display:flex;align-items:center;gap:6px;flex-shrink:0;">' +
      '<span style="font-family:JetBrains Mono,monospace;font-size:11px;font-weight:600;color:' + statusColor + ';min-width:35px;text-align:right;" id="timer-active-' + n.id + '">' + timerDisplay + '</span>' +
      '<span style="font-size:11px;font-weight:700;color:var(--accent);min-width:30px;text-align:right;">$' + n.cost.toFixed(2) + '</span>' +
      cancelBtn +
    '</div>' +
  '</div>';
}

/* ===== DYNAMIC SERVICE GRID (Matches desktop sidebar data) ===== */
function getDashboardServiceListHTML() {
  if (typeof services === 'undefined' || !services || services.length === 0) {
    return '<div style="padding:20px;text-align:center;color:var(--danger);font-size:14px;">Services data not loaded. Check data.js</div>';
  }
  
  return services.map(function(s) {
    var name = s.name || 'Unknown';
    var price = (s.price || 0).toFixed(2);
    var id = s.id || 'other';
    var availableText = (s.available !== undefined && s.available !== null) ? s.available.toLocaleString() + ' pc' : '';
    var ico = getServiceIconData(name, id, s.icon);
    
    return '<div style="padding:16px 12px;background:var(--bg-card);border:1px solid var(--border);border-radius:12px;text-align:center;box-shadow:var(--shadow-sm);cursor:pointer;transition:all 0.2s;" ' +
      'onmouseover="this.style.boxShadow=\'var(--shadow-md)\';this.style.borderColor=\'var(--accent)\'" ' +
      'onmouseout="this.style.boxShadow=\'var(--shadow-sm)\';this.style.borderColor=\'var(--border)\'" ' +
      'onclick="openModalById(\'' + id + '\')">' +
      '<div style="width:42px;height:42px;border-radius:12px;display:flex;align-items:center;justify-content:center;margin:0 auto 10px;font-size:18px;background:' + ico.bg + ';color:' + ico.color + ';">' +
      ico.html + '</div>' +
      '<div style="font-size:12px;font-weight:600;margin-bottom:6px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">' + name + '</div>' +
      (availableText ? '<div style="font-size:11px;color:var(--text-secondary);margin-bottom:8px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">' + availableText + '</div>' : '') +
      '<div style="font-size:13px;font-weight:700;color:var(--accent);">$' + price + '</div></div>';
  }).join('');
}

function renderHistoryPage(main) {
  var rows = '';
  if (historyData.length === 0) {
    rows = '<div class="empty-state"><i class="fas fa-history"></i><h3>No history yet</h3><p>Your SMS code history will appear here</p></div>';
  } else {
    rows = historyData.map(function(h) {
      var service = services.find(function(s) { return s.name.toLowerCase() === h.service_name.toLowerCase(); });
      var existingIcon = service ? service.icon : '';
      var ico = getServiceIconData(h.service_name, h.service_id, existingIcon);
      
      var countryFlag = '';
      if (h.country_flag) countryFlag = h.country_flag;
      if (!countryFlag && h.countryCode) {
        var cc = h.countryCode.toLowerCase();
        var c1 = (typeof countries !== 'undefined') ? countries.find(function(c) { return c.code === cc; }) : null;
        countryFlag = c1 ? c1.flag : '';
      }
      if (!countryFlag && h.country_code) {
        var cc2 = h.country_code.toLowerCase();
        var c2 = (typeof countries !== 'undefined') ? countries.find(function(c) { return c.code === cc2; }) : null;
        countryFlag = c2 ? c2.flag : '';
      }
      if (!countryFlag && h.phone) {
        var phone = h.phone.replace(/\s/g, '');
        if (phone.charAt(0) === '+') phone = phone.substring(1);
        if (phone.indexOf('44') === 0) countryFlag = '🇬🇧';
        else if (phone.indexOf('380') === 0) countryFlag = '🇺🇦';
        else if (phone.indexOf('971') === 0) countryFlag = '🇦🇪';
        else if (phone.indexOf('966') === 0) countryFlag = '🇸🇦';
        else if (phone.indexOf('353') === 0) countryFlag = '🇮🇪';
        else if (phone.indexOf('81') === 0) countryFlag = '🇯🇵';
        else if (phone.indexOf('62') === 0) countryFlag = '🇮🇩';
        else if (phone.indexOf('63') === 0) countryFlag = '🇵🇭';
        else if (phone.indexOf('84') === 0) countryFlag = '🇻🇳';
        else if (phone.indexOf('55') === 0) countryFlag = '🇧🇷';
        else if (phone.indexOf('49') === 0) countryFlag = '🇩🇪';
        else if (phone.indexOf('33') === 0) countryFlag = '🇫🇷';
        else if (phone.indexOf('39') === 0) countryFlag = '🇮🇹';
        else if (phone.indexOf('34') === 0) countryFlag = '🇪🇸';
        else if (phone.indexOf('61') === 0) countryFlag = '🇦🇺';
        else if (phone.indexOf('91') === 0) countryFlag = '🇮🇳';
        else if (phone.indexOf('90') === 0) countryFlag = '🇹🇷';
        else if (phone.indexOf('31') === 0) countryFlag = '🇳🇱';
        else if (phone.indexOf('48') === 0) countryFlag = '🇵🇱';
        else if (phone.indexOf('40') === 0) countryFlag = '🇷🇴';
        else if (phone.indexOf('43') === 0) countryFlag = '🇦🇹';
        else if (phone.indexOf('60') === 0) countryFlag = '🇲🇾';
        else if (phone.indexOf('65') === 0) countryFlag = '🇸🇬';
        else if (phone.indexOf('7') === 0) countryFlag = '🇷🇺';
        else if (phone.indexOf('1') === 0) countryFlag = '🇺🇸';
        else countryFlag = '🌍';
      }
      if (!countryFlag) countryFlag = '🌍';
      
      var phoneDisplay = (h.phone.charAt(0) !== '+' ? '+' : '') + h.phone;
      var phoneCopy = phoneDisplay;
      
      var statusColor, statusLabel;
      if (h.status === 'success') {
        statusColor = 'var(--accent)';
        statusLabel = 'Code Received';
      } else if (h.status === 'pending' || h.status === 'waiting') {
        statusColor = 'var(--warning)';
        statusLabel = 'Waiting';
      } else {
        statusColor = 'var(--danger)';
        statusLabel = 'Timeout';
      }
      
      var codeDisplay = h.code ? '<div style="font-family:JetBrains Mono,monospace;font-size:14px;font-weight:800;color:var(--accent);letter-spacing:2px;margin:0 6px;">' + h.code + '</div>' : '';
      
      return '<div style="background:var(--bg-primary);border:1px solid var(--border);border-radius:12px;padding:12px;display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:8px;">' +
        '<div style="display:flex;align-items:center;gap:8px;flex:1;min-width:150px;">' +
          '<div style="font-size:18px;flex-shrink:0;">' + countryFlag + '</div>' +
          '<div style="width:28px;height:28px;border-radius:7px;display:flex;align-items:center;justify-content:center;font-size:14px;flex-shrink:0;background:' + ico.bg + ';color:' + ico.color + ';">' +
           ico.html +
          '</div>' +
          '<div style="font-family:JetBrains Mono,monospace;font-size:13px;font-weight:700;word-break:break-all;">' + phoneDisplay + '</div>' +
          '<button class="btn-sm copy" onclick="copyNumber(\'' + phoneCopy + '\')" style="padding:4px 6px;font-size:10px;flex-shrink:0;"><i class="fas fa-copy"></i></button>' +
        '</div>' +
        codeDisplay +
        '<div style="display:flex;align-items:center;gap:6px;flex-shrink:0;">' +
          '<span style="font-size:10px;padding:3px 8px;border-radius:6px;font-weight:600;background:' + statusColor + '22;color:' + statusColor + ';white-space:nowrap;">' + statusLabel + '</span>' +
          '<span style="font-size:11px;font-weight:700;color:var(--accent);min-width:30px;text-align:right;">$' + h.cost.toFixed(2) + '</span>' +
        '</div>' +
      '</div>';
    }).join('');
  }
  main.innerHTML = '<div class="page-header"><h1 class="page-title">SMS History</h1>' +
    '<div class="page-actions"><button class="btn btn-secondary" onclick="showToast(\'Export coming soon\',\'info\')"><i class="fas fa-download"></i> Export</button></div></div>' +
    '<div style="background:var(--bg-card);border:1px solid var(--border);border-radius:18px;padding:24px;box-shadow:var(--shadow-sm);"><div style="display:flex;flex-direction:column;gap:12px;">' + rows + '</div></div>';
}
        
     
async function renderSettingsPage(main) {
  main.innerHTML = '<div class="page-header"><h1 class="page-title">Referral Program</h1></div>' +
    '<div style="max-width:980px;margin:0 auto;display:grid;gap:22px;">' +
      '<div style="background:var(--bg-card);border:1px solid var(--border);border-radius:18px;padding:26px;box-shadow:var(--shadow-sm);">' +
        '<h2 style="font-size:24px;font-weight:700;margin-bottom:10px;">Recommend the service and earn money</h2>' +
        '<p style="font-size:15px;color:var(--text-secondary);line-height:1.8;margin-bottom:18px;">Share your referral link with friends and earn 2% of every purchase made by users who sign up through your link.</p>' +
        '<button class="btn btn-secondary" style="margin-bottom:16px;" onclick="document.querySelectorAll(\'.nav-link\').forEach(function(l){l.classList.remove(\'active\')});document.querySelector(\"[data-page=help]\").classList.add(\'active\');currentPage=\'help\';renderMainContent();">Read more...</button>' +
      '</div>' +
      '<div style="display:grid;grid-template-columns:1fr 1fr;gap:22px;">' +
        '<div style="background:var(--bg-card);border:1px solid var(--border);border-radius:18px;padding:24px;box-shadow:var(--shadow-sm);">' +
          '<div style="font-size:12px;color:var(--text-muted);text-transform:uppercase;letter-spacing:1px;font-weight:600;margin-bottom:8px;">Your balance</div>' +
          '<div style="font-size:32px;font-weight:800;color:var(--accent);margin-bottom:8px;" id="referralBalance">$0.00</div>' +
          '<div style="font-size:13px;color:var(--text-secondary);line-height:1.7;">History of balance is available on the History page.</div>' +
        '</div>' +
        '<div style="background:var(--bg-card);border:1px solid var(--border);border-radius:18px;padding:24px;box-shadow:var(--shadow-sm);">' +
          '<div style="font-size:12px;color:var(--text-muted);text-transform:uppercase;letter-spacing:1px;font-weight:600;margin-bottom:8px;">Your REF code</div>' +
          '<div style="font-size:14px;color:var(--text-primary);line-height:1.6;margin-bottom:16px;word-break:break-all;" id="referralLink">Loading your referral link...</div>' +
          '<button class="btn btn-primary" style="width:100%;justify-content:center;" onclick="copyReferralLink()">Copy referral link</button>' +
        '</div>' +
      '</div>' +
      '<div style="background:var(--bg-card);border:1px solid var(--border);border-radius:18px;padding:24px;box-shadow:var(--shadow-sm);">' +
        '<h3 style="font-size:16px;font-weight:700;margin-bottom:10px;">How it works</h3>' +
        '<ul style="font-size:14px;color:var(--text-secondary);line-height:1.8;padding-left:18px;margin:0;">' +
          '<li>You earn 2% of every purchase made by a user who signs up with your referral link.</li>' +
          '<li>The bonus is automatically added to your balance.</li>' +
          '<li>Share your referral link on social media, chat, or email to grow your earnings.</li>' +
        '</ul>' +
      '</div>' +
    '</div>';

  try {
    var res = await fetch('/api/user/' + getUserEmail());
    if (!res.ok) throw new Error('Unable to load referral data');
    var data = await res.json();
    var referralCode = data.refCode || '';
    var linkEl = document.getElementById('referralLink');
    var balanceEl = document.getElementById('referralBalance');
    var url = referralCode ? window.location.origin + '/?ref=' + referralCode : 'Referral code unavailable';
    if (linkEl) {
      linkEl.textContent = url;
      linkEl.dataset.link = url;
    }
    if (balanceEl) {
      balanceEl.textContent = '$' + (data.balance || 0).toFixed(2);
    }
  } catch (err) {
    showToast(err.message, 'error');
  }
}

function copyReferralLink() {
  var el = document.getElementById('referralLink');
  if (!el || !el.dataset.link) {
    showToast('Referral link not ready yet', 'error');
    return;
  }
  navigator.clipboard.writeText(el.dataset.link).then(function() { showToast('Referral link copied', 'success'); }).catch(function() { showToast('Failed to copy', 'error'); });
}

function renderHelpPage(main) {
  main.innerHTML = '<div class="page-header"><h1 class="page-title">Help Center</h1></div>' +
    '<div style="max-width:800px;display:flex;flex-direction:column;gap:16px;">' +
    '<h2 style="font-size:18px;font-weight:600;margin-bottom:8px;">Virtual Number Service – User Guide</h2>' +
    '<p style="font-size:14px;color:var(--text-secondary);line-height:1.6;">Stay updated by joining our Telegram Channel for the latest announcements, updates, and support.</p>' +
    '<p style="font-size:14px;color:var(--text-secondary);line-height:1.6;">If your purchased activations are not credited to your balance after payment, simply tap the "Restore Purchases" button in the app. If the issue continues, please contact support and provide a screenshot from your App Store or purchase history, or proof of payment from your bank for quick assistance.</p>' +
    '<p style="font-size:14px;color:var(--text-secondary);line-height:1.6;">Our service is simple and easy to use. First, order a number by selecting the service you need (for example, Tinder, WhatsApp, or any supported platform) and choose your preferred country. Once the number is issued, copy it and paste it into the registration form of the selected service. When the verification SMS is sent, it will appear directly in the app. You can then copy the confirmation code and complete your registration.</p>' +
    '<p style="font-size:14px;color:var(--text-secondary);line-height:1.6;">We offer two types of services. The first is Activations, which are short-term numbers available for approximately 20 minutes. These are ideal for quick verifications and allow you to receive one or more SMS depending on the selected service. The second option is Rent, which provides a number for up to 30 days. With this option, you can receive unlimited SMS, and by selecting "Full Rent," you can receive messages from any service, making it ideal for long-term use.</p>' +
    '<p style="font-size:14px;color:var(--text-secondary);line-height:1.6;">If you experience issues receiving SMS, wait at least 3 minutes and then cancel the activation. Your balance will be refunded automatically, and you can try purchasing another number. There are several factors that may affect message delivery. For better success rates, use a VPN or proxy that matches the country of the selected number, ensure you choose SMS verification instead of voice calls, and for some services like WhatsApp, reinstalling the app may help.</p>' +
    '<p style="font-size:14px;color:var(--text-secondary);line-height:1.6;">In case your registered account gets banned, it is recommended to use mobile proxies that match the geolocation of the purchased number or a mobile user agent. Please note that we only provide virtual numbers and do not control or manage account registrations. We advise users to follow best practices and research methods to avoid account restrictions.</p>' +
    '<p style="font-size:14px;color:var(--text-secondary);line-height:1.6;">Your privacy and security are important to us. Each number is assigned exclusively to one user during its usage period. SMS messages received are not shared or reused for the same service, ensuring that no one else can access your verification codes or accounts.</p>' +
    '<p style="font-size:14px;color:var(--text-secondary);line-height:1.6;">If you need further assistance, our support team is available to help. Please provide detailed information and screenshots when reporting any issues to ensure a faster resolution.</p>' +
    '</div>';
}

function renderContactsPage(main) {
  main.innerHTML = '<div class="page-header"><h1 class="page-title">Contacts</h1></div>' +
    '<div style="max-width:600px;display:flex;flex-direction:column;gap:16px;">' +
    '<div class="stat-card" style="padding:24px;">' +
    '<h3 style="font-size:16px;font-weight:600;margin-bottom:16px;">Get in Touch</h3>' +
    '<div style="display:flex;flex-direction:column;gap:12px;">' +
    '<div style="display:flex;align-items:center;gap:12px;">' +
    '<i class="fas fa-envelope" style="color:var(--accent);font-size:18px;"></i>' +
    '<div><div style="font-size:14px;font-weight:600;">Email</div><div style="font-size:14px;color:var(--text-secondary);">backwoti11@gmail.com</div></div>' +
    '</div>' +
    '<div style="display:flex;align-items:center;gap:12px;">' +
    '<i class="fas fa-phone" style="color:var(--accent);font-size:18px;"></i>' +
    '<div><div style="font-size:14px;font-weight:600;">Phone</div><div style="font-size:14px;color:var(--text-secondary);">+13146438883</div></div>' +
    '</div>' +
    '</div>' +
    '</div>' +
    '</div>';
}

/* ===== Deposit / Add Funds ===== */

var selectedDepositAmount = 0;
var selectedPaymentMethod = 'usdt';
var selectedCryptoCurrency = 'trx';

var depositMethodInfo = {
  usdt: {
    title: 'USDT-TRC20',
    subtitle: 'Confirmation: 5-10 minutes',
    note: 'Send USDT via TRC20 network. Do not use ERC20 or BEP20.'
  },
  stripe: {
    title: 'Bank Cards',
    subtitle: 'Confirmation: 1-5 minutes',
    note: 'Supports Visa, Mastercard and local bank cards.'
  },
  crypto: {
    title: 'Cryptocurrency',
    subtitle: 'Confirmation: 5-30 minutes depending on network',
    note: 'Pay with BTC, ETH, LTC, DOGE, USDT and more through our secure gateway.'
  }
};

var cryptoOptions = [
  { id: 'USDT_TRX', name: 'USDT TRC-20' },
  { id: 'TRX', name: 'TRON' },
  { id: 'BTC', name: 'Bitcoin' },
  { id: 'ETH', name: 'Ethereum' },
  { id: 'LTC', name: 'Litecoin' },
  { id: 'DOGE', name: 'Dogecoin' },
  { id: 'BNB', name: 'BNB Chain' },
  { id: 'SOL', name: 'Solana' }
];

function selectCryptoCurrency(currencyId, el) {
  selectedCryptoCurrency = currencyId;
  document.querySelectorAll('.crypto-pick').forEach(function(opt) {
    opt.style.background = 'var(--bg-primary)';
    opt.style.borderColor = 'var(--border)';
    opt.style.color = 'var(--text-secondary)';
  });
  el.style.background = 'var(--accent-dim)';
  el.style.borderColor = 'var(--accent)';
  el.style.color = 'var(--accent)';

  var minNote = document.getElementById('cryptoMinNote');
  if (minNote) {
    if (currencyId === 'USDT_TRX') {
      minNote.textContent = 'Note that the minimum amount for USDT TRC-20 is: US$5';
    } else {
      minNote.textContent = 'Note that the minimum amount is: US$2';
    }
  }

  updatePayButton();
}

function getCryptoPickerHTML() {
  return '<div id="cryptoPicker" style="margin-bottom:20px;">' +
    '<label style="display:block;font-size:14px;font-weight:600;margin-bottom:10px;">Select cryptocurrency</label>' +
    '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(130px,1fr));gap:8px;">' +
    cryptoOptions.map(function(c) {
      var isSelected = c.id === selectedCryptoCurrency;
      return '<div class="crypto-pick" onclick="selectCryptoCurrency(\'' + c.id + '\', this)" style="padding:10px 14px;border:1px solid ' + (isSelected ? 'var(--accent)' : 'var(--border)') + ';border-radius:10px;cursor:pointer;font-size:13px;font-weight:600;background:' + (isSelected ? 'var(--accent-dim)' : 'var(--bg-primary)') + ';color:' + (isSelected ? 'var(--accent)' : 'var(--text-secondary)') + ';transition:all 0.2s;text-align:center;">' + c.name + '</div>';
    }).join('') +
    '</div>' +
    '<div style="margin-top:10px;font-size:11px;color:var(--text-muted);display:flex;align-items:center;gap:6px;">' +
    '<i class="fas fa-shield-alt" style="color:var(--accent);"></i> Payments processed secure</div>' +
    '</div>';
}

function renderDepositPage(main) {
  var method = depositMethodInfo[selectedPaymentMethod] || depositMethodInfo.usdt;
  var cryptoPickerBlock = (selectedPaymentMethod === 'crypto') ? getCryptoPickerHTML() : '';

  main.innerHTML = '<div class="page-header"><div><h1 class="page-title">Top Up Balance</h1><div style="font-size:14px;color:var(--text-secondary);margin-top:8px;">Current balance: <strong id="depositCurrentBalance">$0.00</strong></div></div></div>' +
    '<div style="max-width:980px;display:grid;gap:24px;">' +
    '<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:16px;">' +
    '<div class="stat-card" style="padding:24px;min-height:180px;">' +
    '<div style="display:flex;align-items:center;gap:14px;margin-bottom:16px;"><div style="width:44px;height:44px;border-radius:14px;background:rgba(0,200,150,0.1);display:flex;align-items:center;justify-content:center;color:var(--accent);"><i class="fas fa-money-bill-wave" style="font-size:18px;"></i></div><div><div style="font-size:16px;font-weight:700;">USDT</div><div style="font-size:13px;color:var(--text-muted);">Confirmation: 5-10 minutes</div></div></div>' +
    '<div style="font-size:13px;color:var(--text-secondary);line-height:1.7;">Use USDT TRC20 to top up quickly with low fees and near-instant confirmation.</div>' +
    '<div style="margin-top:18px;"><button class="btn btn-outline dep-meth" data-method="usdt" onclick="selectPaymentMethod(\'usdt\', this)" style="width:100%;padding:12px;font-size:14px;">Select</button></div>' +
    '</div>' +
    '<div class="stat-card" style="padding:24px;min-height:180px;">' +
    '<div style="display:flex;align-items:center;gap:14px;margin-bottom:16px;"><div style="width:44px;height:44px;border-radius:14px;background:rgba(0,175,193,0.1);display:flex;align-items:center;justify-content:center;color:#00afc1;"><i class="fas fa-credit-card" style="font-size:18px;"></i></div><div><div style="font-size:16px;font-weight:700;">Bank Cards</div><div style="font-size:13px;color:var(--text-muted);">Confirmation: 1-5 minutes</div></div></div>' +
    '<div style="font-size:13px;color:var(--text-secondary);line-height:1.7;">Pay with cards and get balance instantly. Perfect when you need a smooth, simple checkout.</div>' +
    '<div style="margin-top:18px;"><button class="btn btn-outline dep-meth" data-method="stripe" onclick="selectPaymentMethod(\'stripe\', this)" style="width:100%;padding:12px;font-size:14px;">Select</button></div>' +
    '</div>' +
    '<div class="stat-card" style="padding:24px;min-height:180px;">' +
    '<div style="display:flex;align-items:center;gap:14px;margin-bottom:16px;"><div style="width:44px;height:44px;border-radius:14px;background:rgba(247,147,26,0.1);display:flex;align-items:center;justify-content:center;color:#f7931a;"><i class="fas fa-coins" style="font-size:18px;"></i></div><div><div style="font-size:16px;font-weight:700;">Cryptocurrency</div><div style="font-size:13px;color:var(--text-muted);">Secure crypto payment</div></div></div>' +
    '<div style="font-size:13px;color:var(--text-secondary);line-height:1.7;">Pay with USDT and crypto options through our secure gateway.</div>' +
    '<div style="margin-top:18px;"><button class="btn btn-outline dep-meth" data-method="crypto" onclick="selectPaymentMethod(\'crypto\', this)" style="width:100%;padding:12px;font-size:14px;">Select</button></div>' +
    '</div>' +
    '<div class="stat-card" style="padding:24px;">' +
    '<div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:16px;margin-bottom:24px;">' +
    '<div><div id="depositMethodTitle" style="font-size:20px;font-weight:700;margin-bottom:6px;">Top Up By ' + method.title + '</div>' +
    '<div id="depositMethodSubtitle" style="font-size:14px;color:var(--text-muted);">' + method.subtitle + '</div></div>' +
    '<div style="display:flex;flex-wrap:wrap;gap:10px;justify-content:flex-end;">' +
    '<button class="btn btn-outline dep-amt" data-amount="5" onclick="selectDepositAmount(5,this)" style="padding:12px 18px;font-size:14px;">US$5</button>' +
    '<button class="btn btn-outline dep-amt" data-amount="10" onclick="selectDepositAmount(10,this)" style="padding:12px 18px;font-size:14px;">US$10</button>' +
    '<button class="btn btn-outline dep-amt" data-amount="20" onclick="selectDepositAmount(20,this)" style="padding:12px 18px;font-size:14px;">US$20</button>' +
    '<button class="btn btn-outline dep-amt" data-amount="50" onclick="selectDepositAmount(50,this)" style="padding:12px 18px;font-size:14px;">US$50</button>' +
    '<button class="btn btn-outline dep-amt" data-amount="100" onclick="selectDepositAmount(100,this)" style="padding:12px 18px;font-size:14px;">US$100</button>' +
    '</div></div>' +
    cryptoPickerBlock +
    '<div style="margin-bottom:20px;"><label style="display:block;font-size:14px;font-weight:600;margin-bottom:10px;">Top up amount</label>' +
    '<input type="number" id="customAmount" placeholder="US$" min="2" max="1000" style="width:100%;padding:16px;border:1px solid var(--border);border-radius:12px;background:var(--bg-primary);font-size:16px;outline:none;" oninput="selectCustomAmount(this.value)"></div>' +
    '<div style="padding:20px;background:rgba(245,248,250,1);border:1px solid var(--border);border-radius:18px;margin-bottom:24px;">' +
    '<ul style="margin:0;padding:0 0 0 18px;color:var(--text-secondary);font-size:14px;line-height:1.8;">' +
    '<li id="cryptoMinNote">Note that the minimum amount is: US$2</li>' +
    '<li id="depositHintNote">' + method.note + '</li>' +
    '</ul></div>' +
    '<button class="btn btn-primary" style="width:100%;padding:16px;font-size:15px;margin-bottom:0;" onclick="processDeposit()" id="depositPayBtn">To Pay $' + selectedDepositAmount.toFixed(2) + '</button>' +
    '</div>' +
    '<div class="stat-card" style="padding:24px;">' +
    '<h3 style="font-size:14px;font-weight:600;margin-bottom:16px;">Recent Deposits</h3>' +
    '<div id="depositHistoryList"><div style="text-align:center;padding:20px;color:var(--text-muted);font-size:13px;">Loading...</div></div>' +
    '</div>' +
    '</div>';
  updateDepositDetails();
}

function updateDepositDetails() {
  var method = depositMethodInfo[selectedPaymentMethod] || depositMethodInfo.usdt;
  var titleEl = document.getElementById('depositMethodTitle');
  var subtitleEl = document.getElementById('depositMethodSubtitle');
  var hintNote = document.getElementById('depositHintNote');
  if (titleEl) titleEl.textContent = 'Top Up By ' + method.title;
  if (subtitleEl) subtitleEl.textContent = method.subtitle;
  if (hintNote) hintNote.textContent = method.note;
  updatePayButton();
}

function selectDepositAmount(amount, el) {
  selectedDepositAmount = amount;
  var customInput = document.getElementById('customAmount');
  if (customInput) customInput.value = '';
  document.querySelectorAll('.dep-amt').forEach(function(btn) {
    btn.style.background = 'var(--bg-primary)';
    btn.style.border = '1px solid var(--border)';
    delete btn.dataset.sel;
  });
  el.style.background = 'var(--accent-dim)';
  el.style.border = '2px solid var(--accent)';
  el.dataset.sel = '1';
  updatePayButton();
}

function selectCustomAmount(value) {
  var num = parseFloat(value);
  if (num > 0) {
    selectedDepositAmount = num;
    document.querySelectorAll('.dep-amt').forEach(function(btn) {
      btn.style.background = 'var(--bg-primary)';
      btn.style.border = '1px solid var(--border)';
      delete btn.dataset.sel;
    });
    updatePayButton();
  }
}

function selectPaymentMethod(method, el) {
  selectedPaymentMethod = method;
  document.querySelectorAll('.dep-meth').forEach(function(opt) {
    opt.style.background = 'var(--bg-primary)';
    opt.style.border = '1px solid var(--border)';
    delete opt.dataset.sel;
  });
  el.style.background = 'var(--accent-dim)';
  el.style.border = '2px solid var(--accent)';
  el.dataset.sel = '1';
  renderDepositPage(document.getElementById('mainContent'));
}

function updatePayButton() {
  var btn = document.getElementById('depositPayBtn');
  if (btn) {
    var label = 'Pay';
    if (selectedPaymentMethod === 'crypto') {
      var found = cryptoOptions.find(function(c) { return c.id === selectedCryptoCurrency; });
      label = 'Pay with ' + (found ? found.name : 'Crypto');
    }
    btn.innerHTML = '<i class="fas fa-lock" style="font-size:13px;"></i> ' + label + ' $' + selectedDepositAmount.toFixed(2) + ' Securely';
  }
}

async function processDeposit() {
  if (selectedCryptoCurrency === 'USDT_TRX' && selectedDepositAmount < 5) {
    showToast('Minimum for USDT TRC-20 is $5.00', 'error');
    return;
  }

  if (selectedDepositAmount < 2) {
    showToast('Minimum deposit is $2.00', 'error');
    return;
  }
  var btn = document.getElementById('depositPayBtn');
  btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Creating payment...';
  btn.disabled = true;

  try {
    var endpoint = '/api/deposit/nowpayments';
    var payload = {
      email: getUserEmail(),
      amount: selectedDepositAmount,
      pay_currency: selectedCryptoCurrency
    };

    var res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    var data = await res.json();
    if (data.error) {
      showToast(data.error, 'error');
    } else if (data.invoice_url) {
      window.location.href = data.invoice_url;
    } else {
      showToast('Unexpected response', 'error');
    }
  } catch (err) {
    showToast('Error: ' + err.message, 'error');
  }

  btn.innerHTML = '<i class="fas fa-lock" style="font-size:13px;"></i> Pay $' + selectedDepositAmount.toFixed(2) + ' Securely';
  btn.disabled = false;
}

async function loadDepositHistory() {
  try {
    var res = await fetch('/api/deposits/' + getUserEmail());
    var deposits = await res.json();
    var container = document.getElementById('depositHistoryList');
    if (!container) return;
    if (deposits.length === 0) {
      container.innerHTML = '<div style="text-align:center;padding:20px;color:var(--text-muted);font-size:13px;">No deposits yet</div>';
      return;
    }
    window.depositHistoryData = deposits;
    container.innerHTML = deposits.map(function(d) {
      var statusColor = d.status === 'completed' ? 'var(--accent)' : d.status === 'pending' ? 'var(--warning)' : 'var(--danger)';
      var statusText = d.status === 'completed' ? 'Completed' : d.status === 'pending' ? 'Pending' : 'Failed';
      var methodLabels = { usdt: 'USDT', btc: 'BTC', eth: 'ETH', ltc: 'LTC', doge: 'DOGE', bnb: 'BNB', sol: 'SOL', xrp: 'XRP', stripe: 'Card', usdc: 'USDC', matic: 'MATIC', ada: 'ADA', trx: 'TRX', usdttrc20: 'USDT TRC20' };
      var methodLabel = methodLabels[d.method] || methodLabels[d.pay_currency] || d.method || 'Unknown';
      var date = new Date(d.created_at);
      var timeStr = date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      var bgColor = d.status === 'completed' ? 'var(--accent-dim)' : d.status === 'pending' ? 'rgba(212,136,6,0.08)' : 'rgba(217,48,37,0.06)';
      return '<div style="display:flex;align-items:center;gap:14px;padding:12px 0;border-bottom:1px solid var(--border);">' +
        '<div style="flex:1;"><div style="font-size:13px;font-weight:600;">$' + d.amount.toFixed(2) + ' <span style="font-size:11px;color:var(--text-muted);font-weight:400;">' + methodLabel + '</span></div>' +
        '<div style="font-size:11px;color:var(--text-muted);">' + timeStr + '</div></div>' +
        '<span style="font-size:11px;padding:3px 10px;border-radius:6px;font-weight:600;background:' + bgColor + ';color:' + statusColor + ';">' + statusText + '</span></div>';
    }).join('');
  } catch (err) { /* silent */ }
}


// =======================================================================
// ===== BUY LOGIC =====
// =======================================================================

window.selectedBuyService = null;

window.openModalById = function(serviceId) {
  var service = services.find(function(s) { return s.id === serviceId; });
  
  if (!service) {
    console.error("Service not found for ID:", serviceId);
    showToast('Error: Service not found', 'error');
    return;
  }

  window.selectedBuyService = service;
  window.modalRealPrice = service.price;
  window.modalServiceAvailable = true;

  var countryOptions = countries.map(function(c) {
    return '<option value="' + c.code + '">' + c.flag + ' ' + c.name + '</option>';
  }).join('');

  var mi = getServiceIconData(service.name, service.id, service.icon);

  var modalHTML = '<div class="modal-overlay show" id="buyModalOverlay" onclick="if(event.target===this)closeBuyModal()">' +
    '<div class="modal" style="width:440px;">' +
      '<div class="modal-header">' +
        '<h2 class="modal-title">Get Virtual Number</h2>' +
        '<button class="modal-close" onclick="closeBuyModal()"><i class="fas fa-times"></i></button>' +
      '</div>' +
      '<div class="modal-body">' +
        // === REAL IMAGE PREVIEW ===
        '<div class="service-image-preview" id="servicePreview" style="display:' + (service.image ? 'flex' : 'none') + ';">' +
          '<img id="serviceImage" src="' + (service.image || '') + '" alt="' + service.name + '" onerror="this.parentElement.style.display=\'none\'">' +
        '</div>' +
        '<div style="display:flex;align-items:center;gap:14px;margin-bottom:20px;padding:14px;background:var(--bg-primary);border-radius:12px;border:1px solid var(--border);">' +
         '<div style="width:44px;height:44px;border-radius:12px;display:flex;align-items:center;justify-content:center;font-size:18px;background:' + mi.bg + ';color:' + mi.color + ';">' + mi.html + '</div>' +
          '<div style="flex:1;">' +
            '<div style="font-size:16px;font-weight:700;">' + service.name + '</div>' +
            '<div id="modalPriceDisplay" style="font-size:13px;color:var(--accent);font-weight:600;">$' + service.price.toFixed(2) + '</div>' +
          '</div>' +
        '</div>' +
        '<div class="form-group">' +
          '<label class="form-label">Country / Region</label>' +
          '<select class="form-select" id="countrySelect" onchange="updateModalPrice()">' + countryOptions + '</select>' +
        '</div>' +
      '</div>' +
      '<div class="modal-footer">' +
        '<button class="btn btn-secondary" onclick="closeBuyModal()">Cancel</button>' +
        '<button class="btn btn-primary" id="finalBuyBtn" onclick="executeBuyNumber()"><i class="fas fa-phone-alt"></i> Get Number</button>' +
      '</div>' +
    '</div>' +
  '</div>';

  var existing = document.getElementById('buyModalOverlay');
  if (existing) existing.remove();

  document.body.insertAdjacentHTML('beforeend', modalHTML);

  updateModalPrice();
};

window.closeBuyModal = function() {
  var modal = document.getElementById('buyModalOverlay');
  if (modal) modal.remove();
  window.selectedBuyService = null;
};

window.updateModalPrice = function() {
  var service = window.selectedBuyService;
  if (!service) return;

  var countryDropdown = document.getElementById('countrySelect');
  var countryCode = countryDropdown ? countryDropdown.value : 'us';
  var priceEl = document.getElementById('modalPriceDisplay');
  var buyBtn = document.getElementById('finalBuyBtn');
  if (!priceEl) return;

  var cached = priceCache[countryCode];
  if (cached && Object.keys(cached).length > 0) {
    if (cached[service.id] !== undefined) {
      window.modalRealPrice = cached[service.id];
      window.modalServiceAvailable = true;
      priceEl.textContent = '$' + cached[service.id].toFixed(2);
      priceEl.style.color = 'var(--accent)';
      if (buyBtn) { buyBtn.disabled = false; buyBtn.innerHTML = '<i class="fas fa-phone-alt"></i> Get Number'; }
    } else {
      window.modalServiceAvailable = false;
      priceEl.textContent = 'Not available for this country';
      priceEl.style.color = 'var(--danger)';
      if (buyBtn) { buyBtn.disabled = true; buyBtn.innerHTML = '<i class="fas fa-ban"></i> Unavailable'; }
    }
    return;
  }

  priceEl.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Loading price...';
  priceEl.style.color = 'var(--text-muted)';
  if (buyBtn) { buyBtn.disabled = true; }

  fetchPricesForCountry(countryCode).then(function(prices) {
    if (!prices) {
      window.modalRealPrice = service.price;
      window.modalServiceAvailable = true;
      priceEl.textContent = '$' + service.price.toFixed(2);
      priceEl.style.color = 'var(--accent)';
      if (buyBtn) { buyBtn.disabled = false; buyBtn.innerHTML = '<i class="fas fa-phone-alt"></i> Get Number'; }
      return;
    }
    if (prices[service.id] !== undefined) {
      window.modalRealPrice = prices[service.id];
      window.modalServiceAvailable = true;
      priceEl.textContent = '$' + prices[service.id].toFixed(2);
      priceEl.style.color = 'var(--accent)';
      if (buyBtn) { buyBtn.disabled = false; buyBtn.innerHTML = '<i class="fas fa-phone-alt"></i> Get Number'; }
    } else {
      window.modalServiceAvailable = false;
      priceEl.textContent = 'Not available for this country';
      priceEl.style.color = 'var(--danger)';
      if (buyBtn) { buyBtn.disabled = true; buyBtn.innerHTML = '<i class="fas fa-ban"></i> Unavailable'; }
    }
  });
};

window.executeBuyNumber = function() {
  if (!window.selectedBuyService || !window.selectedBuyService.id) {
    showToast('Please select a service.', 'error');
    return;
  }

  if (!window.modalServiceAvailable) {
    showToast('This service is not available for the selected country.', 'error');
    var btn = document.getElementById('finalBuyBtn');
    if (btn) { btn.innerHTML = '<i class="fas fa-phone-alt"></i> Get Number'; btn.disabled = false; }
    return;
  }

  var serviceCode = window.selectedBuyService.id;
  var serviceName = window.selectedBuyService.name;
  var servicePrice = window.modalRealPrice;
  var userEmail = (typeof getUserEmail === 'function') ? getUserEmail() : '';
  
  var countryDropdown = document.getElementById('countrySelect');
  var countryCode = countryDropdown ? countryDropdown.value : 'us';
  
  var countryData = countries.find(function(c) { return c.code === countryCode; });
  var countryFlag = countryData ? countryData.flag : '🏳️';
  var countryName = countryData ? countryData.name : 'Unknown';
  var serviceIcon = window.selectedBuyService.icon || '';

  console.log("EXECUTING BUY -> Service ID:", serviceCode, "| Country:", countryCode, "| Price:", servicePrice, "| Flag:", countryFlag);

  var btn = document.getElementById('finalBuyBtn');
  if (btn) { btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Buying...'; btn.disabled = true; }

  fetch('/api/numbers/request', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: userEmail,
      serviceName: serviceName,
      serviceId: serviceCode,
      countryCode: countryCode,
      countryFlag: countryFlag,
      countryName: countryName,
      serviceIcon: serviceIcon,
      cost: servicePrice
    })
  })
  .then(function(res) { return res.json(); })
  .then(function(data) {
    if (data.error) {
      showToast(data.error, 'error');
    } else {
      showToast('Number purchased successfully!', 'success');
      closeBuyModal();
      if (typeof loadBalance === 'function') loadBalance();
      if (typeof loadNumbers === 'function') {
        loadNumbers().then(function() {
          if (typeof renderMainContent === 'function') renderMainContent();
          setTimeout(function() {
            var activeSection = document.getElementById('activeNumbersSection');
            if (activeSection) {
              activeSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
          }, 300);
        });
      }
    }
  })
  .catch(function(err) {
    console.error("Buy error:", err);
    showToast('Failed to connect to server.', 'error');
  })
  .finally(function() {
    if (btn) {
      btn.innerHTML = '<i class="fas fa-phone-alt"></i> Get Number';
      btn.disabled = false;
    }
  });
};