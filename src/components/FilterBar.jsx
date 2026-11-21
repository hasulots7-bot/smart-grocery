import React, { useMemo } from 'react';
import { Search, X } from 'lucide-react';
import { CATEGORIES } from '../data/initialGroceries';
import { normalizeCategory } from '../data/groceryDictionary';

export default function FilterBar({
  lang,
  items = [],
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
  // Compute item count per category using normalized categories
  const categoryCounts = useMemo(() => {
    const counts = {};
    items.forEach(item => {
      const cat = normalizeCategory(item.category, item.name || item.tamilName);
      counts[cat] = (counts[cat] || 0) + 1;
    });
    return counts;
  }, [items]);

  return (
    <div className="filter-bar-container">
      {/* Search Input */}
      <div className="search-box-wrap">
        <Search size={16} className="search-icon" />
        <input
          type="text"
          className="search-input"
          placeholder={lang === 'ta' ? 'பொருட்களைத் தேடுங்கள் (எ.கா: தக்காளி, Dolo, பால்)...' : 'Search groceries (e.g. Tomato, Dolo, Milk)...'}
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
            <X size={15} />
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
          <span>{lang === 'ta' ? 'வாங்கியவை' : 'Bought'}</span>
          <span className="tab-badge purchased-badge">{purchasedCount}</span>
        </button>
      </div>

      {/* Category Pills Scroll */}
      <div className="category-chips-scroll">
        {CATEGORIES.map((cat) => {
          const isSelected = selectedCategory === cat.id;
          const count = cat.id === 'all' ? totalCount : (categoryCounts[cat.id] || 0);
          return (
            <button
              key={cat.id}
              type="button"
              className={`cat-chip ${isSelected ? 'active' : ''}`}
              onClick={() => {
                // If user clicks the already selected category, toggle back to 'all'
                if (isSelected && cat.id !== 'all') {
                  setSelectedCategory('all');
                } else {
                  setSelectedCategory(cat.id);
                }
              }}
            >
              <span className="chip-icon">{cat.icon}</span>
              <span className="chip-label">
                {lang === 'ta' ? cat.labelTa : cat.labelEn}
              </span>
              {count > 0 && (
                <span className={`chip-count-badge ${isSelected ? 'active' : ''}`}>
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
