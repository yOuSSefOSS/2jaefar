import React, { useState } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useAcademy } from '../../../context/AcademyContext';
import { chapter1Data } from '../data/chapter1';
import ThreeDPlane from '../components/ThreeDPlane';

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

const InteractiveAtmosphere = ({ language }) => {
  const [altitude, setAltitude] = useState(0); // 0 to 100 km

  const t = {
    title: { en: "Interactive Atmosphere", ar: "الغلاف الجوي التفاعلي" },
    layer: { en: "Layer", ar: "الطبقة" },
    temp: { en: "Temperature", ar: "درجة الحرارة" },
    pressure: { en: "Pressure", ar: "الضغط" },
    seaLevel: { en: "Sea Level (0 km)", ar: "مستوى سطح البحر (0 كم)" },
    spaceBoundary: { en: "Space Boundary (100 km)", ar: "حدود الفضاء (100 كم)" },
    currentAlt: { en: "Current Altitude", ar: "الارتفاع الحالي" },
    tropo: { en: "Troposphere", ar: "التروبوسفير" },
    strato: { en: "Stratosphere", ar: "الستراتوسفير" },
    meso: { en: "Mesosphere", ar: "الميزوسفير" }
  };

  // Calculations based on standard atmosphere model (simplified)
  let layer = t.tropo[language];
  let temp = 15 - (altitude * 6.5); // drops 6.5C per km in troposphere
  let pressure = 1013 * Math.exp(-altitude / 8); // approximate exponential decay
  let bgClass = "from-sky-500 to-sky-900";
  let cloudsOpacity = Math.max(0, 1 - (altitude / 12));
  let starsOpacity = Math.min(1, Math.max(0, (altitude - 12) / 30));

  if (altitude > 12 && altitude <= 50) {
    layer = t.strato[language];
    temp = -56.5 + ((altitude - 12) * 1.5); // Temp rises due to ozone
    bgClass = "from-indigo-900 to-[#020617]";
  } else if (altitude > 50) {
    layer = t.meso[language];
    temp = -5 + ((altitude - 50) * -2.5); // Temp drops sharply
    bgClass = "from-[#020617] to-black";
  }

  return (
    <div className={`w-full max-w-5xl mx-auto my-24 p-8 bg-slate-900/50 rounded-3xl border border-white/10 backdrop-blur-md ${language === 'ar' ? 'text-right' : ''}`}>
      <h3 className="text-3xl font-bold text-white mb-6 text-center">{t.title[language]}</h3>
      
      <div className={`relative w-full h-[500px] rounded-2xl overflow-hidden shadow-2xl bg-gradient-to-t ${bgClass} transition-colors duration-1000 flex`}>
        {/* Parallax Elements */}
        <div className="absolute inset-0 transition-opacity duration-1000" style={{ opacity: starsOpacity }}>
          <div className="w-full h-full bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-50"></div>
        </div>
        <div className="absolute inset-0 transition-opacity duration-1000" style={{ opacity: cloudsOpacity }}>
           <div className="w-full h-full flex items-end justify-center pb-24 space-x-12 opacity-30 blur-sm">
             <div className="text-9xl">☁️</div>
             <div className="text-8xl">☁️</div>
             <div className="text-9xl">☁️</div>
           </div>
        </div>

        {/* Flight Data Dashboard */}
        <div className="absolute top-6 left-6 right-6 flex justify-between gap-4 z-10">
          <div className="bg-black/60 backdrop-blur-md border border-white/10 rounded-xl p-4 flex-1 text-center">
            <div className="text-sky-400 text-xs font-bold tracking-widest uppercase">{t.layer[language]}</div>
            <div className="text-2xl font-bold text-white">{layer}</div>
          </div>
          <div className="bg-black/60 backdrop-blur-md border border-white/10 rounded-xl p-4 flex-1 text-center">
            <div className="text-amber-400 text-xs font-bold tracking-widest uppercase">{t.temp[language]}</div>
            <div className="text-2xl font-bold text-white" dir="ltr">{temp.toFixed(1)} °C</div>
          </div>
          <div className="bg-black/60 backdrop-blur-md border border-white/10 rounded-xl p-4 flex-1 text-center">
            <div className="text-purple-400 text-xs font-bold tracking-widest uppercase">{t.pressure[language]}</div>
            <div className="text-2xl font-bold text-white" dir="ltr">{pressure.toFixed(1)} hPa</div>
          </div>
        </div>

        {/* Animated Plane */}
        <div className="absolute left-1/2 -translate-x-1/2 transition-all duration-300 ease-out z-20" 
             style={{ bottom: `${(altitude / 100) * 80 + 10}%` }}>
          <div className="text-6xl filter drop-shadow-[0_0_15px_rgba(255,255,255,0.8)] -rotate-90">✈️</div>
        </div>
      </div>

      <div className="mt-8 px-6">
        <div className="flex justify-between text-slate-400 font-bold mb-2">
          <span>{t.seaLevel[language]}</span>
          <span>{t.spaceBoundary[language]}</span>
        </div>
        <ModernSlider 
          min={0} 
          max={100} 
          step={0.5}
          value={altitude} 
          onChange={setAltitude}
          color="#0ea5e9"
        />
        <div className="text-center mt-2 text-sky-400 font-bold text-xl" dir="ltr">{t.currentAlt[language]}: {altitude.toFixed(1)} km</div>
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

const FlightDiagnostic = ({ language }) => {
  const [lift, setLift] = useState(100);
  const [weight, setWeight] = useState(100);
  const [thrust, setThrust] = useState(50);
  const [drag, setDrag] = useState(50);

  const t = {
    status: { en: "Flight Computer Status", ar: "حالة كمبيوتر الطيران" },
    steady: { en: "✓ STEADY LEVEL FLIGHT", ar: "✓ طيران مستوي ومستقر" },
    dynamic: { en: "⚠ DYNAMIC FLIGHT", ar: "⚠ طيران ديناميكي غير مستقر" },
    vertical: { en: "Vertical", ar: "عمودي" },
    horizontal: { en: "Horizontal", ar: "أفقي" },
    lift: { en: "Lift", ar: "الرفع" },
    weight: { en: "Weight", ar: "الوزن" },
    thrust: { en: "Thrust", ar: "الدفع" },
    drag: { en: "Drag", ar: "السحب" },
    reset: { en: "Reset to Steady Level Flight", ar: "إعادة التعيين لطيران مستوي" },
    climbing: { en: "Climbing", ar: "صعود" },
    descending: { en: "Descending", ar: "نزول" },
    level: { en: "Level Flight", ar: "طيران مستوي" },
    accelerating: { en: "Accelerating", ar: "تسارع" },
    decelerating: { en: "Decelerating", ar: "تباطؤ" },
    constant: { en: "Constant Speed", ar: "سرعة ثابتة" }
  };

  let vState = t.level[language];
  let vColor = "text-emerald-400";
  let vBg = "bg-emerald-500/10 border-emerald-500/30";
  if (lift > weight) { vState = t.climbing[language]; vColor = "text-sky-400"; vBg = "bg-sky-500/10 border-sky-500/30"; }
  if (lift < weight) { vState = t.descending[language]; vColor = "text-red-400"; vBg = "bg-red-500/10 border-red-500/30"; }

  let hState = t.constant[language];
  let hColor = "text-emerald-400";
  let hBg = "bg-emerald-500/10 border-emerald-500/30";
  if (thrust > drag) { hState = t.accelerating[language]; hColor = "text-amber-400"; hBg = "bg-amber-500/10 border-amber-500/30"; }
  if (thrust < drag) { hState = t.decelerating[language]; hColor = "text-purple-400"; hBg = "bg-purple-500/10 border-purple-500/30"; }

  const isSteady = lift === weight && thrust === drag;

  return (
    <div className="w-full max-w-5xl mx-auto my-24 grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Diagnostic Panel */}
      <div className={`p-8 rounded-3xl border ${isSteady ? 'bg-emerald-950/30 border-emerald-500/50 shadow-[0_0_50px_rgba(16,185,129,0.2)]' : 'bg-slate-900/50 border-slate-700'} transition-all duration-500 flex flex-col justify-center items-center text-center`}>
        <div className="text-sky-400 text-sm font-bold tracking-widest uppercase mb-4">{t.status[language]}</div>
        
        <div className={`text-4xl font-black mb-4 ${isSteady ? 'text-emerald-400' : 'text-white'}`}>
          {isSteady ? t.steady[language] : t.dynamic[language]}
        </div>
        
        <div className={`flex gap-4 w-full mt-8 ${language === 'ar' ? 'flex-row-reverse' : ''}`}>
          <div className={`flex-1 p-4 rounded-xl border ${vBg} ${vColor} font-bold`}>
            {t.vertical[language]}: {vState}
          </div>
          <div className={`flex-1 p-4 rounded-xl border ${hBg} ${hColor} font-bold`}>
            {t.horizontal[language]}: {hState}
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className={`bg-slate-900/50 p-8 rounded-3xl border border-slate-800 space-y-6 ${language === 'ar' ? 'text-right' : ''}`}>
        <div>
          <ModernSlider label={t.lift[language]} unit="kN" min={50} max={150} value={lift} onChange={setLift} color="#10b981" />
        </div>
        <div>
          <ModernSlider label={t.weight[language]} unit="kN" min={50} max={150} value={weight} onChange={setWeight} color="#ef4444" />
        </div>
        <div className="h-px bg-slate-800 w-full my-4"></div>
        <div>
          <ModernSlider label={t.thrust[language]} unit="kN" min={20} max={80} value={thrust} onChange={setThrust} color="#0ea5e9" />
        </div>
        <div>
          <ModernSlider label={t.drag[language]} unit="kN" min={20} max={80} value={drag} onChange={setDrag} color="#f59e0b" />
        </div>
        
        <button 
          onClick={() => { setLift(100); setWeight(100); setThrust(50); setDrag(50); }}
          className="w-full py-3 mt-4 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-bold transition-colors"
        >
          {t.reset[language]}
        </button>
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
      <div className="relative w-full h-[600px] cursor-grab">
        <ThreeDPlane pitch={pitch} roll={roll} yaw={yaw} />
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

  return (
    <div className="min-h-screen bg-[#020617] text-slate-200 overflow-y-auto edu-scroll pb-32">
      <div className="max-w-7xl mx-auto px-8 pt-16">
        
        {/* HERO SECTION */}
        <AnimatedSection className="text-center max-w-4xl mx-auto mb-32">
          {data.intro[language]}
        </AnimatedSection>

        {/* DEFINITIONS */}
        <AnimatedSection className="mb-32">
          {data.definitions[language]}
        </AnimatedSection>

        {/* FORCES & DIAGNOSTIC */}
        <AnimatedSection>
          {data.forces[language]}
          <FlightDiagnostic language={language} />
        </AnimatedSection>

        {/* AXES & 3D PLANE */}
        <AnimatedSection>
          {data.axes[language]}
          <InteractiveAxes language={language} />
        </AnimatedSection>

        {/* ATMOSPHERE & PROPERTIES */}
        <AnimatedSection>
          {data.layers[language]}
          <InteractiveAtmosphere language={language} />
          <IdealGasLaw language={language} />
        </AnimatedSection>

      </div>
    </div>
  );
}
