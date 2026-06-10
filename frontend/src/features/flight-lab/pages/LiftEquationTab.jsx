import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useAcademy } from '../../../context/AcademyContext';
import EducationalWindTunnel from '../components/EducationalWindTunnel';

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

const FlightStatusBox = ({ aoa, speed, isAr }) => {
  const isStall = aoa > 15;
  const isOptimal = aoa >= 2 && aoa <= 8 && speed > 100;
  return (
    <div className="mt-4 p-4 rounded-xl border border-white/10 bg-black/50 backdrop-blur-md relative overflow-hidden flex flex-col gap-2 shadow-2xl">
      {isStall && <div className="absolute inset-0 bg-red-500/20 animate-pulse pointer-events-none" />}
      <div className="relative z-10 flex items-center justify-between">
        <div>
           <div className="text-[10px] text-slate-400 font-mono tracking-widest uppercase mb-1">{isAr ? 'حالة الطيران' : 'Flight Status'}</div>
           <div className={`text-lg font-black italic tracking-wider uppercase ${isStall ? 'text-red-500' : isOptimal ? 'text-emerald-400' : 'text-sky-400'}`}>
              {isStall ? (isAr ? 'انهيار الرفع' : 'STALL CONDITION') : isOptimal ? (isAr ? 'طيران مثالي' : 'OPTIMAL CRUISE') : (isAr ? 'طيران مستقر' : 'LEVEL FLIGHT')}
           </div>
        </div>
        <div className="flex gap-1 h-8 items-end">
           {[...Array(5)].map((_,i) => (
              <div key={i} className={`w-1.5 rounded-t-sm transition-all duration-300 ${isStall ? 'bg-red-500' : isOptimal ? 'bg-emerald-400' : 'bg-sky-400'}`} style={{ height: `${20 + Math.random() * (isStall ? 80 : 40)}%`, opacity: isStall ? 1 : 0.6 }} />
           ))}
        </div>
      </div>
    </div>
  );
};

// Local computation to avoid pulling in the entire lab module and its broken store dependencies
const computeNACA = (m, p, t, N = 60) => {
  const upper = [];
  const lower = [];
  for (let i = 0; i <= N; i++) {
    const x = (1 - Math.cos(Math.PI * i / N)) / 2;
    const xn = Math.max(0, x);
    const yt = 5 * t * (0.2969 * Math.sqrt(xn + 1e-9) - 0.126 * xn - 0.3516 * xn ** 2 + 0.2843 * xn ** 3 - 0.1015 * xn ** 4);
    let yc, dyc;
    if (m === 0 || p === 0) {
      yc = 0; dyc = 0;
    } else if (xn < p) {
      yc = (m / p ** 2) * (2 * p * xn - xn ** 2);
      dyc = (2 * m / p ** 2) * (p - xn);
    } else {
      yc = (m / (1 - p) ** 2) * (1 - 2 * p + 2 * p * xn - xn ** 2);
      dyc = (2 * m / (1 - p) ** 2) * (p - xn);
    }
    const theta = Math.atan(dyc);
    upper.push([xn - yt * Math.sin(theta) - 0.5, yc + yt * Math.cos(theta)]);
    lower.push([xn + yt * Math.sin(theta) - 0.5, yc - yt * Math.cos(theta)]);
  }
  return [...upper, ...lower.slice(1).reverse()];
};
const NACA4412_POINTS = computeNACA(0.04, 0.4, 0.12);

const AirfoilAnatomy = ({ isAr }) => {
  const [activePart, setActivePart] = useState(null);
  const [camber, setCamber] = useState(4); // 0 to 10%
  const [thickness, setThickness] = useState(12); // 5 to 30%

  const m = camber / 100;
  const p = 0.4;
  const t = thickness / 100;

  // Generate Airfoil Path
  const N = 50;
  const upper = [];
  const lower = [];
  const camberLine = [];
  let maxThicknessYUpper = 0;
  let maxThicknessYLower = 0;
  let maxThicknessX = 0;

  for (let i = 0; i <= N; i++) {
    const x = (1 - Math.cos(Math.PI * i / N)) / 2;
    const xn = Math.max(0, x);
    const yt = 5 * t * (0.2969 * Math.sqrt(xn + 1e-9) - 0.126 * xn - 0.3516 * xn ** 2 + 0.2843 * xn ** 3 - 0.1015 * xn ** 4);
    let yc, dyc;
    if (m === 0 || p === 0) {
      yc = 0; dyc = 0;
    } else if (xn < p) {
      yc = (m / p ** 2) * (2 * p * xn - xn ** 2);
      dyc = (2 * m / p ** 2) * (p - xn);
    } else {
      yc = (m / (1 - p) ** 2) * (1 - 2 * p + 2 * p * xn - xn ** 2);
      dyc = (2 * m / (1 - p) ** 2) * (p - xn);
    }
    const theta = Math.atan(dyc);
    
    // Scale by 100 for SVG and invert Y because SVG Y is down
    const xu = (xn - yt * Math.sin(theta)) * 100;
    const yu = -(yc + yt * Math.cos(theta)) * 100;
    const xl = (xn + yt * Math.sin(theta)) * 100;
    const yl = -(yc - yt * Math.cos(theta)) * 100;
    
    upper.push(`${xu},${yu}`);
    lower.push(`${xl},${yl}`);
    camberLine.push(`${xn * 100},${-yc * 100}`);

    if (i === Math.floor(N * 0.3)) { // Approximate max thickness location
      maxThicknessX = xn * 100;
      maxThicknessYUpper = yu;
      maxThicknessYLower = yl;
    }
  }

  const pathD = `M ${upper.join(' L ')} L ${lower.reverse().join(' L ')} Z`;
  const camberPathD = `M ${camberLine.join(' L ')}`;

  const parts = {
    leadingEdge: {
      id: 'leadingEdge',
      title: isAr ? 'الحافة الأمامية (Leading Edge)' : 'Leading Edge',
      desc: isAr ? 'الجزء الأمامي من الجناح الذي يواجه الهواء أولاً.' : 'The foremost edge of an airfoil section that meets the air first.',
      color: 'text-sky-400',
      border: 'border-sky-500'
    },
    trailingEdge: {
      id: 'trailingEdge',
      title: isAr ? 'الحافة الخلفية (Trailing Edge)' : 'Trailing Edge',
      desc: isAr ? 'الجزء الخلفي حيث يغادر الهواء الجناح.' : 'The rearmost edge of an airfoil where the airflow separates.',
      color: 'text-rose-400',
      border: 'border-rose-500'
    },
    chordLine: {
      id: 'chordLine',
      title: isAr ? 'خط الوتر (Chord Line)' : 'Chord Line',
      desc: isAr ? 'خط مستقيم وهمي يصل بين الحافة الأمامية والخلفية.' : 'An imaginary straight line connecting the leading and trailing edges.',
      color: 'text-emerald-400',
      border: 'border-emerald-500'
    },
    camberLine: {
      id: 'camberLine',
      title: isAr ? 'خط التقوس المتوسط (Mean Camber Line)' : 'Mean Camber Line',
      desc: isAr ? 'الخط الذي يقع في منتصف المسافة بين السطحين العلوي والسفلي.' : 'The locus of points halfway between the upper and lower surfaces.',
      color: 'text-purple-400',
      border: 'border-purple-500'
    },
    thickness: {
      id: 'thickness',
      title: isAr ? 'السمك الأقصى (Max Thickness)' : 'Max Thickness',
      desc: isAr ? 'أقصى مسافة عمودية بين السطح العلوي والسفلي للجناح.' : 'The maximum vertical distance between the upper and lower surfaces.',
      color: 'text-amber-400',
      border: 'border-amber-500'
    }
  };

  return (
    <motion.div 
      initial={{ y: 20, opacity: 0 }}
      whileInView={{ y: 0, opacity: 1 }}
      viewport={{ once: true }}
      className="max-w-6xl mx-auto mb-16 p-8 bg-slate-900/50 rounded-3xl border border-white/10"
    >
      <h2 className="text-3xl font-bold text-white mb-8 text-center">
        {isAr ? 'تشريح المقطع الانسيابي التفاعلي (Interactive Airfoil Anatomy)' : 'Interactive Airfoil Anatomy'}
      </h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 mb-8">
        <div className="lg:col-span-3 relative w-full h-64 flex items-center justify-center bg-black/40 rounded-2xl border border-white/5">
          <svg viewBox="-10 -30 120 60" className="w-full h-full drop-shadow-2xl overflow-visible">
            {/* Airfoil Body */}
            <path 
              d={pathD} 
              fill="rgba(148, 163, 184, 0.2)" 
              stroke="rgba(148, 163, 184, 0.8)" 
              strokeWidth="0.5" 
              className="transition-all duration-300"
            />
            
            {/* Chord Line */}
            <line 
              x1="0" y1="0" x2="100" y2="0" 
              stroke="#10b981" 
              strokeWidth="0.5" 
              strokeDasharray="2,2" 
              className={`transition-opacity duration-300 ${activePart === 'chordLine' ? 'opacity-100' : 'opacity-30'}`} 
            />
            
            {/* Mean Camber Line */}
            <path 
              d={camberPathD} 
              fill="none" 
              stroke="#c084fc" 
              strokeWidth="0.8" 
              strokeDasharray="1,1" 
              className={`transition-all duration-300 ${activePart === 'camberLine' ? 'opacity-100' : 'opacity-30'}`} 
            />

            {/* Max Thickness */}
            <line 
              x1={maxThicknessX} y1={maxThicknessYUpper} x2={maxThicknessX} y2={maxThicknessYLower} 
              stroke="#f59e0b" 
              strokeWidth="0.8" 
              className={`transition-all duration-300 ${activePart === 'thickness' ? 'opacity-100' : 'opacity-0'}`} 
            />

            {/* Leading Edge Highlight */}
            <circle cx="0" cy="0" r="2.5" fill="#38bdf8" className={`transition-all duration-300 ${activePart === 'leadingEdge' ? 'opacity-100 scale-[2]' : 'opacity-0 scale-100'}`} style={{ transformOrigin: '0px 0px' }} />
            {/* Trailing Edge Highlight */}
            <circle cx="100" cy="0" r="2.5" fill="#fb7185" className={`transition-all duration-300 ${activePart === 'trailingEdge' ? 'opacity-100 scale-[2]' : 'opacity-0 scale-100'}`} style={{ transformOrigin: '100px 0px' }} />
          </svg>
        </div>

        <div className="lg:col-span-1 flex flex-col justify-center space-y-6 bg-black/40 p-6 rounded-2xl border border-white/5">
          <ModernSlider 
            label={isAr ? 'السمك (Thickness)' : 'Thickness'}
            unit="%"
            min={5}
            max={30}
            value={thickness}
            onChange={setThickness}
            color="#f59e0b"
          />
          <ModernSlider 
            label={isAr ? 'التقوس (Camber)' : 'Camber'}
            unit="%"
            min={0}
            max={10}
            value={camber}
            onChange={setCamber}
            color="#c084fc"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {Object.values(parts).map(part => (
          <div 
            key={part.id}
            onMouseEnter={() => setActivePart(part.id)}
            onMouseLeave={() => setActivePart(null)}
            className={`p-4 rounded-xl border cursor-default transition-all duration-300 ${activePart === part.id ? `bg-slate-800 ${part.border} shadow-[0_0_15px_rgba(255,255,255,0.1)]` : 'bg-slate-900/50 border-white/5'}`}
          >
            <h4 className={`font-bold mb-2 text-sm ${part.color}`}>{part.title}</h4>
            <p className="text-xs text-slate-400 leading-relaxed">{part.desc}</p>
          </div>
        ))}
      </div>
    </motion.div>
  );
};

export default function HighLiftTab() {
  const { language } = useAcademy();
  const [aoa, setAoa] = useState(5);
  const [speed, setSpeed] = useState(100);
  const [flowActive, setFlowActive] = useState(true);
  
  const isAr = language === 'ar';
  const airfoilData = NACA4412_POINTS;

  return (
    <div className="flex-1 overflow-y-auto overflow-x-hidden relative bg-[#020617]">
      {/* 1. INTERACTIVE HERO - THE WIND TUNNEL */}
      <div className="relative w-full h-[60vh] min-h-[500px] border-b border-white/10 bg-black">
        <EducationalWindTunnel
          isSimulating={true}
          pitchAngle={aoa}
          windSpeed={speed}
          airfoilPoints={airfoilData}
          flowActive={flowActive}
        />
        
        {/* Overlay Controls */}
        <div className={`absolute bottom-8 ${isAr ? 'right-8 text-right' : 'left-8 text-left'} z-10 bg-slate-900/80 backdrop-blur-md border border-white/10 rounded-2xl p-6 max-w-sm`}>
          <h2 className="text-xl font-bold text-white mb-2">
            {isAr ? 'نفق الرياح التفاعلي' : 'Interactive Wind Tunnel'}
          </h2>
          <p className="text-slate-400 text-sm mb-6">
            {isAr ? 'جرب تغيير زاوية الهجوم وسرعة الرياح لترى كيف يتغير الضغط وتنفصل الخطوط الانسيابية.' : 'Experiment with Angle of Attack and Wind Speed to see how pressure distribution changes and streamlines separate.'}
          </p>

          <div className="space-y-4">
            <ModernSlider 
              label={isAr ? 'زاوية الهجوم' : 'Angle of Attack'}
              unit="°"
              min={-10}
              max={25}
              value={aoa}
              onChange={setAoa}
              color="#0ea5e9"
            />
            <ModernSlider 
              label={isAr ? 'سرعة الهواء' : 'Airspeed'}
              unit="kts"
              min={30}
              max={250}
              value={speed}
              onChange={setSpeed}
              color="#10b981"
            />
            <FlightStatusBox aoa={aoa} speed={speed} isAr={isAr} />
            
            <button
              onClick={() => setFlowActive(!flowActive)}
              className="w-full mt-4 py-3 rounded-lg font-mono text-sm font-bold tracking-widest uppercase transition-all duration-300"
              style={{
                background: flowActive ? 'rgba(0, 240, 255, 0.15)' : 'rgba(255, 255, 255, 0.05)',
                color: flowActive ? '#00f0ff' : 'rgba(255, 255, 255, 0.5)',
                border: `1px solid ${flowActive ? 'rgba(0, 240, 255, 0.3)' : 'rgba(255, 255, 255, 0.1)'}`,
                boxShadow: flowActive ? '0 0 20px rgba(0, 240, 255, 0.2)' : 'none'
              }}
            >
              {flowActive ? (isAr ? '⏸ إيقاف التدفق' : '⏸ PAUSE FLOW') : (isAr ? '▶ تشغيل التدفق' : '▶ START FLOW')}
            </button>
          </div>
        </div>
      </div>

      {/* NEW: AIRFOIL ANATOMY */}
      <div className="max-w-6xl mx-auto px-8 pt-16">
        <AirfoilAnatomy isAr={isAr} />
      </div>

      {/* 2. THE LIFT EQUATION (MEMORIZED) */}
      <div className="max-w-6xl mx-auto px-8 py-8">
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: true }}
          className="relative bg-gradient-to-br from-slate-800/50 to-slate-900/50 rounded-3xl p-10 border border-slate-700 shadow-2xl mb-16 overflow-hidden"
        >
          <div className="absolute top-0 right-0 p-8 opacity-5">
            <span className="text-9xl font-serif italic">L</span>
          </div>
          
          <h2 className="text-3xl font-bold text-white mb-8 text-center">
            {isAr ? 'معادلة الرفع (The Lift Equation)' : 'The Lift Equation'}
          </h2>
          
          {/* Equation Display */}
          <div className="flex justify-center items-center py-8 mb-8 bg-black/40 rounded-2xl border border-white/5">
            <div className="text-4xl md:text-6xl font-serif text-white flex items-center gap-4 tracking-wider">
              <span className="text-sky-400 font-bold">L</span>
              <span className="text-slate-500">=</span>
              <span className="text-emerald-400">C<sub>L</sub></span>
              <span className="text-slate-400">·</span>
              <span className="text-purple-400 text-3xl md:text-5xl">½</span>
              <span className="text-amber-400">ρ</span>
              <span className="text-rose-400">v²</span>
              <span className="text-slate-400">·</span>
              <span className="text-indigo-400">S</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-slate-800/50 p-5 rounded-xl border border-emerald-500/20">
              <div className="text-2xl font-bold text-emerald-400 mb-2">C<sub>L</sub></div>
              <h4 className="font-semibold text-slate-200 mb-1">{isAr ? 'معامل الرفع' : 'Coefficient of Lift'}</h4>
              <p className="text-sm text-slate-400">{isAr ? 'يعتمد على شكل الجناح (Camber) وزاوية الهجوم.' : 'Depends on the airfoil shape (camber) and the Angle of Attack.'}</p>
            </div>
            <div className="bg-slate-800/50 p-5 rounded-xl border border-amber-500/20">
              <div className="text-2xl font-bold text-amber-400 mb-2">½ ρ</div>
              <h4 className="font-semibold text-slate-200 mb-1">{isAr ? 'كثافة الهواء' : 'Air Density'}</h4>
              <p className="text-sm text-slate-400">{isAr ? 'تتأثر بالارتفاع ودرجة الحرارة. كلما ارتفعنا، قل الرفع.' : 'Affected by altitude and temperature. Higher altitude means less lift.'}</p>
            </div>
            <div className="bg-slate-800/50 p-5 rounded-xl border border-rose-500/20">
              <div className="text-2xl font-bold text-rose-400 mb-2">v²</div>
              <h4 className="font-semibold text-slate-200 mb-1">{isAr ? 'سرعة الهواء' : 'Airspeed Squared'}</h4>
              <p className="text-sm text-slate-400">{isAr ? 'أهم عامل! مضاعفة السرعة تضاعف الرفع 4 مرات.' : 'The most critical factor! Doubling speed quadruples the lift.'}</p>
            </div>
            <div className="bg-slate-800/50 p-5 rounded-xl border border-indigo-500/20">
              <div className="text-2xl font-bold text-indigo-400 mb-2">S</div>
              <h4 className="font-semibold text-slate-200 mb-1">{isAr ? 'مساحة الجناح' : 'Wing Area'}</h4>
              <p className="text-sm text-slate-400">{isAr ? 'المساحة السطحية الكلية. الأجنحة الأكبر تولد رفعاً أكبر.' : 'Total surface area. Larger wings generate more lift at the same speed.'}</p>
            </div>
          </div>
        </motion.div>

        {/* 3. BERNOULLI & CONTINUITY */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <motion.div initial={{ x: -20, opacity: 0 }} whileInView={{ x: 0, opacity: 1 }} viewport={{ once: true }}>
            <h3 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
              <span className="w-8 h-8 rounded-full bg-sky-500/20 flex items-center justify-center text-sky-400 text-sm">1</span>
              {isAr ? 'مبدأ الاستمرارية (Continuity)' : 'Principle of Continuity'}
            </h3>
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
              <div className="text-xl font-serif text-sky-400 text-center mb-6 py-3 bg-slate-800/50 rounded-lg">
                A × V × ρ = Constant
              </div>
              <p className="text-slate-300 leading-relaxed mb-4">
                {isAr 
                  ? 'بما أن الهواء عند السرعات الأقل من ماخ 0.4 لا ينضغط، فإن الكثافة (ρ) تعتبر ثابتة. لذا تتبسط المعادلة إلى المساحة × السرعة = ثابت.'
                  : 'At low subsonic speeds (< M 0.4), air is incompressible so density (ρ) is constant. The equation simplifies to Area × Velocity = Constant.'}
              </p>
              <p className="text-slate-400 text-sm border-l-2 border-sky-500 pl-4">
                {isAr 
                  ? 'عندما يضيق المجرى (المساحة تقل)، يجب أن تتسارع جزيئات الهواء (السرعة تزيد) للحفاظ على نفس كمية التدفق.'
                  : 'When the cross-sectional area decreases, the air MUST accelerate to maintain the mass flow rate.'}
              </p>
            </div>
          </motion.div>

          <motion.div initial={{ x: 20, opacity: 0 }} whileInView={{ x: 0, opacity: 1 }} viewport={{ once: true }}>
            <h3 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
              <span className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400 text-sm">2</span>
              {isAr ? 'نظرية برنولي (Bernoulli)' : 'Bernoulli\'s Theorem'}
            </h3>
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
              <div className="text-xl font-serif text-emerald-400 text-center mb-6 py-3 bg-slate-800/50 rounded-lg">
                P + ½ ρ V² = Constant
              </div>
              <p className="text-slate-300 leading-relaxed mb-4">
                {isAr 
                  ? 'في التدفق المستقر، مجموع الضغط الساكن والضغط الديناميكي (الطاقة الحركية) يظل ثابتاً.'
                  : 'In steady flow, the sum of static pressure and dynamic pressure remains constant.'}
              </p>
              <p className="text-slate-400 text-sm border-l-2 border-emerald-500 pl-4">
                {isAr 
                  ? 'التقوس العلوي للجناح (Camber) يجبر الهواء على التسارع. وبحسب برنولي، هذا التسارع يؤدي لانخفاض الضغط الساكن أعلى الجناح، مما يولد قوة الرفع!'
                  : 'The upper camber forces air to accelerate. According to Bernoulli, higher velocity means lower static pressure on top, creating LIFT!'}
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
