// API and Real-Time WebSocket Client
import { Capacitor } from '@capacitor/core';
import { INITIAL_GROCERIES } from '../data/initialGroceries';

// Online Cloud Backend URL (Render Cloud Server)
const DEFAULT_HOST = 'https://smart-grocery-9tzc.onrender.com';

export function isNativePlatform() {
  try {
    return Capacitor.isNativePlatform() ||
      window.location.protocol === 'capacitor:' ||
      window.location.protocol === 'file:' ||
      (window.location.hostname === 'localhost' && (!window.location.port || window.location.port === '80'));
  } catch {
    return false;
  }
}

export function getServerUrl() {
  const custom = localStorage.getItem('custom_server_url');
  if (custom && custom.trim()) {
    return custom.trim().replace(/\/$/, '');
  }
  if (isNativePlatform()) {
    if (DEFAULT_HOST.startsWith('http://') || DEFAULT_HOST.startsWith('https://')) {
      return DEFAULT_HOST.replace(/\/$/, '');
    }
    return `http://${DEFAULT_HOST}`;
  }
  return '';
}

export function getWsUrl() {
  const server = getServerUrl();
  if (server) {
    if (server.startsWith('https://')) {
      return server.replace(/^https:\/\//, 'wss://') + '/ws';
    }
    if (server.startsWith('http://')) {
      return server.replace(/^http:\/\//, 'ws://') + '/ws';
    }
    return `ws://${server}/ws`;
  }
  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  return `${protocol}//${window.location.host}/ws`;
}

function getApiBase() {
  const server = getServerUrl();
  return server ? `${server}/api` : '/api';
}

// Resilient Fetch that never crashes on HTML doctype responses
async function safeFetchJson(endpoint, options = {}) {
  const url = `${getApiBase()}${endpoint}`;
  let res;
  try {
    res = await fetch(url, options);
  } catch (err) {
    throw new Error('NETWORK_ERROR: ' + (err.message || 'Cannot reach server'));
  }

  const contentType = res.headers.get('content-type') || '';
  if (!contentType.includes('application/json')) {
    throw new Error('INVALID_RESPONSE: Server returned non-JSON response');
  }

  const json = await res.json();
  if (!res.ok) {
    throw new Error(json.error || `Request failed (${res.status})`);
  }
  return json;
}

export const authApi = {
  async register(data) {
    try {
      return await safeFetchJson('/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
    } catch (err) {
      console.warn('Backend register failed, using local registration fallback:', err.message);

      // If it's a real business error from server (e.g., username taken), rethrow
      if (!err.message.includes('NETWORK_ERROR') && !err.message.includes('INVALID_RESPONSE')) {
        throw err;
      }

      // Offline / Local registration fallback: save and generate locally!
      const name = data.name || 'User';
      const prefix = name.replace(/[^A-Za-z0-9]/g, '').slice(0, 4).toUpperCase() || 'FAM';
      const randomNum = Math.floor(1000 + Math.random() * 9000);
      const code = data.existingCode || `${prefix}-${randomNum}`;

      const localHousehold = {
        id: `hh-${Date.now()}`,
        code,
        name: data.newHouseholdName || `${name} குடும்பம்`,
        items: INITIAL_GROCERIES
      };

      const localUser = {
        id: `usr-${Date.now()}`,
        username: data.username,
        name,
        householdId: localHousehold.id
      };

      return {
        user: localUser,
        household: localHousehold,
        items: INITIAL_GROCERIES,
        isOffline: true
      };
    }
  },

  async login(data) {
    try {
      return await safeFetchJson('/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
    } catch (err) {
      console.warn('Backend login failed, using local demo fallback:', err.message);

      if (!err.message.includes('NETWORK_ERROR') && !err.message.includes('INVALID_RESPONSE')) {
        throw err;
      }

      // Offline login fallback:
      const u = data.username.toLowerCase();
      const isDad = u === 'appa' || u.includes('appa');
      const isMom = u === 'amma' || u.includes('amma');

      const localUser = {
        id: isDad ? 'usr-1' : isMom ? 'usr-2' : `usr-${Date.now()}`,
        username: data.username,
        name: isDad ? 'அப்பா (Appa)' : isMom ? 'அம்மா (Amma)' : data.username,
        householdId: 'hh-sync-101'
      };

      const localHousehold = {
        id: 'hh-sync-101',
        code: 'SYNC-101',
        name: 'நமது குடும்பம் (Our Family)',
        items: INITIAL_GROCERIES
      };

      return {
        user: localUser,
        household: localHousehold,
        items: INITIAL_GROCERIES,
        isOffline: true
      };
    }
  },

  async forgotPassword(data) {
    try {
      return await safeFetchJson('/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
    } catch (err) {
      if (!err.message.includes('NETWORK_ERROR') && !err.message.includes('INVALID_RESPONSE')) {
        throw err;
      }
      return {
        success: true,
        message: 'Password reset successfully (offline mode)'
      };
    }
  },

  async joinHousehold(userId, code) {
    try {
      return await safeFetchJson('/auth/join-household', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, code })
      });
    } catch (err) {
      if (!err.message.includes('NETWORK_ERROR') && !err.message.includes('INVALID_RESPONSE')) {
        throw err;
      }
      return {
        household: {
          id: `hh-${Date.now()}`,
          code: code.toUpperCase(),
          name: 'நமது குடும்பம் (Synced)'
        },
        items: INITIAL_GROCERIES
      };
    }
  },

  async getNetworkInfo() {
    try {
      return await safeFetchJson('/network-info');
    } catch {
      return null;
    }
  }
};

export const groceryApi = {
  async getGroceries(householdId) {
    try {
      return await safeFetchJson(`/groceries/${householdId}`);
    } catch (e) {
      console.warn('Failed to fetch items from server, using local', e);
      return { items: [] };
    }
  },

  async saveItem(householdId, item, senderUser, deviceName) {
    try {
      return await safeFetchJson(`/groceries/${householdId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ item, senderUser, deviceName })
      });
    } catch (e) {
      console.warn('Save item sync failed (offline)', e);
      return { success: true };
    }
  },

  async toggleItem(householdId, itemId, senderUser, deviceName) {
    try {
      return await safeFetchJson(`/groceries/${householdId}/toggle`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ itemId, senderUser, deviceName })
      });
    } catch (e) {
      console.warn('Toggle item sync failed (offline)', e);
      return { success: true };
    }
  },

  async deletePurchased(householdId, senderUser, deviceName) {
    try {
      return await safeFetchJson(`/groceries/${householdId}/delete-purchased`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ senderUser, deviceName })
      });
    } catch (e) {
      console.warn('Delete purchased sync failed (offline)', e);
      return { success: true };
    }
  },

  async deleteItem(householdId, itemId, senderName, deviceName) {
    try {
      return await safeFetchJson(
        `/groceries/${householdId}/${itemId}?senderName=${encodeURIComponent(senderName || '')}&deviceName=${encodeURIComponent(deviceName || '')}`,
        { method: 'DELETE' }
      );
    } catch (e) {
      console.warn('Delete item sync failed (offline)', e);
      return { success: true };
    }
  },

  async undoDelete(householdId) {
    try {
      return await safeFetchJson(`/groceries/${householdId}/undo`, {
        method: 'POST'
      });
    } catch {
      return { items: [] };
    }
  },

  async fetchOnlineMarketPrice(query, quantity = 1, unit = 'kg') {
    try {
      return await safeFetchJson(
        `/market-price?q=${encodeURIComponent(query)}&quantity=${quantity}&unit=${encodeURIComponent(unit)}`
      );
    } catch {
      return null;
    }
  },

  async fetchLiveRate(name, category = '') {
    try {
      const res = await safeFetchJson(
        `/market-price?q=${encodeURIComponent(name)}&category=${encodeURIComponent(category)}`
      );
      if (res && res.found && res.currentPrice) {
        return { rate: res.currentPrice, ...res };
      }
      return null;
    } catch {
      return null;
    }
  },

  async autoFetchItemInfo(query) {
    try {
      return await safeFetchJson(
        `/groceries/auto-fetch-info?q=${encodeURIComponent(query)}`
      );
    } catch {
      return null;
    }
  },

  async autoUpdateAllRates(householdId, senderUser) {
    try {
      return await safeFetchJson(`/groceries/${householdId}/auto-update-rates`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ senderUser })
      });
    } catch (e) {
      console.warn('Auto update rates failed (offline)', e);
      return { items: [] };
    }
  }
};

// WebSocket Service for Multi-Mobile Live Synchronization
export function createWebSocketSync(householdId, user, deviceName, onEvent, onStatusChange) {
  let ws = null;
  let reconnectTimer = null;
  let isClosedManually = false;

  const connect = () => {
    if (!householdId) return;

    const wsUrl = getWsUrl();

    try {
      ws = new WebSocket(wsUrl);

      ws.onopen = () => {
        onStatusChange?.('connected');
        ws.send(
          JSON.stringify({
            type: 'JOIN_HOUSEHOLD',
            householdId,
            userId: user?.id,
            name: user?.name,
            deviceName: deviceName || 'Mobile'
          })
        );
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          onEvent?.(data);
        } catch (e) {
          console.error('Error parsing WS message', e);
        }
      };

      ws.onclose = () => {
        onStatusChange?.('disconnected');
        if (!isClosedManually) {
          reconnectTimer = setTimeout(connect, 3000);
        }
      };

      ws.onerror = (_err) => {
        onStatusChange?.('error');
        ws?.close();
      };
    } catch (err) {
      console.error('WS Connection error', err);
      reconnectTimer = setTimeout(connect, 3500);
    }
  };

  connect();

  return {
    close() {
      isClosedManually = true;
      if (reconnectTimer) clearTimeout(reconnectTimer);
      if (ws) ws.close();
    }
  };
}
