import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, GitCommit, Wind, Activity, Ruler, Scaling, Layers } from 'lucide-react';
import { useAcademy } from '../../context/AcademyContext';
import ThreeDPlane from '../../features/flight-lab/components/ThreeDPlane';

const clamp = (v, min, max) => Math.min(max, Math.max(min, v));

const ModernSlider = ({ value, min, max, onChange, label, unit, color }) => {
  const trackRef = useRef(null);
  const handlePointer = (e) => {
    if (!trackRef.current) return;
    const rect = trackRef.current.getBoundingClientRect();
    const percent = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const val = min + percent * (max - min);
    onChange(Math.round(val));
  };
  const percent = ((value - min) / (max - min)) * 100;
  return (
    <div className="group relative w-full mb-4 select-none touch-none">
      <div className="flex justify-between text-[11px] font-mono mb-2 uppercase tracking-widest text-slate-400">
        <span>{label}</span>
        <span style={{color}} className="font-bold text-sm shadow-sm">{value} <span className="text-[10px] text-slate-500">{unit}</span></span>
      </div>
      <div 
        ref={trackRef}
        onPointerDown={(e) => { trackRef.current.setPointerCapture(e.pointerId); handlePointer(e); }}
        onPointerMove={(e) => { if (trackRef.current?.hasPointerCapture(e.pointerId)) handlePointer(e); }}
        className="relative h-6 bg-slate-900/90 rounded-md cursor-pointer border border-white/10 overflow-hidden backdrop-blur-md shadow-inner"
      >
        <div 
          className="absolute top-0 left-0 h-full transition-all duration-75 ease-out"
          style={{ width: `${percent}%`, background: `linear-gradient(90deg, transparent, ${color}60)`, borderRight: `3px solid ${color}`, boxShadow: `0 0 20px ${color}80` }}
        />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iMTAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3QgeD0iMCIgeT0iNCIgd2lkdGg9IjIiIGhlaWdodD0iMiIgZmlsbD0iI2ZmZmZmZjIwIi8+PC9zdmc+')] opacity-20 pointer-events-none" />
      </div>
    </div>
  );
};



const ForcesLab = ({ language }) => {
  const [thrust, setThrust] = useState(50);
  const [drag, setDrag] = useState(50);
  
  // Calculate dynamic lift based on thrust (speed)
  const lift = Math.min(150, 30 + thrust * 1.2);
  const weight = 100;

  const t = {
    title: { en: "Interactive Forces Lab", ar: "مختبر القوى التفاعلي" },
    desc: { en: "Increase thrust to see how the aircraft accelerates, generating lift until it overcomes weight and takes off.", ar: "قم بزيادة الدفع لترى كيف تتسارع الطائرة، وتولد الرفع حتى تتغلب على الوزن وتقلع." },
    lift: { en: "Lift", ar: "الرفع" },
    weight: { en: "Weight", ar: "الوزن" },
    thrust: { en: "Thrust", ar: "الدفع" },
    drag: { en: "Drag", ar: "السحب" },
    status: { en: "Flight Status", ar: "حالة الطيران" },
    parked: { en: "Parked / Taxiing", ar: "متوقفة / تتحرك على المدرج" },
    takeoff: { en: "Taking Off!", ar: "تقلع!" },
    climbing: { en: "Climbing", ar: "تصعد" },
  };

  let statusText = t.parked[language];
  let statusColor = "text-slate-400";
  let pitch = 0;
  
  if (lift > weight + 10) {
    statusText = t.climbing[language];
    statusColor = "text-sky-400";
    pitch = 15;
  } else if (lift > weight) {
    statusText = t.takeoff[language];
    statusColor = "text-emerald-400";
    pitch = 10;
  }

  return (
    <div className="w-full max-w-6xl mx-auto my-16 bg-black/40 backdrop-blur-2xl rounded-2xl overflow-hidden border border-white/10 shadow-2xl flex flex-col">
      <div className="p-8 text-center border-b border-white/10">
        <h3 className="text-3xl font-bold text-white mb-2">{t.title[language]}</h3>
        <p className="text-slate-400">{t.desc[language]}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3">
        {/* 3D View */}
        <div className="relative w-full h-[300px] lg:h-[500px] lg:col-span-2 bg-transparent cursor-grab">
          <ThreeDPlane pitch={pitch} roll={0} yaw={0} showRunway={false} showForces={true} showAirflow={thrust > 20} />
          
          <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-md p-4 rounded-xl border border-white/10">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">{t.status[language]}</div>
            <div className={`text-xl font-black ${statusColor}`}>{statusText}</div>
          </div>
        </div>

        {/* Controls */}
        <div className={`bg-black/20 backdrop-blur-xl p-8 flex flex-col justify-center space-y-8 ${language === 'ar' ? 'text-right' : ''}`}>
          <div>
            <ModernSlider label={t.thrust[language]} unit="%" min={0} max={100} value={thrust} onChange={(v) => { setThrust(v); setDrag(v * 0.8); }} color="#0ea5e9" />
            <p className="text-xs text-slate-500 mt-2">{language === 'ar' ? 'يولد سرعة أمامية.' : 'Generates forward speed.'}</p>
          </div>
          <div>
            <ModernSlider label={t.drag[language]} unit="%" min={0} max={100} value={drag} onChange={() => {}} color="#f59e0b" />
            <p className="text-xs text-slate-500 mt-2">{language === 'ar' ? 'تزداد المقاومة مع زيادة السرعة (الدفع).' : 'Resistance increases with speed (thrust).'}</p>
          </div>
          <div className="h-px bg-white/10 w-full my-2"></div>
          <div>
            <ModernSlider label={t.lift[language]} unit="%" min={0} max={150} value={lift} onChange={() => {}} color="#10b981" />
            <p className="text-xs text-slate-500 mt-2">{language === 'ar' ? 'ينتج عن السرعة. يجب أن يتجاوز الوزن للإقلاع.' : 'Generated by speed. Must overcome weight to fly.'}</p>
          </div>
          <div>
            <ModernSlider label={t.weight[language]} unit="%" min={0} max={150} value={weight} onChange={() => {}} color="#ef4444" />
            <p className="text-xs text-slate-500 mt-2">{language === 'ar' ? 'الجاذبية المستمرة للأسفل.' : 'Constant downward pull.'}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

const InteractiveAxes = ({ language }) => {
  const [pitch, setPitch] = useState(0);
  const [roll, setRoll] = useState(0);
  const [yaw, setYaw] = useState(0);

  const t = {
    title: { en: "Interactive 3D Aircraft Axes", ar: "محاور الطائرة ثلاثية الأبعاد" },
    desc: { en: "Drag to rotate the camera. Use sliders to move control surfaces.", ar: "اسحب لتدوير الكاميرا. استخدم أشرطة التمرير لتحريك أسطح التحكم." },
    pitch: { en: "Pitch (Elevators)", ar: "الانحدار (الروافع)" },
    roll: { en: "Roll (Ailerons)", ar: "الدحرجة (الجنيحات)" },
    yaw: { en: "Yaw (Rudder)", ar: "الانحراف (الدفة)" }
  };

  return (
    <div className="w-full max-w-6xl mx-auto my-8 bg-black/40 backdrop-blur-2xl rounded-2xl overflow-hidden border border-white/10 shadow-2xl flex flex-col">
      <div className="p-8 text-center border-b border-white/10">
        <h3 className="text-3xl font-bold text-white mb-2">{t.title[language]}</h3>
        <p className="text-slate-400">{t.desc[language]}</p>
      </div>
      <div className="relative w-full h-[300px] md:h-[400px] lg:h-[600px] bg-transparent cursor-grab">
        <ThreeDPlane pitch={pitch} roll={roll} yaw={yaw} showAirflow={false} />
      </div>
      <div className={`bg-black/20 backdrop-blur-xl p-8 grid grid-cols-1 md:grid-cols-3 gap-8 ${language === 'ar' ? 'flex-row-reverse text-right' : ''}`}>
        <div className="flex flex-col items-center gap-4">
          <label className="text-sky-400 font-bold text-lg">{t.pitch[language]}</label>
          <input type="range" min="-45" max="45" value={pitch} onChange={(e) => setPitch(Number(e.target.value))} className="w-full accent-sky-500" />
          <span className="text-slate-400 font-mono text-xl" dir="ltr">{pitch}°</span>
        </div>
        <div className="flex flex-col items-center gap-4">
          <label className="text-emerald-400 font-bold text-lg">{t.roll[language]}</label>
          <input type="range" min="-90" max="90" value={roll} onChange={(e) => setRoll(Number(e.target.value))} className="w-full accent-emerald-500" />
          <span className="text-slate-400 font-mono text-xl" dir="ltr">{roll}°</span>
        </div>
        <div className="flex flex-col items-center gap-4">
          <label className="text-amber-400 font-bold text-lg">{t.yaw[language]}</label>
          <input type="range" min="-45" max="45" value={yaw} onChange={(e) => setYaw(Number(e.target.value))} className="w-full accent-amber-500" />
          <span className="text-slate-400 font-mono text-xl" dir="ltr">{yaw}°</span>
        </div>
      </div>
    </div>
  );
};

const Slider = ({ label, icon: Icon, value, min, max, step = 1, unit, onChange, color }) => (
  <div className="mb-6">
    <div className="flex justify-between items-center mb-3">
      <div className="flex items-center gap-2">
        <div className="w-6 h-6 rounded-md flex items-center justify-center border" style={{ background: `${color}15`, color, borderColor: `${color}30` }}>
          <Icon size={14} />
        </div>
        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">{label}</span>
      </div>
      <div className="text-sm font-mono font-bold" style={{ color, textShadow: `0 0 10px ${color}50` }}>
        {value}<span className="text-slate-500 ml-1">{unit}</span>
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

const TelemetryBox = ({ label, value, color }) => (
  <div className="flex flex-col">
    <span className="text-[9px] uppercase tracking-widest text-slate-500 font-mono mb-1">{label}</span>
    <span className="text-lg font-mono font-bold" style={{ color, textShadow: `0 0 10px ${color}50` }}>{value}</span>
  </div>
);

const TailLab = () => {
  const academyCtx = useAcademy();
  const language = academyCtx?.language || 'en';
  const [cgPct, setCgPct] = useState(28);
  const [speed, setSpeed] = useState(250);
  const [tailArea, setTailArea] = useState(18);
  const [tailArm, setTailArm] = useState(14);
  const [highFidelity, setHighFidelity] = useState(true);

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
  
  const tailCenter = fuseX2 - 40 + (tailArm - 15) * 5;

  // Pitching moment angle
  const pitchAngle = isStable ? clamp(staticMargin * 100, 0, 15) : clamp(staticMargin * 100, -15, 0);

  // Aerodynamic force scaling
  const dynamicForceScale = (speed / 250);
  
  // Forces: Lift is always up (at NP). Weight is always down (at CG). Tail force is restoring (depends on pitch).
  const liftMagnitude = 80 * dynamicForceScale;
  const weightMagnitude = 80;
  const tailForceMagnitude = Math.abs(pitchAngle) * 3 * dynamicForceScale;

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
                <div className="w-8 h-8 rounded-lg bg-[#22c55e]/20 text-[#22c55e] flex items-center justify-center border border-[#22c55e]/30 shadow-[0_0_15px_rgba(34,197,94,0.3)]">
                  <Activity size={18} />
                </div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">Stability Lab</h1>
              </div>
              <p className="text-slate-400 text-xs mt-1 font-mono uppercase tracking-widest">Aero-Structural Command Center</p>
            </div>
          </div>
          
          <button 
            onClick={() => setHighFidelity(!highFidelity)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-all duration-300 font-mono text-xs uppercase tracking-widest ${
              highFidelity 
                ? 'bg-purple-500/20 border-purple-500/50 text-purple-300 shadow-[0_0_20px_rgba(168,85,247,0.2)]' 
                : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10'
            }`}
          >
            <Layers size={14} className={highFidelity ? "animate-pulse" : ""} />
            {highFidelity ? 'High-Fi Active' : 'Low-Fi Mode'}
          </button>
        </motion.div>

        {/* 1st: Interactive 3D Aircraft Axes */}
        <div className="mb-12">
          <InteractiveAxes language={language || 'en'} />
        </div>

        {/* 2nd: Main Grid (CG Point One) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-auto lg:h-[calc(100vh-160px)] min-h-[700px]">
          
          {/* Controls Panel */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}
            className="lg:col-span-3 flex flex-col gap-4"
          >
            {/* Status Card */}
            <div className="bg-black/40 backdrop-blur-2xl border border-white/10 rounded-2xl p-6 relative overflow-hidden shadow-2xl">
              <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent opacity-50" />
              <div className="absolute top-0 left-0 w-full h-1" style={{ backgroundColor: statusColor, boxShadow: `0 0 20px ${statusColor}` }} />
              
              <div className="relative z-10">
                <div className="text-[10px] font-mono tracking-widest text-slate-500 uppercase mb-1 flex items-center gap-2">
                  <Activity size={12} style={{ color: statusColor }} className="animate-pulse"/> Flight State
                </div>
                <div className="text-3xl font-black font-mono tracking-tight" style={{ color: statusColor, textShadow: `0 0 15px ${statusColor}80` }}>{statusLabel}</div>
                
                <div className="flex justify-between items-end mt-6 pt-4 border-t border-white/10">
                  <div>
                    <div className="text-[9px] text-slate-500 uppercase tracking-widest mb-1">Static Margin</div>
                    <div className="text-xl font-mono font-bold text-white tracking-wider">{smPct}<span className="text-xs text-slate-400 ml-1">%</span></div>
                  </div>
                  <div className="text-right">
                    <div className="text-[9px] text-slate-500 uppercase tracking-widest mb-1">Pitch Auth</div>
                    <div className="text-xl font-mono font-bold text-white tracking-wider">{pitchAuth}<span className="text-xs text-slate-400 ml-1">kNm</span></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Config Sliders */}
            <div className="bg-black/40 backdrop-blur-2xl border border-white/10 rounded-2xl p-6 flex-1 flex flex-col justify-center shadow-2xl relative overflow-hidden">
              <div className="absolute -top-20 -right-20 w-40 h-40 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
              <Slider label="CG Position" icon={GitCommit} value={cgPct} min={10} max={50} unit="%" onChange={setCgPct} color={statusColor} />
              <Slider label="Airspeed" icon={Wind} value={speed} min={100} max={450} step={5} unit=" kts" onChange={setSpeed} color="#38bdf8" />
              <Slider label="Tail Area" icon={Scaling} value={tailArea} min={10} max={40} unit=" m²" onChange={setTailArea} color="#a78bfa" />
              <Slider label="Tail Arm" icon={Ruler} value={tailArm} min={10} max={25} unit=" m" onChange={setTailArm} color="#f59e0b" />
            </div>

          </motion.div>

          {/* Visualization Canvas */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.15 }}
            className="lg:col-span-9 bg-black/40 backdrop-blur-2xl border border-white/10 rounded-2xl relative overflow-hidden flex flex-col shadow-2xl min-h-[400px] h-[450px] lg:h-full"
          >
            {/* HUD Overlay Top */}
            <div className="absolute top-6 left-6 right-6 flex justify-between items-start z-20 pointer-events-none">
              <div className="flex gap-4">
                <div className="bg-[#0b1221]/80 backdrop-blur-md border border-[#38bdf8]/30 shadow-[0_0_15px_rgba(56,189,248,0.2)] rounded-lg px-4 py-2 font-mono text-[10px] text-[#38bdf8] tracking-widest uppercase flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#38bdf8] animate-pulse shadow-[0_0_5px_#38bdf8]" /> Live Telemetry
                </div>
              </div>
              <div className="bg-[#0b1221]/80 backdrop-blur-md border border-white/10 rounded-lg px-4 py-2 text-right shadow-[0_0_15px_rgba(0,0,0,0.5)]">
                <div className="font-mono text-[9px] text-slate-500 tracking-widest uppercase mb-1">Tail Vol Ratio</div>
                <div className="font-mono text-sm font-bold text-white">V_T = {tailVolume.toFixed(3)}</div>
              </div>
            </div>

            {/* Interactive SVG Canvas */}
            <div className="flex-1 w-full relative select-none min-h-[250px]">
              <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid meet" className="w-full h-full absolute inset-0">
                <defs>
                  <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                    <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="1"/>
                  </pattern>
                  <radialGradient id="fuseGrad" cx="50%" cy="40%" r="60%">
                    <stop offset="0%" stopColor="rgba(148, 163, 184, 0.9)" />
                    <stop offset="70%" stopColor="rgba(51, 65, 85, 0.9)" />
                    <stop offset="100%" stopColor="rgba(15, 23, 42, 0.9)" />
                  </radialGradient>
                  <linearGradient id="canopyGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="rgba(125, 211, 252, 0.6)" />
                    <stop offset="100%" stopColor="rgba(14, 165, 233, 0.2)" />
                  </linearGradient>
                  <radialGradient id="engineGlow" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="rgba(56,189,248,0.6)" />
                    <stop offset="100%" stopColor="transparent" />
                  </radialGradient>
                  
                  {/* Arrow Markers for vectors */}
                  <marker id="arrowLift" markerWidth="8" markerHeight="8" refX="4" refY="4" orient="auto">
                    <path d="M0,0 L8,4 L0,8 Z" fill="#38bdf8" />
                  </marker>
                  <marker id="arrowWeight" markerWidth="8" markerHeight="8" refX="4" refY="4" orient="auto">
                    <path d="M0,0 L8,4 L0,8 Z" fill="#f43f5e" />
                  </marker>
                  <marker id="arrowTail" markerWidth="8" markerHeight="8" refX="4" refY="4" orient="auto">
                    <path d="M0,0 L8,4 L0,8 Z" fill="#22c55e" />
                  </marker>
                </defs>

                {/* Background Grid with Vignette */}
                <rect width="100%" height="100%" fill="url(#grid)" />
                <rect width="100%" height="100%" fill="radial-gradient(circle, transparent 40%, rgba(0,0,0,0.8) 100%)" pointerEvents="none" />

                {/* Wind Particles (High Fidelity) */}
                {highFidelity && (
                  <g className="wind-particles" opacity="0.3">
                    <line x1="800" y1={fuseY - 80} x2="700" y2={fuseY - 80} stroke="#fff" strokeWidth="1" strokeDasharray="20 40">
                      <animate attributeName="x1" from="1000" to="-200" dur={`${150/speed}s`} repeatCount="indefinite" />
                      <animate attributeName="x2" from="900" to="-300" dur={`${150/speed}s`} repeatCount="indefinite" />
                    </line>
                    <line x1="800" y1={fuseY + 100} x2="700" y2={fuseY + 100} stroke="#fff" strokeWidth="1" strokeDasharray="10 60">
                      <animate attributeName="x1" from="1200" to="-100" dur={`${120/speed}s`} repeatCount="indefinite" />
                      <animate attributeName="x2" from="1100" to="-200" dur={`${120/speed}s`} repeatCount="indefinite" />
                    </line>
                    {/* Downwash interacting with tail */}
                    <path d={`M${macStart+50},${fuseY-10} Q${tailCenter-50},${fuseY+10+(pitchAngle*2)} ${tailCenter+50},${fuseY+15+(pitchAngle*3)}`} fill="none" stroke="rgba(56,189,248,0.4)" strokeWidth="2" strokeDasharray="15 15">
                      <animate attributeName="stroke-dashoffset" from="30" to="0" dur={`${100/speed}s`} repeatCount="indefinite" />
                    </path>
                  </g>
                )}

                <g transform={`rotate(${pitchAngle}, ${cgX}, ${fuseY})`} style={{ transition: 'transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)' }}>
                  
                  {/* --- Fuselage --- */}
                  <path 
                    d={`M${fuseX1},${fuseY} Q${fuseX1+50},${fuseY-35} ${fuseX1+200},${fuseY-35} L${fuseX2-100},${fuseY-20} Q${fuseX2},${fuseY-15} ${fuseX2+20},${fuseY-5} L${fuseX2+20},${fuseY+5} Q${fuseX2},${fuseY+10} ${fuseX2-100},${fuseY+15} L${fuseX1+200},${fuseY+25} Q${fuseX1+50},${fuseY+25} ${fuseX1},${fuseY}`}
                    fill="url(#fuseGrad)" stroke="rgba(255,255,255,0.4)" strokeWidth="1.5" 
                  />
                  {/* Specular highlight */}
                  <path d={`M${fuseX1+30},${fuseY-15} Q${fuseX1+100},${fuseY-28} ${fuseX1+220},${fuseY-28}`} fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="2" filter="blur(1px)" />
                  
                  {/* Cockpit */}
                  <path d={`M${fuseX1+40},${fuseY-18} Q${fuseX1+80},${fuseY-34} ${fuseX1+120},${fuseY-30} Q${fuseX1+100},${fuseY-15} ${fuseX1+40},${fuseY-18}`} fill="url(#canopyGrad)" stroke="rgba(56,189,248,0.6)" strokeWidth="1.5" />
                  <path d={`M${fuseX1+50},${fuseY-22} Q${fuseX1+80},${fuseY-30} ${fuseX1+110},${fuseY-27}`} fill="none" stroke="rgba(255,255,255,0.8)" strokeWidth="1" opacity="0.7" />

                  {/* --- Main Wing --- */}
                  <path 
                    d={`M${macStart+10},${fuseY-2} Q${macStart+50},${fuseY-22} ${macStart+110},${fuseY-5} Q${macStart+80},${fuseY+8} ${macStart+10},${fuseY-2}`}
                    fill="rgba(167, 139, 250, 0.4)" stroke="#c084fc" strokeWidth="1.5"
                  />
                  
                  {/* --- Engine --- */}
                  <rect x={macStart+40} y={fuseY+10} width="60" height="20" rx="10" fill="#0f172a" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5" />
                  <ellipse cx={macStart+40} cy={fuseY+20} rx="4" ry="8" fill="#38bdf8" />
                  <rect x={macStart-40} y={fuseY+5} width="80" height="30" fill="url(#engineGlow)" />
                  <path d={`M${macStart+40},${fuseY+12} L${macStart+90},${fuseY+12}`} stroke="rgba(255,255,255,0.2)" strokeWidth="1" />

                  {/* --- Tail Section --- */}
                  {/* Vertical Stab */}
                  <path 
                    d={`M${fuseX2-80},${fuseY-18} L${fuseX2-40},${fuseY-90} L${fuseX2+10},${fuseY-90} L${fuseX2+15},${fuseY-10} Z`}
                    fill="rgba(34, 197, 94, 0.15)" stroke="#4ade80" strokeWidth="1.5"
                  />
                  {/* Horizontal Stab */}
                  <g transform={`translate(${tailCenter}, ${fuseY - 5}) scale(${tailArea / 18})`}>
                    <path 
                      d={`M-30,0 Q0,-10 30,0 Q15,10 -30,0`}
                      fill="rgba(34, 197, 94, 0.4)" stroke="#4ade80" strokeWidth="1.5"
                    />
                    {/* Elevator deflection */}
                    <path 
                      d={`M15,-3 L45,${-3 + (pitchAngle * 1.5)} L30,7 Z`}
                      fill="rgba(255, 255, 255, 0.4)" stroke="#fff" strokeWidth="1"
                    />
                  </g>
                </g>

                {/* --- Aerodynamic Forces & Reticles (Fixed to grid, not rotated to show Earth-relative/body forces effectively) --- */}
                
                {/* MAC Bar */}
                <line x1={macStart} y1={fuseY + 90} x2={macStart + macLen} y2={fuseY + 90} stroke="rgba(255,255,255,0.2)" strokeWidth="6" />
                <text x={macStart + macLen/2} y={fuseY + 105} textAnchor="middle" fill="rgba(255,255,255,0.4)" fontSize="9" fontFamily="monospace" letterSpacing="1">MEAN AERODYNAMIC CHORD</text>

                {/* High-Fi Tactical Vectors */}
                {highFidelity && (
                  <>
                    {/* Lift Vector (at NP) */}
                    <g transform={`translate(${npX}, ${fuseY})`} style={{ transition: 'all 0.5s ease' }}>
                      <line x1="0" y1="0" x2="0" y2={-liftMagnitude} stroke="#38bdf8" strokeWidth="3" markerEnd="url(#arrowLift)" />
                      <text x="10" y={-liftMagnitude/2} fill="#38bdf8" fontSize="10" fontFamily="monospace" fontWeight="bold">LIFT</text>
                    </g>
                    
                    {/* Weight Vector (at CG) */}
                    <g transform={`translate(${cgX}, ${fuseY})`} style={{ transition: 'all 0.5s ease' }}>
                      <line x1="0" y1="0" x2="0" y2={weightMagnitude} stroke="#f43f5e" strokeWidth="3" markerEnd="url(#arrowWeight)" />
                      <text x="10" y={weightMagnitude/2} fill="#f43f5e" fontSize="10" fontFamily="monospace" fontWeight="bold">WGT</text>
                    </g>

                    {/* Tail Force Vector (Restoring Force) */}
                    {Math.abs(pitchAngle) > 0 && (
                      <g transform={`translate(${tailCenter}, ${fuseY})`} style={{ transition: 'all 0.5s ease' }}>
                        <line 
                          x1="0" y1="0" 
                          x2="0" y2={pitchAngle > 0 ? -tailForceMagnitude : tailForceMagnitude} 
                          stroke="#22c55e" strokeWidth="3" markerEnd="url(#arrowTail)" 
                        />
                        <text x="-25" y={pitchAngle > 0 ? -tailForceMagnitude - 10 : tailForceMagnitude + 15} fill="#22c55e" fontSize="10" fontFamily="monospace" fontWeight="bold">
                          TRIM
                        </text>
                      </g>
                    )}
                  </>
                )}

                {/* Tactical Reticle: NP */}
                <line x1={npX} y1={fuseY - 120} x2={npX} y2={fuseY + 70} stroke="#38bdf8" strokeWidth="1" strokeDasharray="4 4" opacity="0.4" />
                <g transform={`translate(${npX}, ${fuseY})`}>
                  <circle cx="0" cy="0" r="10" fill="none" stroke="#38bdf8" strokeWidth="1" />
                  <circle cx="0" cy="0" r="3" fill="#38bdf8" />
                  <line x1="-14" y1="0" x2="14" y2="0" stroke="#38bdf8" strokeWidth="1" />
                  <line x1="0" y1="-14" x2="0" y2="14" stroke="#38bdf8" strokeWidth="1" />
                  <text x="0" y="-130" textAnchor="middle" fill="#38bdf8" fontSize="12" fontWeight="bold" fontFamily="monospace">NP</text>
                </g>

                {/* Tactical Reticle: CG */}
                <g style={{ transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)' }}>
                  <line x1={cgX} y1={fuseY - 120} x2={cgX} y2={fuseY + 70} stroke={statusColor} strokeWidth="1.5" opacity="0.6"/>
                  <g transform={`translate(${cgX}, ${fuseY})`}>
                    <circle cx="0" cy="0" r="12" fill="none" stroke={statusColor} strokeWidth="2" strokeDasharray="6 4">
                      <animateTransform attributeName="transform" type="rotate" from="0" to="360" dur="4s" repeatCount="indefinite"/>
                    </circle>
                    <circle cx="0" cy="0" r="4" fill={statusColor} />
                    <text x="0" y="-130" textAnchor="middle" fill={statusColor} fontSize="12" fontWeight="bold" fontFamily="monospace">CG</text>
                  </g>
                </g>

                {/* Static Margin Visual Zone */}
                {isStable ? (
                  <rect x={cgX} y={fuseY + 75} width={npX - cgX} height="6" fill="url(#grid)" stroke={statusColor} strokeWidth="1" opacity="0.8" style={{ transition: 'all 0.5s ease' }} />
                ) : (
                  <rect x={npX} y={fuseY + 75} width={cgX - npX} height="6" fill="rgba(251,113,133,0.3)" stroke="#f43f5e" strokeWidth="1" style={{ transition: 'all 0.5s ease' }} />
                )}

              </svg>
            </div>

            {/* Bottom Telemetry Bar */}
            <div className="h-20 border-t border-white/10 bg-[#0b1221]/90 backdrop-blur-xl flex items-center px-8 gap-8 z-10 shadow-[0_-10px_30px_rgba(0,0,0,0.5)]">
              <div className="flex-1 flex justify-between">
                <TelemetryBox label="Mach Number" value={(speed / 661).toFixed(2)} color="#fff" />
                <TelemetryBox label="Dynamic Pressure (q)" value={`${(qDyn/1000).toFixed(2)} kPa`} color="#38bdf8" />
                <TelemetryBox label="Pitch Rate" value={`${pitchAngle > 0 ? '-' : '+'}${(Math.abs(pitchAngle)*0.1).toFixed(2)}°/s`} color={statusColor} />
              </div>
            </div>

          </motion.div>
        </div>

        {/* Additional Interactive Labs */}
        <div className="mt-16 space-y-16 pb-16">
          <ForcesLab language={language || 'en'} />
        </div>
      </div>
    </div>
  );
};

export default TailLab;
