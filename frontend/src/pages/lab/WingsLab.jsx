import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Plane, ArrowLeft, FlaskConical } from 'lucide-react';

const clamp = (v, min, max) => Math.min(max, Math.max(min, v));

const WingsLab = () => {
  const [span, setSpan] = useState(30);       // meters
  const [sweep, setSweep] = useState(25);     // degrees
  const [chord, setChord] = useState(4);      // root chord meters
  const [cl, setCl] = useState(0.5);         // design CL

  const S = span * chord * 0.6; // approx area (tapered)
  const AR = (span * span) / S;
  const e = 0.85;
  const cdi = (cl * cl) / (Math.PI * e * AR);
  const liftDragRatio = cl / (0.02 + cdi);
  const mNormal = Math.cos((sweep * Math.PI) / 180);

  const Slider = ({ label, value, min, max, step = 1, unit, onChange, color = '#a78bfa' }) => (
    <div className="mb-5">
      <div className="flex justify-between items-center mb-2">
        <span className="text-xs font-semibold text-[var(--color-edu-text-muted)] uppercase tracking-wider">{label}</span>
        <span className="text-sm font-bold font-mono" style={{ color }}>{value}{unit}</span>
      </div>
      <input type="range" min={min} max={max} step={step} value={value}
        onChange={e => onChange(Number(e.target.value))}
        className="w-full h-1.5 rounded-full appearance-none cursor-pointer"
        style={{ accentColor: color }} />
    </div>
  );

  const Stat = ({ label, value, unit, color = '#a78bfa', highlight = false }) => (
    <div className={`p-4 rounded-xl border ${highlight ? 'border-opacity-40' : 'border-white/5'} bg-[var(--color-edu-navy)]/60`}
      style={{ borderColor: highlight ? color : undefined }}>
      <div className="text-[10px] font-mono tracking-widest text-[var(--color-edu-text-muted)] uppercase mb-1">{label}</div>
      <div className="text-2xl font-bold" style={{ color }}>{value}<span className="text-sm font-normal text-[var(--color-edu-text-muted)] ml-1">{unit}</span></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[var(--color-edu-navy)] text-[var(--color-edu-text)] font-sans">
      <div className="max-w-4xl mx-auto px-6 pt-16 pb-20">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} className="pt-10 mb-10">
          <div className="flex items-center gap-2 text-[11px] font-mono tracking-widest text-[#a78bfa] uppercase mb-4">
            <Link to="/lab" className="hover:underline flex items-center gap-1"><ArrowLeft size={12} /> Labs</Link>
            <span className="opacity-40">/</span><span>Wings Configurator</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-[#a78bfa]/12 border border-[#a78bfa]/25 flex items-center justify-center text-[#a78bfa]">
              <Plane size={22} />
            </div>
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold text-white">Wing Configurator</h1>
              <p className="text-sm text-[var(--color-edu-text-muted)]">Adjust geometry and see lift/drag effects in real-time</p>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Controls */}
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}
            className="bg-[var(--color-edu-surface)] border border-white/5 rounded-2xl p-6">
            <div className="text-[10px] font-mono tracking-widest text-[#a78bfa] uppercase mb-5">Wing Parameters</div>
            <Slider label="Wing Span" value={span} min={10} max={80} unit=" m" onChange={setSpan} color="#a78bfa" />
            <Slider label="Root Chord" value={chord} min={1} max={12} step={0.5} unit=" m" onChange={setChord} color="#a78bfa" />
            <Slider label="Sweep Angle" value={sweep} min={0} max={55} unit="°" onChange={setSweep} color="#38bdf8" />
            <Slider label="Design CL" value={cl} min={0.1} max={1.5} step={0.05} unit="" onChange={setCl} color="#f59e0b" />

            {/* Wing silhouette preview */}
            <div className="mt-6 border-t border-white/5 pt-5">
              <div className="text-[10px] font-mono tracking-widest text-[var(--color-edu-text-muted)] uppercase mb-3">Wing Planform Preview</div>
              <svg viewBox="0 0 300 120" className="w-full h-auto">
                {/* Right half-wing, swept */}
                <path
                  d={`M150,60 L${150 + span * 1.4},${60 + sweep * 0.4} L${150 + span * 1.4},${60 + sweep * 0.4 + chord * 4} L150,${60 + chord * 9} Z`}
                  fill="#a78bfa" fillOpacity="0.08" stroke="#a78bfa" strokeWidth="1.5" strokeOpacity="0.5"
                  style={{ transition: 'all 0.3s ease' }}
                />
                {/* Left half */}
                <path
                  d={`M150,60 L${150 - span * 1.4},${60 + sweep * 0.4} L${150 - span * 1.4},${60 + sweep * 0.4 + chord * 4} L150,${60 + chord * 9} Z`}
                  fill="#a78bfa" fillOpacity="0.08" stroke="#a78bfa" strokeWidth="1.5" strokeOpacity="0.5"
                  style={{ transition: 'all 0.3s ease' }}
                />
                <line x1="150" y1="50" x2="150" y2="110" stroke="white" strokeWidth="0.5" strokeOpacity="0.1" strokeDasharray="4 4" />
              </svg>
            </div>
          </motion.div>

          {/* Results */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.15 }}>
            <div className="text-[10px] font-mono tracking-widest text-[var(--color-edu-text-muted)] uppercase mb-4">Calculated Performance</div>
            <div className="grid grid-cols-2 gap-3 mb-3">
              <Stat label="Wing Area" value={S.toFixed(1)} unit="m²" color="#a78bfa" />
              <Stat label="Aspect Ratio" value={AR.toFixed(2)} unit="" color="#a78bfa" highlight />
            </div>
            <div className="grid grid-cols-2 gap-3 mb-3">
              <Stat label="Induced Drag (Cdi)" value={cdi.toFixed(4)} unit="" color="#fb7185" />
              <Stat label="L/D Ratio" value={liftDragRatio.toFixed(1)} unit="" color="#22c55e" highlight />
            </div>
            <div className="grid grid-cols-1 gap-3">
              <Stat label="Effective Mach Normal (cos Λ)" value={mNormal.toFixed(3)} unit="" color="#38bdf8" />
            </div>

            {/* Insight card */}
            <div className="mt-5 p-4 rounded-xl bg-[#a78bfa]/6 border border-[#a78bfa]/15">
              <div className="text-[10px] font-mono text-[#a78bfa] uppercase tracking-widest mb-2">Design Insight</div>
              <p className="text-xs text-[var(--color-edu-text-muted)] leading-relaxed">
                {AR > 10 ? '✓ High aspect ratio — excellent for long-range cruise efficiency (like an airliner).' :
                 AR > 6  ? '✓ Moderate aspect ratio — balanced for speed and efficiency.' :
                           '△ Low aspect ratio — optimized for maneuverability or speed (like a fighter jet).'}
                {sweep > 35 ? ' Heavy sweep delays transonic drag significantly.' : sweep > 20 ? ' Moderate sweep gives good transonic performance.' : ' Low sweep is optimal for subsonic cruise.'}
              </p>
            </div>

            <div className="mt-5">
              <Link to="/explore/wings" className="text-sm text-[#a78bfa] hover:text-white transition-colors flex items-center gap-2">
                📖 Learn about Wings →
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default WingsLab;
