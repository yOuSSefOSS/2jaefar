import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { useAcademy } from '../../../context/AcademyContext';

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

export default function ControlsTab() {
  const { language } = useAcademy();
  const isAr = language === 'ar';

  const [pitch, setPitch] = useState(0); // Elevator
  const [roll, setRoll] = useState(0); // Ailerons
  const [yaw, setYaw] = useState(0); // Rudder

  // Adverse yaw coupling (roll induces opposite yaw)
  const adverseYaw = -roll * 0.3;
  const effectiveYaw = yaw + adverseYaw;

  return (
    <div className="flex-1 overflow-y-auto overflow-x-hidden relative bg-[#020617] edu-scroll">
      
      {/* Background Animated Atmosphere */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-30 animate-[pulse_8s_ease-in-out_infinite]" />
        <div className="absolute top-[10%] right-[-10%] w-[50%] h-[50%] bg-fuchsia-500/10 blur-[120px] rounded-full animate-[spin_40s_linear_infinite]" />
        <div className="absolute bottom-[10%] left-[-10%] w-[50%] h-[50%] bg-sky-500/10 blur-[120px] rounded-full animate-[spin_50s_linear_infinite_reverse]" />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-8 py-12">
        
        <header className="mb-12 border-b border-white/10 pb-8 text-center">
          <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-sky-400 via-fuchsia-400 to-emerald-400 tracking-tight mb-4">
            {isAr ? 'أسطح التحكم (Flight Controls)' : 'Flight Controls'}
          </h1>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto">
            {isAr ? 'اكتشف كيف تتحكم الطائرة في محاورها الثلاثة (التدحرج، الانعراج، الانحدار) والعزوم الناتجة.' : 'Master the primary control surfaces across the 3 axes of flight and the moments they generate.'}
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-12">
          
          {/* THEORETICAL EXPLORER */}
          <div className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl flex flex-col">
            <h2 className="text-xl font-bold text-white mb-6 uppercase tracking-widest text-sm">
              {isAr ? 'الأسطح الرئيسية' : 'Primary Surfaces'}
            </h2>
            
            <ul className="space-y-6">
              <motion.li whileHover={{ scale: 1.02 }} className="bg-slate-950/80 p-5 rounded-2xl border border-sky-500/30 shadow-[0_0_15px_rgba(14,165,233,0.1)]">
                <div className="flex items-center gap-4 mb-2">
                  <div className="bg-sky-500 text-white font-bold px-3 py-1 rounded-lg text-xs tracking-widest uppercase">ELEVATOR</div>
                  <h3 className="text-sky-400 font-bold">{isAr ? 'المصعد (الانحدار)' : 'Pitch (Lateral Axis)'}</h3>
                </div>
                <p className="text-slate-300 text-sm leading-relaxed">
                  {isAr ? 'يتحكم في الانحدار (لأعلى/لأسفل). يعمل بتغيير الرفع على الذيل الأفقي، مما يخلق عزماً حول مركز الثقل.' : 'Controls Pitch (Nose Up/Down). Modifies lift on the horizontal tail, creating a moment around the CG.'}
                </p>
              </motion.li>

              <motion.li whileHover={{ scale: 1.02 }} className="bg-slate-950/80 p-5 rounded-2xl border border-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.1)]">
                <div className="flex items-center gap-4 mb-2">
                  <div className="bg-emerald-500 text-white font-bold px-3 py-1 rounded-lg text-xs tracking-widest uppercase">AILERON</div>
                  <h3 className="text-emerald-400 font-bold">{isAr ? 'الجنيحات (التدحرج)' : 'Roll (Longitudinal Axis)'}</h3>
                </div>
                <p className="text-slate-300 text-sm leading-relaxed">
                  {isAr ? 'تتحكم في التدحرج (يمين/يسار). تعمل بشكل متعاكس لخلق رفع غير متماثل وعزم دوران. تسبب الانعراج العكسي (Adverse Yaw).' : 'Controls Roll (Bank). Actuate asymmetrically to create a rolling moment. Generates Adverse Yaw due to asymmetric drag.'}
                </p>
              </motion.li>

              <motion.li whileHover={{ scale: 1.02 }} className="bg-slate-950/80 p-5 rounded-2xl border border-fuchsia-500/30 shadow-[0_0_15px_rgba(217,70,239,0.1)]">
                <div className="flex items-center gap-4 mb-2">
                  <div className="bg-fuchsia-500 text-white font-bold px-3 py-1 rounded-lg text-xs tracking-widest uppercase">RUDDER</div>
                  <h3 className="text-fuchsia-400 font-bold">{isAr ? 'الدหة (الانعراج)' : 'Yaw (Vertical Axis)'}</h3>
                </div>
                <p className="text-slate-300 text-sm leading-relaxed">
                  {isAr ? 'تتحكم في الانعراج (مقدمة الطائرة يميناً/يساراً). تستخدم أساساً لتنسيق المنعطفات ومواجهة الانعراج العكسي.' : 'Controls Yaw (Nose Left/Right). Used primarily to coordinate turns and counteract adverse yaw, not for steering!'}
                </p>
              </motion.li>
            </ul>
          </div>

          {/* COCKPIT SIMULATOR WIDGET */}
          <div className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl flex flex-col">
            <h2 className="text-xl font-bold text-white mb-6 uppercase tracking-widest text-sm">
              {isAr ? 'محاكي التحكم' : 'Control Simulator'}
            </h2>

            {/* 3D Visualizer */}
            <div className="w-full h-[250px] bg-slate-950/80 rounded-2xl border border-white/5 mb-8 relative flex items-center justify-center overflow-hidden shadow-inner" style={{ perspective: '800px' }}>
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-indigo-900/20 via-transparent to-transparent" />
              
              <div 
                className="relative w-48 h-48 transition-transform duration-300 ease-out"
                style={{ 
                  transformStyle: 'preserve-3d',
                  transform: `rotateX(${-pitch}deg) rotateZ(${-effectiveYaw}deg) rotateY(${roll}deg)` 
                }}
              >
                {/* Neon Airplane Skeleton */}
                {/* Fuselage */}
                <div className="absolute top-1/2 left-1/2 w-4 h-48 bg-slate-800 rounded-full transform -translate-x-1/2 -translate-y-1/2 shadow-[0_0_15px_rgba(255,255,255,0.2)] border border-slate-600" />
                {/* Wings */}
                <div className="absolute top-1/2 left-1/2 w-56 h-6 bg-slate-800 rounded-full transform -translate-x-1/2 -mt-4 shadow-[0_0_15px_rgba(16,185,129,0.4)] border border-emerald-500/50">
                   {/* Left Aileron (up if roll > 0) */}
                   <div className="absolute bottom-0 left-2 w-16 h-2 bg-emerald-500 origin-top transition-transform" style={{ transform: `rotateX(${roll > 0 ? -30 : roll < 0 ? 30 : 0}deg)`}} />
                   {/* Right Aileron */}
                   <div className="absolute bottom-0 right-2 w-16 h-2 bg-emerald-500 origin-top transition-transform" style={{ transform: `rotateX(${roll > 0 ? 30 : roll < 0 ? -30 : 0}deg)`}} />
                </div>
                {/* Horizontal Tail */}
                <div className="absolute bottom-4 left-1/2 w-20 h-4 bg-slate-800 rounded-full transform -translate-x-1/2 shadow-[0_0_15px_rgba(14,165,233,0.4)] border border-sky-500/50">
                   {/* Elevator */}
                   <div className="absolute bottom-0 left-1 right-1 h-2 bg-sky-500 origin-top transition-transform" style={{ transform: `rotateX(${pitch * 1.5}deg)`}} />
                </div>
                {/* Vertical Tail */}
                <div className="absolute bottom-4 left-1/2 w-1 h-12 bg-slate-800 rounded-t transform -translate-x-1/2 origin-bottom rotate-x-90 border border-fuchsia-500/50" style={{ transform: 'translateX(-50%) rotateX(-90deg) translateY(-12px)' }}>
                   {/* Rudder */}
                   <div className="absolute top-1 bottom-0 right-0 w-4 bg-fuchsia-500 origin-left transition-transform" style={{ transform: `rotateY(${-yaw * 1.5}deg)`}} />
                </div>
              </div>
            </div>

            {/* Glowing Sliders */}
            <div className="space-y-4">
              <ModernSlider 
                label={isAr ? 'المصعد (Pitch)' : 'Elevator (Pitch)'}
                unit="°" min={-30} max={30} value={pitch} onChange={setPitch}
                color="#0ea5e9"
              />
              <ModernSlider 
                label={isAr ? 'الجنيحات (Roll)' : 'Ailerons (Roll)'}
                unit="°" min={-60} max={60} value={roll} onChange={setRoll}
                color="#10b981"
              />
              <ModernSlider 
                label={isAr ? 'الدفة (Yaw)' : 'Rudder (Yaw)'}
                unit="°" min={-30} max={30} value={yaw} onChange={setYaw}
                color="#d946ef"
              />

              {Math.abs(adverseYaw) > 5 && (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl mt-4 flex flex-col md:flex-row items-center justify-between gap-4"
                >
                  <div className="text-xs text-red-400">
                    <span className="font-bold uppercase tracking-widest mb-1 block">⚠️ {isAr ? 'الانعراج العكسي!' : 'Adverse Yaw Detected!'}</span> 
                    {isAr ? 'مقاومة الجنيحات تسحب مقدمة الطائرة خارج المسار.' : 'Aileron drag is pulling the nose off course.'}
                  </div>
                  <button 
                    onClick={() => setYaw(Math.round(-adverseYaw))} 
                    className="px-4 py-2 bg-red-500/20 hover:bg-red-500/40 rounded-lg text-red-300 font-bold text-xs uppercase tracking-widest transition-colors whitespace-nowrap"
                  >
                    {isAr ? 'تطبيق الدفة' : 'Apply Rudder'}
                  </button>
                </motion.div>
              )}
            </div>

          </div>

        </div>

        {/* MATH EQUATION SECTION */}
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: true }}
          className="relative bg-gradient-to-br from-slate-800/50 to-slate-900/50 rounded-3xl p-10 border border-slate-700 shadow-2xl overflow-hidden mb-24"
        >
          <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-fuchsia-400 to-sky-400" />
          
          <h2 className="text-2xl font-bold text-white mb-6">
            {isAr ? 'الرياضيات وراء التحكم' : 'The Physics of Control'}
          </h2>
          
          <div className="flex flex-col lg:flex-row gap-10 items-center">
            <div className="flex-1">
              <p className="text-slate-300 leading-relaxed mb-6">
                {isAr 
                  ? 'يعتمد التحكم في الطائرة على مبدأ العزوم (Moments). السطح يخلق قوة (F)، وبعد هذه القوة عن مركز الثقل هو الذراع (d). العزم الكلي يساوي القوة مضروبة في الذراع.'
                  : 'Aircraft control relies entirely on Moments (Torque). A control surface generates an aerodynamic Force (F) at a specific Distance (d) from the Center of Gravity. The total Moment is the product of Force and Distance.'}
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-black/40 border border-sky-500/20 p-4 rounded-xl text-center">
                  <div className="text-sky-400 text-xs font-bold mb-2 uppercase tracking-widest">Pitching Moment</div>
                  <div className="font-mono text-white text-sm">M = L<sub className="text-[10px]">t</sub> × l<sub className="text-[10px]">t</sub></div>
                </div>
                <div className="bg-black/40 border border-emerald-500/20 p-4 rounded-xl text-center">
                  <div className="text-emerald-400 text-xs font-bold mb-2 uppercase tracking-widest">Rolling Moment</div>
                  <div className="font-mono text-white text-sm">L = ΔL × y</div>
                </div>
                <div className="bg-black/40 border border-fuchsia-500/20 p-4 rounded-xl text-center">
                  <div className="text-fuchsia-400 text-xs font-bold mb-2 uppercase tracking-widest">Yawing Moment</div>
                  <div className="font-mono text-white text-sm">N = Y<sub className="text-[10px]">v</sub> × l<sub className="text-[10px]">v</sub></div>
                </div>
              </div>
            </div>
            
            <div className="w-full lg:w-1/3 bg-slate-900/80 p-6 rounded-2xl border border-white/5">
              <h3 className="text-fuchsia-400 font-bold mb-3">{isAr ? 'التأثير المزدوج (Coupling)' : 'Coupling Effects'}</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                {isAr 
                  ? 'أسطح التحكم نادراً ما تؤثر على محور واحد فقط. التدحرج يسبب انعراجاً عكسياً، والانعراج يسبب تدحرجاً بسبب اختلاف سرعة الأجنحة.'
                  : 'Control inputs rarely affect just one axis. Rolling causes Adverse Yaw, and Yawing causes Rolling (due to speed difference between wings). Pilots must coordinate controls!'}
              </p>
            </div>
          </div>
        </motion.div>

      </div>
    </div>
  );
}
