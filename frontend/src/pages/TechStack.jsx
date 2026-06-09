import React from 'react';
import { useActiveAnalysis } from '../hooks/useActiveAnalysis';
import { EmptyState } from '../components/EmptyState';
import { Code, Layers, Database, Cpu, Cloud } from 'lucide-react';

export const TechStack = () => {
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

  const stack = analysis.tech_stack;

  const stackItems = [
    { name: 'Frontend Framework', value: stack.frontend, icon: Code, color: 'text-amber-500 bg-amber-500/10' },
    { name: 'Backend Services', value: stack.backend, icon: Layers, color: 'text-sky-500 bg-sky-500/10' },
    { name: 'Database Engines', value: stack.database, icon: Database, color: 'text-indigo-500 bg-indigo-500/10' },
    { name: 'AI & Machine Learning', value: stack.ai_ml, icon: Cpu, color: 'text-emerald-500 bg-emerald-500/10' },
    { name: 'Cloud & Hosting', value: stack.hosting, icon: Cloud, color: 'text-rose-500 bg-rose-500/10' }
  ];

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-8">
      {/* Title */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight flex items-center gap-2">
          Technology Recommendations <Code className="h-7 w-7 text-sky-500" />
        </h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
          Optimized framework recommendations to scale infrastructure cost-effectively.
        </p>
      </div>

      {/* Tech Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {stackItems.map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.name}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm flex items-start gap-4"
            >
              <div className={`h-12 w-12 rounded-xl flex items-center justify-center shrink-0 ${item.color}`}>
                <Icon className="h-6 w-6" />
              </div>
              <div className="space-y-1">
                <h3 className="font-bold text-sm text-slate-400 uppercase tracking-wider">{item.name}</h3>
                <p className="font-extrabold text-slate-800 dark:text-slate-200 text-base">{item.value}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
