import React from 'react';
import { useActiveAnalysis } from '../hooks/useActiveAnalysis';
import { EmptyState } from '../components/EmptyState';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { BarChart3, Tag, Globe, Layers } from 'lucide-react';

export const MarketOpportunity = () => {
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

  const growthData = Object.entries(analysis.market_opportunity.market_growth).map(([year, rate]) => ({
    Year: year,
    "Growth Rate %": rate
  }));

  const classification = [
    { title: 'Industry Sector', value: analysis.keywords.business_concepts[0] || 'AI SaaS', icon: Globe },
    { title: 'Category Classification', value: 'Software Platform', icon: Layers },
    { title: 'Subcategory segment', value: 'Enterprise Intelligence', icon: BarChart3 }
  ];

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-8">
      {/* Title */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight flex items-center gap-2">
          Market Opportunity <BarChart3 className="h-7 w-7 text-sky-500" />
        </h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
          Sector classifications, technologies, and target growth estimates.
        </p>
      </div>

      {/* Classifications Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {classification.map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.title}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm flex items-center gap-4"
            >
              <div className="h-10 w-10 bg-sky-500/10 text-sky-500 rounded-xl flex items-center justify-center shrink-0">
                <Icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">{item.title}</p>
                <p className="font-bold text-sm text-slate-800 dark:text-slate-200 mt-0.5">{item.value}</p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Growth Chart */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
          <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-6">Industry CAGR (2026-2028)</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={growthData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="Year" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="Growth Rate %" fill="#3b82f6" radius={[6, 6, 0, 0]} maxBarSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* NLP Keyword Tags */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-6">
          <div>
            <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4 flex items-center gap-1.5">
              <Tag className="h-4.5 w-4.5 text-sky-500" /> Extracted NLP Keywords
            </h3>
            <div className="flex flex-wrap gap-2">
              {analysis.keywords.keywords.map((kw) => (
                <span
                  key={kw}
                  className="text-xs font-semibold px-3 py-1.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200/50 dark:border-slate-800/80"
                >
                  {kw}
                </span>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4 flex items-center gap-1.5">
              Core Technologies Matched
            </h3>
            <div className="flex flex-wrap gap-2">
              {analysis.keywords.technologies.map((tech) => (
                <span
                  key={tech}
                  className="text-xs font-bold px-3 py-1.5 rounded-full bg-sky-500/10 text-sky-500 border border-sky-500/10"
                >
                  {tech}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
