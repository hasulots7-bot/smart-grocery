import React from 'react';
import { Globe, User, LogOut, Key } from 'lucide-react';

export default function Header({ 
  lang, 
  setLang, 
  user,
  household,
  onlinePeers,
  onOpenAuthPage,
  onOpenSyncModal,
  onLogout
}) {
  return (
    <header className="app-header-clean">
      <div className="header-top-bar">
        {/* App Brand & Household Info */}
        <div className="header-brand-wrap" onClick={onOpenSyncModal} title="Click to view pairing QR & Household Code">
          <div className="header-logo-icon">🛒</div>
          <div className="header-titles">
            <h1 className="header-app-name">
              {lang === 'ta' ? 'மளிகைப் பட்டியல்' : 'Smart Grocery'}
            </h1>
            <div className="header-sync-status">
              <span className="sync-dot-live"></span>
              <span className="sync-household-name">
                {household?.name || (lang === 'ta' ? 'நமது குடும்பம்' : 'Family')}
              </span>
              {household?.code && (
                <span className="sync-badge-code">
                  <Key size={10} style={{ display: 'inline', marginRight: '2px' }} />
                  {household.code}
                </span>
              )}
              {onlinePeers?.length > 1 && (
                <span className="sync-peer-badge">{onlinePeers.length} 📱</span>
              )}
            </div>
          </div>
        </div>

        {/* Header Right Actions */}
        <div className="header-actions-wrap">
          {/* User Profile Pill */}
          <button
            type="button"
            className="header-pill-btn user-pill"
            onClick={onOpenAuthPage}
            title={user ? `User: ${user.name}` : 'Login / Register'}
          >
            <User size={13} />
            <span>{user ? user.name.split(' ')[0] : (lang === 'ta' ? 'உள்நுழைக' : 'Sign In')}</span>
          </button>

          {/* Language Switch */}
          <button 
            type="button"
            className="header-pill-btn lang-pill"
            onClick={() => setLang(lang === 'ta' ? 'en' : 'ta')}
            title={lang === 'ta' ? 'Switch to English' : 'தமிழுக்கு மாற்றவும்'}
          >
            <Globe size={13} />
            <span>{lang === 'ta' ? 'EN' : 'தமிழ்'}</span>
          </button>

          {/* Logout */}
          {user && (
            <button
              type="button"
              className="header-pill-btn logout-pill"
              onClick={onLogout}
              title={lang === 'ta' ? 'வெளியேறு (Logout)' : 'Logout'}
            >
              <LogOut size={13} />
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
