import React, { useState, Suspense } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, Info, Plane, Box, Wind, Triangle, FlaskConical, Zap } from 'lucide-react';
import AircraftViewer3D from '../components/AircraftViewer3D';
import { SkeletonCard } from '../components/Skeleton';

const AIRCRAFT_ZONES = [
  {
    id: 'fuselage',
    label: 'Fuselage',
    description: 'The main body of the aircraft — holds passengers, cargo, and the structural backbone.',
    advancedDesc: 'A semi-monocoque pressure vessel designed to withstand hoop stress at cruising altitude (ΔP ≈ 8.6 psi). Materials range from aluminum alloys (2024-T3) to carbon-fiber composites (Boeing 787).',
    link: '/explore/fuselage',
    color: '#38bdf8',
    icon: <Box size={18} />,
    facts: ['Houses the cockpit and cabin', 'Must withstand pressurization cycles', 'Longest structural component'],
  },
  {
    id: 'wings',
    label: 'Wings',
    description: 'Generate lift using their airfoil cross-section. Also store fuel and house control surfaces.',
    advancedDesc: 'Wings generate lift via circulation (Kutta condition). A typical transport aircraft wing has an aspect ratio of 8–12 and sweepback of 25°–35° for transonic drag reduction. Integral fuel tanks can hold 100,000+ kg of Jet-A.',
    link: '/explore/wings',
    color: '#a78bfa',
    icon: <Plane size={18} />,
    facts: ['Contain flaps, ailerons, and slats', 'Act as fuel tanks', 'Generate ~95% of total lift'],
  },
  {
    id: 'airfoil',
    label: 'Airfoil Profile',
    description: 'The cross-sectional shape of the wing — the key to understanding lift and drag.',
    advancedDesc: 'Airfoil geometry is defined by camber line, thickness distribution, and chord length. The NACA 4-digit series (e.g., 4412) encodes max camber, camber position, and max thickness. Lift coefficient scales linearly with AoA until stall (typically α ≈ 14°–16°).',
    link: '/explore/airfoil',
    color: '#f59e0b',
    icon: <Wind size={18} />,
    facts: ['Defines lift characteristics', 'Chord, camber, thickness', 'Tested in wind tunnels'],
  },
  {
    id: 'tail',
    label: 'Tail Section',
    description: 'The horizontal and vertical stabilizers provide pitch and yaw stability during flight.',
    advancedDesc: 'The empennage consists of the horizontal stabilizer (pitch stability, Cm_α < 0) and vertical stabilizer (yaw stability, Cn_β > 0). Elevator and rudder are the primary control surfaces.',
    link: '/explore/tail',
    color: '#22c55e',
    icon: <Triangle size={18} />,
    facts: ['Horizontal + vertical stabilizers', 'Contains elevator and rudder', 'Critical for stability'],
  },
  {
    id: 'engines',
    label: 'Engines',
    description: 'High-bypass turbofan engines that produce thrust via the Brayton thermodynamic cycle.',
    advancedDesc: 'Modern turbofans use a high bypass ratio (BPR 5–12) where most thrust comes from the cold bypass stream. Net thrust: F = ṁ_total·Ve − ṁ_intake·V∞. FADEC systems optimize fuel burn across the flight envelope.',
    link: '/explore/engines',
    color: '#fb923c',
    icon: <Zap size={18} />,
    facts: ['High-bypass turbofan', 'BPR 5:1 to 12:1', 'FADEC controlled'],
  },
];

const Explorer = () => {
  const navigate = useNavigate();
  const [hoveredZone, setHoveredZone] = useState(null);
  const [selectedZone, setSelectedZone] = useState(null);
  const [isAdvanced, setIsAdvanced] = useState(false);

  const activeZone = AIRCRAFT_ZONES.find(z => z.id === (hoveredZone || selectedZone));

  return (
    <div className="absolute inset-0 w-full h-full overflow-hidden flex flex-col justify-between">

      {/* ── Header ── */}
      <div className="relative z-20 flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4 p-8 pointer-events-none edu-animate-in">
        <div>
          <h1 className="text-4xl lg:text-5xl font-black text-white mb-2 drop-shadow-md">
            Aircraft Explorer
          </h1>
          <p className="text-[var(--color-edu-text-muted)] text-sm lg:text-base max-w-lg drop-shadow-sm font-medium">
            Interact with the 3D model — drag to orbit, scroll to zoom, and click any component to learn how it works.
          </p>
        </div>

      </div>

      {/* ── 3D Aircraft Viewer (Absolute Background) ── */}
      <div className="absolute inset-0 z-0">
        {/* Decorative grid */}
        <div className="absolute inset-0 edu-grid-bg opacity-10 pointer-events-none" />
        <AircraftViewer3D 
          onZoneHover={setHoveredZone}
          onZoneClick={setSelectedZone}
          externalHoveredZone={hoveredZone || selectedZone}
        />
      </div>

      {/* ── Side Panel (Floating UI) ── */}
      <div className="relative z-20 flex flex-col lg:flex-row gap-6 p-8 w-full justify-between items-end pointer-events-none">

        {/* Info Panel Group */}
        <div className="pointer-events-auto w-full lg:w-[360px] flex-shrink-0 flex flex-col gap-4" style={{ position: 'relative', minHeight: 280 }}>
          
          {/* Complexity Toggle */}
          <div className="flex items-center gap-3 bg-black/40 backdrop-blur-md px-4 py-2 rounded-xl border border-white/10 shadow-xl w-fit">
            <span className="text-[10px] font-mono tracking-wider text-[var(--color-edu-text-muted)] uppercase">Level:</span>
            <div className="complexity-toggle">
              <button
                className={`complexity-toggle-btn ${!isAdvanced ? 'active' : ''}`}
                onClick={() => setIsAdvanced(false)}
              >
                Beginner
              </button>
              <button
                className={`complexity-toggle-btn ${isAdvanced ? 'active' : ''}`}
                onClick={() => setIsAdvanced(true)}
              >
                Advanced
              </button>
            </div>
          </div>

          <AnimatePresence mode="wait">
              {activeZone ? (
                <motion.div
                  key={activeZone.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  transition={{ duration: 0.3 }}
                  className="explorer-card shadow-2xl backdrop-blur-xl"
                  style={{ '--card-glow': `${activeZone.color}15`, background: 'rgba(10,15,28,0.7)', border: `1px solid ${activeZone.color}40`, cursor: 'default' }}
                >
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center mb-3"
                    style={{
                      background: `${activeZone.color}15`,
                      border: `1px solid ${activeZone.color}30`,
                      color: activeZone.color
                    }}
                  >
                    {activeZone.icon}
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">{activeZone.label}</h3>
                  <p className="text-sm text-[var(--color-edu-text-muted)] leading-relaxed mb-4">
                    {isAdvanced ? activeZone.advancedDesc : activeZone.description}
                  </p>
                  <div className="space-y-2 mb-4">
                    {activeZone.facts.map((fact, i) => (
                      <div key={i} className="flex items-center gap-2 text-xs text-[var(--color-edu-text-muted)]">
                        <div className="w-1.5 h-1.5 rounded-full" style={{ background: activeZone.color }} />
                        {fact}
                      </div>
                    ))}
                  </div>
                  <button
                    onClick={() => navigate(activeZone.link)}
                    className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all"
                    style={{
                      background: `${activeZone.color}12`,
                      border: `1px solid ${activeZone.color}30`,
                      color: activeZone.color
                    }}
                  >
                    Explore {activeZone.label} <ChevronRight size={16} />
                  </button>
                </motion.div>
              ) : (
                <motion.div
                  key="default"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="explorer-card text-center shadow-xl backdrop-blur-md"
                  style={{ cursor: 'default', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyItems: 'center', padding: '3rem 1.5rem', background: 'rgba(10,15,28,0.5)', border: '1px solid rgba(255,255,255,0.1)' }}
                >
                  <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-4">
                    <Info size={20} className="text-[var(--color-edu-text-muted)]" />
                  </div>
                  <h3 className="text-base font-bold text-white mb-2">Click a Part</h3>
                  <p className="text-sm text-[var(--color-edu-text-muted)]">
                    Drag to orbit · scroll to zoom · click any component for details.
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

        {/* Quick Navigation Cards */}
        <div className="pointer-events-auto flex flex-col lg:flex-row gap-3 w-full lg:w-auto">
          {AIRCRAFT_ZONES.map((zone) => (
              <button
                key={zone.id}
                onClick={() => setSelectedZone(zone.id)}
                onMouseEnter={() => setHoveredZone(zone.id)}
                onMouseLeave={() => setHoveredZone(null)}
                className={`flex-1 flex items-center gap-3 px-4 py-3 rounded-2xl border transition-all duration-300 text-left group shadow-lg backdrop-blur-md
                  ${(hoveredZone || selectedZone) === zone.id
                    ? 'bg-white/10 border-white/25 scale-105'
                    : 'bg-black/40 border-white/10 hover:bg-white/10'
                  }`}
              >
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-all"
                  style={{
                    background: (hoveredZone || selectedZone) === zone.id ? `${zone.color}20` : `${zone.color}08`,
                    color: zone.color
                  }}
                >
                  {zone.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-white">{zone.label}</div>
                  <div className="text-[11px] text-[var(--color-edu-text-muted)] truncate">{zone.facts[0]}</div>
                </div>
                <ChevronRight size={14} className="text-[var(--color-edu-text-muted)] group-hover:text-white transition-colors flex-shrink-0" />
              </button>
            ))}
          </div>

          {/* Lab CTA */}
          <button
            onClick={() => navigate('/lab')}
            className="pointer-events-auto flex items-center justify-center gap-2 px-6 py-4 rounded-2xl text-sm font-bold shadow-2xl backdrop-blur-lg
              bg-gradient-to-r from-[var(--color-edu-sky)]/20 to-[var(--color-accent-purple)]/20
              border border-[var(--color-edu-sky)]/40 text-white
              hover:border-[var(--color-edu-sky)]/60 hover:from-[var(--color-edu-sky)]/30 hover:to-[var(--color-accent-purple)]/30
              transition-all duration-300 transform hover:scale-105"
          >
            <FlaskConical size={16} />
            Open Labs Hub
          </button>
      </div>
    </div>
  );
};

export default Explorer;
