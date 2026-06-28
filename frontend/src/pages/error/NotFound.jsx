import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { AlertTriangle, Home, ArrowLeft } from 'lucide-react';

const NotFound = () => {
  return (
    <div className="min-h-screen bg-brand-900 flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute inset-0 pointer-events-none opacity-20">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-edu-sky/20 via-brand-900 to-brand-900"></div>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="premium-glass p-8 md:p-12 max-w-3xl w-full text-center relative z-10 border-t-4 border-t-edu-sky/50"
      >
        {/* Placeholder for the user's generated image */}
        <div className="mb-8 relative w-full h-64 md:h-80 bg-brand-800/50 rounded-xl border border-white/5 overflow-hidden flex items-center justify-center">
          <img 
            src="/ERROR 404.png" // User will place "ERROR 404.png" in the public folder
            alt="404 Airspace Restricted"
            className="w-full h-full object-cover opacity-80"
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.nextSibling.style.display = 'flex';
            }}
          />
          <div className="absolute inset-0 hidden flex-col items-center justify-center text-brand-500">
            <AlertTriangle size={48} className="mb-4 opacity-50" />
            <p className="text-sm font-mono tracking-widest">[ WAITING FOR ASSET: /public/ERROR 404.png ]</p>
          </div>
        </div>

        <motion.h1 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-5xl md:text-7xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-edu-sky to-white mb-4 tracking-tight"
        >
          404
        </motion.h1>
        
        <h2 className="text-2xl font-semibold text-edu-text mb-4 uppercase tracking-widest">Airspace Restricted</h2>
        
        <p className="text-edu-text-muted mb-10 max-w-xl mx-auto leading-relaxed">
          The flight path you are attempting to navigate does not exist in our active charts. 
          Please recalibrate your instruments and return to known coordinates.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link 
            to="/"
            className="px-6 py-3 rounded-xl bg-edu-sky/10 text-edu-sky border border-edu-sky/30 hover:bg-edu-sky/20 transition-all flex items-center gap-2 w-full sm:w-auto justify-center"
          >
            <Home size={18} />
            <span>Base Command</span>
          </Link>
          <button 
            onClick={() => window.history.back()}
            className="px-6 py-3 rounded-xl bg-white/5 text-edu-text border border-white/10 hover:bg-white/10 transition-all flex items-center gap-2 w-full sm:w-auto justify-center"
          >
            <ArrowLeft size={18} />
            <span>Previous Vector</span>
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default NotFound;
