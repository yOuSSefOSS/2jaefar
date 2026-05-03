import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Navigation, ArrowLeft } from 'lucide-react';

const clamp = (v, mn, mx) => Math.min(mx, Math.max(mn, v));

const TailLab = () => {
  const [cgPct, setCgPct] = useState(28);
  const [speed, setSpeed] = useState(250);
  const [tailArea, setTailArea] = useState(18);
  const [tailArm, setTailArm] = useState(14);

  const NP_PCT = 38;
  const staticMargin = (NP_PCT - cgPct) / 100;
  const smPct = (staticMargin * 100).toFixed(1);

  const isStable   = staticMargin > 0.03;
  const isMarginal = staticMargin > 0 && staticMargin <= 0.03;
  const isUnstable = staticMargin <= 0;

  const sColor = isStable ? '#22c55e' : isMarginal ? '#f59e0b' : '#fb7185';
  const sLabel = isStable ? 'STABLE' : isMarginal ? 'MARGINAL' : 'UNSTABLE';

  const qDyn = (0.5 * 1.225 * speed * speed * 0.514 * 0.514).toFixed(0);
  const tailMoment = (tailArea * tailArm * staticMargin * 0.1).toFixed(2);

  // ── Aircraft SVG layout ──────────────────────────────────────────────
  const W = 500, H = 200;
  // Fuselage
  const fuseX1 = 60, fuseX2 = 420;
  const fuseY  = H / 2;
  // CG dot position — maps cgPct (10-45%) to fuselage X range
  const cgX = clamp(fuseX1 + ((cgPct - 10) / 35) * (fuseX2 - fuseX1 - 60), fuseX1 + 20, fuseX2 - 80);
  const npX  = clamp(fuseX1 + ((NP_PCT - 10) / 35) * (fuseX2 - fuseX1 - 60), fuseX1 + 20, fuseX2 - 80);
  // Restoring moment arrow length
  const arrowLen = clamp(Math.abs(staticMargin) * 260, 0, 80);

  const Slider = ({ label, value, min, max, step = 1, unit, onChange, color }) => (
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
    <div style={{ minHeight: '100vh', background: 'linear-gradient(160deg,#04100a 0%,#05091a 100%)', color: '#e2e8f0', fontFamily: "'Inter','Segoe UI',sans-serif" }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '0 1.5rem 3rem' }}>

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} style={{ paddingTop: '5rem', marginBottom: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.7rem', fontFamily: 'monospace', letterSpacing: '0.1em', color: '#22c55e', textTransform: 'uppercase', marginBottom: '1rem' }}>
            <Link to="/lab" style={{ color: 'inherit', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.3rem' }}><ArrowLeft size={12} /> Labs</Link>
            <span style={{ opacity: 0.4 }}>/</span><span>Tail Stability Lab</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: 'rgba(34,197,94,0.12)', border: '1px solid rgba(34,197,94,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#22c55e' }}>
              <Navigation size={22} />
            </div>
            <div>
              <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#fff', margin: 0 }}>Tail Stability Lab</h1>
              <p style={{ fontSize: '0.85rem', color: '#64748b', margin: 0 }}>Shift the CG and watch the aircraft's stability respond in real-time</p>
            </div>
          </div>
        </motion.div>

        {/* Main Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: '1.25rem' }}>

          {/* Controls */}
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}
            style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '18px', padding: '1.5rem' }}>
            <div style={{ fontSize: '0.65rem', fontFamily: 'monospace', letterSpacing: '0.12em', color: '#22c55e', textTransform: 'uppercase', marginBottom: '1.25rem' }}>Flight Parameters</div>
            <Slider label="CG Position (% MAC)" value={cgPct} min={10} max={45} unit="%" onChange={setCgPct} color={sColor} />
            <Slider label="Airspeed" value={speed} min={80} max={400} step={5} unit=" kts" onChange={setSpeed} color="#38bdf8" />
            <Slider label="Tail Area" value={tailArea} min={5} max={40} unit=" m²" onChange={setTailArea} color="#a78bfa" />
            <Slider label="Tail Arm" value={tailArm} min={5} max={30} unit=" m" onChange={setTailArm} color="#f59e0b" />

            {/* Status badge */}
            <div style={{ padding: '1rem', borderRadius: '12px', background: `${sColor}0d`, border: `1px solid ${sColor}30`, textAlign: 'center', marginBottom: '1rem' }}>
              <div style={{ fontSize: '0.6rem', fontFamily: 'monospace', color: sColor, textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '0.3rem' }}>Longitudinal Stability</div>
              <div style={{ fontSize: '1.6rem', fontWeight: 900, color: sColor }}>{sLabel}</div>
              <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.25rem' }}>Static Margin: <strong style={{ color: '#e2e8f0' }}>{smPct}% MAC</strong></div>
            </div>

            {/* Insight */}
            <div style={{ padding: '0.9rem', borderRadius: '10px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', fontSize: '0.76rem', color: '#64748b', lineHeight: 1.6 }}>
              {isUnstable
                ? '⚠ CG aft of NP — aerodynamically unstable. Fly-by-wire required (F-16, Airbus).'
                : isMarginal
                ? '△ CG near NP — marginal stability, very light stick forces, poor gust damping.'
                : `✓ SM = ${smPct}% MAC — aircraft naturally returns to trimmed flight after disturbance.`}
            </div>
            <div style={{ marginTop: '1rem' }}>
              <Link to="/explore/tail" style={{ fontSize: '0.78rem', color: '#22c55e', textDecoration: 'none' }}>📖 Learn about Tail Section →</Link>
            </div>
          </motion.div>

          {/* Right: Visualization */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.15 }}
            style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

            {/* Aircraft diagram */}
            <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '18px', padding: '1.5rem' }}>
              <div style={{ fontSize: '0.65rem', fontFamily: 'monospace', letterSpacing: '0.12em', color: '#64748b', textTransform: 'uppercase', marginBottom: '1rem' }}>
                Aircraft Side View — CG/NP Position
              </div>

              <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: 'auto', overflow: 'visible' }}>
                <defs>
                  <filter id="glowGreen"><feGaussianBlur stdDeviation="3"/></filter>
                  <marker id="arrowHead" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
                    <path d="M0,0 L6,3 L0,6 Z" fill={sColor} />
                  </marker>
                </defs>

                {/* ── Fuselage ── */}
                <ellipse cx={(fuseX1+fuseX2)/2} cy={fuseY} rx={(fuseX2-fuseX1)/2} ry={18}
                  fill="rgba(255,255,255,0.04)" stroke="rgba(255,255,255,0.15)" strokeWidth="1.5" />

                {/* ── Cockpit bubble ── */}
                <ellipse cx={fuseX1 + 70} cy={fuseY - 12} rx={32} ry={16}
                  fill="rgba(56,189,248,0.06)" stroke="rgba(56,189,248,0.25)" strokeWidth="1" />

                {/* ── Main wing ── */}
                <path d={`M${fuseX1+130},${fuseY-4} L${fuseX1+70},${fuseY-55} L${fuseX1+60},${fuseY+14} L${fuseX1+145},${fuseY+14} Z`}
                  fill="rgba(255,255,255,0.07)" stroke="rgba(255,255,255,0.2)" strokeWidth="1.5" />
                <path d={`M${fuseX1+130},${fuseY-4} L${fuseX1+190},${fuseY-55} L${fuseX1+200},${fuseY+14} L${fuseX1+145},${fuseY+14} Z`}
                  fill="rgba(255,255,255,0.07)" stroke="rgba(255,255,255,0.2)" strokeWidth="1.5" />

                {/* ── Horizontal stabilizer ── */}
                <path d={`M${fuseX2-60},${fuseY-2} L${fuseX2-95},${fuseY-28} L${fuseX2-90},${fuseY+12} L${fuseX2-55},${fuseY+12} Z`}
                  fill={`${sColor}18`} stroke={sColor} strokeWidth="1.2" strokeOpacity="0.6" style={{ transition: 'stroke 0.4s ease' }} />
                <path d={`M${fuseX2-60},${fuseY-2} L${fuseX2-25},${fuseY-28} L${fuseX2-20},${fuseY+12} L${fuseX2-55},${fuseY+12} Z`}
                  fill={`${sColor}18`} stroke={sColor} strokeWidth="1.2" strokeOpacity="0.6" style={{ transition: 'stroke 0.4s ease' }} />

                {/* ── Vertical stabilizer ── */}
                <path d={`M${fuseX2-60},${fuseY} L${fuseX2-40},${fuseY-50} L${fuseX2-18},${fuseY-18} L${fuseX2-18},${fuseY} Z`}
                  fill={`${sColor}10`} stroke={sColor} strokeWidth="1" strokeOpacity="0.5" />

                {/* ── NP marker (fixed) ── */}
                <g style={{ transition: 'all 0.01s' }}>
                  <line x1={npX} y1={fuseY - 30} x2={npX} y2={fuseY + 30} stroke="rgba(56,189,248,0.5)" strokeWidth="1" strokeDasharray="4 3" />
                  <circle cx={npX} cy={fuseY} r={7} fill="rgba(56,189,248,0.15)" stroke="#38bdf8" strokeWidth="1.5" />
                  <text x={npX} y={fuseY + 3} textAnchor="middle" fill="#38bdf8" fontSize="7" fontWeight="bold" fontFamily="monospace">NP</text>
                  <text x={npX} y={fuseY - 34} textAnchor="middle" fill="rgba(56,189,248,0.6)" fontSize="8" fontFamily="monospace">NP {NP_PCT}%</text>
                </g>

                {/* ── CG marker (animated) ── */}
                <g style={{ transition: 'transform 0.35s cubic-bezier(0.4,0,0.2,1)' }}>
                  <line x1={cgX} y1={fuseY - 30} x2={cgX} y2={fuseY + 30} stroke={`${sColor}70`} strokeWidth="1.5" />
                  <circle cx={cgX} cy={fuseY} r={9} fill={`${sColor}25`} stroke={sColor} strokeWidth="2"
                    style={{ filter: `drop-shadow(0 0 6px ${sColor}80)`, transition: 'cx 0.35s cubic-bezier(0.4,0,0.2,1), fill 0.4s, stroke 0.4s' }} />
                  <text x={cgX} y={fuseY + 3} textAnchor="middle" fill={sColor} fontSize="7" fontWeight="bold" fontFamily="monospace">CG</text>
                  <text x={cgX} y={fuseY + 44} textAnchor="middle" fill={sColor} fontSize="8" fontFamily="monospace"
                    style={{ transition: 'x 0.35s cubic-bezier(0.4,0,0.2,1), fill 0.4s' }}>CG {cgPct}%</text>
                </g>

                {/* ── Restoring/diverging moment arrow ── */}
                {!isUnstable && arrowLen > 4 && (
                  <line
                    x1={cgX} y1={fuseY - 38}
                    x2={cgX + (npX > cgX ? arrowLen : -arrowLen)} y2={fuseY - 38}
                    stroke={sColor} strokeWidth="2" markerEnd="url(#arrowHead)"
                    style={{ transition: 'all 0.35s ease' }}
                  />
                )}
                {isUnstable && (
                  <line
                    x1={cgX} y1={fuseY - 38}
                    x2={cgX + (cgX > npX ? 60 : -60)} y2={fuseY - 38}
                    stroke="#fb7185" strokeWidth="2" markerEnd="url(#arrowHead)"
                    style={{ transition: 'all 0.35s ease', strokeDasharray: '6 3' }}
                  />
                )}

                {/* ── Static margin gap zone ── */}
                {cgX < npX && (
                  <rect x={cgX} y={fuseY - 22} width={npX - cgX} height={4}
                    fill={`${sColor}40`} rx="2" style={{ transition: 'all 0.35s ease' }} />
                )}

                {/* Labels */}
                <text x={10} y={H - 10} fill="rgba(255,255,255,0.15)" fontSize="9" fontFamily="monospace">v = {speed} kts</text>
                <text x={W - 10} y={H - 10} textAnchor="end" fill={`${sColor}80`} fontSize="9" fontFamily="monospace">SM = {smPct}%</text>
              </svg>

              {/* Legend */}
              <div style={{ display: 'flex', gap: '1.5rem', marginTop: '0.75rem', justifyContent: 'center' }}>
                {[['#38bdf8','NP — Neutral Point (fixed)'],[ sColor, 'CG — Center of Gravity']].map(([c,l]) => (
                  <div key={l} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.72rem', color: '#64748b' }}>
                    <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: c }} />{l}
                  </div>
                ))}
              </div>
            </div>

            {/* Static margin gauge */}
            <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '18px', padding: '1.25rem' }}>
              <div style={{ fontSize: '0.65rem', fontFamily: 'monospace', letterSpacing: '0.12em', color: '#64748b', textTransform: 'uppercase', marginBottom: '0.85rem' }}>Static Margin Gauge</div>
              {/* Track */}
              <div style={{ position: 'relative', height: '24px', borderRadius: '12px', background: 'linear-gradient(90deg, #fb7185 0%, #f59e0b 35%, #22c55e 55%, #f59e0b 80%, #fb7185 100%)', overflow: 'hidden' }}>
                {/* Needle */}
                <div style={{
                  position: 'absolute', top: '2px', bottom: '2px', width: '3px',
                  background: '#fff',
                  borderRadius: '2px',
                  left: `${clamp(((cgPct - 10) / 35) * 100, 1, 97)}%`,
                  boxShadow: '0 0 8px rgba(255,255,255,0.8)',
                  transition: 'left 0.35s cubic-bezier(0.4,0,0.2,1)'
                }} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.35rem', fontSize: '0.6rem', fontFamily: 'monospace', color: '#334155' }}>
                <span>Fwd CG (10%)</span><span>NP ({NP_PCT}%)</span><span>Aft (45%)</span>
              </div>
            </div>

            {/* Metrics */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem' }}>
              {[
                { label: 'Static Margin', value: smPct, unit: '% MAC', color: sColor },
                { label: 'Dynamic Pressure', value: (parseInt(qDyn)/1000).toFixed(2), unit: 'kPa', color: '#38bdf8' },
                { label: 'Tail Moment', value: tailMoment, unit: 'kN·m', color: '#a78bfa' },
              ].map(m => (
                <div key={m.label} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', padding: '0.9rem 0.75rem', textAlign: 'center' }}>
                  <div style={{ fontSize: '0.58rem', fontFamily: 'monospace', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.35rem' }}>{m.label}</div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 800, fontFamily: 'monospace', color: m.color }}>{m.value}<span style={{ fontSize: '0.65rem', marginLeft: '0.2rem', color: '#475569' }}>{m.unit}</span></div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default TailLab;
