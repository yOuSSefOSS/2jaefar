import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, ReferenceLine, Tooltip } from 'recharts';
import { useAcademy } from '../../../context/AcademyContext';
import ThreeDPlane from '../components/ThreeDPlane';

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

const StabilityDeepDive = ({ isAr }) => {
  return (
    <div className="mt-16 bg-slate-900/40 rounded-3xl border border-white/5 p-8 shadow-2xl">
      <h2 className="text-3xl font-bold text-white mb-8 text-center">
        {isAr ? 'الفهم العميق للاستقرار' : 'Deep Dive: Understanding Stability'}
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        {/* Static Stability */}
        <div className="space-y-6">
          <h3 className="text-2xl font-bold text-emerald-400 border-b border-emerald-500/20 pb-4">
            {isAr ? '1. الاستقرار الاستاتيكي' : '1. Static Stability'}
          </h3>
          <p className="text-slate-300 leading-relaxed">
            {isAr 
              ? 'يصف الاستقرار الاستاتيكي "الميل الأولي" للطائرة للعودة إلى وضعها الأصلي بعد التعرض لاضطراب (مثل مطب هوائي).' 
              : 'Static stability describes the "initial tendency" of an aircraft to return to its original equilibrium after being disturbed (e.g., by a gust of wind).'}
          </p>
          
          <div className="flex flex-col gap-4">
            <div className="bg-emerald-950/30 p-4 rounded-xl border border-emerald-500/20">
              <h4 className="font-bold text-emerald-300 mb-1">{isAr ? 'مستقر إيجابياً (Positive)' : 'Positive Static Stability'}</h4>
              <p className="text-sm text-slate-400">{isAr ? 'مثل كرة داخل وعاء. إذا دفعتها، ستحاول العودة للقاع.' : 'Like a ball in a bowl. If pushed, it inherently tries to roll back to the center.'}</p>
            </div>
            <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-600/20">
              <h4 className="font-bold text-slate-300 mb-1">{isAr ? 'محايد (Neutral)' : 'Neutral Static Stability'}</h4>
              <p className="text-sm text-slate-400">{isAr ? 'مثل كرة على سطح مستوٍ. إذا دفعتها، ستبقى في مكانها الجديد ولن تعود.' : 'Like a ball on a flat table. It stays wherever it is pushed to, with no tendency to return.'}</p>
            </div>
            <div className="bg-red-950/30 p-4 rounded-xl border border-red-500/20">
              <h4 className="font-bold text-red-300 mb-1">{isAr ? 'غير مستقر (Negative)' : 'Negative Static Stability (Instability)'}</h4>
              <p className="text-sm text-slate-400">{isAr ? 'مثل كرة على قمة تل. أي دفعة صغيرة ستجعلها تتدحرج بعيداً ولن تعود أبداً.' : 'Like a ball balanced on top of a hill. A tiny push causes it to diverge completely away.'}</p>
            </div>
          </div>
        </div>

        {/* Dynamic Stability */}
        <div className="space-y-6">
          <h3 className="text-2xl font-bold text-sky-400 border-b border-sky-500/20 pb-4">
            {isAr ? '2. الاستقرار الديناميكي' : '2. Dynamic Stability'}
          </h3>
          <p className="text-slate-300 leading-relaxed">
            {isAr 
              ? 'يصف الاستقرار الديناميكي "السلوك مع مرور الوقت" بعد الميل الأولي. هل تتخامد الاهتزازات أم تزداد بمرور الوقت؟' 
              : 'Dynamic stability describes the "behavior over time" after the initial tendency. Do the resulting oscillations dampen out, sustain, or grow worse?'}
          </p>
          
          <div className="flex flex-col gap-4">
            <div className="bg-sky-950/30 p-4 rounded-xl border border-sky-500/20">
              <h4 className="font-bold text-sky-300 mb-1">{isAr ? 'مستقر ديناميكياً (Damped)' : 'Positive Dynamic Stability'}</h4>
              <p className="text-sm text-slate-400">{isAr ? 'الطائرة تتأرجح لكن التأرجح يقل تدريجياً حتى تستقر تماماً (تخميد قوي).' : 'The aircraft oscillates, but the amplitude decreases over time until it completely settles (damped).'}</p>
            </div>
            <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-600/20">
              <h4 className="font-bold text-slate-300 mb-1">{isAr ? 'محايد ديناميكياً (Undamped)' : 'Neutral Dynamic Stability'}</h4>
              <p className="text-sm text-slate-400">{isAr ? 'الطائرة تستمر في التأرجح بنفس القوة إلى الأبد دون تخميد.' : 'The aircraft oscillates continuously with the exact same amplitude forever.'}</p>
            </div>
            <div className="bg-red-950/30 p-4 rounded-xl border border-red-500/20">
              <h4 className="font-bold text-red-300 mb-1">{isAr ? 'غير مستقر ديناميكياً (Divergent)' : 'Negative Dynamic Stability'}</h4>
              <p className="text-sm text-slate-400">{isAr ? 'الطائرة تتأرجح ويزداد التأرجح عنفاً بمرور الوقت حتى تفقد السيطرة.' : 'The oscillations grow larger and more violent over time until control is lost.'}</p>
            </div>
          </div>
        </div>
      </div>
      
      <div className="mt-8 p-4 bg-indigo-950/30 border border-indigo-500/30 rounded-xl text-center text-indigo-300 font-bold">
        {isAr ? 'قاعدة ذهبية: يجب أن تكون الطائرة مستقرة استاتيكياً أولاً، حتى تتمكن من أن تكون مستقرة ديناميكياً!' : 'Golden Rule: An aircraft MUST be statically stable before it can be dynamically stable!'}
      </div>
    </div>
  );
};

const InteractiveStabilityLab = ({ isAr }) => {
  const [cgPosition, setCgPosition] = useState(25); // 10 to 60. NP = 40.
  const [tailScaleInt, setTailScaleInt] = useState(100); // 50 to 200
  const [speed, setSpeed] = useState(100); // 50 to 200
  const [history, setHistory] = useState([]);
  
  const [currentPitch, setCurrentPitch] = useState(0);
  const [isDiverged, setIsDiverged] = useState(false);
  
  const tailScale = tailScaleInt / 100;
  
  const physicsRef = useRef({ pitch: 0, pitchVel: 0, time: 0 });
  const animRef = useRef();

  const reset = () => {
    physicsRef.current = { pitch: 0, pitchVel: 0, time: 0 };
    setHistory([]);
    setCurrentPitch(0);
    setIsDiverged(false);
  };

  const triggerGust = () => {
    if (isDiverged) reset();
    physicsRef.current.pitchVel += 60; // instantaneous impulse
  };

  useEffect(() => {
    let lastTime = performance.now();
    
    const loop = (now) => {
      const dt = Math.min((now - lastTime) / 1000, 0.05); // cap dt
      lastTime = now;
      
      const staticMargin = (40 - cgPosition) / 100; // -0.2 to +0.3
      const stiffness = staticMargin * speed * 0.2; 
      const damping = tailScale * 1.5 + (speed * 0.01); 
      
      let { pitch, pitchVel, time } = physicsRef.current;
      
      if (Math.abs(pitch) > 90) {
         if (!isDiverged) setIsDiverged(true);
      } else {
         const m = 1.0;
         const acc = -(damping * pitchVel + stiffness * pitch) / m;
         
         pitchVel += acc * dt;
         pitch += pitchVel * dt;
         time += dt;
         
         physicsRef.current = { pitch, pitchVel, time };
         setCurrentPitch(pitch);
         
         setHistory(prev => {
            const last = prev[prev.length - 1];
            if (!last || time - last.time > 0.05) {
               const newHist = [...prev, { time: parseFloat(time.toFixed(2)), pitch: parseFloat(pitch.toFixed(2)) }];
               if (newHist.length > 100) newHist.shift(); // keep last 100 points for sliding window
               return newHist;
            }
            return prev;
         });
      }
      
      animRef.current = requestAnimationFrame(loop);
    };
    
    if (!isDiverged) {
      animRef.current = requestAnimationFrame(loop);
    }
    return () => cancelAnimationFrame(animRef.current);
  }, [cgPosition, tailScale, speed, isDiverged]);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-12"
    >
      {/* 3D Visualization */}
      <div className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl flex flex-col relative overflow-hidden">
        {isDiverged && (
          <div className="absolute inset-0 bg-red-950/80 z-20 flex items-center justify-center backdrop-blur-sm">
            <h2 className="text-4xl font-black text-red-500 drop-shadow-2xl text-center animate-pulse">
              {isAr ? 'تحذير: فقدان السيطرة' : 'WARNING: LOSS OF CONTROL'}<br/>
              <span className="text-xl text-red-300">{isAr ? 'الطائرة غير مستقرة' : 'AIRCRAFT DIVERGED'}</span>
            </h2>
          </div>
        )}
        <h2 className="text-xl font-bold text-white mb-6 uppercase tracking-widest text-sm flex justify-between items-center z-10">
          {isAr ? 'محاكاة فيزيائية حية' : 'Live Physics Simulation'}
          <button 
            onClick={triggerGust}
            className="bg-amber-500 hover:bg-amber-400 text-amber-950 font-bold px-4 py-2 rounded-lg text-sm shadow-[0_0_15px_rgba(245,158,11,0.5)] transition-all active:scale-95"
          >
            {isAr ? 'توليد هبة ريح' : 'Trigger Gust'}
          </button>
        </h2>
        
        <div className="relative min-h-[350px] mb-6 bg-black/40 rounded-2xl border border-white/5 overflow-hidden flex flex-col shadow-inner z-10">
          <ThreeDPlane 
            pitch={currentPitch} 
            showForces={false} 
            cgPosition={(cgPosition - 35) * 0.15} 
            tailScale={tailScale}
          />
        </div>
      </div>
      
      {/* Telemetry and Controls */}
      <div className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl flex flex-col z-10">
        <h2 className="text-xl font-bold text-white mb-6 uppercase tracking-widest text-sm flex justify-between items-center">
          {isAr ? 'لوحة القياسات الحية' : 'Live Telemetry & Controls'}
          <button onClick={reset} className="text-xs font-bold text-slate-400 hover:text-white px-3 py-1 bg-white/5 rounded-md border border-white/10 transition-colors">
            {isAr ? 'إعادة ضبط' : 'Reset Physics'}
          </button>
        </h2>

        {/* Sliders */}
        <div className="space-y-6 mb-8 p-6 bg-slate-950/50 rounded-2xl border border-white/5 shadow-inner">
          <ModernSlider 
            label={isAr ? 'موقع مركز الثقل (Stiffness)' : 'Center of Gravity (Stiffness)'}
            unit="% MAC" min={10} max={60} value={cgPosition} onChange={setCgPosition}
            color={40 - cgPosition > 0 ? '#10b981' : '#ef4444'}
          />
          <ModernSlider 
            label={isAr ? 'حجم الذيل الأفقي (Damping)' : 'Horizontal Tail Size (Damping)'}
            unit="%" min={50} max={200} value={tailScaleInt} onChange={setTailScaleInt}
            color="#8b5cf6"
          />
          <ModernSlider 
            label={isAr ? 'سرعة الهواء (Stiffness + Damping)' : 'Airspeed (Dynamic Pressure)'}
            unit="kts" min={50} max={200} value={speed} onChange={setSpeed}
            color="#38bdf8"
          />
        </div>
        
        {/* Graph */}
        <div className="flex-1 w-full min-h-[250px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={history} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} />
              <XAxis 
                dataKey="time" 
                type="number" 
                domain={['dataMin', 'dataMax']} 
                stroke="#64748b" 
                tick={false}
                label={{ value: 'Time (Auto-Scrolling)', position: 'bottom', fill: '#94a3b8', fontSize: 12 }} 
              />
              <YAxis 
                domain={[-45, 45]} 
                stroke="#64748b" 
                label={{ value: 'Pitch Angle (deg)', angle: -90, position: 'insideLeft', fill: '#94a3b8', fontSize: 12 }} 
              />
              <ReferenceLine y={0} stroke="#94a3b8" strokeWidth={1} opacity={0.5} />
              <Line 
                type="monotone" 
                dataKey="pitch" 
                stroke={isDiverged ? '#ef4444' : '#38bdf8'} 
                strokeWidth={3} 
                dot={false}
                isAnimationActive={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </motion.div>
  );
};

const AirPropertiesLab = ({ language }) => {
  const [altitude, setAltitude] = useState(0); // 0 to 40k ft
  
  // Density and pressure drop with altitude.
  // 0 ft -> 100% density, 40k ft -> ~25% density
  const densityPercent = Math.max(10, 100 - (altitude / 400)); 
  const pressureValue = Math.max(188, 1013 - (altitude * 0.0206)); // approximate mb

  const t = {
    title: { en: "Air Pressure & Density Lab", ar: "مختبر الضغط الجوي والكثافة" },
    desc: { en: "See how altitude affects the air molecules. Higher altitude means fewer molecules (lower density) and less force pushing (lower pressure).", ar: "شاهد كيف يؤثر الارتفاع على جزيئات الهواء. ارتفاع أعلى يعني جزيئات أقل (كثافة أقل) وقوة دفع أقل (ضغط أقل)." },
    alt: { en: "Altitude", ar: "الارتفاع" },
    density: { en: "Density (Molecules)", ar: "الكثافة (الجزيئات)" },
    pressure: { en: "Pressure", ar: "الضغط" },
  };

  const isAr = language === 'ar';
  const numParticles = Math.floor((densityPercent / 100) * 150); // Up to 150 particles

  // Generate random stable particles based on density
  const particles = React.useMemo(() => {
    return Array.from({ length: 150 }).map((_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 4 + 2,
      duration: Math.random() * 3 + 2,
      delay: Math.random() * 2,
    }));
  }, []);

  return (
    <div className="w-full max-w-5xl mx-auto my-16 bg-slate-900/80 rounded-3xl overflow-hidden border border-sky-500/20 shadow-2xl p-8">
      <div className="text-center mb-8">
        <h3 className="text-3xl font-bold text-sky-400 mb-2">{t.title[language]}</h3>
        <p className="text-slate-400">{t.desc[language]}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Molecule Box */}
        <div className="lg:col-span-2 relative h-[250px] md:h-[300px] bg-[#020617] rounded-2xl border border-white/10 overflow-hidden shadow-inner flex items-center justify-center">
          {particles.slice(0, numParticles).map(p => (
            <motion.div
              key={p.id}
              className="absolute bg-sky-400 rounded-full opacity-60"
              style={{
                width: p.size,
                height: p.size,
                left: `${p.x}%`,
                top: `${p.y}%`,
                boxShadow: '0 0 8px rgba(56, 189, 248, 0.8)'
              }}
              animate={{
                x: [0, (Math.random() - 0.5) * 50, 0],
                y: [0, (Math.random() - 0.5) * 50, 0],
              }}
              transition={{
                duration: p.duration * (200 / densityPercent), // Move faster at higher density (more collisions)
                repeat: Infinity,
                ease: "linear",
                delay: p.delay
              }}
            />
          ))}
          
          <div className="absolute bottom-4 left-4 right-4 flex justify-between px-4 py-2 bg-black/60 backdrop-blur rounded-xl border border-white/5 text-sm font-mono text-white">
            <div>
              <span className="text-amber-400 block text-xs">{t.density[language]}</span>
              {densityPercent.toFixed(1)}%
            </div>
            <div className="text-right">
              <span className="text-purple-400 block text-xs">{t.pressure[language]}</span>
              {pressureValue.toFixed(0)} hPa
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className={`flex flex-col justify-center space-y-8 ${isAr ? 'text-right' : ''}`}>
          <div>
            <ModernSlider label={t.alt[language]} unit="ft" min={0} max={40000} value={altitude} onChange={setAltitude} color="#38bdf8" />
            <p className="text-xs text-slate-500 mt-2">
              {isAr ? 'كلما ارتفعنا، يقل عدد الجزيئات وتتباعد، مما يقلل الكثافة والضغط.' : 'As we climb, molecules become fewer and spread out, lowering density and pressure.'}
            </p>
          </div>
          
          <div className="p-4 bg-slate-950/50 rounded-xl border border-white/5 space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-slate-400 text-sm">{isAr ? 'تأثير الرفع:' : 'Lift Effect:'}</span>
              <span className={`font-bold ${densityPercent > 70 ? 'text-emerald-400' : densityPercent > 40 ? 'text-amber-400' : 'text-red-400'}`}>
                {densityPercent > 70 ? (isAr ? 'ممتاز' : 'Excellent') : densityPercent > 40 ? (isAr ? 'متوسط' : 'Moderate') : (isAr ? 'ضعيف جداً' : 'Very Poor')}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-400 text-sm">{isAr ? 'أداء المحرك:' : 'Engine Perf:'}</span>
              <span className={`font-bold ${densityPercent > 70 ? 'text-emerald-400' : densityPercent > 40 ? 'text-amber-400' : 'text-red-400'}`}>
                {densityPercent > 70 ? (isAr ? '100%' : '100%') : densityPercent > 40 ? (isAr ? '60%' : '60%') : (isAr ? '30%' : '30%')}
              </span>
            </div>
          </div>
        </div>
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
    <div className="w-full max-w-6xl mx-auto my-24 bg-slate-900 rounded-3xl overflow-hidden border border-slate-800 shadow-2xl flex flex-col">
      <div className="p-8 text-center border-b border-slate-800">
        <h3 className="text-3xl font-bold text-white mb-2">{t.title[language]}</h3>
        <p className="text-slate-400">{t.desc[language]}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3">
        {/* 3D View */}
        <div className="relative w-full h-[300px] lg:h-[500px] lg:col-span-2 bg-gradient-to-b from-[#020617] to-slate-900 cursor-grab">
          <ThreeDPlane pitch={pitch} roll={0} yaw={0} showRunway={false} showForces={true} showAirflow={thrust > 20} />
          
          <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-md p-4 rounded-xl border border-white/10">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">{t.status[language]}</div>
            <div className={`text-xl font-black ${statusColor}`}>{statusText}</div>
          </div>
        </div>

        {/* Controls */}
        <div className={`bg-slate-950 p-8 flex flex-col justify-center space-y-8 ${language === 'ar' ? 'text-right' : ''}`}>
          <div>
            <ModernSlider label={t.thrust[language]} unit="%" min={0} max={100} value={thrust} onChange={(v) => { setThrust(v); setDrag(v * 0.8); }} color="#0ea5e9" />
            <p className="text-xs text-slate-500 mt-2">{language === 'ar' ? 'يولد سرعة أمامية.' : 'Generates forward speed.'}</p>
          </div>
          <div>
            <ModernSlider label={t.drag[language]} unit="%" min={0} max={100} value={drag} onChange={() => {}} color="#f59e0b" />
            <p className="text-xs text-slate-500 mt-2">{language === 'ar' ? 'تزداد المقاومة مع زيادة السرعة (الدفع).' : 'Resistance increases with speed (thrust).'}</p>
          </div>
          <div className="h-px bg-slate-800 w-full my-2"></div>
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
    <div className="w-full max-w-6xl mx-auto my-24 bg-slate-900 rounded-3xl overflow-hidden border border-slate-800 shadow-2xl flex flex-col">
      <div className="p-8 text-center border-b border-slate-800">
        <h3 className="text-3xl font-bold text-white mb-2">{t.title[language]}</h3>
        <p className="text-slate-400">{t.desc[language]}</p>
      </div>
      <div className="relative w-full h-[300px] md:h-[400px] lg:h-[600px] cursor-grab">
        <ThreeDPlane pitch={pitch} roll={roll} yaw={yaw} showAirflow={false} />
      </div>
      <div className={`bg-slate-950 p-8 grid grid-cols-1 md:grid-cols-3 gap-8 ${language === 'ar' ? 'flex-row-reverse text-right' : ''}`}>
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

export default function StabilityTab() {
  const { language } = useAcademy();
  const isAr = language === 'ar';

  const [cgPosition, setCgPosition] = useState(25); // % MAC
  const neutralPoint = 40; // % MAC

  const staticMargin = neutralPoint - cgPosition;
  const isStable = staticMargin > 0;
  const isNeutral = staticMargin === 0;

  // Generate CM vs CL Data based on CG
  const generateMomentData = () => {
    const data = [];
    // Slope = - (Static Margin / 100)
    const slope = -(staticMargin / 100) * 1.5; 
    
    for (let cl = 0; cl <= 1.5; cl += 0.1) {
      const cm0 = 0.15; 
      const cm = cm0 + slope * cl;
      data.push({ cl: parseFloat(cl.toFixed(1)), cm: parseFloat(cm.toFixed(3)) });
    }
    return data;
  };
  const momentData = generateMomentData();

  // Generate Dynamic Stability Data
  const generateDynamicData = (mode) => {
    const data = [];
    for (let t = 0; t <= 50; t += 0.5) {
      let displacement = 0;
      if (mode === 'phugoid') {
        displacement = 10 * Math.exp(-0.02 * t) * Math.cos(0.5 * t);
      } else if (mode === 'short-period') {
        displacement = 10 * Math.exp(-0.3 * t) * Math.cos(3 * t);
      } else if (mode === 'unstable') {
        displacement = 2 * Math.exp(0.1 * t);
      }
      data.push({ time: t, displacement: parseFloat(displacement.toFixed(2)) });
    }
    return data;
  };

  const [activeMode, setActiveMode] = useState('phugoid');
  const activeModeActual = !isStable ? 'unstable' : activeMode;
  const dynamicData = generateDynamicData(activeModeActual);
  
  const [activeStabilityTab, setActiveStabilityTab] = useState('static'); // 'static' | 'dynamic'

  // Animate the 3D plane continuously based on the dynamic mode if in dynamic tab
  const [animatedPitch, setAnimatedPitch] = useState(0);
  const animTimeRef = useRef(0);
  const animFrameRef = useRef(null);

  useEffect(() => {
    if (activeStabilityTab !== 'dynamic') {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      setAnimatedPitch(isStable ? 0 : isNeutral ? 0 : 20);
      return;
    }

    animTimeRef.current = 0;
    const animate = () => {
      animTimeRef.current += 0.05;
      const t = animTimeRef.current;
      
      let displacement = 0;
      if (activeModeActual === 'phugoid') {
        displacement = 15 * Math.cos(1.5 * t); // Continuous gentle oscillation
      } else if (activeModeActual === 'short-period') {
        displacement = 5 * Math.cos(6 * t); // Continuous fast oscillation
      } else if (activeModeActual === 'unstable') {
        displacement = 20 * Math.sin(t); // Erratic
      }

      setAnimatedPitch(displacement);
      animFrameRef.current = requestAnimationFrame(animate);
    };
    
    animate();

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [activeStabilityTab, activeModeActual, isStable, isNeutral]);

  return (
    <div className="flex-1 overflow-y-auto overflow-x-hidden relative bg-[#020617] edu-scroll">
      
      {/* Background Animated Atmosphere */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-30 animate-[pulse_8s_ease-in-out_infinite]" />
        <div className="absolute top-[20%] left-[20%] w-[40%] h-[40%] bg-emerald-500/10 blur-[100px] rounded-full animate-[spin_30s_linear_infinite]" />
        <div className="absolute bottom-[20%] right-[20%] w-[50%] h-[50%] bg-purple-500/10 blur-[100px] rounded-full animate-[spin_40s_linear_infinite_reverse]" />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-8 py-12">
        
        <header className="mb-12 border-b border-white/10 pb-8 text-center">
          <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-sky-400 tracking-tight mb-4">
            {isAr ? 'استقرار الطائرة (Aircraft Stability)' : 'Aircraft Stability'}
          </h1>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto">
            {isAr ? 'اكتشف كيف يؤثر موقع مركز الثقل (CG) على الاستقرار الطولي الديناميكي والاستاتيكي.' : 'Discover how Center of Gravity (CG) placement affects longitudinal static and dynamic stability.'}
          </p>
        </header>

        <div className="flex justify-center mb-12">
          <div className="flex flex-wrap justify-center gap-2 bg-slate-900/50 p-1.5 rounded-2xl border border-white/10 max-w-fit shadow-2xl">
            <button 
              onClick={() => setActiveStabilityTab('static')}
              className={`px-6 py-3 rounded-xl font-bold transition-all text-sm md:text-base ${activeStabilityTab === 'static' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.2)]' : 'text-slate-400 hover:bg-white/5'}`}
            >
              {isAr ? 'الاستقرار الاستاتيكي' : 'Static Stability'}
            </button>
            <button 
              onClick={() => setActiveStabilityTab('dynamic')}
              className={`px-6 py-3 rounded-xl font-bold transition-all text-sm md:text-base ${activeStabilityTab === 'dynamic' ? 'bg-sky-500/20 text-sky-400 border border-sky-500/30 shadow-[0_0_15px_rgba(14,165,233,0.2)]' : 'text-slate-400 hover:bg-white/5'}`}
            >
              {isAr ? 'الاستقرار الديناميكي' : 'Dynamic Stability'}
            </button>
            <button 
              onClick={() => setActiveStabilityTab('lab')}
              className={`px-6 py-3 rounded-xl font-bold transition-all text-sm md:text-base ${activeStabilityTab === 'lab' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30 shadow-[0_0_15px_rgba(245,158,11,0.2)]' : 'text-slate-400 hover:bg-white/5'}`}
            >
              {isAr ? 'مختبر تفاعلي' : 'Interactive Lab'}
            </button>
          </div>
        </div>

        {activeStabilityTab === 'static' && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-12"
          >
            {/* CG BALANCER WIDGET */}
            <div className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl flex flex-col">
              <h2 className="text-xl font-bold text-white mb-6 uppercase tracking-widest text-sm flex items-center justify-between">
                {isAr ? 'موازن مركز الثقل' : 'CG Balancer'}
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${isStable ? 'bg-emerald-500/20 text-emerald-400' : isNeutral ? 'bg-slate-500/20 text-slate-300' : 'bg-red-500/20 text-red-400'}`}>
                  {isStable ? (isAr ? 'مستقر' : 'STABLE') : isNeutral ? (isAr ? 'محايد' : 'NEUTRAL') : (isAr ? 'غير مستقر' : 'UNSTABLE')}
                </span>
              </h2>

              <div className="relative min-h-[250px] mb-10 bg-black/40 rounded-2xl border border-white/5 overflow-hidden flex flex-col shadow-inner">
                <div className="flex-1 w-full relative group">
                  <ThreeDPlane 
                    pitch={isStable ? 0 : isNeutral ? 0 : 20} 
                    showForces={true} 
                    cgPosition={(cgPosition - 35) * 0.15} 
                    cpPosition={(neutralPoint - 35) * 0.15} 
                  />
                  
                  {/* Overlay Legend */}
                  <div className="absolute top-4 left-4 flex flex-col gap-2 pointer-events-none">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-sky-400 shadow-[0_0_10px_#38bdf8]"></div>
                      <span className="text-xs text-white font-bold tracking-wider">CG (Center of Gravity)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-amber-500 shadow-[0_0_10px_#f59e0b]"></div>
                      <span className="text-xs text-white font-bold tracking-wider">NP (Neutral Point)</span>
                    </div>
                  </div>
                </div>
              </div>

            <div className="mb-4">
              <ModernSlider 
                label={isAr ? 'موقع مركز الثقل (% MAC)' : 'Center of Gravity (% MAC)'}
                unit="%"
                min={10}
                max={60}
                value={cgPosition}
                onChange={setCgPosition}
                color={isStable ? '#10b981' : isNeutral ? '#94a3b8' : '#ef4444'}
              />
            </div>
            
            <div className="flex justify-between items-center text-sm p-4 bg-slate-950/50 rounded-xl border border-white/5">
              <span className="text-slate-400">{isAr ? 'الهامش الاستاتيكي (Static Margin):' : 'Static Margin:'}</span>
              <span className={`font-mono font-bold text-lg ${isStable ? "text-emerald-400" : isNeutral ? "text-slate-400" : "text-red-400"}`}>
                {staticMargin > 0 ? '+' : ''}{staticMargin}%
              </span>
            </div>
          </div>

          {/* CM vs CL CHART */}
          <div className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl flex flex-col">
            <h2 className="text-xl font-bold text-white mb-2 uppercase tracking-widest text-sm">
              {isAr ? 'منحنى العزم (C_M vs C_L)' : 'Pitching Moment Curve'}
            </h2>
            <p className="text-slate-400 text-xs mb-6">
              {isAr ? 'تحدد درجة ميل المنحنى ما إذا كانت الطائرة مستقرة.' : 'The slope of this curve defines static stability.'}
            </p>

            <div className="flex-1 w-full min-h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={momentData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} />
                  <XAxis 
                    dataKey="cl" 
                    type="number" 
                    domain={[0, 1.5]} 
                    stroke="#64748b" 
                    label={{ value: 'Lift Coefficient (CL)', position: 'bottom', fill: '#94a3b8', fontSize: 12 }} 
                  />
                  <YAxis 
                    domain={[-0.4, 0.6]} 
                    stroke="#64748b" 
                    label={{ value: 'Pitching Moment (CM)', angle: -90, position: 'insideLeft', fill: '#94a3b8', fontSize: 12 }} 
                  />
                  <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#f8fafc' }} />
                  <ReferenceLine y={0} stroke="#94a3b8" strokeWidth={2} opacity={0.5} />
                  
                  <Line 
                    type="monotone" 
                    dataKey="cm" 
                    stroke={isStable ? '#10b981' : isNeutral ? '#94a3b8' : '#ef4444'} 
                    strokeWidth={4} 
                    dot={false}
                    isAnimationActive={true}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </motion.div>
        )}

        {/* DYNAMIC STABILITY SECTION */}
        {activeStabilityTab === 'dynamic' && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-12"
          >
            {/* 3D Visualization of Dynamic Modes */}
            <div className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl flex flex-col">
              <h2 className="text-xl font-bold text-white mb-6 uppercase tracking-widest text-sm">
                {isAr ? 'محاكاة الاستقرار الديناميكي' : 'Dynamic Stability Simulation'}
              </h2>
              <div className="relative min-h-[300px] mb-6 bg-black/40 rounded-2xl border border-white/5 overflow-hidden flex flex-col shadow-inner">
                <ThreeDPlane 
                  pitch={animatedPitch} 
                  showForces={false} 
                />
              </div>
            </div>
          
          <div className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl flex flex-col">
            <h2 className="text-xl font-bold text-white mb-6 uppercase tracking-widest text-sm">
              {isAr ? 'الاستقرار الديناميكي' : 'Dynamic Stability Modes'}
            </h2>
            
            <div className="space-y-4 mb-8">
              <button 
                onClick={() => isStable && setActiveMode('phugoid')}
                disabled={!isStable}
                className={`w-full text-left p-4 rounded-xl border flex items-center transition-all ${!isStable ? 'opacity-30 cursor-not-allowed border-slate-800' : activeMode === 'phugoid' ? 'bg-sky-500/20 border-sky-500/50 shadow-[0_0_15px_rgba(14,165,233,0.2)]' : 'bg-slate-950 border-slate-800 hover:border-slate-600'}`}
              >
                <div className={`w-3 h-3 rounded-full mr-4 shrink-0 ${activeMode === 'phugoid' ? 'bg-sky-400 shadow-[0_0_10px_#38bdf8]' : 'bg-slate-600'}`} />
                <div>
                  <div className="font-bold text-white">{isAr ? 'تذبذب فوغويد (Phugoid)' : 'Phugoid Oscillation'}</div>
                  <div className="text-xs text-slate-400 mt-1">{isAr ? 'تذبذب بطيء في السرعة والارتفاع.' : 'Slow, long-period oscillation of speed and altitude.'}</div>
                </div>
              </button>
              
              <button 
                onClick={() => isStable && setActiveMode('short-period')}
                disabled={!isStable}
                className={`w-full text-left p-4 rounded-xl border flex items-center transition-all ${!isStable ? 'opacity-30 cursor-not-allowed border-slate-800' : activeMode === 'short-period' ? 'bg-indigo-500/20 border-indigo-500/50 shadow-[0_0_15px_rgba(99,102,241,0.2)]' : 'bg-slate-950 border-slate-800 hover:border-slate-600'}`}
              >
                <div className={`w-3 h-3 rounded-full mr-4 shrink-0 ${activeMode === 'short-period' ? 'bg-indigo-400 shadow-[0_0_10px_#818cf8]' : 'bg-slate-600'}`} />
                <div>
                  <div className="font-bold text-white">{isAr ? 'التذبذب القصير (Short Period)' : 'Short Period Pitch'}</div>
                  <div className="text-xs text-slate-400 mt-1">{isAr ? 'تذبذب سريع يتم تخميده بسرعة.' : 'Fast, heavily damped pitch oscillation.'}</div>
                </div>
              </button>
            </div>
            
            <div className="mt-auto p-4 bg-slate-950 rounded-xl border border-slate-800 text-sm text-slate-300">
              <span className="text-sky-400 font-bold">Rule of Thumb:</span> {isAr ? 'لا يمكن للطائرة أن تكون مستقرة ديناميكيًا إذا كانت غير مستقرة استاتيكيًا.' : 'An aircraft cannot be dynamically stable if it is statically unstable.'}
            </div>
          </div>

          <div className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl flex flex-col">
            <h2 className="text-xl font-bold text-white mb-2 uppercase tracking-widest text-sm">
              {isAr ? 'استجابة الطائرة' : 'Aircraft Response Time-History'}
            </h2>
            <div className="flex-1 w-full min-h-[300px] mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={dynamicData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} />
                  <XAxis 
                    dataKey="time" 
                    type="number" 
                    domain={[0, 50]} 
                    stroke="#64748b" 
                    label={{ value: 'Time (s)', position: 'bottom', fill: '#94a3b8', fontSize: 12 }} 
                  />
                  <YAxis 
                    domain={[-15, 15]} 
                    stroke="#64748b" 
                    label={{ value: 'Pitch Disturbance (deg)', angle: -90, position: 'insideLeft', fill: '#94a3b8', fontSize: 12 }} 
                  />
                  <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#f8fafc' }} />
                  <ReferenceLine y={0} stroke="#94a3b8" strokeWidth={1} opacity={0.5} />
                  
                  <Line 
                    type="monotone" 
                    dataKey="displacement" 
                    stroke={!isStable ? '#ef4444' : activeMode === 'phugoid' ? '#38bdf8' : '#818cf8'} 
                    strokeWidth={3} 
                    dot={false}
                    isAnimationActive={false}
                  />
                </LineChart>
              </ResponsiveContainer>
              </div>
            </div>

          </motion.div>
        )}

        {/* INTERACTIVE LAB SECTION */}
        {activeStabilityTab === 'lab' && (
          <div className="space-y-24">
            <InteractiveStabilityLab isAr={isAr} />
            <ForcesLab language={isAr ? 'ar' : 'en'} />
            <InteractiveAxes language={isAr ? 'ar' : 'en'} />
            <AirPropertiesLab language={isAr ? 'ar' : 'en'} />
          </div>
        )}

        <StabilityDeepDive isAr={isAr} />

        {/* SUMMARY */}
        <motion.div 
          initial={{ y: 20, opacity: 0 }} whileInView={{ y: 0, opacity: 1 }} viewport={{ once: true }}
          className="mt-16 bg-gradient-to-r from-emerald-900/40 to-sky-900/40 border border-emerald-500/20 rounded-3xl p-8 shadow-2xl"
        >
          <h3 className="text-2xl font-black text-white mb-4 uppercase tracking-wider">
            {isAr ? 'ملخص الفصل الرابع' : 'Chapter 4 Quick Summary'}
          </h3>
          <ul className="space-y-3 text-slate-300">
            <li className="flex gap-3">
              <span className="text-emerald-400">❖</span>
              {isAr ? 'الاستقرار الاستاتيكي يحدد الميل الأولي للطائرة للعودة بعد الاضطراب.' : 'Static stability determines the initial tendency of the aircraft to return after a disturbance.'}
            </li>
            <li className="flex gap-3">
              <span className="text-sky-400">❖</span>
              {isAr ? 'الاستقرار الديناميكي يصف سلوك الطائرة مع مرور الوقت (التخميد) ويشترط الاستقرار الاستاتيكي أولاً.' : 'Dynamic stability describes behavior over time (damping) and requires static stability first.'}
            </li>
            <li className="flex gap-3">
              <span className="text-amber-400">❖</span>
              {isAr ? 'موقع مركز الثقل (CG) حرج: إذا تراجع خلف النقطة المحايدة (NP) تصبح الطائرة غير مستقرة بشكل خطير.' : 'CG placement is critical: if it moves behind the Neutral Point (NP), the aircraft becomes dangerously unstable.'}
            </li>
            <li className="flex gap-3">
              <span className="text-rose-400">❖</span>
              {isAr ? 'التذبذب القصير (Short Period) سريع ومخمد بشدة، بينما فوغويد (Phugoid) بطيء وطويل.' : 'Short Period oscillation is fast and heavily damped, while Phugoid is slow and long.'}
            </li>
          </ul>
        </motion.div>

      </div>
    </div>
  );
}
