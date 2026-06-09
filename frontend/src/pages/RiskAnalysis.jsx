import React from 'react';
import { useActiveAnalysis } from '../hooks/useActiveAnalysis';
import { EmptyState } from '../components/EmptyState';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import { ShieldCheck } from 'lucide-react';

export const RiskAnalysis = () => {
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

  const { technical_risk, financial_risk, market_risk, execution_risk, remediation } = analysis.risk_analysis;

  const chartData = [
    { name: 'Technical', Risk: technical_risk },
    { name: 'Financial', Risk: financial_risk },
    { name: 'Market', Risk: market_risk },
    { name: 'Execution', Risk: execution_risk }
  ];

  const riskCards = [
    { name: 'Technical Risk', value: technical_risk, desc: 'Architecture complexity & third-party dependency', color: 'text-amber-500' },
    { name: 'Financial Risk', value: financial_risk, desc: 'Burn rate, setup overhead & runway factors', color: 'text-sky-500' },
    { name: 'Market Risk', value: market_risk, desc: 'Competitor densities & sector congestion index', color: 'text-indigo-500' },
    { name: 'Execution Risk', value: execution_risk, desc: 'Sprint schedules & team execution latency', color: 'text-rose-500' }
  ];

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-8">
      {/* Title */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight">Risk Analysis Dashboard</h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
          Machine learning calculations on potential execution barriers.
        </p>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Risk Cards */}
        <div className="space-y-4">
          {riskCards.map((card) => (
            <div
              key={card.name}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-3"
            >
              <div className="flex justify-between items-center">
                <span className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{card.name}</span>
                <span className={`text-xl font-bold ${card.color}`}>{card.value}%</span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">{card.desc}</p>
              <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-slate-900 dark:bg-white rounded-full transition-all duration-500"
                  style={{ width: `${card.value}%` }}
                />
              </div>
            </div>
          ))}
        </div>

        {/* Risk Chart */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
          <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-6">Risk Profile Index</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="Risk" fill="#ef4444" radius={[6, 6, 0, 0]} maxBarSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Remediation steps */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-6">
        <h3 className="text-lg font-bold flex items-center gap-2">
          <ShieldCheck className="h-5 w-5 text-emerald-500" /> Suggested Risk Mitigation Actions
        </h3>
        <ul className="space-y-4">
          {remediation.map((item, idx) => (
            <li key={idx} className="flex gap-4 items-start bg-slate-50 dark:bg-slate-950/20 p-4 rounded-xl border border-slate-100 dark:border-slate-800/60">
              <div className="h-6 w-6 rounded-full bg-sky-500/10 text-sky-500 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
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
