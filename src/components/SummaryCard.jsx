import { Trash2, CheckCheck, Share2, ShoppingCart, IndianRupee } from 'lucide-react';

export default function SummaryCard({
  lang,
  items,
  onDeletePurchased,
  onSelectAll,
  onOpenAddModal: _onOpenAddModal,
  onOpenShareModal
}) {
  const totalCount = items.length;
  const purchasedItems = items.filter(i => i.purchased);
  const purchasedCount = purchasedItems.length;
  const toBuyCount = totalCount - purchasedCount;

  const totalCost = items.reduce((sum, item) => sum + (Number(item.price) || 0), 0);
  const purchasedCost = purchasedItems.reduce((sum, item) => sum + (Number(item.price) || 0), 0);
  const remainingCost = totalCost - purchasedCost;

  return (
    <div className="summary-container">
      {/* Metrics Row */}
      <div className="summary-cards-grid">
        <div className="metric-box to-buy">
          <div className="metric-icon-wrap">
            <ShoppingCart size={18} />
          </div>
          <div className="metric-details">
            <span className="metric-val">{toBuyCount}</span>
            <span className="metric-title">
              {lang === 'ta' ? 'வாங்க வேண்டியவை' : 'To Buy'}
            </span>
            <span className="metric-sub">₹{remainingCost}</span>
          </div>
        </div>

        <div className="metric-box bought">
          <div className="metric-icon-wrap">
            <CheckCheck size={18} />
          </div>
          <div className="metric-details">
            <span className="metric-val">{purchasedCount}</span>
            <span className="metric-title">
              {lang === 'ta' ? 'வாங்கியவை' : 'Purchased'}
            </span>
            <span className="metric-sub">₹{purchasedCost}</span>
          </div>
        </div>

        <div className="metric-box total">
          <div className="metric-icon-wrap">
            <IndianRupee size={18} />
          </div>
          <div className="metric-details">
            <span className="metric-val">₹{totalCost}</span>
            <span className="metric-title">
              {lang === 'ta' ? 'மொத்த பட்ஜெட்' : 'Total Est.'}
            </span>
            <span className="metric-sub">{totalCount} {lang === 'ta' ? 'பொருட்கள்' : 'items'}</span>
          </div>
        </div>
      </div>

      {/* Action Row */}
      <div className="summary-actions-row">
        {/* Delete Purchased Items Button - High priority as requested! */}
        {purchasedCount > 0 && (
          <button
            type="button"
            className="action-pill-btn delete-purchased-btn pulse-glow"
            onClick={onDeletePurchased}
            title={lang === 'ta' ? 'வாங்கிய பொருட்களை நீக்கவும்' : 'Delete all purchased items'}
          >
            <Trash2 size={16} />
            <span>
              {lang === 'ta' 
                ? `வாங்கியவை நீக்கு (${purchasedCount})` 
                : `Delete Purchased (${purchasedCount})`}
            </span>
          </button>
        )}

        {/* Share Button */}
        <button
          type="button"
          className="action-pill-btn share-btn"
          onClick={onOpenShareModal}
          title={lang === 'ta' ? 'பட்டியலைப் பகிரவும்' : 'Share shopping list'}
        >
          <Share2 size={15} />
          <span>{lang === 'ta' ? 'பகிர்க' : 'Share'}</span>
        </button>

        {/* Quick Mark All / Unmark */}
        {totalCount > 0 && (
          <button
            type="button"
            className="action-pill-btn secondary-btn"
            onClick={onSelectAll}
          >
            <CheckCheck size={15} />
            <span>
              {purchasedCount === totalCount
                ? (lang === 'ta' ? 'நீக்குக' : 'Unmark All')
                : (lang === 'ta' ? 'அனைத்தும் தேர்ந்தெடு' : 'Select All')}
            </span>
          </button>
        )}
      </div>
    </div>
  );
}
