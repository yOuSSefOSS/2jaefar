import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';

const BernoulliLab = ({ language }) => {
  const isAr = language === 'ar';
  const canvasRef = useRef(null);
  
  // Throttle (throat width) 0 to 100
  const [constriction, setConstriction] = useState(50);
  
  const particlesRef = useRef([]);

  useEffect(() => {
    // Initialize particles
    particlesRef.current = Array.from({ length: 80 }).map(() => ({
      x: Math.random() * 800,
      y: Math.random() * 200,
      speedBase: 2 + Math.random() * 2,
    }));
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      const width = canvas.width;
      const height = canvas.height;
      const centerY = height / 2;
      
      // Calculate throat area
      // 0 constriction = flat tube
      // 100 constriction = very narrow tube
      const throatWidth = width * 0.4;
      const maxSqueeze = height * 0.35;
      const squeezeAmount = (constriction / 100) * maxSqueeze;
      
      // Draw tube background
      ctx.fillStyle = 'rgba(15, 23, 42, 0.8)';
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(width * 0.2, 0);
      ctx.bezierCurveTo(width * 0.4, 0, width * 0.4, squeezeAmount, width * 0.5, squeezeAmount);
      ctx.bezierCurveTo(width * 0.6, squeezeAmount, width * 0.6, 0, width * 0.8, 0);
      ctx.lineTo(width, 0);
      ctx.lineTo(width, height);
      ctx.lineTo(width * 0.8, height);
      ctx.bezierCurveTo(width * 0.6, height, width * 0.6, height - squeezeAmount, width * 0.5, height - squeezeAmount);
      ctx.bezierCurveTo(width * 0.4, height - squeezeAmount, width * 0.4, height, width * 0.2, height);
      ctx.lineTo(0, height);
      ctx.fill();

      // Draw outlines
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.5)';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(width * 0.2, 0);
      ctx.bezierCurveTo(width * 0.4, 0, width * 0.4, squeezeAmount, width * 0.5, squeezeAmount);
      ctx.bezierCurveTo(width * 0.6, squeezeAmount, width * 0.6, 0, width * 0.8, 0);
      ctx.lineTo(width, 0);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(0, height);
      ctx.lineTo(width * 0.2, height);
      ctx.bezierCurveTo(width * 0.4, height, width * 0.4, height - squeezeAmount, width * 0.5, height - squeezeAmount);
      ctx.bezierCurveTo(width * 0.6, height - squeezeAmount, width * 0.6, height, width * 0.8, height);
      ctx.lineTo(width, height);
      ctx.stroke();

      // Particle physics
      ctx.fillStyle = 'rgba(56, 189, 248, 0.8)';
      particlesRef.current.forEach(p => {
        // Find local width/squeeze at particle's x
        let localSqueeze = 0;
        if (p.x > width * 0.2 && p.x < width * 0.8) {
          // Normalize to -1 to 1 for bell curve
          const nx = (p.x - width * 0.5) / (width * 0.3);
          localSqueeze = squeezeAmount * Math.max(0, 1 - nx * nx);
        }
        
        const localHeight = height - (localSqueeze * 2);
        const velocityMultiplier = height / localHeight;
        
        p.x += p.speedBase * velocityMultiplier;
        
        if (p.x > width) {
          p.x = 0;
          p.y = Math.random() * height;
        }

        // Adjust Y based on squeeze to keep them inside tube
        const relativeY = p.y / height; // 0 to 1
        const actualY = localSqueeze + (relativeY * localHeight);

        // Draw particle
        // Faster particles have longer streaks and more alpha
        const alpha = Math.min(1, 0.2 + velocityMultiplier * 0.3);
        const streak = p.speedBase * velocityMultiplier * 3;
        
        ctx.fillStyle = `rgba(56, 189, 248, ${alpha})`;
        ctx.beginPath();
        ctx.roundRect(p.x, actualY, streak, 3, 2);
        ctx.fill();
      });

      animationFrameId = requestAnimationFrame(render);
    };
    render();

    return () => cancelAnimationFrame(animationFrameId);
  }, [constriction]);

  const velocityMultiplier = (200 / (200 - (constriction / 100) * 140)).toFixed(1);
  const pressureDrop = (constriction / 100) * 80;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 my-12 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-sky-500/10 blur-[100px] pointer-events-none" />
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 relative z-10">
        <div className="lg:col-span-2">
          <h3 className="text-2xl font-bold text-white mb-2">
            {isAr ? 'مختبر برنولي التفاعلي' : 'Interactive Bernoulli Lab'}
          </h3>
          <p className="text-slate-400 text-sm mb-6">
            {isAr ? 'قم بتضييق الأنبوب لمشاهدة تأثير فنتوري. تتسارع الجزيئات للحفاظ على التدفق مما يؤدي إلى انخفاض الضغط.' : 'Narrow the throat to see the Venturi effect. Particles accelerate to maintain flow, resulting in a pressure drop.'}
          </p>
          
          <div className="relative w-full aspect-[3/1] bg-black/50 rounded-2xl border border-white/10 overflow-hidden mb-6">
            <canvas 
              ref={canvasRef} 
              width={800} 
              height={200} 
              className="w-full h-full object-cover"
            />
            
            {/* Real-time stats overlay */}
            <div className="absolute top-4 left-4 flex gap-4">
              <div className="bg-black/60 backdrop-blur-md px-3 py-2 rounded-lg border border-white/10">
                <div className="text-[10px] text-slate-400 uppercase tracking-widest">{isAr ? 'مضاعف السرعة' : 'Velocity X'}</div>
                <div className="text-lg font-bold text-sky-400">{velocityMultiplier}x</div>
              </div>
              <div className="bg-black/60 backdrop-blur-md px-3 py-2 rounded-lg border border-white/10">
                <div className="text-[10px] text-slate-400 uppercase tracking-widest">{isAr ? 'انخفاض الضغط' : 'Pressure Drop'}</div>
                <div className="text-lg font-bold text-emerald-400">-{pressureDrop.toFixed(0)}%</div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4 bg-slate-800/50 p-4 rounded-xl border border-white/5">
            <span className="text-sm font-bold text-slate-300 whitespace-nowrap">{isAr ? 'تضييق الأنبوب' : 'Constriction'}</span>
            <input 
              type="range" 
              min="0" 
              max="90" 
              value={constriction}
              onChange={(e) => setConstriction(Number(e.target.value))}
              className="w-full h-2 bg-slate-900 rounded-lg appearance-none cursor-pointer accent-sky-500"
            />
          </div>
        </div>

        <div className="flex flex-col justify-center space-y-6">
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 p-6 rounded-2xl border border-sky-500/20 shadow-[0_0_30px_rgba(56,189,248,0.1)]">
            <div className="text-2xl font-serif text-sky-400 text-center mb-4 py-2 bg-black/40 rounded-lg border border-white/5">
              A₁V₁ = A₂V₂
            </div>
            <h4 className="font-bold text-white mb-2 text-center">{isAr ? 'مبدأ الاستمرارية' : 'Continuity Principle'}</h4>
            <p className="text-sm text-slate-400 text-center">
              {isAr ? 'المساحة × السرعة = ثابت. منطقة أضيق تعني سرعة أعلى.' : 'Area × Velocity = Constant. Narrower area means higher speed.'}
            </p>
          </div>

          <div className="bg-gradient-to-br from-slate-800 to-slate-900 p-6 rounded-2xl border border-emerald-500/20 shadow-[0_0_30px_rgba(16,185,129,0.1)]">
            <div className="text-2xl font-serif text-emerald-400 text-center mb-4 py-2 bg-black/40 rounded-lg border border-white/5">
              P + ½ρV² = Const
            </div>
            <h4 className="font-bold text-white mb-2 text-center">{isAr ? 'نظرية برنولي' : 'Bernoulli\'s Theorem'}</h4>
            <p className="text-sm text-slate-400 text-center">
              {isAr ? 'مع زيادة السرعة (الطاقة الحركية) ، يقل الضغط الساكن.' : 'As velocity (kinetic energy) increases, static pressure decreases.'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BernoulliLab;
