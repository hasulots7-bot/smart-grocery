import React from 'react';
import { X } from 'lucide-react';

export default function ImagePreviewModal({ item, onClose, lang }) {
  if (!item) return null;

  const displayName = lang === 'ta' ? (item.tamilName || item.name) : item.name;
  const subName = lang === 'ta' ? item.name : (item.tamilName || '');

  return (
    <div className="preview-modal-backdrop" onClick={onClose}>
      <div className="preview-modal-box" onClick={(e) => e.stopPropagation()}>
        <button className="preview-close-btn" onClick={onClose} aria-label="Close">
          <X size={20} />
        </button>

        <div className="preview-img-container">
          <img src={item.photoUrl} alt={displayName} className="full-preview-image" />
        </div>

        <div className="preview-caption">
          <h3>{displayName}</h3>
          {subName && subName !== displayName && <p className="preview-sub">{subName}</p>}
          <div className="preview-tags">
            <span className="preview-badge">📦 {item.quantity} {item.unit}</span>
            {item.price > 0 && <span className="preview-badge">₹{item.price}</span>}
            <span className={`preview-badge status ${item.purchased ? 'bought' : 'tobuy'}`}>
              {item.purchased 
                ? (lang === 'ta' ? '✓ வாங்கியது' : '✓ Purchased') 
                : (lang === 'ta' ? '⏳ வாங்க வேண்டும்' : '⏳ To Buy')}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
