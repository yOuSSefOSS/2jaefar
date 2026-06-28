import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { RefreshCw, Home, ShieldAlert } from 'lucide-react';

const ServerError = () => {
  return (
    <div className="min-h-screen bg-brand-900 flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute inset-0 pointer-events-none opacity-20">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-amber-500/20 via-brand-900 to-brand-900"></div>
      </div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="premium-glass p-8 md:p-12 max-w-3xl w-full text-center relative z-10 border-t-4 border-t-amber-500/50"
      >
        {/* Placeholder for the user's generated image */}
        <div className="mb-8 relative w-full h-64 md:h-80 bg-brand-800/50 rounded-xl border border-white/5 overflow-hidden flex items-center justify-center">
          <img 
            src="/ERROR 500.png" 
            alt="500 System Override"
            className="w-full h-full object-cover opacity-80"
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.nextSibling.style.display = 'flex';
            }}
          />
          <div className="absolute inset-0 hidden flex-col items-center justify-center text-amber-500/50">
            <ShieldAlert size={48} className="mb-4" />
            <p className="text-sm font-mono tracking-widest">[ WAITING FOR ASSET: /public/ERROR 500.png ]</p>
          </div>
        </div>

        <motion.h1 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-5xl md:text-7xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-amber-600 mb-4 tracking-tight"
        >
          500
        </motion.h1>
        
        <h2 className="text-2xl font-semibold text-edu-text mb-4 uppercase tracking-widest">System Override</h2>
        
        <p className="text-edu-text-muted mb-10 max-w-xl mx-auto leading-relaxed">
          A critical avionics or server failure has occurred. Our engineers have been notified and are attempting to restore primary systems.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button 
            onClick={() => window.location.reload()}
            className="px-6 py-3 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/30 hover:bg-amber-500/20 transition-all flex items-center gap-2 w-full sm:w-auto justify-center"
          >
            <RefreshCw size={18} />
            <span>Restart Sequence</span>
          </button>
          <Link 
            to="/"
            className="px-6 py-3 rounded-xl bg-white/5 text-edu-text border border-white/10 hover:bg-white/10 transition-all flex items-center gap-2 w-full sm:w-auto justify-center"
          >
            <Home size={18} />
            <span>Return to Base</span>
          </Link>
        </div>
      </motion.div>
    </div>
  );
};

export default ServerError;
