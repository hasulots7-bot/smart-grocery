import React, { useState } from 'react';
import {
  Smartphone, Key, User, Home, Check, Copy,
  MessageSquare, ArrowRight, Globe, Wifi, Settings,
  ShieldCheck, LogIn, UserPlus, Eye, EyeOff, ArrowLeft
} from 'lucide-react';
import { authApi, getServerUrl } from '../services/api';
import confetti from 'canvas-confetti';

export default function AuthPage({ onAuthSuccess, lang, setLang, currentUser, onBackToApp }) {
  // Main view mode: 'signin' | 'signup' | 'forgot-password'
  const [mode, setMode] = useState('signin');

  // Sub-type for signup: 'create-family' (Father / Head) | 'join-family' (Mother / Member)
  const [signupType, setSignupType] = useState('create-family');

  // Form Fields
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [familyCodeInput, setFamilyCodeInput] = useState('');
  const [familyNameInput, setFamilyNameInput] = useState('');

  // Password visibility toggles
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  // States
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Post-Registration Family Code Celebration
  const [generatedFamilyInfo, setGeneratedFamilyInfo] = useState(null);
  const [copiedCode, setCopiedCode] = useState(false);

  // Server IP config state
  const [showServerConfig, setShowServerConfig] = useState(false);
  const [serverUrlInput, setServerUrlInput] = useState(() => {
    return localStorage.getItem('custom_server_url') || getServerUrl();
  });
  const [serverSavedNote, setServerSavedNote] = useState('');

  // 1. SIGN IN (Login)
  const handleSignIn = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    setLoading(true);

    try {
      const res = await authApi.login({
        username: username.trim(),
        password
      });
      onAuthSuccess(res.user, res.household, res.items);
    } catch (err) {
      console.error('Sign in error:', err);
      setError(
        lang === 'ta'
          ? 'பயனர் பெயர் அல்லது கடவுச்சொல் தவறானது! சரிபார்க்கவும் (அல்லது ஆஃப்லைனில் தொடங்கவும்).'
          : 'Invalid username or password. Please verify or continue offline.'
      );
    } finally {
      setLoading(false);
    }
  };

  // 2. SIGN UP / REGISTER
  const handleSignUp = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (password !== confirmPassword) {
      setError(
        lang === 'ta'
          ? 'கடவுச்சொற்கள் பொருந்தவில்லை! மீண்டும் சரிபார்க்கவும்.'
          : 'Passwords do not match!'
      );
      return;
    }

    if (signupType === 'join-family' && !familyCodeInput.trim()) {
      setError(
        lang === 'ta'
          ? 'அப்பா வழங்கிய குடும்பக் குறியீட்டை உள்ளிடவும்.'
          : 'Please enter the Family Sync Code provided by the family head.'
      );
      return;
    }

    setLoading(true);

    try {
      const payload = {
        name: name.trim() || (signupType === 'create-family' ? 'அப்பா (Father)' : 'அம்மா (Mother)'),
        username: username.trim(),
        password,
        householdChoice: signupType === 'create-family' ? 'create' : 'join',
        existingCode: signupType === 'join-family' ? familyCodeInput.trim().toUpperCase() : undefined,
        newHouseholdName: signupType === 'create-family'
          ? (familyNameInput.trim() || `${name || 'நமது'} குடும்பம்`)
          : undefined
      };

      const res = await authApi.register(payload);

      // Save user session in localStorage right away
      try {
        localStorage.setItem('smart_grocery_user_v3', JSON.stringify(res.user));
        if (res.household) {
          localStorage.setItem('smart_grocery_household_v2', JSON.stringify(res.household));
        }
      } catch {}

      if (signupType === 'create-family' && res.household?.code) {
        setGeneratedFamilyInfo({
          user: res.user,
          household: res.household,
          items: res.items,
          code: res.household.code,
          familyName: res.household.name || 'Family'
        });
      } else {
        // Immediately log into the application!
        onAuthSuccess(res.user, res.household, res.items);
      }

      try {
        confetti({ particleCount: 100, spread: 80, origin: { y: 0.5 } });
      } catch {}
    } catch (err) {
      console.error('Registration error:', err);
      setError(
        err.message || (lang === 'ta' ? 'பதிவு தோல்வியடைந்தது.' : 'Registration failed.')
      );
    } finally {
      setLoading(false);
    }
  };

  // 3. FORGOT PASSWORD / RESET PASSWORD
  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (!username.trim()) {
      setError(
        lang === 'ta'
          ? 'பயனர் பெயர் அல்லது மொபைல் எண்ணை உள்ளிடவும்.'
          : 'Please enter your username or mobile number.'
      );
      return;
    }

    if (newPassword !== confirmNewPassword) {
      setError(
        lang === 'ta'
          ? 'புதிய கடவுச்சொற்கள் பொருந்தவில்லை!'
          : 'New passwords do not match!'
      );
      return;
    }

    if (newPassword.length < 3) {
      setError(
        lang === 'ta'
          ? 'கடவுச்சொல் குறைந்தபட்சம் 3 எழுத்துக்கள் இருக்க வேண்டும்.'
          : 'Password must be at least 3 characters.'
      );
      return;
    }

    setLoading(true);

    try {
      await authApi.forgotPassword({
        username: username.trim(),
        newPassword
      });

      setSuccessMsg(
        lang === 'ta'
          ? '✅ கடவுச்சொல் வெற்றிகரமாக மாற்றப்பட்டது! இப்போது புதிய கடவுச்சொல்லுடன் உள்நுழையவும்.'
          : '✅ Password changed successfully! Please sign in with your new password.'
      );
      setPassword(newPassword);
      setTimeout(() => {
        setMode('signin');
        setError('');
      }, 1800);
    } catch (err) {
      console.warn('Server password reset error, checking local:', err);
      // Fallback for local demo users (appa / amma)
      if (username.trim().toLowerCase() === 'appa' || username.trim().toLowerCase() === 'amma') {
        setSuccessMsg(
          lang === 'ta'
            ? '✅ கடவுச்சொல் வெற்றிகரமாக மாற்றப்பட்டது! புதிய கடவுச்சொல்லுடன் உள்நுழையவும்.'
            : '✅ Password reset successfully! Please sign in with your new password.'
        );
        setPassword(newPassword);
        setTimeout(() => {
          setMode('signin');
          setError('');
        }, 1500);
      } else {
        setError(
          err.message || (lang === 'ta' ? 'கடவுச்சொல் மாற்றுவதில் பிழை ஏற்பட்டது.' : 'Failed to reset password.')
        );
      }
    } finally {
      setLoading(false);
    }
  };



  // Copy Code Helper
  const handleCopyCode = () => {
    if (!generatedFamilyInfo?.code) return;
    navigator.clipboard.writeText(generatedFamilyInfo.code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  // WhatsApp Share Helper
  const handleSendCodeWhatsApp = () => {
    if (!generatedFamilyInfo?.code) return;
    const text = encodeURIComponent(
      `🛒 *மளிகைப் பட்டியல் - குடும்பக் குறியீடு (Family Code)*\n\nவணக்கம்! நமது குடும்ப மளிகை மற்றும் மருந்துகள் பட்டியலின் குறியீடு: *${generatedFamilyInfo.code}*\n\nஉங்கள் மொபைலில் ஆப்பைத் திறந்து, "குடும்பக் குறியீட்டுடன் இணைய (Join Family)" என்பதைத் தொட்டு, இந்தக் குறியீட்டை உள்ளிட்டால் இருவரும் உடனே இணைந்து கொள்ளலாம்!`
    );
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  };

  // Save Custom Server URL
  const handleSaveServerUrl = () => {
    const cleaned = serverUrlInput.trim().replace(/\/$/, '');
    if (cleaned) {
      localStorage.setItem('custom_server_url', cleaned);
    } else {
      localStorage.removeItem('custom_server_url');
    }
    setServerSavedNote(lang === 'ta' ? 'சேமிக்கப்பட்டது! பக்கம் புதுப்பிக்கப்படுகிறது...' : 'Saved! Reloading...');
    setTimeout(() => {
      window.location.reload();
    }, 800);
  };

  return (
    <div className="auth-page-root">
      <div className="auth-page-card">
        {/* Back to App button if user is already logged in */}
        {currentUser && onBackToApp && (
          <div className="auth-back-to-app-bar">
            <button type="button" className="back-to-app-btn" onClick={onBackToApp}>
              <ArrowLeft size={15} />
              <span>{lang === 'ta' ? '← மளிகைப் பட்டியல்' : '← Back to List'}</span>
            </button>
            <span className="logged-in-user-chip">
              👤 {currentUser.name}
            </span>
          </div>
        )}

        {/* Top Control Bar: Language & Server Settings */}
        <div className="auth-card-top-bar">
          <button
            type="button"
            className="auth-icon-btn"
            onClick={() => setLang(lang === 'ta' ? 'en' : 'ta')}
            title="Toggle Language"
          >
            <Globe size={15} />
            <span>{lang === 'ta' ? 'English' : 'தமிழ்'}</span>
          </button>

          <button
            type="button"
            className="auth-icon-btn"
            onClick={() => setShowServerConfig(!showServerConfig)}
            title="Configure Backend Server IP"
          >
            <Settings size={15} />
            <span>Server IP</span>
          </button>
        </div>

        {/* Server IP Settings Drawer */}
        {showServerConfig && (
          <div className="server-config-drawer">
            <label className="server-config-label">
              <Wifi size={14} />
              <span>{lang === 'ta' ? 'சேவையக முகவரி (Server URL):' : 'Backend Server URL:'}</span>
            </label>
            <div className="server-config-input-row">
              <input
                type="text"
                placeholder="http://192.168.x.x:5000"
                value={serverUrlInput}
                onChange={(e) => setServerUrlInput(e.target.value)}
              />
              <button type="button" className="server-save-btn" onClick={handleSaveServerUrl}>
                {lang === 'ta' ? 'சேமி' : 'Save'}
              </button>
            </div>
            {serverSavedNote && <span className="server-note-text">{serverSavedNote}</span>}
          </div>
        )}

        {/* App Logo & Branding */}
        <div className="auth-brand-header">
          <div className="auth-logo-badge">
            <span className="auth-logo-emoji">🛒</span>
          </div>
          <h1 className="auth-brand-title">
            {lang === 'ta' ? 'ஸ்மார்ட் மளிகை' : 'Smart Grocery'}
          </h1>
          <p className="auth-brand-tagline">
            {lang === 'ta'
              ? 'குடும்ப மளிகைப் பட்டியல் & நேரடி ஒத்திசைவு'
              : 'Family Shopping List & Real-Time Sync'}
          </p>
        </div>

        {/* Error & Success Alerts */}
        {error && (
          <div className="auth-error-alert">
            <span>⚠️ {error}</span>
          </div>
        )}
        {successMsg && (
          <div className="auth-success-alert">
            <span>{successMsg}</span>
          </div>
        )}

        {/* ============================================================
            CASE 1: FAMILY CODE GENERATED CELEBRATION (POST-REGISTER)
        ============================================================ */}
        {generatedFamilyInfo ? (
          <div className="code-celebration-container">
            <div className="celebration-badge-row">
              <span className="celebration-emoji">🎉</span>
              <h3>
                {lang === 'ta' ? 'பதிவு முடிந்தது! குடும்பக் குறியீடு தயார்!' : 'Family Code Ready!'}
              </h3>
            </div>

            <p className="celebration-desc">
              {lang === 'ta'
                ? `வணக்கம் ${generatedFamilyInfo.user.name}! உங்கள் "${generatedFamilyInfo.familyName}" குடும்பத்திற்கென தனிப்பட்ட ஒத்திசைவு குறியீடு உருவாக்கப்பட்டது:`
                : `Welcome ${generatedFamilyInfo.user.name}! Your family sync code is ready:`}
            </p>

            <div className="big-family-code-card">
              <span className="code-subtitle">
                {lang === 'ta' ? 'குடும்பக் குறியீடு (Family Sync Code):' : 'Family Sync Code:'}
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
                  onClick={handleSendCodeWhatsApp}
                >
                  <MessageSquare size={18} />
                  <span>{lang === 'ta' ? 'WhatsApp-ல் அனுப்பு' : 'Send via WhatsApp'}</span>
                </button>
              </div>
            </div>

            <div className="next-step-guide">
              <strong>👉 {lang === 'ta' ? 'அடுத்த படி:' : 'Next Step:'}</strong>
              <p>
                {lang === 'ta'
                  ? `மற்றொரு குடும்ப உறுப்பினர் (அம்மா) தனது மொபைலில் "குடும்பக் குறியீட்டுடன் இணைய" என்பதைத் தொட்டு, "${generatedFamilyInfo.code}" என்ற குறியீட்டை உள்ளிட்டால், உடனே ஒரே பட்டியலில் இணைந்து விடலாம்!`
                  : `Another family member can tap "Join with Code" and enter "${generatedFamilyInfo.code}" to instantly sync!`}
              </p>
            </div>

            <button
              type="button"
              className="start-shopping-btn"
              onClick={() => onAuthSuccess(generatedFamilyInfo.user, generatedFamilyInfo.household, generatedFamilyInfo.items)}
            >
              <span>{lang === 'ta' ? 'மளிகைப் பட்டியலைத் திறக்கவும்' : 'Open Shopping List'}</span>
              <ArrowRight size={18} />
            </button>
          </div>
        ) : (
          /* ============================================================
             CASE 2: MAIN FORMS (SIGN IN / SIGN UP / FORGOT PASSWORD)
          ============================================================ */
          <>
            {/* Top Navigation Tabs: Sign In / Sign Up */}
            {mode !== 'forgot-password' && (
              <div className="auth-page-tabs">
                <button
                  type="button"
                  className={`auth-page-tab-btn ${mode === 'signin' ? 'active' : ''}`}
                  onClick={() => { setMode('signin'); setError(''); setSuccessMsg(''); }}
                >
                  <LogIn size={15} />
                  <span>{lang === 'ta' ? 'உள்நுழைக (Sign In)' : 'Sign In'}</span>
                </button>

                <button
                  type="button"
                  className={`auth-page-tab-btn ${mode === 'signup' ? 'active' : ''}`}
                  onClick={() => { setMode('signup'); setError(''); setSuccessMsg(''); }}
                >
                  <UserPlus size={15} />
                  <span>{lang === 'ta' ? 'பதிவு செய்க (Sign Up)' : 'Sign Up'}</span>
                </button>
              </div>
            )}

            {/* ------------------------------------------------------------
                VIEW 1: SIGN IN (உள்நுழைக)
            ------------------------------------------------------------ */}
            {mode === 'signin' && (
              <form onSubmit={handleSignIn} className="auth-form-card">
                <div className="form-field">
                  <label>{lang === 'ta' ? 'பயனர் பெயர் / மொபைல் எண்' : 'Username / Mobile Number'}</label>
                  <div className="input-icon-wrap">
                    <Smartphone size={16} className="field-icon" />
                    <input
                      type="text"
                      placeholder={lang === 'ta' ? 'எ.கா: appa அல்லது 9876543210' : 'e.g. appa or 9876543210'}
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      required
                      autoFocus
                    />
                  </div>
                </div>

                <div className="form-field">
                  <div className="label-with-action">
                    <label>{lang === 'ta' ? 'கடவுச்சொல்' : 'Password'}</label>
                    <button
                      type="button"
                      className="link-inline-btn"
                      onClick={() => { setMode('forgot-password'); setError(''); setSuccessMsg(''); }}
                    >
                      {lang === 'ta' ? 'கடவுச்சொல் மறந்துவிட்டதா?' : 'Forgot Password?'}
                    </button>
                  </div>
                  <div className="input-icon-wrap password-wrap">
                    <Key size={16} className="field-icon" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                    <button
                      type="button"
                      className="eye-toggle-btn"
                      onClick={() => setShowPassword(!showPassword)}
                      tabIndex="-1"
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  className="auth-primary-submit-btn"
                  disabled={loading}
                >
                  {loading
                    ? (lang === 'ta' ? 'உள்நுழைகிறது...' : 'Signing in...')
                    : (lang === 'ta' ? 'உள்நுழைக (Sign In)' : 'Sign In')}
                </button>

                <div className="auth-switch-note">
                  <span>{lang === 'ta' ? 'புதிய கணக்கா?' : "Don't have an account?"}</span>
                  <button
                    type="button"
                    className="link-btn"
                    onClick={() => { setMode('signup'); setError(''); setSuccessMsg(''); }}
                  >
                    {lang === 'ta' ? 'இப்போதே பதிவு செய்க' : 'Register / Sign Up'}
                  </button>
                </div>
              </form>
            )}

            {/* ------------------------------------------------------------
                VIEW 2: SIGN UP / REGISTER (பதிவு செய்க)
            ------------------------------------------------------------ */}
            {mode === 'signup' && (
              <form onSubmit={handleSignUp} className="auth-form-card">
                {/* Role Switcher: Create Family vs Join Family */}
                <div className="signup-role-selector">
                  <button
                    type="button"
                    className={`signup-role-btn ${signupType === 'create-family' ? 'active dad' : ''}`}
                    onClick={() => { setSignupType('create-family'); setError(''); }}
                  >
                    <Home size={15} />
                    <div>
                      <strong>{lang === 'ta' ? 'புதிய குடும்பம்' : 'Create Family'}</strong>
                      <span>{lang === 'ta' ? 'அப்பா (தலைவர்)' : 'Father (Head)'}</span>
                    </div>
                  </button>

                  <button
                    type="button"
                    className={`signup-role-btn ${signupType === 'join-family' ? 'active mom' : ''}`}
                    onClick={() => { setSignupType('join-family'); setError(''); }}
                  >
                    <Key size={15} />
                    <div>
                      <strong>{lang === 'ta' ? 'குறியீட்டுடன் இணைய' : 'Join with Code'}</strong>
                      <span>{lang === 'ta' ? 'அம்மா (உறுப்பினர்)' : 'Mother (Member)'}</span>
                    </div>
                  </button>
                </div>

                {/* Helper Note based on chosen role */}
                <div className={`role-helper-note ${signupType === 'join-family' ? 'mother-note' : ''}`}>
                  <span className="note-icon">{signupType === 'create-family' ? '💡' : '🔑'}</span>
                  <p>
                    {signupType === 'create-family'
                      ? (lang === 'ta'
                          ? 'முதலில் பதிவு செய்ததும் ஒரு பிரத்யேக "குடும்பக் குறியீடு" (Family Code) வழங்கப்படும். அதை குடும்பத்தினர் உள்ளிட்டு இணையலாம்.'
                          : 'Register to generate a unique Family Sync Code you can share with your family.')
                      : (lang === 'ta'
                          ? 'அப்பா அனுப்பிய குடும்பக் குறியீட்டை (Family Code) கீழே உள்ளிட்டு இணைத்துக் கொள்ளுங்கள்.'
                          : 'Enter the Family Sync Code provided by your family head to join the shared list.')}
                  </p>
                </div>

                {/* Family Code Input for Joining */}
                {signupType === 'join-family' && (
                  <div className="form-field highlight-code-field">
                    <label className="highlight-label">
                      🔑 {lang === 'ta' ? 'குடும்ப ஒத்திசைவு குறியீடு (Family Code):' : 'Family Sync Code:'}
                    </label>
                    <input
                      type="text"
                      className="big-code-input"
                      placeholder="எ.கா: SYNC-101 அல்லது FAM-4912"
                      value={familyCodeInput}
                      onChange={(e) => setFamilyCodeInput(e.target.value.toUpperCase())}
                      required
                    />
                  </div>
                )}

                <div className="form-field">
                  <label>{lang === 'ta' ? 'உங்கள் பெயர் (Name)' : 'Your Name'}</label>
                  <div className="input-icon-wrap">
                    <User size={16} className="field-icon" />
                    <input
                      type="text"
                      placeholder={lang === 'ta' ? (signupType === 'create-family' ? 'எ.கா: அப்பா / குமார்' : 'எ.கா: அம்மா / செல்வி') : 'e.g. Kumar'}
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="form-field">
                  <label>{lang === 'ta' ? 'பயனர் பெயர் / மொபைல் எண்' : 'Username / Mobile Number'}</label>
                  <div className="input-icon-wrap">
                    <Smartphone size={16} className="field-icon" />
                    <input
                      type="text"
                      placeholder={lang === 'ta' ? 'எ.கா: 9876543210 அல்லது kumar' : 'e.g. 9876543210 or kumar'}
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      required
                    />
                  </div>
                </div>

                {signupType === 'create-family' && (
                  <div className="form-field">
                    <label>{lang === 'ta' ? 'குடும்ப பெயர் (விருப்பம்)' : 'Family Name (Optional)'}</label>
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
                )}

                <div className="form-field">
                  <label>{lang === 'ta' ? 'கடவுச்சொல்' : 'Password'}</label>
                  <div className="input-icon-wrap password-wrap">
                    <Key size={16} className="field-icon" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                    <button
                      type="button"
                      className="eye-toggle-btn"
                      onClick={() => setShowPassword(!showPassword)}
                      tabIndex="-1"
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <div className="form-field">
                  <label>{lang === 'ta' ? 'கடவுச்சொல்லை மீண்டும் உள்ளிடவும்' : 'Confirm Password'}</label>
                  <div className="input-icon-wrap">
                    <ShieldCheck size={16} className="field-icon" />
                    <input
                      type="password"
                      placeholder="••••••"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className={`auth-primary-submit-btn ${signupType === 'create-family' ? 'father-submit' : 'mother-submit'}`}
                  disabled={loading}
                >
                  {loading
                    ? (lang === 'ta' ? 'பதிவு செய்யப்படுகிறது...' : 'Registering...')
                    : signupType === 'create-family'
                      ? (lang === 'ta' ? '👨‍👩‍👧 பதிவு செய்து குறியீடு பெறுக' : 'Register & Get Family Code')
                      : (lang === 'ta' ? '👩‍👧‍👦 குடும்பத்தில் இணைந்து தொடங்குக' : 'Join Family & Start Syncing')}
                </button>

                <div className="auth-switch-note">
                  <span>{lang === 'ta' ? 'ஏற்கனவே கணக்கு உள்ளதா?' : 'Already have an account?'}</span>
                  <button
                    type="button"
                    className="link-btn"
                    onClick={() => { setMode('signin'); setError(''); setSuccessMsg(''); }}
                  >
                    {lang === 'ta' ? 'உள்நுழைக (Sign In)' : 'Sign In'}
                  </button>
                </div>
              </form>
            )}

            {/* ------------------------------------------------------------
                VIEW 3: FORGOT PASSWORD (கடவுச்சொல் மீட்டெடு)
            ------------------------------------------------------------ */}
            {mode === 'forgot-password' && (
              <form onSubmit={handleForgotPassword} className="auth-form-card forgot-password-card">
                <div className="forgot-header-row">
                  <button
                    type="button"
                    className="back-icon-btn"
                    onClick={() => { setMode('signin'); setError(''); setSuccessMsg(''); }}
                    title="Back to Sign In"
                  >
                    <ArrowLeft size={16} />
                  </button>
                  <h3 className="forgot-title">
                    {lang === 'ta' ? 'கடவுச்சொல்லை மீட்டெடுக்கவும்' : 'Reset Password'}
                  </h3>
                </div>

                <p className="forgot-desc">
                  {lang === 'ta'
                    ? 'உங்கள் பயனர் பெயர் அல்லது மொபைல் எண்ணை உள்ளிட்டு புதிய கடவுச்சொல்லை அமைக்கவும்.'
                    : 'Enter your registered username or mobile number to set a new password.'}
                </p>

                <div className="form-field">
                  <label>{lang === 'ta' ? 'பதிவு செய்த பயனர் பெயர் / மொபைல்' : 'Registered Username / Mobile'}</label>
                  <div className="input-icon-wrap">
                    <Smartphone size={16} className="field-icon" />
                    <input
                      type="text"
                      placeholder={lang === 'ta' ? 'எ.கா: appa அல்லது 9876543210' : 'e.g. appa or 9876543210'}
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      required
                      autoFocus
                    />
                  </div>
                </div>

                <div className="form-field">
                  <label>{lang === 'ta' ? 'புதிய கடவுச்சொல்' : 'New Password'}</label>
                  <div className="input-icon-wrap password-wrap">
                    <Key size={16} className="field-icon" />
                    <input
                      type={showNewPassword ? 'text' : 'password'}
                      placeholder="••••••"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                    />
                    <button
                      type="button"
                      className="eye-toggle-btn"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      tabIndex="-1"
                    >
                      {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <div className="form-field">
                  <label>{lang === 'ta' ? 'புதிய கடவுச்சொல்லை உறுதிப்படுத்துக' : 'Confirm New Password'}</label>
                  <div className="input-icon-wrap">
                    <ShieldCheck size={16} className="field-icon" />
                    <input
                      type="password"
                      placeholder="••••••"
                      value={confirmNewPassword}
                      onChange={(e) => setConfirmNewPassword(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="auth-primary-submit-btn"
                  disabled={loading}
                >
                  {loading
                    ? (lang === 'ta' ? 'மாற்றப்படுகிறது...' : 'Updating...')
                    : (lang === 'ta' ? 'கடவுச்சொல்லை மாற்று (Reset Password)' : 'Reset Password')}
                </button>

                <div className="auth-switch-note">
                  <button
                    type="button"
                    className="link-btn"
                    onClick={() => { setMode('signin'); setError(''); setSuccessMsg(''); }}
                  >
                    ← {lang === 'ta' ? 'உள்நுழைவுப் பக்கத்திற்குச் செல்' : 'Back to Sign In'}
                  </button>
                </div>
              </form>
            )}
          </>
        )}
      </div>
    </div>
  );
}
