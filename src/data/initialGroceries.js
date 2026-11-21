export const PRESET_PHOTOS = [
  // --- MEDICINES & HEALTHCARE (மருந்துகள்) ---
  {
    name: 'Dolo 650 / டோலோ 650',
    url: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=500&auto=format&fit=crop&q=80',
    emoji: '💊',
    category: 'medicines'
  },
  {
    name: 'Vicks Vaporub / விக்ஸ்',
    url: 'https://images.unsplash.com/photo-1585435557343-3b092031a831?w=500&auto=format&fit=crop&q=80',
    emoji: '🧴',
    category: 'medicines'
  },
  {
    name: 'Cough Syrup / இருமல் மருந்து',
    url: 'https://images.unsplash.com/photo-1631549916768-4119b2e5f926?w=500&auto=format&fit=crop&q=80',
    emoji: '🧪',
    category: 'medicines'
  },
  {
    name: 'Band-Aid / பேன்ட்-எய்ட்',
    url: 'https://images.unsplash.com/photo-1598256989800-fe5f95da9787?w=500&auto=format&fit=crop&q=80',
    emoji: '🩹',
    category: 'medicines'
  },
  {
    name: 'Pain Relief Balm / தைலம்',
    url: 'https://images.unsplash.com/photo-1607613009820-a29f7bb81c04?w=500&auto=format&fit=crop&q=80',
    emoji: '🫙',
    category: 'medicines'
  },

  // --- VEGETABLES ---
  {
    name: 'Tomato / தக்காளி',
    url: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=400&auto=format&fit=crop&q=80',
    emoji: '🍅',
    category: 'vegetables'
  },
  {
    name: 'Onion / வெங்காயம்',
    url: 'https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?w=400&auto=format&fit=crop&q=80',
    emoji: '🧅',
    category: 'vegetables'
  },
  {
    name: 'Potato / உருளைக்கிழங்கு',
    url: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=400&auto=format&fit=crop&q=80',
    emoji: '🥔',
    category: 'vegetables'
  },
  {
    name: 'Carrot / கேரட்',
    url: 'https://images.unsplash.com/photo-1598170845058-32b9d6a5c317?w=400&auto=format&fit=crop&q=80',
    emoji: '🥕',
    category: 'vegetables'
  },
  {
    name: 'Green Chilli / மிளகாய்',
    url: 'https://images.unsplash.com/photo-1588252303782-cb80119abd6d?w=400&auto=format&fit=crop&q=80',
    emoji: '🌶️',
    category: 'vegetables'
  },
  {
    name: 'Garlic / பூண்டு',
    url: 'https://images.unsplash.com/photo-1540148426945-6cf22a6b2383?w=400&auto=format&fit=crop&q=80',
    emoji: '🧄',
    category: 'vegetables'
  },
  {
    name: 'Apple / ஆப்பிள்',
    url: 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=400&auto=format&fit=crop&q=80',
    emoji: '🍎',
    category: 'fruits'
  },
  {
    name: 'Banana / வாழைப்பழம்',
    url: 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=400&auto=format&fit=crop&q=80',
    emoji: '🍌',
    category: 'fruits'
  },
  {
    name: 'Milk / பசும்பால்',
    url: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=400&auto=format&fit=crop&q=80',
    emoji: '🥛',
    category: 'dairy'
  },
  {
    name: 'Eggs / முட்டை',
    url: 'https://images.unsplash.com/photo-1516448620398-c5f44bf9f441?w=400&auto=format&fit=crop&q=80',
    emoji: '🥚',
    category: 'dairy'
  },
  {
    name: 'Rice / பொன்னி அரிசி',
    url: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400&auto=format&fit=crop&q=80',
    emoji: '🍚',
    category: 'staples'
  },
  {
    name: 'Cooking Oil / எண்ணெய்',
    url: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=400&auto=format&fit=crop&q=80',
    emoji: '🫗',
    category: 'staples'
  },
  {
    name: 'Bread / ரொட்டி',
    url: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400&auto=format&fit=crop&q=80',
    emoji: '🍞',
    category: 'bakery'
  },
  {
    name: 'Filter Coffee / காபி தூள்',
    url: 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=400&auto=format&fit=crop&q=80',
    emoji: '☕',
    category: 'snacks'
  },
  {
    name: 'Coconut / தேங்காய்',
    url: 'https://images.unsplash.com/photo-1589578228447-e1a4e481c6c8?w=400&auto=format&fit=crop&q=80',
    emoji: '🥥',
    category: 'vegetables'
  },
  {
    name: 'Ginger / இஞ்சி',
    url: 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?w=400&auto=format&fit=crop&q=80',
    emoji: '🫚',
    category: 'vegetables'
  }
];

export const INITIAL_GROCERIES = [
  // Medicine Item
  {
    id: 'med-1',
    name: 'Dolo 650 Tablets',
    tamilName: 'டோலோ 650 மாத்திரை',
    category: 'medicines',
    quantity: '1',
    unit: 'strip',
    price: 32,
    purchased: false,
    purchasedAt: null,
    photoUrl: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=500&auto=format&fit=crop&q=80',
    emoji: '💊',
    notes: 'காய்ச்சல் & தலைவலிக்கு (15 மாத்திரைகள்)'
  },
  {
    id: 'med-2',
    name: 'Vicks Vaporub',
    tamilName: 'விக்ஸ் வேப்பரப்',
    category: 'medicines',
    quantity: '1',
    unit: 'bottle',
    price: 55,
    purchased: false,
    purchasedAt: null,
    photoUrl: 'https://images.unsplash.com/photo-1585435557343-3b092031a831?w=500&auto=format&fit=crop&q=80',
    emoji: '🧴',
    notes: 'சளி நிவாரணி (25ml)'
  },
  // Groceries Items
  {
    id: 'item-1',
    name: 'Tomato',
    tamilName: 'தக்காளி',
    category: 'vegetables',
    quantity: '1',
    unit: 'kg',
    price: 38,
    purchased: false,
    purchasedAt: null,
    photoUrl: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=400&auto=format&fit=crop&q=80',
    emoji: '🍅',
    notes: 'நாட்டு தக்காளி வாங்கவும்'
  },
  {
    id: 'item-2',
    name: 'Onion',
    tamilName: 'வெங்காயம்',
    category: 'vegetables',
    quantity: '2',
    unit: 'kg',
    price: 55,
    purchased: false,
    purchasedAt: null,
    photoUrl: 'https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?w=400&auto=format&fit=crop&q=80',
    emoji: '🧅',
    notes: 'பெரிய வெங்காயம்'
  },
  {
    id: 'item-3',
    name: 'Fresh Milk',
    tamilName: 'பசும்பால்',
    category: 'dairy',
    quantity: '1',
    unit: 'L',
    price: 28,
    purchased: false,
    purchasedAt: null,
    photoUrl: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=400&auto=format&fit=crop&q=80',
    emoji: '🥛',
    notes: 'ஆவின் நீல நிற பாக்கெட்'
  },
  {
    id: 'item-4',
    name: 'Apples',
    tamilName: 'ஆப்பிள்',
    category: 'fruits',
    quantity: '1',
    unit: 'kg',
    price: 180,
    purchased: true,
    purchasedAt: '2026-11-20T10:30:00Z',
    photoUrl: 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=400&auto=format&fit=crop&q=80',
    emoji: '🍎',
    notes: 'சிம்லா ஆப்பிள்'
  },
  {
    id: 'item-5',
    name: 'Farm Fresh Eggs',
    tamilName: 'முட்டை',
    category: 'dairy',
    quantity: '6',
    unit: 'pcs',
    price: 36,
    purchased: true,
    purchasedAt: '2026-11-20T10:45:00Z',
    photoUrl: 'https://images.unsplash.com/photo-1516448620398-c5f44bf9f441?w=400&auto=format&fit=crop&q=80',
    emoji: '🥚',
    notes: 'நாட்டு முட்டை'
  },
  {
    id: 'item-6',
    name: 'Ponni Boiled Rice',
    tamilName: 'பொன்னி அரிசி',
    category: 'staples',
    quantity: '5',
    unit: 'kg',
    price: 320,
    purchased: false,
    purchasedAt: null,
    photoUrl: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400&auto=format&fit=crop&q=80',
    emoji: '🍚',
    notes: 'முதல் தரம்'
  }
];

export const CATEGORIES = [
  { id: 'all', labelEn: 'All', labelTa: 'அனைத்தும்', icon: '🛒' },
  { id: 'medicines', labelEn: 'Medicines & Health', labelTa: 'மருந்துகள்', icon: '💊' },
  { id: 'vegetables', labelEn: 'Vegetables', labelTa: 'காய்கறிகள்', icon: '🥬' },
  { id: 'fruits', labelEn: 'Fruits', labelTa: 'பழங்கள்', icon: '🍎' },
  { id: 'dairy', labelEn: 'Dairy & Eggs', labelTa: 'பால் & முட்டை', icon: '🥛' },
  { id: 'staples', labelEn: 'Staples & Grains', labelTa: 'மளிகை', icon: '🌾' },
  { id: 'bakery', labelEn: 'Bakery', labelTa: 'ரொட்டி வகை', icon: '🍞' },
  { id: 'snacks', labelEn: 'Snacks & Drinks', labelTa: 'தின்பண்டங்கள்', icon: '☕' },
  { id: 'other', labelEn: 'Other', labelTa: 'மற்றவை', icon: '📦' }
];

export const UNITS = [
  'kg', 
  'g', 
  'L', 
  'ml', 
  'pcs', 
  'pack', 
  'dozen', 
  'bunch',
  'strip',   // Medicine Tablets strip
  'bottle',  // Syrups / liquids
  'tube',    // Ointments / creams
  'box'      // Medicine boxes
];
