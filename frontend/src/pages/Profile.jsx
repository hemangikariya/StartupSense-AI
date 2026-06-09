import React from 'react';
import { useAuth } from '../context/AuthContext';
import { User, ShieldAlert, Award } from 'lucide-react';

export const Profile = () => {
  const { user } = useAuth();

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-8">
      {/* Title */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight flex items-center gap-2">
          Founder Profile <User className="h-7 w-7 text-sky-500" />
        </h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
          Review and update account properties and authorization privileges.
        </p>
      </div>

      {/* Profile Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 shadow-sm space-y-6">
        <div className="flex items-center gap-4">
          <div className="h-16 w-16 bg-sky-500/10 text-sky-500 rounded-2xl flex items-center justify-center font-bold text-2xl shadow-sm">
            {user?.email?.charAt(0).toUpperCase()}
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200">{user?.full_name || 'Founder'}</h2>
            <p className="text-sm text-slate-400 mt-0.5">{user?.email}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-6 border-t border-slate-100 dark:border-slate-800/80">
          <div className="bg-slate-50 dark:bg-slate-950/20 p-4 rounded-xl border border-slate-100 dark:border-slate-800/60 flex items-center gap-3">
            <Award className="h-5 w-5 text-sky-500" />
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Access Role</p>
              <p className="text-sm font-bold capitalize mt-0.5">{user?.role || 'user'}</p>
            </div>
          </div>

          <div className="bg-slate-50 dark:bg-slate-950/20 p-4 rounded-xl border border-slate-100 dark:border-slate-800/60 flex items-center gap-3">
            <ShieldAlert className="h-5 w-5 text-emerald-500" />
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Workspace Health</p>
              <p className="text-sm font-bold mt-0.5">Active</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
