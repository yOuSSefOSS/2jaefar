import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { useGLTF, Environment, ContactShadows, Float, OrbitControls, Html, useProgress, Sparkles } from '@react-three/drei';
import * as THREE from 'three';
import { RefreshCw } from 'lucide-react';

function Loader() {
  const { progress } = useProgress()
  return (
    <Html center>
      <div className="flex flex-col items-center justify-center p-6 bg-black/60 backdrop-blur-md rounded-2xl border border-sky-500/30 shadow-[0_0_30px_rgba(14,165,233,0.3)] min-w-[200px]">
        <div className="text-sky-400 font-bold text-xl mb-2 animate-pulse tracking-widest uppercase">Loading 3D Aircraft</div>
        <div className="text-white font-mono text-3xl">{progress.toFixed(0)}%</div>
        <div className="w-full h-1 bg-slate-800 mt-4 rounded-full overflow-hidden">
          <div className="h-full bg-sky-500 transition-all duration-300" style={{ width: `${progress}%` }}></div>
        </div>
      </div>
    </Html>
  )
}

function AirflowParticles() {
  const particlesRef = useRef();
  
  useFrame((state, delta) => {
    if (particlesRef.current) {
      particlesRef.current.position.z += delta * 15;
      if (particlesRef.current.position.z > 10) {
        particlesRef.current.position.z = -10;
      }
    }
  });

  return (
    <group ref={particlesRef}>
      <Sparkles count={200} scale={[20, 10, 30]} size={6} speed={0} opacity={0.5} color="#38bdf8" />
    </group>
  );
}

function Airplane({ pitch = 0, roll = 0, yaw = 0, showForces = false, showAirflow = false, cgPosition, cpPosition, controlForces }) {
  const { scene } = useGLTF('/assets/airplane_a380.glb');
  const group = useRef();

  useFrame(() => {
    if (group.current) {
      group.current.rotation.x = THREE.MathUtils.lerp(group.current.rotation.x, pitch * (Math.PI / 180), 0.1);
      group.current.rotation.z = THREE.MathUtils.lerp(group.current.rotation.z, -roll * (Math.PI / 180), 0.1);
      group.current.rotation.y = THREE.MathUtils.lerp(group.current.rotation.y, -yaw * (Math.PI / 180), 0.1);
    }
  });

  return (
    <group ref={group} scale={0.5}>
      <primitive object={scene} />
      {showAirflow && <AirflowParticles />}
      {showForces && (
        <>
          <arrowHelper args={[new THREE.Vector3(0, 1, 0), new THREE.Vector3(0, 1, 0), 4, 0x10b981, 0.5, 0.2]} />
          <arrowHelper args={[new THREE.Vector3(0, -1, 0), new THREE.Vector3(0, -1, 0), 4, 0xef4444, 0.5, 0.2]} />
          <arrowHelper args={[new THREE.Vector3(0, 0, 1), new THREE.Vector3(0, 0, 1), 4, 0x0ea5e9, 0.5, 0.2]} />
          <arrowHelper args={[new THREE.Vector3(0, 0, -1), new THREE.Vector3(0, 0, -1), 4, 0xf59e0b, 0.5, 0.2]} />
        </>
      )}
      {cgPosition !== undefined && (
        <mesh position={[0, 0, cgPosition]}>
          <sphereGeometry args={[0.8, 16, 16]} />
          <meshStandardMaterial color="#38bdf8" emissive="#0284c7" emissiveIntensity={0.5} />
        </mesh>
      )}
      {cpPosition !== undefined && (
        <mesh position={[0, 0, cpPosition]}>
          <sphereGeometry args={[0.8, 16, 16]} />
          <meshStandardMaterial color="#f59e0b" emissive="#b45309" emissiveIntensity={0.5} />
        </mesh>
      )}
      {/* Control Surface Forces */}
      {controlForces && (
        <>
          {/* Elevator Force (Pitch) */}
          {Math.abs(controlForces.pitch) > 0 && (
            <arrowHelper 
              args={[
                new THREE.Vector3(0, controlForces.pitch > 0 ? -1 : 1, 0), 
                new THREE.Vector3(0, 0.5, -4), 
                Math.max(2, Math.abs(controlForces.pitch) * 0.2), 
                0x0ea5e9, 0.5, 0.3
              ]} 
            />
          )}
          {/* Aileron Forces (Roll) */}
          {Math.abs(controlForces.roll) > 0 && (
            <>
              {/* Left Wing */}
              <arrowHelper 
                args={[
                  new THREE.Vector3(0, controlForces.roll > 0 ? 1 : -1, 0), 
                  new THREE.Vector3(3, 0, 0), 
                  Math.max(2, Math.abs(controlForces.roll) * 0.1), 
                  0x10b981, 0.5, 0.3
                ]} 
              />
              {/* Right Wing */}
              <arrowHelper 
                args={[
                  new THREE.Vector3(0, controlForces.roll > 0 ? -1 : 1, 0), 
                  new THREE.Vector3(-3, 0, 0), 
                  Math.max(2, Math.abs(controlForces.roll) * 0.1), 
                  0x10b981, 0.5, 0.3
                ]} 
              />
            </>
          )}
          {/* Rudder Force (Yaw) */}
          {Math.abs(controlForces.yaw) > 0 && (
            <arrowHelper 
              args={[
                new THREE.Vector3(controlForces.yaw > 0 ? -1 : 1, 0, 0), 
                new THREE.Vector3(0, 1.5, -4), 
                Math.max(2, Math.abs(controlForces.yaw) * 0.2), 
                0xd946ef, 0.5, 0.3
              ]} 
            />
          )}
        </>
      )}
    </group>
  );
}

// Preload the model
useGLTF.preload('/assets/airplane_a380.glb');

export default function ThreeDPlane({ pitch = 0, roll = 0, yaw = 0, showForces = false, showAirflow = false, showRunway = false, cgPosition, cpPosition, controlForces }) {
  const controlsRef = useRef();

  return (
    <div className="w-full h-full relative group">
      <div className="w-full h-full cursor-grab active:cursor-grabbing">
        <Canvas shadows camera={{ position: [-5, 3, 10], fov: 45 }}>
          <color attach="background" args={['#020617']} />
          <Environment preset="city" />
          <ambientLight intensity={0.5} />
          <directionalLight position={[10, 10, 10]} intensity={1} castShadow />
          
          <OrbitControls 
            ref={controlsRef}
            enableZoom={true} 
            enablePan={false} 
            minPolarAngle={Math.PI / 4} 
            maxPolarAngle={Math.PI / 1.5}
            minDistance={4}
            maxDistance={15}
          />
          
          <Float speed={1.5} rotationIntensity={0.2} floatIntensity={0.5}>
            <React.Suspense fallback={<Loader />}>
              <Airplane pitch={pitch} roll={roll} yaw={yaw} showForces={showForces} showAirflow={showAirflow} cgPosition={cgPosition} cpPosition={cpPosition} controlForces={controlForces} />
            </React.Suspense>
          </Float>

          {showRunway && (
            <mesh position={[0, -2.5, 0]} rotation={[-Math.PI / 2, 0, 0]}>
              <planeGeometry args={[20, 100]} />
              <meshStandardMaterial color="#1e293b" roughness={0.9} />
              {/* Centerline */}
              <mesh position={[0, 0, 0.01]}>
                <planeGeometry args={[0.5, 100]} />
                <meshBasicMaterial color="#cbd5e1" />
              </mesh>
            </mesh>
          )}

          <ContactShadows position={[0, -2.4, 0]} opacity={0.6} scale={20} blur={2} far={10} />
        </Canvas>
      </div>
      
      {/* Reset View Button */}
      <button 
        onClick={() => controlsRef.current?.reset()}
        className="absolute top-4 right-4 bg-slate-900/80 hover:bg-sky-500/20 text-slate-300 hover:text-sky-400 p-2 rounded-xl border border-white/10 hover:border-sky-500/50 backdrop-blur-md transition-all shadow-lg flex items-center gap-2 opacity-0 group-hover:opacity-100"
      >
        <RefreshCw size={16} />
        <span className="text-xs font-bold uppercase tracking-wider hidden sm:block">Reset View</span>
      </button>

      <div className="absolute bottom-4 left-4 right-4 text-center pointer-events-none opacity-50">
        <p className="text-slate-400 text-xs uppercase tracking-widest font-mono">Drag to rotate • Scroll to zoom</p>
      </div>
    </div>
  );
}
