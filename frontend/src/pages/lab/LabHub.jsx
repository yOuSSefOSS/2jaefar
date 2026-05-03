import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Wind, Plane, Navigation, Box, ArrowRight, FlaskConical, Lock } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';

const LABS = [
  {
    id: 'airfoil',
    route: '/lab/airfoil',
    label: 'Wind Tunnel',
    subtitle: 'Airfoil Simulation',
    description: 'Run NeuralFoil ML predictions on airfoil profiles. Adjust wind speed, angle of attack, and see lift/drag coefficients in real-time.',
    icon: <Wind size={28} />,
    color: '#f59e0b',
    tag: 'Requires sign-in',
    requiresAuth: true,
    features: ['NeuralFoil ML backend', 'Cl / Cd polar charts', 'Pressure coefficient heatmap'],
  },
  {
    id: 'wings',
    route: '/lab/wings',
    label: 'Wing Configurator',
    subtitle: 'Wings Lab',
    description: 'Adjust span, sweep angle, and aspect ratio. Instantly see how wing geometry affects lift, drag, and induced drag.',
    icon: <Plane size={28} />,
    color: '#a78bfa',
    tag: 'Free',
    requiresAuth: false,
    features: ['Aspect ratio slider', 'Sweep angle adjustment', 'Lift/drag preview'],
  },
  {
    id: 'tail',
    route: '/lab/tail',
    label: 'Stability Lab',
    subtitle: 'Tail & CG Simulation',
    description: 'Shift the center of gravity and see how the tail section responds. Explore pitch stability margins and elevator effectiveness.',
    icon: <Navigation size={28} />,
    color: '#22c55e',
    tag: 'Free',
    requiresAuth: false,
    features: ['CG shift slider', 'Static margin indicator', 'Pitch stability visualization'],
  },
  {
    id: 'fuselage',
    route: '/lab/fuselage',
    label: 'Pressurization Sim',
    subtitle: 'Fuselage Lab',
    description: 'Set cruise altitude and see cabin pressure, differential pressure, and structural stress on the fuselage cross-section.',
    icon: <Box size={28} />,
    color: '#38bdf8',
    tag: 'Free',
    requiresAuth: false,
    features: ['Altitude slider', 'ΔP calculation', 'Hoop stress visualization'],
  },
];

const LabHub = () => {
  const navigate = useNavigate();
  const { user } = useAppContext();

  return (
    <div className="min-h-screen bg-[var(--color-edu-navy)] text-[var(--color-edu-text)] font-sans">
      {/* Header */}
      <div className="pt-16 pb-0">
        <div className="max-w-5xl mx-auto px-6 lg:px-10 pt-14 pb-10">
          <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }}>
            <div className="flex items-center gap-2 text-[11px] font-mono tracking-widest text-[var(--color-edu-sky)] uppercase mb-4">
              <Link to="/explore" className="hover:underline">Explorer</Link>
              <span className="opacity-40">/</span>
              <span>Labs</span>
            </div>
            <div className="flex items-center gap-4 mb-3">
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

      {/* Lab Cards */}
      <div className="max-w-5xl mx-auto px-6 lg:px-10 pb-20">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {LABS.map((lab, i) => (
            <motion.div
              key={lab.id}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ y: -4 }}
              className="group relative bg-[var(--color-edu-surface)] border border-white/5 rounded-2xl p-6 cursor-pointer overflow-hidden transition-all duration-300 hover:border-white/15"
              onClick={() => {
                if (lab.requiresAuth && !user) navigate('/login');
                else navigate(lab.route);
              }}
              style={{ '--lab-color': lab.color }}
            >
              {/* Glow on hover */}
              <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                style={{ background: `radial-gradient(circle at 30% 30%, ${lab.color}10, transparent 70%)` }} />

              {/* Top row */}
              <div className="flex items-start justify-between mb-4 relative z-10">
                <div className="w-14 h-14 rounded-xl flex items-center justify-center" style={{ background: `${lab.color}14`, color: lab.color }}>
                  {lab.icon}
                </div>
                <span className={`text-[10px] font-mono font-bold tracking-widest px-2.5 py-1 rounded-full flex items-center gap-1.5 ${
                  lab.requiresAuth
                    ? 'bg-amber-500/10 border border-amber-500/25 text-amber-400'
                    : 'bg-emerald-500/10 border border-emerald-500/25 text-emerald-400'
                }`}>
                  {lab.requiresAuth && <Lock size={9} />}
                  {lab.tag}
                </span>
              </div>

              {/* Text */}
              <div className="relative z-10 mb-4">
                <div className="text-[10px] font-mono tracking-widest uppercase mb-1" style={{ color: lab.color }}>{lab.subtitle}</div>
                <h2 className="text-xl font-bold text-white mb-2">{lab.label}</h2>
                <p className="text-sm text-[var(--color-edu-text-muted)] leading-relaxed">{lab.description}</p>
              </div>

              {/* Feature pills */}
              <div className="flex flex-wrap gap-2 mb-5 relative z-10">
                {lab.features.map((f, fi) => (
                  <span key={fi} className="text-[10px] font-mono px-2.5 py-1 rounded-full border"
                    style={{ borderColor: `${lab.color}25`, color: lab.color, background: `${lab.color}08` }}>
                    {f}
                  </span>
                ))}
              </div>

              {/* CTA */}
              <div className="flex items-center gap-2 text-sm font-bold relative z-10 group-hover:gap-3 transition-all" style={{ color: lab.color }}>
                {lab.requiresAuth && !user ? 'Sign in to open' : 'Open Lab'} <ArrowRight size={16} />
              </div>
            </motion.div>
          ))}
        </div>

        {/* Back link */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.45 }} className="mt-10 text-center">
          <Link to="/explore" className="text-sm font-semibold text-[var(--color-edu-text-muted)] hover:text-white transition-colors">
            ← Back to Aircraft Explorer
          </Link>
        </motion.div>
      </div>
    </div>
  );
};

export default LabHub;
