import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useAppContext } from '../context/AppContext';
import ShapeCard from '../components/ShapeCard';
import ControlSlider from '../components/ControlSlider';
import SimulationView from '../components/SimulationView';
import DataChart from '../components/DataChart';
import PolarChart from '../components/PolarChart';
import AeroFactsPanel from '../components/AeroFactsPanel';
import { Box, Circle, Upload, Mountain, Globe, Wind, Layers, Settings, X } from 'lucide-react';
import Export3DModal from '../components/Export3DModal';
import PdfReportTemplate from '../components/PdfReportTemplate';
import { motion } from 'framer-motion';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

// ─── Generic NACA 4-digit coordinate generator ───────────────────────────────
const computeNACA = (m, p, t, N = 60) => {
  const upper = [], lower = [];
  for (let i = 0; i <= N; i++) {
    const x = (1 - Math.cos(Math.PI * i / N)) / 2;
    const xn = Math.max(0, x);
    const yt = 5 * t * (0.2969 * Math.sqrt(xn + 1e-9) - 0.126 * xn - 0.3516 * xn ** 2 + 0.2843 * xn ** 3 - 0.1015 * xn ** 4);
    let yc, dyc;
    if (m === 0 || p === 0) {
      yc = 0; dyc = 0; // symmetric airfoil
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
const NACA0012_POINTS = computeNACA(0, 0, 0.12);

// ─── Environment presets ──────────────────────────────────────────────────────
const ENV_PRESETS = {
  standard: { label:'Standard Air', sublabel:'Sea Level', icon:<Globe size={13}/>, density:1.225, windSpeed:50,  particleCount:1000, color:'#00f0ff' },
  highAlt:  { label:'High Altitude', sublabel:'~10 km', icon:<Mountain size={13}/>, density:0.414, windSpeed:80, particleCount:500,  color:'#a78bfa' },
};

// ─── Shapes library ───────────────────────────────────────────────────────────
const SHAPES = [
  { id:'naca4412', name:'NACA 4412', type:'Airfoil · Cambered',   icon:<Wind size={18}/>,   airfoilData: NACA4412_POINTS },
  { id:'naca0012', name:'NACA 0012', type:'Airfoil · Symmetric',  icon:<Layers size={18}/>, airfoilData: NACA0012_POINTS },
];

// ─── Aerodynamic coefficient model ────────────────────────────────────────────
// Per-airfoil parameters from published wind-tunnel data:
//   NACA 4412: α₀ = -4°, Cl_max ≈ 1.5 at α_stall ≈ 14°, Cd_min ≈ 0.006
//   NACA 0012: α₀ =  0°, Cl_max ≈ 1.6 at α_stall ≈ 16°, Cd_min ≈ 0.006  (symmetric)
const AIRFOIL_PARAMS = {
  naca4412: { alpha0: -4, clAlpha: 0.11, stallPos: 14, stallNeg: -12, clMax: 1.5, cdMin: 0.006, k: 0.004 },
  naca0012: { alpha0:  0, clAlpha: 0.11, stallPos: 16, stallNeg: -16, clMax: 1.6, cdMin: 0.006, k: 0.004 },
  imported: { alpha0:  0, clAlpha: 0.11, stallPos: 15, stallNeg: -15, clMax: 1.5, cdMin: 0.008, k: 0.005 },
};

const calculateAerodynamics = (shapeId, isAirfoil, alpha) => {
  alpha = parseFloat(alpha) || 0;

  if (isAirfoil || shapeId === 'naca4412' || shapeId === 'naca0012') {
    const params = AIRFOIL_PARAMS[shapeId] || AIRFOIL_PARAMS.imported;
    const { alpha0, clAlpha, stallPos, stallNeg, clMax, cdMin, k } = params;

    // ── Linear (attached-flow) region ──
    let cl = clAlpha * (alpha - alpha0);
    // Induced-drag parabola: Cd = Cd_min + k·(Cl)²  (drag polar)
    let cd = cdMin + k * cl * cl;

    // ── Positive stall ──
    if (alpha > stallPos) {
      const excess = alpha - stallPos;
      // Cl drops sharply past stall (Abrupt stall model)
      const clAtStall = clAlpha * (stallPos - alpha0);
      cl = Math.max(0.1, clAtStall - excess * 0.22); // Increased from 0.08 for "The Cut"
      // Cd rises sharply (separated flow)
      cd = cdMin + k * clAtStall * clAtStall + 0.025 * Math.pow(excess, 1.6);
    }
    // ── Negative stall ──
    else if (alpha < stallNeg) {
      const excess = Math.abs(alpha - stallNeg);
      const clAtStall = clAlpha * (stallNeg - alpha0);
      cl = Math.min(-0.1, clAtStall + excess * 0.22); // Increased from 0.08
      cd = cdMin + k * clAtStall * clAtStall + 0.025 * Math.pow(excess, 1.6);
    }

    // High-precision clamping for symmetric airfoils
    if (alpha0 === 0 && Math.abs(alpha) < 0.01) {
      cl = 0;
    }

    // Deep stall / very high AoA → flat-plate drag dominates
    if (Math.abs(alpha) > 35) {
      cd = Math.max(cd, 1.25 * Math.pow(Math.sin((alpha * Math.PI) / 180), 2));
    }

    return { cl: Number(cl.toFixed(4)), cd: Number(cd.toFixed(4)) };
  }

  return { cl: 0, cd: 0 };
};

/** Per-NACA params for empirical autotune (when NeuralFoil is off). */
const nacaParamsFromDigits = (m, p, t) => ({
  alpha0: m < 1e-8 ? 0 : -2.5 - m * 55 * Math.max(0.15, p),
  clAlpha: 0.1 + m * 0.95 + Math.max(0, 0.14 - t) * 0.35,
  stallPos: 14 + m * 18 - Math.abs(t - 0.12) * 38 + Math.abs(p - 0.4) * 4,
  stallNeg: -13 - m * 8,
  clMax: 1.4 + m * 0.45,
  cdMin: 0.0055 + t * 0.028,
  k: 0.004 + m * 0.0015,
});

const calculateAerodynamicsWithParams = (params, alpha) => {
  const { alpha0, clAlpha, stallPos, stallNeg, cdMin, k } = params;
  let cl = clAlpha * (alpha - alpha0);
  let cd = cdMin + k * cl * cl;
  if (alpha > stallPos) {
    const excess = alpha - stallPos;
    const clAtStall = clAlpha * (stallPos - alpha0);
    cl = clAtStall - excess * 0.22;
    cd = cdMin + k * clAtStall * clAtStall + 0.025 * Math.pow(excess, 1.6);
  } else if (alpha < stallNeg) {
    const excess = Math.abs(alpha - stallNeg);
    const clAtStall = clAlpha * (stallNeg - alpha0);
    cl = clAtStall + excess * 0.22;
    cd = cdMin + k * clAtStall * clAtStall + 0.025 * Math.pow(excess, 1.6);
  }
  
  if (alpha0 === 0 && Math.abs(alpha) < 0.01) cl = 0;
  
  if (Math.abs(alpha) > 35) {
    cd = Math.max(cd, 1.25 * Math.pow(Math.sin((alpha * Math.PI) / 180), 2));
  }
  return { cl: Number(cl.toFixed(4)), cd: Number(cd.toFixed(4)) };
};

/** Coarse NACA 4-digit grid (~147) — balances coverage vs UI responsiveness. */
function* iterateNACA4DigitCandidates(mode = 'light') {
  const isDeep = mode === 'heavy';
  const tList = isDeep ? [8, 10, 12, 14, 16, 18, 20] : [10, 12, 15];
  for (const td of tList) {
    const t = td / 100;
    yield { m: 0, p: isDeep ? 0.4 : 4, t, label: `NACA 00${String(td).padStart(2, '0')}` };
  }
  const mDigits = isDeep ? [1, 3, 5, 7, 9] : [2, 4, 6];
  const pDigits = isDeep ? [2, 4, 6, 8] : [3, 4, 5];
  for (const md of mDigits) {
    for (const pd of pDigits) {
      for (const td of tList) {
        yield {
          m: md / 100,
          p: pd / 10,
          t: td / 100,
          label: `NACA ${md}${pd}${String(td).padStart(2, '0')}`,
        };
      }
    }
  }
}

const buildAlphaList = (bounds) => {
  const out = [];
  for (let a = bounds.min; a <= bounds.max; a++) out.push(a);
  return out;
};

// ─── Parse .dat airfoil ───────────────────────────────────────────────────────
const parseAirfoilDat = (text) => {
  const points = [];
  for (const line of text.split('\n').map(l=>l.trim()).filter(Boolean)) {
    if (line.startsWith('#')||isNaN(parseFloat(line.split(/\s+/)[0]))) continue;
    const parts=line.split(/[\s,]+/);
    if (parts.length>=2) {
      const x=parseFloat(parts[0]), y=parseFloat(parts[1]);
      if (!isNaN(x)&&!isNaN(y)) points.push([x,y]);
    }
  }
  if (points.length<3) return null;
  const minX=Math.min(...points.map(p=>p[0])), maxX=Math.max(...points.map(p=>p[0]));
  const chord=(maxX-minX)||1;
  // Centered for UI Drawing (-0.5 to 0.5)
  return points.map(([x,y])=>[(x-minX)/chord - 0.5, y/chord]);
};

// ─── Preset Button ────────────────────────────────────────────────────────────
const PresetButton = ({ preset, active, onClick }) => (
  <button
    onClick={onClick}
    className={`${preset.shape} group transition-all duration-300 relative flex flex-col items-center justify-center p-3 w-full cursor-pointer overflow-hidden rounded-xl border`}
    style={{
      background: active ? `${preset.color}15` : 'rgba(255,255,255,0.03)',
      borderColor: active ? preset.color : 'rgba(255,255,255,0.1)',
      opacity: active ? 1 : 0.6,
      minHeight: '74px'
    }}
  >
    <div className="flex flex-col items-center gap-1 w-full">
      <span className="flex items-center justify-center gap-2 text-[11px] font-bold tracking-wide" style={{color: active ? preset.color : 'white'}}>
        {preset.icon} {preset.label}
      </span>
      <span className="text-[9px] opacity-60 font-mono text-center">{preset.sublabel}</span>
      <span className="text-[9px] font-mono opacity-80 mt-0.5" style={{color: preset.color}}>ρ = {preset.density} kg/m³</span>
    </div>
  </button>
);

// ─── Settings Modal ──────────────────────────────────────────────────────────
const SettingsModal = ({ show, onClose, manualDensity, setManualDensity, density, setDensity }) => {
  if (!show) return null;
  return (
    <div className="settings-overlay" onClick={onClose}>
      <div className="settings-modal" onClick={e => e.stopPropagation()}>
        <button className="settings-close-btn" onClick={onClose}>
          <X size={20} />
        </button>
        
        <h2 className="text-xl font-mono tracking-widest text-[var(--color-accent-blue)] uppercase mb-6 flex items-center gap-3">
          <Settings className="gear-rotate" /> Global Physics
        </h2>

        <div className="space-y-8">
          {/* Manual Density Overdrive */}
          <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
            <div className="flex items-center justify-between mb-4">
              <div className="flex flex-col">
                <span className="text-xs font-bold text-white tracking-wide uppercase">Manual Density Overdrive</span>
                <span className="text-[10px] text-brand-400 font-mono">Override atmospheric presets</span>
              </div>
              <button 
                onClick={() => setManualDensity(!manualDensity)}
                className={`w-12 h-6 rounded-full transition-all relative ${manualDensity ? 'bg-[var(--color-accent-blue)]' : 'bg-brand-600'}`}
              >
                <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${manualDensity ? 'left-7' : 'left-1'}`} />
              </button>
            </div>

            <div className={`transition-all duration-500 ${manualDensity ? 'opacity-100' : 'opacity-30 pointer-events-none'}`}>
              <ControlSlider 
                label="Air Density (ρ)" 
                value={density} 
                min={0.01} 
                max={3.0} 
                step={0.001}
                unit="kg/m³" 
                onChange={setDensity} 
                accent="blue"
              />
              <div className="flex justify-between mt-2 px-1">
                <span className="text-[9px] text-brand-500 font-mono">VACUUM (0.01)</span>
                <span className="text-[9px] text-brand-500 font-mono">DEEP SEA (3.0)</span>
              </div>
            </div>
          </div>

          <div className="text-[10px] text-brand-500 font-mono italic text-center px-4">
            "Density directly impacts Reynolds number and Dynamic Pressure. High density increases lift but drastically raises drag."
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── Home ─────────────────────────────────────────────────────────────────────
const Home = () => {
  const [isSimulating,  setIsSimulating]  = useState(false);
  const [chartData,     setChartData]     = useState([]);
  const [compareChartData, setCompareChartData] = useState([]);
  
  // Global Application State & Persistent View Models
  const {
    useNeuralFoil, setUseNeuralFoil,
    lowPowerMode, setLowPowerMode,
    subscriptionTier,
    importsCount,
    setImportsCount,
    units,
    audioVolume,
    soundPreset,
    graphBounds,
    customAirfoils,
    setCustomAirfoils,
    setLastSimulationData,
    setActiveShapeIdGlobal,
    goldenLiftActive,
    setGoldenLiftActive,
    
    activeShapeId,       setActiveShapeId,
    compareShapeId,      setCompareShapeId,
    isCompareMode,       setIsCompareMode,
    activePreset,        setActivePreset,
    density,             setDensity,
    windSpeed,           setWindSpeed,
    pitchAngle,          setPitchAngle,
    flowActive,          setFlowActive,
  } = useAppContext();

  const [showImportModal, setShowImportModal] = useState(false);
  const [showExport3D, setShowExport3D] = useState(false);
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const pdfReportRef = useRef(null);
  
  const [pendingAirfoil, setPendingAirfoil] = useState(null);
  const [pendingAirfoilName, setPendingAirfoilName] = useState('');

  const [importError,   setImportError]   = useState('');
  const [aeroFactsActive, setAeroFactsActive] = useState(false);
  const [showDensitySettings, setShowDensitySettings] = useState(false);
  const [densityError, setDensityError] = useState('');
  const [showSettings, setShowSettings] = useState(false);
  const [manualDensity, setManualDensity] = useState(false);
  const fileInputRef = useRef(null);
  const densitySettingsRef = useRef(null);
  
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (densitySettingsRef.current && !densitySettingsRef.current.contains(e.target)) {
        setShowDensitySettings(false);
      }
    };
    if (showDensitySettings) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showDensitySettings]);

  // Enforce tier restrictions
  useEffect(() => {
    if (subscriptionTier === 'free') {
      if (useNeuralFoil) setUseNeuralFoil(false);
      if (!lowPowerMode) setLowPowerMode(true);
    } else if (subscriptionTier === 'pro') {
      if (!lowPowerMode) setLowPowerMode(true);
    } else if (subscriptionTier === 'pro_max') {
      if (lowPowerMode) setLowPowerMode(false);
    }
  }, [subscriptionTier, useNeuralFoil, lowPowerMode, setUseNeuralFoil, setLowPowerMode]);

  const [autotunePhase, setAutotunePhase] = useState('idle');
  const [autotuneProgress, setAutotuneProgress] = useState(null);
  const [autotunePreview, setAutotunePreview] = useState(null);
  const [autotuneResult, setAutotuneResult] = useState(null);
  const autotuneAbortRef = useRef(false);
  const autotuneAbortControllerRef = useRef(null);
  const autotuneLockRef = useRef(false);
  const suppressGoldenClear = useRef(false);

  const ALL_SHAPES = [...SHAPES, ...customAirfoils];
  const activeShape = ALL_SHAPES.find(s=>s.id===activeShapeId);
  const compareShape = ALL_SHAPES.find(s=>s.id===compareShapeId);
  const hasTarget = !!activeShape;

  // Compute both positive and negative stall angles from chart data
  const { positiveStallAngle, negativeStallAngle } = React.useMemo(() => {
    if (!chartData || chartData.length === 0) return { positiveStallAngle: null, negativeStallAngle: null };
    let maxCl = -Infinity, minCl = Infinity;
    let posAoA = null, negAoA = null;
    for (const d of chartData) {
      if (d.cl !== null && d.cl > maxCl) { maxCl = d.cl; posAoA = d.aoa; }
      if (d.cl !== null && d.cl < minCl) { minCl = d.cl; negAoA = d.aoa; }
    }
    // Only report a negative stall if the Cl actually goes negative (real negative stall)
    return {
      positiveStallAngle: posAoA,
      negativeStallAngle: minCl < -0.1 ? negAoA : null
    };
  }, [chartData]);

  // Derive legacy stallAngle for chart reference line (positive stall)
  const stallAngle = positiveStallAngle;

  // Stall state — fires only when STRICTLY past the stall boundary, not at it
  const isStalling = React.useMemo(() => {
    if (positiveStallAngle === null) return false;
    if (pitchAngle > positiveStallAngle) return true;
    if (negativeStallAngle !== null && pitchAngle < negativeStallAngle) return true;
    return false;
  }, [pitchAngle, positiveStallAngle, negativeStallAngle]);

  // Stall point coordinates on the polar (Cd, Cl at stall AoA)
  const stallPoint = React.useMemo(() => {
    if (positiveStallAngle === null || !chartData.length) return { cd: null, cl: null };
    const pt = chartData.find(d => d.aoa === positiveStallAngle);
    return pt ? { cd: pt.cd, cl: pt.cl } : { cd: null, cl: null };
  }, [positiveStallAngle, chartData]);

  // Live aerodynamic values from NeuralFoil Chart Data
  const currentAeroItem = React.useMemo(() => {
    if (!chartData || chartData.length === 0) return { cl: 0, cd: 0 };
    const closest = chartData.reduce((prev, curr) => 
      Math.abs(curr.aoa - pitchAngle) < Math.abs(prev.aoa - pitchAngle) ? curr : prev
    );
    
    // Safety clamp for Live Metrics (Symmetric detection)
    const isSymmetric = activeShape?.type.toLowerCase().includes('symmetric') || activeShape?.name.includes('00');
    if (isSymmetric && Math.abs(pitchAngle) < 0.01) {
      return { ...closest, cl: 0 };
    }
    
    return closest;
  }, [activeShape, chartData, pitchAngle]);

  // Compare shape calculations
  const { comparePositiveStallAngle, compareNegativeStallAngle } = React.useMemo(() => {
    if (!compareChartData || compareChartData.length === 0) return { comparePositiveStallAngle: null, compareNegativeStallAngle: null };
    let maxCl = -Infinity, minCl = Infinity;
    let posAoA = null, negAoA = null;
    for (const d of compareChartData) {
      if (d.cl !== null && d.cl > maxCl) { maxCl = d.cl; posAoA = d.aoa; }
      if (d.cl !== null && d.cl < minCl) { minCl = d.cl; negAoA = d.aoa; }
    }
    return {
      comparePositiveStallAngle: posAoA,
      compareNegativeStallAngle: minCl < -0.1 ? negAoA : null
    };
  }, [compareChartData]);

  const compareStallPoint = React.useMemo(() => {
    if (comparePositiveStallAngle === null || !compareChartData.length) return { cd: null, cl: null };
    const pt = compareChartData.find(d => d.aoa === comparePositiveStallAngle);
    return pt ? { cd: pt.cd, cl: pt.cl } : { cd: null, cl: null };
  }, [comparePositiveStallAngle, compareChartData]);

  const compareCurrentAeroItem = React.useMemo(() => {
    if (!compareChartData || compareChartData.length === 0) return { cl: 0, cd: 0 };
    const closest = compareChartData.reduce((prev, curr) => 
      Math.abs(curr.aoa - pitchAngle) < Math.abs(prev.aoa - pitchAngle) ? curr : prev
    );
    
    const isSymmetric = compareShape?.type.toLowerCase().includes('symmetric') || compareShape?.name.includes('00');
    if (isSymmetric && Math.abs(pitchAngle) < 0.01) {
      return { ...closest, cl: 0 };
    }
    
    return closest;
  }, [compareShape, compareChartData, pitchAngle]);

  // Audio Alarm Effect on stall threshold crossover
  useEffect(() => {
    let timeoutId;
    let isActive = true;
    let step = 0;
    
    const rhythm = [[200, 100], [200, 100], [500, 200]];

    const playAlarm = () => {
       if (!isActive || !isStalling) return;
       const [onTime, offTime] = rhythm[step % rhythm.length];
       try {
          const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
          const masterGain = audioCtx.createGain();
          masterGain.gain.setValueAtTime(0, audioCtx.currentTime);
          masterGain.gain.linearRampToValueAtTime((audioVolume / 100) * 0.25, audioCtx.currentTime + 0.05);
          masterGain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + (onTime / 1000));
          masterGain.connect(audioCtx.destination);

          const osc1 = audioCtx.createOscillator();
          osc1.type = soundPreset === 'siren' ? 'sawtooth' : 'triangle';
          osc1.frequency.setValueAtTime(soundPreset === 'siren' ? 880 : 400, audioCtx.currentTime);
          osc1.connect(masterGain);
          osc1.start();
          osc1.stop(audioCtx.currentTime + (onTime / 1000));
       } catch(e) { console.warn("Audio Context failed:", e); }
       step++;
       timeoutId = setTimeout(playAlarm, onTime + offTime);
    };

    if (isStalling) playAlarm();
    return () => { isActive = false; clearTimeout(timeoutId); };
  }, [pitchAngle, isStalling, audioVolume, soundPreset]);

  const currentForce = {
    lift: 0.5 * density * Math.pow(windSpeed, 2) * currentAeroItem.cl * 1,
    drag: 0.5 * density * Math.pow(windSpeed, 2) * currentAeroItem.cd * 1
  };

  const applyPreset = (key) => {
    if (manualDensity) setManualDensity(false);
    const p=ENV_PRESETS[key];
    setActivePreset(key); setDensity(p.density);
    setWindSpeed(p.windSpeed);
  };

  const handleFileUpload = (e) => {
    if (subscriptionTier === 'free' && importsCount >= 1) {
      alert('Free tier is limited to 1 import. Please upgrade to Pro.');
      return;
    }
    if (subscriptionTier === 'pro' && importsCount >= 10) {
      alert('Pro tier is limited to 10 imports. Please upgrade to Pro Max.');
      return;
    }

    const file=e.target.files[0]; if (!file) return;
    setImportError('');
    const reader=new FileReader();
    reader.onload=(ev)=>{
      const pts=parseAirfoilDat(ev.target.result);
      if (!pts) { setImportError('Could not parse. Ensure X Y coordinate pairs per line.'); return; }
      setPendingAirfoil(pts);
      setPendingAirfoilName(file.name.replace(/\.[^.]+$/,'').toUpperCase());
      setShowImportModal(true);
    };
    reader.readAsText(file);
    e.target.value='';
  };

  const addCustomAirfoil = () => {
    const newShape = {
      id: `custom-${Date.now()}`,
      name: pendingAirfoilName || 'CUSTOM AIRFOIL',
      type: 'Airfoil · Imported',
      icon: 'box',
      airfoilData: pendingAirfoil
    };
    setCustomAirfoils(prev => [...prev, newShape]);
    setImportsCount(prev => prev + 1); // Optimistic UI update
    
    // In a real app, you would sync this increment to the backend
    fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'}/api/increment-import`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${localStorage.getItem('sb-access-token')}` } // Approximate
    }).catch(console.error);

    setActiveShapeId(newShape.id);
    setShowImportModal(false);
    setPendingAirfoil(null);
    setPendingAirfoilName('');
  };

  const cancelImport = () => {
    setShowImportModal(false);
    setPendingAirfoil(null);
    setPendingAirfoilName('');
  };

  const handleShapeClick = (id) => {
    if (isCompareMode) {
      setCompareShapeId(id);
      setCompareShapeIdGlobal(id);
    } else {
      setActiveShapeId(id);
      setActiveShapeIdGlobal(id);
    }
    setFlowActive(false);
  };

  useEffect(() => {
    if (suppressGoldenClear.current) return;
    setGoldenLiftActive(false);
  }, [pitchAngle, activeShapeId, setGoldenLiftActive]);

  const fetchNeuralPolar = async (points, alphaList, re, signal, modelSize = 'large') => {
    const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/analyze`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ alpha: alphaList, Re: re, mach: 0, points, modelSize }),
      signal,
    });
    const data = await res.json();
    if (data.error) throw new Error(data.error);
    if (!Array.isArray(data)) throw new Error('Invalid polar');
    return data;
  };

  const runAutotune = useCallback(async (mode = 'light') => {
    if (subscriptionTier === 'free') {
      alert('Fast Tune is not available on the Free tier. Please upgrade to Pro.');
      return;
    }
    if (mode === 'heavy' && subscriptionTier !== 'pro_max') {
      alert('Deep Tune is only available on the Pro Max tier.');
      return;
    }

    if (autotuneLockRef.current || !hasTarget) return;
    autotuneLockRef.current = true;
    setFlowActive(false);
    setAutotunePhase('running');
    setAutotuneResult(null);
    setGoldenLiftActive(false);
    autotuneAbortRef.current = false;
    autotuneAbortControllerRef.current?.abort();
    const controller = new AbortController();
    autotuneAbortControllerRef.current = controller;

    const candidates = [...iterateNACA4DigitCandidates(mode)];
    const total = candidates.length;
    const alphaList = buildAlphaList(graphBounds);
    const reynolds = (windSpeed * density) / 1.5e-5;

    let bestCl = -Infinity;
    let bestAoa = graphBounds.min;
    let bestLabel = '';
    let bestPoints = null;

    try {
      for (let i = 0; i < candidates.length; i++) {
        if (autotuneAbortRef.current) break;
        const c = candidates[i];
        const points = computeNACA(c.m, c.p, c.t);
        setAutotunePreview({ airfoilData: points, name: c.label, pitchAngle: graphBounds.min });
        setAutotuneProgress({
          index: i + 1,
          total,
          message: `Testing ${c.label} at sweep ${graphBounds.min}°…${graphBounds.max}° (${i + 1} / ${total})`,
        });

        let polar;
        if (useNeuralFoil) {
          try {
            const nfModelSize = mode === 'heavy' ? 'xxxlarge' : 'large';
            polar = await fetchNeuralPolar(points, alphaList, reynolds, controller.signal, nfModelSize);
          } catch {
            const params = nacaParamsFromDigits(c.m, c.p, c.t);
            polar = alphaList.map((aoa) => ({
              aoa,
              ...calculateAerodynamicsWithParams(params, aoa),
            }));
          }
        } else {
          const params = nacaParamsFromDigits(c.m, c.p, c.t);
          polar = alphaList.map((aoa) => ({
            aoa,
            ...calculateAerodynamicsWithParams(params, aoa),
          }));
        }

        for (const row of polar) {
          const aoa = row.aoa;
          const cl = Number(row.cl);
          // Only consider positive angles of attack for best performance
          if (aoa >= 0 && aoa <= graphBounds.max && cl > bestCl) {
            bestCl = cl;
            bestAoa = aoa;
            bestLabel = c.label;
            bestPoints = points;
          }
        }

        // Also restrict preview to positive AoA
        const positivePolar = polar.filter(r => r.aoa >= 0);
        const rowBest = positivePolar.length > 0
          ? positivePolar.reduce((a, b) => (Number(b.cl) > Number(a.cl) ? b : a), positivePolar[0])
          : polar[0];
          
        setAutotunePreview({
          airfoilData: points,
          name: c.label,
          pitchAngle: rowBest.aoa,
        });

        await new Promise((r) => setTimeout(r, 0));
      }

      if (autotuneAbortRef.current) {
        setAutotunePhase('idle');
        setAutotunePreview(null);
        setAutotuneProgress(null);
        return;
      }

      if (!bestPoints || bestCl === -Infinity) {
        setAutotunePhase('idle');
        setAutotunePreview(null);
        setAutotuneProgress(null);
        return;
      }

      const id = `golden-autotune-${Date.now()}`;
      const roundedAoA = Math.round(bestAoa);
      const shape = {
        id,
        name: `★ GOLDEN · ${bestLabel}`,
        type: 'Airfoil · Autotune',
        icon: 'sparkles',
        airfoilData: bestPoints,
      };
      suppressGoldenClear.current = true;
      setCustomAirfoils((prev) => [...prev.filter((s) => !String(s.id).startsWith('golden-autotune-')), shape]);
      setActiveShapeId(id);
      setActiveShapeIdGlobal(id);
      setPitchAngle(roundedAoA);
      setAutotunePreview(null);
      setAutotuneProgress(null);
      setAutotuneResult({ label: bestLabel, cl: bestCl, aoa: roundedAoA });
      setAutotunePhase('success');
      setGoldenLiftActive(true);
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          suppressGoldenClear.current = false;
        });
      });
      window.setTimeout(() => {
        setAutotunePhase('idle');
        setAutotuneResult(null);
      }, 3200);
    } catch (e) {
      if (e.name !== 'AbortError') console.warn('Autotune:', e);
      setAutotunePhase('idle');
      setAutotunePreview(null);
      setAutotuneProgress(null);
    } finally {
      autotuneAbortControllerRef.current = null;
      autotuneLockRef.current = false;
    }
  }, [
    hasTarget,
    graphBounds,
    windSpeed,
    density,
    useNeuralFoil,
    setCustomAirfoils,
    setActiveShapeIdGlobal,
    setGoldenLiftActive,
  ]);

  const handleAutotuneCancel = useCallback(() => {
    autotuneAbortRef.current = true;
    autotuneAbortControllerRef.current?.abort();
    setAutotunePhase('idle');
    setAutotunePreview(null);
    setAutotuneProgress(null);
    autotuneLockRef.current = false;
  }, []);

  // Chart and Aerodynamic Calculations utilizing NeuralFoil backend API or Empirical Math
  useEffect(()=>{
    if (!hasTarget || !activeShape) return;
    let isMounted = true;
    setIsSimulating(true);

    const isCustomAirfoil = !['naca4412', 'naca0012'].includes(activeShapeId);
    const isSymmetric = activeShape.type.toLowerCase().includes('symmetric') || activeShape.name.includes('00');
    
    const compareActive = isCompareMode && compareShape;
    const isCompareCustom = compareActive ? !['naca4412', 'naca0012'].includes(compareShapeId) : false;
    const isCompareSymmetric = compareActive ? (compareShape.type.toLowerCase().includes('symmetric') || compareShape.name.includes('00')) : false;

    if (!useNeuralFoil) {
      setTimeout(() => {
        if (isMounted) {
          // 1. Calculate local stall peaks first
          let rawData = [];
          for (let a = graphBounds.min; a <= graphBounds.max; a++) {
            const { cl, cd } = calculateAerodynamics(activeShapeId, isCustomAirfoil, a);
            rawData.push({ aoa: a, cl, cd });
          }

          let maxCl = -Infinity;
          let minCl = Infinity;
          let localStallPos = null;
          let localStallNeg = null;
          
          for (const d of rawData) {
            if (d.cl !== null && d.cl > maxCl) { maxCl = d.cl; localStallPos = d.aoa; }
            if (d.cl !== null && d.cl < minCl) { minCl = d.cl; localStallNeg = d.aoa; }
          }

          const newData = rawData.map(d => {
            let clFinal = (isSymmetric && Math.abs(d.aoa) < 0.01) ? 0 : Number((d.cl || 0).toFixed(3));
            let cdFinal = Number((d.cd || 0).toFixed(3));

            const stallLimitPos = localStallPos !== null ? localStallPos + 5 : 999;
            const stallLimitNeg = localStallNeg !== null ? localStallNeg - 5 : -999;
            
            if (d.aoa > stallLimitPos || d.aoa < stallLimitNeg) {
              clFinal = null;
              cdFinal = null;
            }

            return {
              aoa: d.aoa,
              cl: clFinal,
              cd: cdFinal
            };
          });

          setChartData(newData);
          setLastSimulationData(newData);
          
          if (compareActive) {
            let compareRawData = [];
            for (let a = graphBounds.min; a <= graphBounds.max; a++) {
              const { cl, cd } = calculateAerodynamics(compareShapeId, isCompareCustom, a);
              compareRawData.push({ aoa: a, cl, cd });
            }
            const compNewData = compareRawData.map(d => {
              let clFinal = (isCompareSymmetric && Math.abs(d.aoa) < 0.01) ? 0 : Number((d.cl || 0).toFixed(3));
              let cdFinal = Number((d.cd || 0).toFixed(3));
              return { aoa: d.aoa, cl: clFinal, cd: cdFinal }; // Simplified stall handling for compare
            });
            setCompareChartData(compNewData);
          } else {
            setCompareChartData([]);
          }

          setIsSimulating(false);
        }
      }, 300); // Small artificial delay to imply calculation
      return () => { isMounted = false; };
    }
    
    // Approximate Reynolds number based on wind speed and standard chord of 1m
    const reynolds = (windSpeed * density) / 1.5e-5;

    const fetchShapeData = (shape, isSym) => {
      return fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: shape.name,
          alpha: Array.from({length: graphBounds.max - graphBounds.min + 1}, (_, i) => i + graphBounds.min),
          Re: reynolds,
          mach: 0,
          points: shape.airfoilData,
          modelSize: 'xlarge'
        })
      }).then(res => res.json()).then(data => {
         if (data.error || !Array.isArray(data)) throw new Error(data.error || 'Invalid array');
         
         let maxCl = -Infinity;
         let minCl = Infinity;
         let localStallPos = null;
         let localStallNeg = null;
         data.forEach(d => {
           if (d.cl !== null && d.cl > maxCl) { maxCl = d.cl; localStallPos = d.aoa; }
           if (d.cl !== null && d.cl < minCl) { minCl = d.cl; localStallNeg = d.aoa; }
         });

         return data.map(d => {
           let cl = d.cl;
           let cd = d.cd;
           if (isSym && Math.abs(d.aoa) < 0.01) cl = 0;
           const stallLimitPos = localStallPos !== null ? localStallPos + 5 : 999;
           const stallLimitNeg = (localStallNeg !== null && minCl < -0.1) ? localStallNeg - 5 : -999;
           if (d.aoa > stallLimitPos || d.aoa < stallLimitNeg) {
             return { ...d, cl: null, cd: null }; 
           }
           return { ...d, cl, cd };
         });
      });
    };

    const promises = [fetchShapeData(activeShape, isSymmetric)];
    if (compareActive) {
       promises.push(fetchShapeData(compareShape, isCompareSymmetric));
    }

    Promise.all(promises)
    .then(results => {
      if (isMounted) {
        setChartData(results[0]);
        setLastSimulationData(results[0]);
        if (results.length > 1) {
          setCompareChartData(results[1]);
        } else {
          setCompareChartData([]);
        }
        setIsSimulating(false);
      }
    })
    .catch(err => {
      if (isMounted) {
        setIsSimulating(false);
        console.error("Fetch Error:", err);
      }
    });

    return ()=> { isMounted = false; };
  }, [activeShapeId, compareShapeId, isCompareMode, windSpeed, density, useNeuralFoil, graphBounds, hasTarget]); // Trigger dynamically

  const handleExportPdf = async () => {
    if (!activeShape) return;
    setIsExportingPdf(true);
    // Allow React to render the hidden template
    setTimeout(async () => {
      try {
        if (!pdfReportRef.current) return;
        
        const pages = pdfReportRef.current.querySelectorAll('.pdf-page');
        const pdf = new jsPDF('p', 'mm', 'a4');
        const pdfWidth = pdf.internal.pageSize.getWidth();
        
        if (pages.length > 0) {
          for (let i = 0; i < pages.length; i++) {
            if (i > 0) pdf.addPage();
            const canvas = await html2canvas(pages[i], { scale: 2 });
            const imgData = canvas.toDataURL('image/png');
            const imgHeight = (canvas.height * pdfWidth) / canvas.width;
            pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, imgHeight);
          }
        } else {
          const canvas = await html2canvas(pdfReportRef.current, { scale: 2 });
          const imgData = canvas.toDataURL('image/png');
          const imgHeight = (canvas.height * pdfWidth) / canvas.width;
          pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, imgHeight);
        }

        pdf.save(`VortexGen_Report_${activeShape.name.replace(/\s+/g, '_')}.pdf`);
      } catch (err) {
        console.error("PDF Export failed:", err);
      } finally {
        setIsExportingPdf(false);
      }
    }, 500); // give time for Recharts animation to finish if any
  };

  return (
    <motion.div 
       initial="hidden" animate="visible"
       variants={{ hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.1 } } }}
       className="flex flex-col gap-6 max-w-[1800px] mx-auto w-full pb-8"
    >

      {/* Top 4-col grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 min-h-[500px]">

        {/* ── Left: Library + Importer ── */}
        <motion.div 
           variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
           className="col-span-1 premium-glass p-4 flex flex-col gap-4 max-h-[600px] shadow-2xl"
        >
          <h2 className="text-sm font-mono tracking-widest text-[var(--color-accent-neon)] uppercase flex-shrink-0">Geometry Library</h2>

          <div className="flex flex-col gap-3 overflow-y-auto custom-scrollbar flex-1 pr-1">
            {ALL_SHAPES.map(shape=>(
              <ShapeCard key={shape.id} {...shape}
                active={activeShapeId===shape.id}
                onClick={handleShapeClick}
              />
            ))}
          </div>

          {/* Importer */}
          <div className="flex-shrink-0 border-t border-white/10 pt-4 flex flex-col gap-2">
            <h3 className="text-xs font-mono tracking-widest text-[var(--color-accent-blue)] uppercase">Import Airfoil</h3>
            <button onClick={()=>fileInputRef.current?.click()} className="w-full flex items-center justify-center gap-2 p-3 rounded-xl border border-dashed border-white/20 hover:border-[var(--color-accent-blue)]/60 hover:bg-[var(--color-accent-blue)]/5 text-brand-400 hover:text-[var(--color-accent-blue)] text-xs font-mono tracking-wider transition-all">
              <Upload size={13}/> UPLOAD .DAT FILE
            </button>
            <input ref={fileInputRef} type="file" accept=".dat,.txt,.csv" className="hidden" onChange={handleFileUpload}/>
            {importError&&<div className="text-[10px] text-[var(--color-accent-pink)] font-mono">{importError}</div>}

            {/* ── Extract as 3D ── */}
            <button
              onClick={() => setShowExport3D(true)}
              disabled={!activeShape}
              className="w-full flex items-center justify-center gap-2 p-3 rounded-xl border transition-all text-xs font-mono tracking-wider"
              style={{
                borderColor: activeShape ? 'rgba(139,92,246,0.45)' : 'rgba(255,255,255,0.08)',
                background: activeShape ? 'rgba(139,92,246,0.07)' : 'transparent',
                color: activeShape ? '#8b5cf6' : 'rgba(100,116,139,0.5)',
                cursor: activeShape ? 'pointer' : 'not-allowed',
              }}
            >
              <Box size={13}/> EXTRACT AS 3D
            </button>

            {/* ── Export PDF ── */}
            <button
              onClick={handleExportPdf}
              disabled={!activeShape || isExportingPdf}
              className="w-full flex items-center justify-center gap-2 p-3 rounded-xl border transition-all text-xs font-mono tracking-wider"
              style={{
                borderColor: activeShape ? 'rgba(56,189,248,0.45)' : 'rgba(255,255,255,0.08)',
                background: activeShape ? 'rgba(56,189,248,0.07)' : 'transparent',
                color: activeShape ? '#38bdf8' : 'rgba(100,116,139,0.5)',
                cursor: activeShape ? 'pointer' : 'not-allowed',
              }}
            >
              <Upload size={13}/> {isExportingPdf ? 'GENERATING...' : 'EXPORT PDF REPORT'}
            </button>

            {/* ── Compare Mode Toggle ── */}
            <button
              onClick={() => setIsCompareMode(p => !p)}
              className="w-full flex items-center justify-between px-4 py-3 rounded-xl border transition-all"
              style={{
                borderColor: isCompareMode ? 'rgba(167,139,250,0.6)' : 'rgba(255,255,255,0.1)',
                background: isCompareMode ? 'rgba(167,139,250,0.1)' : 'transparent',
              }}
            >
              <span className="text-xs font-mono text-white tracking-wider">COMPARE MODE</span>
              <div className={`w-8 h-4 rounded-full relative transition-all ${isCompareMode ? 'bg-purple-500' : 'bg-brand-600'}`}>
                <div className={`absolute top-0.5 w-3 h-3 rounded-full bg-white transition-all ${isCompareMode ? 'left-4.5' : 'left-0.5'}`} />
              </div>
            </button>

            <div className="text-[9px] text-brand-400 font-mono leading-relaxed">Selig .dat format (X Y pairs). NACA coords supported.</div>
          </div>
        </motion.div>

        {/* ── Center: Viewport ── */}
        <motion.div 
           variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
           className="col-span-1 lg:col-span-2 relative shadow-2xl rounded-3xl overflow-hidden flex flex-col md:flex-row"
        >
          <div className={`flex-1 relative ${isCompareMode ? 'border-r border-white/10' : ''}`}>
            <SimulationView
              isSimulating={isSimulating}
              activeShape={activeShape}
              pitchAngle={pitchAngle}
              windSpeed={windSpeed}
              flowActive={flowActive}
              onFlowToggle={()=>setFlowActive(p=>!p)}
              autotunePhase={autotunePhase}
              autotuneProgress={autotuneProgress}
              onAutotune={runAutotune}
              onAutotuneCancel={handleAutotuneCancel}
              autotunePreview={autotunePreview}
              autotuneResult={autotuneResult}
              goldenLiftActive={goldenLiftActive}
              aeroFactsActive={aeroFactsActive}
              onAeroFactsToggle={() => setAeroFactsActive(p => !p)}
              liftForce={currentForce.lift}
              dragForce={currentForce.drag}
              isStalling={isStalling}
              positiveStallAngle={positiveStallAngle}
              negativeStallAngle={negativeStallAngle}
            />
            {isCompareMode && (
              <div className="absolute top-4 left-1/2 -translate-x-1/2 px-3 py-1 bg-black/60 rounded-full border border-white/10 text-[10px] font-mono text-white/70 backdrop-blur-md z-10 pointer-events-none">
                PRIMARY
              </div>
            )}
          </div>

          {isCompareMode && (
            <div className="flex-1 relative bg-brand-900/50">
              {compareShape ? (
                <SimulationView
                  isSimulating={isSimulating}
                  activeShape={compareShape}
                  pitchAngle={pitchAngle}
                  windSpeed={windSpeed}
                  flowActive={flowActive}
                  onFlowToggle={()=>setFlowActive(p=>!p)}
                  autotunePhase={'idle'}
                  autotuneProgress={null}
                  onAutotune={()=>{}}
                  onAutotuneCancel={()=>{}}
                  autotunePreview={null}
                  autotuneResult={null}
                  goldenLiftActive={false}
                  aeroFactsActive={false}
                  onAeroFactsToggle={()=>{}}
                  liftForce={0.5 * density * Math.pow(windSpeed, 2) * (compareChartData.find(d=>d.aoa===pitchAngle)?.cl||0)}
                  dragForce={0.5 * density * Math.pow(windSpeed, 2) * (compareChartData.find(d=>d.aoa===pitchAngle)?.cd||0)}
                  isStalling={false} // Simplify for comparison view to avoid double alarms
                  positiveStallAngle={null}
                  negativeStallAngle={null}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-white/30 font-mono text-sm">
                  Select an airfoil from library to compare
                </div>
              )}
              <div className="absolute top-4 left-1/2 -translate-x-1/2 px-3 py-1 bg-black/60 rounded-full border border-purple-500/30 text-[10px] font-mono text-purple-400 backdrop-blur-md z-10 pointer-events-none">
                COMPARISON
              </div>
            </div>
          )}

          {/* Aero-Facts Learn Mode Panel */}
          {aeroFactsActive && (
            <AeroFactsPanel
              pitchAngle={pitchAngle}
              windSpeed={windSpeed}
              isStalling={isStalling}
              onClose={() => setAeroFactsActive(false)}
            />
          )}
        </motion.div>

        {/* ── Right: Controls ── */}
        <motion.div 
           variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
           className="col-span-1 premium-glass p-6 flex flex-col max-h-[600px] shadow-2xl"
        >
          <div ref={densitySettingsRef} className="relative flex justify-between items-center mb-2 flex-shrink-0 w-full">
            <h2 className="text-sm font-mono tracking-widest text-[var(--color-accent-blue)] uppercase">Environment</h2>
            <button 
              onClick={() => setShowDensitySettings(!showDensitySettings)} 
              className={`p-1.5 rounded-md transition-colors ${showDensitySettings ? 'bg-[var(--color-accent-blue)] text-white shadow-[0_0_10px_var(--color-accent-blue)]' : 'text-brand-300 hover:text-white hover:bg-white/5'}`}
            >
              <Settings size={14} className={showDensitySettings ? 'animate-[spin_4s_linear_infinite]' : ''}/>
            </button>
            
            {showDensitySettings && (
              <div className="absolute top-full left-0 w-full mt-2 bg-[#0a0f18] border border-[var(--color-accent-blue)]/40 rounded-xl p-6 shadow-[0_10px_40px_rgba(0,0,0,0.8)] z-50 overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--color-accent-blue)]/5 blur-[40px] pointer-events-none"/>
                
                <div className="flex justify-between items-center mb-5">
                  <h3 className="text-sm font-mono font-bold text-white tracking-widest">AIR DENSITY (ρ)</h3>
                  <button onClick={() => setShowDensitySettings(false)} className="text-brand-400 hover:text-white pb-1">✕</button>
                </div>
                
                <div className="flex gap-3 mb-6 relative">
                  <input 
                    type="number" min="0.01" max="2.0" step="0.01" 
                    value={density} 
                    onBlur={() => {
                      const val = parseFloat(density);
                      if (isNaN(val) || val < 0.01 || val > 2.0) {
                        setDensityError('Allowed range: 0.01 to 2.0 (Resetting)');
                        setDensity(1.225);
                        setTimeout(() => setDensityError(''), 2500);
                      } else {
                        setDensityError('');
                      }
                    }}
                    onChange={(e) => { 
                      const rawVal = e.target.value;
                      setDensity(rawVal); 
                      setActivePreset('custom'); 
                      
                      // Live validation warning
                      if (rawVal !== '') {
                        const val = parseFloat(rawVal);
                        if (isNaN(val) || val < 0.01 || val > 2.0) {
                          setDensityError('Allowed range: 0.01 to 2.0');
                        } else {
                          setDensityError('');
                        }
                      } else {
                        setDensityError(''); // Don't warn on empty, wait for blur
                      }
                    }} 
                    className={`w-full bg-black/50 border ${densityError ? 'border-red-500' : 'border-white/10'} rounded-lg px-4 py-3 text-base text-[var(--color-accent-neon)] font-mono focus:outline-none focus:border-[var(--color-accent-neon)] shadow-inner`}
                  />
                  <span className="text-xs text-brand-300 font-mono self-center px-2">kg/m³</span>
                  {densityError && <div className="absolute -bottom-5 left-0 text-[10px] text-red-500 mt-1">{densityError}</div>}
                </div>
                
                <div className="mb-6">
                  <input 
                    type="range" min="0.01" max="2.0" step="0.01" 
                    value={density} 
                    onChange={(e) => { setDensity(parseFloat(e.target.value)); setActivePreset('custom'); }} 
                    className="w-full h-2 bg-brand-900 rounded-lg appearance-none cursor-pointer accent-[var(--color-accent-neon)]"
                  />
                  <div className="flex justify-between text-xs text-brand-400 font-mono mt-1.5 px-0.5">
                    <span>0.01</span>
                    <span>2.00</span>
                  </div>
                </div>
                
                <div className="text-xs text-brand-400 font-mono tracking-widest uppercase mb-3 mt-4">Flight Altitudes</div>
                <div className="grid grid-cols-2 gap-3">
                  <button onClick={() => { setDensity(1.225); setActivePreset('custom'); }} className={`flex flex-col items-center justify-center border rounded-lg py-3 transition-colors ${parseFloat(density) === 1.225 ? 'bg-[var(--color-accent-blue)]/15 border-[var(--color-accent-blue)] shadow-[0_0_12px_rgba(14,165,233,0.25)]' : 'border-white/10 hover:bg-[var(--color-accent-blue)]/10 hover:border-[var(--color-accent-blue)]/30'}`}>
                     <span className={`text-[10px] mb-1 ${parseFloat(density) === 1.225 ? 'text-white' : 'text-brand-300'}`}>Sea Level</span>
                     <span className="text-xs font-bold text-[var(--color-accent-blue)]">1.225</span>
                  </button>
                  <button onClick={() => { setDensity(0.905); setActivePreset('custom'); }} className={`flex flex-col items-center justify-center border rounded-lg py-3 transition-colors ${parseFloat(density) === 0.905 ? 'bg-[var(--color-accent-blue)]/15 border-[var(--color-accent-blue)] shadow-[0_0_12px_rgba(14,165,233,0.25)]' : 'border-white/10 hover:bg-[var(--color-accent-blue)]/10 hover:border-[var(--color-accent-blue)]/30'}`}>
                     <span className={`text-[10px] mb-1 ${parseFloat(density) === 0.905 ? 'text-white' : 'text-brand-300'}`}>10,000 ft · 3 km</span>
                     <span className="text-xs font-bold text-[var(--color-accent-blue)]">0.905</span>
                  </button>
                  <button onClick={() => { setDensity(0.458); setActivePreset('custom'); }} className={`flex flex-col items-center justify-center border rounded-lg py-3 transition-colors ${parseFloat(density) === 0.458 ? 'bg-[var(--color-accent-blue)]/15 border-[var(--color-accent-blue)] shadow-[0_0_12px_rgba(14,165,233,0.25)]' : 'border-white/10 hover:bg-[var(--color-accent-blue)]/10 hover:border-[var(--color-accent-blue)]/30'}`}>
                     <span className={`text-[10px] mb-1 ${parseFloat(density) === 0.458 ? 'text-white' : 'text-brand-300'}`}>30,000 ft · 9 km</span>
                     <span className="text-xs font-bold text-[var(--color-accent-blue)]">0.458</span>
                  </button>
                  <button onClick={() => { setDensity(0.302); setActivePreset('custom'); }} className={`flex flex-col items-center justify-center border rounded-lg py-3 transition-colors ${parseFloat(density) === 0.302 ? 'bg-[var(--color-accent-blue)]/15 border-[var(--color-accent-blue)] shadow-[0_0_12px_rgba(14,165,233,0.25)]' : 'border-white/10 hover:bg-[var(--color-accent-blue)]/10 hover:border-[var(--color-accent-blue)]/30'}`}>
                     <span className={`text-[10px] mb-1 ${parseFloat(density) === 0.302 ? 'text-white' : 'text-brand-300'}`}>40,000 ft · 12 km</span>
                     <span className="text-xs font-bold text-[var(--color-accent-blue)]">0.302</span>
                  </button>
                </div>
              </div>
            )}
          </div>
          
          <div className="grid grid-cols-2 gap-3 mb-4 flex-shrink-0">
            {Object.entries(ENV_PRESETS).map(([key,preset])=>(
              <PresetButton key={key} preset={preset} active={activePreset===key} onClick={()=>applyPreset(key)}/>
            ))}
          </div>

          <div className="border-t border-white/10 pt-3 mb-1 flex-shrink-0">
            <h2 className="text-sm font-mono tracking-widest text-[var(--color-accent-blue)] uppercase mb-2">Parameters</h2>
          </div>

          <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar flex flex-col pt-2 pb-2">
            <ControlSlider label="Wind Speed"    value={windSpeed}     min={0}   max={300}   unit={units === 'imperial' ? 'mph' : 'm/s'} onChange={setWindSpeed}     accent="neon"/>
            <ControlSlider label="Pitch Angle"   value={pitchAngle}    min={-45} max={45}    unit="°"   onChange={setPitchAngle}    accent="blue"/>
          </div>


          {/* Live metrics */}
          <div
            className={`mt-4 border-t border-white/10 pt-3 flex-shrink-0 rounded-xl transition-[box-shadow,border-color] duration-500 ${
              goldenLiftActive
                ? 'shadow-[0_0_32px_rgba(234,179,8,0.22),inset_0_0_24px_rgba(234,179,8,0.06)] border border-amber-500/35 p-3 -m-1 bg-amber-500/[0.04]'
                : ''
            }`}
          >
            <h2
              className={`text-sm font-mono tracking-widest uppercase mb-2 ${
                goldenLiftActive ? 'text-amber-200/90' : 'text-[var(--color-accent-pink)]'
              }`}
            >
              Live Metrics
              {goldenLiftActive && (
                <span className="ml-2 text-[10px] font-normal text-amber-400/90 tracking-normal">· Golden optimum</span>
              )}
            </h2>
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-brand-900/50 p-2 rounded-lg border border-white/5 flex flex-col justify-center">
                <div className="flex justify-between items-end mb-0.5">
                  <div className="text-[11px] text-brand-400 font-bold">DRAG <span className="font-normal opacity-70">(Cd)</span></div>
                  <div className="text-[10px] text-brand-500">{hasTarget ? (currentForce.drag || 0).toFixed(0) : '--'} N</div>
                </div>
                <div className="text-lg font-bold font-mono text-[var(--color-accent-pink)]">{isSimulating || !hasTarget ? '--' : (currentAeroItem.cd || 0).toFixed(3)}</div>
              </div>
              <div className="bg-brand-900/50 p-2 rounded-lg border border-white/5 flex flex-col justify-center">
                <div className="flex justify-between items-end mb-0.5">
                  <div className="text-[11px] text-[var(--color-accent-neon)] font-bold">LIFT <span className="font-normal opacity-70">(Cl)</span></div>
                  <div className="text-[10px] text-brand-500">{hasTarget ? (currentForce.lift || 0).toFixed(0) : '--'} N</div>
                </div>
                <div className="text-lg font-bold font-mono text-[var(--color-accent-neon)] neon-text">{isSimulating || !hasTarget ? '--' : (currentAeroItem.cl || 0).toFixed(3)}</div>
              </div>
              <div className="bg-brand-900/50 p-2 rounded-lg border border-white/5 col-span-2">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-[11px] text-brand-400 mb-0.5">AIR DENSITY</div>
                    <div className="text-sm font-bold font-mono" style={{color: ENV_PRESETS[activePreset]?.color || 'var(--color-accent-neon)'}}>
                       ρ = {density} <span className="text-[10px]">kg/m³</span>
                       {units === 'imperial' && <span className="text-[10px] text-brand-500 ml-2">({(density * 0.00194032).toFixed(4)} slug/ft³)</span>}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-[11px] text-brand-400 mb-0.5">DYNAMIC PRESSURE</div>
                    <div className="text-sm font-bold font-mono text-white">
                       {(0.5 * density * Math.pow(windSpeed, 2)).toFixed(0)} <span className="text-[10px]">Pa</span>
                       {units === 'imperial' && <span className="text-[10px] text-brand-500 ml-2">({(0.5 * density * Math.pow(windSpeed, 2) * 0.0208854).toFixed(1)} psf)</span>}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Bottom Charts */}
      {!isCompareMode ? (
        <motion.div 
           variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
           className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[280px] flex-shrink-0 relative"
        >
          {isSimulating && (
             <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/40 backdrop-blur-sm rounded-xl">
               <div className="text-[var(--color-brand-100)] font-mono animate-pulse tracking-widest text-sm flex gap-3 items-center">
                 <div className="w-4 h-4 border-2 border-[var(--color-accent-neon)] border-t-transparent rounded-full animate-spin"></div>
                 COMPUTING NEURALFOIL CFD...
               </div>
             </div>
          )}
          <DataChart data={chartData} title="Drag Coefficient (Cd vs AoA)" dataKey="cd" xKey="aoa" activeX={pitchAngle} stallAngleX={positiveStallAngle} negativeStallAngleX={negativeStallAngle} isStalling={isStalling} strokeColor="var(--color-accent-pink)" />
          <DataChart data={chartData} title="Lift Coefficient (Cl vs AoA)" dataKey="cl" xKey="aoa" activeX={pitchAngle} stallAngleX={positiveStallAngle} negativeStallAngleX={negativeStallAngle} isStalling={isStalling} strokeColor="var(--color-accent-neon)" />
          <PolarChart
            data={chartData}
            currentCd={currentAeroItem.cd}
            currentCl={currentAeroItem.cl}
            stallCd={stallPoint.cd}
            stallCl={stallPoint.cl}
            isStalling={isStalling}
          />
        </motion.div>
      ) : (
        <motion.div 
           variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
           className="flex flex-col gap-8 flex-shrink-0 relative"
        >
          {isSimulating && (
            <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/40 backdrop-blur-sm rounded-xl">
              <div className="text-[var(--color-brand-100)] font-mono animate-pulse tracking-widest text-sm flex gap-3 items-center">
                <div className="w-4 h-4 border-2 border-[var(--color-accent-neon)] border-t-transparent rounded-full animate-spin"></div>
                COMPUTING NEURALFOIL CFD...
              </div>
            </div>
          )}
          
          <div className="flex flex-col gap-3">
             <h3 className="text-xs font-mono font-bold text-[var(--color-accent-neon)] uppercase tracking-widest">{activeShape?.name} - Primary</h3>
             <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[250px]">
               <DataChart data={chartData} title="Drag Coefficient (Cd vs AoA)" dataKey="cd" xKey="aoa" activeX={pitchAngle} stallAngleX={positiveStallAngle} negativeStallAngleX={negativeStallAngle} isStalling={isStalling} strokeColor="var(--color-accent-pink)" />
               <DataChart data={chartData} title="Lift Coefficient (Cl vs AoA)" dataKey="cl" xKey="aoa" activeX={pitchAngle} stallAngleX={positiveStallAngle} negativeStallAngleX={negativeStallAngle} isStalling={isStalling} strokeColor="var(--color-accent-neon)" />
               <PolarChart data={chartData} currentCd={currentAeroItem.cd} currentCl={currentAeroItem.cl} stallCd={stallPoint.cd} stallCl={stallPoint.cl} isStalling={isStalling} />
             </div>
          </div>

          <div className="flex flex-col gap-3">
             <h3 className="text-xs font-mono font-bold text-[var(--color-accent-blue)] uppercase tracking-widest">{compareShape?.name} - Compare</h3>
             <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[250px]">
               <DataChart data={compareChartData} title="Drag Coefficient (Cd vs AoA)" dataKey="cd" xKey="aoa" activeX={pitchAngle} stallAngleX={comparePositiveStallAngle} negativeStallAngleX={compareNegativeStallAngle} strokeColor="var(--color-accent-pink)" />
               <DataChart data={compareChartData} title="Lift Coefficient (Cl vs AoA)" dataKey="cl" xKey="aoa" activeX={pitchAngle} stallAngleX={comparePositiveStallAngle} negativeStallAngleX={compareNegativeStallAngle} strokeColor="var(--color-accent-neon)" />
               <PolarChart data={compareChartData} currentCd={compareCurrentAeroItem.cd} currentCl={compareCurrentAeroItem.cl} stallCd={compareStallPoint.cd} stallCl={compareStallPoint.cl} />
             </div>
          </div>

          <div className="flex flex-col gap-3">
             <h3 className="text-xs font-mono font-bold text-white uppercase tracking-widest">Comparison Overview: {activeShape?.name} vs {compareShape?.name}</h3>
             <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[250px]">
               <DataChart data={chartData} compareData={compareChartData} primaryName={activeShape?.name} compareName={compareShape?.name} title="Drag Coefficient Comparison" dataKey="cd" xKey="aoa" activeX={pitchAngle} strokeColor="var(--color-accent-pink)" />
               <DataChart data={chartData} compareData={compareChartData} primaryName={activeShape?.name} compareName={compareShape?.name} title="Lift Coefficient Comparison" dataKey="cl" xKey="aoa" activeX={pitchAngle} strokeColor="var(--color-accent-neon)" />
             </div>
          </div>
        </motion.div>
      )}

      {/* Import Modal */}
      {showImportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
            className="premium-glass p-6 w-full max-w-md flex flex-col gap-5 border border-[var(--color-accent-blue)]/30 shadow-[0_0_40px_rgba(14,165,233,0.15)]"
          >
            <div className="flex items-center gap-3 text-[var(--color-accent-neon)]">
              <Upload size={20} />
              <h2 className="text-lg font-mono font-bold uppercase tracking-wider">Save Imported Airfoil</h2>
            </div>
            
            <div className="flex flex-col gap-2">
              <label className="text-xs font-mono text-brand-400 uppercase tracking-widest">Airfoil Name</label>
              <input 
                type="text" 
                value={pendingAirfoilName}
                onChange={(e) => setPendingAirfoilName(e.target.value)}
                className="bg-black/50 border border-white/20 rounded-lg p-3 text-white font-mono outline-none focus:border-[var(--color-accent-neon)] transition-colors"
                placeholder="e.g. CUSTOM WING"
                autoFocus
              />
            </div>

            <div className="flex justify-end gap-3 mt-2">
              <button onClick={cancelImport} className="px-4 py-2 rounded-lg font-mono text-xs uppercase tracking-wider text-brand-400 hover:text-white transition-colors">
                Cancel
              </button>
              <button 
                onClick={addCustomAirfoil} 
                className="px-5 py-2 rounded-lg font-mono font-bold text-xs uppercase tracking-wider bg-[var(--color-accent-blue)]/20 text-[var(--color-accent-blue)] border border-[var(--color-accent-blue)]/50 hover:bg-[var(--color-accent-blue)] hover:text-white transition-all shadow-[0_0_15px_var(--color-accent-blue)]"
              >
                Add to Library
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Settings Modal Overlay */}
      <SettingsModal 
        show={showSettings} 
        onClose={() => setShowSettings(false)}
        manualDensity={manualDensity}
        setManualDensity={setManualDensity}
        density={density}
        setDensity={setDensity}
      />

      {/* Extract as 3D — Full-screen modal */}
      <Export3DModal
        isOpen={showExport3D}
        onClose={() => setShowExport3D(false)}
        activeShape={activeShape}
      />
      {isExportingPdf && (
        <div style={{ position: 'fixed', top: '-10000px', left: '-10000px', zIndex: -1 }}>
          <PdfReportTemplate 
            ref={pdfReportRef}
            activeShape={activeShape}
            chartData={chartData}
            windSpeed={windSpeed}
            density={density}
            pitchAngle={pitchAngle}
            liftForce={currentForce.lift}
            dragForce={currentForce.drag}
            positiveStallAngle={positiveStallAngle}
            isCompareMode={isCompareMode}
            compareShape={compareShape}
            compareChartData={compareChartData}
            comparePositiveStallAngle={comparePositiveStallAngle}
          />
        </div>
      )}

    </motion.div>
  );
};

export default Home;
