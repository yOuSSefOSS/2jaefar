import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Navigation, ArrowLeft } from 'lucide-react';

const TailLab = () => {
  const [cgPos, setCgPos] = useState(28);   // % MAC — neutral around 25-35%
  const [speed, setSpeed] = useState(250);  // knots
  const [tailVol, setTailVol] = useState(0.85); // tail volume coeff

  // Static margin: positive = stable
  const neutralPoint = 38; // % MAC (fixed for this model)
  const staticMargin = (neutralPoint - cgPos) / 100; // as fraction of MAC
  const smPercent = (staticMargin * 100).toFixed(1);

  const isStable = staticMargin > 0.02;
  const isMarginal = staticMargin > 0 && staticMargin <= 0.02;
  const isUnstable = staticMargin <= 0;

  const stabilityColor = isStable ? '#22c55e' : isMarginal ? '#f59e0b' : '#fb7185';
  const stabilityLabel = isStable ? 'Stable' : isMarginal ? 'Marginal' : 'Unstable';

  // Elevator effectiveness rough estimate
  const elevAuth = (tailVol * speed * 0.01 * staticMargin * 100).toFixed(1);

  const Slider = ({ label, value, min, max, step = 1, unit, onChange, color }) => (
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

  return (
    <div className="min-h-screen bg-[var(--color-edu-navy)] text-[var(--color-edu-text)] font-sans">
      <div className="max-w-4xl mx-auto px-6 pt-16 pb-20">
        <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} className="pt-10 mb-10">
          <div className="flex items-center gap-2 text-[11px] font-mono tracking-widest text-[#22c55e] uppercase mb-4">
            <Link to="/lab" className="hover:underline flex items-center gap-1"><ArrowLeft size={12} /> Labs</Link>
            <span className="opacity-40">/</span><span>Tail Stability Lab</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-[#22c55e]/12 border border-[#22c55e]/25 flex items-center justify-center text-[#22c55e]">
              <Navigation size={22} />
            </div>
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold text-white">Tail Stability Lab</h1>
              <p className="text-sm text-[var(--color-edu-text-muted)]">Adjust CG and see longitudinal stability change in real-time</p>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Controls */}
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}
            className="bg-[var(--color-edu-surface)] border border-white/5 rounded-2xl p-6">
            <div className="text-[10px] font-mono tracking-widest text-[#22c55e] uppercase mb-5">Flight Parameters</div>
            <Slider label="CG Position (% MAC)" value={cgPos} min={10} max={45} unit="%" onChange={setCgPos} color="#22c55e" />
            <Slider label="Airspeed" value={speed} min={120} max={400} step={5} unit=" kts" onChange={setSpeed} color="#38bdf8" />
            <Slider label="Tail Volume Coefficient" value={tailVol} min={0.3} max={1.5} step={0.05} unit="" onChange={setTailVol} color="#a78bfa" />

            {/* CG diagram */}
            <div className="mt-4 border-t border-white/5 pt-5">
              <div className="text-[10px] font-mono tracking-widest text-[var(--color-edu-text-muted)] uppercase mb-3">CG vs Neutral Point</div>
              <div className="relative h-10 bg-[var(--color-edu-navy)]/80 rounded-xl border border-white/5 overflow-hidden">
                {/* Neutral point marker */}
                <div className="absolute top-0 bottom-0 w-0.5 bg-white/20" style={{ left: `${neutralPoint}%` }}>
                  <span className="absolute -top-5 left-1 text-[8px] font-mono text-white/40">NP</span>
                </div>
                {/* CG marker */}
                <motion.div
                  className="absolute top-2 bottom-2 w-4 rounded-lg flex items-center justify-center"
                  style={{ left: `calc(${cgPos}% - 8px)`, background: stabilityColor, transition: 'left 0.2s ease' }}
                  animate={{ left: `calc(${cgPos}% - 8px)` }}
                >
                  <span className="text-[7px] font-black text-black">CG</span>
                </motion.div>
                {/* Stable zone */}
                <div className="absolute inset-y-0 left-0 bg-[#22c55e]/6"
                  style={{ width: `${neutralPoint}%` }} />
              </div>
              <div className="flex justify-between text-[8px] font-mono text-[var(--color-edu-text-muted)]/50 mt-1">
                <span>Fwd (10%)</span><span>Aft (45%)</span>
              </div>
            </div>
          </motion.div>

          {/* Results */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.15 }}>
            <div className="text-[10px] font-mono tracking-widest text-[var(--color-edu-text-muted)] uppercase mb-4">Stability Analysis</div>

            {/* Main stability card */}
            <div className="p-5 rounded-2xl border mb-4 text-center" style={{ background: `${stabilityColor}08`, borderColor: `${stabilityColor}30` }}>
              <div className="text-[10px] font-mono uppercase tracking-widest mb-2" style={{ color: stabilityColor }}>Longitudinal Stability</div>
              <div className="text-4xl font-black mb-1" style={{ color: stabilityColor }}>{stabilityLabel}</div>
              <div className="text-sm text-[var(--color-edu-text-muted)]">Static Margin: <span className="font-bold text-white">{smPercent}% MAC</span></div>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="p-4 rounded-xl border border-white/5 bg-[var(--color-edu-navy)]/60">
                <div className="text-[10px] font-mono text-[var(--color-edu-text-muted)] uppercase mb-1">Static Margin</div>
                <div className="text-xl font-bold" style={{ color: stabilityColor }}>{smPercent}<span className="text-sm ml-1 text-[var(--color-edu-text-muted)]">% MAC</span></div>
              </div>
              <div className="p-4 rounded-xl border border-white/5 bg-[var(--color-edu-navy)]/60">
                <div className="text-[10px] font-mono text-[var(--color-edu-text-muted)] uppercase mb-1">Elev. Authority</div>
                <div className="text-xl font-bold text-[#a78bfa]">{elevAuth}<span className="text-sm ml-1 text-[var(--color-edu-text-muted)]">units</span></div>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-[#22c55e]/6 border border-[#22c55e]/15">
              <div className="text-[10px] font-mono text-[#22c55e] uppercase tracking-widest mb-2">Insight</div>
              <p className="text-xs text-[var(--color-edu-text-muted)] leading-relaxed">
                {isUnstable
                  ? '⚠ CG is aft of the neutral point. The aircraft is aerodynamically unstable — it will diverge from disturbances without active fly-by-wire control (like the F-16 or Airbus).'
                  : isMarginal
                  ? '△ CG is very close to the neutral point. Marginal stability means very light stick forces but poor gust damping.'
                  : `✓ CG is forward of NP by ${smPercent}% MAC. Positive static margin — the aircraft will naturally return to trimmed flight after a disturbance.`}
              </p>
            </div>

            <div className="mt-5">
              <Link to="/explore/tail" className="text-sm text-[#22c55e] hover:text-white transition-colors flex items-center gap-2">
                📖 Learn about Tail Section →
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default TailLab;
