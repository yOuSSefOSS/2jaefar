import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, GitCommit, Wind, Activity, Ruler, Scaling } from 'lucide-react';

const clamp = (v, min, max) => Math.min(max, Math.max(min, v));

const Slider = ({ label, icon: Icon, value, min, max, step = 1, unit, onChange, color }) => (
  <div className="mb-6">
    <div className="flex justify-between items-center mb-3">
      <div className="flex items-center gap-2">
        <div className="w-6 h-6 rounded-md flex items-center justify-center" style={{ background: `${color}15`, color }}>
          <Icon size={14} />
        </div>
        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">{label}</span>
      </div>
      <div className="text-sm font-mono font-bold" style={{ color }}>
        {value}<span className="text-slate-500 ml-1">{unit}</span>
      </div>
    </div>
    <div className="relative h-1.5 bg-white/5 rounded-full overflow-visible flex items-center group">
      <div className="absolute left-0 h-full rounded-full pointer-events-none" style={{ width: `${((value - min) / (max - min)) * 100}%`, backgroundColor: color }} />
      <input 
        type="range" min={min} max={max} step={step} value={value}
        onChange={e => onChange(Number(e.target.value))}
        className="w-full absolute inset-0 opacity-0 cursor-pointer z-10"
        style={{ touchAction: 'none' }}
      />
      {/* Custom thumb */}
      <div 
        className="w-4 h-4 rounded-full bg-white border-2 shadow-[0_0_10px_rgba(0,0,0,0.5)] transition-transform group-hover:scale-125 absolute pointer-events-none"
        style={{ 
          borderColor: color,
          left: `calc(${((value - min) / (max - min)) * 100}% - 8px)`
        }}
      />
    </div>
  </div>
);

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

  const statusColor = isStable ? '#22c55e' : isMarginal ? '#f59e0b' : '#fb7185';
  const statusLabel = isStable ? 'STABLE' : isMarginal ? 'MARGINAL' : 'UNSTABLE';

  const qDyn = (0.5 * 1.225 * speed * speed * 0.514 * 0.514).toFixed(0);
  const tailVolume = (tailArea * tailArm) / (120 * 4); // rough approx
  const pitchAuth = (tailVolume * qDyn / 1000).toFixed(1);

  // SVG coordinates
  const W = 800, H = 400;
  const fuseX1 = 100, fuseX2 = 650;
  const fuseY = H / 2;
  
  const macStart = fuseX1 + 100;
  const macLen = 150;
  
  const npX = macStart + (NP_PCT / 100) * macLen;
  const cgX = macStart + (cgPct / 100) * macLen;

  // Pitching moment angle
  const pitchAngle = isStable ? clamp(staticMargin * 100, 0, 15) : clamp(staticMargin * 100, -15, 0);

  return (
    <div className="min-h-full bg-[var(--color-edu-navy)] p-6 lg:p-10 font-sans text-white">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="flex items-center gap-4 mb-2">
            <div className="w-12 h-12 rounded-2xl bg-[#22c55e]/10 border border-[#22c55e]/20 flex items-center justify-center text-[#22c55e]">
              <Activity size={24} />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Tail Stability Simulator</h1>
              <p className="text-slate-400 text-sm mt-1">Configure longitudinal stability parameters and visualize pitching moments.</p>
            </div>
          </div>
        </motion.div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[calc(100vh-200px)] min-h-[650px]">
          
          {/* Controls Panel */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}
            className="lg:col-span-3 flex flex-col gap-4"
          >
            {/* Status Card */}
            <div className="bg-[#0b1221] border border-white/5 rounded-2xl p-6 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent opacity-50" />
              <div className="absolute top-0 left-0 w-full h-1" style={{ backgroundColor: statusColor }} />
              
              <div className="relative z-10">
                <div className="text-[10px] font-mono tracking-widest text-slate-500 uppercase mb-1">Flight State</div>
                <div className="text-3xl font-black font-mono tracking-tight" style={{ color: statusColor }}>{statusLabel}</div>
                <div className="flex justify-between items-end mt-4">
                  <div>
                    <div className="text-[10px] text-slate-500 uppercase tracking-widest">Static Margin</div>
                    <div className="text-xl font-mono text-white">{smPct}<span className="text-sm text-slate-400 ml-1">%</span></div>
                  </div>
                  <div className="text-right">
                    <div className="text-[10px] text-slate-500 uppercase tracking-widest">Pitch Auth</div>
                    <div className="text-xl font-mono text-white">{pitchAuth}<span className="text-sm text-slate-400 ml-1">kNm</span></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Config Sliders */}
            <div className="bg-[#0b1221] border border-white/5 rounded-2xl p-6 flex-1 flex flex-col justify-center">
              <Slider label="CG Position" icon={GitCommit} value={cgPct} min={10} max={50} unit="%" onChange={setCgPct} color={statusColor} />
              <Slider label="Airspeed" icon={Wind} value={speed} min={100} max={450} step={5} unit=" kts" onChange={setSpeed} color="#38bdf8" />
              <Slider label="Tail Area" icon={Scaling} value={tailArea} min={10} max={40} unit=" m²" onChange={setTailArea} color="#a78bfa" />
              <Slider label="Tail Arm" icon={Ruler} value={tailArm} min={10} max={25} unit=" m" onChange={setTailArm} color="#f59e0b" />
            </div>

            {/* Info Snippet */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-5 text-xs text-slate-400 leading-relaxed">
              {isStable && "Aircraft exhibits positive static stability. A disturbance in pitch will naturally damp out without pilot input."}
              {isMarginal && "Neutral stability. The aircraft will not actively return to its trimmed state if disturbed. Requires constant attention."}
              {isUnstable && "Negative stability! The CG is behind the aerodynamic center. Pitch divergences will rapidly accelerate."}
            </div>
          </motion.div>

          {/* Visualization Canvas */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.15 }}
            className="lg:col-span-9 bg-[#0b1221] border border-white/5 rounded-2xl relative overflow-hidden flex flex-col"
          >
            {/* HUD Overlay Top */}
            <div className="absolute top-6 left-6 right-6 flex justify-between items-start z-20 pointer-events-none">
              <div className="flex gap-4">
                <div className="bg-black/40 backdrop-blur-md border border-white/10 rounded-lg px-4 py-2 font-mono text-[10px] text-[#38bdf8] tracking-widest uppercase flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#38bdf8] animate-pulse" /> Live Telemetry
                </div>
                <div className="bg-black/40 backdrop-blur-md border border-white/10 rounded-lg px-4 py-2 font-mono text-[10px] text-white tracking-widest">
                  MACH {(speed / 661).toFixed(2)}
                </div>
              </div>
              <div className="text-right">
                <div className="font-mono text-[10px] text-slate-500 tracking-widest uppercase mb-1">Tail Configuration</div>
                <div className="font-mono text-sm text-white border-b border-white/10 pb-1">V_T = {tailVolume.toFixed(3)}</div>
              </div>
            </div>

            {/* Interactive SVG Canvas */}
            <div className="flex-1 w-full relative select-none">
              <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid meet" className="w-full h-full absolute inset-0">
                <defs>
                  {/* Grid Pattern */}
                  <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                    <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="1"/>
                  </pattern>
                  <pattern id="gridLarge" width="200" height="200" patternUnits="userSpaceOnUse">
                    <rect width="200" height="200" fill="url(#grid)" />
                    <path d="M 200 0 L 0 0 0 200" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="1"/>
                  </pattern>
                  <radialGradient id="engineGlow" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="rgba(56,189,248,0.4)" />
                    <stop offset="100%" stopColor="transparent" />
                  </radialGradient>
                  <marker id="arrowMom" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
                    <path d="M0,0 L6,3 L0,6 Z" fill={statusColor} />
                  </marker>
                </defs>

                {/* Background Grid */}
                <rect width="100%" height="100%" fill="url(#gridLarge)" />

                {/* Horizon Line */}
                <line x1="0" y1={fuseY} x2={W} y2={fuseY} stroke="rgba(255,255,255,0.1)" strokeWidth="1" strokeDasharray="10 10" />

                <g transform={`rotate(${pitchAngle}, ${cgX}, ${fuseY})`} style={{ transition: 'transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)' }}>
                  
                  {/* --- Fuselage --- */}
                  <path 
                    d={`M${fuseX1},${fuseY} Q${fuseX1+50},${fuseY-35} ${fuseX1+200},${fuseY-35} L${fuseX2-100},${fuseY-20} Q${fuseX2},${fuseY-15} ${fuseX2+20},${fuseY-5} L${fuseX2+20},${fuseY+5} Q${fuseX2},${fuseY+10} ${fuseX2-100},${fuseY+15} L${fuseX1+200},${fuseY+25} Q${fuseX1+50},${fuseY+25} ${fuseX1},${fuseY}`}
                    fill="rgba(30, 41, 59, 0.8)" stroke="rgba(255,255,255,0.2)" strokeWidth="2" 
                  />
                  {/* Fuselage highlights */}
                  <path d={`M${fuseX1+20},${fuseY-5} Q${fuseX1+100},${fuseY-25} ${fuseX1+250},${fuseY-25}`} fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="2" />
                  
                  {/* Cockpit */}
                  <path d={`M${fuseX1+40},${fuseY-18} Q${fuseX1+80},${fuseY-32} ${fuseX1+120},${fuseY-30} Q${fuseX1+100},${fuseY-15} ${fuseX1+40},${fuseY-18}`} fill="rgba(56,189,248,0.2)" stroke="rgba(56,189,248,0.5)" strokeWidth="1" />

                  {/* --- Main Wing (Cross section representation) --- */}
                  <path 
                    d={`M${macStart+20},${fuseY-5} Q${macStart+50},${fuseY-25} ${macStart+120},${fuseY-5} Q${macStart+80},${fuseY+10} ${macStart+20},${fuseY-5}`}
                    fill="rgba(167, 139, 250, 0.15)" stroke="#a78bfa" strokeWidth="2"
                  />
                  
                  {/* --- Engine --- */}
                  <rect x={macStart+40} y={fuseY+10} width="60" height="20" rx="10" fill="#0f172a" stroke="rgba(255,255,255,0.2)" strokeWidth="1.5" />
                  <ellipse cx={macStart+40} cy={fuseY+20} rx="5" ry="10" fill="#38bdf8" opacity="0.8" />
                  <rect x={macStart-40} y={fuseY+5} width="80" height="30" fill="url(#engineGlow)" />

                  {/* --- Tail Section --- */}
                  {/* Vertical Stab */}
                  <path 
                    d={`M${fuseX2-80},${fuseY-18} L${fuseX2-40},${fuseY-90} L${fuseX2+10},${fuseY-90} L${fuseX2+15},${fuseY-10} Z`}
                    fill="rgba(34, 197, 94, 0.1)" stroke="#22c55e" strokeWidth="1.5"
                  />
                  {/* Horizontal Stab (scales with tailArea, moves with tailArm) */}
                  <g transform={`translate(${fuseX2 - 40 + (tailArm - 15) * 5}, 0) scale(${tailArea / 18})`}>
                    <path 
                      d={`M-30,${fuseY-5} Q0,${fuseY-15} 30,${fuseY-5} Q15,${fuseY+5} -30,${fuseY-5}`}
                      fill="rgba(34, 197, 94, 0.3)" stroke="#22c55e" strokeWidth="2"
                    />
                    {/* Elevator deflection based on pitch angle */}
                    <path 
                      d={`M15,${fuseY-8} L45,${fuseY - 8 + (pitchAngle * 1.5)} L30,${fuseY+2} Z`}
                      fill="rgba(255, 255, 255, 0.2)" stroke="rgba(255,255,255,0.5)" strokeWidth="1"
                    />
                  </g>
                  
                </g>

                {/* --- Annotations (Fixed to grid, not rotated with plane) --- */}
                
                {/* MAC Bar */}
                <line x1={macStart} y1={fuseY + 80} x2={macStart + macLen} y2={fuseY + 80} stroke="rgba(255,255,255,0.3)" strokeWidth="4" />
                <line x1={macStart} y1={fuseY + 75} x2={macStart} y2={fuseY + 85} stroke="rgba(255,255,255,0.5)" strokeWidth="2" />
                <line x1={macStart + macLen} y1={fuseY + 75} x2={macStart + macLen} y2={fuseY + 85} stroke="rgba(255,255,255,0.5)" strokeWidth="2" />
                <text x={macStart + macLen/2} y={fuseY + 95} textAnchor="middle" fill="rgba(255,255,255,0.4)" fontSize="10" fontFamily="monospace">MEAN AERODYNAMIC CHORD</text>

                {/* NP Marker (Neutral Point) */}
                <line x1={npX} y1={fuseY - 120} x2={npX} y2={fuseY + 70} stroke="#38bdf8" strokeWidth="1" strokeDasharray="4 4" opacity="0.6" />
                <circle cx={npX} cy={fuseY} r="6" fill="#0b1221" stroke="#38bdf8" strokeWidth="2" />
                <text x={npX} y={fuseY - 130} textAnchor="middle" fill="#38bdf8" fontSize="12" fontWeight="bold" fontFamily="monospace">NP</text>

                {/* CG Marker */}
                <g style={{ transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)' }}>
                  <line x1={cgX} y1={fuseY - 120} x2={cgX} y2={fuseY + 70} stroke={statusColor} strokeWidth="1.5" />
                  <circle cx={cgX} cy={fuseY} r="8" fill={statusColor} opacity="0.2" />
                  <circle cx={cgX} cy={fuseY} r="4" fill={statusColor} />
                  <rect x={cgX - 15} y={fuseY - 142} width="30" height="16" rx="4" fill={statusColor} opacity="0.1" stroke={statusColor} strokeWidth="1" />
                  <text x={cgX} y={fuseY - 130} textAnchor="middle" fill={statusColor} fontSize="12" fontWeight="bold" fontFamily="monospace">CG</text>
                </g>

                {/* Static Margin Visual Zone */}
                {isStable ? (
                  <rect x={cgX} y={fuseY + 60} width={npX - cgX} height="8" fill="url(#grid)" stroke={statusColor} strokeWidth="1" opacity="0.5" style={{ transition: 'all 0.5s ease' }} />
                ) : (
                  <rect x={npX} y={fuseY + 60} width={cgX - npX} height="8" fill="rgba(251,113,133,0.2)" stroke="#fb7185" strokeWidth="1" style={{ transition: 'all 0.5s ease' }} />
                )}

                {/* Pitch Moment Arc */}
                {pitchAngle !== 0 && (
                  <g transform={`translate(${cgX}, ${fuseY})`} style={{ transition: 'all 0.5s ease' }}>
                    <path 
                      d={pitchAngle > 0 
                        ? `M -40,-40 A 56 56 0 0 1 40,-40` 
                        : `M 40,-40 A 56 56 0 0 0 -40,-40`}
                      fill="none" stroke={statusColor} strokeWidth="2" strokeDasharray="4 4" markerEnd="url(#arrowMom)"
                    />
                    <text x="0" y="-60" textAnchor="middle" fill={statusColor} fontSize="10" fontFamily="monospace">
                      {pitchAngle > 0 ? "RESTORING MOMENT" : "DIVERGING MOMENT"}
                    </text>
                  </g>
                )}
                
              </svg>
            </div>

            {/* Bottom Telemetry Bar */}
            <div className="h-16 border-t border-white/5 bg-white/[0.02] flex items-center px-6 gap-8 z-10">
              <div className="flex-1 flex justify-between">
                {[
                  { label: 'Lift Coefficient (CL)', val: '0.45', c: '#fff' },
                  { label: 'Dynamic Pressure', val: `${(qDyn/1000).toFixed(2)} kPa`, c: '#38bdf8' },
                  { label: 'Pitch Rate (q)', val: `${pitchAngle > 0 ? '-' : '+'}${(Math.abs(pitchAngle)*0.1).toFixed(2)}°/s`, c: statusColor },
                ].map(m => (
                  <div key={m.label} className="flex flex-col">
                    <span className="text-[9px] uppercase tracking-widest text-slate-500 font-mono">{m.label}</span>
                    <span className="text-sm font-mono font-bold" style={{ color: m.c }}>{m.val}</span>
                  </div>
                ))}
              </div>
            </div>

          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default TailLab;
