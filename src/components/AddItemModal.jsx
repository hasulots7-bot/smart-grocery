import React, { useState, useEffect, useRef, useMemo } from 'react';
import { X, Sparkles, RefreshCw, Check, Upload } from 'lucide-react';
import { PRESET_PHOTOS, CATEGORIES, UNITS } from '../data/initialGroceries';
import { findGroceryMatch, getGrocerySuggestions } from '../data/groceryDictionary';
import { groceryApi } from '../services/api';

// Filter out 'all' from addable item categories
const ADD_CATEGORIES = CATEGORIES.filter(c => c.id !== 'all');

export default function AddItemModal({
  isOpen,
  onClose,
  onSave,
  editItem,
  lang
}) {
  const [name, setName] = useState('');
  const [tamilName, setTamilName] = useState('');
  const [category, setCategory] = useState('vegetables');
  const [quantity, setQuantity] = useState('1');
  const [unit, setUnit] = useState('kg');
  const [price, setPrice] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  const [emoji, setEmoji] = useState('🛒');
  const [notes, setNotes] = useState('');
  const [photoTab, setPhotoTab] = useState('presets');
  
  const [autoMatchStatus, setAutoMatchStatus] = useState(null);
  const [suggestions, setSuggestions] = useState([]);
  const [isFetchingRate, setIsFetchingRate] = useState(false);

  const fileInputRef = useRef(null);

  // Sync / Reset state when modal opens or editItem changes
  useEffect(() => {
    if (isOpen) {
      if (editItem) {
        setName(editItem.name || '');
        setTamilName(editItem.tamilName || '');
        setCategory(editItem.category || 'vegetables');
        setQuantity(editItem.quantity ? editItem.quantity.toString() : '1');
        setUnit(editItem.unit || 'kg');
        setPrice(editItem.price ? editItem.price.toString() : '');
        setPhotoUrl(editItem.photoUrl || PRESET_PHOTOS[0]?.url || '');
        setEmoji(editItem.emoji || '🛒');
        setNotes(editItem.notes || '');
        setPhotoTab(editItem.photoUrl?.startsWith('data:') ? 'upload' : 'presets');
      } else {
        setName('');
        setTamilName('');
        setCategory('vegetables');
        setQuantity('1');
        setUnit('kg');
        setPrice('');
        setPhotoUrl(PRESET_PHOTOS[0]?.url || '');
        setEmoji('🛒');
        setNotes('');
        setPhotoTab('presets');
        setAutoMatchStatus(null);
        setSuggestions([]);
      }
    }
  }, [isOpen, editItem]);

  // Sort presets so photos matching selected category appear first!
  const sortedPresets = useMemo(() => {
    return [...PRESET_PHOTOS].sort((a, b) => {
      const aMatch = a.category === category;
      const bMatch = b.category === category;
      if (aMatch && !bMatch) return -1;
      if (!aMatch && bMatch) return 1;
      return 0;
    });
  }, [category]);

  if (!isOpen) return null;

  const handleNameChange = (val) => {
    setName(val);
    const match = findGroceryMatch(val);
    if (match) {
      if (match.tamilName) setTamilName(match.tamilName);
      if (match.category) setCategory(match.category);
      if (match.emoji) setEmoji(match.emoji);
      if (match.photoUrl) setPhotoUrl(match.photoUrl);
      if (match.marketRate && !price) setPrice(match.marketRate.toString());
      setAutoMatchStatus({ name: match.name, rate: match.marketRate, source: 'dictionary' });
    } else {
      setAutoMatchStatus(null);
    }
    setSuggestions(getGrocerySuggestions(val));
  };

  const handleSelectSuggestion = (s) => {
    setName(s.name);
    if (s.tamilName) setTamilName(s.tamilName);
    if (s.category) setCategory(s.category);
    if (s.emoji) setEmoji(s.emoji);
    if (s.photoUrl) setPhotoUrl(s.photoUrl);
    if (s.marketRate) setPrice(s.marketRate.toString());
    setAutoMatchStatus({ name: s.name, rate: s.marketRate, source: 'dictionary' });
    setSuggestions([]);
  };

  const handleCategorySelect = (cat) => {
    setCategory(cat.id);
    if (!emoji || emoji === '🛒') {
      setEmoji(cat.icon);
    }
    // Pick the first photo from this category if current photo is generic
    const matchPhoto = PRESET_PHOTOS.find(p => p.category === cat.id);
    if (matchPhoto && (!photoUrl || photoUrl === PRESET_PHOTOS[0]?.url)) {
      setPhotoUrl(matchPhoto.url);
    }
  };

  const handleFetchLiveRate = async () => {
    if (!name.trim()) return;
    setIsFetchingRate(true);
    try {
      const res = await groceryApi.fetchLiveRate(name, category);
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
      category: category || 'vegetables',
      quantity: quantity.trim() || '1',
      unit: unit || 'kg',
      price: price.trim() ? Number(price) : 0,
      photoUrl: photoUrl || PRESET_PHOTOS[0]?.url || '',
      emoji: emoji || '🛒',
      notes: notes.trim(),
      purchased: editItem ? editItem.purchased : false,
      purchasedAt: editItem ? editItem.purchasedAt : null
    });
    onClose();
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-sheet add-item-sheet" onClick={(e) => e.stopPropagation()}>
        <div className="modal-drag-handle"></div>

        <div className="modal-header">
          <div className="modal-title-wrap">
            <span className="modal-icon">{editItem ? '✏️' : '➕'}</span>
            <h2>
              {editItem
                ? (lang === 'ta' ? 'பொருளை திருத்து' : 'Edit Item')
                : (lang === 'ta' ? 'புதிய பொருள் சேர்க்க' : 'Add New Item')}
            </h2>
          </div>
          <button type="button" className="modal-close-btn" onClick={onClose} aria-label="Close">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          {/* Item Name (English) */}
          <div className="form-field">
            <label className="field-label-bold">
              {lang === 'ta' ? 'பொருள் பெயர் (English)*' : 'Item Name (English)*'}
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => handleNameChange(e.target.value)}
              placeholder="e.g. Tomato, Milk, Dolo 650, Rice..."
              required
            />
          </div>

          {/* Quick Suggestion Chips */}
          {suggestions.length > 0 && !editItem && (
            <div className="auto-suggestions-row">
              <span className="sugg-hint">✨ {lang === 'ta' ? 'பரிந்துரைகள் (Tap to autofill):' : 'Suggestions:'}</span>
              <div className="sugg-chips-wrap">
                {suggestions.map((s, idx) => (
                  <button
                    type="button"
                    key={idx}
                    className="sugg-chip"
                    onClick={() => handleSelectSuggestion(s)}
                  >
                    {s.photoUrl && <img src={s.photoUrl} alt="" className="sugg-thumb" />}
                    <span>{s.emoji} {s.name}</span>
                    {s.tamilName && <small>({s.tamilName})</small>}
                    {s.marketRate && <span className="sugg-rate">₹{s.marketRate}</span>}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Auto-match Success Banner */}
          {autoMatchStatus && (
            <div className="auto-match-badge-banner">
              <Sparkles size={14} className="zap-pulse" />
              <div>
                <strong>Auto-matched: {autoMatchStatus.name}</strong>
                {autoMatchStatus.rate ? <span> (சந்தை விலை: ₹{autoMatchStatus.rate})</span> : null}
              </div>
            </div>
          )}

          {/* CATEGORY VISUAL SELECTOR (Interactive Chips) */}
          <div className="form-field">
            <div className="cat-label-row">
              <label className="field-label-bold">
                {lang === 'ta' ? 'வகை / பிரிவு (Category)*' : 'Category*'}
              </label>
              <span className="cat-active-indicator">
                {ADD_CATEGORIES.find(c => c.id === category)?.icon} {lang === 'ta' ? ADD_CATEGORIES.find(c => c.id === category)?.labelTa : ADD_CATEGORIES.find(c => c.id === category)?.labelEn}
              </span>
            </div>

            <div className="category-select-grid">
              {ADD_CATEGORIES.map(cat => {
                const isSelected = category === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    className={`category-select-chip ${isSelected ? 'selected' : ''}`}
                    onClick={() => handleCategorySelect(cat)}
                  >
                    <span className="cat-chip-icon">{cat.icon}</span>
                    <span className="cat-chip-name">{lang === 'ta' ? cat.labelTa : cat.labelEn}</span>
                    {isSelected && <span className="cat-chip-check">✓</span>}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Tamil Name & Emoji Row */}
          <div className="form-group-row">
            <div className="form-field">
              <label className="field-label-bold">{lang === 'ta' ? 'தமிழ் பெயர் (Tamil Name)' : 'Tamil Name'}</label>
              <input
                type="text"
                value={tamilName}
                onChange={(e) => setTamilName(e.target.value)}
                placeholder="எ.கா. தக்காளி, பால்..."
              />
            </div>
            <div className="form-field">
              <label className="field-label-bold">{lang === 'ta' ? 'Emoji ஐகான்' : 'Emoji Icon'}</label>
              <input
                type="text"
                value={emoji}
                onChange={(e) => setEmoji(e.target.value)}
                maxLength={4}
                style={{ textAlign: 'center', fontSize: '18px' }}
              />
            </div>
          </div>

          {/* Quantity, Unit & Price Row */}
          <div className="form-group-3col">
            <div className="form-field">
              <label className="field-label-bold">{lang === 'ta' ? 'அளவு' : 'Quantity'}</label>
              <input
                type="text"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                placeholder="1, 500, 2..."
              />
            </div>

            <div className="form-field">
              <label className="field-label-bold">{lang === 'ta' ? 'அலகு' : 'Unit'}</label>
              <select className="styled-select" value={unit} onChange={(e) => setUnit(e.target.value)}>
                {UNITS.map(u => (
                  <option key={u} value={u}>{u}</option>
                ))}
              </select>
            </div>

            <div className="form-field">
              <div className="price-label-row">
                <label className="field-label-bold">{lang === 'ta' ? 'விலை (₹)' : 'Price (₹)'}</label>
                <button
                  type="button"
                  className="fetch-rate-inline-btn"
                  onClick={handleFetchLiveRate}
                  disabled={isFetchingRate || !name.trim()}
                  title="Fetch live online rate"
                >
                  <RefreshCw size={10} className={isFetchingRate ? 'spin-icon' : ''} />
                  <span>{isFetchingRate ? '...' : '⚡'}</span>
                </button>
              </div>
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

          {/* Photo Picker Section */}
          <div className="photo-picker-section">
            <div className="photo-picker-header">
              <span className="photo-section-title">{lang === 'ta' ? 'பொருள் புகைப்படம்' : 'Item Photo'}</span>
              <div className="photo-tabs">
                <button
                  type="button"
                  className={`photo-tab-btn ${photoTab === 'presets' ? 'active' : ''}`}
                  onClick={() => setPhotoTab('presets')}
                >
                  🖼️ {lang === 'ta' ? 'மாதிரி' : 'Presets'}
                </button>
                <button
                  type="button"
                  className={`photo-tab-btn ${photoTab === 'upload' ? 'active' : ''}`}
                  onClick={() => { setPhotoTab('upload'); fileInputRef.current?.click(); }}
                >
                  📷 {lang === 'ta' ? 'பதிவேற்று' : 'Upload'}
                </button>
                <button
                  type="button"
                  className={`photo-tab-btn ${photoTab === 'url' ? 'active' : ''}`}
                  onClick={() => setPhotoTab('url')}
                >
                  🌐 URL
                </button>
              </div>
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
                {sortedPresets.map((p, idx) => (
                  <div
                    key={idx}
                    className={`preset-photo-card ${photoUrl === p.url ? 'selected' : ''}`}
                    onClick={() => {
                      setPhotoUrl(p.url);
                      setEmoji(p.emoji);
                    }}
                  >
                    <img src={p.url} alt={p.name} className="preset-thumb" loading="lazy" />
                    <span className="preset-name">{p.emoji} {p.name.split('/')[0]}</span>
                    {photoUrl === p.url && (
                      <div className="preset-check">
                        <Check size={11} strokeWidth={3} />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {photoTab === 'upload' && (
              <div className="upload-box-area">
                <button
                  type="button"
                  className="upload-trigger-btn"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload size={22} className="camera-icon-pulse" />
                  <strong>{lang === 'ta' ? 'புகைப்படம் தேர்ந்தெடுக்கவும்' : 'Tap to Upload Photo'}</strong>
                  <span>{lang === 'ta' ? 'கேமரா அல்லது கேலரி' : 'Camera or Gallery'}</span>
                </button>
              </div>
            )}

            {photoTab === 'url' && (
              <div className="form-field" style={{ marginTop: '6px' }}>
                <input
                  type="url"
                  value={photoUrl}
                  onChange={(e) => setPhotoUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                />
              </div>
            )}

            {photoUrl && (
              <div className="chosen-photo-preview-box">
                <img src={photoUrl} alt="Preview" className="preview-img" />
                <div className="preview-info">
                  <span className="preview-badge">✓ {lang === 'ta' ? 'தேர்ந்தெடுக்கப்பட்ட படம்' : 'Photo Selected'}</span>
                  <span className="preview-sub-hint">{emoji} {name || 'Item'}</span>
                </div>
              </div>
            )}
          </div>

          {/* Notes */}
          <div className="form-field">
            <label className="field-label-bold">{lang === 'ta' ? 'குறிப்புகள் (Notes / Brand)' : 'Notes / Brand'}</label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Aashirvaad, Fresh, 2 packets..."
            />
          </div>

          {/* Modal Actions */}
          <div className="modal-actions">
            <button type="button" className="btn-cancel" onClick={onClose}>
              {lang === 'ta' ? 'ரத்து செய்' : 'Cancel'}
            </button>
            <button type="submit" className="btn-save">
              {editItem
                ? (lang === 'ta' ? 'புதுப்பி' : 'Update Item')
                : (lang === 'ta' ? 'பட்டியலில் சேர்' : 'Add to List')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
