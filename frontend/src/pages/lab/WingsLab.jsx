import React, { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Plane, ArrowLeft, Wind, Activity, Zap, Layers } from 'lucide-react';

const clamp = (v, min, max) => Math.min(max, Math.max(min, v));

const Slider = ({ label, icon: Icon, value, min, max, step = 1, unit, onChange, color }) => (
  <div className="mb-5">
    <div className="flex justify-between items-center mb-3">
      <div className="flex items-center gap-2">
        <div className="w-6 h-6 rounded-md flex items-center justify-center border" style={{ background: `${color}15`, color, borderColor: `${color}30` }}>
          <Icon size={14} />
        </div>
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{label}</span>
      </div>
      <div className="text-sm font-mono font-bold" style={{ color, textShadow: `0 0 10px ${color}50` }}>
        {value.toFixed(step < 1 ? 2 : 0)}<span className="text-slate-500 ml-1">{unit}</span>
      </div>
    </div>
    <div className="relative h-2 bg-black/50 border border-white/5 rounded-full overflow-visible flex items-center group">
      <div className="absolute left-0 h-full rounded-full pointer-events-none transition-all duration-75" style={{ width: `${((value - min) / (max - min)) * 100}%`, backgroundColor: color, boxShadow: `0 0 10px ${color}80` }} />
      <input 
        type="range" min={min} max={max} step={step} value={value}
        onChange={e => onChange(Number(e.target.value))}
        className="w-full absolute inset-0 opacity-0 cursor-pointer z-10"
        style={{ touchAction: 'none' }}
      />
      <div 
        className="w-5 h-5 rounded-full bg-[#0b1221] border-2 shadow-[0_0_15px_rgba(0,0,0,0.8)] transition-transform group-hover:scale-125 absolute pointer-events-none"
        style={{ 
          borderColor: color,
          boxShadow: `0 0 10px ${color}, inset 0 0 4px ${color}`,
          left: `calc(${((value - min) / (max - min)) * 100}% - 10px)`
        }}
      >
        <div className="absolute inset-1 rounded-full bg-white/20" />
      </div>
    </div>
  </div>
);

const WING_ZONES = {
  root: { id: 'root', label: 'Wing Root', color: '#f59e0b', desc: 'The thickest part of the wing. Handles massive bending moments.' },
  tip: { id: 'tip', label: 'Wing Tip', color: '#38bdf8', desc: 'Outermost edge. Generates induced drag vortices as high-pressure air bleeds to the top.' },
  leadingEdge: { id: 'leadingEdge', label: 'Leading Edge', color: '#22c55e', desc: 'Forward boundary. Sweep angle delays transonic shockwaves.' },
  trailingEdge: { id: 'trailingEdge', label: 'Trailing Edge', color: '#a78bfa', desc: 'Rear boundary. Houses flaps and ailerons.' },
};

const TelemetryBox = ({ label, value, color }) => (
  <div className="flex flex-col bg-black/40 border border-white/10 rounded-xl p-3">
    <span className="text-[9px] uppercase tracking-widest text-slate-500 font-mono mb-1">{label}</span>
    <span className="text-xl font-mono font-bold" style={{ color, textShadow: `0 0 15px ${color}50` }}>{value}</span>
  </div>
);

const WingsLab = () => {
  const [span, setSpan] = useState(35);
  const [sweep, setSweep] = useState(35);
  const [chord, setChord] = useState(5);
  const [cl, setCl] = useState(0.5);
  const [mach, setMach] = useState(0.85);
  const [activeZone, setActiveZone] = useState(null);

  const S = useMemo(() => span * chord * 0.6, [span, chord]);
  const AR = useMemo(() => (span * span) / S, [span, S]);
  const e = 0.85;
  const cdi = useMemo(() => (cl * cl) / (Math.PI * e * AR), [cl, AR]);
  const ld = useMemo(() => cl / (0.02 + cdi), [cl, cdi]);
  const sweepRad = (sweep * Math.PI) / 180;

  // Transonic effects
  // Shockwave angle = asin(1/Mach). If Mach < 1, shockwave hasn't formed fully, but critical mach effects start around 0.8.
  const criticalMach = 0.75 / Math.cos(sweepRad);
  const isSupersonic = mach > 1.0;
  const isTransonic = mach > 0.8 && mach <= 1.0;
  const shockAngleRad = isSupersonic ? Math.asin(1 / mach) : (isTransonic ? Math.PI/2 - (mach-0.8)*2 : 0);
  const shockAngleDeg = shockAngleRad * (180 / Math.PI);
  
  // Severe drag if shockwave angle is wider than sweep angle (meaning wing is outside the cone)
  const isShockwaveHitting = isSupersonic && ((90 - shockAngleDeg) > sweep);

  // SVG planform dims
  const W = 800, H = 500;
  const cx = W / 2, cy = H * 0.25;
  const halfSpan = clamp((span / 80) * (W * 0.45), 40, W * 0.45);
  const tipOffset = Math.tan(sweepRad) * halfSpan;
  const rootChordPx = clamp((chord / 12) * (H * 0.4), 30, H * 0.45);
  const taper = 0.35;
  const tipChordPx = rootChordPx * taper;
  const tipY = cy + tipOffset;

  const leftWingPath = `M${cx},${cy} L${cx - halfSpan},${tipY} L${cx - halfSpan},${tipY + tipChordPx} L${cx},${cy + rootChordPx} Z`;
  const rightWingPath = `M${cx},${cy} L${cx + halfSpan},${tipY} L${cx + halfSpan},${tipY + tipChordPx} L${cx},${cy + rootChordPx} Z`;

  // Color logic
  let wingColor = ld > 18 ? '#22c55e' : ld > 12 ? '#38bdf8' : ld > 8 ? '#f59e0b' : '#fb7185';
  if (isShockwaveHitting) wingColor = '#ef4444'; // Red if taking severe shockwave drag

  // Bars for Cdi vs Span chart
  const bars = [20, 30, 40, 50, 60, 70, 80].map(s => {
    const sArea = s * chord * 0.6;
    const sAR = (s * s) / sArea;
    return { s, cdi: (cl * cl) / (Math.PI * e * sAR) };
  });
  const maxCdi = Math.max(...bars.map(b => b.cdi), 0.001);

  // Vortex visualization lines based on Cdi
  const numVortices = Math.floor(clamp(cdi * 200, 2, 8));

  return (
    <div className="min-h-full bg-gradient-to-br from-[#02050a] via-[#0b1221] to-[#040814] p-4 lg:p-8 font-sans text-white">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Link to="/lab" className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors backdrop-blur-md">
              <ArrowLeft size={18} />
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center border border-indigo-500/30 shadow-[0_0_15px_rgba(99,102,241,0.3)]">
                  <Wind size={18} />
                </div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">Wings Lab</h1>
              </div>
              <p className="text-slate-400 text-xs mt-1 font-mono uppercase tracking-widest">Transonic Wind Tunnel Chamber</p>
            </div>
          </div>
        </motion.div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-auto lg:h-[calc(100vh-140px)] min-h-[750px]">
          
          {/* Controls Panel */}
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }} className="lg:col-span-3 flex flex-col gap-4">
            
            <div className="bg-black/40 backdrop-blur-2xl border border-white/10 rounded-2xl p-6 relative overflow-hidden shadow-2xl flex-1 flex flex-col">
              <div className="absolute top-0 left-0 w-full h-1" style={{ backgroundColor: wingColor, boxShadow: `0 0 20px ${wingColor}` }} />
              
              <div className="text-[10px] font-mono tracking-widest text-slate-500 uppercase mb-4 flex items-center gap-2">
                <Activity size={12} className="animate-pulse" style={{ color: wingColor }}/> Chamber Controls
              </div>

              <Slider label="Mach Number" icon={Zap} value={mach} min={0.3} max={2.5} step={0.05} unit=" M" onChange={setMach} color="#ef4444" />
              <Slider label="Sweep Angle" icon={Layers} value={sweep} min={0} max={65} unit="°" onChange={setSweep} color="#38bdf8" />
              <Slider label="Wing Span" icon={Wind} value={span} min={20} max={80} unit=" m" onChange={setSpan} color="#a78bfa" />
              <Slider label="Root Chord" icon={Wind} value={chord} min={2} max={12} step={0.5} unit=" m" onChange={setChord} color="#10b981" />
              <Slider label="Design CL" icon={Wind} value={cl} min={0.1} max={1.5} step={0.05} unit="" onChange={setCl} color="#f59e0b" />
              
              {/* Insight Panel */}
              <div className="mt-auto pt-4 relative min-h-[140px]">
                <AnimatePresence mode="wait">
                  {activeZone ? (
                    <motion.div
                      key={activeZone.id}
                      initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
                      className="absolute inset-0 bg-black/60 border rounded-xl p-4 flex flex-col justify-center"
                      style={{ borderColor: `${activeZone.color}40`, boxShadow: `inset 0 0 20px ${activeZone.color}20` }}
                    >
                      <div className="text-[10px] font-mono uppercase tracking-widest mb-2 flex justify-between" style={{ color: activeZone.color }}>
                        <span>[ LIDAR SCAN: {activeZone.label} ]</span>
                      </div>
                      <p className="text-xs text-slate-300 leading-relaxed font-mono">{activeZone.desc}</p>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="default"
                      initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
                      className="absolute inset-0 bg-black/40 border border-white/5 rounded-xl p-4 flex flex-col justify-center"
                    >
                      <div className="text-[10px] font-mono uppercase tracking-widest text-slate-400 mb-2">Performance Insight</div>
                      <p className="text-xs text-slate-400 leading-relaxed font-mono">
                        {isShockwaveHitting ? (
                          <span className="text-red-400 font-bold">WARNING: Severe wave drag! Sweep angle is insufficient to remain inside the Mach cone.</span>
                        ) : isSupersonic ? (
                          <span className="text-[#38bdf8]">Supersonic flight optimal. Wing sweep keeps leading edge strictly inside the shock cone.</span>
                        ) : isTransonic ? (
                          <span className="text-[#f59e0b]">Transonic regime. Shockwaves forming on wing surface.</span>
                        ) : (
                          <span>Subsonic cruise optimal. Minimizing induced drag is the primary objective.</span>
                        )}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

          </motion.div>

          {/* Visualization Canvas */}
          <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.15 }} className="lg:col-span-9 flex flex-col gap-4">
            
            <div className="bg-black/40 backdrop-blur-2xl border border-white/10 rounded-2xl relative overflow-hidden flex-1 shadow-2xl flex flex-col">
              
              <div className="absolute top-6 left-6 right-6 flex justify-between items-start z-20 pointer-events-none">
                <div className="bg-[#0b1221]/80 backdrop-blur-md border border-white/10 rounded-lg px-4 py-2 font-mono text-[10px] text-white tracking-widest uppercase flex items-center gap-2 shadow-[0_0_15px_rgba(0,0,0,0.5)]">
                  <span className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: wingColor, boxShadow: `0 0 10px ${wingColor}` }} /> 
                  Wind Tunnel Active
                </div>
                <div className="bg-[#0b1221]/80 backdrop-blur-md border border-white/10 rounded-lg px-4 py-2 text-right shadow-[0_0_15px_rgba(0,0,0,0.5)]">
                  <div className="font-mono text-[9px] text-slate-500 tracking-widest uppercase mb-1">Critical Mach</div>
                  <div className="font-mono text-sm font-bold text-[#f59e0b]">M_crit ≈ {criticalMach.toFixed(2)}</div>
                </div>
              </div>

              <div className="flex-1 w-full relative">
                <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid meet" className="w-full h-full absolute inset-0">
                  <defs>
                    <radialGradient id="tunnelGlow" cx="50%" cy="50%" r="50%">
                      <stop offset="0%" stopColor="rgba(56,189,248,0.15)" />
                      <stop offset="100%" stopColor="transparent" />
                    </radialGradient>
                    <linearGradient id="wingGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor={wingColor} stopOpacity="0.5" />
                      <stop offset="100%" stopColor={wingColor} stopOpacity="0.1" />
                    </linearGradient>
                    <filter id="neonGlow">
                      <feGaussianBlur stdDeviation="4" result="blur"/>
                      <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
                    </filter>
                    <filter id="intenseGlow">
                      <feGaussianBlur stdDeviation="8" result="blur"/>
                      <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
                    </filter>
                  </defs>

                  {/* Wind Tunnel Background & Core Glow */}
                  <rect width="100%" height="100%" fill="url(#tunnelGlow)" />
                  
                  {/* Grid Lines */}
                  {[...Array(10)].map((_,i) => (
                    <line key={`v${i}`} x1={i*W/10} y1={0} x2={i*W/10} y2={H} stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
                  ))}
                  {[...Array(8)].map((_,i) => (
                    <line key={`h${i}`} x1={0} y1={i*H/8} x2={W} y2={i*H/8} stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
                  ))}

                  {/* Centerline */}
                  <line x1={cx} y1={0} x2={cx} y2={H} stroke="rgba(255,255,255,0.1)" strokeWidth="1" strokeDasharray="10 10" />

                  {/* Wind Tunnel Laser Smoke Lines */}
                  <g opacity="0.4">
                    {[...Array(24)].map((_,i) => (
                      <line key={`smoke${i}`} x1={cx - 360 + (i*30)} y1="0" x2={cx - 360 + (i*30)} y2={H} stroke="#38bdf8" strokeWidth="1" strokeDasharray="40 120" opacity={0.3 + Math.random()*0.5}>
                        <animate attributeName="stroke-dashoffset" from="160" to="0" dur={`${1.2 / mach}s`} repeatCount="indefinite" />
                      </line>
                    ))}
                  </g>

                  {/* Shockwave Visuals */}
                  {mach >= 0.8 && (
                    <g opacity={isSupersonic ? 0.8 : 0.4} filter="url(#intenseGlow)">
                      {/* Left shockwave */}
                      <line x1={cx} y1={cy} x2={cx - 400 * Math.tan(shockAngleRad)} y2={cy + 400} stroke={isShockwaveHitting ? "#ef4444" : "#f59e0b"} strokeWidth="3" />
                      {/* Right shockwave */}
                      <line x1={cx} y1={cy} x2={cx + 400 * Math.tan(shockAngleRad)} y2={cy + 400} stroke={isShockwaveHitting ? "#ef4444" : "#f59e0b"} strokeWidth="3" />
                      
                      {/* Mach cone fill */}
                      <path d={`M${cx},${cy} L${cx - 400 * Math.tan(shockAngleRad)},${cy + 400} L${cx + 400 * Math.tan(shockAngleRad)},${cy + 400} Z`} fill={isShockwaveHitting ? "rgba(239,68,68,0.15)" : "rgba(245,158,11,0.08)"} />
                    </g>
                  )}

                  {/* Wings */}
                  <path d={leftWingPath} fill="url(#wingGrad)" stroke={wingColor} strokeWidth="2" filter="url(#neonGlow)" style={{ transition: 'all 0.4s ease' }} />
                  <path d={rightWingPath} fill="url(#wingGrad)" stroke={wingColor} strokeWidth="2" filter="url(#neonGlow)" style={{ transition: 'all 0.4s ease' }} />

                  {/* Fuselage Core (Wind tunnel sting/mount) */}
                  <rect x={cx - 12} y={cy - 20} width={24} height={H} fill="rgba(15,23,42,0.9)" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
                  <ellipse cx={cx} cy={cy - 20} rx="12" ry="40" fill="rgba(255,255,255,0.1)" />
                  <path d={`M${cx-10},${cy+20} L${cx+10},${cy+20}`} stroke="rgba(255,255,255,0.2)" strokeWidth="2" />

                  {/* Wingtip Vortices (Induced Drag visualization) */}
                  <g filter="url(#neonGlow)">
                    {[...Array(numVortices)].map((_, i) => (
                      <React.Fragment key={`vort${i}`}>
                        {/* Left tip vortex */}
                        <path 
                          d={`M${cx - halfSpan},${tipY + tipChordPx} Q${cx - halfSpan - 20 - i*8},${tipY + tipChordPx + 80 + i*20} ${cx - halfSpan + 10},${H}`} 
                          fill="none" stroke="#a78bfa" strokeWidth="1.5" opacity={0.7 - (i*0.1)} strokeDasharray="10 15"
                        >
                          <animate attributeName="stroke-dashoffset" from="25" to="0" dur={`${0.4 + i*0.1}s`} repeatCount="indefinite" />
                        </path>
                        {/* Right tip vortex */}
                        <path 
                          d={`M${cx + halfSpan},${tipY + tipChordPx} Q${cx + halfSpan + 20 + i*8},${tipY + tipChordPx + 80 + i*20} ${cx + halfSpan - 10},${H}`} 
                          fill="none" stroke="#a78bfa" strokeWidth="1.5" opacity={0.7 - (i*0.1)} strokeDasharray="10 15"
                        >
                          <animate attributeName="stroke-dashoffset" from="25" to="0" dur={`${0.4 + i*0.1}s`} repeatCount="indefinite" />
                        </path>
                      </React.Fragment>
                    ))}
                  </g>

                  {/* INTERACTIVE LIDAR ZONES */}
                  <g style={{ transition: 'all 0.3s' }}>
                    {/* Root */}
                    <line x1={cx} y1={cy} x2={cx} y2={cy + rootChordPx} stroke="transparent" strokeWidth="40" style={{ cursor: 'crosshair' }} onMouseEnter={() => setActiveZone(WING_ZONES.root)} onMouseLeave={() => setActiveZone(null)} />
                    {activeZone?.id === 'root' && (
                      <line x1={cx} y1={cy} x2={cx} y2={cy + rootChordPx} stroke={WING_ZONES.root.color} strokeWidth="8" strokeDasharray="4 4" filter="url(#neonGlow)" style={{ pointerEvents: 'none' }} />
                    )}

                    {/* Leading Edge */}
                    <path d={`M${cx - halfSpan},${tipY} L${cx},${cy} L${cx + halfSpan},${tipY}`} fill="none" stroke="transparent" strokeWidth="30" style={{ cursor: 'crosshair' }} onMouseEnter={() => setActiveZone(WING_ZONES.leadingEdge)} onMouseLeave={() => setActiveZone(null)} />
                    {activeZone?.id === 'leadingEdge' && (
                      <path d={`M${cx - halfSpan},${tipY} L${cx},${cy} L${cx + halfSpan},${tipY}`} fill="none" stroke={WING_ZONES.leadingEdge.color} strokeWidth="6" strokeDasharray="4 4" filter="url(#neonGlow)" style={{ pointerEvents: 'none' }} />
                    )}

                    {/* Trailing Edge */}
                    <path d={`M${cx - halfSpan},${tipY + tipChordPx} L${cx},${cy + rootChordPx} L${cx + halfSpan},${tipY + tipChordPx}`} fill="none" stroke="transparent" strokeWidth="30" style={{ cursor: 'crosshair' }} onMouseEnter={() => setActiveZone(WING_ZONES.trailingEdge)} onMouseLeave={() => setActiveZone(null)} />
                    {activeZone?.id === 'trailingEdge' && (
                      <path d={`M${cx - halfSpan},${tipY + tipChordPx} L${cx},${cy + rootChordPx} L${cx + halfSpan},${tipY + tipChordPx}`} fill="none" stroke={WING_ZONES.trailingEdge.color} strokeWidth="6" strokeDasharray="4 4" filter="url(#neonGlow)" style={{ pointerEvents: 'none' }} />
                    )}

                    {/* Tips */}
                    <g style={{ cursor: 'crosshair' }} onMouseEnter={() => setActiveZone(WING_ZONES.tip)} onMouseLeave={() => setActiveZone(null)}>
                      <path d={`M${cx - halfSpan},${tipY} L${cx - halfSpan},${tipY + tipChordPx}`} fill="none" stroke="transparent" strokeWidth="30" />
                      <path d={`M${cx + halfSpan},${tipY} L${cx + halfSpan},${tipY + tipChordPx}`} fill="none" stroke="transparent" strokeWidth="30" />
                    </g>
                    {activeZone?.id === 'tip' && (
                      <g filter="url(#neonGlow)" style={{ pointerEvents: 'none' }}>
                        <path d={`M${cx - halfSpan},${tipY} L${cx - halfSpan},${tipY + tipChordPx}`} fill="none" stroke={WING_ZONES.tip.color} strokeWidth="8" strokeDasharray="2 4" />
                        <path d={`M${cx + halfSpan},${tipY} L${cx + halfSpan},${tipY + tipChordPx}`} fill="none" stroke={WING_ZONES.tip.color} strokeWidth="8" strokeDasharray="2 4" />
                      </g>
                    )}
                  </g>

                </svg>
              </div>

              {/* Bottom Telemetry Bar */}
              <div className="border-t border-white/10 bg-[#0b1221]/90 backdrop-blur-xl p-5 z-10 shadow-[0_-10px_30px_rgba(0,0,0,0.5)]">
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <TelemetryBox label="Wing Area (S)" value={`${S.toFixed(1)} m²`} color="#a78bfa" />
                  <TelemetryBox label="Aspect Ratio" value={AR.toFixed(2)} color="#a78bfa" />
                  <TelemetryBox label="Induced Drag" value={cdi.toFixed(4)} color="#a78bfa" />
                  <TelemetryBox label="L/D Ratio" value={ld.toFixed(1)} color={wingColor} />
                </div>

                {/* High-Tech Induced Drag Radar Chart */}
                <div className="bg-black/40 border border-white/5 rounded-xl p-3 flex flex-col justify-end relative overflow-hidden" style={{ height: '70px' }}>
                  <div className="absolute top-2 left-3 text-[8px] uppercase tracking-widest font-mono text-slate-500">Induced Drag Spectral Analysis</div>
                  <div className="flex items-end gap-[2px] w-full h-[40px] px-2 z-10">
                    {bars.map(b => {
                      const isActive = Math.abs(b.s - span) < 5;
                      const h = clamp((b.cdi / maxCdi) * 40, 4, 40);
                      return (
                        <div key={b.s} className="flex-1 flex flex-col items-center gap-1">
                          <div 
                            className="w-full rounded-t-sm transition-all duration-300"
                            style={{ 
                              height: `${h}px`, 
                              backgroundColor: isActive ? wingColor : 'rgba(255,255,255,0.15)',
                              boxShadow: isActive ? `0 0 15px ${wingColor}` : 'none'
                            }}
                          />
                        </div>
                      );
                    })}
                  </div>
                  {/* Scanline overlay */}
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/5 to-transparent h-4 animate-[scan_2s_linear_infinite]" />
                </div>

              </div>

            </div>
          </motion.div>
        </div>
      </div>
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes scan {
          0% { transform: translateY(-100%); }
          100% { transform: translateY(500%); }
        }
      `}} />
    </div>
  );
};

export default WingsLab;
