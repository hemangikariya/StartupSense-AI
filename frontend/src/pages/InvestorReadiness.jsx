import React from 'react';
import { useActiveAnalysis } from '../hooks/useActiveAnalysis';
import { EmptyState } from '../components/EmptyState';
import { Award, Landmark, TrendingUp, Lightbulb } from 'lucide-react';

export const InvestorReadiness = () => {
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

  const score = analysis.investor_readiness.investor_score;
  const potential = analysis.investor_readiness.funding_potential;
  const stage = analysis.investor_readiness.recommended_stage;
  const feedback = analysis.investor_readiness.feedback;

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-8">
      {/* Title */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight">Investor Readiness Dashboard</h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
          Score your venture readiness level to prepare for capital campaigns.
        </p>
      </div>

      {/* Main Score Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm flex flex-col items-center justify-center text-center">
          <div className="h-20 w-20 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center mb-4">
            <Award className="h-10 w-10" />
          </div>
          <span className="text-sm font-bold text-slate-500 uppercase tracking-wider">Investor Score</span>
          <span className="text-4xl font-extrabold text-emerald-500 mt-2">{score}/100</span>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm flex flex-col items-center justify-center text-center">
          <div className="h-20 w-20 rounded-full bg-sky-500/10 text-sky-500 flex items-center justify-center mb-4">
            <TrendingUp className="h-10 w-10" />
          </div>
          <span className="text-sm font-bold text-slate-500 uppercase tracking-wider">Funding Potential</span>
          <span className="text-2xl font-extrabold text-sky-500 mt-2">{potential}</span>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm flex flex-col items-center justify-center text-center">
          <div className="h-20 w-20 rounded-full bg-indigo-500/10 text-indigo-500 flex items-center justify-center mb-4">
            <Landmark className="h-10 w-10" />
          </div>
          <span className="text-sm font-bold text-slate-500 uppercase tracking-wider">Recommended Stage</span>
          <span className="text-xl font-extrabold text-indigo-500 mt-2">{stage}</span>
        </div>
      </div>

      {/* Actionable Feedback */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-6">
        <h3 className="text-lg font-bold flex items-center gap-2">
          <Lightbulb className="h-5 w-5 text-amber-500" /> Actionable Investor Recommendations
        </h3>
        <ul className="space-y-4">
          {feedback.map((item, idx) => (
            <li key={idx} className="flex gap-4 items-start bg-slate-50 dark:bg-slate-950/20 p-4 rounded-xl border border-slate-100 dark:border-slate-800/60">
              <div className="h-6 w-6 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                {idx + 1}
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                {item}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};
