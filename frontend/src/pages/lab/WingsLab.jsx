import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Plane, ArrowLeft } from 'lucide-react';

const clamp = (v, min, max) => Math.min(max, Math.max(min, v));

const WingsLab = () => {
  const [span, setSpan] = useState(30);
  const [sweep, setSweep] = useState(25);
  const [chord, setChord] = useState(4);
  const [cl, setCl] = useState(0.5);

  const S = useMemo(() => span * chord * 0.6, [span, chord]);
  const AR = useMemo(() => (span * span) / S, [span, S]);
  const e = 0.85;
  const cdi = useMemo(() => (cl * cl) / (Math.PI * e * AR), [cl, AR]);
  const ld = useMemo(() => cl / (0.02 + cdi), [cl, cdi]);
  const sweepRad = (sweep * Math.PI) / 180;

  // SVG planform dims — fills the box
  const W = 420, H = 220;
  const cx = W / 2, cy = H * 0.35;
  const halfSpan = clamp((span / 80) * (W * 0.46), 20, W * 0.46);
  const tipOffset = Math.tan(sweepRad) * halfSpan;
  const rootChordPx = clamp((chord / 12) * (H * 0.72), 14, H * 0.8);
  const taper = 0.42;
  const tipChordPx = rootChordPx * taper;
  const tipY = cy + tipOffset;

  // Wing paths (top-view planform)
  const leftWingPath = `M${cx},${cy} L${cx - halfSpan},${tipY} L${cx - halfSpan},${tipY + tipChordPx} L${cx},${cy + rootChordPx} Z`;
  const rightWingPath = `M${cx},${cy} L${cx + halfSpan},${tipY} L${cx + halfSpan},${tipY + tipChordPx} L${cx},${cy + rootChordPx} Z`;

  // Color based on L/D efficiency
  const wingColor = ld > 20 ? '#22c55e' : ld > 12 ? '#a78bfa' : ld > 7 ? '#f59e0b' : '#fb7185';
  const efficiencyPct = clamp(((ld - 3) / 27) * 100, 0, 100);

  // Bar chart data for induced drag vs span
  const bars = [10, 20, 30, 40, 50, 60, 70, 80].map(s => {
    const sArea = s * chord * 0.6;
    const sAR = (s * s) / sArea;
    const sCdi = (cl * cl) / (Math.PI * e * sAR);
    return { s, cdi: sCdi };
  });
  const maxCdi = Math.max(...bars.map(b => b.cdi), 0.001);

  const Slider = ({ label, value, min, max, step = 1, unit, onChange, color = '#a78bfa' }) => (
    <div style={{ marginBottom: '1.1rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
        <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{label}</span>
        <span style={{ fontSize: '0.85rem', fontWeight: 800, fontFamily: 'monospace', color }}>{value}{unit}</span>
      </div>
      <input type="range" min={min} max={max} step={step} value={value}
        onChange={e => onChange(Number(e.target.value))}
        style={{ width: '100%', accentColor: color, height: '4px', cursor: 'pointer' }} />
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(160deg,#05091a 0%,#090d1f 100%)', color: '#e2e8f0', fontFamily: "'Inter','Segoe UI',sans-serif" }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '0 1.5rem 3rem' }}>

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} style={{ paddingTop: '5rem', marginBottom: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.7rem', fontFamily: 'monospace', letterSpacing: '0.1em', color: '#a78bfa', textTransform: 'uppercase', marginBottom: '1rem' }}>
            <Link to="/lab" style={{ color: 'inherit', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.3rem' }}><ArrowLeft size={12} /> Labs</Link>
            <span style={{ opacity: 0.4 }}>/</span><span>Wing Configurator</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: 'rgba(167,139,250,0.12)', border: '1px solid rgba(167,139,250,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#a78bfa' }}>
              <Plane size={22} />
            </div>
            <div>
              <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#fff', margin: 0 }}>Wing Configurator</h1>
              <p style={{ fontSize: '0.85rem', color: '#64748b', margin: 0 }}>Adjust geometry and see lift/drag performance in real-time</p>
            </div>
          </div>
        </motion.div>

        {/* Main Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: '1.25rem', alignItems: 'start' }}>

          {/* Controls */}
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}
            style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '18px', padding: '1.5rem' }}>
            <div style={{ fontSize: '0.65rem', fontFamily: 'monospace', letterSpacing: '0.12em', color: '#a78bfa', textTransform: 'uppercase', marginBottom: '1.25rem' }}>Wing Parameters</div>
            <Slider label="Wing Span" value={span} min={10} max={80} unit=" m" onChange={setSpan} color="#a78bfa" />
            <Slider label="Root Chord" value={chord} min={1} max={12} step={0.5} unit=" m" onChange={setChord} color="#a78bfa" />
            <Slider label="Sweep Angle" value={sweep} min={0} max={55} unit="°" onChange={setSweep} color="#38bdf8" />
            <Slider label="Design CL" value={cl} min={0.1} max={1.5} step={0.05} unit="" onChange={setCl} color="#f59e0b" />

            {/* Insight */}
            <div style={{ marginTop: '1.25rem', padding: '1rem', borderRadius: '12px', background: `${wingColor}0d`, border: `1px solid ${wingColor}25` }}>
              <div style={{ fontSize: '0.62rem', fontFamily: 'monospace', color: wingColor, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.5rem' }}>Design Insight</div>
              <p style={{ fontSize: '0.76rem', color: '#94a3b8', lineHeight: 1.6, margin: 0 }}>
                {AR > 10 ? '✓ High AR — excellent long-range cruise efficiency (airliner).' :
                 AR > 6  ? '✓ Moderate AR — balanced speed and efficiency.' :
                           '△ Low AR — optimized for maneuverability or speed (fighter).'}
                {sweep > 35 ? ' High sweep delays transonic drag rise.' :
                 sweep > 20 ? ' Moderate sweep improves transonic performance.' :
                              ' Low sweep ideal for subsonic cruise.'}
              </p>
            </div>
            <div style={{ marginTop: '1rem' }}>
              <Link to="/explore/wings" style={{ fontSize: '0.78rem', color: '#a78bfa', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>📖 Learn about Wings →</Link>
            </div>
          </motion.div>

          {/* Visualization Panel */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.15 }}
            style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

            {/* Wing planform — LARGE */}
            <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '18px', padding: '1.5rem', overflow: 'hidden' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <div style={{ fontSize: '0.65rem', fontFamily: 'monospace', letterSpacing: '0.12em', color: '#64748b', textTransform: 'uppercase' }}>Wing Planform — Top View</div>
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  {[['AR', AR.toFixed(1),'#a78bfa'], ['L/D', ld.toFixed(1), wingColor]].map(([k,v,c]) => (
                    <div key={k} style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '0.6rem', fontFamily: 'monospace', color: '#475569', textTransform: 'uppercase' }}>{k}</div>
                      <div style={{ fontSize: '1rem', fontWeight: 800, fontFamily: 'monospace', color: c }}>{v}</div>
                    </div>
                  ))}
                </div>
              </div>

              <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: 'auto', display: 'block' }}>
                <defs>
                  <linearGradient id="wingGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor={wingColor} stopOpacity="0.18" />
                    <stop offset="100%" stopColor={wingColor} stopOpacity="0.06" />
                  </linearGradient>
                  <filter id="wingGlow">
                    <feGaussianBlur stdDeviation="3" result="blur"/>
                    <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
                  </filter>
                </defs>

                {/* Grid lines */}
                {[...Array(9)].map((_,i) => (
                  <line key={i} x1={i*W/8} y1={0} x2={i*W/8} y2={H} stroke="rgba(255,255,255,0.03)" strokeWidth="1"/>
                ))}
                {[...Array(5)].map((_,i) => (
                  <line key={i} x1={0} y1={i*H/4} x2={W} y2={i*H/4} stroke="rgba(255,255,255,0.03)" strokeWidth="1"/>
                ))}

                {/* Centerline */}
                <line x1={cx} y1={0} x2={cx} y2={H} stroke="rgba(255,255,255,0.08)" strokeWidth="1" strokeDasharray="6 4" />

                {/* Wings */}
                <path d={leftWingPath} fill="url(#wingGrad)" stroke={wingColor} strokeWidth="1.5" strokeOpacity="0.7"
                  style={{ transition: 'd 0.35s cubic-bezier(0.4,0,0.2,1), stroke 0.35s ease' }} filter="url(#wingGlow)" />
                <path d={rightWingPath} fill="url(#wingGrad)" stroke={wingColor} strokeWidth="1.5" strokeOpacity="0.7"
                  style={{ transition: 'd 0.35s cubic-bezier(0.4,0,0.2,1), stroke 0.35s ease' }} filter="url(#wingGlow)" />

                {/* Fuselage stub */}
                <rect x={cx - 7} y={cy - 4} width={14} height={rootChordPx + 8} rx="4"
                  fill="rgba(255,255,255,0.05)" stroke="rgba(255,255,255,0.15)" strokeWidth="1"
                  style={{ transition: 'all 0.35s ease' }} />

                {/* Span annotation */}
                <line x1={cx - halfSpan} y1={tipY - 10} x2={cx + halfSpan} y2={tipY - 10} stroke="rgba(255,255,255,0.2)" strokeWidth="0.8" markerEnd="url(#arr)" markerStart="url(#arr)" />
                <text x={cx} y={tipY - 14} textAnchor="middle" fill="rgba(255,255,255,0.45)" fontSize="9" fontFamily="monospace">{span}m span</text>

                {/* Sweep angle annotation */}
                <text x={cx + halfSpan * 0.55} y={tipY - 3} fill="rgba(56,189,248,0.7)" fontSize="8" fontFamily="monospace">{sweep}° sweep</text>

                {/* Efficiency overlay */}
                <text x={cx} y={cy + rootChordPx * 0.6} textAnchor="middle" fill={wingColor} fontSize="11" fontWeight="bold" fontFamily="monospace" opacity="0.5">
                  L/D {ld.toFixed(1)}
                </text>
              </svg>

              {/* Efficiency bar */}
              <div style={{ marginTop: '0.75rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem' }}>
                  <span style={{ fontSize: '0.62rem', fontFamily: 'monospace', color: '#475569', textTransform: 'uppercase' }}>Aerodynamic Efficiency</span>
                  <span style={{ fontSize: '0.62rem', fontFamily: 'monospace', color: wingColor }}>{efficiencyPct.toFixed(0)}%</span>
                </div>
                <div style={{ height: '5px', background: 'rgba(255,255,255,0.06)', borderRadius: '99px', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${efficiencyPct}%`, background: `linear-gradient(90deg, #6366f1, ${wingColor})`, borderRadius: '99px', transition: 'width 0.4s ease' }} />
                </div>
              </div>
            </div>

            {/* Metrics row */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.75rem' }}>
              {[
                { label: 'Wing Area', value: S.toFixed(1), unit: 'm²', color: '#a78bfa' },
                { label: 'Aspect Ratio', value: AR.toFixed(2), unit: '', color: '#a78bfa' },
                { label: 'Induced Drag', value: cdi.toFixed(4), unit: 'Cdi', color: '#fb7185' },
                { label: 'L/D Ratio', value: ld.toFixed(1), unit: '', color: wingColor },
              ].map(m => (
                <div key={m.label} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', padding: '0.9rem 0.75rem', textAlign: 'center' }}>
                  <div style={{ fontSize: '0.58rem', fontFamily: 'monospace', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.35rem' }}>{m.label}</div>
                  <div style={{ fontSize: '1.2rem', fontWeight: 800, fontFamily: 'monospace', color: m.color }}>{m.value}<span style={{ fontSize: '0.7rem', marginLeft: '0.2rem', color: '#475569' }}>{m.unit}</span></div>
                </div>
              ))}
            </div>

            {/* Induced drag vs span bar chart */}
            <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '18px', padding: '1.25rem' }}>
              <div style={{ fontSize: '0.65rem', fontFamily: 'monospace', letterSpacing: '0.12em', color: '#64748b', textTransform: 'uppercase', marginBottom: '1rem' }}>Induced Drag (Cdi) vs Wing Span</div>
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: '0.4rem', height: '64px' }}>
                {bars.map(b => {
                  const isActive = b.s === span;
                  const h = clamp((b.cdi / maxCdi) * 64, 4, 64);
                  return (
                    <div key={b.s} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.2rem' }}>
                      <div style={{ width: '100%', height: `${h}px`, background: isActive ? '#a78bfa' : 'rgba(167,139,250,0.2)', borderRadius: '4px 4px 0 0', transition: 'all 0.35s ease', boxShadow: isActive ? '0 0 10px rgba(167,139,250,0.4)' : 'none' }} />
                      <span style={{ fontSize: '0.55rem', fontFamily: 'monospace', color: isActive ? '#a78bfa' : '#334155' }}>{b.s}m</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default WingsLab;
