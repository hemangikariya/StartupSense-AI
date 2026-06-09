import React from 'react';
import { useActiveAnalysis } from '../hooks/useActiveAnalysis';
import { EmptyState } from '../components/EmptyState';
import { Sparkles, Dna, Rocket, Zap, Shield, TrendingUp } from 'lucide-react';

export const StartupDNA = () => {
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

  const {
    innovation_score,
    scalability_score,
    market_demand_score,
    execution_score,
    moat_score,
    overall_dna_score
  } = analysis.dna_analysis;

  const DNA_AXES = [
    { name: 'Innovation Index', value: innovation_score, icon: Sparkles, color: 'text-amber-500 bg-amber-500/10', desc: 'Measures novelty of solution compared to existing market solutions.' },
    { name: 'Scalability Grade', value: scalability_score, icon: Rocket, color: 'text-sky-500 bg-sky-500/10', desc: 'Venture capacity to increase revenue with minimal marginal cost.' },
    { name: 'Market Demand', value: market_demand_score, icon: TrendingUp, color: 'text-emerald-500 bg-emerald-500/10', desc: 'Current size, growth rates, and customer intent in industry.' },
    { name: 'Execution Capacity', value: execution_score, icon: Zap, color: 'text-rose-500 bg-rose-500/10', desc: 'Predictive team ability to implement solution without friction.' },
    { name: 'Defensive Moat', value: moat_score, icon: Shield, color: 'text-indigo-500 bg-indigo-500/10', desc: 'IP, network effects, and switching cost advantages.' }
  ];

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-8">
      {/* Title */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight flex items-center gap-2">
          Startup DNA Dashboard <Dna className="h-7 w-7 text-sky-500 animate-pulse" />
        </h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
          A multi-dimensional scoring profile detailing structural strengths.
        </p>
      </div>

      {/* Hero Score Block */}
      <div className="bg-gradient-to-r from-slate-900 to-indigo-950 text-white rounded-2xl p-8 shadow-xl flex flex-col md:flex-row items-center justify-between gap-8 border border-indigo-900/40">
        <div className="space-y-4 max-w-md text-center md:text-left">
          <h2 className="text-2xl font-bold">Overall DNA Rating</h2>
          <p className="text-xs text-slate-300 leading-relaxed">
            Startup DNA measures the composite viability of your concept based on strategic consulting patterns. A score above 75 indicates strong seed-investment potential.
          </p>
        </div>
        <div className="relative flex items-center justify-center h-36 w-36 shrink-0 bg-white/5 rounded-full border border-white/10">
          <div className="text-center">
            <span className="block text-4xl font-extrabold text-sky-400">{overall_dna_score}%</span>
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mt-1 block">DNA SCORE</span>
          </div>
        </div>
      </div>

      {/* DNA Dimensions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {DNA_AXES.map((axis) => {
          const Icon = axis.icon;
          return (
            <div
              key={axis.name}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm flex flex-col justify-between"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${axis.color}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-slate-800 dark:text-slate-200">{axis.name}</h3>
                    <p className="text-[10px] text-slate-400 mt-0.5 line-clamp-1">{axis.desc}</p>
                  </div>
                </div>
                <span className="text-xl font-extrabold text-slate-900 dark:text-white">{axis.value}%</span>
              </div>
              <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-slate-900 dark:bg-white rounded-full" style={{ width: `${axis.value}%` }} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
