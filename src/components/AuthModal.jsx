import React, { useState } from 'react';
import { X, Smartphone, Key, User, Home, Sparkles, Check, Copy, MessageSquare, ArrowRight } from 'lucide-react';
import { authApi } from '../services/api';

export default function AuthModal({ isOpen, onClose, onAuthSuccess, lang, currentCode }) {
  // Mode: 'father-register' (First person/Father) | 'mother-join' (Second person/Mother with code) | 'login'
  const [tab, setTab] = useState('father-register');
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [familyCodeInput, setFamilyCodeInput] = useState(currentCode || '');
  const [familyNameInput, setFamilyNameInput] = useState('');
  
  // Post-Registration Code Celebration Screen
  const [generatedFamilyInfo, setGeneratedFamilyInfo] = useState(null); // { code, familyName, user }
  const [copiedCode, setCopiedCode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleFatherRegister = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await authApi.register({
        name: name.trim() || 'அப்பா (Father)',
        username: username.trim(),
        password,
        householdChoice: 'create',
        newHouseholdName: familyNameInput.trim() || `${name || 'நமது'} குடும்பம்`
      });

      // Show the generated Family Code screen
      setGeneratedFamilyInfo({
        code: res.household.code,
        familyName: res.household.name,
        user: res.user,
        household: res.household,
        items: res.items
      });
    } catch (err) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const handleMotherJoin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!familyCodeInput.trim()) {
      setError(lang === 'ta' ? 'அப்பா தந்த குடும்பக் குறியீட்டை உள்ளிடவும்' : 'Please enter the Family Sync Code');
      setLoading(false);
      return;
    }

    try {
      const res = await authApi.register({
        name: name.trim() || 'அம்மா (Mother)',
        username: username.trim(),
        password,
        householdChoice: 'join',
        existingCode: familyCodeInput.trim().toUpperCase()
      });

      onAuthSuccess(res.user, res.household, res.items);
      onClose();
    } catch (err) {
      setError(err.message || 'Join failed. Check the code.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await authApi.login({
        username: username.trim(),
        password
      });
      onAuthSuccess(res.user, res.household, res.items);
      onClose();
    } catch (err) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  // Quick Demo Login for instant testing
  const handleQuickDemo = async (demoUser) => {
    setError('');
    setLoading(true);
    try {
      const res = await authApi.login({
        username: demoUser,
        password: '123'
      });
      onAuthSuccess(res.user, res.household, res.items);
      onClose();
    } catch (err) {
      setError(err.message || 'Demo login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyCode = () => {
    if (!generatedFamilyInfo?.code) return;
    navigator.clipboard.writeText(generatedFamilyInfo.code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleSendCodeToMotherWhatsApp = () => {
    if (!generatedFamilyInfo?.code) return;
    const text = encodeURIComponent(
      `🛒 *மளிகைப் பட்டியல் - குடும்பக் குறியீடு (Family Code)*\n\nவணக்கம்! நமது குடும்ப மளிகை மற்றும் மருந்துகள் பட்டியலின் குறியீடு: *${generatedFamilyInfo.code}*\n\nஉங்கள் மொபைலில் செயலியைத் திறந்து, இந்த குறியீட்டை உள்ளிட்டால், நாம் இருவரும் ஒரே பட்டியலில் நிகழ்நேரத்தில் இணைந்து கொள்ளலாம்!\n\nலிங்க்: http://192.168.31.215:5173/`
    );
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  };

  const handleFinishFatherRegistration = () => {
    if (generatedFamilyInfo) {
      onAuthSuccess(generatedFamilyInfo.user, generatedFamilyInfo.household, generatedFamilyInfo.items);
      onClose();
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-sheet auth-sheet" onClick={(e) => e.stopPropagation()}>
        <div className="modal-drag-handle"></div>

        {/* ============================================================
            SCREEN 1: FATHER CODE GENERATED CELEBRATION SCREEN
        ============================================================ */}
        {generatedFamilyInfo ? (
          <div className="code-celebration-container">
            <div className="celebration-badge-row">
              <span className="celebration-emoji">🎉</span>
              <h3>{lang === 'ta' ? 'பதிவு முடிந்தது! குடும்பக் குறியீடு தயார்!' : 'Family Code Generated Successfully!'}</h3>
            </div>

            <p className="celebration-desc">
              {lang === 'ta'
                ? `வணக்கம் ${generatedFamilyInfo.user.name}! உங்கள் "${generatedFamilyInfo.familyName}" குடும்பத்திற்கென தனிப்பட்ட ஒத்திசைவு குறியீடு உருவாக்கப்பட்டது:`
                : `Welcome ${generatedFamilyInfo.user.name}! Your family sync code is ready:`}
            </p>

            {/* BIG PROMINENT FAMILY CODE CARD */}
            <div className="big-family-code-card">
              <span className="code-subtitle">
                {lang === 'ta' ? 'உங்கள் குடும்பக் குறியீடு (Family Code):' : 'Your Family Sync Code:'}
              </span>
              <div className="big-code-val">
                {generatedFamilyInfo.code}
              </div>
              
              <div className="code-actions-grid">
                <button
                  type="button"
                  className="code-action-btn copy-btn-large"
                  onClick={handleCopyCode}
                >
                  {copiedCode ? <Check size={18} /> : <Copy size={18} />}
                  <span>{copiedCode ? (lang === 'ta' ? 'நகலெடுக்கப்பட்டது!' : 'Copied!') : (lang === 'ta' ? 'குறியீட்டை நகலெடு' : 'Copy Code')}</span>
                </button>

                <button
                  type="button"
                  className="code-action-btn whatsapp-btn-large"
                  onClick={handleSendCodeToMotherWhatsApp}
                >
                  <MessageSquare size={18} />
                  <span>{lang === 'ta' ? 'அம்மாவுக்கு WhatsApp-ல் அனுப்பு' : 'Send to Mother via WhatsApp'}</span>
                </button>
              </div>
            </div>

            {/* Step-by-Step Instructions */}
            <div className="next-step-guide">
              <strong>👉 {lang === 'ta' ? 'அடுத்த படி (Next Step):' : 'Next Step:'}</strong>
              <p>
                {lang === 'ta'
                  ? `அம்மா (Mother) தனது மொபைலில் இந்த ஆப்பைத் திறந்து, "குடும்ப உறுப்பினராக இணைய" என்பதைத் தொட்டு, "${generatedFamilyInfo.code}" என்ற குறியீட்டை உள்ளிட்டால், இருவரும் உடனே இணைக்கப்பட்டுவிடுவார்கள்!`
                  : `Mother can open this app on her phone, choose "Join with Code", and enter "${generatedFamilyInfo.code}" to instantly sync!`}
              </p>
            </div>

            <button
              type="button"
              className="start-shopping-btn"
              onClick={handleFinishFatherRegistration}
            >
              <span>{lang === 'ta' ? 'குடும்பப் பட்டியலைத் திறக்கவும்' : 'Open Family Shopping List'}</span>
              <ArrowRight size={18} />
            </button>
          </div>
        ) : (
          /* ============================================================
             SCREEN 2: REGISTRATION & LOGIN TABS
          ============================================================ */
          <>
            <div className="modal-header">
              <div className="modal-title-wrap">
                <span className="modal-icon">👨‍👩‍👧</span>
                <h2>
                  {tab === 'father-register' 
                    ? (lang === 'ta' ? '1. குடும்பத் தலைவர் பதிவு (அப்பா)' : '1. Family Head Register (Father)')
                    : tab === 'mother-join'
                    ? (lang === 'ta' ? '2. குடும்ப உறுப்பினராக இணைய (அம்மா)' : '2. Join with Code (Mother)')
                    : (lang === 'ta' ? '3. உள்நுழைக (Sign In)' : '3. Sign In')}
                </h2>
              </div>
              <button className="modal-close-btn" onClick={onClose} aria-label="Close">
                <X size={20} />
              </button>
            </div>

            {/* Role / Tab Selector */}
            <div className="family-role-tabs">
              <button
                type="button"
                className={`family-role-tab ${tab === 'father-register' ? 'active father' : ''}`}
                onClick={() => { setTab('father-register'); setError(''); }}
              >
                <span className="role-tab-icon">👨</span>
                <div className="role-tab-text">
                  <strong>{lang === 'ta' ? 'அப்பா (புதிய குடும்பம்)' : 'Father (Create)'}</strong>
                  <span>{lang === 'ta' ? 'குறியீடு உருவாக்க' : 'Get Family Code'}</span>
                </div>
              </button>

              <button
                type="button"
                className={`family-role-tab ${tab === 'mother-join' ? 'active mother' : ''}`}
                onClick={() => { setTab('mother-join'); setError(''); }}
              >
                <span className="role-tab-icon">👩</span>
                <div className="role-tab-text">
                  <strong>{lang === 'ta' ? 'அம்மா (உறுப்பினர்)' : 'Mother (Join)'}</strong>
                  <span>{lang === 'ta' ? 'குறியீட்டுடன் இணைய' : 'Enter Code & Sync'}</span>
                </div>
              </button>

              <button
                type="button"
                className={`family-role-tab ${tab === 'login' ? 'active login' : ''}`}
                onClick={() => { setTab('login'); setError(''); }}
              >
                <span className="role-tab-icon">🔑</span>
                <div className="role-tab-text">
                  <strong>{lang === 'ta' ? 'உள்நுழைக' : 'Login'}</strong>
                  <span>{lang === 'ta' ? 'கணக்கு உள்ளதா?' : 'Existing user'}</span>
                </div>
              </button>
            </div>

            {error && (
              <div className="auth-error-alert">
                <span>⚠️ {error}</span>
              </div>
            )}

            {/* TAB 1: FATHER REGISTRATION (Creates family & generates code) */}
            {tab === 'father-register' && (
              <form onSubmit={handleFatherRegister} className="auth-form">
                <div className="role-helper-note">
                  <span className="note-icon">💡</span>
                  <p>
                    {lang === 'ta' 
                      ? 'முதலில் நீங்கள் பதிவு செய்ததும், ஒரு தனித்துவமான "குடும்பக் குறியீடு" (Family Code) உங்களுக்கு வழங்கப்படும். அதை அம்மாவிடம் கொடுத்து இணையலாம்.'
                      : 'Register first to generate a unique Family Sync Code. You can then share this code with Mother!'}
                  </p>
                </div>

                <div className="form-field">
                  <label>{lang === 'ta' ? 'உங்கள் பெயர் (Name)' : 'Your Name'}</label>
                  <div className="input-icon-wrap">
                    <User size={16} className="field-icon" />
                    <input
                      type="text"
                      placeholder={lang === 'ta' ? 'எ.கா: அப்பா / குமார்' : 'e.g. Kumar (Dad)'}
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="form-field">
                  <label>{lang === 'ta' ? 'மொபைல் எண் / பயனர் பெயர் (Mobile / Username)' : 'Mobile or Username'}</label>
                  <div className="input-icon-wrap">
                    <Smartphone size={16} className="field-icon" />
                    <input
                      type="text"
                      placeholder={lang === 'ta' ? 'எ.கா: 9876543210 அல்லது appa' : 'e.g. 9876543210 or appa'}
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="form-field">
                  <label>{lang === 'ta' ? 'கடவுச்சொல் / PIN (Password)' : 'Password / PIN'}</label>
                  <div className="input-icon-wrap">
                    <Key size={16} className="field-icon" />
                    <input
                      type="password"
                      placeholder="••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="form-field">
                  <label>{lang === 'ta' ? 'குடும்ப பெயர் (Family Name - விருப்பம்)' : 'Family Name (Optional)'}</label>
                  <div className="input-icon-wrap">
                    <Home size={16} className="field-icon" />
                    <input
                      type="text"
                      placeholder={lang === 'ta' ? 'எ.கா: குமார் குடும்பம்' : 'e.g. Kumar Family'}
                      value={familyNameInput}
                      onChange={(e) => setFamilyNameInput(e.target.value)}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="auth-submit-btn father-btn"
                  disabled={loading}
                >
                  {loading 
                    ? (lang === 'ta' ? 'குறியீடு உருவாக்கப்படுகிறது...' : 'Generating Code...') 
                    : (lang === 'ta' ? '👨‍👩‍👧 பதிவு செய்து குடும்பக் குறியீடு பெறுக' : 'Register & Generate Family Code')}
                </button>
              </form>
            )}

            {/* TAB 2: MOTHER / MEMBER JOIN WITH CODE */}
            {tab === 'mother-join' && (
              <form onSubmit={handleMotherJoin} className="auth-form">
                <div className="role-helper-note mother-note">
                  <span className="note-icon">👩‍👧‍👦</span>
                  <p>
                    {lang === 'ta'
                      ? 'அப்பா பதிவு செய்து அனுப்பிய குடும்பக் குறியீட்டை (Family Code) கீழே உள்ளிட்டு இணைத்துக் கொள்ளுங்கள்!'
                      : 'Enter the Family Sync Code provided by Father to join the shared shopping list!'}
                  </p>
                </div>

                {/* HIGHLIGHTED FAMILY CODE INPUT */}
                <div className="form-field highlight-code-field">
                  <label className="highlight-label">
                    🔑 {lang === 'ta' ? 'அப்பா தந்த குடும்பக் குறியீடு (Family Sync Code):' : 'Family Sync Code from Father:'}
                  </label>
                  <input
                    type="text"
                    className="big-code-input"
                    placeholder="எ.கா: FAM-7482 அல்லது SYNC-101"
                    value={familyCodeInput}
                    onChange={(e) => setFamilyCodeInput(e.target.value.toUpperCase())}
                    required
                  />
                  <span className="field-sub-note">
                    {lang === 'ta' ? 'இந்த குறியீட்டை உள்ளிட்டதும் இருவரும் ஒரே பட்டியலில் இணைந்து விடுவீர்கள்' : 'Entering this code connects both mobiles to the same list'}
                  </span>
                </div>

                <div className="form-field">
                  <label>{lang === 'ta' ? 'உங்கள் பெயர் (Name)' : 'Your Name'}</label>
                  <div className="input-icon-wrap">
                    <User size={16} className="field-icon" />
                    <input
                      type="text"
                      placeholder={lang === 'ta' ? 'எ.கா: அம்மா / செல்வி' : 'e.g. Selvi (Mom)'}
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="form-field">
                  <label>{lang === 'ta' ? 'மொபைல் எண் / பயனர் பெயர் (Mobile / Username)' : 'Mobile or Username'}</label>
                  <div className="input-icon-wrap">
                    <Smartphone size={16} className="field-icon" />
                    <input
                      type="text"
                      placeholder={lang === 'ta' ? 'எ.கா: 9876543211 அல்லது amma' : 'e.g. amma'}
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="form-field">
                  <label>{lang === 'ta' ? 'கடவுச்சொல் / PIN (Password)' : 'Password / PIN'}</label>
                  <div className="input-icon-wrap">
                    <Key size={16} className="field-icon" />
                    <input
                      type="password"
                      placeholder="••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="auth-submit-btn mother-btn"
                  disabled={loading}
                >
                  {loading 
                    ? (lang === 'ta' ? 'இணைக்கப்படுகிறது...' : 'Joining...') 
                    : (lang === 'ta' ? '👩‍👧‍👦 குடும்பப் பட்டியலில் இணைந்து தொடங்கவும்' : 'Join Family List & Start Syncing')}
                </button>
              </form>
            )}

            {/* TAB 3: LOGIN */}
            {tab === 'login' && (
              <form onSubmit={handleLogin} className="auth-form">
                <div className="form-field">
                  <label>{lang === 'ta' ? 'பயனர் பெயர் / மொபைல் (Username / Mobile)' : 'Username or Mobile'}</label>
                  <div className="input-icon-wrap">
                    <Smartphone size={16} className="field-icon" />
                    <input
                      type="text"
                      placeholder={lang === 'ta' ? 'எ.கா: appa அல்லது amma' : 'e.g. appa or amma'}
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="form-field">
                  <label>{lang === 'ta' ? 'கடவுச்சொல் (Password)' : 'Password'}</label>
                  <div className="input-icon-wrap">
                    <Key size={16} className="field-icon" />
                    <input
                      type="password"
                      placeholder="••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="auth-submit-btn"
                  disabled={loading}
                >
                  {loading ? 'Logging in...' : (lang === 'ta' ? 'உள்நுழைக' : 'Sign In')}
                </button>
              </form>
            )}

            {/* Instant Demo Testing Buttons */}
            <div className="demo-accounts-box">
              <div className="demo-title">
                <Sparkles size={14} />
                <span>{lang === 'ta' ? 'உடனடி 1-கிளிக் சோதனை (Demo Login):' : '1-Click Instant Demo Login:'}</span>
              </div>

              <div className="demo-buttons-grid">
                <button
                  type="button"
                  className="demo-btn phone-1"
                  onClick={() => handleQuickDemo('appa')}
                  disabled={loading}
                >
                  <span className="demo-icon">👨</span>
                  <div>
                    <strong>{lang === 'ta' ? 'அப்பா (Home - வீட்டில்)' : 'Father (Home Device)'}</strong>
                    <span>Code: SYNC-101</span>
                  </div>
                </button>

                <button
                  type="button"
                  className="demo-btn phone-2"
                  onClick={() => handleQuickDemo('amma')}
                  disabled={loading}
                >
                  <span className="demo-icon">👩</span>
                  <div>
                    <strong>{lang === 'ta' ? 'அம்மா (Shop - கடையில்)' : 'Mother (Shop Device)'}</strong>
                    <span>Code: SYNC-101</span>
                  </div>
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
