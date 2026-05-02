import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Download, Box, Wind, ChevronRight, Check, AlertTriangle } from 'lucide-react';
import * as THREE from 'three';

// ── STL Exporter (binary) ──────────────────────────────────────────────────
function exportBinarySTL(geometry) {
  const posAttr = geometry.attributes.position;
  const indexAttr = geometry.index;
  const triCount = indexAttr ? indexAttr.count / 3 : posAttr.count / 3;

  const buf = new ArrayBuffer(84 + 50 * triCount);
  const view = new DataView(buf);

  // 80-byte header
  const enc = new TextEncoder();
  const header = enc.encode('VortexGen 3D Airfoil Export');
  new Uint8Array(buf, 0, header.length).set(header);

  view.setUint32(80, triCount, true);

  const getV = (i) => {
    const idx = indexAttr ? indexAttr.getX(i) : i;
    return new THREE.Vector3(
      posAttr.getX(idx),
      posAttr.getY(idx),
      posAttr.getZ(idx),
    );
  };

  let offset = 84;
  const _n = new THREE.Vector3();
  const _cb = new THREE.Vector3();
  const _ab = new THREE.Vector3();

  for (let t = 0; t < triCount; t++) {
    const a = getV(t * 3);
    const b = getV(t * 3 + 1);
    const c = getV(t * 3 + 2);

    _cb.subVectors(c, b);
    _ab.subVectors(a, b);
    _n.crossVectors(_cb, _ab).normalize();

    view.setFloat32(offset,     _n.x, true); offset += 4;
    view.setFloat32(offset,     _n.y, true); offset += 4;
    view.setFloat32(offset,     _n.z, true); offset += 4;

    view.setFloat32(offset,     a.x, true); offset += 4;
    view.setFloat32(offset,     a.y, true); offset += 4;
    view.setFloat32(offset,     a.z, true); offset += 4;

    view.setFloat32(offset,     b.x, true); offset += 4;
    view.setFloat32(offset,     b.y, true); offset += 4;
    view.setFloat32(offset,     b.z, true); offset += 4;

    view.setFloat32(offset,     c.x, true); offset += 4;
    view.setFloat32(offset,     c.y, true); offset += 4;
    view.setFloat32(offset,     c.z, true); offset += 4;

    offset += 2; // attribute byte count
  }
  return buf;
}

// ── Presets ───────────────────────────────────────────────────────────────
const PRESETS = {
  drone: {
    id: 'drone',
    label: 'Drone',
    sublabel: 'Small UAV / FPV wing section',
    icon: Wind,
    chord: 80,
    span: 200,
    color: '#00e5ff',
    glow: 'rgba(0,229,255,0.35)',
    description: 'Optimised for small-scale RC / autonomous drones. Chord 80 mm, span 200 mm.',
  },
  plane: {
    id: 'plane',
    label: 'Plane Section',
    sublabel: 'Full-scale aircraft rib section',
    icon: Box,
    chord: 300,
    span: 800,
    color: '#8b5cf6',
    glow: 'rgba(139,92,246,0.35)',
    description: 'Sized for a 1:1 rib-section jig or scale model fuselage. Chord 300 mm, span 800 mm.',
  },
};

// ── Mini 2-D SVG preview ───────────────────────────────────────────────────
const AirfoilSVGPreview = ({ points }) => {
  if (!points || points.length < 3) return null;

  const xs = points.map(p => p[0]);
  const ys = points.map(p => p[1]);
  const minX = Math.min(...xs), maxX = Math.max(...xs);
  const minY = Math.min(...ys), maxY = Math.max(...ys);
  const W = 260, H = 80, PAD = 6;
  const scaleX = (W - PAD * 2) / (maxX - minX || 1);
  const scaleY = (H - PAD * 2) / (maxY - minY || 1);
  const scale = Math.min(scaleX, scaleY);
  const offX = PAD + (W - PAD * 2 - (maxX - minX) * scale) / 2;
  const offY = PAD + (H - PAD * 2 - (maxY - minY) * scale) / 2;

  const d = points.map(([x, y], i) => {
    const px = offX + (x - minX) * scale;
    const py = H - (offY + (y - minY) * scale);
    return `${i === 0 ? 'M' : 'L'}${px.toFixed(2)},${py.toFixed(2)}`;
  }).join(' ') + ' Z';

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height: H }}>
      <defs>
        <linearGradient id="af-grad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#00e5ff" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.6" />
        </linearGradient>
        <filter id="af-glow">
          <feGaussianBlur stdDeviation="2" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>
      <path d={d} fill="url(#af-grad)" fillOpacity="0.15" stroke="url(#af-grad)" strokeWidth="1.5" filter="url(#af-glow)" />
    </svg>
  );
};

// ── Main Component ─────────────────────────────────────────────────────────
const Export3DModal = ({ isOpen, onClose, activeShape }) => {
  const [selected, setSelected] = useState('drone');
  const [chord, setChord]       = useState(PRESETS.drone.chord);
  const [span,  setSpan]        = useState(PRESETS.drone.span);
  const [status, setStatus]     = useState('idle'); // idle | generating | done | error
  const [errorMsg, setErrorMsg] = useState('');

  const preset = PRESETS[selected];

  // Sync inputs when switching preset
  const pickPreset = (id) => {
    setSelected(id);
    setChord(PRESETS[id].chord);
    setSpan(PRESETS[id].span);
    setStatus('idle');
  };

  const generate = useCallback(() => {
    if (!activeShape?.airfoilData || activeShape.airfoilData.length < 3) {
      setErrorMsg('No valid airfoil geometry loaded. Select or import an airfoil first.');
      setStatus('error');
      return;
    }
    const chordMM = parseFloat(chord);
    const spanMM  = parseFloat(span);
    if (!chordMM || !spanMM || chordMM <= 0 || spanMM <= 0) {
      setErrorMsg('Chord and span must be positive numbers.');
      setStatus('error');
      return;
    }

    setStatus('generating');
    setErrorMsg('');

    // Defer heavy work off the paint frame
    setTimeout(() => {
      try {
        const pts = activeShape.airfoilData;

        // Build THREE.Shape from normalised coords, scaled to mm
        const shape = new THREE.Shape();
        pts.forEach(([x, y], i) => {
          const px = x * chordMM;
          const py = y * chordMM;
          if (i === 0) shape.moveTo(px, py);
          else shape.lineTo(px, py);
        });
        shape.closePath();

        const extrudeSettings = {
          depth: spanMM,
          bevelEnabled: false,
          steps: 1,
        };

        const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
        geometry.computeVertexNormals();

        const stlBuf = exportBinarySTL(geometry);
        geometry.dispose();

        const blob = new Blob([stlBuf], { type: 'model/stl' });
        const url  = URL.createObjectURL(blob);
        const a    = document.createElement('a');
        const safeName = (activeShape.name || 'airfoil')
          .replace(/[^a-z0-9_\-\.]/gi, '_')
          .replace(/_{2,}/g, '_');
        a.href     = url;
        a.download = `${safeName}_${selected}_c${chordMM}mm_s${spanMM}mm.stl`;
        a.click();
        URL.revokeObjectURL(url);

        setStatus('done');
        setTimeout(() => setStatus('idle'), 2500);
      } catch (e) {
        console.error('Export3D error:', e);
        setErrorMsg('An error occurred during 3D generation. Check console for details.');
        setStatus('error');
      }
    }, 80);
  }, [activeShape, chord, span, selected]);

  // Reset on open
  useEffect(() => {
    if (isOpen) {
      pickPreset('drone');
      setStatus('idle');
      setErrorMsg('');
    }
  }, [isOpen]);

  // Esc to close
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    if (isOpen) window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isOpen, onClose]);

  const accentColor = preset.color;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="export3d-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          className="fixed inset-0 z-[100] flex flex-col"
          style={{
            background: 'radial-gradient(ellipse 100% 120% at 50% -10%, rgba(14,165,233,0.12), transparent 60%), rgba(2,6,23,0.97)',
            backdropFilter: 'blur(20px)',
          }}
        >
          {/* Subtle grid bg */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              backgroundImage: `linear-gradient(to right, rgba(255,255,255,0.018) 1px, transparent 1px),
                                linear-gradient(to bottom, rgba(255,255,255,0.018) 1px, transparent 1px)`,
              backgroundSize: '4rem 4rem',
            }}
          />

          {/* Top accent line */}
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="h-[2px] w-full flex-shrink-0 origin-left"
            style={{ background: `linear-gradient(90deg, ${accentColor}, transparent)` }}
          />

          {/* Header */}
          <div className="flex-shrink-0 flex items-center justify-between px-8 py-5 border-b border-white/5">
            <div className="flex items-center gap-4">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ background: `${accentColor}18`, border: `1px solid ${accentColor}40`, boxShadow: `0 0 18px ${preset.glow}` }}
              >
                <Box size={20} color={accentColor} />
              </div>
              <div>
                <h1 className="text-lg font-bold tracking-widest text-white uppercase">Extract as 3D</h1>
                <p className="text-xs font-mono text-brand-400 mt-0.5">
                  {activeShape?.name ?? 'No airfoil selected'} → STL export
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-9 h-9 rounded-xl flex items-center justify-center text-brand-400 hover:text-white hover:bg-white/8 transition-all border border-white/10 hover:border-white/25"
            >
              <X size={18} />
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto custom-scrollbar">
            <div className="max-w-3xl mx-auto w-full px-6 py-8 flex flex-col gap-8">

              {/* 2-D airfoil preview */}
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 }}
                className="rounded-2xl border border-white/8 overflow-hidden"
                style={{ background: 'rgba(0,0,0,0.35)' }}
              >
                <div className="px-5 pt-4 pb-1">
                  <span className="text-[10px] font-mono tracking-widest text-brand-400 uppercase">2D Profile Preview</span>
                </div>
                <div className="px-5 pb-4">
                  {activeShape?.airfoilData
                    ? <AirfoilSVGPreview points={activeShape.airfoilData} />
                    : <div className="h-16 flex items-center justify-center text-brand-500 text-xs font-mono">No airfoil loaded</div>
                  }
                </div>
              </motion.div>

              {/* Preset selector */}
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="flex flex-col gap-3"
              >
                <span className="text-xs font-mono tracking-widest text-brand-400 uppercase">Application Preset</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {Object.values(PRESETS).map(p => {
                    const Icon = p.icon;
                    const isActive = selected === p.id;
                    return (
                      <button
                        key={p.id}
                        onClick={() => pickPreset(p.id)}
                        className="relative text-left p-5 rounded-2xl border transition-all duration-300 group overflow-hidden"
                        style={{
                          background: isActive ? `${p.color}12` : 'rgba(255,255,255,0.025)',
                          borderColor: isActive ? p.color : 'rgba(255,255,255,0.08)',
                          boxShadow: isActive ? `0 0 24px ${p.glow}, inset 0 1px 0 rgba(255,255,255,0.06)` : 'none',
                        }}
                      >
                        {/* Glow sweep */}
                        <div
                          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                          style={{ background: `radial-gradient(ellipse 80% 80% at 50% 0%, ${p.color}08, transparent)` }}
                        />

                        <div className="flex items-start gap-3 relative z-10">
                          <div
                            className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5"
                            style={{
                              background: `${p.color}18`,
                              border: `1px solid ${p.color}35`,
                              boxShadow: isActive ? `0 0 14px ${p.glow}` : 'none',
                            }}
                          >
                            <Icon size={16} color={p.color} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-bold text-white tracking-wide">{p.label}</span>
                              {isActive && (
                                <span
                                  className="w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0"
                                  style={{ background: p.color }}
                                >
                                  <Check size={10} color="#000" strokeWidth={3} />
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-brand-400 mt-0.5">{p.sublabel}</div>
                            <div className="text-[10px] font-mono mt-1.5 flex gap-3">
                              <span style={{ color: p.color }}>chord {p.chord} mm</span>
                              <span className="text-brand-500">·</span>
                              <span style={{ color: p.color }}>span {p.span} mm</span>
                            </div>
                          </div>
                          <ChevronRight size={14} className="text-brand-600 group-hover:text-brand-400 transition-colors mt-1 flex-shrink-0" />
                        </div>
                      </button>
                    );
                  })}
                </div>
              </motion.div>

              {/* Dimension inputs */}
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                className="rounded-2xl border border-white/8 p-6 flex flex-col gap-5"
                style={{ background: 'rgba(0,0,0,0.28)' }}
              >
                <div>
                  <span className="text-xs font-mono tracking-widest text-brand-400 uppercase">Dimensions (mm)</span>
                  <p className="text-[11px] text-brand-500 mt-1">Override the preset values to match your exact requirements.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[
                    { label: 'Chord Length', hint: 'tip-to-trailing edge', value: chord, set: setChord, icon: '↔' },
                    { label: 'Span / Extrusion', hint: 'wing depth / thickness', value: span,  set: setSpan,  icon: '↕' },
                  ].map(({ label, hint, value, set, icon }) => (
                    <div key={label} className="flex flex-col gap-2">
                      <label className="text-[11px] font-mono text-brand-300 flex items-center gap-1.5">
                        <span className="text-brand-500">{icon}</span> {label}
                        <span className="text-brand-600 font-normal ml-1">({hint})</span>
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          min="1"
                          max="10000"
                          step="1"
                          value={value}
                          onChange={e => { set(e.target.value); setStatus('idle'); }}
                          className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 pr-12 text-white font-mono text-sm focus:outline-none focus:border-white/30 transition-colors"
                          style={{ caretColor: accentColor }}
                        />
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-brand-500 font-mono pointer-events-none">mm</span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Physical size preview */}
                <div
                  className="rounded-xl p-3 border flex flex-wrap gap-4 text-xs font-mono"
                  style={{ background: `${accentColor}08`, borderColor: `${accentColor}20` }}
                >
                  {[
                    { k: 'Chord',  v: `${parseFloat(chord) || 0} mm` },
                    { k: 'Span',   v: `${parseFloat(span)  || 0} mm` },
                    { k: 'Volume (est.)', v: `≈ ${((parseFloat(chord)||0) * 0.12 * (parseFloat(span)||0) / 1000).toFixed(1)} cm³` },
                  ].map(({ k, v }) => (
                    <div key={k} className="flex flex-col">
                      <span className="text-brand-500 uppercase tracking-widest" style={{ fontSize: 9 }}>{k}</span>
                      <span style={{ color: accentColor }} className="text-[13px] font-bold">{v}</span>
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* Error */}
              <AnimatePresence>
                {status === 'error' && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="flex items-start gap-3 p-4 rounded-xl border border-[var(--color-accent-pink)]/30 bg-[var(--color-accent-pink)]/8"
                  >
                    <AlertTriangle size={16} className="text-[var(--color-accent-pink)] mt-0.5 flex-shrink-0" />
                    <p className="text-[12px] text-[var(--color-accent-pink)] font-mono leading-relaxed">{errorMsg}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Footer */}
          <div className="flex-shrink-0 border-t border-white/5 px-8 py-5 flex items-center justify-between gap-4">
            <p className="text-[10px] text-brand-500 font-mono hidden sm:block">
              Binary STL · units in millimetres · ready to slice
            </p>

            <div className="flex items-center gap-3 ml-auto">
              <button
                onClick={onClose}
                className="px-5 py-2.5 rounded-xl text-xs font-mono tracking-wider text-brand-400 hover:text-white border border-white/10 hover:border-white/25 transition-all"
              >
                CANCEL
              </button>

              <motion.button
                onClick={generate}
                disabled={status === 'generating' || !activeShape?.airfoilData}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                className="relative px-7 py-2.5 rounded-xl text-xs font-bold tracking-widest uppercase overflow-hidden transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  background: status === 'done'
                    ? 'rgba(34,197,94,0.15)'
                    : `linear-gradient(135deg, ${accentColor}22, ${accentColor}0a)`,
                  border: `1px solid ${status === 'done' ? '#22c55e' : accentColor}`,
                  color: status === 'done' ? '#22c55e' : accentColor,
                  boxShadow: status === 'done'
                    ? '0 0 18px rgba(34,197,94,0.3)'
                    : `0 0 18px ${preset.glow}`,
                }}
              >
                {status === 'generating' ? (
                  <>
                    <svg className="animate-spin" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10" strokeOpacity="0.25" />
                      <path d="M12 2a10 10 0 0 1 10 10" />
                    </svg>
                    GENERATING…
                  </>
                ) : status === 'done' ? (
                  <>
                    <Check size={14} strokeWidth={2.5} />
                    DOWNLOADED!
                  </>
                ) : (
                  <>
                    <Download size={14} />
                    EXPORT STL
                  </>
                )}
              </motion.button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Export3DModal;
