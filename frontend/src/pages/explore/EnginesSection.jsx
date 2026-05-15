import React, { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Zap, ChevronRight, ArrowRight, FlaskConical, TrendingUp, Wind, Thermometer, AlertTriangle } from 'lucide-react';

// ── Interactive BPR (Bypass Ratio) Visualizer ─────────────────────────────────
const BPRVisualizer = ({ bpr, mach }) => {
  const totalFlow = 100;
  const bypassFlow = Math.round((bpr / (bpr + 1)) * totalFlow);
  const coreFlow = totalFlow - bypassFlow;
  const thrustFromBypass = Math.round(bypassFlow * 0.72);
  const thrustFromCore = 100 - thrustFromBypass;

  return (
    <svg viewBox="0 0 560 200" className="w-full max-w-xl mx-auto h-auto">
      <defs>
        <linearGradient id="bypassGrad" x1="0" x2="1" y1="0" y2="0">
          <stop offset="0%" stopColor="#fb923c" stopOpacity="0.2" />
          <stop offset="100%" stopColor="#fb923c" stopOpacity="0.05" />
        </linearGradient>
        <linearGradient id="coreGrad" x1="0" x2="1" y1="0" y2="0">
          <stop offset="0%" stopColor="#ef4444" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.4" />
        </linearGradient>
        <filter id="engineGlow">
          <feGaussianBlur stdDeviation="2.5" result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>

      {/* Fan disc */}
      <ellipse cx="120" cy="100" rx="18" ry="72" fill="rgba(251,146,60,0.15)" stroke="#fb923c" strokeWidth="1.5" />
      <text x="120" y="104" textAnchor="middle" fill="#fb923c" fontSize="9" fontFamily="monospace" fontWeight="700">FAN</text>

      {/* Bypass duct */}
      <path d={`M 138,30 L 420,${50 - bypassFlow * 0.15} L 420,${50 + bypassFlow * 0.15} L 138,170`}
        fill="url(#bypassGrad)" stroke="#fb923c" strokeWidth="1" opacity="0.6" />
      <text x="270" y="48" fill="#fb923c" fontSize="9" fontFamily="monospace" opacity="0.9">
        BYPASS STREAM — {bypassFlow}% of air · {thrustFromBypass}% of thrust
      </text>

      {/* Core duct */}
      <rect x="138" y="76" width="160" height={coreFlow * 0.46} rx="4" fill="url(#coreGrad)" />

      {/* Compressor, combustor, turbine labels */}
      {[['COMP', 180, '#a78bfa'], ['COMB', 220, '#f59e0b'], ['TURB', 264, '#22c55e']].map(([label, x, col]) => (
        <g key={label}>
          <rect x={x - 18} y="80" width="36" height={coreFlow * 0.44} rx="3" fill={col + '18'} stroke={col + '50'} strokeWidth="1" />
          <text x={x} y={100 + coreFlow * 0.1} textAnchor="middle" fill={col} fontSize="7" fontFamily="monospace" fontWeight="700">{label}</text>
        </g>
      ))}

      {/* Core exhaust */}
      <path d={`M 298,${86} L 400,${76} L 400,${76 + coreFlow * 0.46} L 298,${86 + coreFlow * 0.44}`}
        fill="rgba(239,68,68,0.12)" stroke="#ef4444" strokeWidth="1" opacity="0.7" />
      <text x="346" y="104" textAnchor="middle" fill="#ef4444" fontSize="8" fontFamily="monospace">CORE JET</text>

      {/* Nozzle */}
      <path d={`M 420,${50 - bypassFlow * 0.15} L 480,${100 - bypassFlow * 0.08} L 480,${100 + bypassFlow * 0.08} L 420,${50 + bypassFlow * 0.15}`}
        fill="rgba(251,146,60,0.08)" stroke="#fb923c" strokeWidth="1.5" filter="url(#engineGlow)" />

      {/* Thrust arrow */}
      <line x1="480" y1="100" x2="540" y2="100" stroke="#fb923c" strokeWidth="2.5" markerEnd="url(#arrowOrange)" />
      <text x="510" y="94" textAnchor="middle" fill="#fb923c" fontSize="9" fontFamily="monospace" fontWeight="700">F</text>

      {/* Mach indicator */}
      <text x="480" y="175" textAnchor="middle" fill="rgba(255,255,255,0.3)" fontSize="8" fontFamily="monospace">
        V∞ = {mach.toFixed(2)} M
      </text>

      {/* BPR label */}
      <text x="120" y="190" textAnchor="middle" fill="#fb923c" fontSize="9" fontFamily="monospace" opacity="0.8">
        BPR = {bpr}:1
      </text>
    </svg>
  );
};

const SECTIONS = [
  {
    id: 'what',
    title: 'What is a Turbofan Engine?',
    beginner: 'A turbofan engine works by sucking in a huge amount of air with a large front fan. Most of that air is pushed around the engine (the bypass stream) to produce thrust — like a ducted propeller. A small amount goes through the core where it\'s compressed, mixed with fuel, burned, and expelled at high speed. The combination produces enormous thrust efficiently.',
    advanced: 'A turbofan\'s performance is defined by the Brayton cycle (isentropic compression → constant-pressure combustion → isentropic expansion). Net thrust: F = ṁ_total·Ve − ṁ_intake·V∞. The bypass ratio (BPR = ṁ_bypass / ṁ_core) determines propulsive efficiency — higher BPR (≥8) gives better specific fuel consumption (SFC) at subsonic cruise. The overall pressure ratio (OPR) and turbine inlet temperature (TIT) drive thermodynamic efficiency.',
    icon: <Zap size={20} />, color: '#fb923c',
  },
  {
    id: 'brayton',
    title: 'The Brayton Cycle',
    beginner: 'Think of the engine as a 4-step process: (1) Air enters and gets squeezed by the compressor — it gets hot. (2) Fuel is sprayed in and ignited in the combustion chamber — huge energy release. (3) The hot gases push through the turbine blades, spinning them (which drives the compressor and fan). (4) Whatever\'s left exits as a high-speed jet from the nozzle — that reaction force IS thrust.',
    advanced: 'Ideal Brayton thermal efficiency: η_th = 1 − (1/OPR)^((γ−1)/γ). Modern engines achieve OPR~50 and TIT~1900 K (with thermal barrier coatings on single-crystal Ni superalloy turbine blades). The isentropic efficiency of each component (η_c ≈ 0.88, η_t ≈ 0.90) limits real-world performance. Intercooling and recuperation can improve cycle efficiency for future architectures.',
    icon: <Thermometer size={20} />, color: '#ef4444',
  },
  {
    id: 'thrust',
    title: 'Thrust & the Bypass Ratio',
    beginner: 'Modern commercial jets use a high bypass ratio — meaning most of the thrust comes from the big fan, not the hot jet. This is much more efficient. It\'s why modern engines are so much quieter and more fuel-efficient than older designs. The higher the bypass ratio, the better the fuel economy at cruise speed.',
    advanced: 'Propulsive efficiency: η_p = 2V∞/(Ve + V∞). Higher bypass reduces Ve → Ve → V∞ → η_p→1. Ultra-high bypass (UHBR, BPR > 15) engines like the CFM RISE target 20% SFC improvement over CFM56. Trade-off: larger fan diameter increases nacelle drag and installation weight. Thrust specific fuel consumption: TSFC = ṁ_fuel/F [kg/N·s].',
    icon: <TrendingUp size={20} />, color: '#22c55e',
  },
  {
    id: 'stall',
    title: 'Compressor Stall & Surge',
    beginner: 'Just like a wing can stall, the compressor blades inside the engine can also "stall" if the airflow gets disrupted — called a compressor stall. When this happens badly it becomes surge, where air actually blows backward through the engine. You hear it as a loud bang from the engine. Pilots are trained to handle it and modern FADEC systems prevent it automatically.',
    advanced: 'Compressor stall occurs when the incidence angle on a blade row exceeds the critical AoA, causing blade-level separation. Rotating stall propagates around the annulus at 20–70% of rotor speed. Full surge occurs when the stage operating point crosses the surge line on the compressor map — manifesting as periodic flow reversal. FADEC protects using surge margin (SM = (PR_stall − PR_op)/PR_op). Variable stator vanes (VSVs) and bleed valves manage the operating line.',
    icon: <AlertTriangle size={20} />, color: '#fb7185',
  },
];

const QUIZ_BEGINNER = [
  { question: 'What does "bypass ratio" mean?', options: [{ text: 'Ratio of fan thrust to total thrust', correct: false }, { text: 'Ratio of air going around the core to air going through the core', correct: true }, { text: 'The compression ratio of the engine', correct: false }, { text: 'Speed of exhaust vs. intake air', correct: false }], explanation: 'BPR = ṁ_bypass / ṁ_core. A BPR of 12:1 means 12 kg of air bypasses the core for every 1 kg going through it. Higher BPR = more efficient at subsonic cruise.' },
  { question: 'What are the 4 stages of the Brayton cycle in order?', options: [{ text: 'Intake → Combustion → Compression → Exhaust', correct: false }, { text: 'Intake → Compression → Combustion → Expansion', correct: true }, { text: 'Fan → Turbine → Compressor → Nozzle', correct: false }, { text: 'Compression → Intake → Expansion → Combustion', correct: false }], explanation: 'Intake → Compression (adiabatic) → Combustion (constant pressure) → Expansion through turbine and nozzle. This is the ideal Brayton thermodynamic cycle.' },
];

const QUIZ_ADVANCED = [
  { question: 'Why does increasing bypass ratio improve propulsive efficiency?', options: [{ text: 'More air flow increases total momentum', correct: false }, { text: 'Lower jet velocity brings exhaust speed closer to flight speed, reducing kinetic energy waste', correct: true }, { text: 'Higher BPR increases turbine inlet temperature', correct: false }, { text: 'Bypass air cools the core, improving combustion', correct: false }], explanation: 'Propulsive efficiency η_p = 2V∞/(Ve + V∞). As Ve → V∞ (lower exhaust velocity from high BPR), η_p → 1. Less kinetic energy is wasted in the exhaust plume.' },
  { question: 'What is compressor surge?', options: [{ text: 'A momentary increase in engine thrust', correct: false }, { text: 'Periodic reversal of airflow through the compressor due to stall', correct: true }, { text: 'Excessive fuel flow to the combustor', correct: false }, { text: 'Tip clearance loss at high altitude', correct: false }], explanation: 'Surge is a violent aerodynamic instability where the compressor can no longer maintain pressure rise, causing cyclic flow reversal. FADEC uses bleed valves and variable geometry to maintain surge margin > 20%.' },
];

const EnginesSection = () => {
  const navigate = useNavigate();
  const [isAdvanced, setIsAdvanced] = useState(false);
  const [bpr, setBpr] = useState(8);
  const [mach, setMach] = useState(0.82);
  const [quizAnswers, setQuizAnswers] = useState({});

  const activeQuiz = isAdvanced ? QUIZ_ADVANCED : QUIZ_BEGINNER;
  const handleAnswer = (qIdx, aIdx) => setQuizAnswers(prev => ({ ...prev, [qIdx]: aIdx }));
  const handleModeSwitch = (adv) => { setIsAdvanced(adv); setQuizAnswers({}); };

  // Derived performance metrics
  const propEff = useMemo(() => {
    const ve = 280 - bpr * 8; // rough: higher BPR → lower Ve
    const v0 = mach * 343 * 0.8;
    return Math.min(0.99, (2 * v0) / (ve + v0));
  }, [bpr, mach]);

  const sfc = useMemo(() => (0.055 - bpr * 0.0018 + mach * 0.015).toFixed(4), [bpr, mach]);

  return (
    <div className="min-h-full px-6 lg:px-10 py-8 max-w-4xl mx-auto">

      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <div className="flex items-center gap-2 text-[11px] font-mono tracking-widest text-[#fb923c] uppercase mb-3">
          <Link to="/explore" className="hover:underline">Explorer</Link>
          <ChevronRight size={10} />
          <span>Engines</span>
        </div>
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-3xl lg:text-4xl font-bold text-white mb-2 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#fb923c]/15 border border-[#fb923c]/30 flex items-center justify-center text-[#fb923c]">
                <Zap size={20} />
              </div>
              Propulsion Systems
            </h1>
            <p className="text-[var(--color-edu-text-muted)]">Turbofan engines — from fan to nozzle</p>
          </div>
          <div className="complexity-toggle">
            <button className={`complexity-toggle-btn ${!isAdvanced ? 'active' : ''}`} onClick={() => handleModeSwitch(false)}>Beginner</button>
            <button className={`complexity-toggle-btn ${isAdvanced ? 'active' : ''}`} onClick={() => handleModeSwitch(true)}>Advanced</button>
          </div>
        </div>
      </motion.div>

      {/* Interactive Engine Visualizer */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        className="mb-8 bg-[var(--color-edu-surface)] border border-white/5 rounded-2xl p-6 overflow-hidden relative">
        <div className="absolute inset-0 edu-grid-bg opacity-30 pointer-events-none" />
        <div className="text-[10px] font-mono tracking-widest text-[var(--color-edu-text-muted)] uppercase mb-4">
          Interactive Turbofan · Adjust Bypass Ratio & Mach
        </div>

        <BPRVisualizer bpr={bpr} mach={mach} />

        {/* Sliders */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6 relative z-5">
          <div>
            <label className="flex items-center justify-between text-[11px] font-mono tracking-wider text-[var(--color-edu-text-muted)] mb-2">
              <span>Bypass Ratio (BPR)</span>
              <span className="text-[#fb923c] font-bold">{bpr}:1</span>
            </label>
            <input type="range" min="1" max="14" step="0.5" value={bpr} onChange={(e) => setBpr(Number(e.target.value))} className="w-full" />
            <div className="flex justify-between text-[9px] font-mono text-[var(--color-edu-text-muted)]/50 mt-1">
              <span>Military (1:1)</span><span>UHBR (14:1)</span>
            </div>
          </div>
          <div>
            <label className="flex items-center justify-between text-[11px] font-mono tracking-wider text-[var(--color-edu-text-muted)] mb-2">
              <span>Cruise Mach</span>
              <span className="text-[#22c55e] font-bold">M {mach.toFixed(2)}</span>
            </label>
            <input type="range" min="0.3" max="0.95" step="0.01" value={mach} onChange={(e) => setMach(Number(e.target.value))} className="w-full" />
            <div className="flex justify-between text-[9px] font-mono text-[var(--color-edu-text-muted)]/50 mt-1">
              <span>Low (0.30)</span><span>High (0.95)</span>
            </div>
          </div>
        </div>

        {/* Live metrics */}
        <div className="grid grid-cols-2 gap-3 mt-5">
          <div className="p-3 rounded-xl bg-white/3 border border-white/5">
            <div className="text-[9px] font-mono tracking-widest text-[var(--color-edu-text-muted)] uppercase mb-1">Propulsive Efficiency</div>
            <div className="text-lg font-bold" style={{ color: '#22c55e' }}>{(propEff * 100).toFixed(1)}%</div>
          </div>
          <div className="p-3 rounded-xl bg-white/3 border border-white/5">
            <div className="text-[9px] font-mono tracking-widest text-[var(--color-edu-text-muted)] uppercase mb-1">Est. TSFC</div>
            <div className="text-lg font-bold" style={{ color: '#fb923c' }}>{sfc} kg/N·h</div>
          </div>
        </div>
      </motion.div>

      {/* Content Sections */}
      <div className="space-y-5">
        {SECTIONS.map((section, i) => (
          <motion.div
            key={section.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 + i * 0.08 }}
            className="theory-section"
            style={{ '--section-accent': section.color }}
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: `${section.color}15`, color: section.color }}>
                {section.icon}
              </div>
              <h2 className="text-lg font-bold text-white">{section.title}</h2>
            </div>
            <p className="text-sm text-[var(--color-edu-text-muted)] leading-relaxed">
              {isAdvanced ? section.advanced : section.beginner}
            </p>
          </motion.div>
        ))}
      </div>

      {/* Quiz */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
        className="mt-10 bg-[var(--color-edu-surface)] border border-white/5 rounded-2xl p-6 space-y-6">
        <div className="text-[10px] font-mono tracking-widest text-[#fb923c] uppercase">✦ Knowledge Check · {isAdvanced ? 'Advanced' : 'Beginner'}</div>
        {activeQuiz.map((q, qIdx) => (
          <div key={`${isAdvanced}-${qIdx}`} className="border-t border-white/5 pt-5 first:border-t-0 first:pt-0">
            <h3 className="text-base font-bold text-white mb-3">{q.question}</h3>
            <div className="space-y-2">
              {q.options.map((opt, aIdx) => (
                <button key={aIdx} onClick={() => handleAnswer(qIdx, aIdx)} disabled={quizAnswers[qIdx] !== undefined}
                  className={`quiz-option w-full text-left ${quizAnswers[qIdx] === aIdx && opt.correct ? 'correct' : ''} ${quizAnswers[qIdx] === aIdx && !opt.correct ? 'incorrect' : ''} ${quizAnswers[qIdx] !== undefined && opt.correct && quizAnswers[qIdx] !== aIdx ? 'correct' : ''}`}>
                  <div className="w-7 h-7 rounded-full border border-white/10 flex items-center justify-center text-xs font-bold flex-shrink-0">{String.fromCharCode(65 + aIdx)}</div>
                  {opt.text}
                </button>
              ))}
            </div>
            {quizAnswers[qIdx] !== undefined && (
              <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                className="mt-3 p-3 rounded-xl bg-[#22c55e]/8 border border-[#22c55e]/20 text-sm text-[var(--color-edu-text-muted)]">
                <span className="font-bold text-[#22c55e]">Explanation: </span>{q.explanation}
              </motion.div>
            )}
          </div>
        ))}
      </motion.div>

      {/* Lab CTA */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}
        className="mt-10 bg-gradient-to-br from-[#fb923c]/8 to-[#ef4444]/8 border border-[#fb923c]/15 rounded-2xl p-8 text-center">
        <div className="w-14 h-14 rounded-2xl bg-[#fb923c]/15 border border-[#fb923c]/25 flex items-center justify-center mx-auto mb-4 text-[#fb923c]">
          <FlaskConical size={24} />
        </div>
        <h3 className="text-xl font-bold text-white mb-2">Run the Engines Lab</h3>
        <p className="text-sm text-[var(--color-edu-text-muted)] max-w-md mx-auto mb-6">
          Adjust thrust, altitude, and Mach. Watch T/W ratio and SFC update live with real thermodynamic equations.
        </p>
        <button onClick={() => navigate('/lab/engines')} className="cta-primary" style={{ '--cta-color': '#fb923c' }}>
          <Zap size={18} /> Open Engines Lab <ArrowRight size={18} />
        </button>
      </motion.div>

      {/* Navigation */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7 }}
        className="mt-8 flex items-center justify-between pb-8">
        <Link to="/explore/tail" className="text-sm font-semibold text-[var(--color-edu-text-muted)] hover:text-white transition-colors">← Tail Section</Link>
        <Link to="/explore" className="text-sm font-semibold text-[var(--color-edu-text-muted)] hover:text-white transition-colors">Back to Explorer →</Link>
      </motion.div>
    </div>
  );
};

export default EnginesSection;
