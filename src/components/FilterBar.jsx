import React from 'react';
import { Search, X } from 'lucide-react';
import { CATEGORIES } from '../data/initialGroceries';

export default function FilterBar({
  lang,
  searchQuery,
  setSearchQuery,
  statusFilter,
  setStatusFilter,
  selectedCategory,
  setSelectedCategory,
  toBuyCount,
  purchasedCount,
  totalCount
}) {
  return (
    <div className="filter-bar-container">
      {/* Search Input */}
      <div className="search-box-wrap">
        <Search size={18} className="search-icon" />
        <input
          type="text"
          className="search-input"
          placeholder={lang === 'ta' ? 'பொருட்களைத் தேடுங்கள் (எ.கா: தக்காளி, பால்)...' : 'Search groceries (e.g. Tomato, Milk)...'}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        {searchQuery && (
          <button
            type="button"
            className="search-clear-btn"
            onClick={() => setSearchQuery('')}
            aria-label="Clear search"
          >
            <X size={16} />
          </button>
        )}
      </div>

      {/* Status Segmented Tabs */}
      <div className="status-tabs-wrap">
        <button
          type="button"
          className={`status-tab ${statusFilter === 'all' ? 'active' : ''}`}
          onClick={() => setStatusFilter('all')}
        >
          <span>{lang === 'ta' ? 'அனைத்தும்' : 'All'}</span>
          <span className="tab-badge">{totalCount}</span>
        </button>

        <button
          type="button"
          className={`status-tab ${statusFilter === 'tobuy' ? 'active' : ''}`}
          onClick={() => setStatusFilter('tobuy')}
        >
          <span>{lang === 'ta' ? 'வாங்க வேண்டியவை' : 'To Buy'}</span>
          <span className="tab-badge to-buy-badge">{toBuyCount}</span>
        </button>

        <button
          type="button"
          className={`status-tab ${statusFilter === 'purchased' ? 'active' : ''}`}
          onClick={() => setStatusFilter('purchased')}
        >
          <span>{lang === 'ta' ? 'வாங்கியவை' : 'Purchased'}</span>
          <span className="tab-badge purchased-badge">{purchasedCount}</span>
        </button>
      </div>

      {/* Category Pills Scroll */}
      <div className="category-chips-scroll">
        {CATEGORIES.map((cat) => {
          const isSelected = selectedCategory === cat.id;
          return (
            <button
              key={cat.id}
              type="button"
              className={`cat-chip ${isSelected ? 'active' : ''}`}
              onClick={() => setSelectedCategory(cat.id)}
            >
              <span className="chip-icon">{cat.icon}</span>
              <span className="chip-label">
                {lang === 'ta' ? cat.labelTa : cat.labelEn}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
