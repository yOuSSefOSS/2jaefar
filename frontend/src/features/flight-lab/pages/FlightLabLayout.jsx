import React, { useState } from 'react';
import { Outlet, NavLink, Link } from 'react-router-dom';
import { BookOpen, Wind, Activity, Maximize, Target, ArrowLeft, Languages, Menu, X } from 'lucide-react';
import { useAcademy } from '../../../context/AcademyContext';
import { useTenant } from '../../../context/TenantContext';

export default function FlightLabLayout() {
  const { language, toggleLanguage } = useAcademy();
  const { tenant } = useTenant();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const chapters = [
    { name: language === 'en' ? 'Ch 1: Atmosphere & Basics' : 'الفصل 1: الغلاف الجوي والأساسيات', path: 'aerodynamics', icon: <Wind className="w-5 h-5" /> },
    { name: language === 'en' ? 'Ch 2: The Lift Equation' : 'الفصل 2: معادلة الرفع', path: 'lift-equation', icon: <Maximize className="w-5 h-5" /> },
    { name: language === 'en' ? 'Ch 3: High Lift Devices' : 'الفصل 3: أجهزة الرفع العالي', path: 'high-lift-devices', icon: <Activity className="w-5 h-5" /> },
    { name: language === 'en' ? 'Ch 4: Aircraft Stability' : 'الفصل 4: استقرار الطائرة', path: 'stability', icon: <Target className="w-5 h-5" /> },
    { name: language === 'en' ? 'Ch 5: Flight Controls' : 'الفصل 5: أسطح التحكم', path: 'controls', icon: <BookOpen className="w-5 h-5" /> }
  ];

  return (
    <div className="h-[100dvh] bg-[#020617] flex flex-col text-slate-200 overflow-hidden font-sans" dir={language === 'ar' ? 'rtl' : 'ltr'}>
      {/* Premium Top Header */}
      <header className="h-16 flex-shrink-0 bg-[#0f172a]/80 backdrop-blur-xl border-b border-white/5 flex items-center justify-between px-4 sm:px-6 z-40 relative">
        <div className="flex items-center gap-3">
          <button 
            className="md:hidden text-slate-400 hover:text-white"
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          >
            {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
          <Link to="/" className="hidden sm:flex items-center gap-2 text-slate-400 hover:text-white transition-colors">
            <ArrowLeft size={18} className={language === 'ar' ? 'rotate-180' : ''} />
            <span className="font-semibold text-sm">{language === 'en' ? 'Back to Home' : 'العودة للرئيسية'}</span>
          </Link>
        </div>
        
        <div className="absolute left-1/2 -translate-x-1/2 flex items-center">
            {tenant?.logo_url && <img src={tenant.logo_url} alt="Logo" className="h-6 w-auto mr-2 object-contain" />}
            <span className="font-extrabold text-lg sm:text-xl tracking-wider bg-clip-text text-transparent bg-gradient-to-r from-sky-400 to-emerald-400">
              {tenant?.name || "Vortex-Gen"}
            </span>
            <span className="hidden sm:inline-block mx-3 text-[10px] font-mono tracking-widest text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded-full border border-emerald-400/20">
              ACADEMY
            </span>
        </div>

        {/* Language Toggle */}
        <button 
          onClick={toggleLanguage}
          className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-800/50 hover:bg-slate-700 transition-colors text-xs sm:text-sm font-medium"
        >
          <Languages size={16} className="text-sky-400" />
          <span className="hidden sm:inline">{language === 'en' ? 'عربي' : 'English'}</span>
        </button>
      </header>

      <main className="flex-1 flex overflow-hidden relative">
        {/* Ambient Background Glow */}
        <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_60%_50%_at_50%_0%,rgba(56,189,248,0.03),transparent)]" />

        {/* Sidebar Navigation */}
        <aside className={`${isSidebarOpen ? 'translate-x-0' : (language === 'ar' ? 'translate-x-full' : '-translate-x-full')} md:translate-x-0 absolute md:relative z-30 transition-transform duration-300 w-72 h-full flex-shrink-0 bg-[#0f172a]/95 md:bg-[#0f172a]/40 backdrop-blur-md border-r border-l border-white/5 flex flex-col pt-8`}>
          <div className="px-6 mb-8 flex justify-between items-center">
            <div>
              <h2 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-2">
                {language === 'en' ? 'Course Syllabus' : 'منهج الدورة'}
              </h2>
              <p className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                {language === 'en' ? 'Principles of Flight' : 'مبادئ الطيران'}
              </p>
            </div>
          </div>

          <nav className="flex-1 space-y-1 px-4 overflow-y-auto">
            {chapters.map((tab) => (
              <NavLink
                key={tab.name}
                to={tab.path}
                onClick={() => setIsSidebarOpen(false)}
                className={({ isActive }) =>
                  `flex items-center space-x-3 rtl:space-x-reverse px-4 py-3.5 rounded-xl text-sm font-medium transition-all duration-300 ${
                    isActive
                      ? 'bg-gradient-to-r from-sky-500/20 to-emerald-500/10 text-sky-300 border border-sky-500/30 shadow-[0_0_15px_rgba(56,189,248,0.1)]'
                      : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200 border border-transparent'
                  }`
                }
              >
                <div className={`p-1.5 rounded-md ${window.location.pathname.includes(tab.path) ? 'bg-sky-500/20' : 'bg-slate-800'}`}>
                  {tab.icon}
                </div>
                <span className="leading-snug">{tab.name}</span>
              </NavLink>
            ))}
          </nav>

          {/* Credits */}
          <div className="mt-auto p-4 border-t border-white/5 text-sm font-bold font-mono tracking-wider bg-slate-900/50">
            <div className="mb-1 text-slate-300 text-xs uppercase">{language === 'en' ? 'Created by:' : 'صنع بواسطة:'}</div>
            <div className="text-emerald-400 drop-shadow-md">Youssef Usama Hegazy</div>
            <div className="text-sky-400 drop-shadow-md mt-1">Eman Elsayed Abdelhamed</div>
          </div>
        </aside>

        {/* Mobile Overlay */}
        {isSidebarOpen && (
          <div 
            className="absolute inset-0 bg-black/50 z-20 md:hidden"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        {/* Main Content Area (Scrollytelling Container) */}
        <div className="flex-1 overflow-hidden relative flex flex-col bg-[#020617] z-10 md:shadow-[-10px_0_30px_rgba(0,0,0,0.5)]">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
