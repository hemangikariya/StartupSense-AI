import React from 'react';
import { useActiveAnalysis } from '../hooks/useActiveAnalysis';
import { EmptyState } from '../components/EmptyState';
import { Target, Users, Smile, Frown } from 'lucide-react';

export const TargetAudience = () => {
  const { analysis, loading, error, activeIdeaId, reload } = useActiveAnalysis();

  if (loading) {
    return <div className="p-8"><div className="h-6 w-32 bg-slate-200 dark:bg-slate-800 rounded animate-pulse" /></div>;
  }
  if (error === 'NOT_ANALYZED') {
    return <EmptyState type="NOT_ANALYZED" activeIdeaId={activeIdeaId} onValidateComplete={reload} />;
  }
  if (!activeIdeaId || !analysis) {
    return <EmptyState type="NO_STARTUPS" />;
  }

  const personas = [
    {
      role: 'Early Adopter Founder',
      need: 'Needs rapid market validation and low-cost growth channels.',
      frustration: 'Lacks VC connections, spends too much on unvalidated coding.',
      icon: Smile
    },
    {
      role: 'Corporate Project Manager',
      need: 'Needs compliance reports and technical feasibility metrics.',
      frustration: 'Stuck with legacy spreadsheets and manual research timelines.',
      icon: Users
    }
  ];

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-8">
      {/* Title */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight flex items-center gap-2">
          Target Audience & Personas <Target className="h-7 w-7 text-sky-500" />
        </h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
          Detailed customer demographics, frictions, and persona mapping.
        </p>
      </div>

      {/* Overview */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Audience Profile</h3>
        <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
          {analysis.target_audience}
        </p>
      </div>

      {/* Personas list */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {personas.map((per) => {
          const Icon = per.icon;
          return (
            <div
              key={per.role}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4"
            >
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 bg-sky-500/10 text-sky-500 rounded-xl flex items-center justify-center">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="font-bold text-base">{per.role}</h3>
              </div>
              <div className="space-y-3 pt-3 border-t border-slate-100 dark:border-slate-800/80">
                <div className="flex items-start gap-2 text-xs">
                  <Smile className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span className="text-slate-600 dark:text-slate-300"><b>Need:</b> {per.need}</span>
                </div>
                <div className="flex items-start gap-2 text-xs">
                  <Frown className="h-4 w-4 text-rose-500 shrink-0 mt-0.5" />
                  <span className="text-slate-600 dark:text-slate-300"><b>Friction:</b> {per.frustration}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
