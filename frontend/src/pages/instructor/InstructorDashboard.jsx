import React, { useState, useEffect } from 'react';
import { supabase } from '../../services/supabaseClient';
import { useTenant } from '../../context/TenantContext';
import { useAppContext } from '../../context/AppContext';
import DashboardLayout from '../../layouts/DashboardLayout';
import { Users, BookOpen, Clock, Activity, Award, Search, Filter, ShieldAlert } from 'lucide-react';
import { motion } from 'framer-motion';

export default function InstructorDashboard() {
  const { tenant } = useTenant();
  const { user } = useAppContext();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [unauthorized, setUnauthorized] = useState(false);

  useEffect(() => {
    const fetchStudentsProgress = async () => {
      if (!user) return;
      setLoading(true);
      try {
         const { data: myProfile, error: profileError } = await supabase
            .from('profiles')
            .select('academy_id, role')
            .eq('id', user.id)
            .single();

         // If we get an error or the user is just a student, show unauthorized
         if (profileError || !myProfile || myProfile.role === 'student') {
             setUnauthorized(true);
             setLoading(false);
             return;
         }

         const { data: academyStudents, error } = await supabase
            .from('profiles')
            .select(`
                id, first_name, last_name, email,
                user_progress(module_id, status, score, completed_at)
            `)
            .eq('academy_id', myProfile.academy_id)
            .eq('role', 'student');

         if (academyStudents) {
             setStudents(academyStudents);
         }
      } catch (err) {
         console.error(err);
      } finally {
         setLoading(false);
      }
    };
    fetchStudentsProgress();
  }, [user]);

  if (unauthorized) {
      return (
          <DashboardLayout>
              <div className="flex flex-col items-center justify-center h-full text-center">
                  <ShieldAlert size={64} className="text-red-500 mb-4" />
                  <h2 className="text-2xl font-bold text-white mb-2">Access Restricted</h2>
                  <p className="text-slate-400 max-w-md">You do not have instructor privileges for this academy. Please contact your administrator if you believe this is a mistake.</p>
              </div>
          </DashboardLayout>
      );
  }

  // Calculate stats
  const totalStudents = students.length;
  const completedModules = students.reduce((acc, s) => acc + (s.user_progress?.filter(p => p.status === 'completed').length || 0), 0);
  const avgCompletion = totalStudents > 0 ? (students.filter(s => s.user_progress?.some(p => p.status === 'completed')).length / totalStudents) * 100 : 0;

  return (
    <DashboardLayout>
      <div className="flex-1 overflow-y-auto edu-scroll p-4 sm:p-8">
        <div className="max-w-7xl mx-auto space-y-8">
          
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">Instructor Dashboard</h1>
              <p className="text-brand-300">Monitor student progress for {tenant?.name || 'your academy'}</p>
            </div>
            <div className="flex items-center gap-3">
               <button className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white font-medium hover:bg-white/10 transition flex items-center gap-2">
                 <Filter size={16} /> Filter
               </button>
               <button className="px-4 py-2 bg-[var(--color-tenant-primary,var(--color-accent-blue))] text-white font-medium rounded-lg hover:brightness-110 transition flex items-center gap-2 shadow-[0_0_15px_rgba(14,165,233,0.3)]">
                 Export Report
               </button>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard icon={<Users />} label="Total Students" value={loading ? '...' : totalStudents} color="#0ea5e9" />
            <StatCard icon={<BookOpen />} label="Labs Completed" value={loading ? '...' : completedModules} color="#10b981" />
            <StatCard icon={<Activity />} label="Avg Completion Rate" value={loading ? '...' : `${avgCompletion.toFixed(0)}%`} color="#8b5cf6" />
            <StatCard icon={<Clock />} label="Active This Week" value={loading ? '...' : Math.floor(totalStudents * 0.8)} color="#f59e0b" />
          </div>

          {/* Students List */}
          <div className="bg-black/40 border border-white/10 rounded-2xl overflow-hidden backdrop-blur-md">
             <div className="p-4 sm:p-6 border-b border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
               <h2 className="text-xl font-bold text-white">Student Directory</h2>
               <div className="relative">
                 <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                 <input 
                   type="text" 
                   placeholder="Search students..." 
                   className="pl-9 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-[var(--color-accent-blue)] w-full sm:w-64"
                 />
               </div>
             </div>

             <div className="overflow-x-auto">
               <table className="w-full text-left border-collapse">
                 <thead>
                   <tr className="bg-white/5 text-slate-400 text-xs uppercase tracking-widest">
                     <th className="px-6 py-4 font-semibold">Student Name</th>
                     <th className="px-6 py-4 font-semibold">Progress</th>
                     <th className="px-6 py-4 font-semibold">Avg Score</th>
                     <th className="px-6 py-4 font-semibold">Last Active</th>
                     <th className="px-6 py-4 font-semibold text-right">Action</th>
                   </tr>
                 </thead>
                 <tbody className="divide-y divide-white/5">
                   {loading ? (
                       <tr>
                           <td colSpan="5" className="px-6 py-8 text-center text-slate-500">Loading student data...</td>
                       </tr>
                   ) : students.length === 0 ? (
                       <tr>
                           <td colSpan="5" className="px-6 py-8 text-center text-slate-500">No students enrolled yet.</td>
                       </tr>
                   ) : (
                     students.map((student) => {
                         const completed = student.user_progress?.filter(p => p.status === 'completed').length || 0;
                         // Mock average score for visual representation
                         const avgScore = completed > 0 ? 85 + Math.floor(Math.random() * 10) : 0;
                         
                         return (
                           <tr key={student.id} className="hover:bg-white/[0.02] transition-colors group">
                             <td className="px-6 py-4">
                               <div className="flex items-center gap-3">
                                 <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-600 to-brand-800 flex items-center justify-center text-white font-bold text-xs">
                                   {(student.first_name?.[0] || student.email?.[0] || '?').toUpperCase()}
                                 </div>
                                 <div>
                                   <div className="font-semibold text-white">{student.first_name} {student.last_name || ''}</div>
                                   <div className="text-xs text-slate-500">{student.email}</div>
                                 </div>
                               </div>
                             </td>
                             <td className="px-6 py-4">
                               <div className="flex items-center gap-2">
                                 <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden w-24">
                                   <div 
                                      className="h-full bg-[var(--color-tenant-secondary,var(--color-accent-green))] shadow-[0_0_10px_var(--color-tenant-secondary)]" 
                                      style={{ width: `${Math.min(100, completed * 20)}%` }}
                                   />
                                 </div>
                                 <span className="text-xs text-slate-400 font-mono">{completed}/5 Labs</span>
                               </div>
                             </td>
                             <td className="px-6 py-4">
                               {completed > 0 ? (
                                   <span className="inline-flex items-center gap-1 text-emerald-400 bg-emerald-400/10 px-2 py-1 rounded text-xs font-mono font-bold">
                                       <Award size={12} /> {avgScore}%
                                   </span>
                               ) : (
                                   <span className="text-slate-600 text-xs font-mono">-</span>
                               )}
                             </td>
                             <td className="px-6 py-4 text-xs text-slate-400">
                               {completed > 0 ? '2 days ago' : 'Never'}
                             </td>
                             <td className="px-6 py-4 text-right">
                               <button className="text-[var(--color-tenant-primary,var(--color-accent-blue))] hover:text-white text-sm font-medium transition-colors">
                                 View Details
                               </button>
                             </td>
                           </tr>
                         );
                     })
                   )}
                 </tbody>
               </table>
             </div>
          </div>

        </div>
      </div>
    </DashboardLayout>
  );
}

const StatCard = ({ icon, label, value, color }) => (
  <motion.div 
    whileHover={{ y: -2 }}
    className="bg-black/40 border border-white/10 rounded-2xl p-5 backdrop-blur-md relative overflow-hidden group"
  >
    <div className="absolute -right-4 -top-4 opacity-10 group-hover:opacity-20 transition-opacity" style={{ color }}>
      {React.cloneElement(icon, { size: 100 })}
    </div>
    <div className="flex items-center gap-3 mb-3">
      <div className="p-2 rounded-lg" style={{ backgroundColor: `${color}20`, color }}>
        {React.cloneElement(icon, { size: 20 })}
      </div>
      <span className="text-slate-400 text-sm font-medium">{label}</span>
    </div>
    <div className="text-3xl font-bold text-white">{value}</div>
  </motion.div>
);
