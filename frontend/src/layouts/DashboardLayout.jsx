import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Settings, User, Wind, Gem, ArrowLeft, GraduationCap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppContext } from '../context/AppContext';
import logoUrl from '../assets/logo.png';

const DashboardLayout = ({ children, isBackendConnected }) => {
  const location = useLocation();
  const { subscriptionTier } = useAppContext();

  return (
    <div className="flex flex-col h-screen bg-[var(--color-brand-900)] text-brand-50 font-sans overflow-hidden">
      
      {/* Top Navbar */}
      <header className="h-16 flex-shrink-0 bg-[var(--color-brand-800)]/50 backdrop-blur-md border-b border-white/10 flex items-center justify-between px-6 z-20 shadow-[0_5px_30px_rgba(0,0,0,0.5)]">
        
        {/* Logo & Main Nav Area */}
        <div className="flex items-center gap-5"> 
          <Link 
            to="/explore" 
            className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-semibold tracking-wider
              text-brand-400 hover:text-[var(--color-accent-neon)] hover:bg-white/5 transition-all border border-white/5 hover:border-white/10"
            title="Back to Explorer"
          >
            <ArrowLeft size={13} />
            Explorer
          </Link>

          <div className="flex items-center gap-3">
            <img src={logoUrl} alt="Vortex-Gen Logo" className="h-30 w-auto object-contain drop-shadow-[0_0_10px_rgba(14,165,233,0.5)]" />
            <span className="font-bold text-xl tracking-widest text-white">Vortex-Gen</span>
            <span className="hidden sm:inline-block text-[9px] font-mono tracking-widest text-[var(--color-accent-neon)] bg-[var(--color-accent-neon)]/8 px-2 py-0.5 rounded-full border border-[var(--color-accent-neon)]/20">
              LAB
            </span>
          </div>

          <nav className="hidden md:flex items-center gap-3">
            <TopNavItem to="/dashboard" label="Simulation" currentPath={location.pathname} />
            <TopNavItem to="/profile" label="Profile" currentPath={location.pathname} />
            <TopNavItem to="/settings" label="Settings" currentPath={location.pathname} />
            <TopNavItem to="/pricing" label="Pricing" currentPath={location.pathname} />
          </nav>
        </div>
        
        {/* Right Side Controls & Status */}
        <div className="flex items-center gap-6">
          <div className="hidden sm:flex items-center gap-3 bg-black/40 px-4 py-1.5 rounded-full border border-white/5">
            <div className={`w-2 h-2 rounded-full ${isBackendConnected ? 'bg-[var(--color-accent-neon)] shadow-[0_0_10px_var(--color-accent-neon)]' : 'bg-[var(--color-accent-pink)] shadow-[0_0_10px_var(--color-accent-pink)]'} animate-pulse`}></div>
            <span className="text-brand-300 font-mono text-xs tracking-wider">
              {isBackendConnected ? 'API_LINK_UP' : 'API_LINK_DOWN'}
            </span>
          </div>

          <div className="flex items-center gap-3">
             <Link to="/pricing" className="hidden sm:flex items-center gap-2 p-1.5 px-3 border border-[var(--color-accent-blue)]/50 bg-[var(--color-accent-blue)]/10 text-[var(--color-accent-neon)] rounded-full hover:bg-[var(--color-accent-blue)]/20 transition-all text-xs font-bold uppercase tracking-widest">
               <Gem size={14} /> {subscriptionTier}
             </Link>
             <Link to="/settings" className="p-2 text-brand-400 hover:text-[var(--color-accent-neon)] hover:bg-white/5 rounded-lg transition-all" title="Settings">
               <Settings size={20} />
             </Link>
             <Link to="/profile" className="p-2 text-brand-400 hover:text-[var(--color-accent-neon)] hover:bg-white/5 rounded-lg transition-all" title="User Profile">
               <User size={20} />
             </Link>
          </div>
        </div>
      </header>

      {/* Main Content Workspace */}
      <main className="flex-1 flex flex-col min-w-0 min-h-0 relative">
        {/* Subtle grid background */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff02_1px,transparent_1px),linear-gradient(to_bottom,#ffffff02_1px,transparent_1px)] bg-[size:4rem_4rem] pointer-events-none"></div>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(14,165,233,0.1),transparent)] pointer-events-none"></div>

        {/* Scrollable View Area with Page Transitions */}
        <div className="flex-1 overflow-auto p-4 lg:p-6 relative z-10 custom-scrollbar">
           <AnimatePresence mode="wait">
             <motion.div
               key={location.pathname}
               initial={{ opacity: 0, y: 20, filter: 'blur(10px)' }}
               animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
               exit={{ opacity: 0, y: -20, filter: 'blur(10px)' }}
               transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
               className="h-full"
             >
               {children}
             </motion.div>
           </AnimatePresence>
        </div>
      </main>
    </div>
  );
};

const TopNavItem = ({ to, label, currentPath }) => {
  const isActive = currentPath.startsWith(to) || (currentPath === '/' && to === '/dashboard');
  
  return (
    <Link 
      to={to} 
      className={`relative px-5 py-2 rounded-xl transition-all duration-300 font-bold text-[13px] tracking-widest uppercase overflow-hidden
        ${isActive 
          ? 'text-[var(--color-accent-neon)]' 
          : 'text-brand-300 hover:text-white'
        }` 
      }
    >
      {/* Background glow when active */}
      {isActive && (
        <motion.div 
          layoutId="activeNavIndicator"
          className="absolute inset-0 bg-[var(--color-accent-blue)]/10 border border-[var(--color-accent-blue)]/30 rounded-xl"
          initial={false}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        >
           <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_100%,rgba(14,165,233,0.2),transparent_70%)]"></div>
        </motion.div>
      )}
      <span className="relative z-10">{label}</span>
    </Link>
  );
};

export default DashboardLayout;
