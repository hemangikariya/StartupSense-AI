import React, { useState } from 'react';
import { useActiveAnalysis } from '../hooks/useActiveAnalysis';
import { EmptyState } from '../components/EmptyState';
import { Users, Globe, ExternalLink, ShieldCheck, Sparkles, Filter, AlertCircle } from 'lucide-react';

export const CompetitorAnalysis = () => {
  const { analysis, loading, error, activeIdeaId, reload } = useActiveAnalysis();
  const [selectedCompIdx, setSelectedCompIdx] = useState(0);
  const [filterType, setFilterType] = useState('ALL');

  if (loading) {
    return <div className="p-8"><div className="h-6 w-32 bg-slate-200 dark:bg-slate-800 rounded animate-pulse" /></div>;
  }
  if (error === 'NOT_ANALYZED') {
    return <EmptyState type="NOT_ANALYZED" activeIdeaId={activeIdeaId} onValidateComplete={reload} />;
  }
  if (!activeIdeaId || !analysis) {
    return <EmptyState type="NO_STARTUPS" />;
  }

  const allCompetitors = analysis?.competitor_analysis?.competitors || [];

  // Filter competitors by Direct / Indirect / All
  const filteredCompetitors = allCompetitors.filter((c) => {
    if (filterType === 'ALL') return true;
    return (c.competitor_type || 'Direct').toUpperCase() === filterType;
  });

  const activeComp = filteredCompetitors[selectedCompIdx] || filteredCompetitors[0] || allCompetitors[0];

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-8">
      {/* Title & Badge */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight flex items-center gap-2">
            Competitor Analysis <Users className="h-7 w-7 text-sky-500" />
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
            Real-time verified market competitor discovery and live review sentiment analysis.
          </p>
        </div>

        {/* Filter Badges */}
        <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-1 rounded-xl self-start sm:self-auto">
          <button
            onClick={() => { setFilterType('ALL'); setSelectedCompIdx(0); }}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
              filterType === 'ALL'
                ? 'bg-white dark:bg-slate-800 text-sky-500 shadow-sm'
                : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            All ({allCompetitors.length})
          </button>
          <button
            onClick={() => { setFilterType('DIRECT'); setSelectedCompIdx(0); }}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
              filterType === 'DIRECT'
                ? 'bg-white dark:bg-slate-800 text-sky-500 shadow-sm'
                : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            Direct
          </button>
          <button
            onClick={() => { setFilterType('INDIRECT'); setSelectedCompIdx(0); }}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
              filterType === 'INDIRECT'
                ? 'bg-white dark:bg-slate-800 text-sky-500 shadow-sm'
                : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            Indirect
          </button>
        </div>
      </div>

      {/* Empty State when no competitors found */}
      {allCompetitors.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-12 text-center shadow-sm max-w-2xl mx-auto space-y-4">
          <div className="h-14 w-14 rounded-2xl bg-sky-500/10 text-sky-500 flex items-center justify-center mx-auto">
            <AlertCircle className="h-7 w-7" />
          </div>
          <h3 className="text-xl font-bold">No Verified Competitors Found</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto leading-relaxed">
            No verified direct competitors were found from available market search sources. This may indicate a highly novel niche or a distinct first-mover advantage.
          </p>
        </div>
      ) : (
        <>
          {/* Competitors List Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {filteredCompetitors.map((comp, idx) => {
              const isSelected = (filteredCompetitors[selectedCompIdx]?.name || filteredCompetitors[0]?.name) === comp.name;
              const isVerified = comp.is_verified !== false;
              const compType = comp.competitor_type || 'Direct';

              return (
                <div
                  key={comp.name}
                  onClick={() => setSelectedCompIdx(idx)}
                  className={`bg-white dark:bg-slate-900 border rounded-2xl p-5 shadow-sm cursor-pointer transition flex flex-col justify-between ${
                    isSelected 
                      ? 'border-sky-500 ring-2 ring-sky-500/10' 
                      : 'border-slate-200 dark:border-slate-800 hover:border-slate-400'
                  }`}
                >
                  <div>
                    {/* Header badges */}
                    <div className="flex justify-between items-start mb-3 gap-2">
                      <div className="min-w-0 flex-1">
                        <h3 className="font-bold text-base truncate">{comp.name}</h3>
                        {comp.domain ? (
                          <span className="text-[11px] text-sky-500 hover:underline flex items-center gap-1 mt-0.5 font-medium truncate">
                            <Globe className="h-3 w-3 shrink-0" />
                            {comp.domain}
                          </span>
                        ) : (
                          <span className="text-[11px] text-slate-400">{comp.market_share || 'Market Player'}</span>
                        )}
                      </div>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${
                        compType === 'Direct'
                          ? 'bg-rose-500/10 text-rose-500'
                          : 'bg-indigo-500/10 text-indigo-500'
                      }`}>
                        {compType}
                      </span>
                    </div>

                    {/* Verification Tag */}
                    <div className="flex items-center gap-1 mb-3">
                      {isVerified ? (
                        <span className="text-[10px] font-bold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-md flex items-center gap-1">
                          <ShieldCheck className="h-3 w-3" /> Verified Web Competitor
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded-md flex items-center gap-1">
                          <Sparkles className="h-3 w-3" /> AI Market Insight
                        </span>
                      )}
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs text-slate-400 mt-2">
                      <span>Market Overlap:</span>
                      <span className="font-bold text-slate-800 dark:text-slate-200">{comp.similarity_score}%</span>
                    </div>
                    {/* Small bar */}
                    <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full mt-1.5 overflow-hidden">
                      <div className="h-full bg-sky-500" style={{ width: `${comp.similarity_score}%` }} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Competitor Detailed View */}
          {activeComp && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Sentiment Card */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                      Sentiment Review
                    </h3>
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{activeComp.name}</span>
                  </div>
                  
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

                {activeComp.source_url && (
                  <div className="pt-4 mt-6 border-t border-slate-100 dark:border-slate-800/80">
                    <a
                      href={activeComp.source_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-semibold text-sky-500 hover:text-sky-400 flex items-center gap-1.5 truncate"
                    >
                      <ExternalLink className="h-3.5 w-3.5 shrink-0" />
                      <span>Visit Search Reference</span>
                    </a>
                  </div>
                )}
              </div>

              {/* Details (Moat/Strengths/Weaknesses) */}
              <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-6">
                <div>
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-bold">Positioning: {activeComp.name}</h3>
                    <span className="text-xs font-bold text-slate-500 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-md">
                      {activeComp.competitor_type || 'Direct'} Competitor
                    </span>
                  </div>
                  {activeComp.relevance_reason && (
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      {activeComp.relevance_reason}
                    </p>
                  )}
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2 border-t border-slate-100 dark:border-slate-800/80">
                  <div>
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Core Moat & Strengths</h4>
                    <ul className="space-y-2">
                      {activeComp.strengths?.map((str, idx) => (
                        <li key={idx} className="text-sm text-slate-600 dark:text-slate-300 flex items-start gap-2">
                          <span className="text-emerald-500 font-bold">•</span>
                          <span>{str}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Known Vulnerabilities</h4>
                    <ul className="space-y-2">
                      {activeComp.weaknesses?.map((wk, idx) => (
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
        </>
      )}
    </div>
  );
};
