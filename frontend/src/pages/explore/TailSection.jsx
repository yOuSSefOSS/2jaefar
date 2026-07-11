import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, ChevronRight, Triangle, Wind, Sliders, Navigation } from 'lucide-react';
import SEO from '../../components/SEO';

const SECTIONS = [
  {
    id: 'purpose',
    title: 'What is the Empennage?',
    beginner: 'The tail section (empennage) is the rear of the airplane that acts like the fins on a dart — it keeps the aircraft flying straight and stable. Without a tail, an airplane would tumble uncontrollably. It has two main parts: the horizontal stabilizer (controls pitch — nose up/down) and the vertical stabilizer (controls yaw — nose left/right).',
    advanced: 'The empennage provides longitudinal (pitch) and directional (yaw) stability and control. The horizontal tail generates a downward tail load to balance the nose-heavy pitching moment of the wing (M_ac). The tail volume coefficient V_H = S_H·l_H/(S·c̄) governs pitch stability. A conventional configuration has both stabilizers; T-tail places the horizontal stabilizer atop the vertical fin, improving aerodynamic efficiency but risking deep-stall at high alpha.',
    icon: <Navigation size={20} />,
    color: '#38bdf8',
  },
  {
    id: 'horizontal',
    title: 'Horizontal Stabilizer & Elevator',
    beginner: 'The horizontal stabilizer is the small wing at the tail. It keeps the airplane from pitching (nose going up or down). The elevator is the movable flap attached to it — when the pilot pulls back on the controls, the elevator goes up, pushing the tail down and raising the nose. Many modern jets have an all-moving "stabilator" instead of a separate elevator.',
    advanced: 'The elevator provides pitch control moment: M = q·S_H·l_H·C_Le·δ_e, where δ_e is elevator deflection (typically ±25°). The stick-free neutral point determines the aircraft\'s static margin with free controls. Trimmable horizontal stabilizers (THS on Airbus, manual trim on Boeing) set the pitch trim for each flight phase. On T-tails (e.g., MD-80), the horizontal tail sits atop the vertical fin to avoid engine exhaust and improve efficiency, but the deep-stall hazard requires pitch attitude limiting systems.',
    icon: <Sliders size={20} />,
    color: '#a78bfa',
  },
  {
    id: 'vertical',
    title: 'Vertical Stabilizer & Rudder',
    beginner: 'The vertical fin (vertical stabilizer) sticks up at the tail and keeps the nose pointed straight. The rudder is the movable surface on the back of the fin. Pilots use it to coordinate turns and counteract crosswinds during landing. On multi-engine aircraft, the rudder is critical for controlling the airplane if one engine fails.',
    advanced: 'The vertical tail provides yaw stability (weathercock stability: Cnβ > 0) and rudder control authority. The rudder must provide sufficient yaw moment to counteract the asymmetric thrust of an engine failure at VMC (minimum control speed): N_rudder > N_engine_out. Rudder deflection is limited by structural loads (pedal force limits) and aerodynamic floating. The fin also provides side-force for crosswind landings (crabbed approach). Dorsal and ventral fins can augment fin effectiveness at high sideslip angles.',
    icon: <Wind size={20} />,
    color: '#22c55e',
  },
  {
    id: 'configs',
    title: 'Tail Configurations',
    beginner: 'Not all tails look the same! The most common is the conventional tail (horizontal on the bottom, vertical going up). A T-tail has the horizontal stabilizer on top of the vertical fin (like the Boeing 717). A V-tail combines both stabilizers into two angled surfaces (like the Beechcraft Bonanza). Each has trade-offs in weight, drag, and control.',
    advanced: 'Tail configurations include: Conventional (lowest drag, simple); T-tail (clean wake from wing/flaps, deep-stall risk); Cruciform (compromise between conventional and T-tail); H-tail (twin booms for prop clearance, e.g., C-119); V-tail (V = dihedral angle, ruddervators mix pitch/yaw, complex mechanics, e.g., Beechcraft 35); Inverted V-tail; Twin-tail (high yaw authority, e.g., F/A-18). Three-surface configurations (canard + wing + tail) provide trim drag reduction.',
    icon: <Triangle size={20} />,
    color: '#f59e0b',
  },
];

const QUIZ_BEGINNER = [
  {
    question: 'What does the elevator on the horizontal stabilizer control?',
    options: [
      { text: 'The banking (rolling) of the aircraft left or right', correct: false },
      { text: 'The pitch of the aircraft — nose up or nose down', correct: true },
      { text: 'The speed of the aircraft by varying drag', correct: false },
      { text: 'The yaw — turning the nose left or right', correct: false },
    ],
    explanation: 'The elevator deflects up or down to create a pitch moment at the tail, rotating the aircraft nose up or down. The rudder controls yaw, and ailerons control roll.',
  },
  {
    question: 'What is the purpose of the vertical stabilizer?',
    options: [
      { text: 'To increase lift during takeoff and landing', correct: false },
      { text: 'To keep the aircraft nose pointing straight (directional stability)', correct: true },
      { text: 'To reduce fuel consumption at cruise', correct: false },
      { text: 'To store the auxiliary power unit (APU)', correct: false },
    ],
    explanation: 'The vertical stabilizer acts like a weather vane, providing directional (yaw) stability so the nose stays aligned with the flight path. The rudder attached to it provides yaw control.',
  },
  {
    question: 'On a T-tail aircraft, where is the horizontal stabilizer located?',
    options: [
      { text: 'Below the fuselage near the belly', correct: false },
      { text: 'Midway along the vertical fin', correct: false },
      { text: 'At the top of the vertical fin', correct: true },
      { text: 'On the wings near the wingtips', correct: false },
    ],
    explanation: 'A T-tail places the horizontal stabilizer at the top of the vertical fin. This keeps it out of the wing\'s turbulent wake and above jet exhaust, improving efficiency.',
  },
];

const QUIZ_ADVANCED = [
  {
    question: 'What is the tail volume coefficient (V_H) primarily used to determine?',
    options: [
      { text: 'The amount of fuel the tail section can carry', correct: false },
      { text: 'The longitudinal static stability of the aircraft', correct: true },
      { text: 'The maximum deflection angle of the elevator', correct: false },
      { text: 'The structural weight of the empennage', correct: false },
    ],
    explanation: 'V_H = S_H·l_H/(S·c̄) is the horizontal tail volume coefficient. A larger V_H means greater pitch stability. It is the primary design parameter governing how strongly the aircraft resists pitch disturbances.',
  },
  {
    question: 'What is the primary risk of a T-tail configuration at high angles of attack?',
    options: [
      { text: 'Flutter due to the mass of the elevated stabilizer', correct: false },
      { text: 'Deep stall — the wing wake blankets the horizontal tail, removing pitch recovery', correct: true },
      { text: 'Increased induced drag from interference effects', correct: false },
      { text: 'Reduced rudder authority due to horizontal tail blocking', correct: false },
    ],
    explanation: 'In deep stall, the wing\'s stalled wake rises and engulfs the T-tail, making the elevator ineffective. Without nose-down authority, the aircraft is locked in the stall. This is why T-tail aircraft require stick pushers (e.g., BAC 1-11, DC-9).',
  },
  {
    question: 'The rudder must provide sufficient authority at VMC. What is VMC?',
    options: [
      { text: 'Maximum speed for flap extension', correct: false },
      { text: 'Minimum control speed — the slowest speed at which the rudder can control asymmetric thrust from engine failure', correct: true },
      { text: 'Maximum cruise speed for the empennage', correct: false },
      { text: 'Maneuvering speed for crosswind operations', correct: false },
    ],
    explanation: 'VMC (minimum control speed) is the slowest speed at which, with one engine inoperative at full thrust, the rudder can maintain directional control within 5° of bank. The rudder must generate enough yaw moment to overcome the asymmetric thrust.',
  },
];

const TailSection = () => {
  const [isAdvanced, setIsAdvanced] = useState(false);
  const [quizAnswers, setQuizAnswers] = useState({});
  const activeQuiz = isAdvanced ? QUIZ_ADVANCED : QUIZ_BEGINNER;
  const handleAnswer = (qIdx, aIdx) => setQuizAnswers(prev => ({ ...prev, [qIdx]: aIdx }));
  const handleModeSwitch = (adv) => { setIsAdvanced(adv); setQuizAnswers({}); };

  return (
    <div className="min-h-full px-6 lg:px-10 py-8 max-w-4xl mx-auto">
      <SEO 
        title="Tail Section & Empennage Theory | Vortex Gen Explorer" 
        description="Learn about the purpose of the empennage, horizontal and vertical stabilizers, and various tail configurations in aircraft design."
      />
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <div className="flex items-center gap-2 text-[11px] font-mono tracking-widest text-[var(--color-edu-sky)] uppercase mb-3">
          <Link to="/explore" className="hover:underline">Explorer</Link>
          <ChevronRight size={10} />
          <span>Tail Section</span>
        </div>
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-3xl lg:text-4xl font-bold text-white mb-2 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#38bdf8]/15 border border-[#38bdf8]/30 flex items-center justify-center text-[#38bdf8]">
                <Navigation size={20} />
              </div>
              The Tail Section
            </h1>
            <p className="text-[var(--color-edu-text-muted)]">Pitch, yaw, and stability — the empennage in detail</p>
          </div>
          <div className="complexity-toggle">
            <button className={`complexity-toggle-btn ${!isAdvanced ? 'active' : ''}`} onClick={() => handleModeSwitch(false)}>Beginner</button>
            <button className={`complexity-toggle-btn ${isAdvanced ? 'active' : ''}`} onClick={() => handleModeSwitch(true)}>Advanced</button>
          </div>
        </div>
      </motion.div>

      {/* SVG Diagrams */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Horizontal Stabilizer — top-down view */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="bg-[var(--color-edu-surface)] border border-white/5 rounded-2xl p-5 relative overflow-hidden">
          <div className="absolute inset-0 edu-grid-bg opacity-20 pointer-events-none" />
          <div className="text-[10px] font-mono tracking-widest text-[var(--color-edu-text-muted)] uppercase mb-3">Horizontal Stabilizer · Top View</div>
          <svg viewBox="0 0 340 200" className="w-full h-auto">
            <defs>
              <linearGradient id="hStabGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#a78bfa" stopOpacity="0.5" />
                <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.3" />
              </linearGradient>
            </defs>
            {/* Fuselage center line */}
            <line x1="170" y1="10" x2="170" y2="190" stroke="white" strokeWidth="0.5" strokeOpacity="0.1" strokeDasharray="5 5" />
            {/* Fuselage rear cross-section */}
            <rect x="158" y="70" width="24" height="60" rx="6" fill="white" fillOpacity="0.04" stroke="white" strokeWidth="1" strokeOpacity="0.15" />

            {/* Left horizontal stabilizer */}
            <path d="M163,85 L163,115 L60,130 L55,118 L60,95 Z" fill="#a78bfa" fillOpacity="0.08" stroke="url(#hStabGrad)" strokeWidth="1.5" />
            {/* Right horizontal stabilizer */}
            <path d="M177,85 L177,115 L280,130 L285,118 L280,95 Z" fill="#a78bfa" fillOpacity="0.08" stroke="url(#hStabGrad)" strokeWidth="1.5" />

            {/* Elevator (movable portion — trailing edge, highlighted) */}
            <path d="M163,108 L60,125 L55,118 L60,112 L163,97 Z" fill="#a78bfa" fillOpacity="0.2" stroke="#a78bfa" strokeWidth="1.5" strokeOpacity="0.7" />
            <path d="M177,108 L280,125 L285,118 L280,112 L177,97 Z" fill="#a78bfa" fillOpacity="0.2" stroke="#a78bfa" strokeWidth="1.5" strokeOpacity="0.7" />

            {/* Pitch arrows */}
            <path d="M170,50 C185,40 195,45 185,60" fill="none" stroke="#22c55e" strokeWidth="1.5" strokeOpacity="0.7" />
            <polygon points="185,60 182,52 192,56" fill="#22c55e" fillOpacity="0.7" />
            <text x="198" y="52" fill="#22c55e" fontSize="8" fontFamily="monospace" opacity="0.8">PITCH↑</text>

            {/* Labels */}
            <text x="90" y="160" textAnchor="middle" fill="#a78bfa" fontSize="8" fontFamily="monospace" opacity="0.7">STABILIZER</text>
            <line x1="90" y1="135" x2="90" y2="155" stroke="#a78bfa" strokeWidth="0.5" strokeOpacity="0.4" />
            <text x="90" y="114" textAnchor="middle" fill="white" fontSize="7" fontFamily="monospace" opacity="0.45">ELEVATOR</text>

            {/* Span dimension */}
            <line x1="55" y1="175" x2="285" y2="175" stroke="white" strokeWidth="0.5" strokeOpacity="0.2" />
            <text x="170" y="188" textAnchor="middle" fill="white" fontSize="7" fontFamily="monospace" opacity="0.3">SPAN (b_H)</text>
          </svg>
        </motion.div>

        {/* Vertical Stabilizer — side view */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
          className="bg-[var(--color-edu-surface)] border border-white/5 rounded-2xl p-5 relative overflow-hidden">
          <div className="absolute inset-0 edu-grid-bg opacity-20 pointer-events-none" />
          <div className="text-[10px] font-mono tracking-widest text-[var(--color-edu-text-muted)] uppercase mb-3">Vertical Stabilizer · Side View</div>
          <svg viewBox="0 0 340 200" className="w-full h-auto">
            <defs>
              <linearGradient id="vFinGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#22c55e" stopOpacity="0.6" />
                <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.3" />
              </linearGradient>
            </defs>
            {/* Fuselage side */}
            <rect x="80" y="135" width="180" height="30" rx="8" fill="white" fillOpacity="0.03" stroke="white" strokeWidth="1" strokeOpacity="0.12" />

            {/* Vertical fin */}
            <path d="M200,135 L200,40 L160,40 L130,135 Z" fill="#22c55e" fillOpacity="0.06" stroke="url(#vFinGrad)" strokeWidth="1.5" />
            {/* Rudder (trailing edge, ~35% of chord) */}
            <path d="M200,135 L200,40 L185,45 L185,130 Z" fill="#22c55e" fillOpacity="0.22" stroke="#22c55e" strokeWidth="1.5" strokeOpacity="0.8" />

            {/* Yaw arrows */}
            <path d="M240,80 C255,70 260,80 250,90" fill="none" stroke="#f59e0b" strokeWidth="1.5" strokeOpacity="0.8" />
            <polygon points="250,90 248,82 258,84" fill="#f59e0b" fillOpacity="0.8" />
            <text x="262" y="78" fill="#f59e0b" fontSize="8" fontFamily="monospace" opacity="0.8">YAW</text>

            {/* Labels */}
            <line x1="118" y1="88" x2="80" y2="88" stroke="#22c55e" strokeWidth="0.5" strokeOpacity="0.4" />
            <text x="75" y="91" textAnchor="end" fill="#22c55e" fontSize="8" fontFamily="monospace" opacity="0.7">FIN</text>
            <line x1="190" y1="75" x2="230" y2="75" stroke="white" strokeWidth="0.5" strokeOpacity="0.3" />
            <text x="232" y="78" fill="white" fontSize="7" fontFamily="monospace" opacity="0.45">RUDDER</text>

            {/* Height dimension */}
            <line x1="60" y1="40" x2="60" y2="135" stroke="white" strokeWidth="0.5" strokeOpacity="0.2" />
            <text x="30" y="92" textAnchor="middle" fill="white" fontSize="7" fontFamily="monospace" opacity="0.3" transform="rotate(-90,30,92)">HEIGHT (h_V)</text>
          </svg>
        </motion.div>
      </div>

      {/* Content Sections */}
      <div className="space-y-5">
        {SECTIONS.map((section, i) => (
          <motion.div key={section.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 + i * 0.08 }} className="theory-section" style={{ '--section-accent': section.color }}>
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

      {/* Knowledge Check */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.55 }}
        className="mt-10 bg-[var(--color-edu-surface)] border border-white/5 rounded-2xl p-6 space-y-6">
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
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.65 }}
        className="mt-8 flex items-center justify-between pb-8">
        <Link to="/explore/wings" className="text-sm font-semibold text-[var(--color-edu-text-muted)] hover:text-white transition-colors">← Wings</Link>
        <div className="flex items-center gap-3">
          <Link to="/lab/tail" className="flex items-center gap-2 px-4 py-2 rounded-lg text-[12px] font-bold tracking-wider border border-[#22c55e]/30 text-[#22c55e] bg-[#22c55e]/8 hover:bg-[#22c55e]/15 transition-all">
            🧪 Tail Lab
          </Link>
          <Link to="/explore/airfoil" className="cta-primary !py-2.5 !px-5 !text-[13px] !rounded-lg">
            Next: Airfoil <ArrowRight size={16} />
          </Link>
        </div>
      </motion.div>
    </div>
  );
};

export default TailSection;
