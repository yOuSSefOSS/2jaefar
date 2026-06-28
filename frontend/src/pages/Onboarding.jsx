import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, GraduationCap, Loader2, AlertCircle } from 'lucide-react';
import { apiFetch } from '../services/apiService';
import { useAppContext } from '../context/AppContext';
import { supabase } from '../services/supabaseClient';
import { LogOut } from 'lucide-react';

const Onboarding = () => {
  const [mode, setMode] = useState(null); // 'academy' or 'workspace'
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const navigate = useNavigate();
  const { fetchUserData, user } = useAppContext();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!inputValue.trim()) return;
    
    setError('');
    setLoading(true);

    try {
      if (mode === 'academy') {
        await apiFetch('/api/onboarding/academy', {
          method: 'POST',
          body: JSON.stringify({ code: inputValue })
        });
      } else {
        await apiFetch('/api/onboarding/workspace', {
          method: 'POST',
          body: JSON.stringify({ name: inputValue })
        });
      }

      // Refresh user context to pick up the new role/account_type
      await fetchUserData(user.id);
      
      // Navigate to main app
      navigate('/explore');
      
    } catch (err) {
      setError(err.message || 'An error occurred during onboarding.');
    } finally {
      setLoading(false);
    }
  };

  const OptionCard = ({ icon: Icon, title, description, selected, onClick }) => (
    <div 
      onClick={onClick}
      style={{
        background: selected ? 'rgba(99,102,241,0.1)' : 'rgba(15,23,42,0.6)',
        border: `1px solid ${selected ? 'rgba(99,102,241,0.5)' : 'rgba(51,65,85,0.6)'}`,
        borderRadius: '12px',
        padding: '1.5rem',
        cursor: 'pointer',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '1rem',
        transition: 'all 0.2s ease',
        transform: selected ? 'scale(1.02)' : 'scale(1)',
        boxShadow: selected ? '0 10px 30px rgba(99,102,241,0.2)' : 'none'
      }}
    >
      <div style={{
        background: selected ? 'linear-gradient(135deg, #6366f1, #3b82f6)' : 'rgba(51,65,85,0.5)',
        padding: '1rem',
        borderRadius: '50%'
      }}>
        <Icon size={32} color={selected ? 'white' : '#94a3b8'} />
      </div>
      <div style={{ textAlign: 'center' }}>
        <h3 style={{ margin: '0 0 0.5rem 0', color: '#f8fafc', fontSize: '1.1rem' }}>{title}</h3>
        <p style={{ margin: 0, color: '#94a3b8', fontSize: '0.85rem', lineHeight: 1.4 }}>{description}</p>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', background: '#020817', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', fontFamily: "'Inter', sans-serif", position: 'relative' }}>
      
      {/* Top Right Actions */}
      <div style={{ position: 'absolute', top: '20px', right: '20px', display: 'flex', gap: '1rem' }}>
        <button 
          onClick={() => navigate('/profile')}
          style={{
            display: 'flex', alignItems: 'center', gap: '0.5rem',
            background: 'rgba(15,23,42,0.6)', border: '1px solid rgba(51,65,85,0.6)',
            borderRadius: '8px', padding: '0.5rem 1rem', color: '#cbd5e1',
            cursor: 'pointer', fontSize: '0.9rem', transition: 'all 0.2s',
            backdropFilter: 'blur(10px)'
          }}
          onMouseOver={e => { e.currentTarget.style.background = 'rgba(15,23,42,0.9)'; e.currentTarget.style.color = 'white'; }}
          onMouseOut={e => { e.currentTarget.style.background = 'rgba(15,23,42,0.6)'; e.currentTarget.style.color = '#cbd5e1'; }}
        >
          Profile
        </button>
        <button 
          onClick={handleLogout}
          style={{
            display: 'flex', alignItems: 'center', gap: '0.5rem',
            background: 'rgba(15,23,42,0.6)', border: '1px solid rgba(51,65,85,0.6)',
            borderRadius: '8px', padding: '0.5rem 1rem', color: '#cbd5e1',
            cursor: 'pointer', fontSize: '0.9rem', transition: 'all 0.2s',
            backdropFilter: 'blur(10px)'
          }}
          onMouseOver={e => { e.currentTarget.style.background = 'rgba(15,23,42,0.9)'; e.currentTarget.style.color = 'white'; }}
          onMouseOut={e => { e.currentTarget.style.background = 'rgba(15,23,42,0.6)'; e.currentTarget.style.color = '#cbd5e1'; }}
        >
          <LogOut size={16} /> Log Out
        </button>
      </div>

      <div style={{ width: '100%', maxWidth: '600px', background: 'rgba(15,23,42,0.8)', border: '1px solid rgba(51,65,85,0.5)', borderRadius: '20px', padding: '3rem', backdropFilter: 'blur(20px)' }}>
        
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <h1 style={{ fontSize: '2rem', margin: '0 0 1rem 0', color: '#f8fafc' }}>Welcome to Vortex-Gen</h1>
          <p style={{ color: '#94a3b8', margin: 0 }}>How would you like to use the platform?</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '2.5rem' }}>
          <OptionCard 
            icon={GraduationCap}
            title="Join an Academy"
            description="I have an invite code from my instructor or institution."
            selected={mode === 'academy'}
            onClick={() => setMode('academy')}
          />
          <OptionCard 
            icon={Building2}
            title="Create Workspace"
            description="I want to create my own personal workspace or team."
            selected={mode === 'workspace'}
            onClick={() => setMode('workspace')}
          />
        </div>

        {mode && (
          <form onSubmit={handleSubmit} style={{ animation: 'fadeIn 0.3s ease-out' }}>
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: '#cbd5e1', fontSize: '0.9rem', fontWeight: 500 }}>
                {mode === 'academy' ? 'Enter your Academy Invite Code' : 'Name your Workspace'}
              </label>
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder={mode === 'academy' ? 'VRTX-XXXX-XXXX' : 'e.g., My Personal Workspace'}
                style={{
                  width: '100%', padding: '0.8rem 1rem', background: 'rgba(2,8,23,0.8)',
                  border: '1px solid rgba(51,65,85,0.8)', borderRadius: '8px', color: 'white',
                  fontSize: '1rem', outline: 'none'
                }}
                required
              />
            </div>

            {error && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#ef4444', background: 'rgba(239,68,68,0.1)', padding: '0.8rem', borderRadius: '8px', marginBottom: '1.5rem' }}>
                <AlertCircle size={18} />
                <span style={{ fontSize: '0.9rem' }}>{error}</span>
              </div>
            )}

            <button 
              type="submit"
              disabled={loading || !inputValue.trim()}
              style={{
                width: '100%', padding: '1rem', background: 'linear-gradient(135deg, #6366f1, #3b82f6)',
                border: 'none', borderRadius: '8px', color: 'white', fontWeight: 600, fontSize: '1rem',
                cursor: (loading || !inputValue.trim()) ? 'not-allowed' : 'pointer',
                opacity: (loading || !inputValue.trim()) ? 0.7 : 1,
                display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem',
                transition: 'opacity 0.2s'
              }}
            >
              {loading ? <Loader2 size={20} style={{ animation: 'spin 1s linear infinite' }} /> : 'Continue'}
            </button>
          </form>
        )}
      </div>
      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
};

export default Onboarding;
