import React, { useEffect, useRef, useMemo, useState, Suspense } from 'react';
import { motion, useSpring, useMotionValue, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { useGLTF, Float } from '@react-three/drei';
import * as THREE from 'three';
import { ArrowRight, Wind, Globe, BookOpen, Lightbulb, ChevronDown } from 'lucide-react';
import logoUrl from '../assets/logo.png';

// ─────────────────────────────────────────────
//  SHARED MOUSE STORE – updated via DOM events
//  so BOTH the CSS layer and Three.js share it
// ─────────────────────────────────────────────
const mouse = { x: 0, y: 0, nx: 0, ny: 0 }; // raw px + normalised -1..1

// ─────────────────────────────────────────────
//  THREE.JS: PARTICLE WIND FIELD
//  Fills the entire viewport. Particles stream
//  left→right and repel from the mouse cursor.
// ─────────────────────────────────────────────
const COUNT = 5000;
const SPREAD_X = 30;
const SPREAD_Y = 18;

function ParticleField() {
  const geoRef = useRef();
  const { size, camera } = useThree();

  // Initial buffer data
  const [positions, velocities, colors] = useMemo(() => {
    const pos = new Float32Array(COUNT * 3);
    const vel = new Float32Array(COUNT * 3);
    const col = new Float32Array(COUNT * 3);
    const c1 = new THREE.Color('#00f0ff');
    const c2 = new THREE.Color('#ec4899');
    const c3 = new THREE.Color('#7c3aed');
    const palette = [c1, c2, c3];
    for (let i = 0; i < COUNT; i++) {
      pos[i * 3]     = (Math.random() - 0.5) * SPREAD_X * 2;
      pos[i * 3 + 1] = (Math.random() - 0.5) * SPREAD_Y * 2;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 4;
      vel[i * 3]     = 0.03 + Math.random() * 0.04; // base rightward drift
      vel[i * 3 + 1] = (Math.random() - 0.5) * 0.005;
      const chosen = palette[Math.floor(Math.random() * palette.length)];
      col[i * 3]     = chosen.r;
      col[i * 3 + 1] = chosen.g;
      col[i * 3 + 2] = chosen.b;
    }
    return [pos, vel, col];
  }, []);

  useFrame((state) => {
    if (!geoRef.current) return;
    const pos = geoRef.current.attributes.position.array;
    const t = state.clock.elapsedTime;

    // Convert mouse normalised coords to world space
    const aspect = size.width / size.height;
    const vFov = THREE.MathUtils.degToRad((camera).fov);
    const h = 2 * Math.tan(vFov / 2) * camera.position.z;
    const w = h * aspect;
    const mx = mouse.nx * w * 0.5;
    const my = mouse.ny * h * 0.5;

    for (let i = 0; i < COUNT; i++) {
      const i3 = i * 3;
      let px = pos[i3];
      let py = pos[i3 + 1];

      // Advance wind
      px += velocities[i3] + Math.sin(t * 0.4 + py * 0.6) * 0.008;
      py += velocities[i3 + 1] + Math.cos(t * 0.3 + px * 0.4) * 0.005;

      // Mouse repulsion
      const dx = px - mx;
      const dy = py - my;
      const distSq = dx * dx + dy * dy;
      const repulseR = 4;
      if (distSq < repulseR * repulseR && distSq > 0.0001) {
        const dist = Math.sqrt(distSq);
        const force = ((repulseR - dist) / repulseR) * 0.25;
        px += (dx / dist) * force;
        py += (dy / dist) * force;
      }

      // Loop left→right
      if (px > SPREAD_X) px = -SPREAD_X;
      if (px < -SPREAD_X) px = SPREAD_X;
      if (py > SPREAD_Y) py = -SPREAD_Y;
      if (py < -SPREAD_Y) py = SPREAD_Y;

      pos[i3]     = px;
      pos[i3 + 1] = py;
    }
    geoRef.current.attributes.position.needsUpdate = true;
  });

  return (
    <points>
      <bufferGeometry ref={geoRef}>
        <bufferAttribute attach="attributes-position" count={COUNT} array={positions} itemSize={3} />
        <bufferAttribute attach="attributes-color"    count={COUNT} array={colors}    itemSize={3} />
      </bufferGeometry>
      <pointsMaterial
        size={0.06}
        vertexColors
        transparent
        opacity={0.7}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
        sizeAttenuation
      />
    </points>
  );
}

// ─────────────────────────────────────────────
//  THREE.JS: AIRPLANE MODEL
//  Bright holographic cyan. Banks with mouse.
// ─────────────────────────────────────────────
function AirplaneModel() {
  const { scene } = useGLTF('/models/airplane/scene.gltf');
  const groupRef = useRef();
  const pulseLightRef = useRef();
  const rimLightRef = useRef();

  // Override every mesh to a vivid holographic material
  useMemo(() => {
    scene.traverse((child) => {
      if (child.isMesh) {
        child.material = new THREE.MeshStandardMaterial({
          color: new THREE.Color('#0a1f3a'),       // dark base
          emissive: new THREE.Color('#00f0ff'),    // bright cyan glow
          emissiveIntensity: 2.5,                  // crank it up!
          metalness: 1.0,
          roughness: 0.05,
          transparent: false,
        });
        child.castShadow = false;
        child.receiveShadow = false;
      }
    });
  }, [scene]);

  useFrame((state) => {
    if (!groupRef.current) return;
    const t = state.clock.elapsedTime;

    // Bank gently toward mouse
    groupRef.current.rotation.x = THREE.MathUtils.lerp(
      groupRef.current.rotation.x,
      0.15 + mouse.ny * 0.45,
      0.05
    );
    groupRef.current.rotation.z = THREE.MathUtils.lerp(
      groupRef.current.rotation.z,
      -mouse.nx * 0.4,
      0.05
    );
    groupRef.current.position.y = Math.sin(t * 0.9) * 0.12;

    // Pulse the underlight
    if (pulseLightRef.current) {
      pulseLightRef.current.intensity = 3 + Math.sin(t * 2) * 1.5;
    }
    // Rim light colour cycles cyan → pink
    if (rimLightRef.current) {
      const hue = (Math.sin(t * 0.3) * 0.5 + 0.5);
      rimLightRef.current.color.setHSL(0.53 + hue * 0.28, 1, 0.6);
    }
  });

  return (
    <group ref={groupRef}>
      {/* Pulsing cyan underlight */}
      <pointLight ref={pulseLightRef} position={[0, -1, 1]} color="#00f0ff" intensity={4} distance={12} />
      {/* Rim light – cycles hue */}
      <pointLight ref={rimLightRef} position={[-3, 2, -2]} color="#ec4899" intensity={3} distance={10} />
      {/* Top fill */}
      <pointLight position={[3, 3, 3]} color="#ffffff" intensity={1.5} distance={15} />
      <primitive object={scene} scale={2.2} rotation={[0.18, -0.9, 0]} />
    </group>
  );
}

// ─────────────────────────────────────────────
//  CURSOR GLOW – pure CSS, follows mouse
// ─────────────────────────────────────────────
function CursorGlow() {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 120, damping: 18 });
  const springY = useSpring(y, { stiffness: 120, damping: 18 });

  useEffect(() => {
    const move = (e) => { x.set(e.clientX); y.set(e.clientY); };
    window.addEventListener('mousemove', move);
    return () => window.removeEventListener('mousemove', move);
  }, [x, y]);

  return (
    <motion.div
      className="fixed pointer-events-none z-50 rounded-full"
      style={{
        width: 400,
        height: 400,
        x: springX,
        y: springY,
        translateX: '-50%',
        translateY: '-50%',
        background: 'radial-gradient(circle, rgba(0,240,255,0.12) 0%, rgba(236,72,153,0.05) 40%, transparent 70%)',
      }}
    />
  );
}

// ─────────────────────────────────────────────
//  GLOW CARD – hover springs + border glow
// ─────────────────────────────────────────────
function GlowCard({ children, color = '#00f0ff', className = '' }) {
  const [hovered, setHovered] = useState(false);
  return (
    <motion.div
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      whileHover={{ y: -6, scale: 1.02 }}
      transition={{ type: 'spring', stiffness: 300, damping: 22 }}
      className={`relative rounded-2xl p-6 border backdrop-blur-xl overflow-hidden cursor-default ${className}`}
      style={{
        background: 'rgba(11,16,30,0.75)',
        borderColor: hovered ? color : 'rgba(255,255,255,0.07)',
        boxShadow: hovered ? `0 0 30px ${color}33, 0 0 0 1px ${color}55` : 'none',
        transition: 'border-color 0.3s, box-shadow 0.3s',
      }}
    >
      {/* Inner shimmer */}
      <AnimatePresence>
        {hovered && (
          <motion.div
            key="shimmer"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 pointer-events-none"
            style={{
              background: `radial-gradient(circle at 50% 0%, ${color}18 0%, transparent 70%)`,
            }}
          />
        )}
      </AnimatePresence>
      {children}
    </motion.div>
  );
}

// ─────────────────────────────────────────────
//  ANIMATION VARIANTS
// ─────────────────────────────────────────────
const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] } },
};
const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.15 } },
};

// ─────────────────────────────────────────────
//  NAVBAR
// ─────────────────────────────────────────────
const NavBar = () => (
  <header className="fixed top-0 left-0 right-0 z-50 h-16 flex items-center justify-between px-6 lg:px-12 bg-[#0b101e]/70 backdrop-blur-2xl border-b border-white/5">
    <Link to="/" className="flex items-center gap-3">
      <img src={logoUrl} alt="Vortex-Gen" className="h-8 w-auto object-contain" />
      <span className="font-bold text-lg tracking-wide text-white">Vortex-Gen</span>
    </Link>
    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.96 }}>
      <Link
        to="/explore"
        className="px-5 py-2 rounded-full text-sm font-bold text-[#020617]"
        style={{ background: 'linear-gradient(135deg,#00f0ff,#0ea5e9)', boxShadow: '0 0 20px rgba(0,240,255,0.4)' }}
      >
        Open Platform
      </Link>
    </motion.div>
  </header>
);

// ─────────────────────────────────────────────
//  HERO – airplane canvas lives here
// ─────────────────────────────────────────────
const HeroSection = () => (
  <section className="relative min-h-screen flex items-center pt-16 px-6 lg:px-20 overflow-hidden">
    {/* Airplane Canvas – right half */}
    <div className="absolute right-0 top-0 bottom-0 w-full lg:w-[60%] z-0">
      <Canvas camera={{ position: [0, 0, 8], fov: 50 }}>
        <ambientLight intensity={0.2} />
        <pointLight position={[5, 5, 5]} intensity={3} color="#00f0ff" />
        <pointLight position={[-5, -2, 3]} intensity={2} color="#ec4899" />
        <Suspense fallback={null}>
          <Float speed={2.5} rotationIntensity={0.3} floatIntensity={0.6}>
            <AirplaneModel />
          </Float>
        </Suspense>
      </Canvas>
    </div>

    {/* Text overlay – left */}
    <motion.div
      initial="hidden"
      animate="visible"
      variants={stagger}
      className="relative z-10 max-w-xl"
    >
      <motion.div
        variants={fadeUp}
        className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#ec4899]/10 border border-[#ec4899]/30 text-[#ec4899] text-xs font-bold tracking-widest uppercase mb-8"
      >
        <span className="w-2 h-2 rounded-full bg-[#ec4899] animate-pulse" />
        Interactive Pitch Deck
      </motion.div>

      <motion.h1
        variants={fadeUp}
        className="text-6xl lg:text-8xl font-black text-white mb-6 leading-[0.95] tracking-tight"
      >
        Bridging<br />
        <span className="text-transparent bg-clip-text" style={{ backgroundImage: 'linear-gradient(135deg,#00f0ff,#38bdf8)' }}>
          Theory
        </span>
        <br />&amp;{' '}
        <span className="text-transparent bg-clip-text" style={{ backgroundImage: 'linear-gradient(135deg,#ec4899,#f59e0b)' }}>
          Simulation
        </span>
      </motion.h1>

      <motion.p variants={fadeUp} className="text-lg text-[#94a3b8] leading-relaxed mb-10">
        An interactive aerodynamics platform. Move your mouse — the wind reacts.
        Hover the aircraft to bank it. Scroll to explore.
      </motion.p>

      <motion.div variants={fadeUp} className="flex flex-wrap gap-3 text-sm">
        <div className="px-5 py-2.5 rounded-full bg-[#0b101e]/90 border border-[#00f0ff]/30 text-white flex gap-2 items-center shadow-[0_0_20px_rgba(0,240,255,0.15)]">
          <span className="text-[#00f0ff] font-bold">Creator:</span> Youssef Hegazy
        </div>
        <a
          href="mailto:vortexgen@duck.com"
          className="px-5 py-2.5 rounded-full bg-[#0b101e]/90 border border-[#ec4899]/30 text-white flex gap-2 items-center hover:border-[#ec4899] hover:shadow-[0_0_20px_rgba(236,72,153,0.3)] transition-all"
        >
          <span className="text-[#ec4899] font-bold">Contact:</span> vortexgen@duck.com
        </a>
      </motion.div>

      {/* Scroll cue */}
      <motion.div
        variants={fadeUp}
        className="absolute bottom-8 left-0 flex flex-col items-center gap-2 text-[#334155] text-xs tracking-widest"
        animate={{ y: [0, 8, 0] }}
        transition={{ repeat: Infinity, duration: 2 }}
      >
        <ChevronDown size={20} />
        Scroll to explore
      </motion.div>
    </motion.div>
  </section>
);

// ─────────────────────────────────────────────
//  SECTION WRAPPER
// ─────────────────────────────────────────────
const Section = ({ children, className = '' }) => (
  <motion.section
    initial="hidden"
    whileInView="visible"
    viewport={{ once: true, margin: '-80px' }}
    variants={stagger}
    className={`min-h-screen flex flex-col justify-center px-6 lg:px-20 py-28 ${className}`}
  >
    <div className="max-w-6xl mx-auto w-full relative z-10">{children}</div>
  </motion.section>
);

// ─────────────────────────────────────────────
//  WHAT WE DO
// ─────────────────────────────────────────────
const WhatWeDoSection = () => (
  <Section>
    <motion.div variants={stagger} className="grid lg:grid-cols-2 gap-16 items-center">
      <div>
        <motion.p variants={fadeUp} className="text-[#ec4899] font-mono tracking-widest uppercase text-xs mb-4">What We Do</motion.p>
        <motion.h2 variants={fadeUp} className="text-5xl font-black text-white mb-6 leading-tight">
          Democratizing<br />
          <span className="text-transparent bg-clip-text" style={{ backgroundImage: 'linear-gradient(90deg,#00f0ff,#38bdf8)' }}>
            Aerospace
          </span>
        </motion.h2>
        <motion.p variants={fadeUp} className="text-[#94a3b8] text-lg leading-relaxed mb-5">
          Vortex-Gen tears down the "Invisible Wall" of aerospace learning. Instead of isolating complex math from physical reality, we merge them into an intuitive, visually stunning experience.
        </motion.p>
        <motion.p variants={fadeUp} className="text-[#94a3b8] text-lg leading-relaxed">
          Students travel a direct path from <strong className="text-white">textbook theory</strong> straight into a{' '}
          <strong className="text-[#00f0ff]">real-time physics laboratory</strong> — all inside the browser.
        </motion.p>
      </div>

      <motion.div variants={stagger} className="grid grid-cols-2 gap-4">
        {[
          { icon: BookOpen,  title: 'Theory & Explorer', desc: 'Interactive 3D models explain every aircraft part.', color: '#00f0ff' },
          { icon: Wind,      title: 'Wind Tunnel Lab',   desc: 'AI simulations predict lift and drag in milliseconds.', color: '#ec4899' },
          { icon: Lightbulb, title: 'Instant Feedback',  desc: 'Change any variable — see the physics react live.', color: '#f59e0b' },
          { icon: Globe,     title: 'Browser-Based',     desc: 'No supercomputers. Runs anywhere, instantly.', color: '#38bdf8' },
        ].map((item) => (
          <GlowCard key={item.title} color={item.color}>
            <item.icon style={{ color: item.color }} className="mb-4" size={28} />
            <h4 className="text-white font-bold mb-1 text-sm">{item.title}</h4>
            <p className="text-xs text-[#64748b] leading-relaxed">{item.desc}</p>
          </GlowCard>
        ))}
      </motion.div>
    </motion.div>
  </Section>
);

// ─────────────────────────────────────────────
//  ANATOMY OF FLIGHT
// ─────────────────────────────────────────────
const AnatomySection = () => (
  <Section>
    <motion.p variants={fadeUp} className="text-[#00f0ff] font-mono tracking-widest uppercase text-xs mb-4">Anatomy of Flight</motion.p>
    <motion.h2 variants={fadeUp} className="text-5xl font-black text-white mb-6 leading-tight max-w-2xl">
      Understanding the Parts
    </motion.h2>
    <motion.p variants={fadeUp} className="text-[#94a3b8] text-lg leading-relaxed mb-14 max-w-2xl">
      Before you can simulate airflow, you must understand what the air is interacting with.
      Our Explorer module breaks every aircraft into 4 critical zones — each with physics-based explanations.
    </motion.p>

    <motion.div variants={stagger} className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
      {[
        { num: '01', title: 'Fuselage',       desc: 'The main body. Balances passenger volume against aerodynamic drag.', color: '#ec4899' },
        { num: '02', title: 'Wings / Airfoil',desc: 'The source of lift. Camber and angle of attack control efficiency.', color: '#00f0ff' },
        { num: '03', title: 'Empennage',      desc: 'Tail section. Elevators control pitch; the rudder controls yaw.',    color: '#f59e0b' },
        { num: '04', title: 'Engines',        desc: 'Turbofans compress air, mix fuel, and ignite to generate thrust.',   color: '#38bdf8' },
      ].map((part) => (
        <GlowCard key={part.title} color={part.color}>
          <p className="text-4xl font-black opacity-10 absolute top-4 right-5" style={{ color: part.color }}>{part.num}</p>
          <h4 className="text-lg font-black mb-3 mt-1" style={{ color: part.color }}>{part.title}</h4>
          <p className="text-sm text-[#94a3b8] leading-relaxed">{part.desc}</p>
        </GlowCard>
      ))}
    </motion.div>
  </Section>
);

// ─────────────────────────────────────────────
//  THEORY → PRACTICE
// ─────────────────────────────────────────────
const TransitionSection = () => (
  <Section className="bg-gradient-to-br from-[#00f0ff]/5 via-transparent to-[#ec4899]/5 border-y border-white/5">
    <motion.div variants={stagger} className="max-w-4xl mx-auto text-center">
      <motion.div
        variants={fadeUp}
        className="w-16 h-16 mx-auto rounded-2xl flex items-center justify-center mb-8 border border-[#00f0ff]/40"
        style={{ background: 'rgba(0,240,255,0.1)', boxShadow: '0 0 40px rgba(0,240,255,0.25)' }}
      >
        <ArrowRight className="text-[#00f0ff]" size={28} />
      </motion.div>

      <motion.p variants={fadeUp} className="text-[#00f0ff] font-mono tracking-widest uppercase text-xs mb-4">The Bridge</motion.p>
      <motion.h2 variants={fadeUp} className="text-5xl font-black text-white mb-6">
        From Theory to Practice
      </motion.h2>
      <motion.p variants={fadeUp} className="text-[#94a3b8] text-xl leading-relaxed mb-12">
        Reading about Angle of Attack is one thing. Watching it cause a real wing to stall in live simulation is another.
      </motion.p>

      {/* Step flow */}
      <motion.div variants={stagger} className="grid sm:grid-cols-3 gap-4 mb-12 text-left">
        {[
          { step: '1', label: 'Learn', desc: 'Study the Airfoil in the 3D Explorer. Rotate it, inspect the geometry, read the physics.', color: '#00f0ff' },
          { step: '2', label: 'Simulate', desc: 'Click "Send to Lab". The exact shape is instantly imported into the Wind Tunnel.', color: '#ec4899' },
          { step: '3', label: 'Iterate', desc: 'Adjust speed, angle, density. Watch Lift (Cl) and Drag (Cd) change in real-time.', color: '#f59e0b' },
        ].map((s) => (
          <GlowCard key={s.step} color={s.color}>
            <p className="text-4xl font-black mb-3 opacity-20" style={{ color: s.color }}>{s.step}</p>
            <h4 className="text-white font-black text-lg mb-2" style={{ color: s.color }}>{s.label}</h4>
            <p className="text-sm text-[#94a3b8] leading-relaxed">{s.desc}</p>
          </GlowCard>
        ))}
      </motion.div>
    </motion.div>
  </Section>
);

// ─────────────────────────────────────────────
//  WIND TUNNEL
// ─────────────────────────────────────────────
const WindTunnelSection = () => (
  <Section>
    <motion.div variants={stagger} className="grid lg:grid-cols-2 gap-16 items-center">
      <GlowCard color="#00f0ff" className="lg:order-2">
        <motion.p variants={fadeUp} className="text-[#ec4899] font-mono tracking-widest uppercase text-xs mb-4">The Lab</motion.p>
        <motion.h2 variants={fadeUp} className="text-4xl font-black text-white mb-6">Live AI Simulation</motion.h2>
        <motion.p variants={fadeUp} className="text-[#94a3b8] text-lg leading-relaxed mb-8">
          The heart of Vortex-Gen is the Wind Tunnel. By leveraging{' '}
          <strong className="text-[#00f0ff]">NeuralFoil</strong>, an advanced ML model, we bypass
          hours of traditional CFD computation.
        </motion.p>
        <ul className="space-y-3">
          {[
            'Real-Time Streamline Flow Visualization',
            'Live Drag (Cd) and Lift (Cl) Metrics',
            'Custom .DAT Airfoil File Importing',
            'Altitude &amp; Density Environment Presets',
          ].map((item, i) => (
            <li key={i} className="flex items-center gap-3 text-[#e2e8f0] text-sm">
              <div className="w-2 h-2 rounded-full bg-[#ec4899] shrink-0" />
              <span dangerouslySetInnerHTML={{ __html: item }} />
            </li>
          ))}
        </ul>
      </GlowCard>

      <motion.div variants={fadeUp} className="lg:order-1 space-y-5">
        <p className="text-[#00f0ff] font-mono tracking-widest uppercase text-xs">Powered by AI</p>
        <h2 className="text-5xl font-black text-white leading-tight">
          NeuralFoil<br />
          <span className="text-transparent bg-clip-text" style={{ backgroundImage: 'linear-gradient(90deg,#ec4899,#f59e0b)' }}>
            Under the Hood
          </span>
        </h2>
        <p className="text-[#94a3b8] text-lg leading-relaxed">
          Traditional Computational Fluid Dynamics can take <strong className="text-white">hours per simulation</strong>.
          NeuralFoil is a neural-network surrogate model trained on millions of airfoil datasets —
          delivering results in <strong className="text-[#00f0ff]">milliseconds</strong>.
        </p>
        {[
          { label: 'Accuracy vs CFD', pct: 96 },
          { label: 'Speed Improvement', pct: 99 },
          { label: 'Browser Compatibility', pct: 100 },
        ].map(({ label, pct }) => (
          <div key={label}>
            <div className="flex justify-between text-sm text-[#64748b] mb-1">
              <span>{label}</span><span className="text-[#00f0ff]">{pct}%</span>
            </div>
            <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
              <motion.div
                className="h-full rounded-full"
                style={{ background: 'linear-gradient(90deg,#00f0ff,#38bdf8)' }}
                initial={{ width: 0 }}
                whileInView={{ width: `${pct}%` }}
                transition={{ duration: 1.2, ease: 'easeOut', delay: 0.2 }}
                viewport={{ once: true }}
              />
            </div>
          </div>
        ))}
      </motion.div>
    </motion.div>
  </Section>
);

// ─────────────────────────────────────────────
//  CONCLUSION CTA
// ─────────────────────────────────────────────
const ConclusionSection = () => (
  <Section className="text-center border-t border-white/5">
    <motion.div variants={stagger} className="max-w-3xl mx-auto">
      <motion.p variants={fadeUp} className="text-[#00f0ff] font-mono tracking-widest uppercase text-xs mb-6">Ready to Experience It?</motion.p>
      <motion.h2 variants={fadeUp} className="text-5xl lg:text-6xl font-black text-white mb-8 leading-tight">
        The Future of Engineering Education{' '}
        <span className="text-transparent bg-clip-text" style={{ backgroundImage: 'linear-gradient(90deg,#00f0ff,#ec4899)' }}>
          is Here
        </span>
      </motion.h2>
      <motion.p variants={fadeUp} className="text-xl text-[#94a3b8] leading-relaxed mb-12">
        From high-school students to university researchers — invisible aerodynamic forces are finally visible, interactive, and beautiful.
      </motion.p>
      <motion.div variants={fadeUp} className="flex flex-wrap gap-4 justify-center">
        <motion.div whileHover={{ scale: 1.06 }} whileTap={{ scale: 0.97 }}>
          <Link
            to="/explore"
            className="inline-flex items-center gap-3 px-10 py-5 rounded-full text-lg font-black text-[#020617]"
            style={{ background: 'linear-gradient(135deg,#00f0ff,#0ea5e9)', boxShadow: '0 10px 50px rgba(0,240,255,0.45)' }}
          >
            Enter the Platform <ArrowRight size={22} />
          </Link>
        </motion.div>
        <motion.div whileHover={{ scale: 1.06 }} whileTap={{ scale: 0.97 }}>
          <a
            href="mailto:vortexgen@duck.com"
            className="inline-flex items-center gap-3 px-10 py-5 rounded-full text-lg font-bold text-white border border-white/20 hover:border-[#ec4899]/60 transition-colors"
            style={{ background: 'rgba(11,16,30,0.8)' }}
          >
            Get in Touch
          </a>
        </motion.div>
      </motion.div>
    </motion.div>
  </Section>
);

// ─────────────────────────────────────────────
//  ROOT PAGE
// ─────────────────────────────────────────────
export default function Pitch() {
  useEffect(() => {
    document.title = 'Pitch Deck — Vortex-Gen';

    // Populate shared mouse store for Three.js (in normalized -1..1 space)
    const onMove = (e) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
      mouse.nx = (e.clientX / window.innerWidth) * 2 - 1;
      mouse.ny = -((e.clientY / window.innerHeight) * 2 - 1);
    };
    window.addEventListener('mousemove', onMove, { passive: true });
    return () => window.removeEventListener('mousemove', onMove);
  }, []);

  return (
    <div className="bg-[#0b101e] h-screen overflow-y-auto overflow-x-hidden text-white relative">
      {/* CSS cursor glow */}
      <CursorGlow />

      {/* Global particle canvas – fixed behind everything */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <Canvas camera={{ position: [0, 0, 12], fov: 65 }}>
          <ParticleField />
        </Canvas>
      </div>

      {/* Page content */}
      <div className="relative z-10">
        <NavBar />
        <HeroSection />
        <WhatWeDoSection />
        <AnatomySection />
        <TransitionSection />
        <WindTunnelSection />
        <ConclusionSection />

        <footer className="py-8 text-center text-[#475569] text-sm border-t border-white/5 bg-[#0b101e]">
          <p>© {new Date().getFullYear()} Vortex-Gen · Youssef Hegazy · vortexgen@duck.com</p>
        </footer>
      </div>
    </div>
  );
}
