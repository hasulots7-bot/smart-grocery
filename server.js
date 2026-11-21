import express from 'express';
import http from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import os from 'os';
import QRCode from 'qrcode';

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

// Load Database
function loadDB() {
  if (fs.existsSync(DB_PATH)) {
    try {
      const data = fs.readFileSync(DB_PATH, 'utf8');
      return JSON.parse(data);
    } catch (err) {
      console.error('Error reading db.json, creating initial', err);
    }
  }

  // Initial Seed
  const initialData = {
    users: [
      {
        id: 'usr-1',
        username: 'appa',
        password: '123',
        name: 'அப்பா (Appa)',
        householdId: 'hh-sync-101',
        createdAt: new Date().toISOString()
      },
      {
        id: 'usr-2',
        username: 'amma',
        password: '123',
        name: 'அம்மா (Amma)',
        householdId: 'hh-sync-101',
        createdAt: new Date().toISOString()
      }
    ],
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

let db = loadDB();

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

// Generate clean 6-7 character Household Sync Code (e.g. FAM-4821 or APPA-7215)
function generateHouseholdCode(name = 'HOME') {
  const letters = name.replace(/[^A-Za-z0-9]/g, '').slice(0, 4).toUpperCase();
  const prefix = letters && letters.length >= 2 ? letters : 'FAM';
  const randomNum = Math.floor(1000 + Math.random() * 9000);
  return `${prefix}-${randomNum}`;
}

// Connected WebSocket Clients map: householdId -> Set<clientObj>
const roomClients = new Map();

function broadcastToHousehold(householdId, payload, excludeWs = null) {
  const clients = roomClients.get(householdId);
  if (!clients) return;

  const msg = JSON.stringify(payload);
  clients.forEach(client => {
    if (client.ws !== excludeWs && client.ws.readyState === WebSocket.OPEN) {
      client.ws.send(msg);
    }
  });
}

function broadcastOnlinePeers(householdId) {
  const clients = roomClients.get(householdId);
  if (!clients) return;

  const peers = Array.from(clients).map(c => ({
    userId: c.userId,
    name: c.name,
    deviceName: c.deviceName,
    joinedAt: c.joinedAt
  }));

  const msg = JSON.stringify({
    type: 'PEERS_UPDATED',
    peers,
    count: peers.length
  });

  clients.forEach(c => {
    if (c.ws.readyState === WebSocket.OPEN) {
      c.ws.send(msg);
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
          householdId
        }));

        // Broadcast active devices to everyone in this household
        broadcastOnlinePeers(householdId);
      }
    } catch (e) {
      console.error('WS Message error', e);
    }
  });

  ws.on('close', () => {
    if (clientInfo && roomClients.has(clientInfo.householdId)) {
      const clients = roomClients.get(clientInfo.householdId);
      clients.delete(clientInfo);
      if (clients.size === 0) {
        roomClients.delete(clientInfo.householdId);
      } else {
        broadcastOnlinePeers(clientInfo.householdId);
      }
    }
  });
});

/* ============================================================
   REST API ROUTES
============================================================ */

// Serve static production build if exists
const DIST_PATH = path.join(__dirname, 'dist');
if (fs.existsSync(DIST_PATH)) {
  app.use(express.static(DIST_PATH));
}

// 1. Network Info & QR Code for 2nd Mobile Sync
app.get('/api/network-info', async (req, res) => {
  const ip = getLocalIP();
  const vitePort = 5173;
  const mobileUrl = `http://${ip}:${vitePort}/`;

  let qrCodeDataUrl = '';
  try {
    qrCodeDataUrl = await QRCode.toDataURL(mobileUrl, {
      width: 260,
      margin: 1.5,
      color: {
        dark: '#059669',
        light: '#ffffff'
      }
    });
  } catch (err) {
    console.error('Error generating QR code', err);
  }

  res.json({
    ip,
    port: 5000,
    vitePort,
    mobileUrl,
    publicUrl: process.env.PUBLIC_URL || null,
    qrCodeDataUrl
  });
});

// Market Price Database (Tamil Nadu Daily Commodity & Supermarket Rates)
const LIVE_MARKET_RATES = {
  // Medicines & Healthcare
  'dolo': { rate: 32, unit: 'strip', market: 'Pharmacy Retail MRP' },
  'dolo 650': { rate: 32, unit: 'strip', market: 'Pharmacy Retail MRP' },
  'paracetamol': { rate: 20, unit: 'strip', market: 'Pharmacy Retail MRP' },
  'டோலோ': { rate: 32, unit: 'strip', market: 'Pharmacy Retail MRP' },
  'பாராசிட்டமால்': { rate: 20, unit: 'strip', market: 'Pharmacy Retail MRP' },
  'vicks': { rate: 55, unit: 'bottle', market: 'Pharmacy Retail MRP' },
  'விக்ஸ்': { rate: 55, unit: 'bottle', market: 'Pharmacy Retail MRP' },
  'cough syrup': { rate: 110, unit: 'bottle', market: 'Pharmacy Retail MRP' },
  'இருமல் மருந்து': { rate: 110, unit: 'bottle', market: 'Pharmacy Retail MRP' },
  'band-aid': { rate: 25, unit: 'pack', market: 'Pharmacy Retail MRP' },
  'band aid': { rate: 25, unit: 'pack', market: 'Pharmacy Retail MRP' },
  'பேன்ட்-எய்ட்': { rate: 25, unit: 'pack', market: 'Pharmacy Retail MRP' },
  'moov': { rate: 145, unit: 'tube', market: 'Pharmacy Retail MRP' },
  'மூவ்': { rate: 145, unit: 'tube', market: 'Pharmacy Retail MRP' },
  'amrutanjan': { rate: 48, unit: 'bottle', market: 'Pharmacy Retail MRP' },
  'அமிர்தாஞ்சன்': { rate: 48, unit: 'bottle', market: 'Pharmacy Retail MRP' },
  'eno': { rate: 10, unit: 'pack', market: 'Pharmacy Retail MRP' },
  'ஈனோ': { rate: 10, unit: 'pack', market: 'Pharmacy Retail MRP' },

  // Groceries & Produce
  'tomato': { rate: 38, unit: 'kg', market: 'Koyambedu / TN Retail Index' },
  'thakkali': { rate: 38, unit: 'kg', market: 'Koyambedu / TN Retail Index' },
  'தக்காளி': { rate: 38, unit: 'kg', market: 'Koyambedu / TN Retail Index' },
  'onion': { rate: 55, unit: 'kg', market: 'TN Agriculture Market' },
  'vengayam': { rate: 55, unit: 'kg', market: 'TN Agriculture Market' },
  'வெங்காயம்': { rate: 55, unit: 'kg', market: 'TN Agriculture Market' },
  'potato': { rate: 35, unit: 'kg', market: 'Koyambedu Wholesale' },
  'உருளைக்கிழங்கு': { rate: 35, unit: 'kg', market: 'Koyambedu Wholesale' },
  'carrot': { rate: 60, unit: 'kg', market: 'Ooty Produce Index' },
  'கேரட்': { rate: 60, unit: 'kg', market: 'Ooty Produce Index' },
  'milk': { rate: 28, unit: 'L', market: 'Aavin Official Retail Price' },
  'பசும்பால்': { rate: 28, unit: 'L', market: 'Aavin Official Retail Price' },
  'பால்': { rate: 28, unit: 'L', market: 'Aavin Official Retail Price' },
  'apple': { rate: 180, unit: 'kg', market: 'Shimla Apple Daily Index' },
  'ஆப்பிள்': { rate: 180, unit: 'kg', market: 'Shimla Apple Daily Index' },
  'banana': { rate: 60, unit: 'dozen', market: 'Trichy Banana Market' },
  'வாழைப்பழம்': { rate: 60, unit: 'dozen', market: 'Trichy Banana Market' },
  'egg': { rate: 6, unit: 'pcs', market: 'NECC Namakkal Egg Rate' },
  'eggs': { rate: 6, unit: 'pcs', market: 'NECC Namakkal Egg Rate' },
  'முட்டை': { rate: 6, unit: 'pcs', market: 'NECC Namakkal Egg Rate' },
  'rice': { rate: 64, unit: 'kg', market: 'Ponni Rice Mill Price' },
  'அரிசி': { rate: 64, unit: 'kg', market: 'Ponni Rice Mill Price' },
  'பொன்னி அரிசி': { rate: 64, unit: 'kg', market: 'Ponni Rice Mill Price' },
  'oil': { rate: 185, unit: 'L', market: 'TN Edible Oil Board' },
  'எண்ணெய்': { rate: 185, unit: 'L', market: 'TN Edible Oil Board' },
  'கடலை எண்ணெய்': { rate: 185, unit: 'L', market: 'TN Edible Oil Board' },
  'bread': { rate: 45, unit: 'pack', market: 'Bakery Association Price' },
  'பிரெட்': { rate: 45, unit: 'pack', market: 'Bakery Association Price' },
  'coffee': { rate: 160, unit: 'pack', market: 'Coffee Board Index' },
  'காபி தூள்': { rate: 160, unit: 'pack', market: 'Coffee Board Index' },
  'garlic': { rate: 240, unit: 'kg', market: 'Koyambedu Wholesale' },
  'பூண்டு': { rate: 240, unit: 'kg', market: 'Koyambedu Wholesale' },
  'ginger': { rate: 140, unit: 'kg', market: 'Koyambedu Wholesale' },
  'இஞ்சி': { rate: 140, unit: 'kg', market: 'Koyambedu Wholesale' },
  'coconut': { rate: 35, unit: 'pcs', market: 'Pollachi Coconut Board' },
  'தேங்காய்': { rate: 35, unit: 'pcs', market: 'Pollachi Coconut Board' }
};

// Auto-Fetch Online Rate API
app.get('/api/market-price', (req, res) => {
  const { query, quantity, unit } = req.query;
  if (!query) return res.status(400).json({ error: 'Query is required' });

  const cleanQuery = query.toLowerCase().trim();
  let found = null;

  for (const [key, val] of Object.entries(LIVE_MARKET_RATES)) {
    if (cleanQuery.includes(key) || key.includes(cleanQuery)) {
      found = val;
      break;
    }
  }

  const qty = parseFloat(quantity) || 1;
  const baseRate = found ? found.rate : 50; // default estimated rate
  const market = found ? found.market : 'TN Daily Grocery Index';
  const totalPrice = Math.round(baseRate * qty);

  res.json({
    success: true,
    query,
    baseRate,
    quantity: qty,
    unit: unit || found?.unit || 'kg',
    totalPrice,
    market,
    timestamp: new Date().toISOString(),
    isLive: true
  });
});

// Auto-Update All Items with Today's Live Online Rates
app.post('/api/groceries/:householdId/auto-update-rates', (req, res) => {
  const { householdId } = req.params;
  const { senderUser } = req.body;

  db = loadDB();
  const household = db.households.find(h => h.id === householdId);
  if (!household) return res.status(404).json({ error: 'Household not found' });

  let updatedCount = 0;
  household.items = household.items.map(item => {
    const qName = (item.tamilName + ' ' + item.name).toLowerCase();
    for (const [key, val] of Object.entries(LIVE_MARKET_RATES)) {
      if (qName.includes(key)) {
        const qty = parseFloat(item.quantity) || 1;
        const newPrice = Math.round(val.rate * qty);
        if (newPrice !== item.price) {
          updatedCount++;
          return {
            ...item,
            price: newPrice,
            marketSource: val.market,
            rateFetchedAt: new Date().toISOString()
          };
        }
      }
    }
    return item;
  });

  saveDB(db);

  // Broadcast to other devices
  broadcastToHousehold(householdId, {
    type: 'RATES_UPDATED',
    items: household.items,
    updatedCount,
    sender: senderUser?.name || 'A family member'
  });

  res.json({ success: true, updatedCount, items: household.items });
});

// 2. User Registration (பதிவு செய்க)
app.post('/api/auth/register', (req, res) => {
  const { username, password, name, householdChoice, existingCode, newHouseholdName } = req.body;

  if (!username || !password || !name) {
    return res.status(400).json({ error: 'Name, Username, and Password are required' });
  }

  const cleanUsername = username.trim().toLowerCase();
  db = loadDB();

  // Check if username already exists
  if (db.users.some(u => u.username.toLowerCase() === cleanUsername)) {
    return res.status(400).json({ error: 'Username already taken. Please choose another or login.' });
  }

  let targetHousehold = null;

  if (householdChoice === 'join' && existingCode) {
    const codeClean = existingCode.trim().toUpperCase();
    targetHousehold = db.households.find(h => h.code.toUpperCase() === codeClean);
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
      deletedBackup: [],
      createdAt: new Date().toISOString()
    };
    db.households.push(targetHousehold);
  }

  const newUser = {
    id: `usr-${Date.now()}`,
    username: cleanUsername,
    password,
    name: name.trim(),
    householdId: targetHousehold.id,
    createdAt: new Date().toISOString()
  };

  db.users.push(newUser);
  saveDB(db);

  // If joined an existing household, broadcast live alert to Father/other members!
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
app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password required' });
  }

  const cleanUsername = username.trim().toLowerCase();
  db = loadDB();

  const user = db.users.find(u => u.username.toLowerCase() === cleanUsername && u.password === password);
  if (!user) {
    return res.status(401).json({ error: 'Invalid username or password' });
  }

  const household = db.households.find(h => h.id === user.householdId) || db.households[0];

  res.json({
    user: {
      id: user.id,
      name: user.name,
      username: user.username,
      householdId: user.householdId
    },
    household: {
      id: household.id,
      code: household.code,
      name: household.name
    },
    items: household.items
  });
});

// 3b. Forgot / Reset Password (கடவுச்சொல் மீட்டெடு)
app.post('/api/auth/forgot-password', (req, res) => {
  const { username, newPassword } = req.body;

  if (!username || !newPassword) {
    return res.status(400).json({ error: 'Username/Mobile and new password are required' });
  }

  const cleanUsername = username.trim().toLowerCase();
  db = loadDB();

  const userIndex = db.users.findIndex(u => u.username.toLowerCase() === cleanUsername);
  if (userIndex === -1) {
    return res.status(404).json({
      error: 'பயனர் பெயர் அல்லது மொபைல் எண் பதிவு செய்யப்படவில்லை (User not found)'
    });
  }

  db.users[userIndex].password = newPassword;
  saveDB(db);

  res.json({
    success: true,
    message: 'கடவுச்சொல் வெற்றிகரமாக மாற்றப்பட்டது (Password reset successfully)'
  });
});

// 4. Join / Switch Household using Sync Code
app.post('/api/auth/join-household', (req, res) => {
  const { userId, code } = req.body;
  if (!code) {
    return res.status(400).json({ error: 'Sync code is required' });
  }

  db = loadDB();
  const cleanCode = code.trim().toUpperCase();
  const household = db.households.find(h => h.code.toUpperCase() === cleanCode);

  if (!household) {
    return res.status(404).json({ error: `Sync code "${code}" not found. Check the code on the first mobile.` });
  }

  if (userId) {
    const user = db.users.find(u => u.id === userId);
    if (user) {
      user.householdId = household.id;
      saveDB(db);
    }
  }

  res.json({
    household: {
      id: household.id,
      code: household.code,
      name: household.name
    },
    items: household.items
  });
});

// 5. Get Groceries for Household
app.get('/api/groceries/:householdId', (req, res) => {
  db = loadDB();
  const household = db.households.find(h => h.id === req.params.householdId);
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
app.post('/api/groceries/:householdId', (req, res) => {
  const { householdId } = req.params;
  const { item, senderUser, deviceName } = req.body;

  db = loadDB();
  const household = db.households.find(h => h.id === householdId);
  if (!household) return res.status(404).json({ error: 'Household not found' });

  const existingIndex = household.items.findIndex(i => i.id === item.id);
  if (existingIndex >= 0) {
    household.items[existingIndex] = item;
  } else {
    household.items.unshift(item);
  }

  saveDB(db);

  // Real-time broadcast to all connected mobiles in this household!
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
app.post('/api/groceries/:householdId/toggle', (req, res) => {
  const { householdId } = req.params;
  const { itemId, senderUser, deviceName } = req.body;

  db = loadDB();
  const household = db.households.find(h => h.id === householdId);
  if (!household) return res.status(404).json({ error: 'Household not found' });

  const target = household.items.find(i => i.id === itemId);
  if (!target) return res.status(404).json({ error: 'Item not found' });

  target.purchased = !target.purchased;
  target.purchasedAt = target.purchased ? new Date().toISOString() : null;

  saveDB(db);

  // Broadcast toggle event to other phone
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
app.post('/api/groceries/:householdId/delete-purchased', (req, res) => {
  const { householdId } = req.params;
  const { senderUser, deviceName } = req.body;

  db = loadDB();
  const household = db.households.find(h => h.id === householdId);
  if (!household) return res.status(404).json({ error: 'Household not found' });

  const purchased = household.items.filter(i => i.purchased);
  household.deletedBackup = purchased;
  household.items = household.items.filter(i => !i.purchased);

  saveDB(db);

  // Broadcast to other phone
  broadcastToHousehold(householdId, {
    type: 'PURCHASED_DELETED',
    count: purchased.length,
    items: household.items,
    sender: senderUser?.name || 'A family member',
    deviceName: deviceName || 'Mobile'
  });

  res.json({ success: true, count: purchased.length, items: household.items });
});

// 9. Delete Single Item
app.delete('/api/groceries/:householdId/:itemId', (req, res) => {
  const { householdId, itemId } = req.params;
  const { senderName, deviceName } = req.query;

  db = loadDB();
  const household = db.households.find(h => h.id === householdId);
  if (!household) return res.status(404).json({ error: 'Household not found' });

  const target = household.items.find(i => i.id === itemId);
  household.items = household.items.filter(i => i.id !== itemId);

  saveDB(db);

  broadcastToHousehold(householdId, {
    type: 'ITEM_DELETED',
    itemId,
    itemName: target?.tamilName || target?.name || 'Item',
    items: household.items,
    sender: senderName || 'A family member',
    deviceName: deviceName || 'Mobile'
  });

  res.json({ success: true, items: household.items });
});

// 10. Undo Delete
app.post('/api/groceries/:householdId/undo', (req, res) => {
  const { householdId } = req.params;

  db = loadDB();
  const household = db.households.find(h => h.id === householdId);
  if (!household || !household.deletedBackup || household.deletedBackup.length === 0) {
    return res.status(400).json({ error: 'No items to restore' });
  }

  household.items = [...household.items, ...household.deletedBackup];
  household.deletedBackup = [];
  saveDB(db);

  broadcastToHousehold(householdId, {
    type: 'ITEMS_RESTORED',
    items: household.items
  });

  res.json({ success: true, items: household.items });
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
server.listen(PORT, '0.0.0.0', () => {
  const ip = getLocalIP();
  console.log(`=======================================================`);
  console.log(`🚀 Grocery Sync Server running on:`);
  console.log(`   - Local:    http://localhost:${PORT}`);
  console.log(`   - Network:  http://${ip}:${PORT}`);
  console.log(`   - WebSocket Live Sync active`);
  console.log(`=======================================================`);
});
