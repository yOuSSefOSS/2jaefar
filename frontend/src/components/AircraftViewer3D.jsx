import React, { Suspense, useState, useRef, useCallback, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, useGLTF, Html, Environment, ContactShadows } from '@react-three/drei';
import { motion, AnimatePresence } from 'framer-motion';
import * as THREE from 'three';
import { ChevronRight, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { SkeletonViewer } from './Skeleton';

// ── Zone Definitions ──────────────────────────────────────────────────────────
const ZONES = [
  {
    id: 'fuselage',
    label: 'Fuselage',
    color: '#38bdf8',
    link: '/explore/fuselage',
    description: 'The main structural body — a semi-monocoque pressure vessel that houses passengers, cargo, cockpit, and avionics.',
    facts: ['Withstands ~8.6 psi pressurization', 'Semi-monocoque structure', 'Houses cockpit & cabin'],
    // Position classifier: center, medium Z spread
    test: (center, size) => Math.abs(center.x) < size.x * 0.3 && size.z > size.x,
  },
  {
    id: 'wings',
    label: 'Wings',
    color: '#a78bfa',
    link: '/explore/wings',
    description: 'Airfoil-shaped surfaces that generate lift via pressure differential. Also store fuel and carry engines.',
    facts: ['Generate ~95% of total lift', 'Store Jet-A fuel', 'House flaps, slats, ailerons'],
    test: (center, size) => Math.abs(center.x) > size.x * 0.15 && size.x > size.z * 0.5,
  },
  {
    id: 'engines',
    label: 'Engines',
    color: '#fb923c',
    link: '/explore/engines',
    description: 'High-bypass turbofan engines producing thrust via the Brayton cycle. Bypass air provides most of the thrust at cruise.',
    facts: ['High-bypass turbofan', 'BPR 5:1 to 12:1', 'FADEC controlled'],
    test: (center, size) => Math.abs(center.x) > size.x * 0.1 && center.y < 0 && size.x < size.z * 2,
  },
  {
    id: 'tail',
    label: 'Tail Section',
    color: '#22c55e',
    link: '/explore/tail',
    description: 'The empennage — horizontal and vertical stabilizers that provide pitch, yaw, and roll authority.',
    facts: ['Horizontal + vertical stabilizers', 'Elevator & rudder surfaces', 'Sets static margin'],
    test: (center, size) => false, // fallback — assigned by elimination
  },
];

// ── Classify a point in 3D space to a zone ──────────────────────────────────
const classifyPoint = (p) => {
  // Tail: Far back on the X axis (user provided X: 2.09)
  if (p.x > 1.2) return 'tail';
  
  // Engines: Forward on X (user provided X: -0.70) and spread on Z (user provided Z: 0.71)
  if (p.x < -0.3 && Math.abs(p.z) > 0.4) return 'engines';
  
  // Wings: Center X, spread on Z (user provided Z: 0.57)
  if (Math.abs(p.z) > 0.35) return 'wings';
  
  // Fuselage: Everything else in the center body
  return 'fuselage';
};

// ── 3D Model Scene ────────────────────────────────────────────────────────────
const AircraftModel = ({ onHover, onSelect, selectedZone, hoveredZone }) => {
  const gltf = useGLTF('/dairplane.glb');
  const modelRef = useRef();
  const { camera } = useThree();
  const meshZoneMap = useRef(new Map());

  // One-time setup: build zone map & center model
  useEffect(() => {
    if (!gltf.scene) return;

    // Compute model bounding box
    const modelBox = new THREE.Box3().setFromObject(gltf.scene);
    const modelSize = new THREE.Vector3();
    const modelCenter = new THREE.Vector3();
    modelBox.getSize(modelSize);
    modelBox.getCenter(modelCenter);

    // Center and scale (Larger size)
    gltf.scene.position.sub(modelCenter);
    const maxDim = Math.max(modelSize.x, modelSize.y, modelSize.z);
    const scale = 5.0 / maxDim;
    gltf.scene.scale.setScalar(scale);

    // We no longer pre-classify meshes because the model is grouped by materials, not logical parts.
    // Emissive highlighting is removed from the mesh traversal to prevent the entire plane from glowing.
    gltf.scene.traverse((child) => {
      if (child.isMesh) {
        child.userData.originalMaterial = child.material.clone();
      }
    });
  }, [gltf]);

  // A local state to track the exact 3D point the user is hovering over
  const [hoverPoint, setHoverPoint] = useState(null);

  // Idle rotation removed as per request
  const orbitRef = useRef();

  return (
    <group ref={modelRef}>
      {/* Orange scanner light that follows the mouse to highlight the hovered area */}
      {hoverPoint && (
        <pointLight 
          position={[hoverPoint.x, hoverPoint.y + 0.5, hoverPoint.z]} 
          distance={3} 
          intensity={5} 
          color="#ff8c00" 
        />
      )}
      
      <primitive
        object={gltf.scene}
        onPointerMove={(e) => {
          e.stopPropagation();
          setHoverPoint(e.point);

          const zone = classifyPoint(e.point);
          if (zone) { 
            document.body.style.cursor = 'pointer'; 
            onHover(zone); 
          }
        }}
        onPointerOut={() => { 
          document.body.style.cursor = 'default'; 
          setHoverPoint(null);
          onHover(null); 
        }}
        onClick={(e) => {
          e.stopPropagation();
          const zone = classifyPoint(e.point);
          if (zone) onSelect(zone);
        }}
      />
    </group>
  );
};

// Removed ZonePopup component

// ── Zone Indicator Pills ──────────────────────────────────────────────────────
const ZoneIndicators = ({ onHover, onSelect, hoveredZone }) => (
  <div style={{
    position: 'absolute', top: 16, right: 16, zIndex: 30,
    display: 'flex', flexDirection: 'column', gap: 6,
  }}>
    {ZONES.map(zone => (
      <motion.button
        key={zone.id}
        onMouseEnter={() => onHover(zone.id)}
        onMouseLeave={() => onHover(null)}
        onClick={() => onSelect(zone.id)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        style={{
          display: 'flex', alignItems: 'center', gap: 7,
          padding: '5px 10px', borderRadius: 20, cursor: 'pointer', border: 'none',
          background: hoveredZone === zone.id ? `${zone.color}20` : 'rgba(255,255,255,0.04)',
          border: `1px solid ${hoveredZone === zone.id ? zone.color + '50' : 'rgba(255,255,255,0.08)'}`,
          transition: 'all 0.2s',
        }}
      >
        <div style={{ width: 7, height: 7, borderRadius: '50%', background: zone.color }} />
        <span style={{ fontFamily: 'monospace', fontSize: 10, fontWeight: 700, letterSpacing: '0.08em', color: hoveredZone === zone.id ? zone.color : 'rgba(255,255,255,0.5)', textTransform: 'uppercase' }}>
          {zone.label}
        </span>
      </motion.button>
    ))}
  </div>
);

// ── Main Component ────────────────────────────────────────────────────────────
const AircraftViewer3D = ({ onZoneHover, onZoneClick, externalHoveredZone }) => {
  const [isReady, setIsReady] = useState(false);

  const handleSelect = useCallback((zoneId) => {
    if (onZoneClick) onZoneClick(zoneId);
  }, [onZoneClick]);

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', minHeight: 380, borderRadius: 20, overflow: 'hidden', background: 'radial-gradient(ellipse at 50% 40%, rgba(56,189,248,0.05), rgba(10,15,28,0.98))' }}>

      {/* Skeleton until canvas ready */}
      {!isReady && (
        <div style={{ position: 'absolute', inset: 0, zIndex: 10 }}>
          <SkeletonViewer style={{ height: '100%', borderRadius: 20 }} />
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 12 }}>
            <div style={{ fontFamily: 'monospace', fontSize: 11, letterSpacing: '0.2em', color: 'rgba(56,189,248,0.5)', textTransform: 'uppercase' }}>Loading 3D Model…</div>
          </div>
        </div>
      )}

      {/* R3F Canvas */}
      <Canvas
        camera={{ position: [0, 1.5, 4], fov: 45 }}
        onCreated={() => setTimeout(() => setIsReady(true), 400)}
        gl={{ antialias: true, alpha: true }}
        style={{ width: '100%', height: '100%' }}
      >
        <ambientLight intensity={0.6} />
        <directionalLight position={[5, 8, 5]} intensity={1.2} castShadow />
        <directionalLight position={[-4, 3, -4]} intensity={0.4} color="#a78bfa" />
        <pointLight position={[0, -3, 0]} intensity={0.3} color="#38bdf8" />

        <Suspense fallback={null}>
          <AircraftModel
            onHover={onZoneHover}
            onSelect={handleSelect}
            hoveredZone={externalHoveredZone}
          />
          <ContactShadows position={[0, -2.5, 0]} opacity={0.35} scale={8} blur={2} far={4} />
          <Environment preset="city" />
        </Suspense>

        <OrbitControls
          enableDamping
          dampingFactor={0.07}
          minDistance={1}
          maxDistance={20}
          autoRotate={false}
        />
      </Canvas>

      {/* Zone indicator pills */}
      <ZoneIndicators onHover={onZoneHover} onSelect={handleSelect} hoveredZone={externalHoveredZone} />

      {/* Top label */}
      <div style={{ position: 'absolute', top: 16, left: 16, zIndex: 30, display: 'flex', alignItems: 'center', gap: 6, fontFamily: 'monospace', fontSize: 10, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'rgba(56,189,248,0.5)' }}>
        <span>✦</span> 3D · Drag to orbit · Scroll to zoom · Click a part
      </div>
    </div>
  );
};

// Preload the model
useGLTF.preload('/dairplane.glb');

export default AircraftViewer3D;
