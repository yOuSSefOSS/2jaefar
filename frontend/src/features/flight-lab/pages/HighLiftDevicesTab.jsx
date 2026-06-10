import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip, Legend } from 'recharts';
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

export default function HighLiftDevicesTab() {
  const { language } = useAcademy();
  const isAr = language === 'ar';

  const [flapAngle, setFlapAngle] = useState(0); // 0 to 40
  const [slatExt, setSlatExt] = useState(0); // 0 to 10
  const [flapType, setFlapType] = useState('plain'); // plain, split, slotted, fowler

  const flapTypes = [
    { id: 'plain', name: isAr ? 'عادي' : 'Plain', multiplier: 0.8 },
    { id: 'split', name: isAr ? 'منقسم' : 'Split', multiplier: 1.0 },
    { id: 'slotted', name: isAr ? 'مشقوق' : 'Slotted', multiplier: 1.3 },
    { id: 'fowler', name: isAr ? 'فاولر' : 'Fowler', multiplier: 1.8 }
  ];

  // Generate CL vs Alpha curve
  const generateLiftCurve = () => {
    const data = [];
    const baseClMax = 1.2;
    const baseStallAlpha = 15;
    
    const selectedFlap = flapTypes.find(f => f.id === flapType) || flapTypes[0];
    const dClMax_flap = (flapAngle / 40) * selectedFlap.multiplier; 
    const dAlpha_flap = -(flapAngle / 40) * (selectedFlap.multiplier * 2); 

    const dClMax_slat = (slatExt / 10) * 0.4;
    const dAlpha_slat = (slatExt / 10) * 5;

    const currentClMax = baseClMax + dClMax_flap + dClMax_slat;
    const currentStallAlpha = baseStallAlpha + dAlpha_flap + dAlpha_slat;

    for (let alpha = -5; alpha <= 25; alpha += 1) {
      // Base curve
      let cl_base = 0.1 * alpha + 0.2;
      if (alpha > baseStallAlpha) cl_base = baseClMax - 0.1 * (alpha - baseStallAlpha);

      // Current curve
      let cl_current = 0.1 * (alpha - dAlpha_slat) + 0.2 + (dClMax_flap);
      if (alpha > currentStallAlpha) cl_current = currentClMax - 0.1 * (alpha - currentStallAlpha);

      data.push({
        alpha,
        Base: parseFloat(Math.max(-0.5, cl_base).toFixed(2)),
        Current: parseFloat(Math.max(-0.5, cl_current).toFixed(2))
      });
    }
    return { data, currentClMax: currentClMax.toFixed(2), currentStallAlpha: currentStallAlpha.toFixed(1) };
  };

  const { data, currentClMax, currentStallAlpha } = generateLiftCurve();

  return (
    <div className="flex-1 overflow-y-auto overflow-x-hidden relative bg-[#020617] edu-scroll">
      
      {/* Background Animated Atmosphere */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-30 animate-[pulse_8s_ease-in-out_infinite]" />
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-sky-500/10 blur-[120px] rounded-full animate-[spin_40s_linear_infinite]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-indigo-500/10 blur-[120px] rounded-full animate-[spin_50s_linear_infinite_reverse]" />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-8 py-12">
        
        <header className="mb-12 border-b border-white/10 pb-8 text-center">
          <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-emerald-400 tracking-tight mb-4">
            {isAr ? 'أجهزة الرفع العالي (High Lift Devices)' : 'High Lift Devices'}
          </h1>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto">
            {isAr ? 'تعرف على كيفية استخدام القلابات (Flaps) والسديلات (Slats) لزيادة الرفع أثناء الإقلاع والهبوط بسرعات منخفضة.' : 'Discover how Flaps and Slats increase wing area and camber to generate massive lift at low takeoff and landing speeds.'}
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-12">
          
          {/* THE WING CONSTRUCTOR */}
          <div className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl flex flex-col">
            <h2 className="text-xl font-bold text-white mb-4 uppercase tracking-widest text-sm flex justify-between items-center">
              <span>{isAr ? 'تجميع الجناح' : 'The Wing Constructor'}</span>
            </h2>
            
            {/* Flap Type Selector */}
            <div className="flex gap-2 mb-6">
              {flapTypes.map(ft => (
                <button
                  key={ft.id}
                  onClick={() => setFlapType(ft.id)}
                  className={`flex-1 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all duration-300 ${
                    flapType === ft.id 
                      ? 'bg-sky-500 text-white shadow-[0_0_15px_rgba(14,165,233,0.4)]' 
                      : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                  }`}
                >
                  {ft.name}
                </button>
              ))}
            </div>

            {/* Interactive SVG Wing */}
            <div className="flex-1 relative min-h-[250px] mb-8 flex items-center justify-center bg-black/40 rounded-2xl border border-white/5 overflow-hidden">
               {/* Wind lines */}
               <div className="absolute inset-0 opacity-20 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0iTTAgMjAgTDEwMCAyMCIgc3Ryb2tlPSIjZmZmIiBzdHJva2Utd2lkdGg9IjEiIHN0cm9rZS1kYXNoYXJyYXk9IjQgNCIvPjwvc3ZnPg==')] animate-[pan_2s_linear_infinite]" />
               
               <svg viewBox="-20 -40 160 80" className="w-full h-full drop-shadow-[0_0_20px_rgba(56,189,248,0.5)] overflow-visible">
                 <defs>
                   <linearGradient id="wingGrad" x1="0" y1="0" x2="0" y2="1">
                     <stop offset="0%" stopColor="#38bdf8" />
                     <stop offset="100%" stopColor="#0284c7" />
                   </linearGradient>
                 </defs>
                 
                 {/* Main Body */}
                 {flapType === 'split' ? (
                   // For split flap, the upper trailing edge is static
                   <path d="M 10,-8 C 30,-15 60,-10 80,-2 C 85,0 95,-1 100,-2 C 95,-1 80,5 78,5 C 50,8 20,5 10,2 C 10,-2 10,-6 10,-8 Z" fill="url(#wingGrad)" stroke="#bae6fd" strokeWidth="0.5" />
                 ) : (
                   <path d="M 10,-8 C 30,-15 60,-10 80,-2 L 78,5 C 50,8 20,5 10,2 C 10,-2 10,-6 10,-8 Z" fill="url(#wingGrad)" stroke="#bae6fd" strokeWidth="0.5" />
                 )}
                 
                 {/* Slat (Extends forward and down) */}
                 <g style={{ transform: `translate(${-slatExt * 0.8}px, ${slatExt * 0.6}px) rotate(${-slatExt * 1.5}deg)`, transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)' }}>
                   <path d="M 0,0 C -2,-8 5,-12 12,-10 C 8,-5 8,-2 8,2 C 5,5 0,5 0,0 Z" fill="url(#wingGrad)" stroke="#bae6fd" strokeWidth="0.5" />
                 </g>
                 
                 {/* Flap Configuration */}
                 <g style={{ 
                    transform: flapType === 'fowler' 
                      ? `translate(${78 + flapAngle * 0.5}px, ${1 + flapAngle * 0.2}px) rotate(${flapAngle}deg)` 
                      : `translate(78px, 1px) rotate(${flapAngle}deg)`, 
                    transformOrigin: '0px 0px', 
                    transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)' 
                 }}>
                   {flapType === 'split' ? (
                     // Split flap is just the bottom part
                     <path d="M 0,1 L 23,2 C 15,4 5,4 0,3 Z" fill="url(#wingGrad)" stroke="#bae6fd" strokeWidth="0.5" />
                   ) : flapType === 'slotted' ? (
                     // Slotted has a small gap
                     <path d="M 2,-1 C 10,-2 20,-1 25,0 L 23,3 C 15,5 5,4 2,2 Z" fill="url(#wingGrad)" stroke="#bae6fd" strokeWidth="0.5" />
                   ) : flapType === 'fowler' ? (
                     // Fowler is similar to slotted but translates
                     <path d="M 2,-1 C 12,-2 22,-1 28,0 L 26,3 C 18,5 8,4 2,2 Z" fill="url(#wingGrad)" stroke="#bae6fd" strokeWidth="0.5" />
                   ) : (
                     // Plain flap
                     <path d="M 0,-3 C 10,-3 20,-2 25,-1 L 23,2 C 15,4 5,4 0,3 C 1,1 1,-1 0,-3 Z" fill="url(#wingGrad)" stroke="#bae6fd" strokeWidth="0.5" />
                   )}
                 </g>
               </svg>
            </div>

            {/* Controls */}
            <div className="space-y-6">
              <ModernSlider 
                label={isAr ? 'زاوية القلابات (Flaps)' : 'Trailing Edge Flap Angle'}
                unit="°"
                min={0}
                max={40}
                value={flapAngle}
                onChange={setFlapAngle}
                color="#0ea5e9"
              />
              <ModernSlider 
                label={isAr ? 'تمديد السديلات (Slats)' : 'Leading Edge Slat Extension'}
                unit="%"
                min={0}
                max={10}
                value={slatExt}
                onChange={setSlatExt}
                color="#10b981"
              />
            </div>
          </div>

          {/* AERODYNAMIC EFFECTS CHART */}
          <div className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl flex flex-col">
            <h2 className="text-xl font-bold text-white mb-2 uppercase tracking-widest text-sm">
              {isAr ? 'منحنى الرفع (Lift Curve)' : 'Lift Curve Analysis'}
            </h2>
            <div className="flex justify-between items-center mb-6 text-sm">
              <div className="text-slate-400">
                Max Lift (C<sub className="text-[10px]">L,max</sub>): <span className="font-mono text-emerald-400 font-bold text-lg">{currentClMax}</span>
              </div>
              <div className="text-slate-400">
                Stall Angle: <span className="font-mono text-red-400 font-bold text-lg">{currentStallAlpha}°</span>
              </div>
            </div>

            <div className="flex-1 w-full min-h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} />
                  <XAxis 
                    dataKey="alpha" 
                    type="number" 
                    domain={[-5, 25]} 
                    stroke="#64748b" 
                    label={{ value: 'Angle of Attack (α)', position: 'bottom', fill: '#94a3b8', fontSize: 12 }} 
                  />
                  <YAxis 
                    domain={[0, 3]} 
                    stroke="#64748b" 
                    label={{ value: 'Lift Coefficient (CL)', angle: -90, position: 'insideLeft', fill: '#94a3b8', fontSize: 12 }} 
                  />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#f8fafc' }} 
                    itemStyle={{ fontWeight: 'bold' }}
                  />
                  <Legend verticalAlign="top" height={36} wrapperStyle={{ fontSize: '12px' }}/>
                  
                  <Line 
                    type="monotone" 
                    dataKey="Base" 
                    name="Clean Wing"
                    stroke="#64748b" 
                    strokeWidth={2} 
                    strokeDasharray="5 5"
                    dot={false}
                    isAnimationActive={false}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="Current" 
                    name="With High-Lift Devices"
                    stroke="#0ea5e9" 
                    strokeWidth={4} 
                    dot={false}
                    isAnimationActive={true}
                    animationDuration={300}
                  />
                </LineChart>
              </ResponsiveContainer>
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
          <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-sky-400 to-emerald-400" />
          
          <h2 className="text-2xl font-bold text-white mb-6">
            {isAr ? 'الرياضيات وراء الرفع العالي' : 'The Math Behind High Lift'}
          </h2>
          
          <div className="flex flex-col lg:flex-row gap-10 items-center">
            <div className="flex-1">
              <p className="text-slate-300 leading-relaxed mb-4">
                {isAr 
                  ? 'تعمل أجهزة الرفع العالي على تعديل شكل الجناح الأساسي لزيادة الرفع أثناء الإقلاع والهبوط. القلابات (Flaps) تزيد من انحناء الجناح ومساحته (S)، مما يرفع قيمة (CL). بينما تقوم السديلات (Slats) بتوجيه الهواء لتأخير انفصال الطبقة الجدارية، مما يسمح بزوايا هجوم أعلى قبل حدوث الانهيار.'
                  : 'High lift devices modify the basic wing shape to generate more lift during takeoff and landing. Flaps increase the wing camber and area (S), drastically increasing CL. Slats energize the boundary layer, delaying flow separation and allowing for much higher angles of attack before stall occurs.'}
              </p>
              <div className="bg-black/50 border border-slate-700/50 p-6 rounded-xl font-mono text-center text-lg text-emerald-300 shadow-inner">
                L = ½ ρ v² (S + ΔS) (C<sub className="text-sm">L</sub> + ΔC<sub className="text-sm">L</sub>)
              </div>
            </div>
            
            <div className="w-full lg:w-1/3 bg-slate-900/80 p-6 rounded-2xl border border-white/5">
              <h3 className="text-sky-400 font-bold mb-3">{isAr ? 'لماذا نستخدمها؟' : 'Why do we need them?'}</h3>
              <ul className="space-y-3 text-sm text-slate-400">
                <li className="flex items-start gap-2">
                  <span className="text-emerald-500">✓</span> 
                  {isAr ? 'تقليل سرعة الهبوط الآمنة' : 'Dramatically lower safe landing speeds'}
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-500">✓</span> 
                  {isAr ? 'تقليل مسافة المدرج المطلوبة' : 'Reduce required runway distance'}
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-500">✓</span> 
                  {isAr ? 'زيادة الرؤية للطيار (مقدمة الطائرة لأسفل)' : 'Better pilot visibility (lower nose pitch on approach)'}
                </li>
              </ul>
            </div>
          </div>
        </motion.div>

      </div>
    </div>
  );
}
