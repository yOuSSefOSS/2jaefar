import React, { useRef, useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plane, RotateCcw } from 'lucide-react';

/**
 * Interactive 2D Flight Dynamics Mini-Simulator
 *
 * Uses the active airfoil's Cl/Cd coefficients to simulate a glider flight.
 * User controls pitch with Up/Down arrow keys.
 */

const GRAVITY = 9.81;
const AIR_DENSITY = 1.225;
const WING_AREA = 0.5;    // m²
const MASS = 2.5;         // kg
const LAUNCH_ALT = 200;   // m
const LAUNCH_SPEED = 25;  // m/s
const DT = 1 / 60;
const GROUND_Y = 0;

// Simple sky gradient colors
const SKY_TOP    = '#0a0e1a';
const SKY_BOTTOM = '#1a2744';
const GROUND_COLOR = '#1a3a1a';

const GliderSimModal = ({ show, onClose, cl, cd, airfoilName = 'AIRFOIL' }) => {
  const canvasRef = useRef(null);
  const stateRef = useRef(null);
  const keysRef = useRef({ up: false, down: false });
  const animRef = useRef(null);
  const [metrics, setMetrics] = useState({ dist: 0, alt: LAUNCH_ALT, speed: LAUNCH_SPEED, aoa: 0, status: 'flying' });
  const [bestDist, setBestDist] = useState(0);

  const baseCl = Math.max(0.1, cl || 0.8);
  const baseCd = Math.max(0.005, cd || 0.02);

  const resetSim = useCallback(() => {
    stateRef.current = {
      x: 0,
      y: LAUNCH_ALT,
      vx: LAUNCH_SPEED,
      vy: 0,
      pitch: 2,     // degrees
      time: 0,
      trail: [],
      status: 'flying',
    };
    setMetrics({ dist: 0, alt: LAUNCH_ALT, speed: LAUNCH_SPEED, aoa: 2, status: 'flying' });
  }, []);

  useEffect(() => {
    if (!show) return;
    resetSim();

    const handleKeyDown = (e) => {
      if (e.key === 'ArrowUp')   keysRef.current.up = true;
      if (e.key === 'ArrowDown') keysRef.current.down = true;
    };
    const handleKeyUp = (e) => {
      if (e.key === 'ArrowUp')   keysRef.current.up = false;
      if (e.key === 'ArrowDown') keysRef.current.down = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, [show, resetSim]);

  useEffect(() => {
    if (!show || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    const resize = () => {
      const rect = canvas.parentElement.getBoundingClientRect();
      canvas.width = rect.width * window.devicePixelRatio;
      canvas.height = rect.height * window.devicePixelRatio;
      canvas.style.width = rect.width + 'px';
      canvas.style.height = rect.height + 'px';
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    };
    resize();

    const W = () => canvas.width / window.devicePixelRatio;
    const H = () => canvas.height / window.devicePixelRatio;

    const loop = () => {
      const s = stateRef.current;
      if (!s) { animRef.current = requestAnimationFrame(loop); return; }

      // --- Physics ---
      if (s.status === 'flying') {
        // Pitch control
        if (keysRef.current.up)   s.pitch = Math.min(s.pitch + 90 * DT, 30);
        if (keysRef.current.down) s.pitch = Math.max(s.pitch - 90 * DT, -20);

        const speed = Math.hypot(s.vx, s.vy);
        const q = 0.5 * AIR_DENSITY * speed * speed;
        const pitchRad = s.pitch * Math.PI / 180;

        // Flight path angle
        const gamma = Math.atan2(s.vy, s.vx);
        // Angle of attack = pitch - flight path angle
        const aoa = s.pitch - (gamma * 180 / Math.PI);

        // Scale Cl/Cd with AoA relative to baseline
        // Simple thin-airfoil-like model: Cl scales linearly, Cd has parasitic + induced
        const clEff = baseCl * (aoa / 5);  // baseline Cl is at ~5 deg
        const cdEff = baseCd + 0.005 * clEff * clEff; // drag polar

        const lift = q * WING_AREA * clEff;
        const drag = q * WING_AREA * Math.max(0.005, cdEff);

        // Forces in world coordinates
        // Lift perpendicular to velocity, drag opposing velocity
        const vAngle = Math.atan2(s.vy, s.vx);
        const fx = -drag * Math.cos(vAngle) - lift * Math.sin(vAngle);
        const fy = -drag * Math.sin(vAngle) + lift * Math.cos(vAngle) - MASS * GRAVITY;

        s.vx += (fx / MASS) * DT;
        s.vy += (fy / MASS) * DT;

        // Clamp speed
        const newSpeed = Math.hypot(s.vx, s.vy);
        if (newSpeed > 80) {
          s.vx *= 80 / newSpeed;
          s.vy *= 80 / newSpeed;
        }

        s.x += s.vx * DT;
        s.y += s.vy * DT;
        s.time += DT;

        // Trail
        if (s.trail.length === 0 || Math.hypot(s.x - s.trail[s.trail.length - 1][0], s.y - s.trail[s.trail.length - 1][1]) > 3) {
          s.trail.push([s.x, s.y]);
          if (s.trail.length > 600) s.trail.shift();
        }

        // Ground collision
        if (s.y <= GROUND_Y) {
          s.y = GROUND_Y;
          s.vy = 0;
          s.vx = 0;
          s.status = 'landed';
          if (s.x > bestDist) setBestDist(s.x);
        }

        setMetrics({
          dist: s.x,
          alt: Math.max(0, s.y),
          speed: Math.hypot(s.vx, s.vy),
          aoa: aoa,
          status: s.status,
        });
      }

      // --- Render ---
      const w = W(), h = H();
      ctx.clearRect(0, 0, w, h);

      // Sky gradient
      const skyGrad = ctx.createLinearGradient(0, 0, 0, h);
      skyGrad.addColorStop(0, SKY_TOP);
      skyGrad.addColorStop(1, SKY_BOTTOM);
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, w, h);

      // Camera follows the glider
      const camX = s.x - w * 0.25;
      const camY = s.y - h * 0.5;
      const scale = 1.8; // pixels per metre

      const toScreenX = (wx) => (wx - camX) * scale;
      const toScreenY = (wy) => h - (wy - camY) * scale;

      // Stars (fixed)
      ctx.fillStyle = 'rgba(255,255,255,0.3)';
      for (let i = 0; i < 60; i++) {
        const sx = ((i * 137.5 + 50) % w);
        const sy = ((i * 73.7 + 30) % (h * 0.6));
        ctx.fillRect(sx, sy, 1.2, 1.2);
      }

      // Ground
      const groundScreenY = toScreenY(GROUND_Y);
      if (groundScreenY < h) {
        const gGrad = ctx.createLinearGradient(0, groundScreenY, 0, h);
        gGrad.addColorStop(0, '#2d5a2d');
        gGrad.addColorStop(0.3, GROUND_COLOR);
        gGrad.addColorStop(1, '#0a1a0a');
        ctx.fillStyle = gGrad;
        ctx.fillRect(0, groundScreenY, w, h - groundScreenY);

        // Ground line
        ctx.strokeStyle = '#4a8a4a';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(0, groundScreenY);
        ctx.lineTo(w, groundScreenY);
        ctx.stroke();
      }

      // Altitude markers
      ctx.fillStyle = 'rgba(255,255,255,0.08)';
      ctx.strokeStyle = 'rgba(255,255,255,0.06)';
      ctx.lineWidth = 1;
      ctx.font = '10px monospace';
      for (let alt = 50; alt <= 300; alt += 50) {
        const sy = toScreenY(alt);
        if (sy > 10 && sy < h - 20) {
          ctx.setLineDash([4, 8]);
          ctx.beginPath();
          ctx.moveTo(0, sy);
          ctx.lineTo(w, sy);
          ctx.stroke();
          ctx.setLineDash([]);
          ctx.fillText(`${alt}m`, 8, sy - 4);
        }
      }

      // Trail
      if (s.trail.length > 1) {
        ctx.beginPath();
        ctx.moveTo(toScreenX(s.trail[0][0]), toScreenY(s.trail[0][1]));
        for (let i = 1; i < s.trail.length; i++) {
          const alpha = i / s.trail.length;
          ctx.strokeStyle = `rgba(0, 240, 255, ${alpha * 0.5})`;
          ctx.lineWidth = 1 + alpha;
          ctx.lineTo(toScreenX(s.trail[i][0]), toScreenY(s.trail[i][1]));
        }
        ctx.stroke();
      }

      // Glider
      const gx = toScreenX(s.x);
      const gy = toScreenY(s.y);
      const pitchRad = -s.pitch * Math.PI / 180;

      ctx.save();
      ctx.translate(gx, gy);
      ctx.rotate(pitchRad);

      // Fuselage
      ctx.fillStyle = '#e2e8f0';
      ctx.beginPath();
      ctx.moveTo(18, 0);
      ctx.lineTo(-12, -3);
      ctx.lineTo(-14, 0);
      ctx.lineTo(-12, 3);
      ctx.closePath();
      ctx.fill();

      // Wing
      ctx.fillStyle = s.status === 'landed' ? '#ef4444' : '#00f0ff';
      ctx.beginPath();
      ctx.moveTo(6, -2);
      ctx.lineTo(-4, -14);
      ctx.lineTo(-8, -13);
      ctx.lineTo(-2, -2);
      ctx.closePath();
      ctx.fill();

      ctx.beginPath();
      ctx.moveTo(6, 2);
      ctx.lineTo(-4, 14);
      ctx.lineTo(-8, 13);
      ctx.lineTo(-2, 2);
      ctx.closePath();
      ctx.fill();

      // Tail
      ctx.fillStyle = '#94a3b8';
      ctx.beginPath();
      ctx.moveTo(-12, -3);
      ctx.lineTo(-16, -8);
      ctx.lineTo(-18, -7);
      ctx.lineTo(-14, -2);
      ctx.closePath();
      ctx.fill();

      ctx.beginPath();
      ctx.moveTo(-12, 3);
      ctx.lineTo(-16, 8);
      ctx.lineTo(-18, 7);
      ctx.lineTo(-14, 2);
      ctx.closePath();
      ctx.fill();

      // Glow
      if (s.status === 'flying') {
        ctx.shadowColor = '#00f0ff';
        ctx.shadowBlur = 12;
        ctx.fillStyle = 'rgba(0, 240, 255, 0.6)';
        ctx.beginPath();
        ctx.arc(18, 0, 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      ctx.restore();

      // Landing marker
      if (s.status === 'landed') {
        ctx.fillStyle = 'rgba(239, 68, 68, 0.15)';
        ctx.beginPath();
        ctx.arc(gx, groundScreenY, 30, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = '#ef4444';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(gx, groundScreenY - 35);
        ctx.lineTo(gx, groundScreenY + 5);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(gx - 6, groundScreenY - 28);
        ctx.lineTo(gx, groundScreenY - 35);
        ctx.lineTo(gx + 6, groundScreenY - 28);
        ctx.stroke();
      }

      animRef.current = requestAnimationFrame(loop);
    };

    animRef.current = requestAnimationFrame(loop);
    return () => { if (animRef.current) cancelAnimationFrame(animRef.current); };
  }, [show, baseCl, baseCd, bestDist]);

  if (!show) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4" onClick={onClose}>
        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.92, y: 20 }}
          transition={{ type: 'spring', damping: 22, stiffness: 280 }}
          className="premium-glass w-full max-w-4xl flex flex-col border border-[var(--color-accent-neon)]/20 shadow-[0_0_60px_rgba(0,240,255,0.1)] overflow-hidden"
          onClick={e => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-white/5">
            <div className="flex items-center gap-3 text-[var(--color-accent-neon)]">
              <Plane size={20} />
              <h2 className="text-base font-mono font-bold uppercase tracking-wider">Test Flight — {airfoilName}</h2>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={(e) => { e.stopPropagation(); resetSim(); }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-mono uppercase tracking-wider border border-white/15 text-brand-300 hover:bg-white/5 hover:text-white transition-colors"
              >
                <RotateCcw size={12} /> Restart
              </button>
              <button onClick={onClose} className="text-brand-400 hover:text-white transition-colors p-1">
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Canvas */}
          <div className="relative w-full" style={{ height: '380px' }}>
            <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />

            {/* Controls hint */}
            <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-sm rounded-lg px-3 py-2 border border-white/10">
              <div className="text-[9px] font-mono text-brand-400 uppercase tracking-widest mb-1">Controls</div>
              <div className="flex gap-3">
                <span className="text-[10px] font-mono text-white">↑ Pitch Up</span>
                <span className="text-[10px] font-mono text-white">↓ Pitch Down</span>
              </div>
            </div>

            {/* Landed overlay */}
            {metrics.status === 'landed' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="absolute inset-0 flex items-center justify-center bg-black/40 pointer-events-none"
              >
                <div className="text-center">
                  <div className="text-2xl font-mono font-bold text-white mb-1">LANDED</div>
                  <div className="text-lg font-mono text-[var(--color-accent-neon)]">{metrics.dist.toFixed(0)}m distance</div>
                  {bestDist > 0 && (
                    <div className="text-xs font-mono text-amber-300 mt-1">Best: {bestDist.toFixed(0)}m</div>
                  )}
                </div>
              </motion.div>
            )}
          </div>

          {/* Telemetry */}
          <div className="grid grid-cols-5 gap-0 border-t border-white/5">
            {[
              { label: 'Distance',  value: `${metrics.dist.toFixed(0)}m`,  color: 'var(--color-accent-neon)' },
              { label: 'Altitude',  value: `${metrics.alt.toFixed(1)}m`,   color: 'var(--color-accent-blue)' },
              { label: 'Airspeed',  value: `${metrics.speed.toFixed(1)} m/s`, color: '#a78bfa' },
              { label: 'AoA',       value: `${metrics.aoa.toFixed(1)}°`,   color: 'var(--color-accent-pink)' },
              { label: 'Cl / Cd',   value: `${baseCl.toFixed(2)} / ${baseCd.toFixed(3)}`, color: '#fbbf24' },
            ].map((m, i) => (
              <div key={i} className="flex flex-col items-center justify-center py-3 border-r border-white/5 last:border-r-0">
                <div className="text-[9px] font-mono text-brand-500 uppercase tracking-widest">{m.label}</div>
                <div className="text-sm font-mono font-bold mt-0.5" style={{ color: m.color }}>{m.value}</div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default GliderSimModal;
