import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { apiFetch } from '../../services/apiService';
import { useAppContext } from '../../context/AppContext';
import DashboardLayout from '../../layouts/DashboardLayout';
import { Users, Key, Loader2, AlertCircle, Plus, Shield, UserCog } from 'lucide-react';

const AcademyAdmin = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { userRole, accountType, academyId } = useAppContext();
  
  const [activeTab, setActiveTab] = useState('members');
  const [members, setMembers] = useState([]);
  const [invites, setInvites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [generateCount, setGenerateCount] = useState(50);
  const [generating, setGenerating] = useState(false);

  // We use the ID from URL if provided (for superadmin), otherwise fallback to the user's academyId
  const targetAcademyId = id || academyId;

  useEffect(() => {
    if (!targetAcademyId) {
      navigate('/explore');
      return;
    }
    
    // Auth Check on frontend
    if (accountType !== 'superadmin' && userRole !== 'academy_owner') {
      navigate('/error/403');
      return;
    }

    fetchData();
  }, [targetAcademyId, accountType, userRole]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [membersRes, invitesRes] = await Promise.all([
        apiFetch(`/api/academy/${targetAcademyId}/members`),
        apiFetch(`/api/academy/${targetAcademyId}/invites`)
      ]);
      setMembers(membersRes.members || []);
      setInvites(invitesRes.invites || []);
    } catch (err) {
      setError(err.message || 'Failed to load academy data.');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateCodes = async (e) => {
    e.preventDefault();
    if (!generateCount || generateCount < 1) return;
    setGenerating(true);
    setError('');
    try {
      await apiFetch(`/api/academy/${targetAcademyId}/generate-codes`, {
        method: 'POST',
        body: JSON.stringify({ count: parseInt(generateCount) })
      });
      fetchData(); // Refresh list
    } catch (err) {
      setError(err.message || 'Failed to generate codes.');
    } finally {
      setGenerating(false);
    }
  };

  const handleUpdateRole = async (userId, newRole) => {
    try {
      await apiFetch(`/api/academy/${targetAcademyId}/update-role`, {
        method: 'POST',
        body: JSON.stringify({ userId, role: newRole })
      });
      fetchData();
    } catch (err) {
      setError(err.message || 'Failed to update role.');
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex h-full items-center justify-center p-8">
          <Loader2 className="animate-spin text-sky-400 w-8 h-8" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-8 max-w-6xl mx-auto space-y-8 font-sans">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Academy Administration</h1>
        <p className="text-slate-400">Manage members and generate invite codes for your academy.</p>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-4 rounded-xl flex items-center gap-3">
          <AlertCircle size={20} />
          <span>{error}</span>
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b border-slate-700/50">
        <button 
          onClick={() => setActiveTab('members')}
          className={`px-6 py-3 font-medium text-sm flex items-center gap-2 border-b-2 transition-colors ${activeTab === 'members' ? 'border-sky-400 text-sky-400' : 'border-transparent text-slate-400 hover:text-slate-300'}`}
        >
          <Users size={16} /> Members
        </button>
        <button 
          onClick={() => setActiveTab('invites')}
          className={`px-6 py-3 font-medium text-sm flex items-center gap-2 border-b-2 transition-colors ${activeTab === 'invites' ? 'border-sky-400 text-sky-400' : 'border-transparent text-slate-400 hover:text-slate-300'}`}
        >
          <Key size={16} /> Invite Codes
        </button>
      </div>

      {activeTab === 'members' && (
        <div className="space-y-6">
          <div className="bg-slate-900/50 border border-slate-700/50 rounded-xl overflow-hidden">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-800/50 text-slate-300">
                <tr>
                  <th className="px-6 py-4 font-semibold">User</th>
                  <th className="px-6 py-4 font-semibold">Role</th>
                  <th className="px-6 py-4 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/50">
                {members.map(member => (
                  <tr key={member.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-medium text-slate-200">{member.display_name || 'Unknown User'}</div>
                      <div className="text-xs text-slate-500">{member.id}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-md text-xs font-medium border ${
                        member.role === 'academy_owner' ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20' :
                        member.role === 'instructor' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                        'bg-slate-500/10 text-slate-400 border-slate-500/20'
                      }`}>
                        {member.role === 'academy_owner' ? 'Owner' : member.role === 'instructor' ? 'Instructor' : 'Student'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {member.role !== 'academy_owner' && (
                        <select 
                          className="bg-slate-800 border border-slate-600 rounded px-2 py-1 text-xs text-slate-300 outline-none focus:border-sky-500"
                          value={member.role}
                          onChange={(e) => handleUpdateRole(member.id, e.target.value)}
                        >
                          <option value="student">Student</option>
                          <option value="instructor">Instructor</option>
                        </select>
                      )}
                    </td>
                  </tr>
                ))}
                {members.length === 0 && (
                  <tr>
                    <td colSpan="3" className="px-6 py-8 text-center text-slate-500">No members found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'invites' && (
        <div className="space-y-6">
          <div className="bg-slate-900/50 border border-slate-700/50 p-6 rounded-xl">
            <h3 className="text-lg font-semibold text-slate-200 mb-4 flex items-center gap-2">
              <Plus size={18} className="text-sky-400" />
              Generate New Codes
            </h3>
            <form onSubmit={handleGenerateCodes} className="flex gap-4 items-end">
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Number of codes</label>
                <input 
                  type="number" 
                  min="1" max="500"
                  className="bg-slate-950 border border-slate-700 rounded-lg px-4 py-2 text-slate-200 outline-none focus:border-sky-500 w-32"
                  value={generateCount}
                  onChange={e => setGenerateCount(e.target.value)}
                />
              </div>
              <button 
                type="submit"
                disabled={generating}
                className="bg-sky-500 hover:bg-sky-600 text-white px-6 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 disabled:opacity-50"
              >
                {generating ? <Loader2 size={16} className="animate-spin" /> : <Key size={16} />}
                Generate
              </button>
            </form>
          </div>

          <div className="bg-slate-900/50 border border-slate-700/50 rounded-xl overflow-hidden">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-800/50 text-slate-300">
                <tr>
                  <th className="px-6 py-4 font-semibold">Code</th>
                  <th className="px-6 py-4 font-semibold">Status</th>
                  <th className="px-6 py-4 font-semibold">Created</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/50">
                {invites.map(invite => (
                  <tr key={invite.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="px-6 py-4 font-mono text-sky-300 font-medium">{invite.code}</td>
                    <td className="px-6 py-4">
                      {invite.used ? (
                        <span className="px-2 py-1 bg-slate-500/10 text-slate-400 border border-slate-500/20 rounded-md text-xs">Used</span>
                      ) : (
                        <span className="px-2 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-md text-xs font-medium">Available</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-slate-400">{new Date(invite.created_at).toLocaleDateString()}</td>
                  </tr>
                ))}
                {invites.length === 0 && (
                  <tr>
                    <td colSpan="3" className="px-6 py-8 text-center text-slate-500">No invite codes generated yet.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
      </div>
    </DashboardLayout>
  );
};

export default AcademyAdmin;
