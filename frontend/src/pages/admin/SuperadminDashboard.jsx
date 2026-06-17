import React, { useState, useEffect } from 'react';
import { supabase } from '../../services/supabaseClient';
import { useAppContext } from '../../context/AppContext';
import DashboardLayout from '../../layouts/DashboardLayout';
import { Shield, Plus, Building, Settings, Trash2, CheckCircle, AlertTriangle } from 'lucide-react';

export default function SuperadminDashboard() {
  const { user } = useAppContext();
  const [academies, setAcademies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [unauthorized, setUnauthorized] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState({ name: '', domain_identifier: '', primary_color: '#0ea5e9' });

  useEffect(() => {
    fetchAcademies();
  }, [user]);

  const fetchAcademies = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const { data: myProfile, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

      if (profileError || !myProfile || myProfile.role !== 'superadmin') {
        setUnauthorized(true);
        setLoading(false);
        return;
      }

      const { data: academyList, error } = await supabase
        .from('academies')
        .select('*')
        .order('created_at', { ascending: false });

      if (academyList) setAcademies(academyList);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAcademy = async (e) => {
    e.preventDefault();
    try {
      const { error } = await supabase
        .from('academies')
        .insert([formData]);

      if (!error) {
        setShowAddModal(false);
        setFormData({ name: '', domain_identifier: '', primary_color: '#0ea5e9' });
        fetchAcademies();
      } else {
        alert('Error creating academy: ' + error.message);
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center h-full">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-white"></div>
        </div>
      </DashboardLayout>
    );
  }

  if (unauthorized) {
    return (
      <DashboardLayout>
        <div className="max-w-4xl mx-auto px-4 py-8 mt-12 text-center">
          <Shield className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-white mb-2">Unauthorized Access</h1>
          <p className="text-slate-400">You must be a Superadmin to view this page.</p>
          <div className="mt-8 bg-[#0b1221] border border-white/10 p-6 rounded-xl text-left inline-block">
            <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2"><Settings className="w-5 h-5 text-[#0ea5e9]" /> How to gain access:</h3>
            <ol className="list-decimal list-inside text-slate-300 space-y-2 text-sm font-mono mb-4">
              <li>Open your Supabase Dashboard</li>
              <li>Go to the <span className="text-[#0ea5e9]">profiles</span> table</li>
              <li>Find your user row</li>
              <li>Change your <span className="text-pink-500">role</span> column to <span className="text-[#10b981]">superadmin</span></li>
              <li>Refresh this page</li>
            </ol>

            <button 
              onClick={async () => {
                const token = (await supabase.auth.getSession()).data?.session?.access_token;
                if (!token) return;
                const res = await fetch('http://localhost:5000/api/dev/make-superadmin', {
                  method: 'POST',
                  headers: { 'Authorization': `Bearer ${token}` }
                });
                if (res.ok) {
                  window.location.reload();
                } else {
                  alert('Dev fast-track failed. Check server logs.');
                }
              }}
              className="mt-4 w-full bg-pink-600/20 hover:bg-pink-600/40 text-pink-400 border border-pink-500/30 px-4 py-2 rounded-lg text-sm font-bold transition-colors"
            >
              Dev Fast-Track: Make Me Superadmin Now
            </button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white flex items-center gap-3">
              <Shield className="w-8 h-8 text-pink-500" /> Superadmin Dashboard
            </h1>
            <p className="text-slate-400 mt-1">Manage tenant academies, licenses, and global settings.</p>
          </div>
          <button 
            onClick={() => setShowAddModal(true)}
            className="bg-pink-600 hover:bg-pink-700 text-white px-4 py-2 rounded-lg font-bold transition-colors flex items-center gap-2"
          >
            <Plus className="w-5 h-5" /> New Academy
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {academies.map((academy) => (
            <div key={academy.id} className="bg-white/5 border border-white/10 rounded-2xl p-6 relative overflow-hidden group">
              <div 
                className="absolute top-0 left-0 w-full h-1" 
                style={{ backgroundColor: academy.primary_color || '#0ea5e9' }}
              />
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-black/50 border border-white/10 flex items-center justify-center p-2">
                    {academy.logo_url ? (
                      <img src={academy.logo_url} alt="Logo" className="w-full h-full object-contain" />
                    ) : (
                      <Building className="w-5 h-5 text-slate-400" />
                    )}
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-white">{academy.name}</h3>
                    <p className="text-xs font-mono text-slate-400">{academy.domain_identifier}.vortex-gen.com</p>
                  </div>
                </div>
              </div>
              
              <div className="space-y-3 mb-6">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-400">License Status</span>
                  <span className="bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded text-xs font-bold border border-emerald-500/20 flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" /> Active
                  </span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-400">Primary Color</span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono">{academy.primary_color || 'Default'}</span>
                    <div className="w-4 h-4 rounded-full border border-white/20" style={{ backgroundColor: academy.primary_color || '#0ea5e9' }} />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2 border-t border-white/10 pt-4 mt-auto">
                <button className="p-2 hover:bg-white/10 rounded-lg text-slate-400 hover:text-white transition-colors">
                  <Settings className="w-4 h-4" />
                </button>
                <button className="p-2 hover:bg-red-500/20 rounded-lg text-slate-400 hover:text-red-400 transition-colors">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}

          {academies.length === 0 && (
            <div className="col-span-full bg-white/5 border border-white/10 border-dashed rounded-2xl p-12 text-center text-slate-400">
              <Building className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No academies registered yet.</p>
            </div>
          )}
        </div>

        {/* Add Modal */}
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <div className="bg-[#0b1221] border border-white/10 rounded-2xl w-full max-w-md overflow-hidden">
              <div className="p-6 border-b border-white/10">
                <h2 className="text-xl font-bold text-white">Register New Academy</h2>
              </div>
              <form onSubmit={handleCreateAcademy} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-bold text-slate-400 mb-1">Academy Name</label>
                  <input 
                    type="text" 
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-[#0ea5e9]"
                    placeholder="e.g., Embry-Riddle"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-400 mb-1">Domain Identifier</label>
                  <input 
                    type="text" 
                    required
                    value={formData.domain_identifier}
                    onChange={(e) => setFormData({...formData, domain_identifier: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '')})}
                    className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-[#0ea5e9] font-mono"
                    placeholder="embry-riddle"
                  />
                  <p className="text-xs text-slate-500 mt-1">Used for custom login URLs.</p>
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-400 mb-1">Brand Color</label>
                  <div className="flex gap-4">
                    <input 
                      type="color" 
                      value={formData.primary_color}
                      onChange={(e) => setFormData({...formData, primary_color: e.target.value})}
                      className="w-12 h-10 rounded cursor-pointer bg-black/50 border border-white/10"
                    />
                    <input 
                      type="text" 
                      value={formData.primary_color}
                      onChange={(e) => setFormData({...formData, primary_color: e.target.value})}
                      className="flex-1 bg-black/50 border border-white/10 rounded-lg px-4 py-2 text-white font-mono"
                    />
                  </div>
                </div>
                
                <div className="flex justify-end gap-3 pt-4">
                  <button 
                    type="button" 
                    onClick={() => setShowAddModal(false)}
                    className="px-4 py-2 rounded-lg text-slate-400 hover:text-white transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className="bg-pink-600 hover:bg-pink-700 text-white px-6 py-2 rounded-lg font-bold transition-colors"
                  >
                    Create Academy
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </DashboardLayout>
  );
}
