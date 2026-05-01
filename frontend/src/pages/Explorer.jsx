import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, Info, Plane, Box, Wind, Triangle, FlaskConical } from 'lucide-react';
import aircraftImg from '../assets/aircraft-topview.png';

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
    link: '/explore/fuselage',
    color: '#22c55e',
    icon: <Triangle size={18} />,
    facts: ['Horizontal + vertical stabilizers', 'Contains elevator and rudder', 'Critical for stability'],
  },
];

// Interactive overlay zones — positioned over the aircraft image (percentages)
const ZONE_OVERLAYS = {
  fuselage: { top: '44%', left: '8%', width: '82%', height: '12%', borderRadius: '40px' },
  wings:    { top: '5%',  left: '30%', width: '35%', height: '90%', borderRadius: '20px' },
  tail:     { top: '25%', left: '80%', width: '15%', height: '50%', borderRadius: '12px' },
  airfoil:  { top: '15%', left: '42%', width: '8%', height: '12%', borderRadius: '8px' },
};

const Explorer = () => {
  const navigate = useNavigate();
  const [hoveredZone, setHoveredZone] = useState(null);
  const [isAdvanced, setIsAdvanced] = useState(false);

  const activeZone = AIRCRAFT_ZONES.find(z => z.id === hoveredZone);

  return (
    <div className="min-h-full px-6 lg:px-10 py-8 max-w-7xl mx-auto">
      
      {/* ── Header ── */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-8 edu-animate-in">
        <div>
          <h1 className="text-3xl lg:text-4xl font-bold text-white mb-2">
            Aircraft Explorer
          </h1>
          <p className="text-[var(--color-edu-text-muted)] text-sm lg:text-base max-w-lg">
            Hover over and click any component to learn how it works. 
            From structure to aerodynamics — discover the engineering behind flight.
          </p>
        </div>

        {/* Complexity Toggle */}
        <div className="flex items-center gap-3">
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
      </div>

      {/* ── Main Content Grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 edu-animate-in edu-animate-in-delay-1">
        
        {/* ── Aircraft Image with Interactive Overlays ── */}
        <div className="lg:col-span-2 relative">
          <div className="relative bg-[var(--color-edu-surface)] border border-white/5 rounded-2xl p-6 lg:p-8 overflow-hidden">
            {/* Decorative grid */}
            <div className="absolute inset-0 edu-grid-bg opacity-40 pointer-events-none" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_50%_50%_at_50%_50%,rgba(56,189,248,0.03),transparent)] pointer-events-none" />

            {/* Label */}
            <div className="absolute top-4 left-4 z-10 flex items-center gap-2 text-[10px] font-mono tracking-widest text-[var(--color-edu-text-muted)] uppercase">
              <Plane size={12} /> Top View · Interactive Schematic
            </div>

            {/* Aircraft Image + Overlay Container */}
            <div className="relative mt-6" style={{ minHeight: 340 }}>
              {/* The generated aircraft image */}
              <img 
                src={aircraftImg} 
                alt="Aircraft top-down view" 
                className="w-full h-auto relative z-0 select-none pointer-events-none"
                draggable={false}
                style={{ 
                  filter: hoveredZone ? 'brightness(0.7)' : 'brightness(0.9)',
                  transition: 'filter 0.4s ease'
                }}
              />

              {/* Interactive zone overlays */}
              {AIRCRAFT_ZONES.map((zone) => {
                const pos = ZONE_OVERLAYS[zone.id];
                const isHovered = hoveredZone === zone.id;
                return (
                  <div
                    key={zone.id}
                    className="absolute cursor-pointer transition-all duration-300"
                    style={{
                      ...pos,
                      background: isHovered ? `${zone.color}18` : 'transparent',
                      border: isHovered ? `2px solid ${zone.color}60` : '2px solid transparent',
                      boxShadow: isHovered
                        ? `0 0 30px ${zone.color}30, inset 0 0 20px ${zone.color}10`
                        : 'none',
                      zIndex: isHovered ? 15 : 10,
                    }}
                    onMouseEnter={() => setHoveredZone(zone.id)}
                    onMouseLeave={() => setHoveredZone(null)}
                    onClick={() => navigate(zone.link)}
                  >
                    {/* Zone label on hover */}
                    <AnimatePresence>
                      {isHovered && (
                        <motion.div
                          initial={{ opacity: 0, y: 6 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 6 }}
                          transition={{ duration: 0.2 }}
                          className="absolute -top-10 left-1/2 -translate-x-1/2 whitespace-nowrap"
                        >
                          <div 
                            className="px-3 py-1.5 rounded-lg text-xs font-bold tracking-wide backdrop-blur-sm"
                            style={{ 
                              background: `${zone.color}20`,
                              border: `1px solid ${zone.color}40`,
                              color: zone.color 
                            }}
                          >
                            {zone.label} — Click to explore
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}

              {/* Airfoil cross-section callout */}
              <AnimatePresence>
                {hoveredZone === 'airfoil' && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    className="absolute z-20 pointer-events-none"
                    style={{ top: '10%', left: '38%' }}
                  >
                    <svg width="120" height="60" viewBox="0 0 120 60">
                      <path 
                        d="M5,30 Q10,12 30,8 Q60,6 80,12 Q95,18 115,30 Q95,38 80,42 Q60,45 30,44 Q10,40 5,30 Z"
                        fill="#f59e0b" fillOpacity="0.15" stroke="#f59e0b" strokeWidth="2" strokeOpacity="0.8"
                      />
                      <text x="60" y="56" textAnchor="middle" fill="#f59e0b" fontSize="9" fontFamily="monospace" fontWeight="bold">PROFILE</text>
                    </svg>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Instruction hint */}
            <div className="mt-3 text-center text-[11px] font-mono tracking-wider text-[var(--color-edu-text-muted)]/50">
              HOVER · CLICK TO EXPLORE COMPONENT
            </div>
          </div>
        </div>

        {/* ── Side Panel ── */}
        <div className="space-y-4 edu-animate-in edu-animate-in-delay-2">
          {/* Info Panel — absolute so it never pushes nav cards */}
          <div style={{ position: 'relative', height: 320 }}>
            <AnimatePresence mode="wait">
              {activeZone ? (
                <motion.div
                  key={activeZone.id}
                  initial={{ opacity: 0, x: 12 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -12 }}
                  transition={{ duration: 0.25 }}
                  className="explorer-card"
                  style={{ '--card-glow': `${activeZone.color}15`, cursor: 'default', position: 'absolute', inset: 0 }}
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
                  className="explorer-card text-center"
                  style={{ cursor: 'default', position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}
                >
                  <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-4">
                    <Info size={20} className="text-[var(--color-edu-text-muted)]" />
                  </div>
                  <h3 className="text-base font-bold text-white mb-2">Select a Component</h3>
                  <p className="text-sm text-[var(--color-edu-text-muted)]">
                    Hover over any part of the aircraft to see details. Click to dive deeper.
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Quick Navigation Cards */}
          <div className="space-y-2">
            {AIRCRAFT_ZONES.map((zone) => (
              <button
                key={zone.id}
                onClick={() => navigate(zone.link)}
                onMouseEnter={() => setHoveredZone(zone.id)}
                onMouseLeave={() => setHoveredZone(null)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border transition-all duration-300 text-left group
                  ${hoveredZone === zone.id 
                    ? 'bg-white/5 border-white/12' 
                    : 'bg-transparent border-white/5 hover:bg-white/3'
                  }`}
              >
                <div 
                  className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-all"
                  style={{ 
                    background: hoveredZone === zone.id ? `${zone.color}20` : `${zone.color}08`,
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
            onClick={() => navigate('/dashboard')}
            className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl text-sm font-bold
              bg-gradient-to-r from-[var(--color-edu-sky)]/12 to-[var(--color-accent-purple)]/12
              border border-[var(--color-edu-sky)]/20 text-[var(--color-edu-sky)]
              hover:border-[var(--color-edu-sky)]/35 hover:from-[var(--color-edu-sky)]/18 hover:to-[var(--color-accent-purple)]/18
              transition-all duration-300"
          >
            <FlaskConical size={16} />
            Open Wind Tunnel Lab
          </button>
        </div>
      </div>
    </div>
  );
};

export default Explorer;
