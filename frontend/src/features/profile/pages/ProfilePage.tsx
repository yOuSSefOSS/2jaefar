import React from 'react';
import { useAppContext } from '@/store';
import { Download, Trash2, LogOut } from 'lucide-react';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/supabaseClient';
import { useNavigate } from 'react-router-dom';

const Profile = () => {
  const { customAirfoils, setCustomAirfoils, lastSimulationData, activeShapeIdGlobal, user, subscriptionTier } = useAppContext();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  const handleDownloadCSV = () => {
     if (!lastSimulationData || lastSimulationData.length === 0) return;
     let csvContent = "data:text/csv;charset=utf-8,Angle of Attack,Lift Coefficient (Cl),Drag Coefficient (Cd)\n";
     lastSimulationData.forEach(row => {
         csvContent += `${row.aoa},${row.cl},${row.cd}\n`;
     });
     const encodedUri = encodeURI(csvContent);
     const link = document.createElement("a");
     link.setAttribute("href", encodedUri);
     link.setAttribute("download", `telemetry_${activeShapeIdGlobal}.csv`);
     document.body.appendChild(link);
     link.click();
     link.parentNode.removeChild(link);
  };

  const deleteAirfoil = (id) => {
     setCustomAirfoils(prev => prev.filter(a => a.id !== id));
  };

  return (
    <div className="w-full h-full premium-glass flex flex-col p-8 overflow-y-auto custom-scrollbar">
       <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="flex items-center gap-6 mb-8 border-b border-white/10 pb-6"
       >
          <div className="w-20 h-20 bg-brand-800 rounded-full border-2 border-[var(--color-accent-blue)] flex items-center justify-center overflow-hidden shadow-[0_0_20px_rgba(14,165,233,0.3)] shrink-0">
             <div className="w-full h-full bg-[radial-gradient(circle_at_30%_30%,var(--color-accent-neon),var(--color-accent-blue))] opacity-80 animate-pulse"></div>
          </div>
          <div>
             <h1 className="text-3xl font-bold text-white tracking-widest uppercase mb-1">{user?.email || 'Guest User'}</h1>
             <p className="text-[var(--color-accent-neon)] font-mono text-sm uppercase">Tier: {subscriptionTier}</p>
          </div>
          <button 
             onClick={handleLogout}
             className="ml-auto p-3 text-red-400 hover:text-white hover:bg-red-500/20 border border-red-500/20 hover:border-red-500 rounded-lg transition-all flex items-center gap-2"
          >
             <LogOut size={18} /> <span className="text-sm font-bold tracking-widest uppercase hidden sm:inline">Logout</span>
          </button>
       </motion.div>
       
       <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-5xl">
          {/* Telemetry Actions */}
          <motion.div 
             initial={{ opacity: 0, x: -20 }}
             animate={{ opacity: 1, x: 0 }}
             transition={{ duration: 0.5, delay: 0.2 }}
             className="bg-brand-800/40 p-6 rounded-2xl border border-white/5 flex flex-col backdrop-blur-md shadow-xl"
          >
             <h2 className="text-xs text-brand-400 tracking-widest font-mono mb-4 uppercase">Data Exports</h2>
             <p className="text-sm text-brand-300 mb-6">Generate an Excel-ready CSV array of the last ran fluid dynamic calculation trace.</p>
             <button 
                onClick={handleDownloadCSV}
                disabled={!lastSimulationData || lastSimulationData.length === 0}
                className="w-full flex items-center justify-center gap-2 p-3 rounded-lg bg-[var(--color-accent-blue)]/10 text-[var(--color-accent-neon)] border border-[var(--color-accent-blue)]/50 hover:bg-[var(--color-accent-blue)] hover:text-white transition-all shadow-[0_0_10px_rgba(14,165,233,0.2)] disabled:opacity-50 disabled:cursor-not-allowed uppercase text-xs font-bold tracking-widest"
             >
                <Download size={16}/> Extract Telemetry to CSV
             </button>
             {lastSimulationData && lastSimulationData.length > 0 && (
                <div className="text-[10px] text-brand-500 font-mono text-center mt-3">Target: {activeShapeIdGlobal.toUpperCase()} | {lastSimulationData.length} records ready.</div>
             )}
          </motion.div>

          {/* Airfoil Hangar */}
          <motion.div 
             initial={{ opacity: 0, x: 20 }}
             animate={{ opacity: 1, x: 0 }}
             transition={{ duration: 0.5, delay: 0.3 }}
             className="bg-brand-800/40 p-6 rounded-2xl border border-white/5 flex flex-col max-h-[300px] backdrop-blur-md shadow-xl"
          >
             <h2 className="text-xs text-brand-400 tracking-widest font-mono mb-4 uppercase">Airfoil Hangar</h2>
             <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col gap-3 pr-2">
                {customAirfoils.length === 0 ? (
                   <div className="text-sm text-brand-500 italic text-center mt-8">No custom geometries stored yet.</div>
                ) : (
                   customAirfoils.map((a, index) => (
                     <motion.div 
                       initial={{ opacity: 0, y: 10 }}
                       animate={{ opacity: 1, y: 0 }}
                       transition={{ delay: 0.4 + (index * 0.1) }}
                       key={a.id} 
                       className="flex justify-between items-center p-3 rounded-xl border border-white/5 bg-black/40 hover:bg-black/60 hover:border-[var(--color-accent-blue)]/50 transition-all shadow-sm"
                     >
                       <div>
                         <div className="text-sm font-bold text-white font-mono">{a.name}</div>
                         <div className="text-[10px] text-brand-400">{a.airfoilData ? a.airfoilData.length : 0} Points</div>
                       </div>
                       <button onClick={() => deleteAirfoil(a.id)} className="p-2 text-brand-500 hover:text-[var(--color-accent-pink)] hover:bg-[var(--color-accent-pink)]/10 rounded-lg transition-all">
                          <Trash2 size={16}/>
                       </button>
                     </motion.div>
                   ))
                )}
             </div>
          </motion.div>
       </div>

    </div>
  );
};

export default Profile;
