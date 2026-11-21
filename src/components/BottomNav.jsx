import React from 'react';
import { Plus, ListFilter, CheckCircle, ShoppingBag, Trash2 } from 'lucide-react';

export default function BottomNav({
  statusFilter,
  setStatusFilter,
  onOpenAddModal,
  onDeletePurchased,
  purchasedCount,
  toBuyCount,
  lang
}) {
  return (
    <nav className="bottom-nav-bar">
      <button
        type="button"
        className={`bottom-nav-item ${statusFilter === 'all' ? 'active' : ''}`}
        onClick={() => setStatusFilter('all')}
      >
        <ShoppingBag size={20} />
        <span className="nav-label">{lang === 'ta' ? 'அனைத்தும்' : 'All'}</span>
      </button>

      <button
        type="button"
        className={`bottom-nav-item ${statusFilter === 'tobuy' ? 'active' : ''}`}
        onClick={() => setStatusFilter('tobuy')}
      >
        <div className="nav-icon-badge-wrap">
          <ListFilter size={20} />
          {toBuyCount > 0 && <span className="nav-badge tobuy-nav">{toBuyCount}</span>}
        </div>
        <span className="nav-label">{lang === 'ta' ? 'வாங்க' : 'To Buy'}</span>
      </button>

      {/* Main Floating Center Add Button */}
      <div className="fab-container">
        <button
          type="button"
          className="fab-center-btn"
          onClick={onOpenAddModal}
          title={lang === 'ta' ? 'புதிய பொருள் சேர்க்க' : 'Add New Item'}
          aria-label="Add item"
        >
          <Plus size={28} strokeWidth={2.8} />
        </button>
      </div>

      <button
        type="button"
        className={`bottom-nav-item ${statusFilter === 'purchased' ? 'active' : ''}`}
        onClick={() => setStatusFilter('purchased')}
      >
        <div className="nav-icon-badge-wrap">
          <CheckCircle size={20} />
          {purchasedCount > 0 && <span className="nav-badge bought-nav">{purchasedCount}</span>}
        </div>
        <span className="nav-label">{lang === 'ta' ? 'வாங்கியவை' : 'Bought'}</span>
      </button>

      {purchasedCount > 0 ? (
        <button
          type="button"
          className="bottom-nav-item nav-delete-btn"
          onClick={onDeletePurchased}
          title={lang === 'ta' ? 'வாங்கியவற்றை நீக்கு' : 'Delete Bought'}
        >
          <Trash2 size={20} />
          <span className="nav-label">{lang === 'ta' ? 'நீக்கு' : 'Delete'}</span>
        </button>
      ) : (
        <button
          type="button"
          className="bottom-nav-item"
          onClick={onOpenAddModal}
        >
          <Plus size={20} />
          <span className="nav-label">{lang === 'ta' ? 'சேர்க்க' : 'Add'}</span>
        </button>
      )}
    </nav>
  );
}
