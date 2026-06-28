import React from 'react';
import { Link } from 'react-router-dom';
import { Home, ArrowLeft } from 'lucide-react';
import HolographicErrorLayout from '../../components/HolographicErrorLayout';

const NotFound = () => {
  return (
    <HolographicErrorLayout imageSrc="/ERROR 404.jpg" glowColor="sky">
      <Link 
        to="/"
        className="px-6 py-3 rounded-xl bg-edu-sky/20 text-white border border-edu-sky/40 hover:bg-edu-sky/40 hover:border-edu-sky/60 hover:scale-105 active:scale-95 transition-all flex items-center gap-2 w-full sm:w-auto justify-center backdrop-blur-md shadow-[0_0_15px_rgba(56,189,248,0.3)] font-semibold uppercase tracking-wider text-sm"
      >
        <Home size={18} />
        <span>Base Command</span>
      </Link>
      <button 
        onClick={() => window.history.back()}
        className="px-6 py-3 rounded-xl bg-white/10 text-white border border-white/20 hover:bg-white/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-2 w-full sm:w-auto justify-center backdrop-blur-md shadow-[0_0_15px_rgba(255,255,255,0.1)] font-semibold uppercase tracking-wider text-sm"
      >
        <ArrowLeft size={18} />
        <span>Previous Vector</span>
      </button>
    </HolographicErrorLayout>
  );
};

export default NotFound;
