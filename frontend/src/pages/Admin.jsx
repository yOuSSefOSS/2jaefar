import React, { useState, useEffect } from 'react';
import { Shield, Loader2, RefreshCw } from 'lucide-react';
import { motion } from 'framer-motion';

const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const Admin = () => {
  const [users, setUsers] = useState([]);
  const [workspaces, setWorkspaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [movingUserId, setMovingUserId] = useState(null);

  const fetchAdminData = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('vortex_session');
      if (!token) throw new Error('Not logged in');

      const [usersRes, wsRes] = await Promise.all([
        fetch(`${apiBase}/api/admin/users`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${apiBase}/api/admin/workspaces`, { headers: { Authorization: `Bearer ${token}` } })
      ]);

      if (usersRes.status === 403 || wsRes.status === 403) {
        throw new Error("403 Forbidden: You do not have access to this admin dashboard.");
      }

      const usersJson = await usersRes.json();
      const wsJson = await wsRes.json();

      if (!usersRes.ok) throw new Error(usersJson.error || 'Failed to fetch users');
      if (!wsRes.ok) throw new Error(wsJson.error || 'Failed to fetch workspaces');

      setUsers(usersJson.users || []);
      setWorkspaces(wsJson.workspaces || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleMoveUser = async (userId, newWorkspaceId) => {
    if (!window.confirm("Are you sure you want to move this user? Their dashboard will instantly switch workspaces.")) return;
    
    setMovingUserId(userId);
    try {
      const token = localStorage.getItem('vortex_session');
      const res = await fetch(`${apiBase}/api/admin/move-user`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ userId, newWorkspaceId })
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to move user');

      // Update local state instantly
      setUsers(users.map(u => u.user_id === userId ? { ...u, workspace_id: newWorkspaceId } : u));
    } catch (err) {
      alert("Error moving user: " + err.message);
    } finally {
      setMovingUserId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-[50vh]">
        <Loader2 className="w-8 h-8 text-[#0ea5e9] animate-spin mb-4" />
        <p className="text-[#64748b]">Loading secure data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-[50vh] px-6 text-center">
        <Shield className="w-16 h-16 text-red-500/50 mb-6" />
        <h2 className="text-xl font-bold text-white mb-2">Access Denied</h2>
        <p className="text-[#64748b] max-w-md">{error}</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-12">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-white flex items-center gap-3">
            <Shield className="w-8 h-8 text-[#0ea5e9]" />
            Workspace Admin
          </h1>
          <p className="text-[#64748b] mt-2">Instantly move users between workspaces.</p>
        </div>
        <button 
          onClick={fetchAdminData}
          className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-sm text-white transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh Data
        </button>
      </div>

      <div className="bg-[#0a0f18] border border-[#1e293b] rounded-2xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-[#0f172a] border-b border-[#1e293b] text-[#94a3b8] uppercase text-xs tracking-wider">
              <tr>
                <th className="px-6 py-4 font-semibold">User Details</th>
                <th className="px-6 py-4 font-semibold">Current Role</th>
                <th className="px-6 py-4 font-semibold">Assigned Workspace</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1e293b]">
              {users.map((user) => (
                <motion.tr 
                  key={user.user_id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="hover:bg-white/[0.02] transition-colors"
                >
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="text-white font-medium">{user.display_name}</span>
                      <span className="text-[#64748b] text-xs mt-0.5">{user.email}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2.5 py-1 rounded-md bg-[#1e293b] text-[#94a3b8] text-xs capitalize">
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <select
                        value={user.workspace_id || ''}
                        disabled={movingUserId === user.user_id}
                        onChange={(e) => handleMoveUser(user.user_id, e.target.value)}
                        className={`w-64 bg-[#020817] border ${movingUserId === user.user_id ? 'border-[#0ea5e9]' : 'border-[#1e293b]'} text-white text-sm rounded-lg focus:ring-[#0ea5e9] focus:border-[#0ea5e9] block p-2.5 transition-colors disabled:opacity-50`}
                      >
                        {workspaces.map(ws => (
                          <option key={ws.id} value={ws.id}>
                            {ws.name} ({ws.plan.toUpperCase()})
                          </option>
                        ))}
                      </select>
                      {movingUserId === user.user_id && <Loader2 className="w-4 h-4 text-[#0ea5e9] animate-spin" />}
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Admin;
