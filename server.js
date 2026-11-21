#!/usr/bin/env node
import express from 'express';
import http from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import os from 'os';
import QRCode from 'qrcode';
import pg from 'pg';

const { Pool } = pg;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ server });

app.use(cors());
app.use(express.json({ limit: '15mb' }));

// Ensure data directory exists
const DATA_DIR = path.join(__dirname, 'data');
const DB_PATH = path.join(DATA_DIR, 'db.json');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// PostgreSQL Connection
const DATABASE_URL = process.env.DATABASE_URL || 'postgresql://smart_grocery_db_6dmi_user:q36IlpZdzqehfEfmIxeUxa6cKWTLMnxB@dpg-dc0hmuc0916s73bp6j0g-a/smart_grocery_db_6dmi';

let pool = null;
let usePostgres = false;

if (DATABASE_URL) {
  pool = new Pool({
    connectionString: DATABASE_URL,
    ssl: DATABASE_URL.includes('dpg-') && !DATABASE_URL.includes('.render.com') ? false : { rejectUnauthorized: false }
  });
}

// Initial sample groceries for new households
const DEFAULT_GROCERIES = [
  {
    id: 'item-1',
    name: 'Tomato',
    tamilName: 'தக்காளி',
    category: 'vegetables',
    quantity: '1',
    unit: 'kg',
    price: 40,
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
    price: 60,
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

// Initialize PostgreSQL Tables
async function initDB() {
  if (!pool) return;
  try {
    const client = await pool.connect();
    try {
      await client.query(`
        CREATE TABLE IF NOT EXISTS households (
          id TEXT PRIMARY KEY,
          code TEXT UNIQUE NOT NULL,
          name TEXT NOT NULL,
          items JSONB NOT NULL DEFAULT '[]'::jsonb,
          deleted_backup JSONB NOT NULL DEFAULT '[]'::jsonb,
          created_at TIMESTAMPTZ DEFAULT NOW()
        );

        CREATE TABLE IF NOT EXISTS users (
          id TEXT PRIMARY KEY,
          username TEXT UNIQUE NOT NULL,
          password TEXT NOT NULL,
          name TEXT NOT NULL,
          household_id TEXT NOT NULL REFERENCES households(id) ON DELETE CASCADE,
          created_at TIMESTAMPTZ DEFAULT NOW()
        );
      `);
      usePostgres = true;
      console.log('✅ PostgreSQL connected & tables verified!');
    } finally {
      client.release();
    }
  } catch (err) {
    console.warn('⚠️ Could not connect to PostgreSQL (using local JSON DB):', err.message);
    usePostgres = false;
  }
}

// Fallback JSON File Database
function loadDB() {
  if (fs.existsSync(DB_PATH)) {
    try {
      const data = fs.readFileSync(DB_PATH, 'utf8');
      return JSON.parse(data);
    } catch (err) {
      console.error('Error reading db.json, creating initial', err);
    }
  }

  const initialData = {
    users: [],
    households: [
      {
        id: 'hh-sync-101',
        code: 'SYNC-101',
        name: 'நமது குடும்பம் (Our Family)',
        items: DEFAULT_GROCERIES,
        deletedBackup: [],
        createdAt: new Date().toISOString()
      }
    ]
  };

  saveDB(initialData);
  return initialData;
}

function saveDB(dbData) {
  try {
    fs.writeFileSync(DB_PATH, JSON.stringify(dbData, null, 2), 'utf8');
  } catch (err) {
    console.error('Failed to save db.json', err);
  }
}

// Unified Database Helpers
async function dbFindUser(username) {
  const clean = username.trim().toLowerCase();
  if (usePostgres) {
    const res = await pool.query('SELECT * FROM users WHERE LOWER(username) = $1', [clean]);
    if (res.rows.length === 0) return null;
    const row = res.rows[0];
    return { id: row.id, username: row.username, password: row.password, name: row.name, householdId: row.household_id };
  }
  const dbData = loadDB();
  return dbData.users.find(u => u.username.toLowerCase() === clean) || null;
}

async function dbFindUserForLogin(username, password) {
  const clean = username.trim().toLowerCase();
  if (usePostgres) {
    const res = await pool.query('SELECT * FROM users WHERE LOWER(username) = $1 AND password = $2', [clean, password]);
    if (res.rows.length === 0) return null;
    const row = res.rows[0];
    return { id: row.id, username: row.username, password: row.password, name: row.name, householdId: row.household_id };
  }
  const dbData = loadDB();
  return dbData.users.find(u => u.username.toLowerCase() === clean && u.password === password) || null;
}

async function dbCreateUser(user) {
  if (usePostgres) {
    await pool.query(
      'INSERT INTO users (id, username, password, name, household_id) VALUES ($1, $2, $3, $4, $5)',
      [user.id, user.username.toLowerCase(), user.password, user.name, user.householdId]
    );
    return;
  }
  const dbData = loadDB();
  dbData.users.push(user);
  saveDB(dbData);
}

async function dbUpdateUserPassword(username, newPassword) {
  const clean = username.trim().toLowerCase();
  if (usePostgres) {
    const res = await pool.query('UPDATE users SET password = $2 WHERE LOWER(username) = $1 RETURNING *', [clean, newPassword]);
    return res.rows.length > 0;
  }
  const dbData = loadDB();
  const idx = dbData.users.findIndex(u => u.username.toLowerCase() === clean);
  if (idx === -1) return false;
  dbData.users[idx].password = newPassword;
  saveDB(dbData);
  return true;
}

async function dbUpdateUserHousehold(userId, householdId) {
  if (usePostgres) {
    await pool.query('UPDATE users SET household_id = $2 WHERE id = $1', [userId, householdId]);
    return;
  }
  const dbData = loadDB();
  const user = dbData.users.find(u => u.id === userId);
  if (user) {
    user.householdId = householdId;
    saveDB(dbData);
  }
}

async function dbFindHouseholdById(id) {
  if (usePostgres) {
    const res = await pool.query('SELECT * FROM households WHERE id = $1', [id]);
    if (res.rows.length === 0) return null;
    const row = res.rows[0];
    return { id: row.id, code: row.code, name: row.name, items: row.items || [], deletedBackup: row.deleted_backup || [] };
  }
  const dbData = loadDB();
  return dbData.households.find(h => h.id === id) || null;
}

async function dbFindHouseholdByCode(code) {
  const clean = code.trim().toUpperCase();
  if (usePostgres) {
    const res = await pool.query('SELECT * FROM households WHERE UPPER(code) = $1', [clean]);
    if (res.rows.length === 0) return null;
    const row = res.rows[0];
    return { id: row.id, code: row.code, name: row.name, items: row.items || [], deletedBackup: row.deleted_backup || [] };
  }
  const dbData = loadDB();
  return dbData.households.find(h => h.code.toUpperCase() === clean) || null;
}

async function dbCreateHousehold(household) {
  if (usePostgres) {
    await pool.query(
      'INSERT INTO households (id, code, name, items, deleted_backup) VALUES ($1, $2, $3, $4, $5)',
      [household.id, household.code, household.name, JSON.stringify(household.items || []), JSON.stringify(household.deletedBackup || [])]
    );
    return;
  }
  const dbData = loadDB();
  dbData.households.push(household);
  saveDB(dbData);
}

async function dbSaveHouseholdItems(householdId, items, deletedBackup = null) {
  if (usePostgres) {
    if (deletedBackup !== null) {
      await pool.query(
        'UPDATE households SET items = $2, deleted_backup = $3 WHERE id = $1',
        [householdId, JSON.stringify(items), JSON.stringify(deletedBackup)]
      );
    } else {
      await pool.query(
        'UPDATE households SET items = $2 WHERE id = $1',
        [householdId, JSON.stringify(items)]
      );
    }
    return;
  }
  const dbData = loadDB();
  const household = dbData.households.find(h => h.id === householdId);
  if (household) {
    household.items = items;
    if (deletedBackup !== null) household.deletedBackup = deletedBackup;
    saveDB(dbData);
  }
}

// Helper to get local Wi-Fi IP address
function getLocalIP() {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address;
      }
    }
  }
  return 'localhost';
}

// Helper to generate unique 6-character Family Sync Code
function generateHouseholdCode(familyName = 'FAMILY') {
  const prefix = familyName.substring(0, 3).toUpperCase().replace(/[^A-Z]/g, '') || 'FAM';
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  return `${prefix}-${randomSuffix}`;
}

// Connected WebSocket Clients grouped by householdId
const roomClients = new Map();

// Helper to broadcast event to all devices in a household
function broadcastToHousehold(householdId, messageObj) {
  const clients = roomClients.get(householdId);
  if (!clients || clients.size === 0) return;

  const payload = JSON.stringify(messageObj);
  clients.forEach(client => {
    if (client.ws.readyState === WebSocket.OPEN) {
      client.ws.send(payload);
    }
  });
}

// WebSocket handler
wss.on('connection', (ws) => {
  let clientInfo = null;

  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message);

      if (data.type === 'JOIN_HOUSEHOLD') {
        const { householdId, userId, name, deviceName } = data;
        clientInfo = {
          ws,
          householdId,
          userId,
          name: name || 'Family Member',
          deviceName: deviceName || 'Mobile Device',
          joinedAt: new Date().toISOString()
        };

        if (!roomClients.has(householdId)) {
          roomClients.set(householdId, new Set());
        }
        roomClients.get(householdId).add(clientInfo);

        // Notify client of successful join
        ws.send(JSON.stringify({
          type: 'JOINED_SUCCESS',
          householdId,
          connectedCount: roomClients.get(householdId).size
        }));

        // Broadcast peer update to everyone in this household
        const activePeers = Array.from(roomClients.get(householdId)).map(c => ({
          userId: c.userId,
          name: c.name,
          deviceName: c.deviceName
        }));

        broadcastToHousehold(householdId, {
          type: 'PEERS_UPDATED',
          peers: activePeers
        });
      }
    } catch (err) {
      console.error('WebSocket message parsing error', err);
    }
  });

  ws.on('close', () => {
    if (clientInfo && roomClients.has(clientInfo.householdId)) {
      const householdSet = roomClients.get(clientInfo.householdId);
      householdSet.delete(clientInfo);

      if (householdSet.size === 0) {
        roomClients.delete(clientInfo.householdId);
      } else {
        const activePeers = Array.from(householdSet).map(c => ({
          userId: c.userId,
          name: c.name,
          deviceName: c.deviceName
        }));

        broadcastToHousehold(clientInfo.householdId, {
          type: 'PEERS_UPDATED',
          peers: activePeers
        });
      }
    }
  });
});

// Serve frontend static assets in production
const DIST_PATH = path.join(__dirname, 'dist');
if (fs.existsSync(DIST_PATH)) {
  app.use(express.static(DIST_PATH));
}

// -------------------------------------------------------------
// REST API ENDPOINTS
// -------------------------------------------------------------

// 1. Get Network & Sync Pairing Info
app.get('/api/network-info', async (req, res) => {
  const ip = getLocalIP();
  const port = process.env.PORT || 5000;
  const vitePort = 5173;
  const mobileUrl = `http://${ip}:${vitePort}/`;

  try {
    const qrDataUrl = await QRCode.toDataURL(mobileUrl, {
      width: 250,
      margin: 2,
      color: {
        dark: '#059669',
        light: '#ffffff'
      }
    });

    res.json({
      ip,
      port: 5000,
      vitePort,
      mobileUrl,
      qrDataUrl
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to generate QR code' });
  }
});

// Tamil Nadu Daily Market Rates Database
const MARKET_PRICES = {
  'Tomato': { currentPrice: 38, prevPrice: 45, unit: 'kg', trend: 'down', change: '-15%', market: 'Koyambedu / உழவர் சந்தை' },
  'Onion': { currentPrice: 55, prevPrice: 50, unit: 'kg', trend: 'up', change: '+10%', market: 'Koyambedu / உழவர் சந்தை' },
  'Potato': { currentPrice: 32, prevPrice: 35, unit: 'kg', trend: 'down', change: '-8%', market: 'Dindigul Market' },
  'Carrot': { currentPrice: 50, prevPrice: 55, unit: 'kg', trend: 'down', change: '-9%', market: 'Ooty / Kodaikanal' },
  'Ladies Finger': { currentPrice: 40, prevPrice: 35, unit: 'kg', trend: 'up', change: '+14%', market: 'Local Uzhavar Sandhai' },
  'Brinjal': { currentPrice: 35, prevPrice: 35, unit: 'kg', trend: 'stable', change: '0%', market: 'Local Market' },
  'Cabbage': { currentPrice: 25, prevPrice: 28, unit: 'kg', trend: 'down', change: '-10%', market: 'Local Market' },
  'Green Chilli': { currentPrice: 70, prevPrice: 60, unit: 'kg', trend: 'up', change: '+16%', market: 'Koyambedu Wholesale' },
  'Ginger': { currentPrice: 120, prevPrice: 140, unit: 'kg', trend: 'down', change: '-14%', market: 'Kerala / Wholesale' },
  'Garlic': { currentPrice: 240, prevPrice: 280, unit: 'kg', trend: 'down', change: '-14%', market: 'Madhya Pradesh Imports' },
  'Coriander': { currentPrice: 15, prevPrice: 20, unit: 'bunch', trend: 'down', change: '-25%', market: 'Local Market' },
  'Curry Leaves': { currentPrice: 10, prevPrice: 10, unit: 'bunch', trend: 'stable', change: '0%', market: 'Local Market' },
  'Fresh Milk': { currentPrice: 28, prevPrice: 28, unit: 'L', trend: 'stable', change: '0%', market: 'Aavin Official MRP' },
  'Curd': { currentPrice: 35, prevPrice: 35, unit: 'pkt', trend: 'stable', change: '0%', market: 'Aavin / Hatsun' },
  'Paneer': { currentPrice: 95, prevPrice: 95, unit: 'pkt', trend: 'stable', change: '0%', market: 'Dairy MRP' },
  'Eggs': { currentPrice: 6, prevPrice: 6.5, unit: 'piece', trend: 'down', change: '-7%', market: 'Namakkal NECC Daily Rate' },
  'Apples': { currentPrice: 160, prevPrice: 180, unit: 'kg', trend: 'down', change: '-11%', market: 'Shimla / Kashmir' },
  'Banana': { currentPrice: 45, prevPrice: 40, unit: 'dozen', trend: 'up', change: '+12%', market: 'Theni Market' },
  'Ponni Boiled Rice': { currentPrice: 60, prevPrice: 58, unit: 'kg', trend: 'stable', change: '+3%', market: 'Manachanallur Mill Rate' },
  'Toor Dal': { currentPrice: 165, prevPrice: 175, unit: 'kg', trend: 'down', change: '-5%', market: 'Wholesale Mandi' },
  'Sunflower Oil': { currentPrice: 135, prevPrice: 140, unit: 'L', trend: 'down', change: '-3%', market: 'Refined Oil Rate' },
  'Dolo 650': { currentPrice: 32, prevPrice: 32, unit: 'strip', trend: 'stable', change: '0%', market: 'Standard Pharmacy MRP' },
  'Vicks Vaporub': { currentPrice: 55, prevPrice: 55, unit: 'bottle', trend: 'stable', change: '0%', market: 'Pharmacy MRP' },
  'vegetables': { currentPrice: 45, prevPrice: 45, unit: 'kg', trend: 'stable', change: '0%', market: 'General Market' },
  'medicines': { currentPrice: 40, prevPrice: 40, unit: 'pkt', trend: 'stable', change: '0%', market: 'Pharmacy MRP' },
  'fruits': { currentPrice: 80, prevPrice: 80, unit: 'kg', trend: 'stable', change: '0%', market: 'Daily Fruit Market' },
  'staples': { currentPrice: 90, prevPrice: 90, unit: 'kg', trend: 'stable', change: '0%', market: 'Grocery Wholesale' },
  'dairy': { currentPrice: 30, prevPrice: 30, unit: 'L', trend: 'stable', change: '0%', market: 'Dairy Standard' }
};

// Auto-suggest live market price
app.get('/api/market-price', (req, res) => {
  const query = (req.query.q || req.query.query || '').trim();
  const category = (req.query.category || '').toLowerCase();

  let matched = null;
  for (const [key, val] of Object.entries(MARKET_PRICES)) {
    if (key.toLowerCase() === query.toLowerCase()) {
      matched = { name: key, ...val };
      break;
    }
  }

  if (!matched && query) {
    for (const [key, val] of Object.entries(MARKET_PRICES)) {
      if (query.toLowerCase().includes(key.toLowerCase()) || key.toLowerCase().includes(query.toLowerCase())) {
        matched = { name: key, ...val };
        break;
      }
    }
  }

  if (!matched && category && MARKET_PRICES[category]) {
    matched = { name: category, ...MARKET_PRICES[category] };
  }

  if (matched) {
    res.json({ found: true, rate: matched.currentPrice, ...matched, lastUpdated: new Date().toISOString() });
  } else {
    res.json({ found: false, rate: null, currentPrice: null });
  }
});

// Smart Auto-Fetch Endpoint: Internet Photo, Auto-Category, & Daily Live Rate
app.get('/api/groceries/auto-fetch-info', async (req, res) => {
  const query = (req.query.q || '').trim();
  if (!query) {
    return res.status(400).json({ error: 'Query q is required' });
  }

  // 1. Auto-detect category based on Tamil / English keywords
  let category = 'vegetables';
  const qLower = query.toLowerCase();
  if (/dolo|paracetamol|tablet|syrup|capsule|pill|medicine|tonic|drops|ointment|balm|vicks|moov|volini|bandaid|bandage|cotton|inhaler|crocin|calpol|azithromycin|cetirizine|cough|fever|pain|injection|strip|மருந்து|மாத்திரை|தைலம்|இருமல்|காய்ச்சல்|சளி/i.test(qLower)) {
    category = 'medicines';
  } else if (/apple|banana|orange|grape|mango|papaya|pomegranate|watermelon|pineapple|guava|strawberry|lemon|lime|mosambi|berry|kiwi|chikoo|sapota|fig|dates|plum|peach|pear|cherries|muskmelon|avocado|பழம்|ஆப்பிள்|வாழைப்பழம்|மாம்பழம்|திராட்சை|மாதுளை|பப்பாளி|எலுமிச்சை|அன்னாசி/i.test(qLower)) {
    category = 'fruits';
  } else if (/milk|curd|yogurt|paneer|cheese|butter|ghee|egg|eggs|muttai|cream|buttermilk|lassi|aavin|hatsun|pal|paal|பால்|முட்டை|தயிர்|பன்னீர்|வெண்ணெய்|நெய்/i.test(qLower)) {
    category = 'dairy';
  } else if (/rice|wheat|atta|flour|maida|rava|sooji|dal|dhal|gram|paruppu|oil|sunflower|groundnut|gingelly|sugar|salt|jaggery|chilli powder|turmeric|coriander powder|pepper|jeera|cumin|mustard|fenugreek|cardamom|clove|cinnamon|asam|asafoetida|perungayam|tamarind|puli|kadalai|ulunthu|அரிசி|கோதுமை|மாவு|பருப்பு|எண்ணெய்|சர்க்கரை|உப்பு|வெல்லம்|மஞ்சள்|மிளகாய் தூள்|சீரகம்|கடுகு|புளி|கடலை/i.test(qLower)) {
    category = 'staples';
  } else if (/bread|bun|pav|toast|cake|rusk|pastry|croissant|muffin|பிரெட்|ரொட்டி|கேக்|பன்/i.test(qLower)) {
    category = 'bakery';
  } else if (/tea|coffee|biscuit|cookie|chips|mixture|murukku|chocolate|sweet|noodles|maggi|pasta|oats|cornflakes|juice|soda|snack|drink|badam|cashew|almond|nut|walnut|pista|காபி|தேயிலை|பிஸ்கட்|நூடுல்ஸ்/i.test(qLower)) {
    category = 'snacks';
  } else if (/tomato|onion|potato|carrot|bean|beetroot|cabbage|cauliflower|spinach|keerai|mushroom|brinjal|eggplant|ladysfinger|okra|vendakkai|ginger|garlic|chilli|capsicum|cucumber|radish|peas|corn|gourd|coriander|mint|curry leaves|onion|shallot|drumstick|murungakkai|broccoli|தக்காளி|வெங்காயம்|உருளை|கேரட்|வெண்டைக்காய்|கத்தரிக்காய்|பீன்ஸ்|முட்டைக்கோஸ்|கீரை|இஞ்சி|பூண்டு|மிளகாய்/i.test(qLower)) {
    category = 'vegetables';
  }

  // 2. Daily fluctuating rate based on calendar day
  const dayOfMonth = new Date().getDate();
  const fluctuationPercent = ((dayOfMonth % 7) - 3); // -3% to +3% daily variation

  let matchedRate = null;
  let unit = 'kg';
  for (const [key, val] of Object.entries(MARKET_PRICES)) {
    if (key.toLowerCase() === qLower || qLower.includes(key.toLowerCase()) || key.toLowerCase().includes(qLower)) {
      matchedRate = val;
      break;
    }
  }

  let finalPrice = 45;
  if (matchedRate) {
    finalPrice = Math.max(1, Math.round(matchedRate.currentPrice * (1 + fluctuationPercent / 100)));
    unit = matchedRate.unit || 'kg';
    if (unit === 'pkt') unit = 'pack';
    if (unit === 'piece') unit = 'pcs';
  } else if (category === 'medicines') {
    finalPrice = 35 + (dayOfMonth % 20);
    unit = /syrup|liquid|drops/i.test(qLower) ? 'bottle' : (/ointment|balm|moov/i.test(qLower) ? 'tube' : 'strip');
  } else if (category === 'fruits') {
    finalPrice = 80 + (dayOfMonth % 40);
    unit = /banana/i.test(qLower) ? 'dozen' : (/watermelon|pineapple/i.test(qLower) ? 'pcs' : 'kg');
  } else if (category === 'dairy') {
    finalPrice = 30 + (dayOfMonth % 15);
    unit = /milk|பால்/i.test(qLower) ? 'L' : (/egg|முட்டை/i.test(qLower) ? 'pcs' : 'pack');
  } else if (category === 'staples') {
    finalPrice = 60 + (dayOfMonth % 50);
    unit = /oil|எண்ணெய்/i.test(qLower) ? 'L' : (/powder|turmeric|chilli powder|pepper|jeera/i.test(qLower) ? 'g' : 'kg');
  } else if (category === 'bakery') {
    finalPrice = 40 + (dayOfMonth % 10);
    unit = 'pack';
  } else if (category === 'snacks') {
    finalPrice = 50 + (dayOfMonth % 30);
    unit = 'pack';
  } else {
    finalPrice = 35 + (dayOfMonth % 25);
    unit = /keerai|coriander|mint|curry/i.test(qLower) ? 'bunch' : (/lemon|coconut/i.test(qLower) ? 'pcs' : 'kg');
  }

  // 3. Auto-fetch real photo from Internet (Wikipedia Summary API)
  let photoUrl = '';
  try {
    const wikiRes = await fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(query)}`, {
      headers: { 'User-Agent': 'SmartGroceryApp/2.0 (image-fetcher)' }
    });
    if (wikiRes.ok) {
      const wikiData = await wikiRes.json();
      if (wikiData.thumbnail && wikiData.thumbnail.source) {
        photoUrl = wikiData.thumbnail.source;
      }
    }
  } catch (err) {}

  // Curated Fallback Unsplash Photos
  if (!photoUrl) {
    const categoryUnsplashPhotos = {
      medicines: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=500&auto=format&fit=crop&q=80',
      vegetables: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=500&auto=format&fit=crop&q=80',
      fruits: 'https://images.unsplash.com/photo-1619566636858-adf3ef46400b?w=500&auto=format&fit=crop&q=80',
      dairy: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=500&auto=format&fit=crop&q=80',
      staples: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=500&auto=format&fit=crop&q=80',
      bakery: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=500&auto=format&fit=crop&q=80',
      snacks: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=500&auto=format&fit=crop&q=80',
      other: 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?w=500&auto=format&fit=crop&q=80'
    };
    photoUrl = categoryUnsplashPhotos[category] || categoryUnsplashPhotos.other;
  }

  const categoryEmojis = {
    medicines: '💊',
    vegetables: '🥬',
    fruits: '🍎',
    dairy: '🥛',
    staples: '🌾',
    bakery: '🍞',
    snacks: '☕',
    other: '📦'
  };

  res.json({
    found: true,
    query,
    category,
    emoji: categoryEmojis[category] || '🛒',
    rate: finalPrice,
    unit,
    photoUrl,
    lastUpdated: new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
  });
});

app.get('/api/groceries/live-rate/:name', (req, res) => {
  const query = (req.params.name || '').trim();
  let matched = null;
  for (const [key, val] of Object.entries(MARKET_PRICES)) {
    if (key.toLowerCase() === query.toLowerCase() || query.toLowerCase().includes(key.toLowerCase()) || key.toLowerCase().includes(query.toLowerCase())) {
      matched = { name: key, ...val };
      break;
    }
  }
  if (matched) {
    res.json({ found: true, rate: matched.currentPrice, ...matched, lastUpdated: new Date().toISOString() });
  } else {
    res.json({ found: false, rate: null });
  }
});

// Auto-Update All Items with Latest Market Rates
app.post('/api/groceries/:householdId/auto-update-rates', async (req, res) => {
  const { householdId } = req.params;
  const { senderUser } = req.body;

  const household = await dbFindHouseholdById(householdId);
  if (!household) return res.status(404).json({ error: 'Household not found' });

  let updatedCount = 0;
  household.items.forEach(item => {
    const market = MARKET_PRICES[item.name] || MARKET_PRICES[item.category];
    if (market && item.price !== market.currentPrice) {
      item.price = market.currentPrice;
      item.lastPriceUpdate = new Date().toISOString();
      updatedCount++;
    }
  });

  if (updatedCount > 0) {
    await dbSaveHouseholdItems(householdId, household.items);
  }

  broadcastToHousehold(householdId, {
    type: 'RATES_UPDATED',
    items: household.items,
    updatedCount,
    sender: senderUser?.name || 'A family member'
  });

  res.json({ success: true, updatedCount, items: household.items });
});

// 2. User Registration (பதிவு செய்க)
app.post('/api/auth/register', async (req, res) => {
  const { username, password, name, householdChoice, existingCode, newHouseholdName } = req.body;

  if (!username || !password || !name) {
    return res.status(400).json({ error: 'Name, Username, and Password are required' });
  }

  const cleanUsername = username.trim().toLowerCase();

  // Check if username already exists
  const existingUser = await dbFindUser(cleanUsername);
  if (existingUser) {
    return res.status(400).json({ error: 'Username already taken. Please choose another or login.' });
  }

  let targetHousehold = null;

  if (householdChoice === 'join' && existingCode) {
    const codeClean = existingCode.trim().toUpperCase();
    targetHousehold = await dbFindHouseholdByCode(codeClean);
    if (!targetHousehold) {
      return res.status(404).json({ error: `Household sync code "${existingCode}" not found. Please verify the code from mobile 1.` });
    }
  } else {
    // Create new Household
    const hName = (newHouseholdName && newHouseholdName.trim()) || `${name}'s Family`;
    const hCode = generateHouseholdCode(hName);
    targetHousehold = {
      id: `hh-${Date.now()}`,
      code: hCode,
      name: hName,
      items: DEFAULT_GROCERIES,
      deletedBackup: []
    };
    await dbCreateHousehold(targetHousehold);
  }

  const newUser = {
    id: `usr-${Date.now()}`,
    username: cleanUsername,
    password,
    name: name.trim(),
    householdId: targetHousehold.id
  };

  await dbCreateUser(newUser);

  // If joined an existing household, broadcast live alert to other members!
  if (householdChoice === 'join' && targetHousehold) {
    broadcastToHousehold(targetHousehold.id, {
      type: 'MEMBER_JOINED',
      memberName: newUser.name,
      familyName: targetHousehold.name
    });
  }

  res.json({
    user: {
      id: newUser.id,
      name: newUser.name,
      username: newUser.username,
      householdId: newUser.householdId
    },
    household: {
      id: targetHousehold.id,
      code: targetHousehold.code,
      name: targetHousehold.name
    },
    items: targetHousehold.items
  });
});

// 3. User Login (உள்நுழைக)
app.post('/api/auth/login', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password required' });
  }

  const user = await dbFindUserForLogin(username, password);
  if (!user) {
    return res.status(401).json({ error: 'Invalid username or password' });
  }

  const household = await dbFindHouseholdById(user.householdId);

  res.json({
    user: {
      id: user.id,
      name: user.name,
      username: user.username,
      householdId: user.householdId
    },
    household: household ? {
      id: household.id,
      code: household.code,
      name: household.name
    } : {
      id: 'hh-sync-101',
      code: 'SYNC-101',
      name: 'Our Family'
    },
    items: household ? (household.items || []) : DEFAULT_GROCERIES
  });
});

// 3b. Forgot / Reset Password (கடவுச்சொல் மீட்டெடு)
app.post('/api/auth/forgot-password', async (req, res) => {
  const { username, newPassword } = req.body;

  if (!username || !newPassword) {
    return res.status(400).json({ error: 'Username/Mobile and new password are required' });
  }

  const updated = await dbUpdateUserPassword(username, newPassword);
  if (!updated) {
    return res.status(404).json({
      error: 'பயனர் பெயர் அல்லது மொபைல் எண் பதிவு செய்யப்படவில்லை (User not found)'
    });
  }

  res.json({
    success: true,
    message: 'கடவுச்சொல் வெற்றிகரமாக மாற்றப்பட்டது (Password reset successfully)'
  });
});

// 4. Join / Switch Household using Sync Code
app.post('/api/auth/join-household', async (req, res) => {
  const { userId, code } = req.body;
  if (!code) {
    return res.status(400).json({ error: 'Sync code is required' });
  }

  const household = await dbFindHouseholdByCode(code);
  if (!household) {
    return res.status(404).json({ error: `Sync code "${code}" not found. Check the code on the first mobile.` });
  }

  if (userId) {
    await dbUpdateUserHousehold(userId, household.id);
  }

  res.json({
    household: {
      id: household.id,
      code: household.code,
      name: household.name
    },
    items: household.items || []
  });
});

// 5. Get Groceries for Household
app.get('/api/groceries/:householdId', async (req, res) => {
  const household = await dbFindHouseholdById(req.params.householdId);
  if (!household) {
    return res.status(404).json({ error: 'Household not found' });
  }
  res.json({
    household: {
      id: household.id,
      code: household.code,
      name: household.name
    },
    items: household.items || []
  });
});

// 6. Add / Update Grocery Item (Syncs to all mobiles)
app.post('/api/groceries/:householdId', async (req, res) => {
  const { householdId } = req.params;
  const { item, senderUser, deviceName } = req.body;

  const household = await dbFindHouseholdById(householdId);
  if (!household) return res.status(404).json({ error: 'Household not found' });

  const existingIndex = household.items.findIndex(i => i.id === item.id);
  if (existingIndex >= 0) {
    household.items[existingIndex] = item;
  } else {
    household.items.unshift(item);
  }

  await dbSaveHouseholdItems(householdId, household.items);

  broadcastToHousehold(householdId, {
    type: 'ITEM_UPDATED',
    action: existingIndex >= 0 ? 'UPDATE' : 'ADD',
    item,
    items: household.items,
    sender: senderUser?.name || 'A family member',
    deviceName: deviceName || 'Mobile'
  });

  res.json({ success: true, items: household.items });
});

// 7. Toggle Item Purchase Checkbox (Syncs in real-time)
app.post('/api/groceries/:householdId/toggle', async (req, res) => {
  const { householdId } = req.params;
  const { itemId, senderUser, deviceName } = req.body;

  const household = await dbFindHouseholdById(householdId);
  if (!household) return res.status(404).json({ error: 'Household not found' });

  const target = household.items.find(i => i.id === itemId);
  if (!target) return res.status(404).json({ error: 'Item not found' });

  target.purchased = !target.purchased;
  target.purchasedAt = target.purchased ? new Date().toISOString() : null;

  await dbSaveHouseholdItems(householdId, household.items);

  broadcastToHousehold(householdId, {
    type: 'ITEM_TOGGLED',
    itemId,
    purchased: target.purchased,
    itemName: target.tamilName || target.name,
    items: household.items,
    sender: senderUser?.name || 'A family member',
    deviceName: deviceName || 'Mobile'
  });

  res.json({ success: true, items: household.items });
});

// 8. Delete Purchased Items (Syncs in real-time across both phones)
app.post('/api/groceries/:householdId/delete-purchased', async (req, res) => {
  const { householdId } = req.params;
  const { senderUser, deviceName } = req.body;

  const household = await dbFindHouseholdById(householdId);
  if (!household) return res.status(404).json({ error: 'Household not found' });

  const purchased = household.items.filter(i => i.purchased);
  const remaining = household.items.filter(i => !i.purchased);

  await dbSaveHouseholdItems(householdId, remaining, purchased);

  broadcastToHousehold(householdId, {
    type: 'PURCHASED_DELETED',
    count: purchased.length,
    items: remaining,
    sender: senderUser?.name || 'A family member',
    deviceName: deviceName || 'Mobile'
  });

  res.json({ success: true, count: purchased.length, items: remaining });
});

// 9. Delete Single Item
app.delete('/api/groceries/:householdId/:itemId', async (req, res) => {
  const { householdId, itemId } = req.params;
  const { senderName, deviceName } = req.query;

  const household = await dbFindHouseholdById(householdId);
  if (!household) return res.status(404).json({ error: 'Household not found' });

  const target = household.items.find(i => i.id === itemId);
  const remaining = household.items.filter(i => i.id !== itemId);
  const deletedBackup = target ? [target] : [];

  await dbSaveHouseholdItems(householdId, remaining, deletedBackup);

  broadcastToHousehold(householdId, {
    type: 'ITEM_DELETED',
    itemId,
    itemName: target?.tamilName || target?.name || 'Item',
    items: remaining,
    sender: senderName || 'A family member',
    deviceName: deviceName || 'Mobile'
  });

  res.json({ success: true, items: remaining });
});

// 10. Undo Delete
app.post('/api/groceries/:householdId/undo', async (req, res) => {
  const { householdId } = req.params;

  const household = await dbFindHouseholdById(householdId);
  if (!household || !household.deletedBackup || household.deletedBackup.length === 0) {
    return res.status(400).json({ error: 'No items to restore' });
  }

  const restored = [...household.items, ...household.deletedBackup];
  await dbSaveHouseholdItems(householdId, restored, []);

  broadcastToHousehold(householdId, {
    type: 'ITEMS_RESTORED',
    items: restored
  });

  res.json({ success: true, items: restored });
});

// SPA Fallback: serve index.html for any other non-API routes
app.use((req, res, next) => {
  if (req.path.startsWith('/api') || req.path.startsWith('/ws')) return next();
  const indexHtml = path.join(DIST_PATH, 'index.html');
  if (fs.existsSync(indexHtml)) {
    return res.sendFile(indexHtml);
  }
  res.status(404).send('Not Found');
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, '0.0.0.0', async () => {
  await initDB();
  const ip = getLocalIP();
  console.log(`=======================================================`);
  console.log(`🚀 Grocery Sync Server running on:`);
  console.log(`   - Local:    http://localhost:${PORT}`);
  console.log(`   - Network:  http://${ip}:${PORT}`);
  console.log(`   - WebSocket Live Sync active`);
  console.log(`=======================================================`);
});
