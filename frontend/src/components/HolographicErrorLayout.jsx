import React from 'react';
import { motion } from 'framer-motion';

const glowStyles = {
  sky: {
    ambient: 'bg-edu-sky',
    gradient: 'from-edu-sky/20',
  },
  red: {
    ambient: 'bg-red-500',
    gradient: 'from-red-600/20',
  },
  amber: {
    ambient: 'bg-amber-500',
    gradient: 'from-amber-500/20',
  }
};

const HolographicErrorLayout = ({ imageSrc, glowColor = 'sky', children }) => {
  const style = glowStyles[glowColor];

  return (
    <div className="h-full min-h-[80vh] w-full flex flex-col items-center justify-center p-2 sm:p-4 relative overflow-hidden font-sans text-brand-50 rounded-3xl">
      
      {/* Brand-compliant radial background glow */}
      <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[70vw] h-[70vh] max-w-[800px] max-h-[800px] blur-[150px] opacity-10 pointer-events-none rounded-full ${style.ambient}`}></div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.98, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 w-full max-w-5xl flex flex-col items-center gap-6"
      >
        {/* The Premium Image Container - using premium-glass from index.css */}
        <div className="w-full aspect-video rounded-3xl overflow-hidden border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)] relative premium-glass p-1">
           <div className="w-full h-full rounded-[22px] overflow-hidden relative">
             <img 
                src={imageSrc} 
                alt="System State" 
                className="w-full h-full object-cover object-center"
             />
             {/* Gentle fade at the bottom to match the deep brand background */}
             <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-brand-900/90 to-transparent pointer-events-none"></div>
           </div>
        </div>
        
        {/* The Control Dock anchored below, using premium-glass */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
          className="premium-glass p-3 px-6 flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto relative shadow-2xl"
        >
            {children}
        </motion.div>
      </motion.div>
    </div>
  );
};

export default HolographicErrorLayout;
