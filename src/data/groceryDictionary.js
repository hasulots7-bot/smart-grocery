// Comprehensive Dictionary with 70+ Grocery & Medicine items with Tamil names, English names,
// phonetic keywords, default units, market rates (₹), and high-resolution Unsplash photos.

export const GROCERY_DICTIONARY = [
  // --- MEDICINES & HEALTHCARE (மருந்துகள்) ---
  {
    name: 'Dolo 650 Tablets',
    tamilName: 'டோலோ 650 மாத்திரை',
    keywords: ['dolo', 'dolo 650', 'paracetamol', 'டோலோ', 'டோலோ 650', 'பாராசிட்டமால்', 'காய்ச்சல் மாத்திரை', 'fever tablet', 'headache tablet'],
    category: 'medicines',
    defaultUnit: 'strip',
    marketRate: 32, // ₹ per strip of 15
    photoUrl: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=500&auto=format&fit=crop&q=80',
    emoji: '💊'
  },
  {
    name: 'Paracetamol 500mg',
    tamilName: 'பாராசிட்டமால் மாத்திரை',
    keywords: ['paracetamol', 'crocin', 'calpol', 'பாராசிட்டமால்', 'குரோசின்'],
    category: 'medicines',
    defaultUnit: 'strip',
    marketRate: 20,
    photoUrl: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=500&auto=format&fit=crop&q=80',
    emoji: '💊'
  },
  {
    name: 'Vicks Vaporub',
    tamilName: 'விக்ஸ் வேப்பரப்',
    keywords: ['vicks', 'vicks vaporub', 'விக்ஸ்', 'விக்ஸ் வேப்பரப்', 'cold balm', 'சளி தைலம்'],
    category: 'medicines',
    defaultUnit: 'bottle',
    marketRate: 55,
    photoUrl: 'https://images.unsplash.com/photo-1585435557343-3b092031a831?w=500&auto=format&fit=crop&q=80',
    emoji: '🧴'
  },
  {
    name: 'Cough Syrup',
    tamilName: 'இருமல் மருந்து',
    keywords: ['cough syrup', 'syrup', 'irumal marunthu', 'இருமல் மருந்து', 'பெனட்ரில்', 'benadryl', 'grilinctus', 'zedex'],
    category: 'medicines',
    defaultUnit: 'bottle',
    marketRate: 110,
    photoUrl: 'https://images.unsplash.com/photo-1631549916768-4119b2e5f926?w=500&auto=format&fit=crop&q=80',
    emoji: '🧪'
  },
  {
    name: 'Band-Aid / First Aid',
    tamilName: 'பேன்ட்-எய்ட்',
    keywords: ['band aid', 'bandaid', 'plaster', 'பேன்ட்-எய்ட்', 'பேன்ட் எய்ட்', 'கட்டு துணி', 'first aid'],
    category: 'medicines',
    defaultUnit: 'pack',
    marketRate: 25,
    photoUrl: 'https://images.unsplash.com/photo-1598256989800-fe5f95da9787?w=500&auto=format&fit=crop&q=80',
    emoji: '🩹'
  },
  {
    name: 'Moov Pain Relief Ointment',
    tamilName: 'மூவ் வலி நிவாரணி',
    keywords: ['moov', 'pain balm', 'volini', 'மூவ்', 'வலி தைலம்', 'முதுகு வலி மருந்து'],
    category: 'medicines',
    defaultUnit: 'tube',
    marketRate: 145,
    photoUrl: 'https://images.unsplash.com/photo-1607613009820-a29f7bb81c04?w=500&auto=format&fit=crop&q=80',
    emoji: '🧴'
  },
  {
    name: 'Amrutanjan Pain Balm',
    tamilName: 'அமிர்தாஞ்சன் தைலம்',
    keywords: ['amrutanjan', 'thailam', 'அமிர்தாஞ்சன்', 'தைலம்', 'தலைவலி தைலம்', 'balm'],
    category: 'medicines',
    defaultUnit: 'bottle',
    marketRate: 48,
    photoUrl: 'https://images.unsplash.com/photo-1607613009820-a29f7bb81c04?w=500&auto=format&fit=crop&q=80',
    emoji: '🫙'
  },
  {
    name: 'Eno Fruit Salt Antacid',
    tamilName: 'ஈனோ அசிடிட்டி பவுடர்',
    keywords: ['eno', 'antacid', 'ஈனோ', 'அசிடிட்டி', 'gelusil', 'digene', 'செரிமான மருந்து'],
    category: 'medicines',
    defaultUnit: 'pack',
    marketRate: 10,
    photoUrl: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=500&auto=format&fit=crop&q=80',
    emoji: '🫧'
  },
  {
    name: 'Electral ORS Powder',
    tamilName: 'எலக்ட்ரால் ORS பவுடர்',
    keywords: ['electral', 'ors', 'எலக்ட்ரால்', 'ஓ.ஆர்.எஸ்', 'உயிர்நீர்'],
    category: 'medicines',
    defaultUnit: 'pack',
    marketRate: 22,
    photoUrl: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=500&auto=format&fit=crop&q=80',
    emoji: '🥤'
  },
  {
    name: 'Vitamin C Chewable (Limcee)',
    tamilName: 'விட்டமின் சி மாத்திரை',
    keywords: ['vitamin c', 'limcee', 'விட்டமின்', 'விட்டமின் சி', 'zinc'],
    category: 'medicines',
    defaultUnit: 'strip',
    marketRate: 28,
    photoUrl: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=500&auto=format&fit=crop&q=80',
    emoji: '💊'
  },

  // --- VEGETABLES ---
  {
    name: 'Tomato',
    tamilName: 'தக்காளி',
    keywords: ['tomato', 'thakkali', 'takali', 'தக்காளி', 'நாட்டு தக்காளி', 'பெங்களூர் தக்காளி', 'tamatar'],
    category: 'vegetables',
    defaultUnit: 'kg',
    marketRate: 38, // ₹ per kg
    photoUrl: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=500&auto=format&fit=crop&q=80',
    emoji: '🍅'
  },
  {
    name: 'Onion',
    tamilName: 'வெங்காயம்',
    keywords: ['onion', 'vengayam', 'vengayam', 'வெங்காயம்', 'பெரிய வெங்காயம்', 'சின்ன வெங்காயம்', 'shallots', 'pyaz'],
    category: 'vegetables',
    defaultUnit: 'kg',
    marketRate: 55,
    photoUrl: 'https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?w=500&auto=format&fit=crop&q=80',
    emoji: '🧅'
  },
  {
    name: 'Small Onion / Shallots',
    tamilName: 'சின்ன வெங்காயம்',
    keywords: ['small onion', 'chinna vengayam', 'shallots', 'சின்ன வெங்காயம்', 'சாம்பார் வெங்காயம்'],
    category: 'vegetables',
    defaultUnit: 'kg',
    marketRate: 80,
    photoUrl: 'https://images.unsplash.com/photo-1508747703725-719777637510?w=500&auto=format&fit=crop&q=80',
    emoji: '🧅'
  },
  {
    name: 'Potato',
    tamilName: 'உருளைக்கிழங்கு',
    keywords: ['potato', 'urulaikilangu', 'urulaikizhangu', 'உருளைக்கிழங்கு', 'உருளை', 'aloo'],
    category: 'vegetables',
    defaultUnit: 'kg',
    marketRate: 35,
    photoUrl: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=500&auto=format&fit=crop&q=80',
    emoji: '🥔'
  },
  {
    name: 'Carrot',
    tamilName: 'கேரட்',
    keywords: ['carrot', 'kerat', 'கேரட்', 'ஊட்டி கேரட்', 'gajar'],
    category: 'vegetables',
    defaultUnit: 'kg',
    marketRate: 60,
    photoUrl: 'https://images.unsplash.com/photo-1598170845058-32b9d6a5c317?w=500&auto=format&fit=crop&q=80',
    emoji: '🥕'
  },
  {
    name: 'Green Chilli',
    tamilName: 'பச்சை மிளகாய்',
    keywords: ['green chilli', 'chilli', 'pachai milagai', 'பச்சை மிளகாய்', 'மிளகாய்', 'mirchi'],
    category: 'vegetables',
    defaultUnit: 'g',
    marketRate: 20, // per 250g
    photoUrl: 'https://images.unsplash.com/photo-1588252303782-cb80119abd6d?w=500&auto=format&fit=crop&q=80',
    emoji: '🌶️'
  },
  {
    name: 'Garlic',
    tamilName: 'பூண்டு',
    keywords: ['garlic', 'poondu', 'பூண்டு', 'மலை பூண்டு', 'lehsun'],
    category: 'vegetables',
    defaultUnit: 'kg',
    marketRate: 240,
    photoUrl: 'https://images.unsplash.com/photo-1540148426945-6cf22a6b2383?w=500&auto=format&fit=crop&q=80',
    emoji: '🧄'
  },
  {
    name: 'Ginger',
    tamilName: 'இஞ்சி',
    keywords: ['ginger', 'inji', 'இஞ்சி', 'adrak'],
    category: 'vegetables',
    defaultUnit: 'g',
    marketRate: 35, // 250g
    photoUrl: 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?w=500&auto=format&fit=crop&q=80',
    emoji: '🫚'
  },
  {
    name: 'Coriander Leaves',
    tamilName: 'கொத்தமல்லி',
    keywords: ['coriander', 'kothamalli', 'கொத்தமல்லி', 'dhaniya'],
    category: 'vegetables',
    defaultUnit: 'bunch',
    marketRate: 15,
    photoUrl: 'https://images.unsplash.com/photo-1599940824399-b87987ceb72a?w=500&auto=format&fit=crop&q=80',
    emoji: '🌿'
  },
  {
    name: 'Mint Leaves',
    tamilName: 'புதினா',
    keywords: ['mint', 'pudhina', 'புதினா', 'pudina'],
    category: 'vegetables',
    defaultUnit: 'bunch',
    marketRate: 15,
    photoUrl: 'https://images.unsplash.com/photo-1628556270448-4d4e4148e1b1?w=500&auto=format&fit=crop&q=80',
    emoji: '🌱'
  },
  {
    name: 'Curry Leaves',
    tamilName: 'கறிவேப்பிலை',
    keywords: ['curry leaves', 'kariveppilai', 'கறிவேப்பிலை'],
    category: 'vegetables',
    defaultUnit: 'bunch',
    marketRate: 10,
    photoUrl: 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?w=500&auto=format&fit=crop&q=80',
    emoji: '🍃'
  },
  {
    name: 'Lemon',
    tamilName: 'எலுமிச்சை',
    keywords: ['lemon', 'elumichai', 'எலுமிச்சை', 'nimbu'],
    category: 'vegetables',
    defaultUnit: 'pcs',
    marketRate: 5,
    photoUrl: 'https://images.unsplash.com/photo-1587496679742-bad502958fbe?w=500&auto=format&fit=crop&q=80',
    emoji: '🍋'
  },
  {
    name: 'Coconut',
    tamilName: 'தேங்காய்',
    keywords: ['coconut', 'thengai', 'தேங்காய்', 'nariyal'],
    category: 'vegetables',
    defaultUnit: 'pcs',
    marketRate: 35,
    photoUrl: 'https://images.unsplash.com/photo-1589578228447-e1a4e481c6c8?w=500&auto=format&fit=crop&q=80',
    emoji: '🥥'
  },
  {
    name: 'Brinjal / Eggplant',
    tamilName: 'கத்திரிக்காய்',
    keywords: ['brinjal', 'eggplant', 'kathirikai', 'கத்திரிக்காய்', 'baingan'],
    category: 'vegetables',
    defaultUnit: 'kg',
    marketRate: 45,
    photoUrl: 'https://images.unsplash.com/photo-1627916607164-7b20241db935?w=500&auto=format&fit=crop&q=80',
    emoji: '🍆'
  },
  {
    name: 'Ladies Finger / Okra',
    tamilName: 'வெண்டைக்காய்',
    keywords: ['ladies finger', 'okra', 'vendaikkai', 'வெண்டைக்காய்', 'bhindi'],
    category: 'vegetables',
    defaultUnit: 'kg',
    marketRate: 50,
    photoUrl: 'https://images.unsplash.com/photo-1525607551316-4a8e16d1f9ba?w=500&auto=format&fit=crop&q=80',
    emoji: '🥬'
  },
  {
    name: 'Cabbage',
    tamilName: 'முட்டைக்கோஸ்',
    keywords: ['cabbage', 'muttaikos', 'முட்டைக்கோஸ்', 'patta gobhi'],
    category: 'vegetables',
    defaultUnit: 'kg',
    marketRate: 30,
    photoUrl: 'https://images.unsplash.com/photo-1594282486552-05b4d80fbb9f?w=500&auto=format&fit=crop&q=80',
    emoji: '🥬'
  },
  {
    name: 'Cauliflower',
    tamilName: 'காலிஃபிளவர்',
    keywords: ['cauliflower', 'gobi', 'காலிஃபிளவர்', 'பூக்கோஸ்'],
    category: 'vegetables',
    defaultUnit: 'pcs',
    marketRate: 40,
    photoUrl: 'https://images.unsplash.com/photo-1568584711075-3d021a7c3ca3?w=500&auto=format&fit=crop&q=80',
    emoji: '🥦'
  },
  {
    name: 'Drumstick',
    tamilName: 'முருங்கைக்காய்',
    keywords: ['drumstick', 'murungaikkai', 'முருங்கைக்காய்'],
    category: 'vegetables',
    defaultUnit: 'pcs',
    marketRate: 15,
    photoUrl: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=500&auto=format&fit=crop&q=80',
    emoji: '🥢'
  },
  {
    name: 'Beans',
    tamilName: 'பீன்ஸ்',
    keywords: ['beans', 'french beans', 'பீன்ஸ்'],
    category: 'vegetables',
    defaultUnit: 'kg',
    marketRate: 70,
    photoUrl: 'https://images.unsplash.com/photo-1567375698348-5d9d5ae99de0?w=500&auto=format&fit=crop&q=80',
    emoji: '🫛'
  },
  {
    name: 'Beetroot',
    tamilName: 'பீட்ரூட்',
    keywords: ['beetroot', 'பீட்ரூட்', 'beet'],
    category: 'vegetables',
    defaultUnit: 'kg',
    marketRate: 45,
    photoUrl: 'https://images.unsplash.com/photo-1593105544559-ecb03bf76f82?w=500&auto=format&fit=crop&q=80',
    emoji: '🟣'
  },
  {
    name: 'Cucumber',
    tamilName: 'வெள்ளரிக்காய்',
    keywords: ['cucumber', 'vellarikkai', 'வெள்ளரிக்காய்', 'keera'],
    category: 'vegetables',
    defaultUnit: 'kg',
    marketRate: 35,
    photoUrl: 'https://images.unsplash.com/photo-1449300079323-02e209d9d3a6?w=500&auto=format&fit=crop&q=80',
    emoji: '🥒'
  },

  // --- FRUITS ---
  {
    name: 'Apple',
    tamilName: 'ஆப்பிள்',
    keywords: ['apple', 'aappil', 'ஆப்பிள்', 'seb', 'simla apple'],
    category: 'fruits',
    defaultUnit: 'kg',
    marketRate: 180,
    photoUrl: 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=500&auto=format&fit=crop&q=80',
    emoji: '🍎'
  },
  {
    name: 'Banana',
    tamilName: 'வாழைப்பழம்',
    keywords: ['banana', 'valaikkai', 'valapalam', 'வாழைப்பழம்', 'கேலா', 'kela', 'robusta', 'yelakki'],
    category: 'fruits',
    defaultUnit: 'dozen',
    marketRate: 60,
    photoUrl: 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=500&auto=format&fit=crop&q=80',
    emoji: '🍌'
  },
  {
    name: 'Pomegranate',
    tamilName: 'மாதுளை',
    keywords: ['pomegranate', 'mathulai', 'மாதுளை', 'anar'],
    category: 'fruits',
    defaultUnit: 'kg',
    marketRate: 160,
    photoUrl: 'https://images.unsplash.com/photo-1541344999736-83eca872f242?w=500&auto=format&fit=crop&q=80',
    emoji: '🫐'
  },
  {
    name: 'Orange',
    tamilName: 'ஆரஞ்சு',
    keywords: ['orange', 'aranju', 'ஆரஞ்சு', 'kamala orange', 'santara'],
    category: 'fruits',
    defaultUnit: 'kg',
    marketRate: 90,
    photoUrl: 'https://images.unsplash.com/photo-1582979512210-99b6a53386f9?w=500&auto=format&fit=crop&q=80',
    emoji: '🍊'
  },
  {
    name: 'Grapes',
    tamilName: 'திராட்சை',
    keywords: ['grapes', 'thiratchai', 'திராட்சை', 'angoor'],
    category: 'fruits',
    defaultUnit: 'kg',
    marketRate: 110,
    photoUrl: 'https://images.unsplash.com/photo-1596363505729-4190a9506133?w=500&auto=format&fit=crop&q=80',
    emoji: '🍇'
  },
  {
    name: 'Mango',
    tamilName: 'மாம்பழம்',
    keywords: ['mango', 'mampalam', 'மாம்பழம்', 'aam', 'alphonso'],
    category: 'fruits',
    defaultUnit: 'kg',
    marketRate: 140,
    photoUrl: 'https://images.unsplash.com/photo-1553279768-865429fa0078?w=500&auto=format&fit=crop&q=80',
    emoji: '🥭'
  },
  {
    name: 'Papaya',
    tamilName: 'பப்பாளி',
    keywords: ['papaya', 'pappali', 'பப்பாளி'],
    category: 'fruits',
    defaultUnit: 'kg',
    marketRate: 40,
    photoUrl: 'https://images.unsplash.com/photo-1517282009859-f000ec3b26fe?w=500&auto=format&fit=crop&q=80',
    emoji: '🍈'
  },

  // --- DAIRY & EGGS ---
  {
    name: 'Milk',
    tamilName: 'பசும்பால்',
    keywords: ['milk', 'paal', 'பால்', 'பசும்பால்', 'ஆவின் பால்', 'aavin', 'doodh', 'fresh milk'],
    category: 'dairy',
    defaultUnit: 'L',
    marketRate: 28, // 500ml or 1L
    photoUrl: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=500&auto=format&fit=crop&q=80',
    emoji: '🥛'
  },
  {
    name: 'Curd / Yogurt',
    tamilName: 'தயிர்',
    keywords: ['curd', 'thayir', 'தயிர்', 'yogurt', 'dahi', 'ஆவின் தயிர்'],
    category: 'dairy',
    defaultUnit: 'pack',
    marketRate: 35,
    photoUrl: 'https://images.unsplash.com/photo-1571212515416-fef01fc43637?w=500&auto=format&fit=crop&q=80',
    emoji: '🥣'
  },
  {
    name: 'Butter',
    tamilName: 'வெண்ணெய்',
    keywords: ['butter', 'vennai', 'வெண்ணெய்', 'makhan', 'amul butter'],
    category: 'dairy',
    defaultUnit: 'pack',
    marketRate: 58,
    photoUrl: 'https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?w=500&auto=format&fit=crop&q=80',
    emoji: '🧈'
  },
  {
    name: 'Ghee',
    tamilName: 'நெய்',
    keywords: ['ghee', 'nei', 'நெய்', 'பசு நெய்', 'pure ghee'],
    category: 'dairy',
    defaultUnit: 'ml',
    marketRate: 320, // 500ml
    photoUrl: 'https://images.unsplash.com/photo-1628088062854-d1870b4553da?w=500&auto=format&fit=crop&q=80',
    emoji: '🫙'
  },
  {
    name: 'Eggs',
    tamilName: 'முட்டை',
    keywords: ['eggs', 'muttai', 'முட்டை', 'நாட்டு முட்டை', 'egg', 'anda'],
    category: 'dairy',
    defaultUnit: 'pcs',
    marketRate: 6, // per egg
    photoUrl: 'https://images.unsplash.com/photo-1516448620398-c5f44bf9f441?w=500&auto=format&fit=crop&q=80',
    emoji: '🥚'
  },
  {
    name: 'Paneer',
    tamilName: 'பன்னீர்',
    keywords: ['paneer', 'பன்னீர்', 'cottage cheese'],
    category: 'dairy',
    defaultUnit: 'pack',
    marketRate: 95, // 200g
    photoUrl: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=500&auto=format&fit=crop&q=80',
    emoji: '🧀'
  },

  // --- STAPLES & GRAINS ---
  {
    name: 'Ponni Rice',
    tamilName: 'பொன்னி அரிசி',
    keywords: ['rice', 'arisi', 'அரிசி', 'பொன்னி அரிசி', 'புழுங்கல் அரிசி', 'பச்சரிசி', 'chawal'],
    category: 'staples',
    defaultUnit: 'kg',
    marketRate: 64,
    photoUrl: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=500&auto=format&fit=crop&q=80',
    emoji: '🍚'
  },
  {
    name: 'Basmati Rice',
    tamilName: 'பாசுமதி அரிசி',
    keywords: ['basmati', 'basmati rice', 'பாசுமதி அரிசி', 'பிரியாணி அரிசி'],
    category: 'staples',
    defaultUnit: 'kg',
    marketRate: 120,
    photoUrl: 'https://images.unsplash.com/photo-1536304993881-ff6e9eefa2a6?w=500&auto=format&fit=crop&q=80',
    emoji: '🌾'
  },
  {
    name: 'Toor Dal',
    tamilName: 'துவரம் பருப்பு',
    keywords: ['toor dal', 'thuvaram paruppu', 'துவரம் பருப்பு', 'சாம்பார் பருப்பு', 'dal'],
    category: 'staples',
    defaultUnit: 'kg',
    marketRate: 165,
    photoUrl: 'https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?w=500&auto=format&fit=crop&q=80',
    emoji: '🥣'
  },
  {
    name: 'Urad Dal',
    tamilName: 'உளுத்தம் பருப்பு',
    keywords: ['urad dal', 'ulutham paruppu', 'உளுத்தம் பருப்பு', 'இட்லி பருப்பு'],
    category: 'staples',
    defaultUnit: 'kg',
    marketRate: 140,
    photoUrl: 'https://images.unsplash.com/photo-1585032226651-759b368d7246?w=500&auto=format&fit=crop&q=80',
    emoji: '⚪'
  },
  {
    name: 'Moong Dal',
    tamilName: 'பாசிப்பருப்பு',
    keywords: ['moong dal', 'pasi paruppu', 'பாசிப்பருப்பு', 'பயத்தம் பருப்பு'],
    category: 'staples',
    defaultUnit: 'kg',
    marketRate: 130,
    photoUrl: 'https://images.unsplash.com/photo-1612773229711-6677f98e6921?w=500&auto=format&fit=crop&q=80',
    emoji: '🟡'
  },
  {
    name: 'Wheat Flour / Atta',
    tamilName: 'கோதுமை மாவு',
    keywords: ['atta', 'wheat', 'kothumai maavu', 'கோதுமை மாவு', 'ஆசீர்வாத் ஆட்டா', 'ashirvaad'],
    category: 'staples',
    defaultUnit: 'kg',
    marketRate: 52,
    photoUrl: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=500&auto=format&fit=crop&q=80',
    emoji: '🌾'
  },
  {
    name: 'Cooking Oil',
    tamilName: 'சமையல் எண்ணெய்',
    keywords: ['oil', 'ennai', 'எண்ணெய்', 'கடலை எண்ணெய்', 'நல்லெண்ணெய்', 'cooking oil', 'groundnut oil', 'sunflower oil', 'tel'],
    category: 'staples',
    defaultUnit: 'L',
    marketRate: 185,
    photoUrl: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=500&auto=format&fit=crop&q=80',
    emoji: '🫗'
  },
  {
    name: 'Sugar',
    tamilName: 'சர்க்கரை',
    keywords: ['sugar', 'sarkarai', 'சர்க்கரை', 'சீனி', 'chini'],
    category: 'staples',
    defaultUnit: 'kg',
    marketRate: 44,
    photoUrl: 'https://images.unsplash.com/photo-1622484214470-3d778ff9d71c?w=500&auto=format&fit=crop&q=80',
    emoji: '🧂'
  },
  {
    name: 'Salt',
    tamilName: 'உப்பு',
    keywords: ['salt', 'uppu', 'உப்பு', 'தூள் உப்பு', 'கல் உப்பு', 'tata salt'],
    category: 'staples',
    defaultUnit: 'pack',
    marketRate: 24,
    photoUrl: 'https://images.unsplash.com/photo-1518110925495-5fe2fda0442c?w=500&auto=format&fit=crop&q=80',
    emoji: '🧂'
  },
  {
    name: 'Tea Powder',
    tamilName: 'தேயிலை தூள்',
    keywords: ['tea', 'theylei', 'தேயிலை', 'சாய் தூள்', '3 roses', 'taj mahal tea'],
    category: 'snacks',
    defaultUnit: 'pack',
    marketRate: 135,
    photoUrl: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=500&auto=format&fit=crop&q=80',
    emoji: '🍵'
  },
  {
    name: 'Filter Coffee Powder',
    tamilName: 'காபி தூள்',
    keywords: ['coffee', 'kaapi', 'காபி தூள்', 'filter coffee', 'narasus', 'cothas'],
    category: 'snacks',
    defaultUnit: 'pack',
    marketRate: 160,
    photoUrl: 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=500&auto=format&fit=crop&q=80',
    emoji: '☕'
  },
  {
    name: 'Bread',
    tamilName: 'பிரெட்',
    keywords: ['bread', 'ரொட்டி', 'பிரெட்', 'modern bread', 'wheat bread'],
    category: 'bakery',
    defaultUnit: 'pack',
    marketRate: 45,
    photoUrl: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=500&auto=format&fit=crop&q=80',
    emoji: '🍞'
  }
];

// Smart Match Function
// Given any typed text (in Tamil, English, or Tanglish), finds the best matching item
export function findGroceryMatch(inputText) {
  if (!inputText || !inputText.trim()) return null;

  const query = inputText.toLowerCase().trim();

  // 1. Exact match on name or tamilName
  let match = GROCERY_DICTIONARY.find(item => 
    item.name.toLowerCase() === query || 
    item.tamilName.toLowerCase() === query
  );
  if (match) return match;

  // 2. Keyword exact match
  match = GROCERY_DICTIONARY.find(item => 
    item.keywords.some(k => k.toLowerCase() === query)
  );
  if (match) return match;

  // 3. Prefix startsWith match
  match = GROCERY_DICTIONARY.find(item => 
    item.name.toLowerCase().startsWith(query) ||
    item.tamilName.toLowerCase().startsWith(query) ||
    item.keywords.some(k => k.toLowerCase().startsWith(query))
  );
  if (match) return match;

  // 4. Substring contains match
  match = GROCERY_DICTIONARY.find(item => 
    item.name.toLowerCase().includes(query) ||
    item.tamilName.toLowerCase().includes(query) ||
    item.keywords.some(k => k.toLowerCase().includes(query))
  );
  if (match) return match;

  return null;
}

// Get Suggestions (multiple matches as user types)
export function getGrocerySuggestions(inputText, limit = 5) {
  if (!inputText || !inputText.trim() || inputText.length < 1) return [];

  const query = inputText.toLowerCase().trim();
  const results = [];

  for (const item of GROCERY_DICTIONARY) {
    if (
      item.name.toLowerCase().includes(query) ||
      item.tamilName.toLowerCase().includes(query) ||
      item.keywords.some(k => k.toLowerCase().includes(query))
    ) {
      results.push(item);
      if (results.length >= limit) break;
    }
  }

  return results;
}

// Smart Category Detector based on keywords, English & Tamil names
export function detectCategory(inputText) {
  if (!inputText || !inputText.trim()) return 'vegetables';
  const t = inputText.toLowerCase().trim();

  // 1. Medicines & Healthcare
  if (/dolo|paracetamol|tablet|syrup|capsule|pill|medicine|tonic|drops|ointment|balm|vicks|moov|volini|bandaid|bandage|cotton|inhaler|crocin|calpol|azithromycin|cetirizine|cough|fever|pain|injection|strip|மருந்து|மாத்திரை|தைலம்|இருமல்|காய்ச்சல்|சளி|பேன்ட்-எய்ட்/i.test(t)) {
    return 'medicines';
  }

  // 2. Fruits
  if (/apple|banana|orange|grape|mango|papaya|pomegranate|watermelon|pineapple|guava|strawberry|lemon|lime|mosambi|berry|kiwi|chikoo|sapota|fig|dates|plum|peach|pear|cherries|muskmelon|avocado|custard|பழம்|ஆப்பிள்|வாழைப்பழம்|மாம்பழம்|திராட்சை|மாதுளை|பப்பாளி|எலுமிச்சை|அன்னாசி/i.test(t)) {
    return 'fruits';
  }

  // 3. Dairy & Eggs
  if (/milk|curd|yogurt|paneer|cheese|butter|ghee|egg|eggs|muttai|cream|buttermilk|lassi|aavin|hatsun|pal|paal|பால்|முட்டை|தயிர்|பன்னீர்|வெண்ணெய்|நெய்/i.test(t)) {
    return 'dairy';
  }

  // 4. Staples & Grains
  if (/rice|wheat|atta|flour|maida|rava|sooji|dal|dhal|gram|paruppu|oil|sunflower|groundnut|gingelly|sugar|salt|jaggery|chilli powder|turmeric|coriander powder|pepper|jeera|cumin|mustard|fenugreek|cardamom|clove|cinnamon|asam|asafoetida|perungayam|tamarind|puli|kadalai|ulunthu|pasi|payiru|dalia|அரிசி|கோதுமை|மாவு|பருப்பு|எண்ணெய்|சர்க்கரை|உப்பு|வெல்லம்|மஞ்சள்|மிளகாய் தூள்|சீரகம்|கடுகு|புளி|கடலை/i.test(t)) {
    return 'staples';
  }

  // 5. Bakery
  if (/bread|bun|pav|toast|cake|rusk|pastry|croissant|muffin|bake|பிரெட்|ரொட்டி|கேக்|பன்/i.test(t)) {
    return 'bakery';
  }

  // 6. Snacks & Drinks
  if (/tea|coffee|biscuit|cookie|chips|mixture|murukku|chocolate|sweet|noodles|maggi|pasta|oats|cornflakes|juice|soda|snack|drink|badam|cashew|almond|nut|walnut|pista|காபி|தேயிலை|பிஸ்கட்|நூடுல்ஸ்|சிப்ஸ்/i.test(t)) {
    return 'snacks';
  }

  // 7. Vegetables
  if (/tomato|onion|potato|carrot|bean|beetroot|cabbage|cauliflower|spinach|keerai|mushroom|brinjal|eggplant|ladysfinger|okra|vendakkai|ginger|garlic|chilli|capsicum|cucumber|radish|peas|corn|gourd|coriander|mint|curry leaves|onion|shallot|drumstick|murungakkai|broccoli|vazhaikkai|kothavarai|தக்காளி|வெங்காயம்|உருளை|கேரட்|வெண்டைக்காய்|கத்தரிக்காய்|பீன்ஸ்|முட்டைக்கோஸ்|கீரை|இஞ்சி|பூண்டு|மிளகாய்|கொத்தமல்லி|புதினா|முருங்கை/i.test(t)) {
    return 'vegetables';
  }

  return 'other';
}
