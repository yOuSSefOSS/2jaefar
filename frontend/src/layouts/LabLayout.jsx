import React, { useState } from 'react';
import { Link, useLocation, Outlet } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, Menu, X, FlaskConical, Plane, Box, Triangle, Wind } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { useTenant } from '../context/TenantContext';
import { SkeletonLabHub, SkeletonExplorePage } from '../components/Skeleton';
import logoUrl from '../assets/logo.png';

const LAB_NAV_ITEMS = [
  { to: '/lab', label: 'Hub', exact: true, icon: <FlaskConical size={14} /> },
  { to: '/lab/fuselage', label: 'Fuselage', icon: <Box size={14} /> },
  { to: '/lab/wings', label: 'Wings', icon: <Plane size={14} /> },
  { to: '/lab/tail', label: 'Tail', icon: <Triangle size={14} /> },
  { to: '/lab/engines', label: 'Engines', icon: <Wind size={14} /> },
];

const LabLayout = () => {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);
  const { user, displayName } = useAppContext();
  const { tenant } = useTenant();

  React.useEffect(() => {
    setIsNavigating(true);
    const timer = setTimeout(() => setIsNavigating(false), 600);
    return () => clearTimeout(timer);
  }, [location.pathname]);


  // Breadcrumbs
  const pathSegments = location.pathname.split('/').filter(Boolean);
  const breadcrumbs = pathSegments.map((seg, i) => ({
    label: seg.charAt(0).toUpperCase() + seg.slice(1),
    path: '/' + pathSegments.slice(0, i + 1).join('/'),
    isLast: i === pathSegments.length - 1,
  }));

  return (
    <div className="flex flex-col h-[100dvh] bg-[var(--color-edu-navy)] text-[var(--color-edu-text)] font-sans overflow-hidden">
      
      {/* ── Top Navbar ── */}
      <header className="h-16 flex-shrink-0 bg-[var(--color-edu-navy-light)]/80 backdrop-blur-xl border-b border-white/6 flex items-center justify-between px-6 z-30">
        
        {/* Logo & Nav */}
        <div className="flex items-center gap-8">
          <Link to="/" className="flex items-center gap-3 group">
            <img 
              src={tenant?.logo_url || logoUrl} 
              alt={tenant ? `${tenant.name} Logo` : "Vortex-Gen Logo"} 
              className="h-8 w-auto object-contain drop-shadow-[0_0_10px_rgba(56,189,248,0.4)] group-hover:drop-shadow-[0_0_16px_rgba(56,189,248,0.6)] transition-all" 
            />
            <span className="font-bold text-lg tracking-wider text-white">
              {tenant?.name || "Vortex-Gen"}
            </span>
            <span className="hidden sm:inline-block text-[10px] font-mono tracking-widest text-[#a78bfa] bg-[#a78bfa]/10 px-2 py-0.5 rounded-full border border-[#a78bfa]/20">
              LABS
            </span>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-1">
            {LAB_NAV_ITEMS.map((item) => {
              const isActive = item.exact 
                ? location.pathname === item.to 
                : location.pathname.startsWith(item.to);
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`relative flex items-center gap-2 px-4 py-2 rounded-lg text-[13px] font-semibold tracking-wide transition-all duration-300
                    ${isActive
                      ? 'text-[#a78bfa]'
                      : 'text-[var(--color-edu-text-muted)] hover:text-white'
                    }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="labNavIndicator"
                      className="absolute inset-0 bg-[#a78bfa]/8 border border-[#a78bfa]/20 rounded-lg"
                      initial={false}
                      transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                    />
                  )}
                  <span className="relative z-10 flex items-center gap-2">
                    {item.icon} {item.label}
                  </span>
                </Link>
              );
            })}
            
            {/* Airfoil Wind Tunnel (Protected) */}
            <div className="flex items-center p-0.5 ml-1 rounded-xl bg-[#f59e0b]/5 border border-[#f59e0b]/10">
              <Link
                to="/lab/airfoil"
                className={`relative flex items-center gap-2 px-4 py-1.5 rounded-lg text-[13px] font-semibold tracking-wide transition-all duration-300
                  ${location.pathname.startsWith('/lab/airfoil')
                    ? 'text-[#f59e0b]'
                    : 'text-[var(--color-edu-text-muted)] hover:text-white'
                  }`}
              >
                {location.pathname.startsWith('/lab/airfoil') && (
                  <motion.div
                    layoutId="labNavIndicator"
                    className="absolute inset-0 rounded-lg bg-[#f59e0b]/15 border border-[#f59e0b]/30"
                    initial={false}
                    transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                  />
                )}
                <span className="relative z-10 flex items-center gap-2">
                  <Wind size={14} /> Wind Tunnel
                </span>
              </Link>
            </div>
          </nav>
        </div>

        {/* Right Side */}
        <div className="flex items-center gap-3">
          {/* Back to Explore CTA */}
          <Link
            to="/explore"
            className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-lg text-[12px] font-bold tracking-wider uppercase
              bg-white/5 border border-white/10 text-white hover:border-white/25 hover:bg-white/10
              transition-all duration-300"
          >
            Explore
          </Link>

          {/* Auth section */}
          {user ? (
            <Link to="/profile" className="flex items-center gap-2 p-1.5 px-3 rounded-lg text-[12px] font-semibold bg-[#a78bfa]/8 border border-[#a78bfa]/20 text-[#a78bfa] hover:bg-[#a78bfa]/15 transition-all" title="Profile">
              <div style={{ width: 22, height: 22, borderRadius: '50%', background: 'linear-gradient(135deg, #a78bfa, #8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, fontWeight: 800, color: '#020817', flexShrink: 0 }}>
                {displayName.slice(0, 2).toUpperCase()}
              </div>
              <span className="hidden sm:block">{displayName.split(' ')[0]}</span>
            </Link>
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
              {LAB_NAV_ITEMS.map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-4 py-3 rounded-lg text-sm font-semibold text-[var(--color-edu-text-muted)] hover:text-white hover:bg-white/5 flex items-center gap-3 transition-all"
                >
                  {item.icon} {item.label}
                </Link>
              ))}
              <Link
                to="/lab/airfoil"
                onClick={() => setMobileMenuOpen(false)}
                className="mt-2 px-4 py-3 rounded-lg text-sm font-bold text-[#f59e0b] bg-[#f59e0b]/10 border border-[#f59e0b]/20 flex items-center gap-3"
              >
                <Wind size={16} /> Wind Tunnel
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Breadcrumb ── */}
      {breadcrumbs.length > 1 && (
        <div className="px-6 py-2.5 bg-[var(--color-edu-navy)]/80 border-b border-white/4 flex items-center gap-1.5 text-[11px] font-mono tracking-wide z-10">
          <Link to="/" className="text-[var(--color-edu-text-muted)] hover:text-[#a78bfa] transition-colors">
            Home
          </Link>
          {breadcrumbs.map((crumb) => (
            <React.Fragment key={crumb.path}>
              <ChevronRight size={10} className="text-[var(--color-edu-text-muted)]/50" />
              {crumb.isLast ? (
                <span className="text-[#a78bfa]">{crumb.label}</span>
              ) : (
                <Link to={crumb.path} className="text-[var(--color-edu-text-muted)] hover:text-[#a78bfa] transition-colors">
                  {crumb.label}
                </Link>
              )}
            </React.Fragment>
          ))}
        </div>
      )}

      {/* ── Main Content ── */}
      <main className="flex-1 overflow-y-auto relative edu-scroll">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 16, filter: 'blur(8px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            exit={{ opacity: 0, y: -12, filter: 'blur(8px)' }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="min-h-full"
          >
            {isNavigating ? (
              location.pathname === '/lab' ? (
                <SkeletonLabHub />
              ) : (
                <SkeletonExplorePage />
              )
            ) : (
              <Outlet />
            )}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
};

export default LabLayout;
