import React from 'react';
import { Trash2, CheckCheck, Share2, Plus, RefreshCw, ShoppingCart, CheckCircle2, IndianRupee } from 'lucide-react';

export default function SummaryCard({
  lang,
  items = [],
  household,
  user: _user,
  onDeletePurchased,
  onSelectAll,
  onOpenAddModal,
  onOpenShareModal,
  onUpdateAllOnlineRates,
  isUpdatingRates
}) {
  const totalCount = items.length;
  const purchasedItems = items.filter(i => i.purchased);
  const purchasedCount = purchasedItems.length;
  const toBuyCount = totalCount - purchasedCount;

  const totalCost = items.reduce((sum, item) => sum + (Number(item.price) || 0), 0);
  const purchasedCost = purchasedItems.reduce((sum, item) => sum + (Number(item.price) || 0), 0);
  const remainingCost = totalCost - purchasedCost;

  const progressPercent = totalCount > 0 ? Math.round((purchasedCount / totalCount) * 100) : 0;
  const isAllCompleted = totalCount > 0 && purchasedCount === totalCount;

  return (
    <div className="dashboard-hero-card">
      {/* Top Banner Row */}
      <div className="hero-top-row">
        <div className="hero-status-pill">
          <span className="hero-live-dot"></span>
          <span className="hero-status-text">
            {isAllCompleted
              ? (lang === 'ta' ? 'அனைத்தும் வாங்கியாச்சு! 🎉' : 'All Items Bought! 🎉')
              : (lang === 'ta' ? `${toBuyCount} பொருட்கள் வாங்க வேண்டும்` : `${toBuyCount} Items Left To Buy`)}
          </span>
        </div>

        {household?.code && (
          <div className="hero-family-pill">
            <span className="family-key-icon">🔑</span>
            <span className="family-code-text">{household.code}</span>
          </div>
        )}
      </div>

      {/* Progress Section */}
      <div className="hero-progress-block">
        <div className="hero-progress-labels">
          <span className="hero-progress-title">
            <CheckCircle2 size={14} className="hero-progress-icon" />
            <span>{lang === 'ta' ? 'ஷாப்பிங் முன்னேற்றம்' : 'Shopping Progress'}</span>
          </span>
          <span className="hero-progress-stat">
            <strong>{purchasedCount}</strong> / {totalCount} ({progressPercent}%)
          </span>
        </div>
        <div className="hero-progress-track">
          <div
            className={`hero-progress-fill ${isAllCompleted ? 'completed' : ''}`}
            style={{ width: `${progressPercent}%` }}
          ></div>
        </div>
      </div>

      {/* 3 Metrics Grid */}
      <div className="hero-stats-grid">
        <div className="hero-stat-card tobuy-card">
          <div className="stat-icon-badge tobuy-icon">
            <ShoppingCart size={14} />
          </div>
          <span className="hero-stat-label">
            {lang === 'ta' ? 'வாங்க வேண்டியவை' : 'To Buy'}
          </span>
          <span className="hero-stat-num warning">{toBuyCount}</span>
          <span className="hero-stat-sub">₹{remainingCost}</span>
        </div>

        <div className="hero-stat-card bought-card">
          <div className="stat-icon-badge bought-icon">
            <CheckCheck size={14} />
          </div>
          <span className="hero-stat-label">
            {lang === 'ta' ? 'வாங்கியவை' : 'Bought'}
          </span>
          <span className="hero-stat-num success">{purchasedCount}</span>
          <span className="hero-stat-sub">₹{purchasedCost}</span>
        </div>

        <div className="hero-stat-card total-card">
          <div className="stat-icon-badge total-icon">
            <IndianRupee size={14} />
          </div>
          <span className="hero-stat-label">
            {lang === 'ta' ? 'மொத்த பட்ஜெட்' : 'Total Est.'}
          </span>
          <span className="hero-stat-num primary">₹{totalCost}</span>
          <span className="hero-stat-sub">{totalCount} {lang === 'ta' ? 'பொருட்கள்' : 'items'}</span>
        </div>
      </div>

      {/* Quick Action Tools Row */}
      <div className="hero-actions-row">
        {/* Add Item Fast Button */}
        <button
          type="button"
          className="hero-action-pill add-pill"
          onClick={onOpenAddModal}
        >
          <Plus size={14} strokeWidth={2.5} />
          <span>{lang === 'ta' ? 'பொருள் சேர்க்க' : 'Add Item'}</span>
        </button>

        {/* Delete Purchased Items Button */}
        {purchasedCount > 0 && (
          <button
            type="button"
            className="hero-action-pill delete-pill pulse-glow"
            onClick={onDeletePurchased}
            title={lang === 'ta' ? 'வாங்கிய பொருட்களை நீக்கவும்' : 'Delete all purchased items'}
          >
            <Trash2 size={13} />
            <span>{lang === 'ta' ? `வாங்கியவை நீக்கு (${purchasedCount})` : `Clear (${purchasedCount})`}</span>
          </button>
        )}

        {/* WhatsApp Share */}
        <button
          type="button"
          className="hero-action-pill share-pill"
          onClick={onOpenShareModal}
          title={lang === 'ta' ? 'பட்டியலைப் பகிரவும்' : 'Share shopping list'}
        >
          <Share2 size={13} />
          <span>{lang === 'ta' ? 'பகிர்க' : 'Share'}</span>
        </button>

        {/* Select All / Deselect All */}
        {totalCount > 0 && (
          <button
            type="button"
            className="hero-action-pill select-all-pill"
            onClick={onSelectAll}
            title={purchasedCount === totalCount ? 'Unmark All' : 'Select All'}
          >
            <CheckCheck size={13} />
            <span>
              {purchasedCount === totalCount
                ? (lang === 'ta' ? 'மீட்டெடு' : 'Unmark')
                : (lang === 'ta' ? 'அனைத்தும் டிக்' : 'Check All')}
            </span>
          </button>
        )}

        {/* Live Online Rates Update */}
        {onUpdateAllOnlineRates && (
          <button
            type="button"
            className="hero-action-pill rates-pill"
            onClick={onUpdateAllOnlineRates}
            disabled={isUpdatingRates}
            title={lang === 'ta' ? 'ஆன்லைன் சந்தை விலைகளை தானாக புதுப்பிக்க' : 'Auto update market rates'}
          >
            <RefreshCw size={12} className={isUpdatingRates ? 'spin-icon' : ''} />
            <span>{isUpdatingRates ? '...' : (lang === 'ta' ? 'சந்தை விலை ⚡' : 'Live Rates ⚡')}</span>
          </button>
        )}
      </div>
    </div>
  );
}
