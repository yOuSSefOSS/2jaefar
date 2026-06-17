import React, { useState } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useAcademy } from '../../../context/AcademyContext';
import { chapter1Data } from '../data/chapter1';
import ThreeDPlane from '../components/ThreeDPlane';
import { useProgress } from '../../../hooks/useProgress';
import { CheckCircle2 } from 'lucide-react';
import QuizModal from '../components/QuizModal';

const ModernSlider = ({ value, min, max, step = 1, onChange, label, unit, color }) => {
  const trackRef = React.useRef(null);
  const handlePointer = (e) => {
    if (!trackRef.current) return;
    const rect = trackRef.current.getBoundingClientRect();
    const percent = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const val = min + percent * (max - min);
    // Apply step
    const steppedVal = Math.round(val / step) * step;
    onChange(steppedVal);
  };
  const percent = ((value - min) / (max - min)) * 100;
  return (
    <div className="group relative w-full mb-4 select-none touch-none">
      {label && (
        <div className="flex justify-between text-[11px] font-mono mb-2 uppercase tracking-widest text-slate-400">
          <span>{label}</span>
          <span style={{color}} className="font-bold text-sm shadow-sm">{value.toFixed(step < 1 ? 1 : 0)} <span className="text-[10px] text-slate-500">{unit}</span></span>
        </div>
      )}
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


const AnimatedSection = ({ children, className = '' }) => (
  <motion.div
    initial={{ opacity: 0, y: 50 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: "-100px" }}
    transition={{ duration: 0.8, ease: "easeOut" }}
    className={className}
  >
    {children}
  </motion.div>
);

const MomentLab = ({ language }) => {
  const [force, setForce] = useState(50); // Newtons
  const [distance, setDistance] = useState(5); // Meters
  const moment = force * distance;

  const t = {
    title: { en: "Interactive Moment Lab", ar: "مختبر العزم التفاعلي" },
    desc: { en: "A Moment is a turning force. It depends on the Force applied and its Distance from the pivot.", ar: "العزم هو قوة دورانية. يعتمد على القوة المطبقة ومسافتها من محور الدوران." },
    force: { en: "Force", ar: "القوة" },
    distance: { en: "Distance from Pivot", ar: "المسافة من المحور" },
    moment: { en: "Total Moment", ar: "العزم الإجمالي" },
    pivot: { en: "Pivot (CG)", ar: "محور الدوران" },
  };

  const isAr = language === 'ar';
  
  // Max values for UI
  const maxDist = 10;
  
  return (
    <div className="w-full max-w-5xl mx-auto my-16 bg-slate-900/80 rounded-3xl overflow-hidden border border-amber-500/20 shadow-2xl p-8">
      <div className="text-center mb-8">
        <h3 className="text-3xl font-bold text-amber-400 mb-2">{t.title[language]}</h3>
        <p className="text-slate-400">{t.desc[language]}</p>
      </div>

      <div className="relative h-[200px] md:h-[300px] bg-black/40 rounded-2xl border border-white/5 mb-8 flex items-center justify-center overflow-hidden">
        {/* Seesaw Line */}
        <div className="absolute top-1/2 left-10 right-10 h-2 bg-slate-700 rounded-full" />
        
        {/* Pivot */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -mt-1 z-10 flex flex-col items-center">
          <div className="w-0 h-0 border-l-[15px] border-l-transparent border-r-[15px] border-r-transparent border-b-[25px] border-b-sky-500" />
          <div className="mt-2 text-sky-400 font-bold text-sm bg-slate-900 px-2 py-1 rounded">{t.pivot[language]}</div>
        </div>

        {/* Applied Force Vector & Mass */}
        <motion.div 
          className="absolute top-1/2 z-20 flex flex-col items-center"
          animate={{ x: `calc(-50% + ${(distance / maxDist) * 100 * (isAr ? -1 : 1)}px)` }} // Simplified positioning
          style={{ [isAr ? 'left' : 'right']: `calc(50% - ${distance * 10}%)` }}
        >
          {/* Arrow */}
          <div className="flex flex-col items-center translate-y-[-100%]">
             <div className="text-amber-400 font-bold mb-1">{force} N</div>
             <div className="w-1 bg-amber-400" style={{ height: `${force * 1.5}px` }} />
             <div className="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[10px] border-t-amber-400" />
          </div>
          {/* Weight block */}
          <div className="w-8 h-8 bg-amber-500/20 border border-amber-500 rounded mt-1 backdrop-blur-md flex items-center justify-center">
            <div className="w-2 h-2 rounded-full bg-amber-400" />
          </div>
        </motion.div>

        {/* Distance Indicator */}
        <div 
          className="absolute top-1/2 mt-8 border-b-2 border-dashed border-emerald-500/50 flex justify-center items-end pb-1"
          style={{ 
            [isAr ? 'right' : 'left']: '50%', 
            width: `${distance * 10}%`,
          }}
        >
          <span className="text-emerald-400 font-mono text-sm">{distance} m</span>
        </div>

        {/* Resulting Moment text */}
        <div className="absolute bottom-4 left-4 right-4 text-center">
          <div className="inline-block px-6 py-3 bg-slate-950/80 rounded-xl border border-white/10 font-mono text-xl text-white">
            <span className="text-amber-400">{force}</span> × <span className="text-emerald-400">{distance}</span> = <span className="text-purple-400 font-bold">{moment} N·m</span>
          </div>
        </div>
      </div>

      <div className={`grid grid-cols-1 md:grid-cols-2 gap-8 ${isAr ? 'text-right' : ''}`}>
        <div>
          <ModernSlider label={t.force[language]} unit="N" min={10} max={100} value={force} onChange={setForce} color="#f59e0b" />
          <p className="text-xs text-slate-500 mt-2">{isAr ? 'الوزن أو القوة المطبقة.' : 'The weight or push applied.'}</p>
        </div>
        <div>
          <ModernSlider label={t.distance[language]} unit="m" min={1} max={10} value={distance} onChange={setDistance} color="#10b981" />
          <p className="text-xs text-slate-500 mt-2">{isAr ? 'المسافة عن محور الدوران. زيادة المسافة يضاعف العزم!' : 'Distance from pivot. More distance multiplies the moment!'}</p>
        </div>
      </div>
    </div>
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
            <ModernSlider label={t.alt[language]} unit="ft" min={0} max={40000} step={1000} value={altitude} onChange={setAltitude} color="#38bdf8" />
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

const InteractiveAtmosphere = ({ language }) => {
  const [activeLayerIndex, setActiveLayerIndex] = useState(0);

  const t = {
    title: { en: "Interactive Atmosphere", ar: "الغلاف الجوي التفاعلي" },
    desc: { en: "Select a layer to see its properties and how it affects flight.", ar: "حدد طبقة لرؤية خصائصها وكيف تؤثر على الطيران." },
    temp: { en: "Temperature", ar: "درجة الحرارة" },
    pressure: { en: "Pressure", ar: "الضغط" },
    density: { en: "Density", ar: "الكثافة" },
    effect: { en: "Aircraft Effect", ar: "تأثير الطائرة" },
  };

  const layers = [
    {
      id: 'troposphere',
      name: { en: "Troposphere (0-11 km)", ar: "التروبوسفير (0-11 كم)" },
      bgClass: "from-sky-400 to-sky-900",
      temp: "15°C ➔ -56.5°C",
      pressure: "1013 ➔ 226 hPa",
      density: { en: "High (1.225 kg/m³)", ar: "عالية (1.225 كجم/م³)" },
      effect: { en: "Optimal for lift. High engine performance. Weather occurs here.", ar: "مثالي للرفع. أداء محرك عالي. الطقس يحدث هنا." },
      planeY: "80%",
      planeScale: 1,
    },
    {
      id: 'stratosphere',
      name: { en: "Stratosphere (11-50 km)", ar: "الستراتوسفير (11-50 كم)" },
      bgClass: "from-indigo-900 to-[#020617]",
      temp: "-56.5°C ➔ -2.5°C",
      pressure: "226 ➔ 1 hPa",
      density: { en: "Low (0.3 kg/m³)", ar: "منخفضة (0.3 كجم/م³)" },
      effect: { en: "Thin air: Less lift but much less drag. High fuel efficiency for jets.", ar: "هواء رقيق: رفع أقل ولكن سحب أقل. كفاءة وقود عالية للطائرات النفاثة." },
      planeY: "40%",
      planeScale: 0.8,
    },
    {
      id: 'mesosphere',
      name: { en: "Mesosphere (50-85 km)", ar: "الميزوسفير (50-85 كم)" },
      bgClass: "from-[#020617] to-black",
      temp: "-2.5°C ➔ -90°C",
      pressure: "< 1 hPa",
      density: { en: "Extremely Low", ar: "منخفضة جداً" },
      effect: { en: "Unsuitable for normal flight. Air is too thin for lift or jet engines.", ar: "غير صالح للطيران العادي. الهواء خفيف جداً للرفع أو المحركات." },
      planeY: "10%",
      planeScale: 0.5,
    }
  ];

  const activeLayer = layers[activeLayerIndex];

  return (
    <div className={`w-full max-w-5xl mx-auto my-24 p-8 bg-slate-900/50 rounded-3xl border border-white/10 backdrop-blur-md shadow-2xl ${language === 'ar' ? 'text-right' : ''}`}>
      <h3 className="text-3xl font-bold text-white mb-2 text-center">{t.title[language]}</h3>
      <p className="text-slate-400 text-center mb-8">{t.desc[language]}</p>
      
      <div className="flex flex-wrap justify-center gap-4 mb-8">
        {layers.map((layer, idx) => (
          <button
            key={layer.id}
            onClick={() => setActiveLayerIndex(idx)}
            className={`px-6 py-3 rounded-full font-bold transition-all ${
              activeLayerIndex === idx 
                ? 'bg-sky-500 text-white shadow-[0_0_20px_rgba(14,165,233,0.5)] scale-105' 
                : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
            }`}
          >
            {layer.name[language]}
          </button>
        ))}
      </div>

      <div className={`relative w-full h-[300px] md:h-[400px] rounded-2xl overflow-hidden shadow-2xl bg-gradient-to-t ${activeLayer.bgClass} transition-colors duration-1000 flex`}>
        {/* Parallax Elements */}
        <div className="absolute inset-0 transition-opacity duration-1000" style={{ opacity: activeLayerIndex > 0 ? 1 : 0 }}>
          <div className="w-full h-full bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-50"></div>
        </div>
        <div className="absolute inset-0 transition-opacity duration-1000" style={{ opacity: activeLayerIndex === 0 ? 1 : 0 }}>
           <div className="w-full h-full flex items-end justify-center pb-8 md:pb-12 space-x-6 md:space-x-12 opacity-40 blur-[2px]">
             <div className="text-6xl md:text-9xl">☁️</div>
             <div className="text-5xl md:text-8xl">☁️</div>
             <div className="text-6xl md:text-9xl">☁️</div>
           </div>
        </div>

        {/* Animated Plane */}
        <div className="absolute left-1/2 -translate-x-1/2 transition-all duration-1000 ease-in-out z-20" 
             style={{ top: activeLayer.planeY, transform: `translateX(-50%) scale(${activeLayer.planeScale})` }}>
          <div className="text-4xl md:text-6xl filter drop-shadow-[0_0_15px_rgba(255,255,255,0.8)] -rotate-0">✈️</div>
        </div>
      </div>

      {/* Info Panel overlay - Moved Outside */}
      <div className="mt-6 bg-black/60 backdrop-blur-md border border-white/10 rounded-xl p-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div>
            <div className="text-sky-400 text-xs font-bold tracking-widest uppercase mb-1">{t.temp[language]}</div>
            <div className="text-xl font-bold text-white" dir="ltr">{activeLayer.temp}</div>
          </div>
          <div>
            <div className="text-purple-400 text-xs font-bold tracking-widest uppercase mb-1">{t.pressure[language]}</div>
            <div className="text-xl font-bold text-white" dir="ltr">{activeLayer.pressure}</div>
          </div>
          <div>
            <div className="text-amber-400 text-xs font-bold tracking-widest uppercase mb-1">{t.density[language]}</div>
            <div className="text-xl font-bold text-white">{activeLayer.density[language]}</div>
          </div>
          <div>
            <div className="text-emerald-400 text-xs font-bold tracking-widest uppercase mb-1">{t.effect[language]}</div>
            <div className="text-sm font-semibold text-slate-200">{activeLayer.effect[language]}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

const IdealGasLaw = ({ language }) => {
  const isAr = language === 'ar';
  return (
    <motion.div 
      initial={{ y: 20, opacity: 0 }}
      whileInView={{ y: 0, opacity: 1 }}
      viewport={{ once: true }}
      className="max-w-5xl mx-auto mb-24 relative bg-gradient-to-br from-slate-800/50 to-slate-900/50 rounded-3xl p-10 border border-slate-700 shadow-2xl overflow-hidden"
    >
      <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
        <span className="text-9xl font-serif italic">P</span>
      </div>
      
      <h2 className="text-3xl font-bold text-white mb-8 text-center">
        {isAr ? 'قانون الغاز المثالي' : 'The Ideal Gas Law'}
      </h2>
      
      <div className="flex justify-center items-center py-8 mb-8 bg-black/40 rounded-2xl border border-white/5">
        <div className="text-4xl md:text-6xl font-serif text-white flex items-center gap-4 tracking-wider">
          <span className="text-purple-400 font-bold">P</span>
          <span className="text-slate-500">=</span>
          <span className="text-amber-400">ρ</span>
          <span className="text-slate-400">·</span>
          <span className="text-sky-400">R</span>
          <span className="text-slate-400">·</span>
          <span className="text-rose-400">T</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-slate-800/50 p-5 rounded-xl border border-purple-500/20">
          <div className="text-2xl font-bold text-purple-400 mb-2">P</div>
          <h4 className="font-semibold text-slate-200 mb-1">{isAr ? 'الضغط' : 'Pressure'}</h4>
          <p className="text-sm text-slate-400">{isAr ? 'يقل مع الارتفاع في الغلاف الجوي.' : 'Decreases with altitude in the atmosphere.'}</p>
        </div>
        <div className="bg-slate-800/50 p-5 rounded-xl border border-amber-500/20">
          <div className="text-2xl font-bold text-amber-400 mb-2">ρ</div>
          <h4 className="font-semibold text-slate-200 mb-1">{isAr ? 'الكثافة' : 'Density'}</h4>
          <p className="text-sm text-slate-400">{isAr ? 'كمية الكتلة في حجم معين. تقل مع الارتفاع.' : 'Mass per unit volume. Decreases with altitude.'}</p>
        </div>
        <div className="bg-slate-800/50 p-5 rounded-xl border border-sky-500/20">
          <div className="text-2xl font-bold text-sky-400 mb-2">R</div>
          <h4 className="font-semibold text-slate-200 mb-1">{isAr ? 'ثابت الغاز' : 'Gas Constant'}</h4>
          <p className="text-sm text-slate-400">{isAr ? 'قيمة ثابتة للهواء الجاف.' : 'A constant value for dry air.'}</p>
        </div>
        <div className="bg-slate-800/50 p-5 rounded-xl border border-rose-500/20">
          <div className="text-2xl font-bold text-rose-400 mb-2">T</div>
          <h4 className="font-semibold text-slate-200 mb-1">{isAr ? 'درجة الحرارة' : 'Temperature'}</h4>
          <p className="text-sm text-slate-400">{isAr ? 'تقاس بالكلفن، تقل عادة في طبقة التروبوسفير.' : 'Measured in Kelvin, generally decreases in the troposphere.'}</p>
        </div>
      </div>
    </motion.div>
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

export default function AerodynamicsTab() {
  const { language } = useAcademy();
  const data = chapter1Data;
  const { markModuleComplete } = useProgress();
  const [isCompleted, setIsCompleted] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [showQuiz, setShowQuiz] = useState(false);

  const aerodynamicsQuestions = [
    {
      question: "Which two factors primarily determine the Moment around a pivot?",
      options: ["Speed and Density", "Force and Distance", "Weight and Thrust", "Temperature and Pressure"],
      correctAnswer: 1,
      explanation: "A moment is calculated by multiplying the applied Force by its perpendicular Distance from the pivot."
    },
    {
      question: "If an aircraft pitches UP, it is rotating around which axis?",
      options: ["Longitudinal Axis", "Vertical Axis", "Lateral Axis", "Horizontal Axis"],
      correctAnswer: 2,
      explanation: "Pitch is rotation around the Lateral (wing-to-wing) axis."
    },
    {
      question: "Which layer of the atmosphere contains most of the weather and decreases in temperature as altitude increases?",
      options: ["Stratosphere", "Mesosphere", "Troposphere", "Thermosphere"],
      correctAnswer: 2,
      explanation: "The Troposphere is the lowest layer where temperature drops at roughly 2°C per 1,000 ft."
    }
  ];

  const handleQuizComplete = (score) => {
    if (score >= 70) {
      setIsCompleted(true);
    }
    // We don't automatically close the modal so they can see the results screen
  };

  return (
    <div className="min-h-screen bg-[#020617] text-slate-200 overflow-y-auto edu-scroll pb-32">
      <div className="max-w-7xl mx-auto px-8 pt-16">
        
        {/* HERO SECTION */}
        <AnimatedSection className="text-center max-w-4xl mx-auto mb-32">
          {data.intro[language]}
        </AnimatedSection>

        {/* DEFINITIONS & MOMENT LAB */}
        <AnimatedSection className="mb-32">
          {data.definitions[language]}
          <MomentLab language={language} />
        </AnimatedSection>

        {/* FORCES & DIAGNOSTIC */}
        <AnimatedSection>
          {data.forces[language]}
          <ForcesLab language={language} />
        </AnimatedSection>

        {/* AXES & 3D PLANE */}
        <AnimatedSection>
          {data.axes[language]}
          <InteractiveAxes language={language} />
        </AnimatedSection>

        {/* ATMOSPHERE & PROPERTIES */}
        <AnimatedSection>
          {data.layers[language]}
          
          <div className="my-12">
            <InteractiveAtmosphere language={language} />
          </div>

          <div className="my-12">
            <AirPropertiesLab language={language} />
          </div>
        </AnimatedSection>

        {/* SUMMARY */}
        <AnimatedSection>
          {data.summary[language]}
          
          <div className="mt-16 flex justify-center pb-16">
            <button
              onClick={() => setShowQuiz(true)}
              disabled={isCompleted}
              className={`flex items-center gap-3 px-8 py-4 rounded-2xl font-bold text-lg transition-all duration-300 shadow-xl ${
                isCompleted 
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/50 cursor-not-allowed scale-100' 
                  : 'bg-gradient-to-r from-sky-500 to-indigo-600 text-white hover:scale-105 hover:shadow-[0_0_30px_rgba(14,165,233,0.5)] border border-sky-400/50'
              }`}
            >
              <CheckCircle2 className={isCompleted ? "animate-pulse" : ""} />
              {isCompleted ? (language === 'ar' ? 'تم اجتياز الاختبار' : 'Module Passed!') : 
               (language === 'ar' ? 'بدء اختبار الوحدة' : 'Take Module Quiz')}
            </button>
          </div>
        </AnimatedSection>

        <QuizModal
          isOpen={showQuiz}
          onClose={() => setShowQuiz(false)}
          moduleId="aerodynamics_101"
          moduleTitle="Aerodynamics 101"
          questions={aerodynamicsQuestions}
          onComplete={handleQuizComplete}
        />

      </div>
    </div>
  );
}
