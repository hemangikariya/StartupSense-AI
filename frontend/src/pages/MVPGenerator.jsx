import React from 'react';
import { useActiveAnalysis } from '../hooks/useActiveAnalysis';
import { EmptyState } from '../components/EmptyState';
import { Milestone, Calendar, CheckSquare } from 'lucide-react';

export const MVPGenerator = () => {
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

  const phases = analysis.mvp_roadmap.phases;

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-8">
      {/* Title */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight flex items-center gap-2">
          MVP Roadmap Generator <Milestone className="h-7 w-7 text-sky-500" />
        </h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
          Structured deliverables plan for rapid development sprints.
        </p>
      </div>

      {/* Timeline List */}
      <div className="space-y-6">
        {phases.map((phase, idx) => (
          <div
            key={phase.phase}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row gap-6"
          >
            {/* Header / Meta */}
            <div className="md:w-1/4 space-y-2">
              <span className="text-xs font-extrabold px-2.5 py-1 bg-sky-500/10 text-sky-500 rounded-full">
                PHASE {idx + 1}
              </span>
              <h3 className="font-bold text-base pt-2">{phase.phase}</h3>
              <div className="flex items-center gap-1.5 text-xs text-slate-400">
                <Calendar className="h-4 w-4" />
                <span>{phase.duration}</span>
              </div>
            </div>

            {/* Deliverables */}
            <div className="flex-1 space-y-3 md:border-l md:pl-6 border-slate-100 dark:border-slate-800/80">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Milestone Deliverables</h4>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {phase.deliverables.map((del) => (
                  <li
                    key={del}
                    className="text-xs text-slate-600 dark:text-slate-300 flex items-center gap-2 bg-slate-50 dark:bg-slate-950/20 p-2.5 rounded-lg border border-slate-100 dark:border-slate-800/60"
                  >
                    <CheckSquare className="h-4 w-4 text-emerald-500 shrink-0" />
                    <span>{del}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
