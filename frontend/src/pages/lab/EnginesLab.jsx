import React, { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Zap, ArrowLeft, TrendingUp, Wind, Thermometer, Settings } from 'lucide-react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine, Legend
} from 'recharts';

// ── Thermodynamic Engine Model ────────────────────────────────────────────────
const computeEnginePerf = (bpr, thrustSetting, altKm, mach) => {
  // Atmosphere model (ISA)
  const T0 = 288.15;
  const P0 = 101325;
  const lapseRate = altKm <= 11 ? 6.5 : 0; // K/km
  const T = T0 - lapseRate * altKm;
  const P = P0 * Math.pow(T / T0, 5.256);
  const rho = P / (287.05 * T);
  const a = Math.sqrt(1.4 * 287.05 * T);
  const V0 = mach * a;

  // Simple BPR thrust model
  const thrustFrac = thrustSetting / 100;
  const seaLevelThrust = 320000; // N (typical large turbofan at TO)
  const altitudeFactor = rho / 1.225;
  const machFactor = 1 - 0.1 * mach;
  const grossThrust = seaLevelThrust * thrustFrac * altitudeFactor * machFactor;
  const ramDrag = rho * V0 * 250 * thrustFrac;
  const netThrust = Math.max(0, grossThrust - ramDrag);

  // Propulsive efficiency
  const veEst = 320 - bpr * 9;
  const propEff = V0 > 0 ? Math.min(0.98, (2 * V0) / (veEst + V0)) : 0;

  // TSFC model (kg/N·h) — improves with BPR, worsens with low altitude (dense air)
  const tsfc = (0.058 - bpr * 0.0018 + mach * 0.014) * thrustFrac;

  // Thrust-to-weight (engine only, ~7500 kg engine)
  const engineWeight = 75000; // N
  const tw = netThrust / engineWeight;

  // Fuel burn (kg/s)
  const fuelBurn = (netThrust * tsfc) / 3600;

  // EGT estimate (°C)
  const egt = 450 + thrustFrac * 380 - altKm * 12 - bpr * 8;

  return {
    netThrust: Math.round(netThrust / 1000), // kN
    propEff: (propEff * 100).toFixed(1),
    tsfc: tsfc.toFixed(5),
    tw: tw.toFixed(2),
    fuelBurn: fuelBurn.toFixed(2),
    egt: Math.round(egt),
    pressure: (P / 1000).toFixed(1),
    temperature: Math.round(T),
  };
};

// Build Mach sweep chart data
const buildMachSweep = (bpr, thrustSetting, altKm) => {
  const data = [];
  for (let m = 0.1; m <= 0.95; m = +(m + 0.05).toFixed(2)) {
    const p = computeEnginePerf(bpr, thrustSetting, altKm, m);
    data.push({
      mach: m,
      thrust: p.netThrust,
      propEff: parseFloat(p.propEff),
      tsfc: parseFloat(p.tsfc) * 10000,
    });
  }
  return data;
};

// ── Metric Card ───────────────────────────────────────────────────────────────
// ── Animated Turbofan SVG Component ───────────────────────────────────────────
const TurbofanSVG = ({ thrustSetting, mach }) => {
  // Compute visual properties based on engine parameters
  // Spin speed is derived from thrust setting and mach (simulating N1 spool speed)
  const spinDuration = Math.max(0.2, 2.0 - (thrustSetting / 100) * 1.5 - (mach * 0.3));
  
  // Combustion glow intensity based on thrust setting
  const coreGlowOpacity = 0.2 + (thrustSetting / 100) * 0.8;
  const coreGlowColor = thrustSetting > 85 ? '#ef4444' : '#f59e0b';
  const exhaustVelocity = 1 + (thrustSetting / 100);

  return (
    <div className="relative w-full aspect-[2/1] bg-black/40 rounded-3xl border border-white/10 overflow-hidden flex items-center justify-center p-8 shadow-2xl backdrop-blur-md">
      {/* Decorative Grid */}
      <div className="absolute inset-0 edu-grid-bg opacity-10 pointer-events-none" />
      
      {/* Exhaust Particle Simulation CSS (Inline for simplicity) */}
      <style>{`
        @keyframes spin-fan {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes pulse-exhaust {
          0% { transform: scaleX(1) translateX(0); opacity: 0.8; }
          50% { transform: scaleX(1.1) translateX(10px); opacity: 1; }
          100% { transform: scaleX(1) translateX(0); opacity: 0.8; }
        }
        .animate-fan {
          transform-origin: 300px 200px;
          animation: spin-fan ${spinDuration}s linear infinite;
        }
        .animate-exhaust {
          transform-origin: 700px 200px;
          animation: pulse-exhaust ${spinDuration * 0.5}s ease-in-out infinite;
        }
      `}</style>

      <svg viewBox="0 0 800 400" className="w-full h-full drop-shadow-2xl">
        <defs>
          <linearGradient id="engine-body" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#334155" />
            <stop offset="50%" stopColor="#94a3b8" />
            <stop offset="100%" stopColor="#1e293b" />
          </linearGradient>
          <linearGradient id="core-glow" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="transparent" />
            <stop offset="50%" stopColor={coreGlowColor} stopOpacity={coreGlowOpacity} />
            <stop offset="100%" stopColor="#ef4444" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="exhaust-stream" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor={coreGlowColor} stopOpacity={coreGlowOpacity * 0.8} />
            <stop offset="100%" stopColor="transparent" stopOpacity="0" />
          </linearGradient>
          <filter id="glow-filter" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="15" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Outer Nacelle (Cutaway) */}
        <path d="M 100,100 Q 400,50 700,120 L 700,130 Q 400,60 100,110 Z" fill="url(#engine-body)" />
        <path d="M 100,300 Q 400,350 700,280 L 700,270 Q 400,340 100,290 Z" fill="url(#engine-body)" />
        
        {/* Bypass Duct Background */}
        <rect x="150" y="110" width="550" height="180" fill="#0f172a" opacity="0.8" />
        
        {/* Core Engine Body */}
        <path d="M 350,150 L 650,160 L 650,240 L 350,250 Z" fill="#1e293b" stroke="#475569" strokeWidth="2" />
        
        {/* Combustion Chamber Glow */}
        <rect x="450" y="162" width="180" height="76" fill="url(#core-glow)" filter="url(#glow-filter)" />
        
        {/* High Pressure Compressor Blades (Static Representation) */}
        {[...Array(6)].map((_, i) => (
          <rect key={i} x={380 + i * 15} y="155" width="4" height="90" fill="#cbd5e1" opacity="0.6" />
        ))}
        
        {/* High Pressure Turbine Blades */}
        {[...Array(3)].map((_, i) => (
          <rect key={`t${i}`} x={580 + i * 20} y="155" width="6" height="90" fill="#94a3b8" />
        ))}

        {/* Exhaust Stream (Animated) */}
        <path 
          d={`M 650,160 Q 750,${160 - 20 * exhaustVelocity} 850,180 L 850,220 Q 750,${240 + 20 * exhaustVelocity} 650,240 Z`} 
          fill="url(#exhaust-stream)" 
          className="animate-exhaust"
          filter="url(#glow-filter)"
        />

        {/* Intake Airflow Arrows */}
        <g opacity="0.3">
          <path d="M 20,180 L 120,180 M 100,170 L 120,180 L 100,190" stroke="#38bdf8" strokeWidth="3" fill="none" />
          <path d="M 20,220 L 120,220 M 100,210 L 120,220 L 100,230" stroke="#38bdf8" strokeWidth="3" fill="none" />
        </g>

        {/* Massive Fan Blades (Animated) */}
        <g className="animate-fan">
          <circle cx="300" cy="200" r="30" fill="#334155" />
          {[...Array(12)].map((_, i) => {
            const angle = (i * 30 * Math.PI) / 180;
            return (
              <path
                key={`fan${i}`}
                d="M 300,200 L 320,110 Q 300,100 280,110 Z"
                fill="#94a3b8"
                transform={`rotate(${i * 30}, 300, 200)`}
                stroke="#0f172a"
                strokeWidth="1"
              />
            );
          })}
          <circle cx="300" cy="200" r="15" fill="#e2e8f0" />
        </g>

        {/* Centerline Axis */}
        <line x1="80" y1="200" x2="750" y2="200" stroke="#38bdf8" strokeWidth="1" strokeDasharray="10 5" opacity="0.4" />
      </svg>
      
      {/* Overlay Stats */}
      <div className="absolute top-6 right-6 flex flex-col items-end gap-2 pointer-events-none">
        <div className="bg-black/50 backdrop-blur px-4 py-2 rounded-xl border border-white/10 font-mono text-xs text-[#38bdf8] uppercase tracking-widest">
          N1 Spool: {(thrustSetting * 1.1).toFixed(1)}% RPM
        </div>
        <div className="bg-black/50 backdrop-blur px-4 py-2 rounded-xl border border-white/10 font-mono text-xs text-[#ef4444] uppercase tracking-widest">
          Core Temp: {450 + Math.round(thrustSetting * 3.8)} °C
        </div>
      </div>
    </div>
  );
};

// ── Metric Card ───────────────────────────────────────────────────────────────
const MetricCard = ({ label, value, unit, color, sub }) => (
  <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 14, padding: '14px 16px', backdropFilter: 'blur(10px)' }}>
    <div style={{ fontFamily: 'monospace', fontSize: 10, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'rgba(180,195,220,0.5)', marginBottom: 6 }}>{label}</div>
    <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
      <span style={{ fontSize: 28, fontWeight: 900, color, textShadow: `0 0 20px ${color}40` }}>{value}</span>
      <span style={{ fontFamily: 'monospace', fontSize: 12, color: 'rgba(180,195,220,0.5)' }}>{unit}</span>
    </div>
    {sub && <div style={{ fontFamily: 'monospace', fontSize: 10, color: 'rgba(180,195,220,0.4)', marginTop: 4 }}>{sub}</div>}
  </div>
);

// ── Main Component ────────────────────────────────────────────────────────────
const EnginesLab = () => {
  const navigate = useNavigate();

  const [bpr, setBpr] = useState(8);
  const [thrustSetting, setThrustSetting] = useState(85);
  const [altKm, setAltKm] = useState(10.5);
  const [mach, setMach] = useState(0.82);
  const [activeChart, setActiveChart] = useState('thrust');

  const perf = useMemo(() => computeEnginePerf(bpr, thrustSetting, altKm, mach), [bpr, thrustSetting, altKm, mach]);
  const chartData = useMemo(() => buildMachSweep(bpr, thrustSetting, altKm), [bpr, thrustSetting, altKm]);

  const charts = {
    thrust: { key: 'thrust', label: 'Net Thrust (kN)', color: '#fb923c', stroke: '#fb923c' },
    propEff: { key: 'propEff', label: 'Propulsive Efficiency (%)', color: '#22c55e', stroke: '#22c55e' },
    tsfc: { key: 'tsfc', label: 'TSFC ×10⁻⁴ (kg/N·h)', color: '#a78bfa', stroke: '#a78bfa' },
  };

  const chart = charts[activeChart];

  const SLIDERS = [
    { label: 'Bypass Ratio (BPR)', min: 1, max: 14, step: 0.5, value: bpr, set: setBpr, unit: ':1', color: '#fb923c' },
    { label: 'Thrust Setting', min: 20, max: 100, step: 1, value: thrustSetting, set: setThrustSetting, unit: '%', color: '#f59e0b' },
    { label: 'Altitude', min: 0, max: 13, step: 0.5, value: altKm, set: setAltKm, unit: 'km', color: '#38bdf8' },
    { label: 'Mach Number', min: 0.1, max: 0.95, step: 0.01, value: mach, set: setMach, unit: 'M', color: '#22c55e' },
  ];

  return (
    <div className="min-h-full bg-[#050810] text-white p-6 lg:p-10 font-sans">
      <div className="max-w-[1400px] mx-auto space-y-8">
        
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between bg-white/5 border border-white/10 p-6 rounded-3xl backdrop-blur-md">
          <div className="flex items-center gap-6">
            <div className="w-16 h-16 rounded-2xl bg-[#fb923c]/20 border border-[#fb923c]/40 flex items-center justify-center text-[#fb923c] shadow-[0_0_30px_rgba(251,146,60,0.3)]">
              <Zap size={32} />
            </div>
            <div>
              <div className="flex items-center gap-2 font-mono text-xs tracking-widest uppercase text-[#fb923c] mb-2">
                <Link to="/explore/engines" className="hover:underline">Engines</Link>
                <span className="opacity-40">/</span>
                <span>Command Center</span>
              </div>
              <h1 className="text-3xl lg:text-4xl font-black m-0 tracking-tight">Turbofan Laboratory</h1>
            </div>
          </div>
          <Link to="/lab" className="hidden lg:flex items-center gap-2 px-6 py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-colors font-semibold text-sm">
            <ArrowLeft size={16} /> Exit Lab
          </Link>
        </motion.div>

        {/* ── Main Engine Visualization ── */}
        <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 }}>
          <TurbofanSVG thrustSetting={thrustSetting} mach={mach} />
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* ── Left: Controls Panel ── */}
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }} className="lg:col-span-4 space-y-6">
            <div className="bg-white/5 border border-white/10 rounded-3xl p-6 lg:p-8 backdrop-blur-xl shadow-2xl">
              <div className="flex items-center gap-2 font-mono text-xs tracking-widest uppercase text-white/50 mb-8 border-b border-white/10 pb-4">
                <Settings size={14} /> Control Parameters
              </div>

              {SLIDERS.map(sl => (
                <div key={sl.label} className="mb-8 last:mb-0">
                  <div className="flex justify-between items-end font-mono text-xs mb-3">
                    <span className="text-white/60 uppercase tracking-wider">{sl.label}</span>
                    <span className="font-bold text-lg" style={{ color: sl.color, textShadow: `0 0 10px ${sl.color}40` }}>
                      {sl.value}<span className="text-[10px] ml-1">{sl.unit}</span>
                    </span>
                  </div>
                  <input
                    type="range" min={sl.min} max={sl.max} step={sl.step} value={sl.value}
                    onChange={e => sl.set(Number(e.target.value))}
                    className="w-full h-2 rounded-full appearance-none bg-white/10 outline-none cursor-pointer"
                    style={{
                      backgroundImage: `linear-gradient(${sl.color}, ${sl.color})`,
                      backgroundSize: `${((sl.value - sl.min) / (sl.max - sl.min)) * 100}% 100%`,
                      backgroundRepeat: 'no-repeat'
                    }}
                  />
                </div>
              ))}

              {/* Atmosphere readout */}
              <div className="mt-8 p-4 bg-[#38bdf8]/10 border border-[#38bdf8]/20 rounded-2xl">
                <div className="flex items-center gap-2 font-mono text-xs tracking-widest uppercase text-[#38bdf8] mb-3">
                  <Thermometer size={14} /> ISA Atmosphere ({altKm} km)
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="font-mono text-xs text-white/60">Temp: <span className="text-[#38bdf8] font-bold text-sm">{perf.temperature} K</span></div>
                  <div className="font-mono text-xs text-white/60">Press: <span className="text-[#38bdf8] font-bold text-sm">{perf.pressure} kPa</span></div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* ── Right: Telemetry & Output ── */}
          <div className="lg:col-span-8 flex flex-col gap-6">
            
            {/* Live metrics grid */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <MetricCard label="Net Thrust" value={perf.netThrust} unit="kN" color="#fb923c" sub={`At M ${mach} · ${altKm} km`} />
              <MetricCard label="Propulsive Eff." value={perf.propEff} unit="%" color="#22c55e" sub={`BPR ${bpr}:1`} />
              <MetricCard label="TSFC" value={perf.tsfc} unit="kg/N·h" color="#a78bfa" sub="Fuel burn rate" />
              <MetricCard label="Thrust/Weight" value={perf.tw} unit="" color="#38bdf8" sub="Engine T/W ratio" />
            </motion.div>

            {/* EGT gauge & Charts */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="flex-1 bg-white/5 border border-white/10 rounded-3xl p-6 lg:p-8 backdrop-blur-xl flex flex-col">
              
              {/* EGT Status */}
              <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-5 mb-8">
                <div className="flex justify-between items-center mb-4">
                  <div className="font-mono text-xs tracking-widest uppercase text-red-400">Exhaust Gas Temp (EGT)</div>
                  {perf.egt > 750 && (
                    <div className="animate-pulse bg-red-500/20 text-red-400 border border-red-500/40 px-3 py-1 rounded-full font-mono text-[10px] font-bold">
                      ⚠ CRITICAL LIMIT
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-6">
                  <div className={`text-4xl font-black ${perf.egt > 750 ? 'text-red-500' : 'text-orange-400'} drop-shadow-md`}>
                    {perf.egt}°C
                  </div>
                  <div className="flex-1 h-3 bg-black/40 rounded-full overflow-hidden border border-white/10">
                    <div 
                      className={`h-full transition-all duration-500 ${perf.egt > 750 ? 'bg-red-500' : 'bg-gradient-to-r from-orange-400 to-red-400'}`} 
                      style={{ width: `${Math.min(100, (perf.egt / 900) * 100)}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Mach Sweep Chart */}
              <div className="flex-1 flex flex-col">
                <div className="flex justify-between items-center mb-6">
                  <div className="flex items-center gap-2 font-mono text-xs tracking-widest uppercase text-white/50">
                    <TrendingUp size={14} /> Performance Envelope
                  </div>
                  <div className="flex gap-2">
                    {Object.entries(charts).map(([key, c]) => (
                      <button 
                        key={key} 
                        onClick={() => setActiveChart(key)}
                        className="font-mono text-[10px] tracking-wider uppercase px-4 py-2 rounded-xl border transition-all"
                        style={{ 
                          border: `1px solid ${activeChart === key ? c.color + '60' : 'rgba(255,255,255,0.08)'}`, 
                          background: activeChart === key ? `${c.color}15` : 'rgba(0,0,0,0.2)', 
                          color: activeChart === key ? c.color : 'rgba(180,195,220,0.4)',
                          boxShadow: activeChart === key ? `0 0 15px ${c.color}20` : 'none'
                        }}
                      >
                        {key === 'thrust' ? 'Thrust' : key === 'propEff' ? 'Efficiency' : 'TSFC'}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="flex-1 min-h-[250px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                      <XAxis dataKey="mach" stroke="rgba(255,255,255,0.2)" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11, fontFamily: 'monospace' }} tickLine={false} axisLine={false} tickFormatter={v => `M${v.toFixed(1)}`} />
                      <YAxis stroke="rgba(255,255,255,0.2)" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11, fontFamily: 'monospace' }} tickLine={false} axisLine={false} />
                      <Tooltip 
                        contentStyle={{ background: 'rgba(10,15,28,0.95)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, fontFamily: 'monospace', fontSize: 12, boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }} 
                        labelFormatter={v => `Mach ${v.toFixed(2)}`} 
                      />
                      <ReferenceLine x={mach} stroke={chart.color} strokeDasharray="3 3" opacity={0.5} label={{ position: 'top', value: 'CURRENT', fill: chart.color, fontSize: 10, fontFamily: 'monospace' }} />
                      <Line type="monotone" dataKey={chart.key} stroke={chart.stroke} strokeWidth={3} dot={false} activeDot={{ r: 6, fill: chart.color, stroke: '#000', strokeWidth: 2 }} isAnimationActive />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnginesLab;
