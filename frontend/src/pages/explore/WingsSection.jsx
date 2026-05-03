import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Plane, ChevronRight, ArrowRight, Fuel, SlidersHorizontal, Ruler, Wind } from 'lucide-react';

const SECTIONS = [
  {
    id: 'anatomy',
    title: 'Wing Anatomy',
    beginner: 'A wing has several key measurements: the span (tip to tip), the chord (front to back width), and the aspect ratio (how long and narrow it is). A glider has long, narrow wings (high aspect ratio) for efficiency, while a fighter jet has short, wide wings (low aspect ratio) for speed and maneuverability.',
    advanced: 'Wing geometry is characterized by span (b), chord (c), aspect ratio (AR = b²/S), taper ratio (λ = c_tip/c_root), and sweep angle (Λ). High AR wings (AR > 8) minimize induced drag (C_Di = C_L²/πeAR) but increase structural weight and are susceptible to flutter. Sweep delays transonic drag rise by reducing the effective Mach number normal to the leading edge.',
    icon: <Ruler size={20} />,
    color: '#a78bfa',
  },
  {
    id: 'control',
    title: 'Control Surfaces',
    beginner: 'Wings have movable parts: Flaps extend during takeoff and landing to increase lift at low speeds. Ailerons are near the wingtips and tilt the airplane left or right (rolling). Slats are small panels on the front edge that extend to help air flow smoothly at high angles.',
    advanced: 'Primary roll control uses ailerons (differential deflection creates asymmetric lift). Trailing-edge flaps (Fowler, slotted, or plain) increase C_Lmax by 60–90% for low-speed operations. Leading-edge slats delay stall by re-energizing the boundary layer. Spoilers/speed brakes dump lift and increase drag for descent rate control. Fly-by-wire systems blend multiple surfaces for optimal performance across the flight envelope.',
    icon: <SlidersHorizontal size={20} />,
    color: '#38bdf8',
  },
  {
    id: 'fuel',
    title: 'Fuel Storage',
    beginner: 'Here\'s a surprising fact: most of an airplane\'s fuel is stored inside the wings! A Boeing 747 can carry over 200,000 liters of fuel in its wing tanks. This is smart engineering — the weight of the fuel counteracts the upward lift force, reducing stress on the wing structure.',
    advanced: 'Integral wing fuel tanks (wet wings) use the wing box structure itself as the fuel container, sealed with polysulfide sealant. Fuel placement provides favorable wing bending relief — fuel weight opposes aerodynamic lift loads, reducing the root bending moment by up to 40%. Center-of-gravity management requires fuel sequencing (outboard-first consumption for gust load alleviation). A 747-400 carries ~216,840 L (57,285 gal) across center tank + wing tanks. Fuel jettison capability is required for aircraft where MZFW < MLW.',
    icon: <Fuel size={20} />,
    color: '#f59e0b',
  },
  {
    id: 'lift',
    title: 'How Wings Generate Lift',
    beginner: 'Wings generate lift because of their special shape (airfoil). Air moves faster over the curved top surface and slower under the flat bottom. This speed difference creates lower pressure on top and higher pressure below — pushing the wing upward. The angle of the wing to the air (angle of attack) also matters: tilt it more, get more lift — until it stalls!',
    advanced: 'Lift generation is best explained by the Kutta-Joukowski theorem: L\' = ρ·V·Γ, where Γ is the circulation bound to the airfoil. The Kutta condition at the trailing edge establishes the circulation magnitude. In the linear regime, C_L = C_Lα·(α - α₀), where C_Lα ≈ 2π/rad for thin airfoils (reduced by compressibility and finite span). Stall occurs when the adverse pressure gradient causes boundary layer separation from the upper surface, typically at α ≈ 14°–18° depending on airfoil geometry and Reynolds number.',
    icon: <Wind size={20} />,
    color: '#22c55e',
  },
];

const QUIZ_BEGINNER = [
  {
    question: 'Why is fuel stored in the wings rather than the fuselage?',
    options: [
      { text: 'Wings have more empty space available', correct: false },
      { text: 'Fuel weight in the wings counteracts lift forces, reducing structural stress', correct: true },
      { text: 'It keeps the fuel cooler at altitude', correct: false },
      { text: 'It makes refueling faster at the airport', correct: false },
    ],
    explanation: 'Storing fuel in wings provides "bending relief" — fuel weight opposes upward lift, reducing root bending moment by up to 40%, allowing lighter wing structures.',
  },
  {
    question: 'What do flaps do during takeoff and landing?',
    options: [
      { text: 'They steer the airplane left and right', correct: false },
      { text: 'They increase lift at low speeds by extending the wing area', correct: true },
      { text: 'They slow the airplane by increasing drag only', correct: false },
      { text: 'They control altitude by changing wing thickness', correct: false },
    ],
    explanation: 'Flaps extend the wing chord and increase camber, dramatically boosting C_Lmax so the airplane can fly at lower speeds during takeoff and landing.',
  },
  {
    question: 'A glider has long, narrow wings. What advantage does this give?',
    options: [
      { text: 'Better maneuverability at high speeds', correct: false },
      { text: 'Higher structural strength for aerobatics', correct: false },
      { text: 'Reduced induced drag, giving better lift-to-drag ratio', correct: true },
      { text: 'More fuel storage capacity', correct: false },
    ],
    explanation: 'Long, narrow wings have a high aspect ratio, which minimizes induced drag (C_Di = C_L²/πeAR), dramatically improving glide efficiency.',
  },
];

const QUIZ_ADVANCED = [
  {
    question: 'What is the Kutta-Joukowski theorem relationship for lift?',
    options: [
      { text: 'L\' = ½ρV²C_L', correct: false },
      { text: 'L\' = ρ·V·Γ (lift per unit span = density × velocity × circulation)', correct: true },
      { text: 'L\' = C_L / (π·e·AR)', correct: false },
      { text: 'L\' = q·S·α (dynamic pressure × area × AoA)', correct: false },
    ],
    explanation: 'The Kutta-Joukowski theorem states that lift per unit span L\' = ρVΓ, where Γ is the circulation. The Kutta condition at the trailing edge determines the circulation magnitude.',
  },
  {
    question: 'Wing sweep angle (Λ) primarily helps with which effect?',
    options: [
      { text: 'Increasing maximum lift coefficient', correct: false },
      { text: 'Delaying transonic wave drag rise by reducing effective Mach number', correct: true },
      { text: 'Improving low-speed stall characteristics', correct: false },
      { text: 'Reducing structural bending moment', correct: false },
    ],
    explanation: 'Sweep reduces the component of Mach number normal to the leading edge (M_normal = M·cos Λ), delaying the onset of wave drag as the aircraft approaches transonic speeds.',
  },
  {
    question: 'What is taper ratio (λ) in wing design?',
    options: [
      { text: 'The ratio of wing area to fuselage cross-section', correct: false },
      { text: 'Span squared divided by wing area (b²/S)', correct: false },
      { text: 'Tip chord divided by root chord (c_tip / c_root)', correct: true },
      { text: 'The ratio of sweep at 25% chord to 50% chord', correct: false },
    ],
    explanation: 'Taper ratio λ = c_tip/c_root. A tapered wing (λ < 1) more closely approximates the elliptical lift distribution, reducing induced drag compared to a constant-chord (rectangular) wing.',
  },
];

const SURFACE_INFO = {
  slat: {
    title: 'Leading-Edge Slats',
    desc: 'Extend forward to create a slot, re-energizing the upper surface boundary layer and delaying stall to higher angles of attack.',
    stat: 'ΔC_Lmax ≈ +0.3 to +0.5',
    color: '#f59e0b',
  },
  aileron: {
    title: 'Ailerons (Roll Control)',
    desc: 'Deflect differentially — one up, one down — to create asymmetric lift and roll the aircraft into a bank for turning.',
    stat: 'Deflection: ±25° typical',
    color: '#22c55e',
  },
  flap: {
    title: 'Trailing-Edge Flaps',
    desc: 'Increase wing camber and area during takeoff/landing, dramatically boosting lift at low speeds.',
    stat: 'ΔC_Lmax ≈ +0.6 to +0.9',
    color: '#38bdf8',
  },
  spoiler: {
    title: 'Spoilers / Speed Brakes',
    desc: 'Disrupt airflow over the upper surface, dumping lift and increasing drag for descent control and ground deceleration.',
    stat: 'Drag increase: 40–80%',
    color: '#fb7185',
  },
};

const WingsSection = () => {
  const [isAdvanced, setIsAdvanced] = useState(false);
  const [quizAnswers, setQuizAnswers] = useState({});
  const [activeFlap, setActiveFlap] = useState(null);

  const activeQuiz = isAdvanced ? QUIZ_ADVANCED : QUIZ_BEGINNER;

  const handleAnswer = (qIdx, aIdx) => {
    setQuizAnswers(prev => ({ ...prev, [qIdx]: aIdx }));
  };

  const handleModeSwitch = (advanced) => {
    setIsAdvanced(advanced);
    setQuizAnswers({});
  };

  const surfaceData = activeFlap ? SURFACE_INFO[activeFlap] : null;

  return (
    <div className="min-h-full px-6 lg:px-10 py-8 max-w-4xl mx-auto">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <div className="flex items-center gap-2 text-[11px] font-mono tracking-widest text-[var(--color-edu-sky)] uppercase mb-3">
          <Link to="/explore" className="hover:underline">Explorer</Link>
          <ChevronRight size={10} />
          <span>Wings</span>
        </div>
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-3xl lg:text-4xl font-bold text-white mb-2 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#a78bfa]/15 border border-[#a78bfa]/30 flex items-center justify-center text-[#a78bfa]">
                <Plane size={20} />
              </div>
              The Wings
            </h1>
            <p className="text-[var(--color-edu-text-muted)]">Lift, control, and fuel — the most critical component</p>
          </div>
          <div className="complexity-toggle">
            <button className={`complexity-toggle-btn ${!isAdvanced ? 'active' : ''}`} onClick={() => handleModeSwitch(false)}>Beginner</button>
            <button className={`complexity-toggle-btn ${isAdvanced ? 'active' : ''}`} onClick={() => handleModeSwitch(true)}>Advanced</button>
          </div>
        </div>
      </motion.div>

      {/* Interactive Wing Diagram */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mb-8 bg-[var(--color-edu-surface)] border border-white/5 rounded-2xl p-6 overflow-hidden relative"
      >
        <div className="absolute inset-0 edu-grid-bg opacity-30 pointer-events-none" />
        <div className="text-[10px] font-mono tracking-widest text-[var(--color-edu-text-muted)] uppercase mb-4">
          Wing Planform · Hover control surfaces for details
        </div>

        <div className="flex flex-col lg:flex-row gap-6 items-start">
          {/* SVG Wing */}
          <svg viewBox="0 0 500 380" className="w-full lg:w-3/5 max-w-md mx-auto h-auto relative z-5">
            <defs>
              <linearGradient id="wingFill" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#a78bfa" stopOpacity="0.08" />
                <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.03" />
              </linearGradient>
              <linearGradient id="wingStroke" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#a78bfa" stopOpacity="0.5" />
                <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.3" />
              </linearGradient>
            </defs>

            {/* ── Right Wing (top half = right wing seen from above) ── */}
            {/* Realistic swept+tapered planform: root chord ~140px, tip chord ~50px, 25° sweep */}
            <path
              d="M250,90 L250,230 L245,232 C220,235 160,245 100,270 L75,278 Q70,280 68,276 L65,268 C80,238 130,160 200,100 Q225,82 250,90 Z"
              fill="url(#wingFill)" stroke="url(#wingStroke)" strokeWidth="1.5"
            />

            {/* ── Left Wing (mirror) ── */}
            <path
              d="M250,90 L250,230 L255,232 C280,235 340,245 400,270 L425,278 Q430,280 432,276 L435,268 C420,238 370,160 300,100 Q275,82 250,90 Z"
              fill="url(#wingFill)" stroke="url(#wingStroke)" strokeWidth="1.5"
            />

            {/* ── Internal Structure Lines (spars) ── */}
            {/* Front spar (~25% chord) */}
            <line x1="230" y1="110" x2="85" y2="268" stroke="#a78bfa" strokeWidth="0.6" strokeOpacity="0.15" strokeDasharray="6 3" />
            <line x1="270" y1="110" x2="415" y2="268" stroke="#a78bfa" strokeWidth="0.6" strokeOpacity="0.15" strokeDasharray="6 3" />
            {/* Rear spar (~65% chord) */}
            <line x1="248" y1="195" x2="78" y2="274" stroke="#a78bfa" strokeWidth="0.6" strokeOpacity="0.12" strokeDasharray="4 4" />
            <line x1="252" y1="195" x2="422" y2="274" stroke="#a78bfa" strokeWidth="0.6" strokeOpacity="0.12" strokeDasharray="4 4" />
            {/* Ribs */}
            {[0.25, 0.45, 0.65, 0.85].map((t, i) => {
              const lx1 = 250 - t * 165, ly1 = 110 + t * 158;
              const lx2 = 250 - t * 172, ly2 = 195 + t * 79;
              const rx1 = 250 + t * 165, ry1 = ly1;
              const rx2 = 250 + t * 172, ry2 = ly2;
              return (
                <g key={i}>
                  <line x1={lx1} y1={ly1} x2={lx2} y2={ly2} stroke="#a78bfa" strokeWidth="0.4" strokeOpacity="0.12" />
                  <line x1={rx1} y1={ry1} x2={rx2} y2={ry2} stroke="#a78bfa" strokeWidth="0.4" strokeOpacity="0.12" />
                </g>
              );
            })}

            {/* Centerline */}
            <line x1="250" y1="70" x2="250" y2="300" stroke="white" strokeWidth="0.5" strokeOpacity="0.1" strokeDasharray="5 5" />

            {/* ── Slats (left wing leading edge) ── */}
            <g
              className="cursor-pointer"
              onMouseEnter={() => setActiveFlap('slat')}
              onMouseLeave={() => setActiveFlap(null)}
            >
              <path d="M195,115 L125,185 L118,180 L185,108 Z"
                fill="#f59e0b" fillOpacity={activeFlap === 'slat' ? 0.35 : 0.06}
                stroke="#f59e0b" strokeWidth={activeFlap === 'slat' ? 2 : 1} strokeOpacity={activeFlap === 'slat' ? 0.9 : 0.2}
              />
              <text x="145" y="155" textAnchor="middle" fill="#f59e0b" fontSize="7" fontWeight="bold"
                transform="rotate(-48, 145, 155)" opacity={activeFlap === 'slat' ? 1 : 0.35} fontFamily="monospace">SLAT</text>
            </g>

            {/* ── Aileron (left wing, outboard trailing edge) ── */}
            <g
              className="cursor-pointer"
              onMouseEnter={() => setActiveFlap('aileron')}
              onMouseLeave={() => setActiveFlap(null)}
            >
              <path d="M80,273 L130,255 L135,262 L88,278 Z"
                fill="#22c55e" fillOpacity={activeFlap === 'aileron' ? 0.35 : 0.06}
                stroke="#22c55e" strokeWidth={activeFlap === 'aileron' ? 2 : 1} strokeOpacity={activeFlap === 'aileron' ? 0.9 : 0.2}
              />
              <text x="105" y="290" textAnchor="middle" fill="#22c55e" fontSize="7" fontWeight="bold"
                opacity={activeFlap === 'aileron' ? 1 : 0.35} fontFamily="monospace">AILERON</text>
            </g>

            {/* ── Flaps (left wing, inboard trailing edge) ── */}
            <g
              className="cursor-pointer"
              onMouseEnter={() => setActiveFlap('flap')}
              onMouseLeave={() => setActiveFlap(null)}
            >
              <path d="M140,250 L245,230 L248,238 L148,258 Z"
                fill="#38bdf8" fillOpacity={activeFlap === 'flap' ? 0.35 : 0.06}
                stroke="#38bdf8" strokeWidth={activeFlap === 'flap' ? 2 : 1} strokeOpacity={activeFlap === 'flap' ? 0.9 : 0.2}
              />
              <text x="195" y="262" textAnchor="middle" fill="#38bdf8" fontSize="7" fontWeight="bold"
                opacity={activeFlap === 'flap' ? 1 : 0.35} fontFamily="monospace">FLAPS</text>
            </g>

            {/* ── Spoilers (left wing, upper surface) ── */}
            <g
              className="cursor-pointer"
              onMouseEnter={() => setActiveFlap('spoiler')}
              onMouseLeave={() => setActiveFlap(null)}
            >
              <rect x="165" y="200" width="60" height="8" rx="2"
                fill="#fb7185" fillOpacity={activeFlap === 'spoiler' ? 0.35 : 0.06}
                stroke="#fb7185" strokeWidth={activeFlap === 'spoiler' ? 1.5 : 0.8} strokeOpacity={activeFlap === 'spoiler' ? 0.9 : 0.2}
                transform="rotate(-15, 195, 204)"
              />
              <text x="185" y="195" textAnchor="middle" fill="#fb7185" fontSize="6" fontWeight="bold"
                opacity={activeFlap === 'spoiler' ? 1 : 0.3} fontFamily="monospace"
                transform="rotate(-15, 185, 195)">SPOILER</text>
            </g>

            {/* ── Engine nacelle (left wing) ── */}
            <ellipse cx="175" cy="175" rx="16" ry="10" fill="white" fillOpacity="0.03"
              stroke="white" strokeWidth="0.8" strokeOpacity="0.15" transform="rotate(-40, 175, 175)" />
            <text x="175" y="195" textAnchor="middle" fill="white" fontSize="6" fontFamily="monospace" opacity="0.2"
              transform="rotate(-10, 175, 195)">ENGINE</text>

            {/* ── Fuel tank area (right wing, dashed) ── */}
            <path d="M270,120 L360,190 L355,240 L252,200 Z"
              fill="#f59e0b" fillOpacity="0.02" stroke="#f59e0b" strokeWidth="0.6" strokeOpacity="0.1" strokeDasharray="4 3" />
            <text x="315" y="195" textAnchor="middle" fill="#f59e0b" fontSize="7" fontFamily="monospace" opacity="0.25">FUEL TANK</text>

            {/* ── Dimension annotations ── */}
            {/* Span */}
            <g opacity="0.5">
              <line x1="65" y1="320" x2="435" y2="320" stroke="#a78bfa" strokeWidth="0.8" />
              <line x1="65" y1="315" x2="65" y2="325" stroke="#a78bfa" strokeWidth="0.8" />
              <line x1="435" y1="315" x2="435" y2="325" stroke="#a78bfa" strokeWidth="0.8" />
              <text x="250" y="340" textAnchor="middle" fill="#a78bfa" fontSize="9" fontFamily="monospace" fontWeight="bold">WING SPAN (b)</text>
            </g>
            {/* Root chord */}
            <g opacity="0.35">
              <line x1="245" y1="88" x2="245" y2="234" stroke="white" strokeWidth="0.5" />
              <text x="238" y="165" textAnchor="end" fill="white" fontSize="7" fontFamily="monospace" transform="rotate(-90, 238, 165)">ROOT CHORD (c_r)</text>
            </g>

            {/* Sweep angle indicator */}
            <g opacity="0.3">
              <path d="M250,105 A 50 50 0 0 0 225,95" fill="none" stroke="#a78bfa" strokeWidth="0.8" />
              <text x="220" y="92" fill="#a78bfa" fontSize="7" fontFamily="monospace">Λ</text>
            </g>
          </svg>

          {/* Info panel (right side) — legend first, info below with absolute pos */}
          <div className="lg:w-2/5 flex flex-col gap-3 relative z-5">
            {/* Legend — always at top, never shifts */}
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(SURFACE_INFO).map(([key, info]) => (
                <div
                  key={key}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer transition-all duration-200"
                  style={{
                    background: activeFlap === key ? `${info.color}12` : 'transparent',
                    border: `1px solid ${activeFlap === key ? info.color + '30' : 'rgba(255,255,255,0.04)'}`,
                  }}
                  onMouseEnter={() => setActiveFlap(key)}
                  onMouseLeave={() => setActiveFlap(null)}
                >
                  <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: info.color }} />
                  <span className="text-[10px] font-mono text-[var(--color-edu-text-muted)] capitalize">{key}</span>
                </div>
              ))}
            </div>

            {/* Info content — fixed height, absolute children */}
            <div style={{ position: 'relative', height: 200 }}>
              <AnimatePresence mode="wait">
                {surfaceData ? (
                  <motion.div
                    key={activeFlap}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.2 }}
                    className="p-5 rounded-xl border"
                    style={{
                      background: `${surfaceData.color}08`,
                      borderColor: `${surfaceData.color}25`,
                      position: 'absolute', inset: 0, overflow: 'hidden',
                    }}
                  >
                    <div className="text-[10px] font-mono tracking-widest uppercase mb-2" style={{ color: surfaceData.color }}>
                      Control Surface
                    </div>
                    <h3 className="text-base font-bold text-white mb-2">{surfaceData.title}</h3>
                    <p className="text-sm text-[var(--color-edu-text-muted)] leading-relaxed mb-3">
                      {surfaceData.desc}
                    </p>
                    <div className="px-3 py-2 rounded-lg bg-black/30 border border-white/5 text-[11px] font-mono" style={{ color: surfaceData.color }}>
                      {surfaceData.stat}
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="default"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="p-5 rounded-xl border border-white/5 text-center"
                    style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.01)' }}
                  >
                    <p className="text-sm text-[var(--color-edu-text-muted)]">
                      Hover over a <span className="text-white font-semibold">control surface</span> on the wing to see what it does.
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
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

      {/* Knowledge Check — 3 questions per mode */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="mt-10 bg-[var(--color-edu-surface)] border border-white/5 rounded-2xl p-6 space-y-6"
      >
        <div className="text-[10px] font-mono tracking-widest text-[var(--color-edu-amber)] uppercase">✦ Knowledge Check · {isAdvanced ? 'Advanced' : 'Beginner'}</div>
        {activeQuiz.map((q, qIdx) => (
          <div key={`${isAdvanced}-${qIdx}`} className="border-t border-white/5 pt-5 first:border-t-0 first:pt-0">
            <h3 className="text-base font-bold text-white mb-3">{q.question}</h3>
            <div className="space-y-2">
              {q.options.map((opt, aIdx) => (
                <button
                  key={aIdx}
                  onClick={() => handleAnswer(qIdx, aIdx)}
                  disabled={quizAnswers[qIdx] !== undefined}
                  className={`quiz-option w-full text-left
                    ${quizAnswers[qIdx] === aIdx && opt.correct ? 'correct' : ''}
                    ${quizAnswers[qIdx] === aIdx && !opt.correct ? 'incorrect' : ''}
                    ${quizAnswers[qIdx] !== undefined && opt.correct && quizAnswers[qIdx] !== aIdx ? 'correct' : ''}
                  `}
                >
                  <div className="w-7 h-7 rounded-full border border-white/10 flex items-center justify-center text-xs font-bold flex-shrink-0">
                    {String.fromCharCode(65 + aIdx)}
                  </div>
                  {opt.text}
                </button>
              ))}
            </div>
            {quizAnswers[qIdx] !== undefined && (
              <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                className="mt-3 p-3 rounded-xl bg-[var(--color-edu-green)]/8 border border-[var(--color-edu-green)]/20 text-sm text-[var(--color-edu-text-muted)]">
                <span className="font-bold text-[var(--color-edu-green)]">Explanation: </span>{q.explanation}
              </motion.div>
            )}
          </div>
        ))}
      </motion.div>

      {/* Navigation */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}
        className="mt-8 flex items-center justify-between pb-8">
        <Link to="/explore/fuselage" className="text-sm font-semibold text-[var(--color-edu-text-muted)] hover:text-white transition-colors">← Fuselage</Link>
        <div className="flex items-center gap-3">
          <Link to="/lab/wings" className="flex items-center gap-2 px-4 py-2 rounded-lg text-[12px] font-bold tracking-wider border border-[#a78bfa]/30 text-[#a78bfa] bg-[#a78bfa]/8 hover:bg-[#a78bfa]/15 transition-all">
            🧪 Wings Lab
          </Link>
          <Link to="/explore/tail" className="cta-primary !py-2.5 !px-5 !text-[13px] !rounded-lg">
            Next: Tail <ArrowRight size={16} />
          </Link>
        </div>
      </motion.div>
    </div>
  );
};

export default WingsSection;
