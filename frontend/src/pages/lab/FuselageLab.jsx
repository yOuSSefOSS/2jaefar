import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Box, ArrowLeft } from 'lucide-react';

const clamp = (v, mn, mx) => Math.min(mx, Math.max(mn, v));

const Slider = ({ label, value, min, max, step = 1, unit, onChange, color }) => (
  <div style={{ marginBottom: '1.1rem' }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
      <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{label}</span>
      <span style={{ fontSize: '0.85rem', fontWeight: 800, fontFamily: 'monospace', color }}>{typeof value === 'number' && value >= 1000 ? value.toLocaleString() : value}{unit}</span>
    </div>
    <input type="range" min={min} max={max} step={step} value={value}
      onChange={e => onChange(Number(e.target.value))}
      style={{ width: '100%', accentColor: color, height: '4px', cursor: 'pointer', touchAction: 'none' }} />
  </div>
);

const FuselageLab = () => {
  const [altitude, setAltitude] = useState(35000);
  const [radius, setRadius] = useState(2.0);
  const [thickness, setThickness] = useState(3);

  // ISA atmosphere
  const ambientPsi = altitude < 36089
    ? 14.696 * Math.pow(1 - altitude / 145442, 5.256)
    : 14.696 * 0.2234 * Math.exp(-(altitude - 36089) / 20806);
  const cabinPsi = 14.696 * Math.pow(1 - 8000 / 145442, 5.256);
  const deltaP = Math.max(0, cabinPsi - ambientPsi);
  const deltaPPa = deltaP * 6894.76;
  const hoopStressMPa = (deltaPPa * radius / (thickness / 1000)) / 1e6;
  const alYield = 345;
  const safetyFactor = alYield / Math.max(hoopStressMPa, 0.01);
  const sColor = safetyFactor > 2.5 ? '#22c55e' : safetyFactor > 1.5 ? '#f59e0b' : '#fb7185';
  const sLabel = safetyFactor > 2.5 ? 'SAFE' : safetyFactor > 1.5 ? 'CAUTION' : 'DANGER';

  // Atmosphere layers (ft boundaries)
  const atmoLayers = [
    { name: 'Troposphere', top: 0,     bot: 36089, color: 'rgba(56,189,248,0.15)' },
    { name: 'Tropopause',  top: 36089, bot: 56000, color: 'rgba(167,139,250,0.1)' },
    { name: 'Stratosphere',top: 56000, bot: 100000,color: 'rgba(99,102,241,0.07)' },
  ];
  const maxAlt = 51000;
  const altPct = clamp(altitude / maxAlt, 0, 1);

  // Cross-section SVG
  const CX = 120, CY = 120, RMAX = 90;
  const rPx = clamp((radius / 4) * RMAX, 24, RMAX);
  const skinPx = clamp(thickness * 2.5, 3, 22);

  // Tension arrows — 8 directions
  const arrows = Array.from({ length: 8 }, (_, i) => {
    const angle = (i * Math.PI * 2) / 8;
    const arrowLen = clamp(deltaP * 4.5, 4, 30);
    return {
      x1: CX + Math.cos(angle) * (rPx + skinPx * 0.5),
      y1: CY + Math.sin(angle) * (rPx + skinPx * 0.5),
      x2: CX + Math.cos(angle) * (rPx + skinPx * 0.5 + arrowLen),
      y2: CY + Math.sin(angle) * (rPx + skinPx * 0.5 + arrowLen),
    };
  });



  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(160deg,#030c14 0%,#05091a 100%)', color: '#e2e8f0', fontFamily: "'Inter','Segoe UI',sans-serif" }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '0 1.5rem 3rem' }}>

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} style={{ paddingTop: '5rem', marginBottom: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.7rem', fontFamily: 'monospace', letterSpacing: '0.1em', color: '#38bdf8', textTransform: 'uppercase', marginBottom: '1rem' }}>
            <Link to="/lab" style={{ color: 'inherit', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.3rem' }}><ArrowLeft size={12} /> Labs</Link>
            <span style={{ opacity: 0.4 }}>/</span><span>Fuselage Pressurization Lab</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: 'rgba(56,189,248,0.12)', border: '1px solid rgba(56,189,248,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#38bdf8' }}>
              <Box size={22} />
            </div>
            <div>
              <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#fff', margin: 0 }}>Fuselage Pressurization Lab</h1>
              <p style={{ fontSize: '0.85rem', color: '#64748b', margin: 0 }}>Explore cabin pressure and structural stress as altitude changes</p>
            </div>
          </div>
        </motion.div>

        {/* Main Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: '1.25rem' }}>

          {/* Controls + Atmosphere */}
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}
            style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

            {/* Controls panel */}
            <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '18px', padding: '1.5rem' }}>
              <div style={{ fontSize: '0.65rem', fontFamily: 'monospace', letterSpacing: '0.12em', color: '#38bdf8', textTransform: 'uppercase', marginBottom: '1.25rem' }}>Parameters</div>
              <Slider label="Cruise Altitude" value={altitude} min={5000} max={51000} step={500} unit=" ft" onChange={setAltitude} color="#38bdf8" />
              <Slider label="Fuselage Radius" value={radius} min={1} max={4} step={0.1} unit=" m" onChange={setRadius} color="#a78bfa" />
              <Slider label="Skin Thickness" value={thickness} min={1} max={8} step={0.5} unit=" mm" onChange={setThickness} color="#f59e0b" />

              {/* Formula */}
              <div style={{ marginTop: '1rem', padding: '0.9rem', borderRadius: '10px', background: 'rgba(56,189,248,0.06)', border: '1px solid rgba(56,189,248,0.15)', fontSize: '0.76rem', color: '#64748b', lineHeight: 1.7 }}>
                <div style={{ fontFamily: 'monospace', color: '#38bdf8', marginBottom: '0.35rem', fontSize: '0.68rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Hoop Stress Formula</div>
                <span style={{ fontFamily: 'monospace', color: '#94a3b8' }}>σ = ΔP × r / t</span><br/>
                <span style={{ fontFamily: 'monospace', color: '#64748b', fontSize: '0.7rem' }}>= {deltaP.toFixed(2)} psi × {radius}m / {thickness}mm</span><br/>
                <span style={{ fontFamily: 'monospace', color: sColor, fontWeight: 700 }}>= {hoopStressMPa.toFixed(1)} MPa</span>
              </div>

              <div style={{ marginTop: '1rem' }}>
                <Link to="/explore/fuselage" style={{ fontSize: '0.78rem', color: '#38bdf8', textDecoration: 'none' }}>📖 Learn about the Fuselage →</Link>
              </div>
            </div>

            {/* Atmosphere column */}
            <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '18px', padding: '1.25rem' }}>
              <div style={{ fontSize: '0.65rem', fontFamily: 'monospace', letterSpacing: '0.12em', color: '#64748b', textTransform: 'uppercase', marginBottom: '0.85rem' }}>Atmosphere</div>
              <div style={{ position: 'relative', height: '200px', borderRadius: '10px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.06)' }}>
                {/* Layers */}
                {atmoLayers.map(layer => {
                  const topPct = clamp((1 - layer.bot / maxAlt) * 100, 0, 100);
                  const botPct = clamp((1 - layer.top / maxAlt) * 100, 0, 100);
                  return (
                    <div key={layer.name} style={{ position: 'absolute', left: 0, right: 0, top: `${topPct}%`, height: `${botPct - topPct}%`, background: layer.color, borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                      <span style={{ position: 'absolute', right: '6px', bottom: '3px', fontSize: '0.55rem', fontFamily: 'monospace', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase' }}>{layer.name}</span>
                    </div>
                  );
                })}
                {/* Aircraft marker */}
                <div style={{ position: 'absolute', left: '10%', top: `${(1 - altPct) * 100}%`, transform: 'translateY(-50%)', transition: 'top 0.4s cubic-bezier(0.4,0,0.2,1)', display: 'flex', alignItems: 'center', gap: '6px', zIndex: 2 }}>
                  <div style={{ width: '24px', height: '8px', background: '#38bdf8', borderRadius: '4px', boxShadow: '0 0 10px rgba(56,189,248,0.7)', position: 'relative' }}>
                    <div style={{ position: 'absolute', right: '-8px', top: '-4px', width: '0', height: '0', borderLeft: '10px solid #38bdf8', borderTop: '8px solid transparent', borderBottom: '8px solid transparent' }} />
                  </div>
                  <span style={{ fontSize: '0.6rem', fontFamily: 'monospace', color: '#38bdf8', whiteSpace: 'nowrap' }}>{altitude.toLocaleString()} ft</span>
                </div>
                {/* Pressure indicator */}
                <div style={{ position: 'absolute', bottom: '6px', left: '6px', right: '6px', display: 'flex', justifyContent: 'space-between', fontSize: '0.58rem', fontFamily: 'monospace', color: 'rgba(255,255,255,0.3)' }}>
                  <span>0 ft</span><span>SL</span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Right: Cross-section + metrics */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.15 }}
            style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

            {/* Status + cross-section */}
            <div style={{ background: 'rgba(255,255,255,0.03)', border: `1px solid ${sColor}25`, borderRadius: '18px', padding: '1.5rem' }}>
              {/* Status header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                <div>
                  <div style={{ fontSize: '0.62rem', fontFamily: 'monospace', color: sColor, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.2rem' }}>Structural Status</div>
                  <div style={{ fontSize: '2rem', fontWeight: 900, color: sColor, lineHeight: 1 }}>{sLabel}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '0.6rem', fontFamily: 'monospace', color: '#475569', textTransform: 'uppercase' }}>Safety Factor</div>
                  <div style={{ fontSize: '1.6rem', fontWeight: 800, fontFamily: 'monospace', color: sColor }}>{safetyFactor.toFixed(2)}<span style={{ fontSize: '0.9rem', color: '#475569' }}>×</span></div>
                  <div style={{ fontSize: '0.65rem', color: '#475569' }}>Limit: 2.5× (FAR 25)</div>
                </div>
              </div>

              {/* Big cross-section */}
              <div style={{ display: 'flex', justifyContent: 'center', background: 'rgba(0,0,0,0.2)', borderRadius: '14px', padding: '1rem' }}>
                <svg viewBox="0 0 240 240" style={{ width: '100%', maxWidth: '320px', height: 'auto' }}>
                  <defs>
                    <radialGradient id="cabinGrad" cx="50%" cy="50%" r="50%">
                      <stop offset="0%" stopColor={sColor} stopOpacity={clamp(0.04 + deltaP * 0.012, 0.03, 0.18)} />
                      <stop offset="100%" stopColor={sColor} stopOpacity={clamp(0.01 + deltaP * 0.02, 0.02, 0.12)} />
                    </radialGradient>
                    <radialGradient id="skinGrad" cx="50%" cy="50%" r="50%">
                      <stop offset="0%" stopColor={sColor} stopOpacity="0.04" />
                      <stop offset="100%" stopColor={sColor} stopOpacity="0.18" />
                    </radialGradient>
                    <filter id="softGlow"><feGaussianBlur stdDeviation="4" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
                    <marker id="tArrow" markerWidth="5" markerHeight="5" refX="4" refY="2.5" orient="auto">
                      <path d="M0,0 L5,2.5 L0,5 Z" fill={sColor} />
                    </marker>
                  </defs>

                  {/* Grid */}
                  {[...Array(8)].map((_,i)=>(
                    <line key={i} x1={i*30} y1={0} x2={i*30} y2={240} stroke="rgba(255,255,255,0.03)" strokeWidth="1"/>
                  ))}

                  {/* Outer skin ring */}
                  <circle cx={CX} cy={CY} r={rPx + skinPx}
                    fill="url(#skinGrad)" stroke={sColor} strokeWidth={clamp(safetyFactor < 1.5 ? 2.5 : 1.5, 1, 3)} strokeOpacity="0.6"
                    filter="url(#softGlow)"
                    style={{ transition: 'all 0.4s ease' }}
                  />
                  {/* Inner cabin wall */}
                  <circle cx={CX} cy={CY} r={rPx}
                    fill="url(#cabinGrad)" stroke="rgba(255,255,255,0.15)" strokeWidth="1"
                    style={{ transition: 'all 0.4s ease' }}
                  />

                  {/* Cabin pressure fill */}
                  <circle cx={CX} cy={CY} r={rPx - 2}
                    fill={`${sColor}06`}
                    style={{ transition: 'all 0.4s ease' }}
                  />

                  {/* CABIN label */}
                  <text x={CX} y={CY - 8} textAnchor="middle" fill="rgba(255,255,255,0.4)" fontSize="10" fontFamily="monospace" fontWeight="bold">CABIN</text>
                  <text x={CX} y={CY + 8} textAnchor="middle" fill={sColor} fontSize="9" fontFamily="monospace">{cabinPsi.toFixed(2)} psi</text>

                  {/* Tension arrows — 8 directions */}
                  {arrows.map((a, i) => (
                    <line key={i} x1={a.x1} y1={a.y1} x2={a.x2} y2={a.y2}
                      stroke={sColor} strokeWidth="1.5" strokeOpacity={clamp(0.3 + deltaP * 0.08, 0.2, 0.9)}
                      markerEnd="url(#tArrow)"
                      style={{ transition: 'all 0.4s ease' }}
                    />
                  ))}

                  {/* Radius label */}
                  <line x1={CX} y1={CY} x2={CX + rPx} y2={CY} stroke="rgba(255,255,255,0.2)" strokeWidth="0.8" strokeDasharray="3 2" />
                  <text x={CX + rPx / 2} y={CY - 5} textAnchor="middle" fill="rgba(255,255,255,0.3)" fontSize="8" fontFamily="monospace">r={radius}m</text>

                  {/* Skin thickness label */}
                  <line x1={CX + rPx} y1={CY} x2={CX + rPx + skinPx} y2={CY} stroke={sColor} strokeWidth="1.2" opacity="0.5" />
                  <text x={CX + rPx + skinPx + 4} y={CY + 3} fill={sColor} fontSize="7.5" fontFamily="monospace" opacity="0.7">{thickness}mm</text>

                  {/* Ambient label */}
                  <text x={CX + rPx + skinPx + 6} y={CY + 26} fill="rgba(255,255,255,0.25)" fontSize="7.5" fontFamily="monospace">{ambientPsi.toFixed(2)} psi</text>
                  <text x={CX + rPx + skinPx + 6} y={CY + 36} fill="rgba(255,255,255,0.18)" fontSize="7" fontFamily="monospace">ambient</text>
                </svg>
              </div>

              {/* Safety factor bar */}
              <div style={{ marginTop: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                  <span style={{ fontSize: '0.62rem', fontFamily: 'monospace', color: '#475569', textTransform: 'uppercase' }}>Safety Margin (target: 2.5×)</span>
                  <span style={{ fontSize: '0.62rem', fontFamily: 'monospace', color: sColor }}>{Math.min(safetyFactor, 5).toFixed(2)}×</span>
                </div>
                <div style={{ height: '6px', background: 'rgba(255,255,255,0.06)', borderRadius: '99px', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${clamp((safetyFactor / 5) * 100, 0, 100)}%`, background: `linear-gradient(90deg, #fb7185 0%, #f59e0b 40%, #22c55e 65%)`, borderRadius: '99px', transition: 'width 0.4s ease' }} />
                </div>
              </div>
            </div>

            {/* Metrics */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.75rem' }}>
              {[
                { label: 'Ambient P', value: ambientPsi.toFixed(2), unit: 'psi', color: '#38bdf8' },
                { label: 'Cabin P', value: cabinPsi.toFixed(2), unit: 'psi', color: '#38bdf8' },
                { label: 'Delta P', value: deltaP.toFixed(2), unit: 'psi', color: '#a78bfa' },
                { label: 'Hoop Stress', value: hoopStressMPa.toFixed(1), unit: 'MPa', color: sColor },
              ].map(m => (
                <div key={m.label} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', padding: '0.9rem 0.75rem', textAlign: 'center' }}>
                  <div style={{ fontSize: '0.58rem', fontFamily: 'monospace', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.35rem' }}>{m.label}</div>
                  <div style={{ fontSize: '1rem', fontWeight: 800, fontFamily: 'monospace', color: m.color }}>{m.value}<span style={{ fontSize: '0.62rem', marginLeft: '0.2rem', color: '#475569' }}>{m.unit}</span></div>
                </div>
              ))}
            </div>

            {/* Altitude context */}
            <div style={{ padding: '1rem 1.25rem', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '14px', fontSize: '0.78rem', color: '#64748b', lineHeight: 1.6 }}>
              {altitude < 10000
                ? '✈ Below 10,000 ft — minimal pressurization needed. Most cabin interiors pressurized to ambient.'
                : altitude < 36089
                ? `✈ Troposphere at ${altitude.toLocaleString()} ft — ISA temperature ${(15 - altitude * 0.00198).toFixed(1)}°C. Standard commercial cruise range.`
                : altitude < 51000
                ? '✈ Stratosphere — very low ambient pressure. Aircraft pressurization is critical for passenger survival.'
                : '✈ Extreme altitude — above commercial aircraft envelope. Research aircraft only.'}
              {safetyFactor < 1.5 ? ' ⚠ Increase skin thickness immediately — structural failure risk.' :
               safetyFactor > 4 ? ' Design may be over-engineered — weight penalty without structural benefit.' : ''}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default FuselageLab;
