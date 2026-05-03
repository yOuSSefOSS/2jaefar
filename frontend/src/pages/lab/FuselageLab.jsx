import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Box, ArrowLeft } from 'lucide-react';

const FuselageLab = () => {
  const [altitude, setAltitude] = useState(35000); // ft
  const [radius, setRadius] = useState(2.0);       // fuselage radius (m)
  const [thickness, setThickness] = useState(3);   // skin thickness (mm)

  // Ambient pressure at altitude (ISA model approximation)
  const ambientPsi = altitude < 36089
    ? 14.696 * Math.pow(1 - altitude / 145442, 5.256)
    : 14.696 * 0.2234 * Math.exp(-(altitude - 36089) / 20806);

  // Cabin pressure (maintained at 8,000 ft equivalent)
  const cabinPsi = 14.696 * Math.pow(1 - 8000 / 145442, 5.256);
  const deltaP = Math.max(0, cabinPsi - ambientPsi);

  // Hoop stress: σ = ΔP × r / t  (convert units)
  const deltaPPa = deltaP * 6894.76; // psi to Pa
  const radiusM = radius;
  const thicknessM = thickness / 1000;
  const hoopStressMPa = (deltaPPa * radiusM / thicknessM) / 1e6;

  // Aluminum yield strength: 2024-T3 ~ 345 MPa, CFRP ~ 600 MPa
  const alYield = 345;
  const safetyFactor = alYield / hoopStressMPa;

  const stressColor = safetyFactor > 2.5 ? '#22c55e' : safetyFactor > 1.5 ? '#f59e0b' : '#fb7185';
  const stressLabel = safetyFactor > 2.5 ? 'Safe' : safetyFactor > 1.5 ? 'Caution' : 'Over Limit';

  const Slider = ({ label, value, min, max, step = 1, unit, onChange, color }) => (
    <div className="mb-5">
      <div className="flex justify-between items-center mb-2">
        <span className="text-xs font-semibold text-[var(--color-edu-text-muted)] uppercase tracking-wider">{label}</span>
        <span className="text-sm font-bold font-mono" style={{ color }}>{typeof value === 'number' && value >= 1000 ? value.toLocaleString() : value}{unit}</span>
      </div>
      <input type="range" min={min} max={max} step={step} value={value}
        onChange={e => onChange(Number(e.target.value))}
        className="w-full h-1.5 rounded-full appearance-none cursor-pointer"
        style={{ accentColor: color }} />
    </div>
  );

  return (
    <div className="min-h-screen bg-[var(--color-edu-navy)] text-[var(--color-edu-text)] font-sans">
      <div className="max-w-4xl mx-auto px-6 pt-16 pb-20">
        <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} className="pt-10 mb-10">
          <div className="flex items-center gap-2 text-[11px] font-mono tracking-widest text-[#38bdf8] uppercase mb-4">
            <Link to="/lab" className="hover:underline flex items-center gap-1"><ArrowLeft size={12} /> Labs</Link>
            <span className="opacity-40">/</span><span>Fuselage Pressurization Lab</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-[#38bdf8]/12 border border-[#38bdf8]/25 flex items-center justify-center text-[#38bdf8]">
              <Box size={22} />
            </div>
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold text-white">Fuselage Pressurization Lab</h1>
              <p className="text-sm text-[var(--color-edu-text-muted)]">Explore cabin pressure and fuselage structural stress by altitude</p>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Controls */}
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}
            className="bg-[var(--color-edu-surface)] border border-white/5 rounded-2xl p-6">
            <div className="text-[10px] font-mono tracking-widest text-[#38bdf8] uppercase mb-5">Parameters</div>
            <Slider label="Cruise Altitude" value={altitude} min={5000} max={51000} step={500} unit=" ft" onChange={setAltitude} color="#38bdf8" />
            <Slider label="Fuselage Radius" value={radius} min={1} max={4} step={0.1} unit=" m" onChange={setRadius} color="#a78bfa" />
            <Slider label="Skin Thickness" value={thickness} min={1} max={8} step={0.5} unit=" mm" onChange={setThickness} color="#f59e0b" />

            {/* Cross-section visual */}
            <div className="mt-4 border-t border-white/5 pt-5">
              <div className="text-[10px] font-mono tracking-widest text-[var(--color-edu-text-muted)] uppercase mb-3">Cross-Section</div>
              <svg viewBox="0 0 200 200" className="w-40 h-40 mx-auto">
                <defs>
                  <radialGradient id="fuseStress" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor={stressColor} stopOpacity="0.04" />
                    <stop offset="100%" stopColor={stressColor} stopOpacity="0.15" />
                  </radialGradient>
                </defs>
                <circle cx="100" cy="100" r={Math.min(80, radius * 25)} fill="url(#fuseStress)"
                  stroke={stressColor} strokeWidth={Math.max(2, thickness * 1.2)} strokeOpacity="0.6"
                  style={{ transition: 'all 0.3s ease' }} />
                <circle cx="100" cy="100" r="3" fill={stressColor} fillOpacity="0.6" />
                {/* Tension arrows */}
                {[0, 90, 180, 270].map(angle => {
                  const rad = (angle * Math.PI) / 180;
                  const r = Math.min(80, radius * 25);
                  return (
                    <line key={angle}
                      x1={100 + Math.cos(rad) * (r + 4)}
                      y1={100 + Math.sin(rad) * (r + 4)}
                      x2={100 + Math.cos(rad) * (r + 12)}
                      y2={100 + Math.sin(rad) * (r + 12)}
                      stroke={stressColor} strokeWidth="1.5" strokeOpacity="0.5"
                    />
                  );
                })}
                <text x="100" y="104" textAnchor="middle" fill="white" fontSize="9" fontFamily="monospace" opacity="0.5">CABIN</text>
              </svg>
            </div>
          </motion.div>

          {/* Results */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.15 }}>
            <div className="text-[10px] font-mono tracking-widest text-[var(--color-edu-text-muted)] uppercase mb-4">Pressurization Results</div>

            {/* Stress status */}
            <div className="p-5 rounded-2xl border mb-4 text-center" style={{ background: `${stressColor}08`, borderColor: `${stressColor}30` }}>
              <div className="text-[10px] font-mono uppercase tracking-widest mb-1" style={{ color: stressColor }}>Structural Status</div>
              <div className="text-3xl font-black mb-1" style={{ color: stressColor }}>{stressLabel}</div>
              <div className="text-xs text-[var(--color-edu-text-muted)]">Safety Factor: <span className="font-bold text-white">{safetyFactor.toFixed(2)}×</span></div>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-3">
              <div className="p-4 rounded-xl border border-white/5 bg-[var(--color-edu-navy)]/60">
                <div className="text-[10px] font-mono text-[var(--color-edu-text-muted)] uppercase mb-1">Ambient Pressure</div>
                <div className="text-xl font-bold text-[#38bdf8]">{ambientPsi.toFixed(2)}<span className="text-sm ml-1 text-[var(--color-edu-text-muted)]">psi</span></div>
              </div>
              <div className="p-4 rounded-xl border border-white/5 bg-[var(--color-edu-navy)]/60">
                <div className="text-[10px] font-mono text-[var(--color-edu-text-muted)] uppercase mb-1">Cabin Pressure</div>
                <div className="text-xl font-bold text-[#38bdf8]">{cabinPsi.toFixed(2)}<span className="text-sm ml-1 text-[var(--color-edu-text-muted)]">psi</span></div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 mb-3">
              <div className="p-4 rounded-xl border border-white/5 bg-[var(--color-edu-navy)]/60">
                <div className="text-[10px] font-mono text-[var(--color-edu-text-muted)] uppercase mb-1">ΔP (differential)</div>
                <div className="text-xl font-bold text-[#a78bfa]">{deltaP.toFixed(2)}<span className="text-sm ml-1 text-[var(--color-edu-text-muted)]">psi</span></div>
              </div>
              <div className="p-4 rounded-xl border border-white/5 bg-[var(--color-edu-navy)]/60">
                <div className="text-[10px] font-mono text-[var(--color-edu-text-muted)] uppercase mb-1">Hoop Stress</div>
                <div className="text-xl font-bold" style={{ color: stressColor }}>{hoopStressMPa.toFixed(1)}<span className="text-sm ml-1 text-[var(--color-edu-text-muted)]">MPa</span></div>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-[#38bdf8]/6 border border-[#38bdf8]/15">
              <div className="text-[10px] font-mono text-[#38bdf8] uppercase tracking-widest mb-2">Formula Used</div>
              <p className="text-xs text-[var(--color-edu-text-muted)] font-mono">σ = ΔP × r / t</p>
              <p className="text-xs text-[var(--color-edu-text-muted)] mt-1 leading-relaxed">
                Al 2024-T3 yield: 345 MPa. Safety factor = 345 / {hoopStressMPa.toFixed(1)} = {safetyFactor.toFixed(2)}×
                {safetyFactor < 1.5 ? ' — increase skin thickness!' : safetyFactor > 4 ? ' — skin may be over-designed (heavy).' : ' — within acceptable range.'}
              </p>
            </div>

            <div className="mt-5">
              <Link to="/explore/fuselage" className="text-sm text-[#38bdf8] hover:text-white transition-colors flex items-center gap-2">
                📖 Learn about the Fuselage →
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default FuselageLab;
