import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Box, ChevronRight, Users, Shield, Layers, ArrowRight, CircleDot } from 'lucide-react';

const SECTIONS = [
  {
    id: 'purpose',
    title: 'What is the Fuselage?',
    beginner: 'The fuselage is the main body of an airplane. Think of it like the body of a bus — it holds passengers, cargo, the cockpit, and connects all other parts (wings, tail, engines) together.',
    advanced: 'The fuselage is the primary structural body of the aircraft, functioning as a semi-monocoque pressure vessel. It must resist bending moments from tail loads, shear from aerodynamic forces, torsion from asymmetric thrust, and internal pressurization (ΔP ≈ 8.6 psi at cruise altitude of FL350). Modern designs use stringers, frames, and skin panels to distribute loads efficiently.',
    icon: <Box size={20} />,
    color: '#38bdf8',
  },
  {
    id: 'types',
    title: 'Passenger vs. Cargo Configuration',
    beginner: 'A passenger airplane has seats, overhead bins, and windows. A cargo airplane removes all of that and replaces it with a large open space for boxes, pallets, and freight. Some airplanes (like the Boeing 747) can even do both — passengers on top, cargo below!',
    advanced: 'Passenger configurations use class-dependent seat pitch (28"–36" economy, 38"–60" business) with floor-to-ceiling galleys and lavatories. Cargo variants (e.g., 747-400F) use a main-deck cargo door, powered roller floors, and can carry LD3/LD6 ULD containers. Combi aircraft partition the main deck for mixed use. The belly hold of passenger aircraft typically accommodates containerized cargo alongside passenger baggage.',
    icon: <Users size={20} />,
    color: '#a78bfa',
  },
  {
    id: 'pressurization',
    title: 'Pressurization',
    beginner: 'At 35,000 feet, the air outside is too thin to breathe. The fuselage is sealed like a pressure cooker to keep the air inside at a comfortable level — similar to being at 6,000–8,000 feet altitude. This is why airplane windows are round — round shapes handle pressure better than square ones!',
    advanced: 'Aircraft cabins maintain a pressure altitude of 6,000–8,000 ft (cabin differential ≈ 8.6 psi). The fuselage undergoes pressurization cycles each flight, leading to fatigue loading — the primary structural life limiter. The Comet disasters (1954) demonstrated catastrophic metal fatigue at square window corners, leading to the universal adoption of oval/round windows. Modern outflow valves regulate cabin pressure via bleed air from engine compressor stages.',
    icon: <Shield size={20} />,
    color: '#22c55e',
  },
  {
    id: 'materials',
    title: 'Materials & Construction',
    beginner: 'Most airplane fuselages are made from aluminum because it\'s light and strong. Newer airplanes like the Boeing 787 use carbon fiber composite — even lighter and stronger, like what racing cars and sports equipment use.',
    advanced: 'Traditional aluminum alloys (2024-T3 for fatigue resistance, 7075-T6 for strength) are being replaced by CFRP (Carbon Fiber Reinforced Polymer) in modern designs. The 787 Dreamliner uses ~50% composites by weight, enabling higher cabin pressure (lower altitude equivalent = better comfort), larger windows, and elimination of ~50,000 fasteners. Trade-offs include repair complexity, lightning strike protection requirements, and manufacturing cost.',
    icon: <Layers size={20} />,
    color: '#f59e0b',
  },
  {
    id: 'landing_gear',
    title: 'Landing Gear',
    beginner: 'Landing gear (the undercarriage) is the system of wheels and struts that supports the airplane on the ground. Most jets use a tricycle layout: one nose gear and two main gear legs under the wings. After takeoff the gear retracts into the fuselage or wing to reduce drag — open gear can waste up to 30% extra fuel at cruise.',
    advanced: 'The undercarriage absorbs landing energy (sink rates up to 3 m/s). Oleo-pneumatic struts use oil and compressed nitrogen to absorb and dampen loads. Main gear carries ~95% of MTOW; nose gear ~5%. Shimmy dampers prevent high-frequency nose-wheel oscillation. FAR Part 25.473 requires gear to withstand 2.67g at maximum sink rate. Gear retraction systems are typically hydraulic with electric backup.',
    icon: <CircleDot size={20} />,
    color: '#fb7185',
  },
];

const QUIZ_BEGINNER = [
  { question: 'Why are airplane windows round instead of square?', options: [{ text: 'They look better aesthetically', correct: false }, { text: 'Round shapes distribute pressure stress evenly, preventing cracks', correct: true }, { text: "It's cheaper to manufacture round windows", correct: false }, { text: 'Square windows would block the view', correct: false }], explanation: 'Round windows distribute stress evenly. Square corners create stress concentrations that caused the de Havilland Comet crashes in 1954.' },
  { question: 'Why does landing gear retract after takeoff?', options: [{ text: 'To make room for passengers', correct: false }, { text: 'To reduce aerodynamic drag and save fuel', correct: true }, { text: 'To prevent freezing at altitude', correct: false }, { text: 'Required by law in all countries', correct: false }], explanation: 'Extended gear creates enormous drag. Retracting it saves up to 30% fuel at cruise and significantly increases maximum speed.' },
  { question: 'What cabin pressure altitude is maintained in a commercial aircraft at cruise?', options: [{ text: 'Sea level (0 ft)', correct: false }, { text: '35,000 ft (same as cruise)', correct: false }, { text: '6,000 to 8,000 ft', correct: true }, { text: '20,000 ft', correct: false }], explanation: 'Commercial aircraft maintain 6,000–8,000 ft cabin pressure equivalent, keeping passengers comfortable without full sea-level pressure systems.' },
];

const QUIZ_ADVANCED = [
  { question: 'What is the primary structural life limiter for pressurized fuselages?', options: [{ text: 'Corrosion from moisture', correct: false }, { text: 'Metal fatigue from repeated pressurization cycles', correct: true }, { text: 'UV degradation of composites', correct: false }, { text: 'Skin wear from airflow', correct: false }], explanation: 'Each flight is one pressurization cycle. Repeated cyclic stress causes fatigue cracks, making flight cycles the primary life limiter tracked as MSN/FC.' },
  { question: 'What is the cabin differential pressure (ΔP) at FL350?', options: [{ text: '2.5 psi', correct: false }, { text: '5.2 psi', correct: false }, { text: '8.6 psi', correct: true }, { text: '14.7 psi', correct: false }], explanation: 'Cabin pressure ~10.9 psi (8,000 ft eq.) minus ambient ~2.1 psi (FL350) = ~8.6 psi differential. This creates hoop stress in the fuselage skin: σ = ΔP·r/t.' },
  { question: 'What load factor must landing gear withstand per FAR Part 25?', options: [{ text: '1.5g', correct: false }, { text: '2.0g', correct: false }, { text: '2.67g', correct: true }, { text: '3.5g', correct: false }], explanation: 'FAR Part 25.473 requires 2.67g at maximum sink rate of 3 m/s (600 ft/min). Oleo struts must absorb all kinetic energy without structural failure.' },
];

const FuselageSection = () => {
  const [isAdvanced, setIsAdvanced] = useState(false);
  const [quizAnswers, setQuizAnswers] = useState({});
  const activeQuiz = isAdvanced ? QUIZ_ADVANCED : QUIZ_BEGINNER;
  const handleAnswer = (qIdx, aIdx) => setQuizAnswers(prev => ({ ...prev, [qIdx]: aIdx }));
  const handleModeSwitch = (adv) => { setIsAdvanced(adv); setQuizAnswers({}); };

  return (
    <div className="min-h-full px-6 lg:px-10 py-8 max-w-4xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-center gap-2 text-[11px] font-mono tracking-widest text-[var(--color-edu-sky)] uppercase mb-3">
          <Link to="/explore" className="hover:underline">Explorer</Link>
          <ChevronRight size={10} />
          <span>Fuselage</span>
        </div>
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-3xl lg:text-4xl font-bold text-white mb-2 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#38bdf8]/15 border border-[#38bdf8]/30 flex items-center justify-center text-[#38bdf8]">
                <Box size={20} />
              </div>
              The Fuselage
            </h1>
            <p className="text-[var(--color-edu-text-muted)]">The structural backbone of every aircraft</p>
          </div>
          <div className="complexity-toggle">
            <button className={`complexity-toggle-btn ${!isAdvanced ? 'active' : ''}`} onClick={() => handleModeSwitch(false)}>Beginner</button>
            <button className={`complexity-toggle-btn ${isAdvanced ? 'active' : ''}`} onClick={() => handleModeSwitch(true)}>Advanced</button>
          </div>
        </div>
      </motion.div>

      {/* Cross-section Diagram */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mb-8 bg-[var(--color-edu-surface)] border border-white/5 rounded-2xl p-6 overflow-hidden relative"
      >
        <div className="absolute inset-0 edu-grid-bg opacity-30 pointer-events-none" />
        <div className="text-[10px] font-mono tracking-widest text-[var(--color-edu-text-muted)] uppercase mb-4">
          Cross-Section View
        </div>
        <svg viewBox="0 0 620 370" className="w-full max-w-lg mx-auto h-auto relative z-5 drop-shadow-2xl">
          <defs>
            <radialGradient id="fuselageGlow" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
              <stop offset="0%" stopColor="var(--color-edu-sky)" stopOpacity="0.08" />
              <stop offset="100%" stopColor="transparent" stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* Outer Glow */}
          <ellipse cx="260" cy="175" rx="145" ry="145" fill="url(#fuselageGlow)" />

          {/* Main Frame (Semi-monocoque) */}
          <ellipse cx="260" cy="175" rx="140" ry="140" fill="none" stroke="var(--color-edu-sky)" strokeWidth="4" strokeOpacity="0.4" />
          <ellipse cx="260" cy="175" rx="136" ry="136" fill="var(--color-edu-navy-light)" fillOpacity="0.4" stroke="var(--color-edu-sky)" strokeWidth="1" strokeOpacity="0.1" />

          {/* Stringers (Structural ribs) */}
          {[...Array(24)].map((_, i) => {
            const angle = (i * 15) * Math.PI / 180;
            const x1 = 260 + Math.cos(angle) * 136;
            const y1 = 175 + Math.sin(angle) * 136;
            const x2 = 260 + Math.cos(angle) * 140;
            const y2 = 175 + Math.sin(angle) * 140;
            return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="var(--color-edu-sky)" strokeWidth="1" strokeOpacity="0.3" />;
          })}

          {/* Floor divider */}
          <rect x="120" y="210" width="280" height="4" rx="2" fill="var(--color-edu-text-muted)" fillOpacity="0.25" />

          {/* Internal V-bracing */}
          <line x1="160" y1="214" x2="260" y2="310" stroke="var(--color-edu-text-muted)" strokeWidth="0.8" strokeOpacity="0.1" />
          <line x1="360" y1="214" x2="260" y2="310" stroke="var(--color-edu-text-muted)" strokeWidth="0.8" strokeOpacity="0.1" />

          {/* Passenger Cabin */}
          <g opacity="0.85">
            <text x="260" y="80" textAnchor="middle" fill="var(--color-edu-sky)" fontSize="10" fontWeight="bold" fontFamily="monospace" letterSpacing="2">PASSENGER CABIN</text>

            {/* Overhead bins (left & right) */}
            <path d="M145,92 Q260,70 375,92 L365,112 Q260,95 155,112 Z" fill="white" fillOpacity="0.03" stroke="white" strokeWidth="0.8" strokeOpacity="0.1" />
            <text x="260" y="105" textAnchor="middle" fill="white" fontSize="6" fontFamily="monospace" opacity="0.2">OVERHEAD BINS</text>

            {/* Aisle */}
            <line x1="260" y1="130" x2="260" y2="205" stroke="white" strokeWidth="0.5" strokeOpacity="0.06" strokeDasharray="3 3" />

            {/* Seats — 3+3 with headrests */}
            {[-80, -52, -24, 24, 52, 80].map((x, i) => (
              <g key={i} transform={`translate(${260 + x}, 165)`}>
                {/* Seat back */}
                <rect x="-11" y="-28" width="22" height="8" rx="3" fill="var(--color-edu-sky)" fillOpacity="0.15" stroke="var(--color-edu-sky)" strokeWidth="0.8" strokeOpacity="0.25" />
                {/* Seat bottom */}
                <rect x="-11" y="-18" width="22" height="22" rx="3" fill="var(--color-edu-sky)" fillOpacity="0.08" stroke="var(--color-edu-sky)" strokeWidth="0.8" strokeOpacity="0.15" />
                {/* Person dot */}
                <circle cx="0" cy="-8" r="3" fill="var(--color-edu-sky)" fillOpacity="0.12" />
              </g>
            ))}
          </g>

          {/* Lower cargo */}
          <g opacity="0.8">
            <text x="260" y="248" textAnchor="middle" fill="var(--color-edu-amber)" fontSize="9" fontWeight="bold" fontFamily="monospace" letterSpacing="1">CARGO COMPARTMENT</text>
            {[-60, 0, 60].map((x, i) => (
              <g key={i} transform={`translate(${260 + x}, 275)`}>
                <rect x="-25" y="-12" width="50" height="25" rx="3" fill="var(--color-edu-amber)" fillOpacity="0.04" stroke="var(--color-edu-amber)" strokeWidth="1" strokeOpacity="0.2" />
                {/* Container cross-hatch */}
                <line x1="-20" y1="-8" x2="20" y2="8" stroke="var(--color-edu-amber)" strokeWidth="0.4" strokeOpacity="0.08" />
                <line x1="-20" y1="8" x2="20" y2="-8" stroke="var(--color-edu-amber)" strokeWidth="0.4" strokeOpacity="0.08" />
              </g>
            ))}
          </g>

          {/* Callout labels — repositioned to stay inside viewBox */}
          <g fill="var(--color-edu-text-muted)" fontSize="9" fontFamily="monospace">
            <line x1="395" y1="120" x2="450" y2="85" stroke="var(--color-edu-text-muted)" strokeWidth="0.5" strokeOpacity="0.4" />
            <circle cx="395" cy="120" r="2" fill="var(--color-edu-text-muted)" fillOpacity="0.3" />
            <text x="455" y="88">Structural Skin</text>

            <line x1="400" y1="212" x2="450" y2="232" stroke="var(--color-edu-text-muted)" strokeWidth="0.5" strokeOpacity="0.4" />
            <circle cx="400" cy="212" r="2" fill="var(--color-edu-text-muted)" fillOpacity="0.3" />
            <text x="455" y="235">Main Floor Beam</text>

            <line x1="260" y1="315" x2="260" y2="345" stroke="var(--color-edu-text-muted)" strokeWidth="0.5" strokeOpacity="0.4" />
            <text x="260" y="358" textAnchor="middle">Bilge / Keel Beam</text>

            <line x1="155" y1="105" x2="80" y2="72" stroke="var(--color-edu-text-muted)" strokeWidth="0.5" strokeOpacity="0.4" />
            <circle cx="155" cy="105" r="2" fill="var(--color-edu-text-muted)" fillOpacity="0.3" />
            <text x="10" y="68">Overhead Stowage</text>
          </g>
        </svg>
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
              <div 
                className="w-9 h-9 rounded-lg flex items-center justify-center"
                style={{ background: `${section.color}15`, color: section.color }}
              >
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
                <button key={aIdx} onClick={() => handleAnswer(qIdx, aIdx)} disabled={quizAnswers[qIdx] !== undefined}
                  className={`quiz-option w-full text-left ${quizAnswers[qIdx] === aIdx && opt.correct ? 'correct' : ''} ${quizAnswers[qIdx] === aIdx && !opt.correct ? 'incorrect' : ''} ${quizAnswers[qIdx] !== undefined && opt.correct && quizAnswers[qIdx] !== aIdx ? 'correct' : ''}`}>
                  <div className="w-7 h-7 rounded-full border border-white/10 flex items-center justify-center text-xs font-bold flex-shrink-0">{String.fromCharCode(65 + aIdx)}</div>
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
        <Link to="/explore" className="text-sm font-semibold text-[var(--color-edu-text-muted)] hover:text-white transition-colors">← Back to Explorer</Link>
        <div className="flex items-center gap-3">
          <Link to="/lab/fuselage" className="flex items-center gap-2 px-4 py-2 rounded-lg text-[12px] font-bold tracking-wider border border-[#38bdf8]/30 text-[#38bdf8] bg-[#38bdf8]/8 hover:bg-[#38bdf8]/15 transition-all">
            🧪 Fuselage Lab
          </Link>
          <Link to="/explore/wings" className="cta-primary !py-2.5 !px-5 !text-[13px] !rounded-lg">
            Next: Wings <ArrowRight size={16} />
          </Link>
        </div>
      </motion.div>
    </div>
  );
};

export default FuselageSection;

