import React, { useState } from 'react';
import { supabase } from '../services/supabaseClient';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, Loader2, AlertCircle } from 'lucide-react';
import logoUrl from '../assets/logo.png';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) setError(error.message);
    else navigate('/dashboard');
    setLoading(false);
  };

  const handleGoogleLogin = async () => {
    setGoogleLoading(true);
    setError('');
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/dashboard` }
    });
    if (error) { setError(error.message); setGoogleLoading(false); }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #020817 0%, #0a0f1e 50%, #020817 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1rem',
      fontFamily: "'Inter', 'Segoe UI', sans-serif",
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Animated background grid */}
      <div style={{
        position: 'absolute', inset: 0, opacity: 0.15,
        backgroundImage: 'linear-gradient(rgba(56,189,248,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(56,189,248,0.3) 1px, transparent 1px)',
        backgroundSize: '50px 50px'
      }} />

      {/* Glow orbs */}
      <div style={{
        position: 'absolute', width: '600px', height: '600px', borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(56,189,248,0.08) 0%, transparent 70%)',
        top: '-200px', left: '-200px', pointerEvents: 'none'
      }} />
      <div style={{
        position: 'absolute', width: '500px', height: '500px', borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(99,102,241,0.08) 0%, transparent 70%)',
        bottom: '-150px', right: '-150px', pointerEvents: 'none'
      }} />

      {/* Card */}
      <div style={{
        position: 'relative', width: '100%', maxWidth: '420px',
        background: 'linear-gradient(145deg, rgba(15,23,42,0.95), rgba(8,15,32,0.98))',
        border: '1px solid rgba(56,189,248,0.2)',
        borderRadius: '20px', padding: '2.5rem',
        boxShadow: '0 25px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(56,189,248,0.05), inset 0 1px 0 rgba(255,255,255,0.05)',
        backdropFilter: 'blur(20px)'
      }}>
        {/* Top accent line */}
        <div style={{
          position: 'absolute', top: 0, left: '20%', right: '20%', height: '2px',
          background: 'linear-gradient(90deg, transparent, rgba(56,189,248,0.8), rgba(99,102,241,0.8), transparent)',
          borderRadius: '0 0 4px 4px'
        }} />

        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{
            width: '64px', height: '64px', borderRadius: '16px', margin: '0 auto 1.25rem',
            background: 'linear-gradient(135deg, rgba(56,189,248,0.2), rgba(99,102,241,0.2))',
            border: '1px solid rgba(56,189,248,0.3)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 0 30px rgba(56,189,248,0.2)'
          }}>
            <img src={logoUrl} alt="Vortex-Gen" style={{ width: '48px', height: 'auto', filter: 'brightness(1.1)' }} />
          </div>
          <h1 style={{
            fontSize: '1.75rem', fontWeight: 800, margin: 0,
            background: 'linear-gradient(135deg, #e0f2fe, #7dd3fc, #818cf8)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'
          }}>Welcome Back</h1>
          <p style={{ color: '#475569', margin: '0.4rem 0 0', fontSize: '0.875rem', letterSpacing: '0.05em' }}>
            LOG IN TO VORTEX-GEN
          </p>
        </div>

        {/* Error */}
        {error && (
          <div style={{
            background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)',
            borderRadius: '10px', padding: '0.75rem 1rem', marginBottom: '1.25rem',
            display: 'flex', alignItems: 'flex-start', gap: '0.5rem', color: '#f87171', fontSize: '0.85rem'
          }}>
            <AlertCircle size={16} style={{ flexShrink: 0, marginTop: '1px' }} />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#64748b', marginBottom: '0.4rem', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Email</label>
            <div style={{ position: 'relative' }}>
              <Mail size={16} style={{ position: 'absolute', left: '0.9rem', top: '50%', transform: 'translateY(-50%)', color: '#334155', pointerEvents: 'none' }} />
              <input
                type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com" required
                style={{
                  width: '100%', boxSizing: 'border-box', paddingLeft: '2.5rem', paddingRight: '1rem', paddingTop: '0.7rem', paddingBottom: '0.7rem',
                  background: 'rgba(2,8,23,0.8)', border: '1px solid rgba(51,65,85,0.8)',
                  borderRadius: '10px', color: '#e2e8f0', fontSize: '0.9rem', outline: 'none', transition: 'border-color 0.2s'
                }}
                onFocus={e => e.target.style.borderColor = 'rgba(56,189,248,0.6)'}
                onBlur={e => e.target.style.borderColor = 'rgba(51,65,85,0.8)'}
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#64748b', marginBottom: '0.4rem', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Password</label>
            <div style={{ position: 'relative' }}>
              <Lock size={16} style={{ position: 'absolute', left: '0.9rem', top: '50%', transform: 'translateY(-50%)', color: '#334155', pointerEvents: 'none' }} />
              <input
                type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••" required
                style={{
                  width: '100%', boxSizing: 'border-box', paddingLeft: '2.5rem', paddingRight: '1rem', paddingTop: '0.7rem', paddingBottom: '0.7rem',
                  background: 'rgba(2,8,23,0.8)', border: '1px solid rgba(51,65,85,0.8)',
                  borderRadius: '10px', color: '#e2e8f0', fontSize: '0.9rem', outline: 'none', transition: 'border-color 0.2s'
                }}
                onFocus={e => e.target.style.borderColor = 'rgba(56,189,248,0.6)'}
                onBlur={e => e.target.style.borderColor = 'rgba(51,65,85,0.8)'}
              />
            </div>
          </div>

          <button
            type="submit" disabled={loading}
            style={{
              width: '100%', padding: '0.8rem', marginTop: '0.25rem',
              background: loading ? 'rgba(56,189,248,0.3)' : 'linear-gradient(135deg, #0ea5e9, #6366f1)',
              border: 'none', borderRadius: '10px', color: 'white', fontSize: '0.9rem', fontWeight: 700,
              cursor: loading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
              transition: 'all 0.2s', letterSpacing: '0.05em',
              boxShadow: loading ? 'none' : '0 4px 20px rgba(14,165,233,0.35)'
            }}
            onMouseOver={e => { if (!loading) e.target.style.transform = 'translateY(-1px)'; }}
            onMouseOut={e => { e.target.style.transform = 'translateY(0)'; }}
          >
            {loading ? <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} /> : 'Log In'}
          </button>
        </form>

        {/* Divider */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', margin: '1.5rem 0' }}>
          <hr style={{ flex: 1, border: 'none', borderTop: '1px solid rgba(51,65,85,0.6)' }} />
          <span style={{ color: '#334155', fontSize: '0.75rem', letterSpacing: '0.1em', textTransform: 'uppercase' }}>or</span>
          <hr style={{ flex: 1, border: 'none', borderTop: '1px solid rgba(51,65,85,0.6)' }} />
        </div>

        {/* Google */}
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
          Don't have an account?{' '}
          <Link to="/signup" style={{ color: '#38bdf8', textDecoration: 'none', fontWeight: 600 }}>Sign up</Link>
        </p>
      </div>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        input::placeholder { color: #334155; }
        input:-webkit-autofill { -webkit-box-shadow: 0 0 0 100px #020817 inset !important; -webkit-text-fill-color: #e2e8f0 !important; }
      `}</style>
    </div>
  );
};

export default Login;
