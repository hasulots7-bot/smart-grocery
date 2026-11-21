import React, { useState } from 'react';
import { Check, Trash2, Edit3, Plus, Minus, ZoomIn } from 'lucide-react';
import { CATEGORIES } from '../data/initialGroceries';
import { normalizeCategory } from '../data/groceryDictionary';

export default function GroceryItemCard({
  item,
  lang,
  onTogglePurchased,
  onDeleteItem,
  onEditItem,
  onPreviewPhoto,
  onUpdateQuantity,
  onSelectCategory
}) {
  const [imgError, setImgError] = useState(false);

  const primaryName = lang === 'ta' ? (item.tamilName || item.name) : item.name;
  const secondaryName = lang === 'ta' ? item.name : (item.tamilName || '');

  const normCat = normalizeCategory(item.category, item.name || item.tamilName);
  const catInfo = CATEGORIES.find(c => c.id === normCat) || { icon: '📦', labelTa: 'மற்றவை', labelEn: 'Other' };

  const handleQtyChange = (delta, e) => {
    e.stopPropagation();
    const currentNum = parseFloat(item.quantity) || 1;
    const newNum = Math.max(0.5, currentNum + delta);
    onUpdateQuantity(item.id, Number.isInteger(newNum) ? newNum.toString() : newNum.toFixed(1));
  };

  return (
    <div className={`grocery-card ${item.purchased ? 'is-purchased' : ''}`}>
      {/* Selection Checkbox Area */}
      <button
        type="button"
        className={`checkbox-btn ${item.purchased ? 'checked' : ''}`}
        onClick={() => onTogglePurchased(item.id)}
        aria-label={item.purchased ? 'Mark as to buy' : 'Mark as purchased'}
      >
        <span className="checkbox-box">
          {item.purchased && <Check size={18} strokeWidth={3} className="check-svg" />}
        </span>
      </button>

      {/* Photo Thumbnail */}
      <div 
        className="card-photo-wrap"
        onClick={() => item.photoUrl && !imgError && onPreviewPhoto(item)}
        title={item.photoUrl ? 'Click to enlarge photo' : ''}
      >
        {item.photoUrl && !imgError ? (
          <img
            src={item.photoUrl}
            alt={item.name}
            className="card-photo"
            loading="lazy"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="card-photo-fallback">
            <span className="fallback-emoji">{item.emoji || '🛒'}</span>
          </div>
        )}
        {item.photoUrl && !imgError && (
          <span className="photo-zoom-hint">
            <ZoomIn size={12} />
          </span>
        )}
      </div>

      {/* Item Details */}
      <div className="card-info" onClick={() => onTogglePurchased(item.id)}>
        <div className="card-header-row">
          <h3 className={`item-title ${item.purchased ? 'struck-through' : ''}`}>
            {primaryName}
          </h3>
          {item.purchased && (
            <span className="purchased-tag">
              ✓ {lang === 'ta' ? 'வாங்கியது' : 'Bought'}
            </span>
          )}
        </div>

        <div className="card-sub-header-row">
          {secondaryName && secondaryName !== primaryName && (
            <p className="item-sub-title">{secondaryName}</p>
          )}
          <span
            className="card-category-tag"
            onClick={(e) => {
              e.stopPropagation();
              if (onSelectCategory) onSelectCategory(normCat);
            }}
            title={lang === 'ta' ? 'இந்த பிரிவை மட்டும் பார்க்க' : 'Filter by this category'}
          >
            {catInfo.icon} {lang === 'ta' ? catInfo.labelTa : catInfo.labelEn}
          </span>
        </div>

        {item.notes && (
          <p className="item-notes">
            📝 {item.notes}
          </p>
        )}

        {/* Quantity and Price Badge */}
        <div className="card-meta-row">
          <div className="qty-control" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              className="qty-btn"
              onClick={(e) => handleQtyChange(-1, e)}
              title="Decrease quantity"
            >
              <Minus size={12} />
            </button>
            <span className="qty-text">
              {item.quantity} {item.unit || 'kg'}
            </span>
            <button
              type="button"
              className="qty-btn"
              onClick={(e) => handleQtyChange(1, e)}
              title="Increase quantity"
            >
              <Plus size={12} />
            </button>
          </div>

          {item.price > 0 && (
            <span className="price-tag">
              ₹{item.price}
            </span>
          )}
        </div>
      </div>

      {/* Action Buttons (Edit / Delete) */}
      <div className="card-actions" onClick={(e) => e.stopPropagation()}>
        <button
          type="button"
          className="card-action-btn edit"
          onClick={() => onEditItem(item)}
          title={lang === 'ta' ? 'மாற்றவும்' : 'Edit item'}
        >
          <Edit3 size={15} />
        </button>

        <button
          type="button"
          className="card-action-btn delete"
          onClick={() => onDeleteItem(item.id)}
          title={lang === 'ta' ? 'நீக்கவும்' : 'Delete item'}
        >
          <Trash2 size={15} />
        </button>
      </div>
    </div>
  );
}
