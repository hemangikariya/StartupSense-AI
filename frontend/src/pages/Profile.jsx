import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useCurrency, SUPPORTED_CURRENCIES } from '../context/CurrencyContext';
import { User, ShieldAlert, Award, Coins, CheckCircle2 } from 'lucide-react';

export const Profile = () => {
  const { user } = useAuth();
  const { selectedCurrency, setCurrency, formatCurrency } = useCurrency();

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-8">
      {/* Title */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight flex items-center gap-2">
          Founder Profile <User className="h-7 w-7 text-sky-500" />
        </h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
          Review account properties, authorization privileges, and global workspace preferences.
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

      {/* Global Currency Preference Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 shadow-sm space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-sky-500/10 text-sky-500">
              <Coins className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold">Global Reporting Currency</h3>
              <p className="text-xs text-slate-400">All financial values, charts, and PDF reports convert automatically.</p>
            </div>
          </div>
          <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center gap-1">
            <CheckCircle2 className="h-3 w-3" /> Live Sync
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
          {Object.values(SUPPORTED_CURRENCIES).map((c) => {
            const isSelected = selectedCurrency === c.code;
            return (
              <button
                key={c.code}
                onClick={() => setCurrency(c.code)}
                className={`p-3 rounded-xl border text-left transition flex flex-col justify-between gap-2 ${
                  isSelected
                    ? 'border-sky-500 bg-sky-500/5 ring-2 ring-sky-500/20'
                    : 'border-slate-200 dark:border-slate-800 hover:border-slate-400 dark:hover:border-slate-700 bg-slate-50/50 dark:bg-slate-950/20'
                }`}
              >
                <div className="flex justify-between items-center w-full">
                  <span className="text-base">{c.flag}</span>
                  <span className={`text-xs font-bold ${isSelected ? 'text-sky-500' : 'text-slate-400'}`}>{c.symbol}</span>
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-800 dark:text-slate-200">{c.code}</p>
                  <p className="text-[10px] text-slate-400 truncate">{c.name}</p>
                </div>
              </button>
            );
          })}
        </div>

        <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex justify-between items-center text-xs text-slate-500">
          <span>Example: $1,000,000 USD displays as:</span>
          <span className="font-bold text-sky-500 text-sm">{formatCurrency(1000000, { compact: true })}</span>
        </div>
      </div>
    </div>
  );
};
