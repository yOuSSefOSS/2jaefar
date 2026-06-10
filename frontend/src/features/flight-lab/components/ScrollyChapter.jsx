import React, { useState, useEffect, useRef } from 'react';
import { useInView } from 'react-intersection-observer';
import { motion, AnimatePresence } from 'framer-motion';

// Individual section in the left pane
export function ScrollSection({ children, id, onActive }) {
  const { ref, inView } = useInView({
    threshold: 0.5, // Trigger when 50% visible
  });

  useEffect(() => {
    if (inView) {
      onActive(id);
    }
  }, [inView, id, onActive]);

  return (
    <div 
      ref={ref} 
      className={`min-h-[80vh] flex flex-col justify-center py-16 transition-opacity duration-700 ${inView ? 'opacity-100' : 'opacity-30'}`}
    >
      {children}
    </div>
  );
}

// Main Layout Component
export default function ScrollyChapter({ sections, visuals }) {
  const [activeId, setActiveId] = useState(sections[0].id);

  return (
    <div className="flex-1 flex w-full h-full overflow-hidden bg-[#020617] text-slate-200">
      
      {/* LEFT PANE: Scrolling Text */}
      <div className="w-1/2 h-full overflow-y-auto overflow-x-hidden relative edu-scroll scroll-smooth scroll-pt-16">
        <div className="max-w-2xl mx-auto px-12 pb-32">
          {sections.map((section) => (
            <ScrollSection key={section.id} id={section.id} onActive={setActiveId}>
              {section.content}
            </ScrollSection>
          ))}
        </div>
      </div>

      {/* RIGHT PANE: Sticky Visuals */}
      <div className="w-1/2 h-full border-l border-white/5 bg-[#0f172a]/30 relative flex items-center justify-center p-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeId}
            initial={{ opacity: 0, scale: 0.95, filter: 'blur(10px)' }}
            animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
            exit={{ opacity: 0, scale: 1.05, filter: 'blur(10px)' }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="w-full h-full max-w-2xl max-h-[800px] flex items-center justify-center"
          >
            {visuals[activeId] || (
              <div className="text-slate-500 font-mono">No visual assigned for {activeId}</div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

    </div>
  );
}
