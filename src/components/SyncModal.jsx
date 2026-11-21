import { X, Copy, Check, QrCode, Users, Layers } from 'lucide-react';

export default function SyncModal({
  isOpen,
  onClose,
  household,
  user: _user,
  onlinePeers,
  networkInfo,
  onJoinHousehold,
  onToggleDualMobileView,
  isDualMobileView,
  lang
}) {
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [joinCodeInput, setJoinCodeInput] = useState('');
  const [joinError, setJoinError] = useState('');

  if (!isOpen) return null;

  const handleCopyCode = () => {
    if (!household?.code) return;
    navigator.clipboard.writeText(household.code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleCopyUrl = () => {
    if (!networkInfo?.mobileUrl) return;
    navigator.clipboard.writeText(networkInfo.mobileUrl);
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2000);
  };

  const handleJoinSubmit = async (e) => {
    e.preventDefault();
    if (!joinCodeInput.trim()) return;
    setJoinError('');
    try {
      await onJoinHousehold(joinCodeInput.trim());
      setJoinCodeInput('');
      onClose();
    } catch (err) {
      setJoinError(err.message || 'Failed to join code');
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-sheet sync-sheet" onClick={(e) => e.stopPropagation()}>
        <div className="modal-drag-handle"></div>

        <div className="modal-header">
          <div className="modal-title-wrap">
            <span className="modal-icon">📲</span>
            <h2>{lang === 'ta' ? 'இரண்டு மொபைல் ஒத்திசைவு (2 Mobile Sync)' : '2 Mobile Synchronization'}</h2>
          </div>
          <button className="modal-close-btn" onClick={onClose} aria-label="Close">
            <X size={20} />
          </button>
        </div>

        {/* Live Status Pill */}
        <div className="sync-status-banner">
          <div className="live-dot-pulse"></div>
          <div>
            <strong>
              {onlinePeers && onlinePeers.length > 1
                ? `${onlinePeers.length} ${lang === 'ta' ? 'மொபைல்கள் இணைந்துள்ளன (Live Synced)' : 'Mobiles Connected & Synced'}`
                : (lang === 'ta' ? 'ஒத்திசைவு செயலில் உள்ளது (Live Active)' : 'Live WebSocket Sync Ready')}
            </strong>
            <p>{household?.name || 'My Family List'}</p>
          </div>
        </div>

        {/* Sync Code Box */}
        <div className="sync-code-box">
          <span className="sync-code-label">
            {lang === 'ta' ? 'குடும்ப ஒத்திசைவு குறியீடு (Family Sync Code):' : 'Family Sync Code:'}
          </span>
          <div className="sync-code-display">
            <span className="code-text">{household?.code || 'SYNC-101'}</span>
            <button
              type="button"
              className="copy-code-btn"
              onClick={handleCopyCode}
            >
              {copiedCode ? <Check size={16} /> : <Copy size={16} />}
              <span>{copiedCode ? (lang === 'ta' ? 'நகலெடுக்கப்பட்டது!' : 'Copied!') : (lang === 'ta' ? 'நகல் எடு' : 'Copy')}</span>
            </button>
          </div>
          <p className="sync-code-hint">
            {lang === 'ta'
              ? '2-வது மொபைலில் இந்த குறியீட்டை உள்ளிட்டால், இரண்டு மொபைலிலும் ஒரே பட்டியல் நிகழ்நேரத்தில் மாறும்!'
              : 'Enter this code on the 2nd mobile to share and sync the shopping list in real-time!'}
          </p>
        </div>

        {/* QR Code & Wi-Fi URL Section */}
        {networkInfo && (
          <div className="wifi-pairing-box">
            <div className="wifi-header">
              <QrCode size={18} />
              <h4>{lang === 'ta' ? '2-வது மொபைலில் திறக்க (Scan to Open):' : 'Scan with 2nd Mobile:'}</h4>
            </div>

            {networkInfo.qrCodeDataUrl && (
              <div className="qr-container">
                <img src={networkInfo.qrCodeDataUrl} alt="Sync QR Code" className="qr-img" />
              </div>
            )}

            <div className="wifi-url-row">
              <input
                type="text"
                readOnly
                value={networkInfo.mobileUrl}
                className="wifi-url-input"
              />
              <button
                type="button"
                className="copy-url-btn"
                onClick={handleCopyUrl}
              >
                {copiedUrl ? <Check size={14} /> : <Copy size={14} />}
              </button>
            </div>
            <span className="wifi-hint">
              📶 {lang === 'ta' ? 'ஒரே Wi-Fi இணைப்பில் உள்ள எந்த மொபைலிலும் இந்த முகவரியைத் திறந்து பயன்படுத்தலாம்' : 'Open this URL on any phone connected to the same Wi-Fi'}
            </span>
          </div>
        )}

        {/* Dual Phone Simulator Mode Toggle */}
        <div className="dual-preview-promo-box">
          <div className="dual-promo-info">
            <Layers size={20} className="dual-icon" />
            <div>
              <strong>{lang === 'ta' ? 'கணினியில் 2 மொபைல் காட்சி' : 'Dual Mobile Side-by-Side View'}</strong>
              <p>{lang === 'ta' ? 'இரண்டு மொபைல்களை திரையிலேயே அருகருகே வைத்து நேரடி ஒத்திசைவை சோதிக்கலாம்' : 'Simulate Phone 1 & Phone 2 side-by-side on screen'}</p>
            </div>
          </div>
          <button
            type="button"
            className={`dual-toggle-btn ${isDualMobileView ? 'active' : ''}`}
            onClick={() => {
              onToggleDualMobileView();
              onClose();
            }}
          >
            {isDualMobileView 
              ? (lang === 'ta' ? 'ஒற்றை மொபைல் தோற்றம்' : 'Single Mobile') 
              : (lang === 'ta' ? '2 மொபைல் தோற்றம் காட்டு' : 'Open 2 Mobiles')}
          </button>
        </div>

        {/* Active Connected Devices List */}
        {onlinePeers && onlinePeers.length > 0 && (
          <div className="online-peers-box">
            <h4>
              <Users size={14} />
              <span>{lang === 'ta' ? 'இணைக்கப்பட்டுள்ள சாதனங்கள்:' : 'Connected Devices:'}</span>
            </h4>
            <div className="peers-list">
              {onlinePeers.map((peer, idx) => (
                <div key={idx} className="peer-chip">
                  <span className="peer-dot">🟢</span>
                  <span className="peer-name">{peer.name}</span>
                  <span className="peer-device">({peer.deviceName})</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Android .APK & Mobile App Installation Box */}
        <div className="apk-install-guide-box">
          <div className="apk-header">
            <span className="apk-icon">🤖</span>
            <div>
              <strong>{lang === 'ta' ? 'Android நேரடி .APK ஃபைல் தயார்!' : 'Android .APK File Ready!'}</strong>
              <p>{lang === 'ta' ? 'உங்கள் இரண்டு போன்களிலும் இந்த APK-ஐ நிறுவி Sync செய்யலாம்' : 'Install APK on both phones to sync'}</p>
            </div>
          </div>

          {/* Big Download APK Button */}
          <a
            href="/SmartGrocery.apk"
            download="SmartGrocery.apk"
            className="direct-apk-download-btn"
          >
            <span className="dl-icon">📥</span>
            <div>
              <strong>{lang === 'ta' ? 'SmartGrocery.apk பதிவிறக்கு (Download APK)' : 'Download SmartGrocery.apk (4.25 MB)'}</strong>
              <span>{lang === 'ta' ? 'நேரடியாக மொபைலில் பதிவிறக்கம் செய்து நிறுவலாம்' : 'Tap to download directly to phone'}</span>
            </div>
          </a>

          <div className="apk-methods-list" style={{ marginTop: '10px' }}>
            <div className="apk-method-item">
              <span className="method-num">📁</span>
              <div>
                <strong>{lang === 'ta' ? 'கணினியில் உள்ள இடம்:' : 'Location on Computer:'}</strong>
                <p style={{ wordBreak: 'break-all', fontFamily: 'monospace', fontSize: '10px' }}>
                  E:\software 15-11-26\shopping list\SmartGrocery.apk
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Join Another Code */}
        <form onSubmit={handleJoinSubmit} className="join-code-form">
          <label>{lang === 'ta' ? 'வேறு குடும்ப குறியீட்டுடன் இணைய:' : 'Join another Family Code:'}</label>
          {joinError && <span className="join-error">⚠️ {joinError}</span>}
          <div className="join-input-row">
            <input
              type="text"
              placeholder="எ.கா: SYNC-101"
              value={joinCodeInput}
              onChange={(e) => setJoinCodeInput(e.target.value.toUpperCase())}
            />
            <button type="submit" className="join-submit-btn">
              {lang === 'ta' ? 'இணை' : 'Join'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
