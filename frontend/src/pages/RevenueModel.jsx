import React from 'react';
import { useActiveAnalysis } from '../hooks/useActiveAnalysis';
import { EmptyState } from '../components/EmptyState';
import { DollarSign, ShieldCheck, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const RevenueModel = () => {
  const { analysis, loading, error, activeIdeaId, reload } = useActiveAnalysis();
  const navigate = useNavigate();

  if (loading) {
    return <div className="p-8"><div className="h-6 w-32 bg-slate-200 dark:bg-slate-800 rounded animate-pulse" /></div>;
  }
  if (error === 'NOT_ANALYZED') {
    return <EmptyState type="NOT_ANALYZED" activeIdeaId={activeIdeaId} onValidateComplete={reload} />;
  }
  if (!activeIdeaId || !analysis) {
    return <EmptyState type="NO_STARTUPS" />;
  }

  const pricingTiers = [
    { name: 'Starter Sandbox', price: '$29/mo', desc: 'For early validation testing.', features: ['1 Project limit', 'Basic AI validations', '10 Competitor matches'] },
    { name: 'Growth Studio', price: '$89/mo', desc: 'For scaling startup teams.', features: ['5 Projects limit', 'Advanced ML predictions', 'Prophet forecasts access', 'PDF reports download'] },
    { name: 'Enterprise Studio', price: '$299/mo', desc: 'For incubators & scaleup funds.', features: ['Unlimited validation models', 'Custom API access', 'Priority AI Mentor queries', 'Admin log exports'] }
  ];

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-8">
      {/* Title */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight flex items-center gap-2">
          Revenue Model <DollarSign className="h-7 w-7 text-sky-500" />
        </h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
          Monetization strategy and recommended subscription package matrices.
        </p>
      </div>

      {/* Pricing Tiers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {pricingTiers.map((tier) => (
          <div
            key={tier.name}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm flex flex-col justify-between"
          >
            <div className="space-y-4">
              <h3 className="font-bold text-lg">{tier.name}</h3>
              <p className="text-3xl font-extrabold text-sky-500">{tier.price}</p>
              <p className="text-xs text-slate-400 leading-relaxed">{tier.desc}</p>
              <ul className="space-y-2 pt-4 border-t border-slate-100 dark:border-slate-800/80">
                {tier.features.map((f, i) => (
                  <li key={i} className="text-xs text-slate-600 dark:text-slate-300 flex items-center gap-2">
                    <ShieldCheck className="h-4 w-4 text-emerald-500 shrink-0" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>

      {/* Strategic advice card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="space-y-1 max-w-lg">
          <h3 className="font-bold text-base flex items-center gap-1.5">
            <Zap className="h-4.5 w-4.5 text-sky-500 animate-bounce" /> Dynamic Curve Forecasting
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            Ready to inspect the Prophet projections? Click to open our dynamic 12-month modeling dashboard.
          </p>
        </div>
        <button
          onClick={() => navigate('/forecasting')}
          className="px-6 py-3 bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold rounded-xl transition text-sm whitespace-nowrap shadow-lg shadow-sky-500/10"
        >
          Open Forecasting Dashboard
        </button>
      </div>
    </div>
  );
};
