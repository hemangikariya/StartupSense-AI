import React, { useState } from 'react';
import { useActiveAnalysis } from '../hooks/useActiveAnalysis';
import { EmptyState } from '../components/EmptyState';
import { Users } from 'lucide-react';

export const CompetitorAnalysis = () => {
  const { analysis, loading, error, activeIdeaId, reload } = useActiveAnalysis();
  const [selectedCompIdx, setSelectedCompIdx] = useState(0);

  if (loading) {
    return <div className="p-8"><div className="h-6 w-32 bg-slate-200 dark:bg-slate-800 rounded animate-pulse" /></div>;
  }
  if (error === 'NOT_ANALYZED') {
    return <EmptyState type="NOT_ANALYZED" activeIdeaId={activeIdeaId} onValidateComplete={reload} />;
  }
  if (!activeIdeaId || !analysis) {
    return <EmptyState type="NO_STARTUPS" />;
  }

  const competitors = analysis.competitor_analysis.competitors;
  const activeComp = competitors[selectedCompIdx] || competitors[0];

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-8">
      {/* Title */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight flex items-center gap-2">
          Competitor Analysis <Users className="h-7 w-7 text-sky-500" />
        </h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
          Real-time competitor tracking and sentiment analysis from live indexing search.
        </p>
      </div>

      {/* Competitors List Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {competitors.map((comp, idx) => (
          <div
            key={comp.name}
            onClick={() => setSelectedCompIdx(idx)}
            className={`bg-white dark:bg-slate-900 border rounded-2xl p-5 shadow-sm cursor-pointer transition ${
              selectedCompIdx === idx 
                ? 'border-sky-500 ring-2 ring-sky-500/10' 
                : 'border-slate-200 dark:border-slate-800 hover:border-slate-400'
            }`}
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-base">{comp.name}</h3>
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500">
                {comp.market_share}
              </span>
            </div>
            <div className="flex justify-between text-xs text-slate-400">
              <span>Similarity Score:</span>
              <span className="font-bold text-slate-800 dark:text-slate-200">{comp.similarity_score}%</span>
            </div>
            {/* Small bar */}
            <div className="h-1 w-full bg-slate-100 dark:bg-slate-800 rounded-full mt-2 overflow-hidden">
              <div className="h-full bg-sky-500" style={{ width: `${comp.similarity_score}%` }} />
            </div>
          </div>
        ))}
      </div>

      {/* Competitor Detailed View */}
      {activeComp && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Sentiment Card */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-6">
                {activeComp.name} Sentiment Review
              </h3>
              
              {activeComp.sentiment && (
                <div className="space-y-4">
                  {/* Positive */}
                  <div>
                    <div className="flex justify-between text-xs font-bold mb-1">
                      <span>Positive Sentiment</span>
                      <span className="text-emerald-500">{activeComp.sentiment.positive}%</span>
                    </div>
                    <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-500" style={{ width: `${activeComp.sentiment.positive}%` }} />
                    </div>
                  </div>
                  {/* Negative */}
                  <div>
                    <div className="flex justify-between text-xs font-bold mb-1">
                      <span>Negative Sentiment</span>
                      <span className="text-rose-500">{activeComp.sentiment.negative}%</span>
                    </div>
                    <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div className="h-full bg-rose-500" style={{ width: `${activeComp.sentiment.negative}%` }} />
                    </div>
                  </div>
                  {/* Neutral */}
                  <div>
                    <div className="flex justify-between text-xs font-bold mb-1">
                      <span>Neutral Sentiment</span>
                      <span className="text-slate-400">{activeComp.sentiment.neutral}%</span>
                    </div>
                    <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div className="h-full bg-slate-400" style={{ width: `${activeComp.sentiment.neutral}%` }} />
                    </div>
                  </div>
                </div>
              )}
            </div>
            <p className="text-[10px] text-slate-400 mt-6 leading-relaxed">
              * Sentiment averages compiled from review aggregations.
            </p>
          </div>

          {/* Details (Moat/Strengths/Weaknesses) */}
          <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-6">
            <h3 className="text-lg font-bold">Competitive Positioning: {activeComp.name}</h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Core Strengths</h4>
                <ul className="space-y-2">
                  {activeComp.strengths.map((str, idx) => (
                    <li key={idx} className="text-sm text-slate-600 dark:text-slate-300 flex items-start gap-2">
                      <span className="text-emerald-500 font-bold">•</span>
                      <span>{str}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Vulnerabilities</h4>
                <ul className="space-y-2">
                  {activeComp.weaknesses.map((wk, idx) => (
                    <li key={idx} className="text-sm text-slate-600 dark:text-slate-300 flex items-start gap-2">
                      <span className="text-rose-500 font-bold">•</span>
                      <span>{wk}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Praises/Complaints */}
            {activeComp.praises && activeComp.complaints && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4 border-t border-slate-100 dark:border-slate-800/80">
                <div>
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Customer Praises</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 italic">"{activeComp.praises[0]}"</p>
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Customer Complaints</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 italic">"{activeComp.complaints[0]}"</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
