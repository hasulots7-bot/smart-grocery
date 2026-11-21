import React, { useState, useRef } from 'react';
import { X, Sparkles, RefreshCw, Check } from 'lucide-react';
import { PRESET_PHOTOS, CATEGORIES, UNITS } from '../data/initialGroceries';
import { findGroceryMatch, getGrocerySuggestions } from '../data/groceryDictionary';
import { groceryApi } from '../services/api';

export default function AddItemModal({
  isOpen,
  onClose,
  onSave,
  editItem,
  lang
}) {
  const [name, setName] = useState(editItem?.name || '');
  const [tamilName, setTamilName] = useState(editItem?.tamilName || '');
  const [category, setCategory] = useState(editItem?.category || 'vegetables');
  const [quantity, setQuantity] = useState(editItem?.quantity || '1');
  const [unit, setUnit] = useState(editItem?.unit || 'kg');
  const [price, setPrice] = useState(editItem?.price ? editItem.price.toString() : '');
  const [photoUrl, setPhotoUrl] = useState(editItem?.photoUrl || PRESET_PHOTOS[0].url);
  const [emoji, setEmoji] = useState(editItem?.emoji || '🛒');
  const [notes, setNotes] = useState(editItem?.notes || '');
  const [photoTab, setPhotoTab] = useState(editItem?.photoUrl?.startsWith('data:') ? 'upload' : 'presets');
  
  const [autoMatchStatus, setAutoMatchStatus] = useState(null);
  const [suggestions, setSuggestions] = useState([]);
  const [isFetchingRate, setIsFetchingRate] = useState(false);

  const fileInputRef = useRef(null);

  if (!isOpen) return null;

  const handleNameChange = (val) => {
    setName(val);
    const match = findGroceryMatch(val);
    if (match) {
      if (match.tamil) setTamilName(match.tamil);
      if (match.category) setCategory(match.category);
      if (match.emoji) setEmoji(match.emoji);
      if (match.defaultPhoto) setPhotoUrl(match.defaultPhoto);
      setAutoMatchStatus({ name: match.name, rate: match.estPrice, source: 'dictionary' });
    } else {
      setAutoMatchStatus(null);
    }
    setSuggestions(getGrocerySuggestions(val));
  };

  const handleFetchLiveRate = async () => {
    if (!name.trim()) return;
    setIsFetchingRate(true);
    try {
      const res = await groceryApi.fetchLiveRate(name);
      if (res && res.rate) {
        setPrice(res.rate.toString());
        setAutoMatchStatus({ name, rate: res.rate, source: 'live-market' });
      }
    } catch {}
    finally {
      setIsFetchingRate(false);
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (uploadEvent) => {
      const result = uploadEvent.target?.result;
      if (typeof result === 'string') {
        setPhotoUrl(result);
        setPhotoTab('upload');
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    onSave({
      id: editItem?.id || `item-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      name: name.trim(),
      tamilName: tamilName.trim() || name.trim(),
      category,
      quantity: quantity.trim() || '1',
      unit,
      price: price.trim() ? Number(price) : 0,
      photoUrl: photoUrl || PRESET_PHOTOS[0].url,
      emoji: emoji || '🛒',
      notes: notes.trim(),
      purchased: editItem ? editItem.purchased : false,
      purchasedAt: editItem ? editItem.purchasedAt : null
    });
    onClose();
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-content add-item-modal">
        <div className="modal-header">
          <h2>
            {editItem
              ? (lang === 'ta' ? '✏️ பொருளை திருத்து' : '✏️ Edit Item')
              : (lang === 'ta' ? '➕ புதிய பொருள் சேர்க்க' : '➕ Add New Item')}
          </h2>
          <button type="button" className="close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="add-item-form">
          <div className="form-group">
            <label>{lang === 'ta' ? 'பொருள் பெயர் (English)*' : 'Item Name (English)*'}</label>
            <div className="input-with-action">
              <input
                type="text"
                value={name}
                onChange={(e) => handleNameChange(e.target.value)}
                placeholder="e.g. Tomato, Milk, Rice..."
                required
                autoFocus
              />
              <button
                type="button"
                className="live-rate-btn"
                onClick={handleFetchLiveRate}
                disabled={isFetchingRate || !name.trim()}
                title="Fetch live market price"
              >
                <RefreshCw size={14} className={isFetchingRate ? 'spin-icon' : ''} />
                <span>{isFetchingRate ? '...' : '⚡ Rate'}</span>
              </button>
            </div>

            {suggestions.length > 0 && !editItem && (
              <div className="suggestions-chips">
                {suggestions.map((s, idx) => (
                  <button
                    type="button"
                    key={idx}
                    className="suggestion-chip"
                    onClick={() => handleNameChange(s.name)}
                  >
                    {s.emoji} {s.name} ({s.tamil})
                  </button>
                ))}
              </div>
            )}

            {autoMatchStatus && (
              <div className="auto-match-badge">
                <Sparkles size={12} />
                <span>
                  Auto-matched: <strong>{autoMatchStatus.name}</strong>
                  {autoMatchStatus.rate ? ` (Est. ₹${autoMatchStatus.rate})` : ''}
                </span>
              </div>
            )}
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>{lang === 'ta' ? 'தமிழ் பெயர் (Tamil Name)' : 'Tamil Name'}</label>
              <input
                type="text"
                value={tamilName}
                onChange={(e) => setTamilName(e.target.value)}
                placeholder="எ.கா. தக்காளி"
              />
            </div>
            <div className="form-group">
              <label>{lang === 'ta' ? 'Emoji / ஐகான்' : 'Emoji Icon'}</label>
              <input
                type="text"
                value={emoji}
                onChange={(e) => setEmoji(e.target.value)}
                maxLength={4}
                className="emoji-input-field"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>{lang === 'ta' ? 'வகை (Category)' : 'Category'}</label>
              <select value={category} onChange={(e) => setCategory(e.target.value)}>
                {CATEGORIES.map(cat => (
                  <option key={cat.id} value={cat.id}>
                    {lang === 'ta' ? cat.nameTa : cat.nameEn}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>{lang === 'ta' ? 'தோராய விலை (₹ Price)' : 'Est. Price (₹)'}</label>
              <div className="price-input-wrap">
                <span className="currency-symbol">₹</span>
                <input
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="0.00"
                  step="0.5"
                  min="0"
                />
              </div>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>{lang === 'ta' ? 'அளவு (Quantity)' : 'Quantity'}</label>
              <input
                type="text"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                placeholder="1, 500, 2..."
              />
            </div>
            <div className="form-group">
              <label>{lang === 'ta' ? 'அலகு (Unit)' : 'Unit'}</label>
              <select value={unit} onChange={(e) => setUnit(e.target.value)}>
                {UNITS.map(u => (
                  <option key={u} value={u}>{u}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-group photo-section-group">
            <label>{lang === 'ta' ? 'பொருள் புகைப்படம் (Photo)' : 'Item Photo'}</label>
            <div className="photo-tabs">
              <button
                type="button"
                className={`photo-tab-btn ${photoTab === 'presets' ? 'active' : ''}`}
                onClick={() => setPhotoTab('presets')}
              >
                🖼️ Preset Gallery
              </button>
              <button
                type="button"
                className={`photo-tab-btn ${photoTab === 'upload' ? 'active' : ''}`}
                onClick={() => { setPhotoTab('upload'); fileInputRef.current?.click(); }}
              >
                📷 Upload Photo
              </button>
              <button
                type="button"
                className={`photo-tab-btn ${photoTab === 'url' ? 'active' : ''}`}
                onClick={() => setPhotoTab('url')}
              >
                🌐 Image URL
              </button>
            </div>

            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept="image/*"
              style={{ display: 'none' }}
            />

            {photoTab === 'presets' && (
              <div className="preset-photos-grid">
                {PRESET_PHOTOS.map((p, idx) => (
                  <div
                    key={idx}
                    className={`preset-thumb-card ${photoUrl === p.url ? 'selected' : ''}`}
                    onClick={() => {
                      setPhotoUrl(p.url);
                      setEmoji(p.emoji);
                    }}
                  >
                    <img src={p.url} alt={p.name} />
                    <span>{p.emoji} {p.name}</span>
                  </div>
                ))}
              </div>
            )}

            {photoTab === 'url' && (
              <input
                type="url"
                value={photoUrl}
                onChange={(e) => setPhotoUrl(e.target.value)}
                placeholder="https://example.com/image.jpg"
                className="url-input-field"
              />
            )}

            {photoUrl && (
              <div className="selected-photo-preview">
                <img src={photoUrl} alt="Preview" />
                <span>Selected Photo</span>
              </div>
            )}
          </div>

          <div className="form-group">
            <label>{lang === 'ta' ? 'குறிப்புகள் (Notes)' : 'Notes / Brand'}</label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Aashirvaad brand, fresh green..."
            />
          </div>

          <div className="modal-footer-actions">
            <button type="button" className="btn-cancel" onClick={onClose}>
              {lang === 'ta' ? 'ரத்து செய்' : 'Cancel'}
            </button>
            <button type="submit" className="btn-save-primary">
              <Check size={16} />
              <span>{editItem ? (lang === 'ta' ? 'புதுப்பி' : 'Update Item') : (lang === 'ta' ? 'பட்டியலில் சேர்' : 'Add to List')}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
