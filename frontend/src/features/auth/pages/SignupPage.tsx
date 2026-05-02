import React, { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, Wind, AlertCircle, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export const SignupPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const { error: authError } = await supabase.auth.signUp({ email, password });
    if (authError) setError(authError.message);
    else setSuccess(true);
    setLoading(false);
  };

  const handleGoogleSignup = async () => {
    const { error: authError } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/dashboard` },
    });
    if (authError) setError(authError.message);
  };

  if (success) {
    return (
      <div className="min-h-screen bg-[var(--color-bg-base)] flex items-center justify-center p-4">
        <div className="w-full max-w-md text-center bg-[var(--color-bg-surface)] border border-[var(--color-border)] rounded-2xl p-10">
          <CheckCircle size={48} className="text-emerald-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-[var(--color-text-primary)] mb-2">Check your inbox</h2>
          <p className="text-[var(--color-text-muted)] mb-6">We sent a confirmation link to <strong className="text-[var(--color-text-primary)]">{email}</strong>.</p>
          <Button onClick={() => navigate('/login')} className="mx-auto">Go to Login</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--color-bg-base)] flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 opacity-15 bg-[linear-gradient(rgba(56,189,248,0.3)_1px,transparent_1px),linear-gradient(90deg,rgba(56,189,248,0.3)_1px,transparent_1px)] bg-[size:50px_50px] pointer-events-none" />

      <div className="relative w-full max-w-md bg-[var(--color-bg-surface)] border border-[var(--color-border)] rounded-2xl p-10 shadow-2xl">
        <div className="absolute top-0 left-[20%] right-[20%] h-0.5 bg-gradient-to-r from-transparent via-[var(--color-accent)] to-transparent rounded-b" />

        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl mx-auto mb-5 bg-[var(--color-accent-dim)] border border-[var(--color-accent)]/30 flex items-center justify-center shadow-[0_0_30px_var(--color-accent-dim)]">
            <Wind size={32} className="text-[var(--color-accent)]" />
          </div>
          <h1 className="text-2xl font-extrabold text-[var(--color-text-primary)]">Create Account</h1>
          <p className="text-xs tracking-widest text-[var(--color-text-muted)] uppercase mt-1">Join Vortex-Gen</p>
        </div>

        {error && (
          <div className="flex items-start gap-2 bg-[var(--color-accent-pink)]/10 border border-[var(--color-accent-pink)]/30 rounded-xl px-4 py-3 mb-5 text-[var(--color-accent-pink)] text-sm">
            <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSignup} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-widest">Email</label>
            <div className="relative">
              <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)] pointer-events-none" />
              <input
                type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com" required aria-label="Email"
                className="w-full pl-10 pr-4 py-2.5 bg-[var(--color-bg-base)] border border-[var(--color-border)] rounded-xl text-[var(--color-text-primary)] text-sm outline-none focus:border-[var(--color-accent)] transition-colors placeholder:text-[var(--color-text-muted)]"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-widest">Password</label>
            <div className="relative">
              <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)] pointer-events-none" />
              <input
                type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••" required aria-label="Password" minLength={6}
                className="w-full pl-10 pr-4 py-2.5 bg-[var(--color-bg-base)] border border-[var(--color-border)] rounded-xl text-[var(--color-text-primary)] text-sm outline-none focus:border-[var(--color-accent)] transition-colors placeholder:text-[var(--color-text-muted)]"
              />
            </div>
          </div>

          <Button type="submit" loading={loading} className="w-full mt-1 justify-center">
            Create Account
          </Button>
        </form>

        <div className="flex items-center gap-4 my-6">
          <hr className="flex-1 border-[var(--color-border)]" />
          <span className="text-xs text-[var(--color-text-muted)] uppercase tracking-widest">or</span>
          <hr className="flex-1 border-[var(--color-border)]" />
        </div>

        <Button variant="secondary" onClick={handleGoogleSignup} className="w-full justify-center gap-3">
          <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          Continue with Google
        </Button>

        <p className="text-center mt-6 text-sm text-[var(--color-text-muted)]">
          Already have an account?{' '}
          <Link to="/login" className="text-[var(--color-accent)] font-semibold hover:underline">Log in</Link>
        </p>
      </div>
    </div>
  );
};

export default SignupPage;
