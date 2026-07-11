import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Wind, Plane, Navigation, Box, ArrowRight, FlaskConical, Lock, Zap, Star } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';
import SEO from '../../components/SEO';

// Inline mini airfoil SVG for the hero card
const MiniAirfoilSVG = () => (
  <svg viewBox="-0.5 -0.2 1 0.4" style={{ width: '100%', height: '100%', opacity: 0.12 }}>
    <path
      d="M-0.5,0 C-0.3,-0.12 0.1,-0.16 0.4,-0.08 L0.5,0 L0.4,0.05 C0.1,0.1 -0.3,0.08 -0.5,0 Z"
      fill="#f59e0b" stroke="#f59e0b" strokeWidth="0.005"
    />
    <path
      d="M-0.5,0 C-0.3,-0.12 0.1,-0.16 0.4,-0.08 L0.5,0 L0.4,0.05 C0.1,0.1 -0.3,0.08 -0.5,0 Z"
      fill="none" stroke="#f59e0b" strokeWidth="0.006"
    />
  </svg>
);

const SUPPORT_LABS = [
  {
    id: 'wings', route: '/lab/wings', label: 'Wing Configurator', subtitle: 'Wings Lab',
    description: 'Adjust span, sweep angle, and aspect ratio. See lift, drag, and induced drag update live.',
    icon: <Plane size={24} />, color: '#a78bfa', tag: 'Free',
    features: ['Planform SVG preview', 'L/D ratio chart', 'Drag vs span graph'],
  },
  {
    id: 'tail', route: '/lab/tail', label: 'Stability Lab', subtitle: 'Tail & CG Simulation',
    description: 'Move the center of gravity and watch the aircraft stability respond on a live side-view diagram.',
    icon: <Navigation size={24} />, color: '#22c55e', tag: 'Free',
    features: ['Animated aircraft diagram', 'CG/NP markers', 'Static margin gauge'],
  },
  {
    id: 'fuselage', route: '/lab/fuselage', label: 'Pressurization Sim', subtitle: 'Fuselage Lab',
    description: 'Set cruise altitude and watch cabin pressure, differential pressure, and hoop stress update.',
    icon: <Box size={24} />, color: '#38bdf8', tag: 'Free',
    features: ['Atmosphere column', 'Live cross-section', 'Hoop stress arrows'],
  },
  {
    id: 'engines', route: '/lab/engines', label: 'Turbofan Simulator', subtitle: 'Engines Lab',
    description: 'Adjust bypass ratio, thrust setting, altitude and Mach. Watch net thrust, propulsive efficiency, TSFC and EGT update live.',
    icon: <Zap size={24} />, color: '#fb923c', tag: 'Free',
    features: ['Brayton cycle model', 'ISA atmosphere', 'Mach sweep charts'],
  },
];

const LabHub = () => {
  const navigate = useNavigate();
  const { user } = useAppContext();

  return (
    <div className="min-h-screen bg-[var(--color-edu-navy)] text-[var(--color-edu-text)] font-sans">
      <SEO 
        title="Aviation Labs Hub | Vortex Gen" 
        description="Interactive aircraft component simulators. Access the Wind Tunnel, Wing Configurator, Stability Lab, Pressurization Sim, and Turbofan Simulator."
      />
      {/* Header */}
      <div className="pt-16 pb-0">
        <div className="max-w-5xl mx-auto px-6 lg:px-10 pt-14 pb-8">
          <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }}>
            <div className="flex items-center gap-2 text-[11px] font-mono tracking-widest text-[var(--color-edu-sky)] uppercase mb-4">
              <Link to="/explore" className="hover:underline">Explorer</Link>
              <span className="opacity-40">/</span>
              <span>Labs</span>
            </div>
            <div className="flex items-center gap-4 mb-2">
              <div className="w-12 h-12 rounded-2xl bg-[var(--color-edu-sky)]/15 border border-[var(--color-edu-sky)]/30 flex items-center justify-center text-[var(--color-edu-sky)]">
                <FlaskConical size={24} />
              </div>
              <div>
                <h1 className="text-3xl lg:text-4xl font-bold text-white">Vortex-Gen Labs</h1>
                <p className="text-[var(--color-edu-text-muted)] text-sm">Interactive aircraft component simulators</p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 lg:px-10 pb-20">

        {/* ── Wind Tunnel Hero Card ── */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          whileHover={{ y: -3 }}
          onClick={() => user ? navigate('/lab/airfoil') : navigate('/login')}
          className="group relative rounded-2xl cursor-pointer overflow-hidden mb-6"
          style={{
            background: 'linear-gradient(135deg, rgba(245,158,11,0.08) 0%, rgba(251,191,36,0.04) 50%, rgba(15,23,42,0.95) 100%)',
            border: '1px solid rgba(245,158,11,0.3)',
            boxShadow: '0 0 40px rgba(245,158,11,0.08), inset 0 1px 0 rgba(245,158,11,0.1)',
          }}
        >
          {/* Animated glow pulse */}
          <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
            style={{ background: 'radial-gradient(ellipse at 30% 50%, rgba(245,158,11,0.12), transparent 65%)' }} />

          {/* Large background airfoil */}
          <div className="absolute inset-0 pointer-events-none" style={{ transform: 'scale(1.3) translateX(15%)' }}>
            <MiniAirfoilSVG />
          </div>

          {/* Animated shimmer line */}
          <div className="absolute top-0 left-0 right-0 h-px"
            style={{ background: 'linear-gradient(90deg, transparent, rgba(245,158,11,0.8), rgba(251,191,36,0.6), transparent)' }} />

          <div className="relative z-10 p-7 md:p-8">
            <div className="flex flex-col md:flex-row md:items-center gap-6">
              {/* Left: icon + badges */}
              <div className="flex-shrink-0">
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-3"
                  style={{ background: 'rgba(245,158,11,0.15)', border: '1px solid rgba(245,158,11,0.4)', color: '#f59e0b', boxShadow: '0 0 20px rgba(245,158,11,0.2)' }}>
                  <Wind size={32} />
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold tracking-widest px-2.5 py-1 rounded-full"
                    style={{ background: 'rgba(245,158,11,0.15)', border: '1px solid rgba(245,158,11,0.4)', color: '#f59e0b' }}>
                    <Star size={9} fill="currentColor" /> FEATURED
                  </span>
                  <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold tracking-widest px-2.5 py-1 rounded-full"
                    style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#f87171' }}>
                    <Lock size={9} /> Sign-in Required
                  </span>
                </div>
              </div>

              {/* Center: text */}
              <div className="flex-1 min-w-0">
                <div className="text-[10px] font-mono tracking-widest uppercase mb-1" style={{ color: '#f59e0b' }}>
                  Airfoil Simulation · NeuralFoil ML
                </div>
                <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">Wind Tunnel Lab</h2>
                <p className="text-sm text-[var(--color-edu-text-muted)] leading-relaxed max-w-lg">
                  The only aerospace simulator powered by a real neural network. Run NeuralFoil ML predictions on airfoil profiles.
                  Adjust wind speed, angle of attack, and see lift/drag coefficients, polar charts, and pressure heatmaps in real-time.
                </p>
                <div className="flex flex-wrap gap-2 mt-3">
                  {['NeuralFoil ML backend','Cl / Cd polar charts','Pressure coefficient heatmap','Airfoil import (.dat)','Autotune optimizer'].map(f => (
                    <span key={f} className="text-[10px] font-mono px-2.5 py-1 rounded-full"
                      style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)', color: '#f59e0b' }}>{f}</span>
                  ))}
                </div>
              </div>

              {/* Right: CTA */}
              <div className="flex-shrink-0 flex items-center">
                <div className="flex items-center gap-2 text-base font-bold group-hover:gap-3 transition-all"
                  style={{ color: '#f59e0b' }}>
                  <Zap size={18} />
                  {user ? 'Launch Lab' : 'Sign in to open'}
                  <ArrowRight size={18} />
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* ── Support Labs 3-column grid ── */}
        <div className="text-[11px] font-mono tracking-widest text-[var(--color-edu-text-muted)] uppercase mb-4">
          Free Simulators
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {SUPPORT_LABS.map((lab, i) => (
            <motion.div
              key={lab.id}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 + i * 0.08 }}
              whileHover={{ y: -4 }}
              className="group relative bg-[var(--color-edu-surface)] border border-white/5 rounded-2xl p-5 cursor-pointer overflow-hidden transition-all duration-300 hover:border-white/15"
              onClick={() => navigate(lab.route)}
              style={{ '--lab-color': lab.color }}
            >
              <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                style={{ background: `radial-gradient(circle at 30% 30%, ${lab.color}12, transparent 70%)` }} />

              <div className="flex items-start justify-between mb-3 relative z-10">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: `${lab.color}14`, color: lab.color }}>
                  {lab.icon}
                </div>
                <span className="text-[9px] font-mono font-bold tracking-widest px-2 py-0.5 rounded-full"
                  style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.25)', color: '#4ade80' }}>
                  {lab.tag}
                </span>
              </div>

              <div className="relative z-10 mb-3">
                <div className="text-[9px] font-mono tracking-widest uppercase mb-0.5" style={{ color: lab.color }}>{lab.subtitle}</div>
                <h2 className="text-base font-bold text-white mb-1">{lab.label}</h2>
                <p className="text-xs text-[var(--color-edu-text-muted)] leading-relaxed">{lab.description}</p>
              </div>

              <div className="flex flex-wrap gap-1.5 mb-4 relative z-10">
                {lab.features.map((f, fi) => (
                  <span key={fi} className="text-[9px] font-mono px-2 py-0.5 rounded-full"
                    style={{ borderColor: `${lab.color}25`, color: lab.color, background: `${lab.color}08`, border: `1px solid ${lab.color}25` }}>
                    {f}
                  </span>
                ))}
              </div>

              <div className="flex items-center gap-1.5 text-xs font-bold relative z-10 group-hover:gap-2.5 transition-all" style={{ color: lab.color }}>
                Open Lab <ArrowRight size={14} />
              </div>
            </motion.div>
          ))}
        </div>

        {/* Back link */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="mt-10 text-center">
          <Link to="/explore" className="text-sm font-semibold text-[var(--color-edu-text-muted)] hover:text-white transition-colors">
            ← Back to Aircraft Explorer
          </Link>
        </motion.div>
      </div>
    </div>
  );
};

export default LabHub;
