import React, { useState, useEffect, useMemo } from 'react';
import confetti from 'canvas-confetti';
import { INITIAL_GROCERIES } from './data/initialGroceries';
import Header from './components/Header';
import SummaryCard from './components/SummaryCard';
import FilterBar from './components/FilterBar';
import GroceryItemCard from './components/GroceryItemCard';
import AddItemModal from './components/AddItemModal';
import ImagePreviewModal from './components/ImagePreviewModal';
import WhatsAppShareModal from './components/WhatsAppShareModal';
import AuthModal from './components/AuthModal';
import AuthPage from './components/AuthPage';
import SyncModal from './components/SyncModal';
import BottomNav from './components/BottomNav';
import Toast from './components/Toast';
import { authApi, groceryApi, createWebSocketSync } from './services/api';
import { Plus } from 'lucide-react';
import './App.css';

const STORAGE_KEY = 'smart_grocery_list_v2';
const USER_KEY = 'smart_grocery_user_v3';
const HOUSEHOLD_KEY = 'smart_grocery_household_v2';
const LANG_KEY = 'smart_grocery_lang_v2';

export default function App() {
  // 1. User & Household State
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem(USER_KEY);
      if (saved) return JSON.parse(saved);
    } catch {}
    return null; // Show Login/Register Page on initial launch or logout
  });

  // View state: 'auth' (Sign in/Signup/Forgot Password) | 'app' (Main Grocery List)
  const [currentView, setCurrentView] = useState(() => {
    try {
      const saved = localStorage.getItem(USER_KEY);
      if (saved) return 'app';
    } catch {}
    return 'auth'; // Default to Sign In & Sign Up on start!
  });

  // Clean up legacy session keys
  useEffect(() => {
    try {
      localStorage.removeItem('smart_grocery_user_v2');
    } catch {}
  }, []);

  const [household, setHousehold] = useState(() => {
    try {
      const saved = localStorage.getItem(HOUSEHOLD_KEY);
      if (saved) return JSON.parse(saved);
    } catch {}
    return {
      id: 'hh-sync-101',
      code: 'SYNC-101',
      name: 'நமது குடும்பம் (Our Family)'
    };
  });

  // 2. Groceries State
  const [items, setItems] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return INITIAL_GROCERIES;
  });

  // 3. UI State
  const [lang, setLang] = useState(() => {
    try {
      return localStorage.getItem(LANG_KEY) || 'ta';
    } catch {
      return 'ta';
    }
  });

  const [isMobileFrame, setIsMobileFrame] = useState(true);
  const [isDualMobileView, setIsDualMobileView] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // 4. Modals
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isSyncModalOpen, setIsSyncModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [previewItem, setPreviewItem] = useState(null);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  // 5. Real-Time Sync & Network
  const [onlinePeers, setOnlinePeers] = useState([]);
  const [networkInfo, setNetworkInfo] = useState(null);
  const [toast, setToast] = useState(null);
  const [isUpdatingRates, setIsUpdatingRates] = useState(false);

  // Toast Helper
  function showToast(message, type = 'info', canUndo = false) {
    setToast({ message, type, canUndo });
    setTimeout(() => {
      setToast(curr => curr?.message === message ? null : curr);
    }, 4500);
  }

  // Persistence
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {}
  }, [items]);

  useEffect(() => {
    try {
      if (user) localStorage.setItem(USER_KEY, JSON.stringify(user));
      if (household) localStorage.setItem(HOUSEHOLD_KEY, JSON.stringify(household));
      localStorage.setItem(LANG_KEY, lang);
    } catch {}
  }, [user, household, lang]);

  // Load Network Info (IP, QR Code)
  useEffect(() => {
    authApi.getNetworkInfo().then(info => {
      if (info) setNetworkInfo(info);
    });
  }, []);

  // Fetch initial groceries from server for this household
  useEffect(() => {
    if (!household?.id) return;
    groceryApi.getGroceries(household.id)
      .then(res => {
        if (res && res.items && res.items.length > 0) {
          setItems(res.items);
        }
      })
      .catch(err => console.warn('Could not load initial items from server', err));
  }, [household?.id]);

  // Real-Time WebSocket Connection
  useEffect(() => {
    if (!household?.id || !user) return;

    const wsService = createWebSocketSync(
      household.id,
      user,
      'Mobile 1 (Home)',
      (event) => {
        // Handle incoming real-time events from 2nd mobile
        if (event.type === 'PEERS_UPDATED') {
          setOnlinePeers(event.peers || []);
        } else if (event.type === 'ITEM_UPDATED') {
          if (event.items) setItems(event.items);
          if (event.sender && event.sender !== user?.name) {
            showToast(
              lang === 'ta'
                ? `🔔 ${event.sender} ஒரு பொருளை சேர்த்துள்ளார்/மாற்றியுள்ளார்`
                : `🔔 ${event.sender} updated ${event.item?.name || 'an item'}`,
              'info'
            );
          }
        } else if (event.type === 'ITEM_TOGGLED') {
          if (event.items) setItems(event.items);
          if (event.sender && event.sender !== user?.name) {
            showToast(
              lang === 'ta'
                ? `🔔 ${event.sender}: "${event.itemName}" ${event.purchased ? 'வாங்கப்பட்டது ✓' : 'வாங்க வேண்டும்'}`
                : `🔔 ${event.sender} marked ${event.itemName} as ${event.purchased ? 'bought' : 'to buy'}`,
              'success'
            );
          }
        } else if (event.type === 'PURCHASED_DELETED') {
          if (event.items) setItems(event.items);
          if (event.sender && event.sender !== user?.name) {
            showToast(
              lang === 'ta'
                ? `🗑️ ${event.sender} வாங்கிய ${event.count} பொருட்களை நீக்கினார்`
                : `🗑️ ${event.sender} deleted ${event.count} purchased items`,
              'info'
            );
          }
        } else if (event.type === 'ITEM_DELETED') {
          if (event.items) setItems(event.items);
        } else if (event.type === 'RATES_UPDATED') {
          if (event.items) setItems(event.items);
          showToast(
            lang === 'ta' ? '⚡ அனைத்து சந்தை விலைகளும் புதுப்பிக்கப்பட்டன!' : '⚡ Market rates updated online!',
            'success'
          );
        } else if (event.type === 'MEMBER_JOINED') {
          showToast(
            lang === 'ta'
              ? `🎉 ${event.memberName} குடும்பப் பட்டியலில் இணைந்துள்ளார்! இப்போது இருவரும் நேரலையில் இணைக்கப்பட்டுவிட்டீர்கள்!`
              : `🎉 ${event.memberName} joined your family list! Real-time sync is now active!`,
            'success'
          );
          try {
            confetti({ particleCount: 90, spread: 80, origin: { y: 0.5 } });
          } catch {}
        }
      },
      (_status) => {}
    );

    return () => wsService.close();
  }, [household?.id, user, user?.name, lang]);

  // Check completion celebration
  const checkCompletion = (newItems) => {
    const total = newItems.length;
    const bought = newItems.filter(i => i.purchased).length;
    if (total > 0 && bought === total) {
      try {
        confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
      } catch {}
    }
  };

  // Actions with Real-Time Server Broadcast

  // 1. Toggle Item
  const handleTogglePurchased = async (itemId) => {
    // Optimistic UI update
    const updated = items.map(item => {
      if (item.id === itemId) {
        const next = !item.purchased;
        return { ...item, purchased: next, purchasedAt: next ? new Date().toISOString() : null };
      }
      return item;
    });
    setItems(updated);
    checkCompletion(updated);

    // Sync to backend and broadcast to 2nd mobile
    try {
      if (household?.id) {
        await groceryApi.toggleItem(household.id, itemId, user, 'Mobile 1');
      }
    } catch (e) {
      console.error('Failed to sync toggle', e);
    }
  };

  // 2. Update Quantity
  const handleUpdateQuantity = async (itemId, newQuantity) => {
    const target = items.find(i => i.id === itemId);
    if (!target) return;
    const updatedItem = { ...target, quantity: newQuantity };
    
    setItems(prev => prev.map(i => i.id === itemId ? updatedItem : i));

    try {
      if (household?.id) {
        await groceryApi.saveItem(household.id, updatedItem, user, 'Mobile 1');
      }
    } catch {}
  };

  // 3. Delete Purchased Items (Syncs across devices)
  const handleDeletePurchased = async () => {
    const purchased = items.filter(i => i.purchased);
    if (purchased.length === 0) return;

    const remaining = items.filter(i => !i.purchased);
    setItems(remaining);

    showToast(
      lang === 'ta' ? `${purchased.length} வாங்கிய பொருட்கள் நீக்கப்பட்டன!` : `${purchased.length} purchased items deleted!`,
      'info',
      true
    );

    try {
      if (household?.id) {
        await groceryApi.deletePurchased(household.id, user, 'Mobile 1');
      }
    } catch {}
  };

  // 4. Delete Single Item
  const handleDeleteItem = async (itemId) => {
    const target = items.find(i => i.id === itemId);
    setItems(prev => prev.filter(i => i.id !== itemId));

    showToast(
      lang === 'ta' ? `"${target?.tamilName || target?.name}" நீக்கப்பட்டது` : `Item deleted`,
      'info',
      true
    );

    try {
      if (household?.id) {
        await groceryApi.deleteItem(household.id, itemId, user?.name, 'Mobile 1');
      }
    } catch {}
  };

  // 5. Undo Delete
  const handleUndo = async () => {
    try {
      if (household?.id) {
        const res = await groceryApi.undoDelete(household.id);
        if (res.items) setItems(res.items);
      }
    } catch {}
  };

  // 6. Save Item (Add or Edit) with Auto Photo & Online Rate
  const handleSaveItem = async (itemData) => {
    // Optimistic UI update
    if (editItem) {
      setItems(prev => prev.map(i => i.id === itemData.id ? itemData : i));
    } else {
      setItems(prev => [itemData, ...prev]);
    }

    showToast(
      lang === 'ta' ? 'பொருட்கள் பட்டியலில் சேர்க்கப்பட்டது!' : 'Item added & synced!',
      'success'
    );

    // Sync to backend and broadcast to 2nd mobile!
    try {
      if (household?.id) {
        await groceryApi.saveItem(household.id, itemData, user, 'Mobile 1');
      }
    } catch (e) {
      console.error('Failed to sync new item', e);
    }

    setEditItem(null);
  };

  // 7. Auto Update All Online Rates
  const handleUpdateAllOnlineRates = async () => {
    setIsUpdatingRates(true);
    try {
      if (household?.id) {
        const res = await groceryApi.autoUpdateAllRates(household.id, user);
        if (res.items) setItems(res.items);
        showToast(
          lang === 'ta' ? 'சந்தை விலைகள் தானாக புதுப்பிக்கப்பட்டன!' : 'Live online rates updated!',
          'success'
        );
      }
    } catch (e) {
      console.error('Update rates failed', e);
    } finally {
      setIsUpdatingRates(false);
    }
  };

  // 8. Auth Success (Register / Login)
  const handleAuthSuccess = (newUser, newHousehold, serverItems) => {
    setUser(newUser);
    if (newHousehold) setHousehold(newHousehold);
    if (serverItems && serverItems.length > 0) {
      setItems(serverItems);
    }
    setCurrentView('app');
    setIsAuthModalOpen(false);
    showToast(
      lang === 'ta' 
        ? `வணக்கம் ${newUser.name}! குடும்ப பட்டியல் (${newHousehold?.code || 'இணைக்கப்பட்டது'})`
        : `Welcome ${newUser.name}! Synced with ${newHousehold?.code || 'Household'}`,
      'success'
    );
  };

  // 8b. Logout
  const handleLogout = () => {
    setUser(null);
    setCurrentView('auth');
    try {
      localStorage.removeItem(USER_KEY);
      localStorage.removeItem('smart_grocery_user_v2');
    } catch {}
    showToast(
      lang === 'ta' ? 'வெற்றிகரமாக வெளியேறிவிட்டீர்கள்' : 'Logged out successfully',
      'info'
    );
  };

  // 9. Join Household
  const handleJoinHousehold = async (code) => {
    const res = await authApi.joinHousehold(user?.id, code);
    setHousehold(res.household);
    if (res.items) setItems(res.items);
    showToast(
      lang === 'ta' ? `குறியீடு ${code} வெற்றிகரமாக இணைக்கப்பட்டது!` : `Joined ${code}!`,
      'success'
    );
  };

  // 10. Filtered Items Logic
  const filteredItems = useMemo(() => {
    return items.filter(item => {
      if (statusFilter === 'tobuy' && item.purchased) return false;
      if (statusFilter === 'purchased' && !item.purchased) return false;
      if (selectedCategory !== 'all' && item.category !== selectedCategory) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const enMatch = item.name?.toLowerCase().includes(q);
        const taMatch = item.tamilName?.toLowerCase().includes(q);
        const notesMatch = item.notes?.toLowerCase().includes(q);
        if (!enMatch && !taMatch && !notesMatch) return false;
      }
      return true;
    });
  }, [items, statusFilter, selectedCategory, searchQuery]);

  const totalCount = items.length;
  const purchasedCount = items.filter(i => i.purchased).length;
  const toBuyCount = totalCount - purchasedCount;

  // Single Phone Component Render
  const renderPhoneView = (deviceLabel, isPhone2 = false) => {
    return (
      <div className="mobile-device-wrapper">
        <div className="device-top-sensor"></div>

        {/* Device Role Badge */}
        <div className={`device-role-badge ${isPhone2 ? 'phone-2-badge' : 'phone-1-badge'}`}>
          <span className="live-sync-indicator">🟢 Live Synced</span>
          <span>{deviceLabel}</span>
        </div>

        <div className="mobile-screen-content">
          <Header
            lang={lang}
            setLang={setLang}
            isMobileFrame={isMobileFrame}
            setIsMobileFrame={setIsMobileFrame}
            isDualMobileView={isDualMobileView}
            setIsDualMobileView={setIsDualMobileView}
            totalCount={totalCount}
            purchasedCount={purchasedCount}
            user={isPhone2 ? { ...user, name: 'அம்மா (Amma)' } : user}
            household={household}
            onlinePeers={onlinePeers}
            onOpenAuthPage={() => setCurrentView('auth')}
            onOpenSyncModal={() => setIsSyncModalOpen(true)}
            onUpdateAllOnlineRates={handleUpdateAllOnlineRates}
            isUpdatingRates={isUpdatingRates}
            onLogout={handleLogout}
          />

          <main className="main-scroll-content">
            <SummaryCard
              lang={lang}
              items={items}
              onDeletePurchased={handleDeletePurchased}
              onSelectAll={() => {
                const allP = items.every(i => i.purchased);
                const updated = items.map(i => ({ ...i, purchased: !allP }));
                setItems(updated);
              }}
              onOpenAddModal={() => { setEditItem(null); setIsAddModalOpen(true); }}
              onOpenShareModal={() => setIsShareModalOpen(true)}
            />

            <FilterBar
              lang={lang}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              statusFilter={statusFilter}
              setStatusFilter={setStatusFilter}
              selectedCategory={selectedCategory}
              setSelectedCategory={setSelectedCategory}
              toBuyCount={toBuyCount}
              purchasedCount={purchasedCount}
              totalCount={totalCount}
            />

            <div className="grocery-list-container">
              {filteredItems.length > 0 ? (
                <div className="grocery-cards-stack">
                  {filteredItems.map(item => (
                    <GroceryItemCard
                      key={item.id}
                      item={item}
                      lang={lang}
                      onTogglePurchased={handleTogglePurchased}
                      onDeleteItem={handleDeleteItem}
                      onEditItem={(itemToEdit) => {
                        setEditItem(itemToEdit);
                        setIsAddModalOpen(true);
                      }}
                      onPreviewPhoto={(item) => setPreviewItem(item)}
                      onUpdateQuantity={handleUpdateQuantity}
                    />
                  ))}
                </div>
              ) : (
                <div className="empty-state-box">
                  <span className="empty-emoji">🥦</span>
                  <h3>
                    {statusFilter === 'purchased' 
                      ? (lang === 'ta' ? 'வாங்கிய பொருட்கள் எதுவும் இல்லை' : 'No purchased items')
                      : (lang === 'ta' ? 'பொருட்கள் எதுவும் காணப்படவில்லை' : 'No grocery items')}
                  </h3>
                  <button
                    type="button"
                    className="empty-action-btn primary"
                    onClick={() => { setEditItem(null); setIsAddModalOpen(true); }}
                  >
                    <Plus size={16} />
                    <span>{lang === 'ta' ? 'பொருள் சேர்க்க' : 'Add Item'}</span>
                  </button>
                </div>
              )}
            </div>

            <div className="bottom-scroll-spacer"></div>
          </main>

          <BottomNav
            statusFilter={statusFilter}
            setStatusFilter={setStatusFilter}
            onOpenAddModal={() => { setEditItem(null); setIsAddModalOpen(true); }}
            onDeletePurchased={handleDeletePurchased}
            purchasedCount={purchasedCount}
            toBuyCount={toBuyCount}
            lang={lang}
          />

          {!isPhone2 && (
            <Toast
              toast={toast}
              onUndo={handleUndo}
              onClose={() => setToast(null)}
              lang={lang}
            />
          )}

          <div className="mobile-home-indicator"></div>
        </div>
      </div>
    );
  };

  // If user is not authenticated OR currentView is 'auth', show the dedicated Login & Register Page!
  if (!user || currentView === 'auth') {
    return (
      <div className={`app-viewport ${isMobileFrame ? 'mobile-frame-enabled' : 'fullscreen-enabled'}`}>
        <AuthPage
          onAuthSuccess={handleAuthSuccess}
          lang={lang}
          setLang={setLang}
          currentUser={user}
          onBackToApp={user ? () => setCurrentView('app') : null}
        />
        <Toast
          toast={toast}
          onUndo={handleUndo}
          onClose={() => setToast(null)}
          lang={lang}
        />
      </div>
    );
  }

  return (
    <div className={`app-viewport ${isDualMobileView ? 'dual-view-active' : ''} ${isMobileFrame ? 'mobile-frame-enabled' : 'fullscreen-enabled'}`}>
      
      {/* If Dual Mobile View is active, render Phone 1 & Phone 2 side-by-side! */}
      {isDualMobileView ? (
        <div className="dual-mobiles-container">
          <div className="dual-phone-column">
            {renderPhoneView(lang === 'ta' ? 'மொபைல் 1: அப்பா (வீட்டில் - Home)' : 'Mobile 1: Home Device (Dad)', false)}
          </div>
          <div className="dual-sync-bridge">
            <div className="bridge-pill">
              <span className="bridge-dot">🟢</span>
              <span>2-Way Live Sync ⚡</span>
            </div>
          </div>
          <div className="dual-phone-column">
            {renderPhoneView(lang === 'ta' ? 'மொபைல் 2: அம்மா (கடையில் - Supermarket)' : 'Mobile 2: Shop Device (Mom)', true)}
          </div>
        </div>
      ) : (
        renderPhoneView(
          user ? `${user.name} (${household?.code})` : 'Mobile 1 (Home)',
          false
        )
      )}

      {/* Auth Modal (Register / Login) */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onAuthSuccess={handleAuthSuccess}
        lang={lang}
        currentCode={household?.code}
      />

      {/* Sync Modal (QR Code & 2-Mobile Pairing) */}
      <SyncModal
        isOpen={isSyncModalOpen}
        onClose={() => setIsSyncModalOpen(false)}
        household={household}
        user={user}
        onlinePeers={onlinePeers}
        networkInfo={networkInfo}
        onJoinHousehold={handleJoinHousehold}
        onToggleDualMobileView={() => setIsDualMobileView(!isDualMobileView)}
        isDualMobileView={isDualMobileView}
        lang={lang}
      />

      {/* Add / Edit Modal with AUTO-PHOTO & AUTO-ONLINE RATE */}
      <AddItemModal
        isOpen={isAddModalOpen}
        onClose={() => { setIsAddModalOpen(false); setEditItem(null); }}
        onSave={handleSaveItem}
        editItem={editItem}
        lang={lang}
      />

      {/* Full Photo Preview Modal */}
      <ImagePreviewModal
        item={previewItem}
        onClose={() => setPreviewItem(null)}
        lang={lang}
      />

      {/* WhatsApp / Copy Share Modal */}
      <WhatsAppShareModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        items={items}
        lang={lang}
      />
    </div>
  );
}
