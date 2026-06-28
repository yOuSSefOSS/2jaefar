import React from 'react';
import { Link } from 'react-router-dom';
import { RefreshCw, Home } from 'lucide-react';
import HolographicErrorLayout from '../../components/HolographicErrorLayout';

const ServerError = () => {
  return (
    <HolographicErrorLayout imageSrc="/ERROR 500.jpg" glowColor="amber">
      <button 
        onClick={() => window.location.reload()}
        className="px-6 py-3 rounded-xl bg-amber-500/20 text-white border border-amber-500/40 hover:bg-amber-500/40 hover:border-amber-500/60 hover:scale-105 active:scale-95 transition-all flex items-center gap-2 w-full sm:w-auto justify-center backdrop-blur-md shadow-[0_0_15px_rgba(245,158,11,0.3)] font-semibold uppercase tracking-wider text-sm"
      >
        <RefreshCw size={18} />
        <span>Restart Sequence</span>
      </button>
      <Link 
        to="/"
        className="px-6 py-3 rounded-xl bg-white/10 text-white border border-white/20 hover:bg-white/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-2 w-full sm:w-auto justify-center backdrop-blur-md shadow-[0_0_15px_rgba(255,255,255,0.1)] font-semibold uppercase tracking-wider text-sm"
      >
        <Home size={18} />
        <span>Return to Base</span>
      </Link>
    </HolographicErrorLayout>
  );
};

export default ServerError;
