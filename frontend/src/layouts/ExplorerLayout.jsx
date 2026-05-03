import React, { useState } from 'react';
import { Link, useLocation, Outlet } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Wind, GraduationCap, FlaskConical, ChevronRight, Menu, X, User, Settings } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import logoUrl from '../assets/logo.png';

const NAV_ITEMS = [
  { to: '/explore', label: 'Explorer', exact: true },
  { to: '/explore/fuselage', label: 'Fuselage' },
  { to: '/explore/wings', label: 'Wings' },
  { to: '/explore/tail', label: 'Tail' },
  { to: '/explore/airfoil', label: 'Airfoil' },
];

const ExplorerLayout = () => {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, displayName } = useAppContext();

  // Build breadcrumb from current path
  const pathSegments = location.pathname.split('/').filter(Boolean);
  const breadcrumbs = pathSegments.map((seg, i) => ({
    label: seg.charAt(0).toUpperCase() + seg.slice(1),
    path: '/' + pathSegments.slice(0, i + 1).join('/'),
    isLast: i === pathSegments.length - 1,
  }));

  return (
    <div className="flex flex-col h-screen bg-[var(--color-edu-navy)] text-[var(--color-edu-text)] font-sans overflow-hidden">
      
      {/* ── Top Navbar ── */}
      <header className="h-16 flex-shrink-0 bg-[var(--color-edu-navy-light)]/80 backdrop-blur-xl border-b border-white/6 flex items-center justify-between px-6 z-30">
        
        {/* Logo & Nav */}
        <div className="flex items-center gap-8">
          <Link to="/" className="flex items-center gap-3 group">
            <img 
              src={logoUrl} 
              alt="Vortex-Gen Logo" 
              className="h-8 w-auto object-contain drop-shadow-[0_0_10px_rgba(56,189,248,0.4)] group-hover:drop-shadow-[0_0_16px_rgba(56,189,248,0.6)] transition-all" 
            />
            <span className="font-bold text-lg tracking-wider text-white">
              Vortex-Gen
            </span>
            <span className="hidden sm:inline-block text-[10px] font-mono tracking-widest text-[var(--color-edu-sky)] bg-[var(--color-edu-sky)]/10 px-2 py-0.5 rounded-full border border-[var(--color-edu-sky)]/20">
              ACADEMY
            </span>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-1">
            {NAV_ITEMS.map((item) => {
              const isActive = item.exact 
                ? location.pathname === item.to 
                : location.pathname.startsWith(item.to);
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`relative px-4 py-2 rounded-lg text-[13px] font-semibold tracking-wide transition-all duration-300
                    ${isActive
                      ? 'text-[var(--color-edu-sky)]'
                      : 'text-[var(--color-edu-text-muted)] hover:text-white'
                    }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="explorerNavIndicator"
                      className="absolute inset-0 bg-[var(--color-edu-sky)]/8 border border-[var(--color-edu-sky)]/20 rounded-lg"
                      initial={false}
                      transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                    />
                  )}
                  <span className="relative z-10">{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Right Side */}
        <div className="flex items-center gap-3">
          {/* Labs CTA */}
          <Link
            to="/lab"
            className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-lg text-[12px] font-bold tracking-wider uppercase
              bg-gradient-to-r from-[var(--color-edu-sky)]/15 to-[var(--color-accent-purple)]/15
              border border-[var(--color-edu-sky)]/25 text-[var(--color-edu-sky)]
              hover:border-[var(--color-edu-sky)]/40 hover:bg-[var(--color-edu-sky)]/20
              transition-all duration-300"
          >
            <FlaskConical size={14} />
            Labs
          </Link>

          {/* Auth section */}
          {user ? (
            <>
              <Link to="/settings" className="hidden sm:flex p-2 text-[var(--color-edu-text-muted)] hover:text-white hover:bg-white/5 rounded-lg transition-all" title="Settings">
                <Settings size={18} />
              </Link>
              <Link to="/profile" className="flex items-center gap-2 p-1.5 px-3 rounded-lg text-[12px] font-semibold bg-[var(--color-edu-sky)]/8 border border-[var(--color-edu-sky)]/20 text-[var(--color-edu-sky)] hover:bg-[var(--color-edu-sky)]/15 transition-all" title="Profile">
                <div style={{ width: 22, height: 22, borderRadius: '50%', background: 'linear-gradient(135deg, #00f0ff, #0ea5e9)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, fontWeight: 800, color: '#020817', flexShrink: 0 }}>
                  {displayName.slice(0, 2).toUpperCase()}
                </div>
                <span className="hidden sm:block">{displayName.split(' ')[0]}</span>
              </Link>
            </>
          ) : (
            <Link to="/login" className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-lg text-[12px] font-semibold text-[var(--color-edu-text-muted)] hover:text-white hover:bg-white/5 border border-white/5 hover:border-white/15 transition-all">
              Sign In
            </Link>
          )}

          {/* Mobile menu toggle */}
          <button
            className="md:hidden p-2 text-[var(--color-edu-text-muted)] hover:text-white transition-colors"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </header>

      {/* ── Mobile Menu ── */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-[var(--color-edu-navy-light)] border-b border-white/6 overflow-hidden z-20"
          >
            <div className="p-4 flex flex-col gap-1">
              {NAV_ITEMS.map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-4 py-3 rounded-lg text-sm font-semibold text-[var(--color-edu-text-muted)] hover:text-white hover:bg-white/5 transition-all"
                >
                  {item.label}
                </Link>
              ))}
              <Link
                to="/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="mt-2 px-4 py-3 rounded-lg text-sm font-bold text-[var(--color-edu-sky)] bg-[var(--color-edu-sky)]/10 border border-[var(--color-edu-sky)]/20 flex items-center gap-2"
              >
                <FlaskConical size={16} /> Wind Tunnel Lab
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Breadcrumb ── */}
      {breadcrumbs.length > 1 && (
        <div className="px-6 py-2.5 bg-[var(--color-edu-navy)]/80 border-b border-white/4 flex items-center gap-1.5 text-[11px] font-mono tracking-wide">
          <Link to="/" className="text-[var(--color-edu-text-muted)] hover:text-[var(--color-edu-sky)] transition-colors">
            Home
          </Link>
          {breadcrumbs.map((crumb) => (
            <React.Fragment key={crumb.path}>
              <ChevronRight size={10} className="text-[var(--color-edu-text-muted)]/50" />
              {crumb.isLast ? (
                <span className="text-[var(--color-edu-sky)]">{crumb.label}</span>
              ) : (
                <Link to={crumb.path} className="text-[var(--color-edu-text-muted)] hover:text-[var(--color-edu-sky)] transition-colors">
                  {crumb.label}
                </Link>
              )}
            </React.Fragment>
          ))}
        </div>
      )}

      {/* ── Main Content ── */}
      <main className="flex-1 overflow-hidden relative">
        {/* Background decoration */}
        <div className="absolute inset-0 edu-grid-bg pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-10%,rgba(56,189,248,0.06),transparent)] pointer-events-none" />
        
        <div className="h-full edu-scroll">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 16, filter: 'blur(8px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              exit={{ opacity: 0, y: -12, filter: 'blur(8px)' }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              className="min-h-full"
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
};

export default ExplorerLayout;
