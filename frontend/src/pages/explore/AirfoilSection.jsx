import React, { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Wind, ChevronRight, ArrowRight, FlaskConical, Ruler, RotateCcw, TrendingUp, AlertTriangle } from 'lucide-react';

// Simple NACA 4-digit generator for the interactive preview
const computePreviewNACA = (m, p, t, N = 40) => {
  const upper = [], lower = [];
  for (let i = 0; i <= N; i++) {
    const x = (1 - Math.cos(Math.PI * i / N)) / 2;
    const xn = Math.max(0, x);
    const yt = 5 * t * (0.2969 * Math.sqrt(xn + 1e-9) - 0.126 * xn - 0.3516 * xn ** 2 + 0.2843 * xn ** 3 - 0.1015 * xn ** 4);
    let yc = 0, dyc = 0;
    if (m > 0 && p > 0) {
      if (xn < p) {
        yc = (m / p ** 2) * (2 * p * xn - xn ** 2);
        dyc = (2 * m / p ** 2) * (p - xn);
      } else {
        yc = (m / (1 - p) ** 2) * (1 - 2 * p + 2 * p * xn - xn ** 2);
        dyc = (2 * m / (1 - p) ** 2) * (p - xn);
      }
    }
    const theta = Math.atan(dyc);
    upper.push([xn, yc + yt * Math.cos(theta)]);
    lower.push([xn, yc - yt * Math.cos(theta)]);
  }
  return { upper, lower };
};

const SECTIONS = [
  {
    id: 'what',
    title: 'What is an Airfoil?',
    beginner: 'An airfoil is the cross-sectional shape of a wing — if you sliced through a wing from front to back, the shape you\'d see is the airfoil. It\'s specifically designed to create lift when air flows over it. The front (rounded) is the leading edge, and the back (pointed) is the trailing edge. The chord is the straight line connecting them.',
    advanced: 'An airfoil is a 2D cross-section that generates aerodynamic force from a fluid flow. The geometry is fully defined by the camber line (mean line between upper and lower surfaces) and the thickness distribution. The NACA 4-digit series encodes: 1st digit = max camber (% chord), 2nd digit = max camber position (tenths of chord), 3rd–4th digits = max thickness (% chord). Example: NACA 4412 → 4% camber at 40% chord, 12% thick.',
    icon: <Wind size={20} />,
    color: '#f59e0b',
  },
  {
    id: 'lift',
    title: 'How Lift Works',
    beginner: 'When air hits the airfoil, it splits — some goes over the top, some under the bottom. The curved top surface forces air to travel faster, creating lower pressure above the wing. Higher pressure below pushes the wing up. This pressure difference IS lift. It\'s not magic — it\'s physics!',
    advanced: 'Lift arises from the circulation (Γ) around the airfoil, established by the Kutta condition at the trailing edge. By Kutta-Joukowski: L\' = ρ∞·V∞·Γ. In the thin airfoil approximation, C_L = 2π(α - α₀), where α₀ = 0 for symmetric airfoils and negative for cambered ones. Real viscous effects (boundary layer, Reynolds number dependence) modify this ideal slope from ~6.28/rad to ~5.7–6.0/rad.',
    icon: <TrendingUp size={20} />,
    color: '#22c55e',
  },
  {
    id: 'aoa',
    title: 'Angle of Attack (AoA)',
    beginner: 'The angle of attack is how much the wing is tilted relative to the incoming air. Tilt it up more → more lift (up to a point). Think of sticking your hand out a car window — tilt it up, and the wind pushes your hand up. That\'s angle of attack in action!',
    advanced: 'The geometric angle of attack (α) is measured between the chord line and the freestream velocity vector. Effective AoA accounts for induced angle from finite span (α_eff = α - α_i, where α_i = C_L/πeAR). In the linear regime, C_L increases at ~0.11/degree. Beyond αcrit (typically 14°–18°), flow separation causes stall — a sudden loss of lift and spike in drag.',
    icon: <RotateCcw size={20} />,
    color: '#38bdf8',
  },
  {
    id: 'stall',
    title: 'Stall — The Danger Zone',
    beginner: 'If you tilt the wing too much (too high angle of attack), the smooth airflow over the top breaks apart and becomes turbulent — the wing "stalls." Lift drops dramatically and drag shoots up. This is dangerous during flight and is why pilots are trained to recognize and recover from stalls. The angle where this happens is called the critical angle of attack.',
    advanced: 'Stall occurs when the adverse pressure gradient on the upper surface causes boundary layer separation. The type depends on airfoil geometry: thin airfoils exhibit leading-edge (abrupt) stall from laminar separation bubble burst; thick airfoils show trailing-edge (gradual) stall as the separation point moves forward. C_Lmax typically occurs at α ≈ 14°–18°. Post-stall, C_L drops 20–40% while C_D can increase 5–10×. Stall speed: V_s = √(2W/ρSC_Lmax).',
    icon: <AlertTriangle size={20} />,
    color: '#fb7185',
  },
];

const QUIZ_BEGINNER = [
  { question: 'What does the "44" in NACA 4412 represent?', options: [{ text: '44% maximum thickness', correct: false }, { text: '4% max camber at 40% of chord from leading edge', correct: true }, { text: 'The wing span is 44 feet', correct: false }, { text: 'The 44th airfoil design tested', correct: false }], explanation: 'NACA 4-digit: 1st digit = max camber %, 2nd digit = camber position (tenths of chord), last two = max thickness %. So 4412 = 4% camber at 40% chord, 12% thick.' },
  { question: 'What happens to airflow at the critical angle of attack?', options: [{ text: 'The aircraft climbs more steeply', correct: false }, { text: 'Lift keeps increasing past this angle', correct: false }, { text: 'Boundary layer separates and lift drops — stall occurs', correct: true }, { text: 'Drag disappears, allowing higher speed', correct: false }], explanation: 'Beyond the critical AoA, the adverse pressure gradient causes boundary layer separation from the upper surface. Lift drops sharply and drag spikes — this is stall.' },
  { question: 'Why does a cambered airfoil generate more lift than a symmetric one at the same AoA?', options: [{ text: 'It is heavier, so gravity helps', correct: false }, { text: 'The curved camber line creates additional circulation even at zero AoA', correct: true }, { text: 'It has a larger trailing edge area', correct: false }, { text: 'Camber reduces skin friction drag', correct: false }], explanation: 'A cambered airfoil has a non-zero zero-lift angle of attack (α₀ < 0). The camber line creates additional circulation, boosting C_L even at α = 0° — perfect for cruising efficiently.' },
];

const QUIZ_ADVANCED = [
  { question: 'In thin airfoil theory, what is the lift curve slope (dC_L/dα)?', options: [{ text: '2π per radian (~0.11/degree)', correct: true }, { text: '1.0 per degree', correct: false }, { text: 'π per radian', correct: false }, { text: 'It depends entirely on thickness', correct: false }], explanation: 'Thin airfoil theory gives dC_L/dα = 2π/rad ≈ 0.1097/degree. Real airfoils achieve ~5.7–6.0/rad due to viscous effects. Finite span further reduces the slope by the factor (πeAR / (πeAR + 2π)).' },
  { question: 'The Kutta-Joukowski theorem states L\' = ρ·V·Γ. What is Γ?', options: [{ text: 'The angle of attack in radians', correct: false }, { text: 'The circulation — line integral of velocity around the airfoil', correct: true }, { text: 'The coefficient of viscosity', correct: false }, { text: 'The pressure coefficient at the leading edge', correct: false }], explanation: 'Γ = ∮ V·dl is the circulation, a line integral of velocity around a closed contour enclosing the airfoil. The Kutta condition determines Γ such that the trailing edge is a stagnation line.' },
  { question: 'Which stall type occurs on a thick airfoil (t/c > 15%)?', options: [{ text: 'Leading-edge (abrupt) stall from laminar bubble burst', correct: false }, { text: 'Trailing-edge (gradual) stall as separation progresses forward', correct: true }, { text: 'Shock-induced separation at transonic speeds', correct: false }, { text: 'Tip stall due to span-wise flow', correct: false }], explanation: 'Thick airfoils stall from the trailing edge: the separation point moves progressively forward with increasing AoA, giving a gradual lift peak and gentler post-stall behavior. Thin airfoils have abrupt leading-edge stall.' },
];

const AirfoilSection = () => {
  const [isAdvanced, setIsAdvanced] = useState(false);
  const [quizAnswers, setQuizAnswers] = useState({});
  const [aoa, setAoa] = useState(4);
  const [camber, setCamber] = useState(4);
  const [thickness, setThickness] = useState(12);
  const navigate = useNavigate();

  const activeQuiz = isAdvanced ? QUIZ_ADVANCED : QUIZ_BEGINNER;
  const handleAnswer = (qIdx, aIdx) => setQuizAnswers(prev => ({ ...prev, [qIdx]: aIdx }));
  const handleModeSwitch = (adv) => { setIsAdvanced(adv); setQuizAnswers({}); };

  const m = camber / 100;
  const p = 0.4; // fixed camber position for simplicity
  const t = thickness / 100;
  const airfoilShape = useMemo(() => computePreviewNACA(m, p, t), [m, p, t]);

  // Build SVG path — center at Y=160 directly (no regex hacks)
  const CY = 160;
  const toPath = (pts) => pts.map((pt, i) => `${i === 0 ? 'M' : 'L'}${150 + pt[0] * 300},${CY - pt[1] * 300}`).join(' ');
  const upperPath = toPath(airfoilShape.upper);
  const lowerPath = toPath([...airfoilShape.lower].reverse());
  const fullPath = upperPath + ' ' + lowerPath + ' Z';

  return (
    <div className="min-h-full px-6 lg:px-10 py-8 max-w-4xl mx-auto">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <div className="flex items-center gap-2 text-[11px] font-mono tracking-widest text-[var(--color-edu-sky)] uppercase mb-3">
          <Link to="/explore" className="hover:underline">Explorer</Link>
          <ChevronRight size={10} />
          <Link to="/explore/wings" className="hover:underline">Wings</Link>
          <ChevronRight size={10} />
          <span>Airfoil</span>
        </div>
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-3xl lg:text-4xl font-bold text-white mb-2 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#f59e0b]/15 border border-[#f59e0b]/30 flex items-center justify-center text-[#f59e0b]">
                <Wind size={20} />
              </div>
              Airfoil Theory
            </h1>
            <p className="text-[var(--color-edu-text-muted)]">The shape that makes flight possible</p>
          </div>
          <div className="complexity-toggle">
            <button className={`complexity-toggle-btn ${!isAdvanced ? 'active' : ''}`} onClick={() => handleModeSwitch(false)}>Beginner</button>
            <button className={`complexity-toggle-btn ${isAdvanced ? 'active' : ''}`} onClick={() => handleModeSwitch(true)}>Advanced</button>
          </div>
        </div>
      </motion.div>

      {/* Interactive Airfoil Preview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mb-8 bg-[var(--color-edu-surface)] border border-white/5 rounded-2xl p-6 overflow-hidden relative"
      >
        <div className="absolute inset-0 edu-grid-bg opacity-30 pointer-events-none" />
        <div className="text-[10px] font-mono tracking-widest text-[var(--color-edu-text-muted)] uppercase mb-4">
          Interactive Airfoil · Adjust parameters below
        </div>
        
        <svg viewBox="0 0 600 280" className="w-full max-w-lg mx-auto h-auto relative z-5">
          <defs>
            <filter id="airfoilGlow">
              <feGaussianBlur stdDeviation="3" result="blur"/>
              <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
            </filter>
          </defs>

          {/* Freestream arrows (left side) */}
          {[60, 100, 140, 180, 220].map((y) => (
            <g key={y} opacity={0.2}>
              <line x1="15" y1={y} x2="75" y2={y} stroke="#38bdf8" strokeWidth="1" />
              <polygon points={`75,${y-3} 82,${y} 75,${y+3}`} fill="#38bdf8" />
            </g>
          ))}
          <text x="12" y="250" fill="var(--color-edu-text-muted)" fontSize="8" fontFamily="monospace" opacity="0.4">V∞ →</text>

          {/* Chord reference line (horizontal) */}
          <line x1="120" y1={CY} x2="480" y2={CY} stroke="white" strokeWidth="0.4" strokeDasharray="5 5" strokeOpacity="0.15" />

          {/* Airfoil group — rotated by AoA */}
          <g transform={`rotate(${-aoa}, 300, ${CY})`}>

            {/* Pressure distribution — Cp varies along chord (peak near LE) */}
            <g opacity={0.35}>
              {airfoilShape.upper.filter((_, i) => i % 3 === 0 && i > 0).map((pt, i, arr) => {
                const x = 150 + pt[0] * 300;
                const y = CY - pt[1] * 300;
                const chordFrac = pt[0];
                const cpMag = Math.max(0, (aoa + camber * 2) * 1.8 * (1 - chordFrac) * Math.sqrt(1 - chordFrac + 0.01));
                return <line key={`u${i}`} x1={x} y1={y} x2={x} y2={y - cpMag} stroke="#fb7185" strokeWidth="1" />;
              })}
              {airfoilShape.lower.filter((_, i) => i % 3 === 0 && i > 0).map((pt, i) => {
                const x = 150 + pt[0] * 300;
                const y = CY - pt[1] * 300;
                const chordFrac = pt[0];
                const cpMag = Math.max(0, (5 - aoa * 0.3) * (1 - chordFrac * 0.7));
                return <line key={`l${i}`} x1={x} y1={y} x2={x} y2={y + cpMag} stroke="#38bdf8" strokeWidth="1" />;
              })}
            </g>

            {/* Airfoil body — uses the correctly built fullPath */}
            <path
              d={fullPath}
              fill="var(--color-edu-navy-light)" fillOpacity="0.85"
              stroke="#f59e0b" strokeWidth="2" filter="url(#airfoilGlow)"
            />

            {/* Chord line inside airfoil */}
            <line x1="150" y1={CY} x2="450" y2={CY} stroke="white" strokeWidth="0.5" strokeOpacity="0.2" />

            {/* Leading / Trailing edge dots */}
            <circle cx="150" cy={CY} r="3" fill="#f59e0b" fillOpacity="0.7" />
            <circle cx="450" cy={CY} r="2" fill="#f59e0b" fillOpacity="0.4" />

            {/* Labels */}
            <text x="140" y={CY - 12} textAnchor="end" fill="#f59e0b" fontSize="8" fontFamily="monospace" opacity="0.6">LE</text>
            <text x="460" y={CY - 8} fill="#f59e0b" fontSize="8" fontFamily="monospace" opacity="0.6">TE</text>
          </g>

          {/* AoA arc indicator */}
          <g transform={`translate(480, ${CY})`}>
            {aoa !== 0 && <path d={`M 30,0 A 30 30 0 0 ${aoa >= 0 ? 0 : 1} ${30 * Math.cos(-aoa * Math.PI / 180)} ${30 * Math.sin(-aoa * Math.PI / 180)}`}
              fill="none" stroke="#38bdf8" strokeWidth="1.5" strokeOpacity="0.6" />}
            <text x="40" y="5" fill="#38bdf8" fontSize="11" fontWeight="bold" fontFamily="monospace">α = {aoa}°</text>
          </g>

          {/* Cp legend */}
          <g transform="translate(20, 20)" opacity="0.5">
            <line x1="0" y1="0" x2="0" y2="-12" stroke="#fb7185" strokeWidth="2" />
            <text x="6" y="-3" fill="#fb7185" fontSize="7" fontFamily="monospace">−Cp (suction)</text>
            <line x1="0" y1="15" x2="0" y2="27" stroke="#38bdf8" strokeWidth="2" />
            <text x="6" y="24" fill="#38bdf8" fontSize="7" fontFamily="monospace">+Cp (pressure)</text>
          </g>

          {/* Stall warning */}
          {aoa > 14 && (
            <g transform="translate(300, 22)">
              <rect x="-90" y="-14" width="180" height="28" rx="6" fill="#fb7185" fillOpacity="0.08" stroke="#fb7185" strokeWidth="1" strokeOpacity="0.4" />
              <text textAnchor="middle" y="4" fill="#fb7185" fontSize="10" fontWeight="bold" fontFamily="monospace" className="animate-pulse">
                ⚠ FLOW SEPARATION — STALL
              </text>
            </g>
          )}
        </svg>

        {/* Parameter Sliders */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6 relative z-5">
          <div>
            <label className="flex items-center justify-between text-[11px] font-mono tracking-wider text-[var(--color-edu-text-muted)] mb-2">
              <span>Angle of Attack</span>
              <span className="text-[var(--color-edu-sky)] font-bold">{aoa}°</span>
            </label>
            <input type="range" min="-10" max="20" step="1" value={aoa} onChange={(e) => setAoa(Number(e.target.value))} className="w-full" />
          </div>
          <div>
            <label className="flex items-center justify-between text-[11px] font-mono tracking-wider text-[var(--color-edu-text-muted)] mb-2">
              <span>Camber</span>
              <span className="text-[#f59e0b] font-bold">{camber}%</span>
            </label>
            <input type="range" min="0" max="9" step="1" value={camber} onChange={(e) => setCamber(Number(e.target.value))} className="w-full" />
          </div>
          <div>
            <label className="flex items-center justify-between text-[11px] font-mono tracking-wider text-[var(--color-edu-text-muted)] mb-2">
              <span>Thickness</span>
              <span className="text-[#a78bfa] font-bold">{thickness}%</span>
            </label>
            <input type="range" min="6" max="24" step="1" value={thickness} onChange={(e) => setThickness(Number(e.target.value))} className="w-full" />
          </div>
        </div>

        <div className="mt-3 text-center text-[10px] font-mono text-[var(--color-edu-text-muted)]/50">
          NACA {camber}{Math.round(p * 10)}{String(thickness).padStart(2, '0')} · Adjust sliders to see the shape change
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

      {/* Knowledge Check — 6 questions (3 per mode) */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
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

      {/* Bridge to Lab CTA */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}
        className="mt-10 bg-gradient-to-br from-[var(--color-edu-sky)]/8 to-[var(--color-accent-purple)]/8 border border-[var(--color-edu-sky)]/15 rounded-2xl p-8 text-center">
        <div className="w-14 h-14 rounded-2xl bg-[var(--color-edu-sky)]/15 border border-[var(--color-edu-sky)]/25 flex items-center justify-center mx-auto mb-4 text-[var(--color-edu-sky)]">
          <FlaskConical size={24} />
        </div>
        <h3 className="text-xl font-bold text-white mb-2">Ready to Test It Yourself?</h3>
        <p className="text-sm text-[var(--color-edu-text-muted)] max-w-md mx-auto mb-6">
          You've learned the theory — now open the Wind Tunnel Lab and run real ML simulations.
          Change the angle of attack, visualize airflow, and see exactly when stall occurs.
        </p>
        <button onClick={() => navigate('/lab/airfoil')} className="cta-primary">
          <FlaskConical size={18} /> Open Wind Tunnel Lab <ArrowRight size={18} />
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

export default AirfoilSection;
