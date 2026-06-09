import React from 'react';
import { useActiveAnalysis } from '../hooks/useActiveAnalysis';
import { EmptyState } from '../components/EmptyState';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  BarChart, Bar
} from 'recharts';
import {
  TrendingUp,
  Award,
  Zap,
  ShieldAlert,
  ArrowRight,
  Sparkles,
  Bot
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const Dashboard = () => {
  const { analysis, loading, error, activeIdeaId, reload } = useActiveAnalysis();
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="p-8 space-y-6">
        <div className="h-8 w-48 bg-slate-200 dark:bg-slate-800 rounded animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-28 bg-slate-200 dark:bg-slate-800 rounded-xl animate-pulse" />
          ))}
        </div>
        <div className="h-96 bg-slate-200 dark:bg-slate-800 rounded-xl animate-pulse" />
      </div>
    );
  }

  if (error === 'NOT_ANALYZED') {
    return <EmptyState type="NOT_ANALYZED" activeIdeaId={activeIdeaId} onValidateComplete={reload} />;
  }

  if (!activeIdeaId || !analysis) {
    return <EmptyState type="NO_STARTUPS" />;
  }

  const kpis = [
    {
      title: 'Success Probability',
      value: `${analysis.success_prediction.success_probability}%`,
      subtitle: `Confidence: ${analysis.success_prediction.confidence_score}%`,
      icon: Zap,
      color: 'text-sky-500 bg-sky-500/10',
      path: '/success-prediction'
    },
    {
      title: 'Investor readiness',
      value: `${analysis.investor_readiness.investor_score}/100`,
      subtitle: analysis.investor_readiness.funding_potential,
      icon: Award,
      color: 'text-emerald-500 bg-emerald-500/10',
      path: '/investor-readiness'
    },
    {
      title: 'Overall DNA Score',
      value: `${analysis.dna_analysis.overall_dna_score}%`,
      subtitle: 'Scalability index: High',
      icon: Sparkles,
      color: 'text-indigo-500 bg-indigo-500/10',
      path: '/startup-dna'
    },
    {
      title: 'Execution Risk',
      value: `${analysis.risk_analysis.execution_risk}%`,
      subtitle: 'Technical Risk: ' + analysis.risk_analysis.technical_risk + '%',
      icon: ShieldAlert,
      color: 'text-rose-500 bg-rose-500/10',
      path: '/risk-analysis'
    }
  ];

  // Market opportunity data formatting
  const marketForecastData = Object.entries(analysis.market_opportunity.market_growth).map(([year, growth]) => ({
    year,
    growth
  }));

  return (
    <div className="p-6 space-y-8 max-w-7xl mx-auto">
      {/* Title */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight">Executive Dashboard</h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
          High-level metrics and strategy reports for your active concept validation.
        </p>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpis.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <div
              key={kpi.title}
              onClick={() => navigate(kpi.path)}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 cursor-pointer hover:border-sky-500 transition shadow-sm flex items-center justify-between"
            >
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">{kpi.title}</p>
                <p className="text-2xl font-extrabold">{kpi.value}</p>
                <p className="text-xs text-slate-400 mt-1">{kpi.subtitle}</p>
              </div>
              <div className={`h-12 w-12 rounded-xl flex items-center justify-center ${kpi.color}`}>
                <Icon className="h-6 w-6" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Summary Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Core Summary card */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b pb-4">
            <h2 className="text-lg font-bold">Executive Summary</h2>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-sky-500/10 text-sky-500">
              {analysis.keywords.business_concepts[0] || 'SaaS'}
            </span>
          </div>
          <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            {analysis.summary}
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Core Problem</p>
              <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-3">{analysis.problem_statement}</p>
            </div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Core Solution</p>
              <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-3">{analysis.solution}</p>
            </div>
          </div>
        </div>

        {/* AI Quick Actions Card */}
        <div className="bg-gradient-to-br from-slate-900 to-indigo-950 text-white rounded-2xl p-6 flex flex-col justify-between shadow-xl">
          <div className="space-y-4">
            <div className="h-10 w-10 bg-white/10 rounded-xl flex items-center justify-center">
              <Bot className="h-5 w-5 text-sky-400" />
            </div>
            <h2 className="text-xl font-bold">Need Strategic Advice?</h2>
            <p className="text-xs text-slate-300 leading-relaxed">
              Your AI Mentor understands your startup's SWOT, competitor landscape, and risk metrics. Chat with the coach instantly.
            </p>
          </div>
          <button
            onClick={() => navigate('/ai-mentor')}
            className="w-full flex items-center justify-center gap-2 py-3 bg-white text-slate-950 font-bold rounded-xl hover:bg-slate-200 transition mt-6 text-sm"
          >
            Chat with AI Mentor <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Chart Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Projection Line chart */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
          <h2 className="text-lg font-bold mb-6 flex items-center justify-between">
            <span>Monthly Revenue Projections (12m)</span>
            <TrendingUp className="h-5 w-5 text-sky-500" />
          </h2>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={analysis.revenue_model.revenue_forecast}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Line type="monotone" dataKey="revenue" name="Projected Revenue ($)" stroke="#0ea5e9" strokeWidth={2.5} dot={{ r: 4 }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Market growth forecasting Bar chart */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
          <h2 className="text-lg font-bold mb-6">Market Sector Expansion Rate (%)</h2>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={marketForecastData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="year" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="growth" name="CAGR Growth %" fill="#6366f1" radius={[8, 8, 0, 0]} maxBarSize={45} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
