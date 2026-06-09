import React from 'react';
import { useActiveAnalysis } from '../hooks/useActiveAnalysis';
import { EmptyState } from '../components/EmptyState';
import { Grid, Sparkles, AlertTriangle, ShieldCheck, TrendingUp } from 'lucide-react';

export const SWOTAnalysis = () => {
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

  const { strengths, weaknesses, opportunities, threats } = analysis.swot_analysis;

  const swotItems = [
    {
      title: 'Strengths',
      items: strengths,
      color: 'border-emerald-500 bg-emerald-500/5 dark:bg-emerald-950/10 text-emerald-600 dark:text-emerald-400',
      bulletColor: 'text-emerald-500',
      icon: ShieldCheck
    },
    {
      title: 'Weaknesses',
      items: weaknesses,
      color: 'border-rose-500 bg-rose-500/5 dark:bg-rose-950/10 text-rose-600 dark:text-rose-400',
      bulletColor: 'text-rose-500',
      icon: AlertTriangle
    },
    {
      title: 'Opportunities',
      items: opportunities,
      color: 'border-sky-500 bg-sky-500/5 dark:bg-sky-950/10 text-sky-600 dark:text-sky-400',
      bulletColor: 'text-sky-500',
      icon: TrendingUp
    },
    {
      title: 'Threats',
      items: threats,
      color: 'border-amber-500 bg-amber-500/5 dark:bg-amber-950/10 text-amber-600 dark:text-amber-400',
      bulletColor: 'text-amber-500',
      icon: Sparkles
    }
  ];

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-8">
      {/* Title */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight flex items-center gap-2">
          SWOT Analysis <Grid className="h-7 w-7 text-sky-500" />
        </h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
          Strategic framework mapping internal capabilities and market factors.
        </p>
      </div>

      {/* SWOT Matrix Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {swotItems.map((cell) => {
          const Icon = cell.icon;
          return (
            <div
              key={cell.title}
              className={`border rounded-2xl p-6 shadow-sm flex flex-col justify-between ${cell.color}`}
            >
              <div className="space-y-4">
                <h3 className="text-lg font-bold flex items-center gap-2">
                  <Icon className="h-5 w-5" /> {cell.title}
                </h3>
                <ul className="space-y-3">
                  {cell.items.map((item, idx) => (
                    <li key={idx} className="text-sm flex items-start gap-2 text-slate-700 dark:text-slate-300">
                      <span className={`font-bold ${cell.bulletColor} shrink-0 mt-0.5`}>•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
