import React from 'react';
import { useAppContext, FLOW_VISUAL_OPTIONS } from '../context/AppContext';
import { Lock, Users, UserPlus, Crown, Trash2, SlidersHorizontal } from 'lucide-react';
import SimulationView from '../components/SimulationView';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../lib/supabaseClient';

const PREVIEW_AIRFOIL = {
  name: "Preview Profile",
  type: "Demonstration",
  airfoilData: [
    [1, 0], [0.8, 0.05], [0.5, 0.08], [0.2, 0.05], [0, 0],
    [0.2, -0.02], [0.5, -0.01], [0.8, -0.005], [1, 0]
  ]
};

// ─── Workspace Tab ────────────────────────────────────────────────────────
const TIER_LABELS = {
  free:    { label: 'Free',     color: '#64748b' },
  pro:     { label: 'Pro',      color: '#38bdf8' },
  pro_max: { label: 'Pro Max',  color: '#818cf8' },
};

const WorkspaceTab = () => {
  const { subscriptionTier } = useAppContext();
  const [wsInfo, setWsInfo]       = React.useState(null);
  const [members, setMembers]     = React.useState([]);
  const [inviteEmail, setInviteEmail] = React.useState('');
  const [loading, setLoading]     = React.useState(true);
  const [inviting, setInviting]   = React.useState(false);
  const [feedback, setFeedback]   = React.useState(null);

  const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  const getToken = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    return session?.access_token || '';
  };

  const fetchMembers = React.useCallback(async () => {
    setLoading(true);
    try {
      const token = await getToken();
      const res = await fetch(`${apiBase}/api/workspaces/members`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const json = await res.json();
      if (res.ok) { setWsInfo(json.workspace); setMembers(json.members); }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [apiBase]);

  React.useEffect(() => { fetchMembers(); }, [fetchMembers]);

  const handleInvite = async () => {
    if (!inviteEmail.includes('@')) return;
    setInviting(true);
    setFeedback(null);
    try {
      const token = await getToken();
      const res = await fetch(`${apiBase}/api/workspaces/invite`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: inviteEmail })
      });
      const json = await res.json();
      if (res.ok) {
        setFeedback({ type: 'ok', msg: json.message });
        setInviteEmail('');
        fetchMembers();
      } else {
        setFeedback({ type: 'err', msg: json.error });
      }
    } catch (e) {
      setFeedback({ type: 'err', msg: 'Network error.' });
    } finally {
      setInviting(false);
    }
  };

  const handleRemove = async (userId) => {
    const token = await getToken();
    await fetch(`${apiBase}/api/workspaces/remove`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId })
    });
    fetchMembers();
  };

  const tier = wsInfo?.plan || 'free';
  const tierMeta = TIER_LABELS[tier] || TIER_LABELS.free;

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Workspace Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="bg-brand-800/40 p-6 rounded-2xl border border-white/5 backdrop-blur-md shadow-xl"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-mono text-brand-400 uppercase tracking-widest mb-1">Active Workspace</p>
            <h3 className="text-white font-bold text-xl">{wsInfo?.name ?? '—'}</h3>
          </div>
          <span
            className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border"
            style={{ color: tierMeta.color, borderColor: tierMeta.color, background: tierMeta.color + '18' }}
          >
            {tierMeta.label}
          </span>
        </div>
      </motion.div>

      {/* Members List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
        className="bg-brand-800/40 p-6 rounded-2xl border border-white/5 backdrop-blur-md shadow-xl"
      >
        <h3 className="text-white font-semibold flex items-center gap-2 mb-4">
          <Users size={16} className="text-[var(--color-accent-blue)]" /> Team Members
        </h3>
        {loading ? (
          <p className="text-brand-400 text-sm">Loading…</p>
        ) : members.length === 0 ? (
          <p className="text-brand-400 text-sm">No members found.</p>
        ) : (
          <ul className="space-y-2">
            {members.map((m) => {
              const name = m.profiles?.display_name || m.user_id?.slice(0, 8) + '…';
              const isOwner = m.role === 'owner';
              return (
                <li key={m.user_id} className="flex items-center justify-between py-2 px-3 rounded-xl bg-black/20 border border-white/5">
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-full bg-[var(--color-accent-blue)]/20 flex items-center justify-center text-xs font-bold text-[var(--color-accent-blue)]">
                      {name[0]?.toUpperCase()}
                    </div>
                    <span className="text-white text-sm">{name}</span>
                    {isOwner && <Crown size={12} className="text-yellow-400" />}
                  </div>
                  {!isOwner && (
                    <button
                      onClick={() => handleRemove(m.user_id)}
                      className="text-brand-400 hover:text-red-400 transition-colors"
                      title="Remove member"
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </motion.div>

      {/* Invite Member */}
      <motion.div
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        className="bg-brand-800/40 p-6 rounded-2xl border border-white/5 backdrop-blur-md shadow-xl"
      >
        <h3 className="text-white font-semibold flex items-center gap-2 mb-1">
          <UserPlus size={16} className="text-[var(--color-accent-neon)]" /> Invite Member
        </h3>
        <p className="text-sm text-brand-400 mb-4">The person must already have a Vortex-Gen account.</p>
        <div className="flex gap-2">
          <input
            type="email"
            value={inviteEmail}
            onChange={e => setInviteEmail(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleInvite()}
            placeholder="colleague@email.com"
            className="flex-1 bg-black/30 border border-white/10 rounded-xl px-4 py-2 text-sm text-white placeholder-brand-500 focus:outline-none focus:border-[var(--color-accent-blue)] transition-colors"
          />
          <button
            onClick={handleInvite}
            disabled={inviting || !inviteEmail.includes('@')}
            className="px-5 py-2 rounded-xl bg-[var(--color-accent-blue)] text-white text-sm font-semibold hover:brightness-110 transition disabled:opacity-40"
          >
            {inviting ? '…' : 'Invite'}
          </button>
        </div>
        <AnimatePresence>
          {feedback && (
            <motion.p
              initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className={`text-xs mt-3 font-mono ${
                feedback.type === 'ok' ? 'text-green-400' : 'text-red-400'
              }`}
            >
              {feedback.type === 'ok' ? '✓ ' : '✗ '}{feedback.msg}
            </motion.p>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};
// ─── End Workspace Tab ────────────────────────────────────────────────────

const Settings = () => {
  const { 
    useNeuralFoil, setUseNeuralFoil,
    units, setUnits,
    lowPowerMode, setLowPowerMode,
    flowVisualMode, setFlowVisualMode,
    audioVolume, setAudioVolume,
    soundPreset, setSoundPreset,
    graphBounds, setGraphBounds,
    subscriptionTier
  } = useAppContext();
  const [activeTab, setActiveTab] = React.useState('system');
  const previewTimeoutRef = React.useRef(null);
  const audioCtxRef = React.useRef(null);

  const playPreview = (presetId, vol = audioVolume) => {
    // Clear any existing preview loop if a button is spammed
    if (previewTimeoutRef.current) clearTimeout(previewTimeoutRef.current);

    const startTime = Date.now();
    const duration = 3000; // Play the preview rhythm for 3 seconds

    const pulse = () => {
      // Stop looping if 3 seconds have passed
      if (Date.now() - startTime > duration) return;

      try {
        if (!audioCtxRef.current || audioCtxRef.current.state === 'closed') {
           audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();
        }
        const audioCtx = audioCtxRef.current;
        const masterGain = audioCtx.createGain();
        
        // Exact rhythm timings matched from the main simulation
        const onTime = presetId === 'sonar' ? 150 : presetId === 'siren' ? 400 : 300;
        const offTime = presetId === 'sonar' ? 800 : presetId === 'siren' ? 100 : 400;

        masterGain.gain.setValueAtTime(0, audioCtx.currentTime);
        masterGain.gain.linearRampToValueAtTime((vol / 100) * 0.25, audioCtx.currentTime + 0.05);
        masterGain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + (onTime / 1000));
        masterGain.connect(audioCtx.destination);

        if (presetId === 'siren') {
          const osc1 = audioCtx.createOscillator();
          osc1.type = 'sawtooth';
          osc1.frequency.setValueAtTime(880, audioCtx.currentTime);
          const osc2 = audioCtx.createOscillator();
          osc2.type = 'square';
          osc2.frequency.setValueAtTime(885, audioCtx.currentTime);
          osc1.connect(masterGain);
          osc2.connect(masterGain);
          osc1.start(); osc2.start();
          osc1.stop(audioCtx.currentTime + (onTime / 1000));
          osc2.stop(audioCtx.currentTime + (onTime / 1000));
        } else if (presetId === 'sonar') {
          const osc = audioCtx.createOscillator();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(1200, audioCtx.currentTime);
          osc.connect(masterGain);
          osc.start();
          osc.stop(audioCtx.currentTime + (onTime / 1000));
        } else {
          const filter = audioCtx.createBiquadFilter();
          filter.type = 'lowpass';
          filter.frequency.setValueAtTime(1200, audioCtx.currentTime);
          const osc1 = audioCtx.createOscillator();
          osc1.type = 'triangle';
          osc1.frequency.setValueAtTime(400, audioCtx.currentTime);
          const osc2 = audioCtx.createOscillator();
          osc2.type = 'sawtooth';
          osc2.frequency.setValueAtTime(202, audioCtx.currentTime);
          osc1.connect(filter);
          osc2.connect(filter);
          filter.connect(masterGain);
          osc1.start(); osc2.start();
          osc1.stop(audioCtx.currentTime + (onTime / 1000));
          osc2.stop(audioCtx.currentTime + (onTime / 1000));
        }

        // Loop the next beat
        previewTimeoutRef.current = setTimeout(pulse, onTime + offTime);
      } catch(e) {
        console.warn("Audio Context preview failed:", e);
      }
    };

    pulse();
  };

  const [flowActivePreview, setFlowActivePreview] = React.useState(true);

  return (
    <div className="w-full h-full premium-glass flex overflow-hidden">
      
      {/* Left side: Settings Container */}
      <div className="flex-[0_0_100%] xl:flex-[0_0_55%] flex flex-col p-8 overflow-y-auto custom-scrollbar pb-16">
         {/* Tab switcher */}
         <div className="flex gap-2 mb-8 shrink-0 border-b border-white/10 pb-4">
           <button
             onClick={() => setActiveTab('system')}
             className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
               activeTab === 'system'
                 ? 'bg-[var(--color-accent-blue)]/15 text-white border border-[var(--color-accent-blue)]/50'
                 : 'text-brand-400 hover:text-white'
             }`}
           >
             <SlidersHorizontal size={14} /> System
           </button>
           <button
             onClick={() => setActiveTab('workspace')}
             className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
               activeTab === 'workspace'
                 ? 'bg-[var(--color-accent-neon)]/15 text-white border border-[var(--color-accent-neon)]/50'
                 : 'text-brand-400 hover:text-white'
             }`}
           >
             <Users size={14} /> Workspace
           </button>
         </div>

         {/* Workspace Tab */}
         {activeTab === 'workspace' && <WorkspaceTab />}

         {/* System Preferences Tab */}
         {activeTab === 'system' && <motion.div 
            initial="hidden"
            animate="visible"
            variants={{
               hidden: { opacity: 0 },
               visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
            }}
            className="space-y-6 max-w-2xl"
         >
            
            {/* Profile Settings */}
            <motion.div 
               variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
               className="bg-brand-800/40 p-6 rounded-2xl border border-white/5 backdrop-blur-md shadow-xl"
            >
               <h3 className="text-white font-semibold flex items-center gap-2 mb-4">
                 <Users size={16} className="text-[var(--color-accent-blue)]" /> Profile Settings
               </h3>
               <div className="flex gap-4 items-end">
                 <div className="flex-1">
                   <label className="block text-xs font-mono text-brand-400 mb-2 uppercase tracking-widest">Display Name</label>
                   <input
                     type="text"
                     id="displayNameInput"
                     placeholder="Your Name"
                     className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-brand-500 focus:outline-none focus:border-[var(--color-accent-blue)] transition-colors"
                   />
                 </div>
                 <button
                   onClick={async () => {
                     const name = document.getElementById('displayNameInput').value;
                     if (!name.trim()) return;
                     const { data: { user } } = await supabase.auth.getUser();
                     if (user) {
                       const { error } = await supabase.from('profiles').update({ display_name: name }).eq('id', user.id);
                       if (!error) alert('Display name updated successfully!');
                       else alert('Failed to update: ' + error.message);
                     }
                   }}
                   className="px-6 py-3 rounded-xl bg-[var(--color-accent-blue)] text-white text-sm font-semibold hover:brightness-110 transition"
                 >
                   Save Name
                 </button>
               </div>
            </motion.div>
            
            {/* NeuralFoil Toggle */}
            <motion.div 
               variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
               className={`bg-brand-800/40 p-6 rounded-2xl border border-white/5 flex justify-between items-center transition-colors backdrop-blur-md shadow-xl ${subscriptionTier === 'free' ? 'opacity-60 cursor-not-allowed' : 'hover:bg-white/5 cursor-pointer'}`}
               onClick={() => { if (subscriptionTier !== 'free') setUseNeuralFoil(!useNeuralFoil); }}
            >
               <div>
                  <h3 className="text-white font-semibold flex items-center gap-2">
                    NeuralFoil Machine Learning
                    {subscriptionTier === 'free' && <Lock size={14} className="text-[var(--color-accent-pink)] ml-1" />}
                    {!useNeuralFoil && subscriptionTier !== 'free' && <span className="text-[10px] bg-yellow-500/20 text-yellow-500 px-2 py-0.5 rounded-full border border-yellow-500/50">DISABLED</span>}
                  </h3>
                  <p className="text-sm text-brand-300">Utilize the PyTorch backend API for high-accuracy CFD predictions. If disabled, uses rudimentary math approximations.</p>
               </div>
               <div className={`w-12 h-6 flex-shrink-0 rounded-full relative shadow-[0_0_10px_var(--color-accent-blue)] transition-colors ${useNeuralFoil ? 'bg-[var(--color-accent-blue)]' : 'bg-gray-600 shadow-none'}`}>
                  <motion.div 
                     layout
                     className="w-4 h-4 bg-white rounded-full absolute top-1 shadow-md"
                     style={{ [useNeuralFoil ? 'right' : 'left']: '4px' }}
                  />
               </div>
            </motion.div>

            {/* Low Power Mode Toggle */}
            <motion.div 
               variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
               className={`bg-brand-800/40 p-6 rounded-2xl border border-white/5 flex justify-between items-center transition-colors backdrop-blur-md shadow-xl ${subscriptionTier !== 'pro_max' ? 'opacity-60 cursor-not-allowed' : 'hover:bg-white/5 cursor-pointer'}`}
               onClick={() => { if (subscriptionTier === 'pro_max') setLowPowerMode(!lowPowerMode); }}
            >
               <div>
                  <h3 className="text-white font-semibold flex items-center gap-2">
                    Low Power Mode (Eco)
                    {subscriptionTier !== 'pro_max' && <Lock size={14} className="text-[var(--color-accent-pink)] ml-1" />}
                    {lowPowerMode && subscriptionTier === 'pro_max' && <span className="text-[10px] bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full border border-green-500/50">ACTIVE</span>}
                  </h3>
                  <p className="text-sm text-brand-300">Reduces 3D flow particle count by half (and tightens streakline seeds) to save GPU and battery.</p>
               </div>
               <div className={`w-12 h-6 flex-shrink-0 rounded-full relative shadow-[0_0_10px_var(--color-accent-neon)] transition-colors ${lowPowerMode ? 'bg-green-500 shadow-[0_0_10px_#22c55e]' : 'bg-gray-600 shadow-none'}`}>
                  <motion.div 
                     layout
                     className="w-4 h-4 bg-white rounded-full absolute top-1 shadow-md"
                     style={{ [lowPowerMode ? 'right' : 'left']: '4px' }}
                  />
               </div>
            </motion.div>

            {/* Flow / streamline look (3D viewport) */}
            <motion.div 
               variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
               className="bg-brand-800/40 p-6 rounded-2xl border border-white/5 flex flex-col gap-4 backdrop-blur-md shadow-xl"
            >
               <div>
                  <h3 className="text-white font-semibold">Flow visualization</h3>
                  <p className="text-sm text-brand-300">How wind particles and streaklines appear in the dashboard 3D view (Start Flow).</p>
               </div>
               <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {FLOW_VISUAL_OPTIONS.map((opt) => (
                     <button
                        key={opt.id}
                        type="button"
                        onClick={() => setFlowVisualMode(opt.id)}
                        className={`text-left py-3 px-4 rounded-xl border transition-all relative overflow-hidden ${
                          flowVisualMode === opt.id
                            ? 'bg-[var(--color-accent-blue)]/15 border-[var(--color-accent-blue)] text-white shadow-[0_0_15px_rgba(14,165,233,0.3)]'
                            : 'bg-black/20 border-white/10 text-brand-400 hover:border-white/25 hover:text-brand-200'
                        }`}
                     >
                        <div className="relative z-10">
                           <div className="text-xs font-mono uppercase tracking-wider text-[var(--color-accent-blue)] mb-1">{opt.label}</div>
                           <div className="text-[11px] leading-snug text-brand-300">{opt.description}</div>
                        </div>
                     </button>
                  ))}
               </div>
            </motion.div>

            {/* Units Selector */}
            <motion.div 
               variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
               className="bg-brand-800/40 p-6 rounded-2xl border border-white/5 flex flex-col gap-4 backdrop-blur-md shadow-xl"
            >
               <div>
                  <h3 className="text-white font-semibold">Measurement Units</h3>
                  <p className="text-sm text-brand-300">Select standard metric or imperial aviation units.</p>
               </div>
               <div className="flex bg-black/40 rounded-xl p-1 w-full max-w-xs border border-white/10 relative">
                  <motion.div
                     layoutId="unitsIndicator"
                     className="absolute top-1 bottom-1 w-[calc(50%-4px)] bg-[var(--color-accent-blue)] rounded-lg shadow-md"
                     initial={false}
                     animate={{ x: units === 'metric' ? 0 : '100%' }}
                     transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                  />
                  <button 
                    onClick={() => setUnits('metric')} 
                    className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-colors relative z-10 ${units === 'metric' ? 'text-white' : 'text-brand-400 hover:text-white'}`}
                  >Metric (m/s)</button>
                  <button 
                    onClick={() => setUnits('imperial')} 
                    className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-colors relative z-10 ${units === 'imperial' ? 'text-white' : 'text-brand-400 hover:text-white'}`}
                  >Imperial (mph)</button>
               </div>
            </motion.div>

            {/* Alarm Audio Settings */}
            <motion.div 
               variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
               className="bg-brand-800/40 p-6 rounded-2xl border border-white/5 flex flex-col gap-6 backdrop-blur-md shadow-xl"
            >
               <div>
                  <h3 className="text-white font-semibold">Alarm Audio</h3>
                  <p className="text-sm text-brand-300">Configure the stall warning audio profile and volume.</p>
               </div>
               
               <div className="flex flex-col gap-3">
                  <label className="text-xs font-mono text-brand-400 uppercase tracking-widest">Sound Profile</label>
                  <div className="grid grid-cols-3 gap-2">
                     {[
                       { id: 'horn', label: 'Classic Horn' },
                       { id: 'siren', label: 'Aviation Siren' },
                       { id: 'sonar', label: 'Sonar Pulse' }
                     ].map(p => (
                        <button 
                          key={p.id} 
                          onClick={() => {
                            setSoundPreset(p.id);
                            playPreview(p.id);
                          }}
                          className={`py-2 px-3 rounded-xl text-xs font-mono uppercase tracking-wider border transition-all relative overflow-hidden ${soundPreset === p.id ? 'bg-[var(--color-accent-pink)]/20 border-[var(--color-accent-pink)] text-[var(--color-accent-pink)] shadow-[0_0_15px_rgba(244,63,94,0.3)]' : 'bg-black/20 border-white/10 text-brand-400 hover:border-white/30 hover:text-brand-200'}`}
                        >
                          <span className="relative z-10">{p.label}</span>
                        </button>
                     ))}
                  </div>
               </div>

               <div className="flex flex-col gap-3">
                  <div className="flex justify-between items-end">
                     <label className="text-xs font-mono text-brand-400 uppercase tracking-widest">Stall Alarm Volume</label>
                     <span className="text-[var(--color-accent-pink)] font-mono text-lg">{audioVolume}%</span>
                  </div>
                  <input 
                     type="range" min="0" max="100" 
                     value={audioVolume} 
                     onChange={(e) => {
                       setAudioVolume(e.target.value);
                       if (window.volDebounceRef) clearTimeout(window.volDebounceRef);
                       window.volDebounceRef = setTimeout(() => {
                         playPreview(soundPreset, e.target.value);
                       }, 150);
                     }}
                     className="w-full h-2 bg-brand-900 rounded-lg appearance-none cursor-pointer accent-[var(--color-accent-pink)]"
                  />
               </div>
            </motion.div>

            {/* Graph Bounds Sliders */}
            <motion.div 
               variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
               className="bg-brand-800/40 p-6 rounded-2xl border border-white/5 flex flex-col gap-5 border-b-transparent backdrop-blur-md shadow-xl"
            >
               <div>
                  <h3 className="text-white font-semibold">Graph Bounds (AoA Calculation Range)</h3>
                  <p className="text-sm text-brand-300">Limit the NeuralFoil sweep to specific Angles of Attack.</p>
               </div>
               
               <div className="flex items-center gap-4">
                 <span className="w-8 text-right font-mono text-brand-300 text-xs">MIN</span>
                 <input 
                    type="range" min="-40" max="0" 
                    value={graphBounds.min} onChange={(e) => setGraphBounds({...graphBounds, min: parseInt(e.target.value)})}
                    className="flex-1 h-2 bg-brand-900 rounded-lg appearance-none cursor-pointer accent-[var(--color-accent-blue)]"
                 />
                 <span className="w-8 font-mono text-[var(--color-accent-blue)] font-bold">{graphBounds.min}°</span>
               </div>
               <div className="flex items-center gap-4">
                 <span className="w-8 text-right font-mono text-brand-300 text-xs">MAX</span>
                 <input 
                    type="range" min="0" max="40" 
                    value={graphBounds.max} onChange={(e) => setGraphBounds({...graphBounds, max: parseInt(e.target.value)})}
                    className="flex-1 h-2 bg-brand-900 rounded-lg appearance-none cursor-pointer accent-[var(--color-accent-blue)]"
                 />
                 <span className="w-8 font-mono text-[var(--color-accent-blue)] font-bold">{graphBounds.max}°</span>
               </div>
            </motion.div>
         </motion.div>}
      </div>

      {/* Right side: 3D Live View */}
      <div className="hidden xl:flex flex-[0_0_45%] relative border-l border-white/10 bg-brand-900/40">
         <div className="absolute top-6 left-6 z-20 pointer-events-none">
            <h2 className="text-xs font-mono font-bold tracking-widest text-[var(--color-accent-neon)] uppercase">LIVE PREVIEW</h2>
            <div className="text-[10px] font-mono text-brand-300 mt-0.5">Interaction and particles mirror the Home viewport.</div>
         </div>
         <SimulationView 
           isSimulating={false}
           activeShape={null}
           pitchAngle={10}
           windSpeed={50}
           flowActive={flowActivePreview}
            onFlowToggle={() => setFlowActivePreview(p => !p)}
           isPreview={true}
         />
      </div>

    </div>
  );
};
export default Settings;
