import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useAcademy } from '../../../context/AcademyContext';
import EducationalWindTunnel from '../components/EducationalWindTunnel';
import BernoulliLab from '../components/BernoulliLab';

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

const CenterOfPressureLab = ({ isAr }) => {
  const [aoa, setAoa] = useState(5);
  // CP moves forward as AoA increases. 50% at 0 AoA, 25% at 15 AoA
  const cpPercent = Math.max(20, 50 - (aoa * 1.5));
  
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 relative overflow-hidden group">
      <h3 className="text-2xl font-bold text-white mb-4">{isAr ? 'مركز الضغط التفاعلي (Center of Pressure)' : 'Interactive Center of Pressure (CP)'}</h3>
      <p className="text-slate-400 leading-relaxed mb-6">
        {isAr 
          ? 'غير زاوية الهجوم لترى كيف يتحرك مركز الضغط للأمام! إذا زادت الزاوية جداً، ينفصل تدفق الهواء.' 
          : 'Change the Angle of Attack to see how the CP moves forward on a cambered wing!'}
      </p>
      
      <div className="relative h-48 bg-black/40 rounded-2xl border border-white/5 flex items-center justify-center overflow-hidden mb-6">
        <motion.div 
          animate={{ rotate: -aoa }} 
          className="relative w-64 h-16"
        >
          {/* Simple Airfoil Shape */}
          <div className="absolute inset-0 bg-sky-500/20 border border-sky-500 rounded-[100%_20%_20%_100%/50%_50%_50%_50%]" />
          
          {/* CP Arrow */}
          <motion.div 
            className="absolute top-full mt-2 flex flex-col items-center"
            animate={{ left: `${cpPercent}%` }}
            transition={{ type: 'spring', bounce: 0.4 }}
          >
            <div className="w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-b-[12px] border-b-purple-500" />
            <div className="text-purple-400 font-bold mt-1 text-xs whitespace-nowrap">
              CP ({cpPercent.toFixed(0)}%)
            </div>
            <div className="w-0.5 h-10 bg-purple-500/50 absolute bottom-full mb-3" />
          </motion.div>
        </motion.div>
      </div>

      <ModernSlider 
        label={isAr ? 'زاوية الهجوم (AoA)' : 'Angle of Attack'}
        unit="°" min={0} max={20} value={aoa} onChange={setAoa} color="#c084fc" 
      />
    </div>
  );
};

const WingAreaLab = ({ isAr }) => {
  const [span, setSpan] = useState(10);
  const [chord, setChord] = useState(2);
  const area = span * chord;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 relative overflow-hidden group">
      <h3 className="text-2xl font-bold text-white mb-4">{isAr ? 'مساحة الجناح التفاعلية (Wing Area)' : 'Interactive Wing Area (S)'}</h3>
      <p className="text-slate-400 leading-relaxed mb-6">
        {isAr 
          ? 'المساحة = طول الجناح × عرض الوتر. جرب تغيير الأبعاد لترى كيف تتغير المساحة (S).' 
          : 'Area = Span × Chord. See how changing dimensions affects the total Wing Area (S).'}
      </p>

      <div className="relative h-48 bg-black/40 rounded-2xl border border-white/5 flex flex-col items-center justify-center mb-6 overflow-hidden">
        <div className="absolute left-4 top-4 text-emerald-400 font-mono text-xl">
          Area (S) = {area} m²
        </div>
        
        <motion.div 
          className="bg-emerald-500/20 border border-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.3)]"
          animate={{ 
            width: `${span * 20}px`,
            height: `${chord * 20}px` 
          }}
          transition={{ type: 'spring', bounce: 0.3 }}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <ModernSlider 
          label={isAr ? 'طول الجناح (Span)' : 'Wingspan'}
          unit="m" min={5} max={20} value={span} onChange={setSpan} color="#10b981" 
        />
        <ModernSlider 
          label={isAr ? 'عرض الوتر (Chord)' : 'Chord'}
          unit="m" min={1} max={5} value={chord} onChange={setChord} color="#34d399" 
        />
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
              fill={camber === 0 ? "rgba(56, 189, 248, 0.3)" : "rgba(148, 163, 184, 0.2)"} 
              stroke={camber === 0 ? "rgba(56, 189, 248, 1)" : "rgba(148, 163, 184, 0.8)"} 
              strokeWidth="0.5" 
              className="transition-all duration-300"
              style={{ filter: camber === 0 ? 'drop-shadow(0 0 10px rgba(56, 189, 248, 0.8))' : 'none' }}
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

        <div className="lg:col-span-1 flex flex-col justify-center space-y-6 bg-black/40 p-6 rounded-2xl border border-white/5 relative overflow-hidden">
          {camber === 0 && (
            <div className="absolute inset-0 bg-sky-500/10 animate-pulse pointer-events-none" />
          )}
          
          <div className="flex justify-between items-center bg-slate-950 p-2 rounded-xl mb-2">
            <button 
              onClick={() => { setCamber(0); setThickness(12); }}
              className={`flex-1 text-xs py-2 rounded-lg font-bold transition-all ${camber === 0 ? 'bg-sky-500 text-white' : 'text-slate-400 hover:bg-slate-800'}`}
            >
              {isAr ? 'متماثل' : 'Symmetrical'}
            </button>
            <button 
              onClick={() => { setCamber(4); setThickness(12); }}
              className={`flex-1 text-xs py-2 rounded-lg font-bold transition-all ${camber > 0 ? 'bg-purple-500 text-white' : 'text-slate-400 hover:bg-slate-800'}`}
            >
              {isAr ? 'متقوس' : 'Cambered'}
            </button>
          </div>

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
            color={camber === 0 ? "#38bdf8" : "#c084fc"}
          />
          {camber === 0 && (
            <div className="text-center text-sky-400 text-xs font-bold uppercase tracking-widest animate-bounce">
              {isAr ? 'يولد رفعاً فقط عند وجود زاوية هجوم!' : 'Generates lift ONLY at an Angle of Attack!'}
            </div>
          )}
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
  const [activeEqParam, setActiveEqParam] = useState('V');
  const isAr = language === 'ar';

  // NACA 4412 Airfoil Data
  const airfoilData = [
    [0.5002, 0.0012], [0.4941, 0.0029], [0.4761, 0.0078], [0.4465, 0.0155], [0.4061, 0.0255], [0.3556, 0.0371], [0.2962, 0.0496], [0.2295, 0.0620], [0.1568, 0.0737], [0.0801, 0.0838], [0.0012, 0.0918], [-0.0779, 0.0971], [-0.1561, 0.0988], [-0.2308, 0.0957], [-0.2995, 0.0880], [-0.3602, 0.0766], [-0.4114, 0.0623], [-0.4518, 0.0465], [-0.4803, 0.0302], [-0.4965, 0.0145], [-0.5000, 0.0000], [-0.4912, -0.0120], [-0.4707, -0.0207], [-0.4392, -0.0262], [-0.3976, -0.0287], [-0.3469, -0.0287], [-0.2883, -0.0268], [-0.2232, -0.0238], [-0.1529, -0.0203], [-0.0785, -0.0172], [-0.0012, -0.0140], [0.0763, -0.0109], [0.1522, -0.0080], [0.2245, -0.0058], [0.2915, -0.0040], [0.3515, -0.0029], [0.4030, -0.0021], [0.4445, -0.0017], [0.4749, -0.0014], [0.4936, -0.0013], [0.5000, 0.0000]
  ];

  const eqDetails = {
    CL: {
      title: isAr ? 'معامل الرفع' : 'Coefficient of Lift (CL)',
      desc: isAr ? 'يعتمد على شكل الجناح (التقوس) وزاوية الهجوم (AoA). إذا زادت زاوية الهجوم، يزداد معامل الرفع حتى نقطة الانهيار.' : 'Depends on the airfoil shape (camber) and the Angle of Attack. As AoA increases, CL increases until it stalls.',
      color: 'text-emerald-400', border: 'border-emerald-500'
    },
    RHO: {
      title: isAr ? 'كثافة الهواء' : 'Air Density (ρ)',
      desc: isAr ? 'تتأثر بالارتفاع والحرارة والضغط. في الأيام الحارة أو الارتفاعات العالية، يكون الهواء أقل كثافة مما يقلل الرفع.' : 'Affected by altitude, temperature, and pressure. Hot or high days mean less dense air, producing less lift.',
      color: 'text-amber-400', border: 'border-amber-500'
    },
    V: {
      title: isAr ? 'السرعة تربيع' : 'Velocity Squared (v²)',
      desc: isAr ? 'العامل الأهم! لأن السرعة مربعة، فإن مضاعفة السرعة يضاعف الرفع 4 مرات.' : 'The most powerful factor! Because it is squared, doubling your speed gives you 4 TIMES the lift.',
      color: 'text-rose-400', border: 'border-rose-500'
    },
    S: {
      title: isAr ? 'مساحة الجناح' : 'Wing Area (S)',
      desc: isAr ? 'المساحة السطحية للجناح. الطائرات الكبيرة تحتاج لأجنحة كبيرة. فرد القلابات (Flaps) يمكن أن يزيد المساحة ومعامل الرفع معاً.' : 'Total surface area. Big planes need big wings. Extending flaps can increase the effective wing area.',
      color: 'text-indigo-400', border: 'border-indigo-500'
    }
  };

  return (
    <div className="flex-1 overflow-y-auto overflow-x-hidden relative bg-[#020617]">
      {/* 1. INTERACTIVE HERO - THE WIND TUNNEL */}
      <div className="relative w-full h-[60vh] min-h-[400px] md:min-h-[500px] border-b border-white/10 bg-black">
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
              unit="°" min={-10} max={25} value={aoa} onChange={setAoa} color="#0ea5e9"
            />
            <ModernSlider 
              label={isAr ? 'سرعة الهواء' : 'Airspeed'}
              unit="kts" min={30} max={250} value={speed} onChange={setSpeed} color="#10b981"
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

      {/* 2. THE LIFT EQUATION (INTERACTIVE) */}
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
          
          <h2 className="text-3xl font-bold text-white mb-4 text-center">
            {isAr ? 'معادلة الرفع التفاعلية' : 'Interactive Lift Equation'}
          </h2>
          <p className="text-center text-slate-400 mb-8 max-w-2xl mx-auto">
            {isAr ? 'انقر على أي عامل في المعادلة لتفهم تأثيره وكيف يعتمد عليه الرفع.' : 'Click on any parameter in the equation below to understand its effect and what it depends on.'}
          </p>
          
          {/* Equation Display (Clickable) */}
          <div className="flex justify-center items-center py-8 mb-8 bg-black/40 rounded-2xl border border-white/5 flex-wrap gap-y-4">
            <div className="text-4xl md:text-6xl font-serif text-white flex items-center gap-2 md:gap-4 tracking-wider">
              <span className="text-sky-400 font-bold">L</span>
              <span className="text-slate-500">=</span>
              
              <button 
                onClick={() => setActiveEqParam('CL')}
                className={`transition-all p-2 rounded-xl border-b-4 ${activeEqParam === 'CL' ? 'bg-emerald-500/20 border-emerald-500 scale-110' : 'border-transparent hover:bg-white/5'}`}
              >
                <span className="text-emerald-400">C<sub>L</sub></span>
              </button>
              
              <span className="text-slate-400">·</span>
              <span className="text-purple-400 text-3xl md:text-5xl">½</span>
              
              <button 
                onClick={() => setActiveEqParam('RHO')}
                className={`transition-all p-2 rounded-xl border-b-4 ${activeEqParam === 'RHO' ? 'bg-amber-500/20 border-amber-500 scale-110' : 'border-transparent hover:bg-white/5'}`}
              >
                <span className="text-amber-400">ρ</span>
              </button>
              
              <button 
                onClick={() => setActiveEqParam('V')}
                className={`transition-all p-2 rounded-xl border-b-4 ${activeEqParam === 'V' ? 'bg-rose-500/20 border-rose-500 scale-110' : 'border-transparent hover:bg-white/5'}`}
              >
                <span className="text-rose-400">v²</span>
              </button>
              
              <span className="text-slate-400">·</span>
              
              <button 
                onClick={() => setActiveEqParam('S')}
                className={`transition-all p-2 rounded-xl border-b-4 ${activeEqParam === 'S' ? 'bg-indigo-500/20 border-indigo-500 scale-110' : 'border-transparent hover:bg-white/5'}`}
              >
                <span className="text-indigo-400">S</span>
              </button>
            </div>
          </div>

          {/* Dynamic Details Box */}
          <motion.div 
            key={activeEqParam}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`p-6 md:p-8 rounded-2xl border bg-slate-950/80 backdrop-blur-md ${eqDetails[activeEqParam].border}`}
          >
            <h3 className={`text-2xl font-bold mb-3 ${eqDetails[activeEqParam].color}`}>
              {eqDetails[activeEqParam].title}
            </h3>
            <p className="text-slate-300 text-lg leading-relaxed">
              {eqDetails[activeEqParam].desc}
            </p>
          </motion.div>
        </motion.div>

        {/* 3. BERNOULLI & CONTINUITY */}
        <BernoulliLab language={language} />

        {/* 4. CENTER OF PRESSURE & WING AREA (INTERACTIVE LABS) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          <CenterOfPressureLab isAr={isAr} />
          <WingAreaLab isAr={isAr} />
        </div>

        {/* SUMMARY */}
        <motion.div 
          initial={{ y: 20, opacity: 0 }} whileInView={{ y: 0, opacity: 1 }} viewport={{ once: true }}
          className="bg-gradient-to-r from-sky-900/40 to-emerald-900/40 border border-sky-500/20 rounded-3xl p-8 mb-16 shadow-2xl"
        >
          <h3 className="text-2xl font-black text-white mb-4 uppercase tracking-wider">
            {isAr ? 'ملخص الفصل الثاني' : 'Chapter 2 Quick Summary'}
          </h3>
          <ul className="space-y-3 text-slate-300">
            <li className="flex gap-3">
              <span className="text-sky-400">❖</span>
              {isAr ? 'الرفع يتولد بفضل انحناء الهواء وتغيرات الضغط حول المقطع الانسيابي للجناح.' : 'Lift is generated by turning airflow and pressure changes around the airfoil.'}
            </li>
            <li className="flex gap-3">
              <span className="text-emerald-400">❖</span>
              {isAr ? 'نظرية برنولي ومبدأ الاستمرارية تشرحان تسارع الهواء وانخفاض ضغطه فوق الجناح.' : 'Bernoulli and Continuity explain airflow acceleration and pressure drop over the wing.'}
            </li>
            <li className="flex gap-3">
              <span className="text-amber-400">❖</span>
              {isAr ? 'السرعة هي العامل الأهم في معادلة الرفع (التأثير تربيعي).' : 'Airspeed is the most critical factor in the Lift Equation (squared effect).'}
            </li>
            <li className="flex gap-3">
              <span className="text-rose-400">❖</span>
              {isAr ? 'يتغير مركز الضغط (CP) مكاناً بتغير زاوية الهجوم على الأجنحة المتقوسة.' : 'Center of Pressure (CP) shifts dynamically with Angle of Attack on cambered wings.'}
            </li>
          </ul>
        </motion.div>

      </div>
    </div>
  );
}
