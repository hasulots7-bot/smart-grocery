import React, { useState, useEffect } from 'react';
import { Globe, CheckCircle2, User, Layers, RefreshCw, LogOut } from 'lucide-react';

export default function Header({ 
  lang, 
  setLang, 
  isMobileFrame: _isMobileFrame,
  setIsMobileFrame: _setIsMobileFrame,
  isDualMobileView,
  setIsDualMobileView,
  totalCount, 
  purchasedCount,
  user,
  household,
  onlinePeers,
  onOpenAuthPage,
  onOpenSyncModal,
  onUpdateAllOnlineRates,
  isUpdatingRates,
  onLogout
}) {
  const [currentTime, setCurrentTime] = useState('');

  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    };
    updateClock();
    const timer = setInterval(updateClock, 30000);
    return () => clearInterval(timer);
  }, []);

  const progressPercent = totalCount > 0 ? Math.round((purchasedCount / totalCount) * 100) : 0;

  return (
    <header className="app-header">
      {/* Mobile OS Status Bar */}
      <div className="mobile-status-bar">
        <span className="status-time">{currentTime || '9:41'}</span>
        <div className="status-notch">
          <span className="status-camera"></span>
        </div>
        <div className="status-icons">
          <span className="signal-icon">●●●●</span>
          <span className="wifi-icon">📶 5G</span>
          <span className="battery-icon">100% 🔋</span>
        </div>
      </div>

      {/* Sync Status Banner Bar */}
      <div className="header-sync-bar" onClick={onOpenSyncModal}>
        <div className="sync-pill-left">
          <span className="sync-pulse-dot"></span>
          <span className="sync-code-tag">
            {household?.code ? `Code: ${household.code}` : 'Live Sync'}
          </span>
          <span className="sync-peers-count">
            {onlinePeers?.length > 1 ? `(${onlinePeers.length} 📱 Synced)` : '(1 📱 Live)'}
          </span>
        </div>

        <div className="sync-pill-right">
          <span className="sync-action-link">
            {lang === 'ta' ? 'QR & 2-வது மொபைல்' : 'Pair 2nd Mobile'} ➔
          </span>
        </div>
      </div>

      {/* Main Header Content */}
      <div className="header-main">
        <div className="brand-info">
          <div className="brand-logo-wrap">
            <span className="logo-emoji">🛒</span>
          </div>
          <div>
            <h1 className="brand-title">
              {lang === 'ta' ? 'மளிகைப் பட்டியல்' : 'Smart Grocery'}
            </h1>
            <p className="brand-subtitle">
              {household?.name ? household.name : (lang === 'ta' ? '2 மொபைல் நேரடி ஒத்திசைவு' : '2 Mobile Live Sync')}
            </p>
          </div>
        </div>

        <div className="header-controls">
          {/* User Profile / Login / Register */}
          <button
            type="button"
            className="header-btn user-btn"
            onClick={onOpenAuthPage}
            title={user ? `User: ${user.name} (Click to manage account)` : 'Login / Register'}
          >
            <User size={14} />
            <span className="user-label">
              {user ? user.name.split(' ')[0] : (lang === 'ta' ? 'உள்நுழைக' : 'Sign In')}
            </span>
          </button>

          {/* Logout Button */}
          {user && (
            <button
              type="button"
              className="header-btn logout-btn"
              onClick={onLogout}
              title={lang === 'ta' ? 'வெளியேறு (Logout)' : 'Logout'}
            >
              <LogOut size={13} />
              <span className="user-label">{lang === 'ta' ? 'வெளியேறு' : 'Logout'}</span>
            </button>
          )}

          {/* Direct APK Download Button */}
          <a
            href="/SmartGrocery.apk"
            download="SmartGrocery.apk"
            className="header-btn apk-dl-btn"
            title="Download Android .APK file directly to phone"
          >
            <span>📥 APK</span>
          </a>

          {/* 2-Mobiles Side-by-Side Simulator Toggle */}
          <button
            type="button"
            className={`header-btn dual-btn desktop-only ${isDualMobileView ? 'active-view' : ''}`}
            onClick={() => setIsDualMobileView(!isDualMobileView)}
            title={isDualMobileView ? 'Single View' : 'Simulate 2 Mobiles Side-by-Side'}
          >
            <Layers size={14} />
            <span>2 📱</span>
          </button>

          {/* Language Toggle */}
          <button 
            type="button"
            className="header-btn lang-btn"
            onClick={() => setLang(lang === 'ta' ? 'en' : 'ta')}
            title={lang === 'ta' ? 'Switch to English' : 'தமிழுக்கு மாற்றவும்'}
          >
            <Globe size={14} />
            <span className="lang-text">{lang === 'ta' ? 'EN' : 'தமிழ்'}</span>
          </button>
        </div>
      </div>

      {/* Role Banner: Home vs Shop Mode */}
      <div className="home-shop-mode-bar">
        <span className="mode-title-tag">
          {lang === 'ta' ? 'உங்கள் இடம்:' : 'Your Location:'}
        </span>
        <div className="mode-toggle-pills">
          <button
            type="button"
            className="mode-pill-btn home-pill active"
            title="வீட்டில் இருந்து மளிகை & மருந்துகளை பட்டியலில் சேர்க்கலாம்"
          >
            🏠 {lang === 'ta' ? 'வீட்டில் உள்ளவர் (Home)' : 'At Home'}
          </button>
          <button
            type="button"
            className="mode-pill-btn shop-pill"
            title="கடையில் இருந்து பொருட்களை வாங்கி டிக் செய்யலாம்"
          >
            🛒 {lang === 'ta' ? 'கடையில் உள்ளவர் (Shop)' : 'At Shop'}
          </button>
        </div>
      </div>

      {/* Progress & Live Rates Row */}
      <div className="progress-section">
        <div className="progress-info">
          <span className="progress-label">
            <CheckCircle2 size={13} className="progress-icon" />
            {lang === 'ta' ? 'முன்னேற்றம்:' : 'Progress:'} <strong>{purchasedCount}</strong>/{totalCount}
          </span>

          {/* Auto Update All Online Rates Button */}
          <button
            type="button"
            className="auto-rate-header-btn"
            onClick={onUpdateAllOnlineRates}
            disabled={isUpdatingRates}
            title={lang === 'ta' ? 'சந்தை விலைகளை தானாக ஆன்லைனில் புதுப்பிக்க' : 'Auto fetch live online prices for all items'}
          >
            <RefreshCw size={11} className={isUpdatingRates ? 'spin-icon' : ''} />
            <span>{isUpdatingRates ? 'Fetching...' : (lang === 'ta' ? 'சந்தை விலை Auto' : 'Live Rates')}</span>
          </button>
        </div>
        <div className="progress-track">
          <div 
            className="progress-fill" 
            style={{ width: `${progressPercent}%` }}
          ></div>
        </div>
      </div>
    </header>
  );
}
