import React, { useState } from 'react';
import { X, Copy, Check, MessageSquare } from 'lucide-react';

export default function WhatsAppShareModal({ isOpen, onClose, items, lang }) {
  const [copied, setCopied] = useState(false);
  const [includePurchased, setIncludePurchased] = useState(false);

  if (!isOpen) return null;

  const filteredItems = includePurchased ? items : items.filter(i => !i.purchased);

  const formatListText = () => {
    let header = lang === 'ta' 
      ? `🛒 *மளிகைப் பொருட்கள் பட்டியல்*\n📅 ${new Date().toLocaleDateString()}\n---------------------------\n`
      : `🛒 *Grocery Shopping List*\n📅 ${new Date().toLocaleDateString()}\n---------------------------\n`;

    let body = filteredItems.map((item, index) => {
      const name = lang === 'ta' ? `${item.tamilName || item.name} (${item.name})` : item.name;
      const status = item.purchased ? '✅' : '⬜';
      const priceText = item.price > 0 ? ` - ₹${item.price}` : '';
      return `${status} ${index + 1}. *${name}* - ${item.quantity} ${item.unit}${priceText}`;
    }).join('\n');

    const totalEst = filteredItems.reduce((acc, i) => acc + (Number(i.price) || 0), 0);
    let footer = `\n---------------------------\n📊 *${lang === 'ta' ? 'மொத்த பொருட்கள்' : 'Total Items'}:* ${filteredItems.length}`;
    if (totalEst > 0) {
      footer += `\n💰 *${lang === 'ta' ? 'தோராய மதிப்பு' : 'Estimated Total'}:* ₹${totalEst}`;
    }

    return header + body + footer;
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(formatListText());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleWhatsAppShare = () => {
    const text = encodeURIComponent(formatListText());
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-sheet share-sheet" onClick={(e) => e.stopPropagation()}>
        <div className="modal-drag-handle"></div>

        <div className="modal-header">
          <div className="modal-title-wrap">
            <span className="modal-icon">📲</span>
            <h2>{lang === 'ta' ? 'பட்டியலைப் பகிர்க' : 'Share Shopping List'}</h2>
          </div>
          <button className="modal-close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="share-options">
          <label className="checkbox-toggle-label">
            <input
              type="checkbox"
              checked={includePurchased}
              onChange={(e) => setIncludePurchased(e.target.checked)}
            />
            <span>{lang === 'ta' ? 'வாங்கிய பொருட்களையும் சேர்க்க' : 'Include already purchased items'}</span>
          </label>
        </div>

        <div className="share-preview-box">
          <pre>{formatListText()}</pre>
        </div>

        <div className="share-actions-row">
          <button
            type="button"
            className="share-action-btn whatsapp-btn"
            onClick={handleWhatsAppShare}
          >
            <MessageSquare size={18} />
            <span>WhatsApp-ல் பகிர்க</span>
          </button>

          <button
            type="button"
            className={`share-action-btn copy-btn ${copied ? 'copied' : ''}`}
            onClick={handleCopy}
          >
            {copied ? <Check size={18} /> : <Copy size={18} />}
            <span>{copied ? (lang === 'ta' ? 'நகலெடுக்கப்பட்டது!' : 'Copied!') : (lang === 'ta' ? 'பிரதி எடு (Copy)' : 'Copy List')}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
