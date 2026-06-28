import React, { useState, useEffect } from 'react';
import { supabase } from '../../services/supabaseClient';
import { useAppContext } from '../../context/AppContext';
import DashboardLayout from '../../layouts/DashboardLayout';
import { useNavigate } from 'react-router-dom';
import { Shield, Plus, Building, Settings, Trash2, CheckCircle, AlertTriangle, UserPlus, Users } from 'lucide-react';
import { apiFetch } from '../../services/apiService';

export default function SuperadminDashboard() {
  const { user } = useAppContext();
  const navigate = useNavigate();
  const [academies, setAcademies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [unauthorized, setUnauthorized] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState({ name: '', domain_identifier: '', primary_color: '#0ea5e9' });
  const [selectedAcademy, setSelectedAcademy] = useState(null);
  const [academyMembers, setAcademyMembers] = useState([]);
  const [loadingMembers, setLoadingMembers] = useState(false);

  const fetchAcademyMembers = async (academyId) => {
    setLoadingMembers(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, display_name, role')
        .eq('academy_id', academyId);
      
      if (!error && data) {
        setAcademyMembers(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingMembers(false);
    }
  };

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
            <div 
              key={academy.id} 
              onClick={() => { setSelectedAcademy(academy); fetchAcademyMembers(academy.id); }}
              className="bg-white/5 border border-white/10 rounded-2xl p-6 relative overflow-hidden group cursor-pointer hover:bg-white/10 transition-colors"
            >
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

              <div className="flex justify-end gap-2 border-t border-white/10 pt-4 mt-auto relative z-10">
                <button 
                  onClick={(e) => { e.stopPropagation(); navigate(`/academy-admin/${academy.id}`); }}
                  className="px-3 py-1.5 bg-sky-500/10 hover:bg-sky-500/20 rounded-lg text-sky-400 hover:text-sky-300 transition-colors flex items-center gap-1.5 text-xs font-medium"
                >
                  <Users className="w-3.5 h-3.5" /> Manage Users
                </button>
                <button 
                  onClick={(e) => { e.stopPropagation(); /* TODO settings */ }}
                  className="p-1.5 hover:bg-white/10 rounded-lg text-slate-400 hover:text-white transition-colors"
                >
                  <Settings className="w-4 h-4" />
                </button>
                <button 
                  onClick={(e) => { e.stopPropagation(); /* TODO delete */ }}
                  className="p-1.5 hover:bg-red-500/20 rounded-lg text-slate-400 hover:text-red-400 transition-colors"
                >
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
        
        {/* Manage Academy Modal */}
        {selectedAcademy && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <div className="bg-[#0b1221] border border-white/10 rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
              <div className="p-6 border-b border-white/10 flex justify-between items-center" style={{ borderBottomColor: selectedAcademy.primary_color || '#0ea5e9' }}>
                <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                  <Building className="w-6 h-6" style={{ color: selectedAcademy.primary_color || '#0ea5e9' }} />
                  {selectedAcademy.name} Members
                </h2>
                <button onClick={() => setSelectedAcademy(null)} className="text-slate-400 hover:text-white transition-colors text-2xl leading-none">&times;</button>
              </div>
              
              <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
                {/* Member Add Section */}
                <div className="bg-white/5 border border-white/10 p-4 rounded-xl">
                  <h3 className="text-white font-bold mb-2 flex items-center gap-2"><UserPlus className="w-4 h-4 text-[#0ea5e9]"/> Add User to Academy</h3>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <input 
                      type="text" 
                      id="addUserEmail"
                      placeholder="Enter user email to add..."
                      className="flex-1 bg-black/30 border border-white/10 rounded-lg px-4 py-2 text-white focus:border-[#0ea5e9] focus:outline-none"
                    />
                    <select id="addUserRole" className="bg-black/30 border border-white/10 rounded-lg px-4 py-2 text-white focus:border-[#0ea5e9] focus:outline-none">
                      <option value="student">Student</option>
                      <option value="instructor">Instructor</option>
                      <option value="academy_owner">Academy Owner</option>
                    </select>
                    <button 
                      onClick={async () => {
                        const email = document.getElementById('addUserEmail').value;
                        const role = document.getElementById('addUserRole').value;
                        if(!email) return;
                        
                        // Because profiles doesn't contain email, we need to ask the backend.
                        // I will add a temporary fix: we will update the backend to handle this via API or directly here if we can query users.
                        try {
                          await apiFetch(`/api/admin/academy/${selectedAcademy.id}/add-member`, {
                            method: 'POST',
                            body: JSON.stringify({ email, role })
                          });
                          alert('User added to Academy!');
                          document.getElementById('addUserEmail').value = '';
                          fetchAcademyMembers(selectedAcademy.id);
                        } catch (err) {
                          alert('Failed to add user: ' + (err.message || 'Unknown error'));
                        }
                      }}
                      className="bg-[#0ea5e9] hover:bg-sky-500 text-white px-6 py-2 rounded-lg font-bold transition-colors"
                    >
                      Add Member
                    </button>
                  </div>
                </div>

                {/* Member List */}
                <div>
                  <h3 className="text-white font-bold mb-4">Current Members ({academyMembers.length})</h3>
                  {loadingMembers ? (
                     <div className="text-slate-400">Loading members...</div>
                  ) : academyMembers.length === 0 ? (
                     <div className="text-slate-500 bg-black/20 p-4 rounded-xl border border-white/5 text-center">No members found in this academy.</div>
                  ) : (
                    <div className="space-y-2">
                      {academyMembers.map(member => (
                        <div key={member.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-colors">
                          <div className="flex items-center gap-3 mb-3 sm:mb-0">
                            <div className="w-10 h-10 rounded-full bg-[#0ea5e9]/20 flex items-center justify-center text-[#0ea5e9] font-bold">
                              {member.display_name ? member.display_name[0].toUpperCase() : '?'}
                            </div>
                            <div>
                              <p className="text-white font-bold">{member.display_name || 'Unnamed User'}</p>
                              <p className="text-xs text-slate-400 font-mono">ID: {member.id.substring(0,8)}...</p>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                            <select 
                              value={member.role || 'student'}
                              onChange={async (e) => {
                                const newRole = e.target.value;
                                const { error } = await supabase.from('profiles').update({ role: newRole }).eq('id', member.id);
                                if (!error) {
                                  fetchAcademyMembers(selectedAcademy.id);
                                } else {
                                  alert('Failed to update role');
                                }
                              }}
                              className="bg-black/40 border border-white/10 text-white rounded-lg px-3 py-1 text-sm focus:outline-none"
                            >
                              <option value="student">Student</option>
                              <option value="instructor">Instructor</option>
                              <option value="academy_owner">Academy Owner</option>
                            </select>
                            
                            <button 
                              onClick={async () => {
                                if (confirm('Remove user from Academy?')) {
                                  const { error } = await supabase.from('profiles').update({ academy_id: null, role: 'student' }).eq('id', member.id);
                                  if (!error) fetchAcademyMembers(selectedAcademy.id);
                                  else alert('Failed to remove: ' + error.message);
                                }
                              }}
                              className="p-2 bg-red-500/10 text-red-400 hover:bg-red-500/20 rounded-lg transition-colors ml-2"
                              title="Remove from Academy"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </DashboardLayout>
  );
}
