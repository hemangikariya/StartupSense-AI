import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_URL } from '../context/AuthContext';
import { Shield, Loader2, Users, FileText, CheckCircle } from 'lucide-react';

export const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const statsRes = await axios.get(`${API_URL}/admin/stats`);
      setStats(statsRes.data);

      const logsRes = await axios.get(`${API_URL}/admin/logs`);
      setLogs(logsRes.data);
    } catch (err) {
      console.error("Admin dashboard data fetch failed", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-8">
      {/* Title */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight flex items-center gap-2 text-rose-500">
          Admin Control Center <Shield className="h-7 w-7" />
        </h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
          Observability, audit logs, and operational controls.
        </p>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 text-rose-500 animate-spin" />
        </div>
      ) : (
        <>
          {/* Stats Grid */}
          {stats && (
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-6">
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Users</span>
                  <p className="text-2xl font-extrabold mt-1">{stats.users_count}</p>
                </div>
                <Users className="h-8 w-8 text-rose-500/20" />
              </div>
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Ideas</span>
                  <p className="text-2xl font-extrabold mt-1">{stats.ideas_count}</p>
                </div>
                <FileText className="h-8 w-8 text-indigo-500/20" />
              </div>
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Active Tickets</span>
                  <p className="text-2xl font-extrabold mt-1">{stats.tickets_count}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-emerald-500/20" />
              </div>
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">System Logs</span>
                  <p className="text-2xl font-extrabold mt-1">{stats.logs_count}</p>
                </div>
                <Shield className="h-8 w-8 text-amber-500/20" />
              </div>
            </div>
          )}

          {/* Audit Logs */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider">Operational Audit Logs</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-800 text-[10px] uppercase font-bold text-slate-400">
                    <th className="pb-3">Log ID</th>
                    <th className="pb-3">User ID</th>
                    <th className="pb-3">Action Description</th>
                    <th className="pb-3">Timestamp</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80 text-xs">
                  {logs.map((log) => (
                    <tr key={log.id}>
                      <td className="py-3 font-semibold">#{log.id}</td>
                      <td className="py-3">User {log.user_id}</td>
                      <td className="py-3 text-slate-600 dark:text-slate-350">{log.action}</td>
                      <td className="py-3 text-slate-400">{new Date(log.created_at).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
