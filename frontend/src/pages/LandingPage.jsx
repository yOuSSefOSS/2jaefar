import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Plane, FlaskConical, BookOpen, Layers, ArrowRight, Wind, GraduationCap, Sparkles } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import logoUrl from '../assets/logo.png';
import aircraftImg from '../assets/aircraft-topview.png';

const FEATURES = [
  {
    icon: <Plane size={24} />,
    title: 'Interactive Aircraft Explorer',
    desc: 'Click on any part of the airplane to discover its purpose, engineering, and the physics behind flight.',
    color: '#38bdf8',
  },
  {
    icon: <Wind size={24} />,
    title: 'Wind Tunnel Laboratory',
    desc: 'Run real aerodynamic simulations with NACA airfoils. Visualize lift, drag, and stall behavior in real-time.',
    color: '#a78bfa',
  },
  {
    icon: <BookOpen size={24} />,
    title: 'Adaptive Learning',
    desc: 'Toggle between Beginner and Advanced modes. From basic concepts to engineering-level theory — at your pace.',
    color: '#f59e0b',
  },
  {
    icon: <Layers size={24} />,
    title: 'From Theory to Simulation',
    desc: 'Learn the airfoil theory, then immediately test it in the simulation lab. Education meets experimentation.',
    color: '#22c55e',
  },
];

const TOPICS = [
  { label: 'Fuselage', emoji: '🛩️', desc: 'Structure, pressurization, cargo vs passenger' },
  { label: 'Wings', emoji: '✈️', desc: 'Lift, flaps, ailerons, fuel storage' },
  { label: 'Airfoil', emoji: '💨', desc: 'Aerodynamic profiles, angle of attack, stall' },
  { label: 'Wind Tunnel', emoji: '🔬', desc: 'Live simulation with real physics' },
];

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 28, filter: 'blur(8px)' },
  animate: { opacity: 1, y: 0, filter: 'blur(0px)' },
  transition: { duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] },
});

const LandingPage = () => {
  const { user, displayName } = useAppContext();
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-[var(--color-edu-navy)] text-[var(--color-edu-text)] overflow-x-hidden">
      
      {/* ── Navbar ── */}
      <header className="fixed top-0 left-0 right-0 z-50 h-16 flex items-center justify-between px-6 lg:px-10 bg-[var(--color-edu-navy)]/80 backdrop-blur-xl border-b border-white/5">
        <Link to="/" className="flex items-center gap-3">
          <img src={logoUrl} alt="Vortex-Gen" className="h-8 w-auto object-contain drop-shadow-[0_0_10px_rgba(56,189,248,0.4)]" style={{ mixBlendMode: 'screen' }} />
          <span className="font-bold text-lg tracking-wider text-white">Vortex-Gen</span>
        </Link>
        <nav className="flex items-center gap-4">
          <Link to="/explore" className="hidden sm:block text-sm font-semibold text-[var(--color-edu-text-muted)] hover:text-white transition-colors">
            Explorer
          </Link>
          <Link to="/lab" className="hidden sm:block text-sm font-semibold text-[var(--color-edu-text-muted)] hover:text-white transition-colors">
            Labs
          </Link>
          {user ? (
            <>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '5px 12px', borderRadius: 8, background: 'rgba(56,189,248,0.08)', border: '1px solid rgba(56,189,248,0.2)' }}>
                <div style={{ width: 26, height: 26, borderRadius: '50%', background: 'linear-gradient(135deg, #00f0ff, #0ea5e9)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 800, color: '#020817', flexShrink: 0 }}>
                  {displayName.slice(0, 2).toUpperCase()}
                </div>
                <span style={{ fontSize: 13, fontWeight: 600, color: '#e2e8f0' }}>{displayName.split(' ')[0]}</span>
              </div>
              <Link to="/lab/airfoil" className="cta-primary !py-2.5 !px-5 !text-[13px] !rounded-lg">
                Go to Lab <ArrowRight size={14} />
              </Link>
            </>
          ) : (
            <>
              <Link to="/login" className="text-sm font-semibold text-[var(--color-edu-text-muted)] hover:text-white transition-colors">
                Sign In
              </Link>
              <Link to="/signup" className="cta-primary !py-2.5 !px-5 !text-[13px] !rounded-lg">
                Get Started
              </Link>
            </>
          )}
        </nav>
      </header>

      {/* ── Hero Section ── */}
      <section className="relative min-h-screen flex items-center justify-center pt-16 overflow-hidden">
        {/* Background orbs */}
        <div className="orb" style={{ width: 500, height: 500, top: '-10%', left: '-5%', background: 'radial-gradient(circle, #38bdf8, transparent)' }} />
        <div className="orb" style={{ width: 400, height: 400, bottom: '5%', right: '-3%', background: 'radial-gradient(circle, #8b5cf6, transparent)', animationDelay: '-7s' }} />
        <div className="orb" style={{ width: 300, height: 300, top: '40%', left: '50%', background: 'radial-gradient(circle, #f59e0b, transparent)', animationDelay: '-12s', opacity: 0.08 }} />
        
        {/* Grid overlay */}
        <div className="absolute inset-0 edu-grid-bg opacity-50" />

        <div className="relative z-10 max-w-5xl mx-auto px-6 text-center">
          {/* Badge */}
          <motion.div {...fadeUp(0)} className="mb-6">
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[11px] font-semibold tracking-wider uppercase
              bg-[var(--color-edu-sky)]/10 border border-[var(--color-edu-sky)]/20 text-[var(--color-edu-sky)]">
              <GraduationCap size={14} />
              Academic Aviation Platform
            </span>
          </motion.div>

          {/* Title */}
          <motion.h1 {...fadeUp(0.1)} className="hero-title mb-6">
            Learn How Aircraft
            <br />
            <span className="bg-gradient-to-r from-[var(--color-edu-sky)] via-[var(--color-edu-sky-muted)] to-[var(--color-accent-purple)] bg-clip-text text-transparent">
              Really Work
            </span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p {...fadeUp(0.2)} className="hero-subtitle mx-auto mb-10">
            Interactive aviation education — from the fuselage to the airfoil. 
            Explore every component of an airplane, then test the physics in a real wind tunnel simulation.
          </motion.p>

          {/* CTAs */}
          <motion.div {...fadeUp(0.3)} className="flex flex-wrap items-center justify-center gap-4">
            <Link to="/explore" className="cta-primary">
              Start Exploring <ArrowRight size={18} />
            </Link>
            <Link to="/lab" className="cta-secondary">
              <FlaskConical size={18} /> Labs Hub
            </Link>
          </motion.div>

          {/* ── Aircraft Blueprint Image (decorative) ── */}
          <motion.div 
            {...fadeUp(0.5)}
            className="mt-16 relative"
          >
            <div className="relative max-w-3xl mx-auto">
              <img 
                src={aircraftImg} 
                alt="Aircraft blueprint" 
                className="w-full h-auto opacity-40 select-none pointer-events-none"
                draggable={false}
                style={{ filter: 'brightness(0.8) saturate(1.2)' }}
              />
              {/* Subtle glow under the plane */}
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_40%_at_50%_50%,rgba(56,189,248,0.1),transparent)] pointer-events-none" />

              {/* Always-glowing airfoil callout — pulsing orange oval on wing */}
              <div
                onClick={() => navigate('/explore/airfoil')}
                title="Click to explore Airfoil Profile"
                style={{
                  position: 'absolute',
                  top: '30%',
                  left: '44%',
                  transform: 'translate(-50%, -50%)',
                  width: '14%',
                  aspectRatio: '2.5 / 1',
                  borderRadius: '50%',
                  cursor: 'pointer',
                  zIndex: 10,
                  animation: 'airfoilPulse 2.5s ease-in-out infinite',
                  border: '2px solid rgba(245,158,11,0.85)',
                  background: 'rgba(245,158,11,0.06)',
                }}
              >
                <span style={{
                  position: 'absolute',
                  bottom: '-22px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  fontSize: 8,
                  fontFamily: 'monospace',
                  fontWeight: 700,
                  letterSpacing: '0.18em',
                  color: '#f59e0b',
                  whiteSpace: 'nowrap',
                  textShadow: '0 0 8px rgba(245,158,11,0.7)',
                  pointerEvents: 'none',
                }}>AIRFOIL</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Features Section ── */}
      <section className="relative py-24 px-6 lg:px-10">
        <div className="max-w-6xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">
              Everything You Need to Understand Flight
            </h2>
            <p className="text-[var(--color-edu-text-muted)] text-lg max-w-xl mx-auto">
              An interactive learning platform that bridges theory and practice.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {FEATURES.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-80px' }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="explorer-card group"
                style={{ '--card-glow': `${f.color}20` }}
              >
                <div 
                  className="w-11 h-11 rounded-xl flex items-center justify-center mb-4"
                  style={{ 
                    background: `${f.color}15`,
                    border: `1px solid ${f.color}30`,
                    color: f.color 
                  }}
                >
                  {f.icon}
                </div>
                <h3 className="text-lg font-bold text-white mb-2">{f.title}</h3>
                <p className="text-sm text-[var(--color-edu-text-muted)] leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Topics Preview ── */}
      <section className="relative py-24 px-6 lg:px-10 border-t border-white/5">
        <div className="max-w-5xl mx-auto text-center">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl lg:text-4xl font-bold text-white mb-4"
          >
            What Will You Explore?
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-[var(--color-edu-text-muted)] text-lg mb-12 max-w-lg mx-auto"
          >
            Click on any component of the airplane to start learning.
          </motion.p>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {TOPICS.map((t, i) => (
              <motion.div
                key={t.label}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.08 }}
                className="theory-section text-center group hover:border-white/10 transition-all cursor-pointer"
              >
                <div className="text-3xl mb-3">{t.emoji}</div>
                <h4 className="font-bold text-white text-base mb-1">{t.label}</h4>
                <p className="text-[11px] text-[var(--color-edu-text-muted)]">{t.desc}</p>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="mt-12"
          >
            <Link to="/explore" className="cta-primary">
              Open the Explorer <ArrowRight size={18} />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="py-10 px-6 border-t border-white/5 text-center">
        <div className="flex items-center justify-center gap-3 mb-3">
          <img src={logoUrl} alt="Vortex-Gen" className="h-6 w-auto opacity-60" style={{ mixBlendMode: 'screen' }} />
          <span className="text-sm font-semibold text-[var(--color-edu-text-muted)]">Vortex-Gen Academy</span>
        </div>
        <p className="text-xs text-[var(--color-edu-text-muted)]/60">
          Academic Aviation Explorer & Wind Tunnel Lab · Built for students and educators
        </p>
      </footer>
      <style>{`
        @keyframes airfoilPulse {
          0%, 100% { box-shadow: 0 0 14px rgba(245,158,11,0.55), inset 0 0 10px rgba(245,158,11,0.08); opacity: 0.8; }
          50% { box-shadow: 0 0 34px rgba(245,158,11,0.95), inset 0 0 18px rgba(245,158,11,0.18); opacity: 1; }
        }
      `}</style>
    </div>
  );
};

export default LandingPage;
