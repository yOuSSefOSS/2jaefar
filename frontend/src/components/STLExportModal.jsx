import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Download, Box, Ruler, Info } from 'lucide-react';
import { generateAirfoilSTL, downloadSTL } from '../utils/stlExporter';

const RECOMMENDATIONS = [
  { label: 'Desk Model',       chord: 80,  span: 60,  desc: 'Small display piece' },
  { label: 'Wind Tunnel Test',  chord: 150, span: 200, desc: 'Standard test section' },
  { label: 'Drone Wing Section', chord: 200, span: 300, desc: 'UAV-scale prototype' },
  { label: 'RC Aircraft Wing',  chord: 250, span: 500, desc: 'Full RC wing panel' },
];

const STLExportModal = ({ show, onClose, airfoilPoints, airfoilName = 'AIRFOIL' }) => {
  const [chord, setChord] = useState(150);
  const [span, setSpan]   = useState(200);
  const [downloading, setDownloading] = useState(false);

  if (!show) return null;

  const handleExport = () => {
    if (!airfoilPoints || airfoilPoints.length < 3) return;
    setDownloading(true);
    try {
      const stl = generateAirfoilSTL(airfoilPoints, chord, span);
      const safeName = airfoilName.replace(/[^a-zA-Z0-9_-]/g, '_').toLowerCase();
      downloadSTL(stl, `${safeName}_${chord}x${span}mm.stl`);
    } catch (e) {
      console.error('STL generation failed:', e);
    }
    setTimeout(() => setDownloading(false), 800);
  };

  const applyRecommendation = (rec) => {
    setChord(rec.chord);
    setSpan(rec.span);
  };

  const estimatedTris = airfoilPoints ? (airfoilPoints.length - 2) * 2 + airfoilPoints.length * 2 : 0;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4" onClick={onClose}>
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="premium-glass p-6 w-full max-w-lg flex flex-col gap-5 border border-[var(--color-accent-blue)]/30 shadow-[0_0_60px_rgba(14,165,233,0.15)]"
          onClick={e => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 text-[var(--color-accent-neon)]">
              <Box size={22} />
              <h2 className="text-lg font-mono font-bold uppercase tracking-wider">Export 3D Model</h2>
            </div>
            <button onClick={onClose} className="text-brand-400 hover:text-white transition-colors p-1">
              <X size={18} />
            </button>
          </div>

          {/* Airfoil Name */}
          <div className="bg-brand-900/60 rounded-xl p-3 border border-white/5">
            <div className="text-[10px] text-brand-400 font-mono uppercase tracking-widest mb-1">Active Geometry</div>
            <div className="text-sm font-mono font-bold text-white">{airfoilName}</div>
          </div>

          {/* Dimension Controls */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-mono text-brand-400 uppercase tracking-widest flex items-center gap-1.5">
                <Ruler size={11} /> Chord Length
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min={20}
                  max={500}
                  value={chord}
                  onChange={e => setChord(Math.max(20, Math.min(500, Number(e.target.value) || 20)))}
                  className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-sm text-[var(--color-accent-neon)] font-mono focus:outline-none focus:border-[var(--color-accent-neon)] transition-colors"
                />
                <span className="text-xs text-brand-400 font-mono whitespace-nowrap">mm</span>
              </div>
              <input
                type="range" min={20} max={500} step={5}
                value={chord}
                onChange={e => setChord(Number(e.target.value))}
                className="w-full h-1.5 bg-brand-900 rounded-lg appearance-none cursor-pointer accent-[var(--color-accent-neon)]"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-mono text-brand-400 uppercase tracking-widest flex items-center gap-1.5">
                <Ruler size={11} /> Wing Span
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min={20}
                  max={1000}
                  value={span}
                  onChange={e => setSpan(Math.max(20, Math.min(1000, Number(e.target.value) || 20)))}
                  className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-sm text-[var(--color-accent-neon)] font-mono focus:outline-none focus:border-[var(--color-accent-neon)] transition-colors"
                />
                <span className="text-xs text-brand-400 font-mono whitespace-nowrap">mm</span>
              </div>
              <input
                type="range" min={20} max={1000} step={10}
                value={span}
                onChange={e => setSpan(Number(e.target.value))}
                className="w-full h-1.5 bg-brand-900 rounded-lg appearance-none cursor-pointer accent-[var(--color-accent-neon)]"
              />
            </div>
          </div>

          {/* Recommendations */}
          <div>
            <div className="text-[10px] font-mono text-brand-400 uppercase tracking-widest mb-2 flex items-center gap-1.5">
              <Info size={11} /> Recommended Presets
            </div>
            <div className="grid grid-cols-2 gap-2">
              {RECOMMENDATIONS.map(rec => {
                const isActive = chord === rec.chord && span === rec.span;
                return (
                  <button
                    key={rec.label}
                    onClick={() => applyRecommendation(rec)}
                    className={`flex flex-col items-start p-2.5 rounded-lg border transition-all text-left ${
                      isActive
                        ? 'border-[var(--color-accent-neon)]/60 bg-[var(--color-accent-neon)]/10 shadow-[0_0_12px_rgba(0,240,255,0.15)]'
                        : 'border-white/10 hover:border-[var(--color-accent-neon)]/30 hover:bg-white/5'
                    }`}
                  >
                    <span className={`text-[11px] font-mono font-bold ${isActive ? 'text-[var(--color-accent-neon)]' : 'text-white'}`}>{rec.label}</span>
                    <span className="text-[9px] text-brand-400 font-mono">{rec.chord}×{rec.span}mm · {rec.desc}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Stats */}
          <div className="flex items-center justify-between text-[10px] font-mono text-brand-500 border-t border-white/5 pt-3">
            <span>~{estimatedTris} triangles</span>
            <span>Format: ASCII STL</span>
          </div>

          {/* Download Button */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleExport}
            disabled={!airfoilPoints || airfoilPoints.length < 3 || downloading}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-mono font-bold text-sm uppercase tracking-wider bg-gradient-to-r from-[var(--color-accent-blue)] to-[var(--color-accent-neon)] text-white shadow-[0_0_25px_rgba(0,240,255,0.25)] hover:shadow-[0_0_35px_rgba(0,240,255,0.4)] transition-shadow disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Download size={16} />
            {downloading ? 'GENERATING…' : `DOWNLOAD STL (${chord}×${span}mm)`}
          </motion.button>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default STLExportModal;
