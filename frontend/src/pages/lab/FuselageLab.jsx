import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Box, ArrowLeft, Wind, ShieldAlert, Thermometer, Layers } from 'lucide-react';

const clamp = (v, mn, mx) => Math.min(mx, Math.max(mn, v));

const Slider = ({ label, value, min, max, step = 1, unit, onChange, color, icon: Icon }) => {
  const percentage = ((value - min) / (max - min)) * 100;
  
  return (
    <div className="mb-6 relative group">
      <div className="flex justify-between items-end mb-2">
        <div className="flex items-center gap-2">
          {Icon && <Icon size={14} style={{ color }} className="opacity-70" />}
          <span className="text-[10px] font-bold text-[#64748b] uppercase tracking-widest">{label}</span>
        </div>
        <span className="text-[13px] font-black font-mono" style={{ color }}>
          {typeof value === 'number' && value >= 1000 ? value.toLocaleString() : value}<span className="text-[10px] opacity-70 ml-0.5">{unit}</span>
        </span>
      </div>
      
      <div className="relative h-2 rounded-full bg-black/40 border border-white/10 overflow-visible cursor-pointer shadow-inner">
        {/* Glow behind the active track */}
        <div 
          className="absolute top-0 left-0 h-full rounded-full opacity-40 group-hover:opacity-70 transition-opacity blur-[4px]"
          style={{ width: `${percentage}%`, backgroundColor: color }}
        />
        
        {/* Active Track */}
        <div 
          className="absolute top-0 left-0 h-full rounded-full transition-all duration-75"
          style={{ width: `${percentage}%`, backgroundColor: color, boxShadow: `inset 0 1px 1px rgba(255,255,255,0.4)` }}
        />
        
        {/* The actual native input overlaying it all invisibly */}
        <input 
          type="range" min={min} max={max} step={step} value={value}
          onChange={e => onChange(Number(e.target.value))}
          className="absolute top-0 left-0 w-full h-full opacity-0 cursor-pointer z-10" 
        />
        
        {/* Custom Thumb */}
        <div 
          className="absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full border-[2.5px] border-white shadow-lg pointer-events-none transition-transform group-hover:scale-125 z-0"
          style={{ left: `calc(${percentage}% - 8px)`, backgroundColor: color, boxShadow: `0 0 12px ${color}80` }}
        />
      </div>
    </div>
  );
};

const FuselageLab = () => {
  const [altitude, setAltitude] = useState(35000);
  const [radius, setRadius] = useState(2.0);
  const [thickness, setThickness] = useState(3.0);

  // ISA atmosphere
  const ambientPsi = altitude < 36089
    ? 14.696 * Math.pow(1 - altitude / 145442, 5.256)
    : 14.696 * 0.2234 * Math.exp(-(altitude - 36089) / 20806);
  
  // Commercial aircraft pressurize to 8,000ft max
  const cabinPsi = 14.696 * Math.pow(1 - 8000 / 145442, 5.256);
  const deltaP = Math.max(0, cabinPsi - ambientPsi);
  const deltaPPa = deltaP * 6894.76;
  
  // Hoop stress in MPa
  const hoopStressMPa = (deltaPPa * radius / (thickness / 1000)) / 1e6;
  
  // Safety factors
  const alYield = 345;
  const safetyFactor = alYield / Math.max(hoopStressMPa, 0.01);
  const sColor = safetyFactor > 2.5 ? '#22c55e' : safetyFactor > 1.5 ? '#f59e0b' : '#fb7185';
  const sLabel = safetyFactor > 2.5 ? 'SAFE' : safetyFactor > 1.5 ? 'CAUTION' : 'DANGER';

  // Atmosphere layers (ft boundaries)
  const atmoLayers = [
    { name: 'Troposphere', top: 0,     bot: 36089, color: 'rgba(56,189,248,0.1)' },
    { name: 'Tropopause',  top: 36089, bot: 56000, color: 'rgba(167,139,250,0.1)' },
    { name: 'Stratosphere',top: 56000, bot: 100000,color: 'rgba(99,102,241,0.05)' },
  ];
  const maxAlt = 51000;
  const altPct = clamp(altitude / maxAlt, 0, 1);

  // Cross-section SVG Geometry
  const CX = 160, CY = 160, RMAX = 110;
  const rPx = clamp((radius / 4) * RMAX, 30, RMAX);
  const skinPx = clamp(thickness * 2.5, 4, 26);
  const cabinHeightOffset = rPx * 0.35; // Floor placement

  // Tension arrows (dynamically scaled by pressure difference)
  const arrows = Array.from({ length: 12 }, (_, i) => {
    const angle = (i * Math.PI * 2) / 12;
    const baseR = rPx + skinPx * 0.5;
    const arrowLen = clamp(deltaP * 4, 4, 25);
    return {
      x1: CX + Math.cos(angle) * (baseR),
      y1: CY + Math.sin(angle) * (baseR),
      x2: CX + Math.cos(angle) * (baseR + arrowLen),
      y2: CY + Math.sin(angle) * (baseR + arrowLen),
    };
  });

  // Stringers (structural dots around the perimeter)
  const stringers = Array.from({ length: 32 }, (_, i) => {
    const angle = (i * Math.PI * 2) / 32;
    return {
      x: CX + Math.cos(angle) * (rPx + skinPx * 0.2),
      y: CY + Math.sin(angle) * (rPx + skinPx * 0.2)
    };
  });

  // Seats geometry based on radius
  const seatWidth = clamp(rPx * 0.15, 10, 25);
  const seats = [];
  if (rPx > 50) {
    seats.push({ x: CX - seatWidth * 2, y: CY + cabinHeightOffset - seatWidth - 2 }); // L1
    seats.push({ x: CX - seatWidth * 0.8, y: CY + cabinHeightOffset - seatWidth - 2 }); // L2
    seats.push({ x: CX + seatWidth * 0.8, y: CY + cabinHeightOffset - seatWidth - 2 }); // R1
    seats.push({ x: CX + seatWidth * 2, y: CY + cabinHeightOffset - seatWidth - 2 }); // R2
  }

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#070b14] via-[#03060a] to-black text-slate-200 font-sans overflow-x-hidden selection:bg-[#38bdf8] selection:text-white pb-12">
      {/* Immersive Grid Overlay */}
      <div className="fixed inset-0 edu-grid-bg opacity-[0.03] pointer-events-none" />

      <div className="max-w-6xl mx-auto px-6 relative z-10 pt-20">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
          <div className="flex items-center gap-2 text-[10px] font-mono tracking-widest text-[#38bdf8] uppercase mb-5">
            <Link to="/lab" className="hover:text-white transition-colors flex items-center gap-1 bg-[#38bdf8]/10 py-1 px-3 rounded-full border border-[#38bdf8]/20">
              <ArrowLeft size={12} /> Labs
            </Link>
            <span className="opacity-40 mx-2">/</span>
            <span>Fuselage Pressurization</span>
          </div>
          
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 rounded-2xl bg-[#38bdf8]/10 border border-[#38bdf8]/20 flex items-center justify-center text-[#38bdf8] shadow-[0_0_30px_rgba(56,189,248,0.15)] relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-[#38bdf8]/20 to-transparent opacity-50" />
              <Box size={32} className="relative z-10" />
            </div>
            <div>
              <h1 className="text-3xl lg:text-4xl font-extrabold text-white mb-2 tracking-tight">Fuselage Command</h1>
              <p className="text-sm text-slate-400 max-w-xl">Monitor structural integrity and hoop stress dynamics in real-time as the vessel ascends through the atmospheric boundary layers.</p>
            </div>
          </div>
        </motion.div>

        {/* Main Grid */}
        <motion.div variants={containerVariants} initial="hidden" animate="show" className="grid grid-cols-1 lg:grid-cols-12 gap-6">

          {/* Left Column: Controls (4 cols) */}
          <motion.div variants={itemVariants} className="lg:col-span-4 flex flex-col gap-6">
            
            {/* Telemetry Sliders */}
            <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-2xl relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent pointer-events-none" />
              
              <div className="flex items-center gap-2 text-xs font-mono tracking-[0.2em] text-[#38bdf8] uppercase mb-8 border-b border-white/5 pb-4">
                <div className="w-2 h-2 rounded-full bg-[#38bdf8] animate-pulse" />
                Parameters
              </div>
              
              <Slider label="Flight Level" icon={Layers} value={altitude} min={0} max={51000} step={500} unit="ft" onChange={setAltitude} color="#38bdf8" />
              <Slider label="Vessel Radius" icon={Box} value={radius} min={1} max={4} step={0.1} unit="m" onChange={setRadius} color="#a78bfa" />
              <Slider label="Skin Gauge" icon={ShieldAlert} value={thickness} min={1} max={8} step={0.5} unit="mm" onChange={setThickness} color="#f59e0b" />

              {/* Formula Box */}
              <div className="mt-8 p-4 rounded-2xl bg-[#38bdf8]/[0.03] border border-[#38bdf8]/10 backdrop-blur-md">
                <div className="text-[10px] font-mono tracking-widest text-[#38bdf8] mb-3 uppercase flex justify-between items-center">
                  Hoop Stress Formula
                  <span className="text-[#64748b]">σ = ΔP×r/t</span>
                </div>
                <div className="flex flex-col gap-1.5 font-mono text-xs">
                  <div className="flex justify-between text-slate-400">
                    <span>Pressure Delta</span>
                    <span>{deltaP.toFixed(2)} psi</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Geometry</span>
                    <span>{radius}m / {thickness}mm</span>
                  </div>
                  <div className="h-px bg-white/10 my-1 w-full" />
                  <div className="flex justify-between font-bold" style={{ color: sColor }}>
                    <span>Yield (σ)</span>
                    <span className="text-sm">{hoopStressMPa.toFixed(1)} MPa</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Atmosphere Tracker */}
            <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-2xl relative overflow-hidden">
              <div className="flex justify-between items-center mb-6">
                <div className="text-xs font-mono tracking-[0.2em] text-[#64748b] uppercase">Atmosphere</div>
                <div className="text-[10px] font-mono bg-white/5 px-2 py-1 rounded text-slate-400 border border-white/5">{ambientPsi.toFixed(2)} psi</div>
              </div>
              
              <div className="relative h-48 rounded-xl overflow-hidden border border-white/10 bg-[#03060a]">
                {atmoLayers.map(layer => {
                  const topPct = clamp((1 - layer.bot / maxAlt) * 100, 0, 100);
                  const botPct = clamp((1 - layer.top / maxAlt) * 100, 0, 100);
                  return (
                    <div key={layer.name} className="absolute left-0 right-0 border-b border-white/5 backdrop-blur-sm" style={{ top: `${topPct}%`, height: `${botPct - topPct}%`, background: layer.color }}>
                      <span className="absolute right-2 bottom-1 text-[9px] font-mono text-white/30 uppercase tracking-widest">{layer.name}</span>
                    </div>
                  );
                })}
                
                {/* Dynamic Aircraft Laser Scanner */}
                <div className="absolute left-0 right-0 z-10 transition-all duration-300 ease-out pointer-events-none" style={{ top: `${(1 - altPct) * 100}%` }}>
                  <div className="relative h-[2px] bg-[#38bdf8] w-full shadow-[0_0_15px_#38bdf8]">
                    <div className="absolute -top-[15px] left-2 bg-[#38bdf8]/10 border border-[#38bdf8]/30 backdrop-blur-md px-2 py-1 rounded text-[9px] font-mono text-[#38bdf8]">
                      {altitude.toLocaleString()} FT
                    </div>
                    {/* Laser glow */}
                    <div className="absolute inset-0 bg-[#38bdf8] blur-[4px] opacity-50 h-[8px] -top-[3px]" />
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Right Column: Visualizer & Metrics (8 cols) */}
          <motion.div variants={itemVariants} className="lg:col-span-8 flex flex-col gap-6">
            
            {/* Main Visualizer */}
            <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-3xl p-6 lg:p-10 shadow-2xl relative overflow-hidden flex flex-col items-center justify-center min-h-[400px]" style={{ borderColor: `${sColor}30` }}>
              
              {/* Background ambient glow matching status */}
              <div className="absolute inset-0 opacity-[0.03] pointer-events-none transition-colors duration-500" style={{ background: `radial-gradient(circle at 50% 50%, ${sColor}, transparent 70%)` }} />
              
              {/* Status Header inside Visualizer */}
              <div className="absolute top-6 left-6 right-6 flex justify-between items-start z-10">
                <div>
                  <div className="text-[10px] font-mono tracking-widest uppercase mb-1" style={{ color: sColor }}>Integrity</div>
                  <motion.div 
                    key={sLabel}
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="text-3xl font-black tracking-tight"
                    style={{ color: sColor, textShadow: `0 0 20px ${sColor}40` }}
                  >
                    {sLabel}
                  </motion.div>
                </div>
                <div className="text-right">
                  <div className="text-[10px] font-mono tracking-widest uppercase text-slate-500 mb-1">Safety Margin</div>
                  <div className="text-2xl font-black font-mono" style={{ color: sColor }}>
                    {safetyFactor.toFixed(2)}<span className="text-sm opacity-50 ml-1">×</span>
                  </div>
                </div>
              </div>

              {/* High-Fidelity SVG Diagram */}
              <div className="relative w-full max-w-md mt-12 mb-8">
                <svg viewBox="0 0 320 320" className="w-full h-auto drop-shadow-2xl overflow-visible">
                  <defs>
                    <radialGradient id="cabinGrad" cx="50%" cy="50%" r="50%">
                      <stop offset="60%" stopColor={sColor} stopOpacity={clamp(0.02 + deltaP * 0.015, 0.02, 0.25)} />
                      <stop offset="100%" stopColor={sColor} stopOpacity={clamp(0.05 + deltaP * 0.03, 0.05, 0.4)} />
                    </radialGradient>
                    <radialGradient id="ambientGrad" cx="50%" cy="50%" r="50%">
                      <stop offset="80%" stopColor="#38bdf8" stopOpacity="0" />
                      <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.1" />
                    </radialGradient>
                    <filter id="superGlow" x="-20%" y="-20%" width="140%" height="140%">
                      <feGaussianBlur stdDeviation="8" result="blur" />
                      <feComposite in="SourceGraphic" in2="blur" operator="over" />
                    </filter>
                    <marker id="tArrow" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
                      <path d="M0,0 L6,3 L0,6 Z" fill={sColor} />
                    </marker>
                    {/* Pattern for structural grid inside cabin */}
                    <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
                      <path d="M 10 0 L 0 0 0 10" fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="0.5" />
                    </pattern>
                  </defs>

                  {/* Breathing animation on group based on pressure */}
                  <g style={{ transform: `scale(${1 + (deltaP * 0.001)})`, transformOrigin: 'center', transition: 'transform 0.3s ease-out' }}>
                    
                    {/* Outer ambient environment ring */}
                    <circle cx={CX} cy={CY} r={rPx + skinPx + 20} fill="url(#ambientGrad)" pointerEvents="none" />
                    
                    {/* Skin Layer */}
                    <circle cx={CX} cy={CY} r={rPx + skinPx}
                      fill="#0a0f1c" stroke={sColor} strokeWidth={clamp(safetyFactor < 1.5 ? 3 : 1.5, 1, 4)}
                      strokeOpacity={safetyFactor < 1.5 ? 1 : 0.6}
                      filter={safetyFactor < 2 ? "url(#superGlow)" : ""}
                      style={{ transition: 'all 0.4s ease' }}
                    />
                    
                    {/* Cabin Interior Base */}
                    <circle cx={CX} cy={CY} r={rPx} fill="url(#grid)" />
                    <circle cx={CX} cy={CY} r={rPx} fill="url(#cabinGrad)" style={{ transition: 'all 0.4s ease' }} />

                    {/* Structural Stringers (dots around hull) */}
                    {stringers.map((s, i) => (
                      <circle key={i} cx={s.x} cy={s.y} r={1.5} fill="rgba(255,255,255,0.3)" />
                    ))}

                    {/* Floor Beam */}
                    <line 
                      x1={CX - Math.sqrt(Math.pow(rPx, 2) - Math.pow(cabinHeightOffset, 2))} 
                      y1={CY + cabinHeightOffset} 
                      x2={CX + Math.sqrt(Math.pow(rPx, 2) - Math.pow(cabinHeightOffset, 2))} 
                      y2={CY + cabinHeightOffset} 
                      stroke="rgba(255,255,255,0.2)" strokeWidth="2" strokeDasharray="4 2" 
                    />

                    {/* Seats */}
                    {seats.map((seat, i) => (
                      <g key={i} opacity="0.3">
                        <rect x={seat.x} y={seat.y} width={seatWidth * 0.8} height={seatWidth} rx="2" fill="none" stroke="white" strokeWidth="1" />
                        <path d={`M ${seat.x},${seat.y + seatWidth * 0.4} L ${seat.x + seatWidth * 0.8},${seat.y + seatWidth * 0.4}`} stroke="white" strokeWidth="1" />
                      </g>
                    ))}

                    {/* Tension Arrows radiating out */}
                    {arrows.map((a, i) => (
                      <line key={`arr-${i}`} x1={a.x1} y1={a.y1} x2={a.x2} y2={a.y2}
                        stroke={sColor} strokeWidth={deltaP > 5 ? "2" : "1.5"} 
                        strokeOpacity={clamp(0.2 + deltaP * 0.08, 0.2, 1)}
                        markerEnd="url(#tArrow)"
                        style={{ transition: 'all 0.4s ease' }}
                      />
                    ))}

                    {/* Central CABIN label */}
                    <text x={CX} y={CY - 10} textAnchor="middle" fill="rgba(255,255,255,0.6)" fontSize="12" fontStyle="italic" fontFamily="sans-serif" fontWeight="900" letterSpacing="0.2em">CABIN</text>
                    <text x={CX} y={CY + 12} textAnchor="middle" fill={sColor} fontSize="11" fontFamily="monospace" fontWeight="bold" filter="url(#superGlow)">{cabinPsi.toFixed(2)} PSI</text>

                    {/* Dimension lines */}
                    <line x1={CX} y1={CY} x2={CX + rPx} y2={CY} stroke="rgba(255,255,255,0.3)" strokeWidth="1" strokeDasharray="2 2" />
                    <text x={CX + rPx / 2} y={CY - 6} textAnchor="middle" fill="rgba(255,255,255,0.5)" fontSize="9" fontFamily="monospace">R {radius}m</text>
                    
                    <line x1={CX + rPx} y1={CY} x2={CX + rPx + skinPx} y2={CY} stroke={sColor} strokeWidth="1.5" opacity="0.8" />
                    <text x={CX + rPx + skinPx + 6} y={CY + 3} fill={sColor} fontSize="9" fontFamily="monospace" opacity="0.9">t={thickness}mm</text>
                  </g>
                </svg>
              </div>

              {/* Warnings / Context block below SVG */}
              <div className="w-full rounded-2xl bg-black/50 border border-white/5 p-4 text-xs font-mono text-slate-400 leading-relaxed shadow-inner">
                <div className="flex gap-2 items-start">
                  <div className="w-1.5 h-1.5 rounded-full mt-1 shrink-0" style={{ background: sColor, boxShadow: `0 0 8px ${sColor}` }} />
                  <div>
                    {altitude < 10000 
                      ? 'BELOW 10,000 FT: Pressurization not strictly required. Cabin pressure equalizes with ambient environment.' 
                      : altitude < 36089 
                      ? `TROPOSPHERE CRUISING: ISA Temp ${(15 - altitude * 0.00198).toFixed(1)}°C. Optimal commercial envelope. Delta P must be maintained.`
                      : 'EXTREME ALTITUDE (STRATOSPHERE): Ambient pressure critically low. Structural integrity is heavily stressed.'}
                    
                    {safetyFactor < 1.5 && (
                      <span className="block mt-2 text-[#fb7185] font-bold">⚠ CRITICAL: Structure is approaching yield limit. Increase skin gauge immediately.</span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: 'Ambient Pres.', value: ambientPsi.toFixed(2), unit: 'PSI', color: '#38bdf8', icon: Wind },
                { label: 'Cabin Pres.', value: cabinPsi.toFixed(2), unit: 'PSI', color: '#38bdf8', icon: Thermometer },
                { label: 'Pres. Delta', value: deltaP.toFixed(2), unit: 'PSI', color: '#a78bfa', icon: Layers },
                { label: 'Hoop Stress', value: hoopStressMPa.toFixed(1), unit: 'MPa', color: sColor, icon: ShieldAlert },
              ].map((m, idx) => (
                <motion.div 
                  key={m.label}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + idx * 0.1 }}
                  className="bg-black/40 backdrop-blur-md border border-white/10 rounded-2xl p-5 shadow-xl relative overflow-hidden group"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-white/[0.03] to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="flex items-center gap-2 mb-3 opacity-60">
                    <m.icon size={14} style={{ color: m.color }} />
                    <div className="text-[9px] font-mono tracking-widest text-slate-300 uppercase">{m.label}</div>
                  </div>
                  <div className="flex items-baseline gap-1.5">
                    <div className="text-2xl font-black font-mono tracking-tight" style={{ color: m.color, textShadow: `0 0 15px ${m.color}30` }}>
                      {m.value}
                    </div>
                    <div className="text-xs font-bold text-slate-500">{m.unit}</div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

        </motion.div>
      </div>
    </div>
  );
};

export default FuselageLab;
