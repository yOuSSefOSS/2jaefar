import React, { useState, useEffect } from 'react';
import { supabase } from '../services/supabaseClient';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { Mail, Lock, Loader2, AlertCircle, KeyRound, ArrowLeft } from 'lucide-react';
import logoUrl from '../assets/logo.png';
import SEO from '../components/SEO';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [mode, setMode] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('mode') === 'update') {
      const hash = window.location.hash;
      if (hash && hash.includes('error=')) {
        return 'expired';
      }
      return 'update';
    }
    return 'login';
  }); // 'login' | 'forgot' | 'reset' | 'update' | 'expired'
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Rate limiting states
  const [attempts, setAttempts] = useState(() => parseInt(localStorage.getItem('login_attempts')) || 0);
  const [cooldownUntil, setCooldownUntil] = useState(() => parseInt(localStorage.getItem('login_cooldown_until')) || 0);
  const [remainingTime, setRemainingTime] = useState(0);

  const navigate = useNavigate();
  const location = useLocation();

  // Rate limiting effect
  useEffect(() => {
    let interval;
    if (cooldownUntil > Date.now()) {
      const updateRemaining = () => {
        const remainingMs = cooldownUntil - Date.now();
        if (remainingMs <= 0) {
          setCooldownUntil(0);
          setAttempts(0);
          localStorage.removeItem('login_cooldown_until');
          localStorage.removeItem('login_attempts');
          setError('');
          setRemainingTime(0);
        } else {
          setRemainingTime(Math.ceil(remainingMs / 60000));
        }
      };
      updateRemaining();
      interval = setInterval(updateRemaining, 1000);
    }
    return () => clearInterval(interval);
  }, [cooldownUntil]);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (cooldownUntil > Date.now()) {
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');
    
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      const newAttempts = attempts + 1;
      setAttempts(newAttempts);
      localStorage.setItem('login_attempts', newAttempts);

      if (newAttempts >= 5) {
        const cooldownTime = Date.now() + 15 * 60 * 1000; // 15 mins
        setCooldownUntil(cooldownTime);
        localStorage.setItem('login_cooldown_until', cooldownTime);
        setError('');
      } else {
        setError(error.message);
      }
    } else {
      setAttempts(0);
      localStorage.removeItem('login_attempts');
      localStorage.removeItem('login_cooldown_until');
      const from = location.state?.from?.pathname || '/explore';
      navigate(from, { replace: true });
    }
    setLoading(false);
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    if (!email) {
      setError('Please enter your email first.');
      return;
    }
    setLoading(true);
    setError('');
    setSuccess('');
    
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/login?mode=update`
    });
    if (error) {
      console.error("Supabase auth error:", error);
      setError(error.message || "An error occurred while sending the email.");
    } else {
      setSuccess('8-digit OTP sent to your email!');
      setMode('reset');
    }
    setLoading(false);
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!otp || !newPassword || !confirmPassword) {
      setError('Please fill in all fields.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    setLoading(true);
    setError('');
    setSuccess('');

    // Step 1: Verify OTP
    const { error: verifyError } = await supabase.auth.verifyOtp({
      email,
      token: otp,
      type: 'recovery'
    });

    if (verifyError) {
      // Check if they are already logged in from a previous failed password attempt (e.g. used old password)
      // The OTP is single-use, so if they fail step 2, the OTP is burned, but they are already authenticated!
      const { data: { session } } = await supabase.auth.getSession();
      if (!session || session.user.email !== email) {
        const msg = verifyError.message.toLowerCase();
        if (msg.includes('expire') || msg.includes('invalid')) {
          setError("This OTP has expired or is invalid. Please request a new one.");
        } else {
          setError(verifyError.message || "Invalid OTP.");
        }
        setLoading(false);
        return;
      }
    }

    // Step 2: Update Password
    const { error: updateError } = await supabase.auth.updateUser({
      password: newPassword
    });

    if (updateError) {
      setError(updateError.message || "Failed to update password.");
    } else {
      setAttempts(0);
      localStorage.removeItem('login_attempts');
      localStorage.removeItem('login_cooldown_until');
      setSuccess('Password updated successfully! You are now logged in.');
      setTimeout(() => {
        navigate('/explore');
      }, 2000);
    }
    setLoading(false);
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    if (!newPassword || !confirmPassword) {
      setError('Please fill in all fields.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    setLoading(true);
    setError('');
    setSuccess('');

    // The user is already authenticated because of the token in the URL.
    const { error: updateError } = await supabase.auth.updateUser({
      password: newPassword
    });

    if (updateError) {
      setError(updateError.message || "Failed to update password. Link may have expired.");
    } else {
      setAttempts(0);
      localStorage.removeItem('login_attempts');
      localStorage.removeItem('login_cooldown_until');
      setSuccess('Password updated successfully! You are now logged in.');
      setTimeout(() => {
        navigate('/explore');
      }, 2000);
    }
    setLoading(false);
  };

  const handleGoogleLogin = async () => {
    setGoogleLoading(true);
    setError('');
    const { error } = await supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: window.location.origin + '/explore' } });
    if (error) { setError(error.message); setGoogleLoading(false); }
  };

  // Shared input style
  const inputStyle = {
    width: '100%', boxSizing: 'border-box', paddingLeft: '2.5rem', paddingRight: '1rem', paddingTop: '0.7rem', paddingBottom: '0.7rem',
    background: 'rgba(2,8,23,0.8)', border: '1px solid rgba(51,65,85,0.8)',
    borderRadius: '10px', color: '#e2e8f0', fontSize: '0.9rem', outline: 'none', transition: 'border-color 0.2s'
  };

  const buttonStyle = {
    width: '100%', padding: '0.8rem', marginTop: '0.25rem',
    background: loading ? 'rgba(56,189,248,0.3)' : 'linear-gradient(135deg, #0ea5e9, #6366f1)',
    border: 'none', borderRadius: '10px', color: 'white', fontSize: '0.9rem', fontWeight: 700,
    cursor: loading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
    transition: 'all 0.2s', letterSpacing: '0.05em',
    boxShadow: loading ? 'none' : '0 4px 20px rgba(14,165,233,0.35)'
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      background: '#020817',
      fontFamily: "'Inter', sans-serif"
    }}>
      <SEO 
        title="Log In | Vortex Gen" 
        description="Log in to Vortex Gen to access advanced aerospace design tools, wind tunnel labs, and your saved airfoil data."
      />
      {/* LEFT SIDE - DECORATIVE */}
      <div style={{
        flex: 1,
        display: 'none',
        '@media (min-width: 1024px)': { display: 'flex' },
        background: 'linear-gradient(135deg, #0f172a 0%, #020817 100%)',
        position: 'relative',
        overflow: 'hidden',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column'
      }}>
        <div style={{ position: 'absolute', top: '-10%', left: '-10%', width: '50vw', height: '50vw', background: 'radial-gradient(circle, rgba(14,165,233,0.05) 0%, transparent 70%)', borderRadius: '50%' }} />
        <div style={{ position: 'absolute', bottom: '-10%', right: '-10%', width: '40vw', height: '40vw', background: 'radial-gradient(circle, rgba(99,102,241,0.05) 0%, transparent 70%)', borderRadius: '50%' }} />
        
        <div style={{ zIndex: 1, textAlign: 'center', padding: '0 2rem' }}>
          <img src={logoUrl} alt="Logo" style={{ width: '120px', height: '120px', marginBottom: '2rem', filter: 'drop-shadow(0 0 30px rgba(14,165,233,0.3))', borderRadius: '24px' }} />
          <h2 style={{ fontSize: '2.5rem', fontWeight: 800, color: '#f8fafc', marginBottom: '1rem', letterSpacing: '-0.02em' }}>Push the Boundary</h2>
          <p style={{ fontSize: '1.1rem', color: '#94a3b8', maxWidth: '400px', lineHeight: 1.6 }}>Access advanced aerospace design tools and join a community of innovators.</p>
        </div>
      </div>

      {/* RIGHT SIDE - LOGIN/RESET */}
      <div style={{
        flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '2rem',
        maxWidth: '500px', margin: '0 auto', width: '100%', position: 'relative'
      }}>
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, height: '4px',
          background: 'linear-gradient(90deg, #0ea5e9, #6366f1)',
          borderRadius: '0 0 4px 4px'
        }} />

        {/* BACK BUTTON */}
        <Link to="/" style={{
          position: 'absolute', top: '1.5rem', left: '1.5rem',
          display: 'flex', alignItems: 'center', gap: '0.4rem',
          color: '#64748b', textDecoration: 'none', fontSize: '0.85rem', fontWeight: 600,
          transition: 'color 0.2s', zIndex: 10
        }}
        onMouseOver={e => e.currentTarget.style.color = '#38bdf8'}
        onMouseOut={e => e.currentTarget.style.color = '#64748b'}
        >
          <ArrowLeft size={16} />
          Back
        </Link>

        {/* Logo & Title */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{
            width: '64px', height: '64px', borderRadius: '16px', margin: '0 auto 1.25rem',
            background: 'rgba(15,23,42,0.6)', border: '1px solid rgba(51,65,85,0.5)',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <img src={logoUrl} alt="Logo" style={{ width: '40px', height: '40px', borderRadius: '10px' }} />
          </div>
          <h1 style={{
            fontSize: '1.75rem', fontWeight: 800, margin: 0,
            background: 'linear-gradient(135deg, #e0f2fe, #7dd3fc, #818cf8)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'
          }}>
            {mode === 'login' && 'Welcome Back'}
            {mode === 'forgot' && 'Reset Password'}
            {mode === 'reset' && 'Enter OTP'}
            {mode === 'update' && 'New Password'}
            {mode === 'expired' && 'Link Expired'}
          </h1>
          <p style={{ color: '#475569', margin: '0.4rem 0 0', fontSize: '0.875rem', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
            {mode === 'login' && 'LOG IN TO VORTEX-GEN'}
            {mode === 'forgot' && 'Account Recovery'}
            {mode === 'reset' && 'Secure Update'}
            {mode === 'update' && 'Secure Update'}
            {mode === 'expired' && 'Security Alert'}
          </p>
        </div>

        {/* Error */}
        {(error || (mode === 'login' && cooldownUntil > Date.now())) && (
          <div style={{
            background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)',
            borderRadius: '10px', padding: '0.75rem 1rem', marginBottom: '1.25rem',
            display: 'flex', alignItems: 'flex-start', gap: '0.5rem', color: '#f87171', fontSize: '0.85rem'
          }}>
            <AlertCircle size={16} style={{ marginTop: '0.1rem', flexShrink: 0 }} />
            <span>
              {mode === 'login' && cooldownUntil > Date.now()
                ? `Too many failed attempts. Try again in ${remainingTime} minute${remainingTime !== 1 ? 's' : ''}.`
                : error}
            </span>
          </div>
        )}

        {/* Success */}
        {success && (
          <div style={{
            background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.3)',
            borderRadius: '10px', padding: '0.75rem 1rem', marginBottom: '1.25rem',
            display: 'flex', alignItems: 'flex-start', gap: '0.5rem', color: '#4ade80', fontSize: '0.85rem'
          }}>
            <span>{success}</span>
          </div>
        )}

        {/* LOGIN FORM */}
        {mode === 'login' && (
          <>
            <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#64748b', marginBottom: '0.4rem', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Email</label>
                <div style={{ position: 'relative' }}>
                  <Mail size={16} style={{ position: 'absolute', left: '0.9rem', top: '50%', transform: 'translateY(-50%)', color: '#334155', pointerEvents: 'none' }} />
                  <input
                    type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com" required
                    style={inputStyle}
                    onFocus={e => e.target.style.borderColor = 'rgba(56,189,248,0.6)'}
                    onBlur={e => e.target.style.borderColor = 'rgba(51,65,85,0.8)'}
                  />
                </div>
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                  <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Password</label>
                  <button type="button" onClick={() => { setMode('forgot'); setError(''); setSuccess(''); }} style={{ background: 'none', border: 'none', color: '#38bdf8', fontSize: '0.75rem', cursor: 'pointer', padding: 0 }}>Forgot Password?</button>
                </div>
                <div style={{ position: 'relative' }}>
                  <Lock size={16} style={{ position: 'absolute', left: '0.9rem', top: '50%', transform: 'translateY(-50%)', color: '#334155', pointerEvents: 'none' }} />
                  <input
                    type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••" required
                    style={inputStyle}
                    onFocus={e => e.target.style.borderColor = 'rgba(56,189,248,0.6)'}
                    onBlur={e => e.target.style.borderColor = 'rgba(51,65,85,0.8)'}
                  />
                </div>
              </div>

              <button
                type="submit" disabled={loading || cooldownUntil > Date.now()}
                style={buttonStyle}
              >
                {loading ? <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} /> : (cooldownUntil > Date.now() ? 'Locked Out' : 'Log In')}
              </button>
            </form>

            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', margin: '1.5rem 0' }}>
              <hr style={{ flex: 1, border: 'none', borderTop: '1px solid rgba(51,65,85,0.6)' }} />
              <span style={{ color: '#334155', fontSize: '0.75rem', letterSpacing: '0.1em', textTransform: 'uppercase' }}>or</span>
              <hr style={{ flex: 1, border: 'none', borderTop: '1px solid rgba(51,65,85,0.6)' }} />
            </div>

            <button
              onClick={handleGoogleLogin} disabled={googleLoading}
              style={{
                width: '100%', padding: '0.75rem',
                background: 'rgba(15,23,42,0.8)', border: '1px solid rgba(51,65,85,0.8)',
                borderRadius: '10px', color: '#e2e8f0', fontSize: '0.9rem', fontWeight: 600,
                cursor: googleLoading ? 'not-allowed' : 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem',
                transition: 'all 0.2s'
              }}
              onMouseOver={e => { if (!googleLoading) e.currentTarget.style.borderColor = 'rgba(56,189,248,0.4)'; }}
              onMouseOut={e => { e.currentTarget.style.borderColor = 'rgba(51,65,85,0.8)'; }}
            >
              {googleLoading ? <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} /> : (
                <>
                  <svg width="18" height="18" viewBox="0 0 24 24">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                  </svg>
                  Continue with Google
                </>
              )}
            </button>

            <p style={{ textAlign: 'center', marginTop: '1.5rem', color: '#475569', fontSize: '0.875rem' }}>
              Don't have an account? <Link to="/signup" style={{ color: '#38bdf8', textDecoration: 'none', fontWeight: 600 }}>Sign up</Link>
            </p>
          </>
        )}

        {/* FORGOT PASSWORD FORM */}
        {mode === 'forgot' && (
          <form onSubmit={handleForgotPassword} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <p style={{ color: '#94a3b8', fontSize: '0.85rem', marginBottom: '0.5rem' }}>Enter your email to receive an 8-digit OTP.</p>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#64748b', marginBottom: '0.4rem', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Email</label>
              <div style={{ position: 'relative' }}>
                <Mail size={16} style={{ position: 'absolute', left: '0.9rem', top: '50%', transform: 'translateY(-50%)', color: '#334155', pointerEvents: 'none' }} />
                <input
                  type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com" required
                  style={inputStyle}
                  onFocus={e => e.target.style.borderColor = 'rgba(56,189,248,0.6)'}
                  onBlur={e => e.target.style.borderColor = 'rgba(51,65,85,0.8)'}
                />
              </div>
            </div>
            
            <button type="submit" disabled={loading} style={buttonStyle}>
              {loading ? <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} /> : 'Send OTP'}
            </button>
            <button type="button" onClick={() => { setMode('login'); setError(''); setSuccess(''); }} style={{ background: 'none', border: 'none', color: '#94a3b8', fontSize: '0.85rem', cursor: 'pointer', marginTop: '0.5rem' }}>
              &larr; Back to Login
            </button>
          </form>
        )}

        {/* RESET PASSWORD (OTP) FORM */}
        {mode === 'reset' && (
          <form onSubmit={handleResetPassword} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <p style={{ color: '#94a3b8', fontSize: '0.85rem', marginBottom: '0.5rem' }}>Enter the 8-digit OTP sent to <strong>{email}</strong>.</p>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#64748b', marginBottom: '0.4rem', letterSpacing: '0.08em', textTransform: 'uppercase' }}>8-Digit OTP</label>
              <div style={{ position: 'relative' }}>
                <KeyRound size={16} style={{ position: 'absolute', left: '0.9rem', top: '50%', transform: 'translateY(-50%)', color: '#334155', pointerEvents: 'none' }} />
                <input
                  type="text" value={otp} onChange={(e) => setOtp(e.target.value.replace(/\s/g, ''))}
                  placeholder="XXXXXXXX" required maxLength={8}
                  style={{...inputStyle, letterSpacing: '0.2em', fontWeight: 'bold'}}
                  onFocus={e => e.target.style.borderColor = 'rgba(56,189,248,0.6)'}
                  onBlur={e => e.target.style.borderColor = 'rgba(51,65,85,0.8)'}
                />
              </div>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#64748b', marginBottom: '0.4rem', letterSpacing: '0.08em', textTransform: 'uppercase' }}>New Password</label>
              <div style={{ position: 'relative' }}>
                <Lock size={16} style={{ position: 'absolute', left: '0.9rem', top: '50%', transform: 'translateY(-50%)', color: '#334155', pointerEvents: 'none' }} />
                <input
                  type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="••••••••" required
                  style={inputStyle}
                  onFocus={e => e.target.style.borderColor = 'rgba(56,189,248,0.6)'}
                  onBlur={e => e.target.style.borderColor = 'rgba(51,65,85,0.8)'}
                />
              </div>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#64748b', marginBottom: '0.4rem', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Verify New Password</label>
              <div style={{ position: 'relative' }}>
                <Lock size={16} style={{ position: 'absolute', left: '0.9rem', top: '50%', transform: 'translateY(-50%)', color: '#334155', pointerEvents: 'none' }} />
                <input
                  type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••" required
                  style={inputStyle}
                  onFocus={e => e.target.style.borderColor = 'rgba(56,189,248,0.6)'}
                  onBlur={e => e.target.style.borderColor = 'rgba(51,65,85,0.8)'}
                />
              </div>
            </div>
            
            <button type="submit" disabled={loading} style={buttonStyle}>
              {loading ? <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} /> : 'Reset Password'}
            </button>
            <button type="button" onClick={() => { setMode('login'); setError(''); setSuccess(''); }} style={{ background: 'none', border: 'none', color: '#94a3b8', fontSize: '0.85rem', cursor: 'pointer', marginTop: '0.5rem' }}>
              &larr; Back to Login
            </button>
          </form>
        )}

        {/* UPDATE PASSWORD (MAGIC LINK) FORM */}
        {mode === 'update' && (
          <form onSubmit={handleUpdatePassword} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <p style={{ color: '#94a3b8', fontSize: '0.85rem', marginBottom: '0.5rem' }}>Enter your new password below.</p>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#64748b', marginBottom: '0.4rem', letterSpacing: '0.08em', textTransform: 'uppercase' }}>New Password</label>
              <div style={{ position: 'relative' }}>
                <Lock size={16} style={{ position: 'absolute', left: '0.9rem', top: '50%', transform: 'translateY(-50%)', color: '#334155', pointerEvents: 'none' }} />
                <input
                  type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="••••••••" required
                  style={inputStyle}
                  onFocus={e => e.target.style.borderColor = 'rgba(56,189,248,0.6)'}
                  onBlur={e => e.target.style.borderColor = 'rgba(51,65,85,0.8)'}
                />
              </div>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#64748b', marginBottom: '0.4rem', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Verify New Password</label>
              <div style={{ position: 'relative' }}>
                <Lock size={16} style={{ position: 'absolute', left: '0.9rem', top: '50%', transform: 'translateY(-50%)', color: '#334155', pointerEvents: 'none' }} />
                <input
                  type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••" required
                  style={inputStyle}
                  onFocus={e => e.target.style.borderColor = 'rgba(56,189,248,0.6)'}
                  onBlur={e => e.target.style.borderColor = 'rgba(51,65,85,0.8)'}
                />
              </div>
            </div>
            
            <button type="submit" disabled={loading} style={buttonStyle}>
              {loading ? <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} /> : 'Update Password'}
            </button>
            <button type="button" onClick={() => { setMode('login'); setError(''); setSuccess(''); window.history.replaceState({}, document.title, window.location.pathname); }} style={{ background: 'none', border: 'none', color: '#94a3b8', fontSize: '0.85rem', cursor: 'pointer', marginTop: '0.5rem' }}>
              &larr; Back to Login
            </button>
          </form>
        )}

        {/* EXPIRED LINK MESSAGE */}
        {mode === 'expired' && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '1rem 0' }}>
            <AlertCircle size={48} color="#ef4444" style={{ marginBottom: '1rem', opacity: 0.9 }} />
            <p style={{ color: '#94a3b8', fontSize: '0.95rem', lineHeight: '1.6', textAlign: 'center', marginBottom: '1.5rem' }}>
              This password reset link has <strong style={{ color: '#ef4444' }}>expired</strong> or is invalid. For your security, reset links are only valid for 30 minutes.
            </p>
            <button 
              onClick={() => { setMode('forgot'); setError(''); window.history.replaceState({}, document.title, window.location.pathname); }} 
              style={{ ...buttonStyle, marginBottom: '1rem' }}
            >
              Request New Link
            </button>
            <button 
              onClick={() => { setMode('login'); setError(''); window.history.replaceState({}, document.title, window.location.pathname); }} 
              style={{ background: 'none', border: 'none', color: '#94a3b8', fontSize: '0.85rem', cursor: 'pointer' }}
            >
              &larr; Back to Login
            </button>
          </div>
        )}

      </div>

      <style>{`
        @media (min-width: 1024px) {
          div[style*="max-width: 500px"] { padding: 4rem; }
        }
        input:-webkit-autofill { -webkit-box-shadow: 0 0 0 100px #020817 inset !important; -webkit-text-fill-color: #e2e8f0 !important; }
      `}</style>
    </div>
  );
};

export default Login;
