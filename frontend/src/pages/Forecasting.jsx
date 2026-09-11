import React from 'react';
import { useActiveAnalysis } from '../hooks/useActiveAnalysis';
import { useCurrency } from '../context/CurrencyContext';
import { EmptyState } from '../components/EmptyState';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { LineChart, TrendingUp } from 'lucide-react';

export const Forecasting = () => {
  const { analysis, loading, error, activeIdeaId, reload } = useActiveAnalysis();
  const { formatCurrency, convert, selectedCurrency, getSymbol } = useCurrency();

  if (loading) {
    return <div className="p-8"><div className="h-6 w-32 bg-slate-200 dark:bg-slate-800 rounded animate-pulse" /></div>;
  }
  if (error === 'NOT_ANALYZED') {
    return <EmptyState type="NOT_ANALYZED" activeIdeaId={activeIdeaId} onValidateComplete={reload} />;
  }
  if (!activeIdeaId || !analysis) {
    return <EmptyState type="NO_STARTUPS" />;
  }

  const forecast = analysis.revenue_model?.revenue_forecast || [];
  
  // Calculate average growth and total annual revenue in USD
  const totalAnnualUSD = forecast.reduce((acc, curr) => acc + curr.revenue, 0);
  const avgGrowth = forecast[0]?.growth_rate || 10.0;

  // Converted forecast data points for AreaChart
  const convertedForecast = forecast.map((item) => ({
    ...item,
    convertedRevenue: convert(item.revenue),
    convertedLower: convert(item.lower_bound),
    convertedUpper: convert(item.upper_bound)
  }));

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-8">
      {/* Title */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight flex items-center gap-2">
          Forecasting Dashboard <LineChart className="h-7 w-7 text-sky-500" />
        </h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
          Time-series analysis using Prophet modeling to simulate revenue trajectories in {selectedCurrency}.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Projected Year 1 Run Rate</p>
          <p className="text-2xl font-extrabold text-sky-500">{formatCurrency(totalAnnualUSD)}</p>
          <p className="text-xs text-slate-400 mt-1">12 months cumulative revenue ({selectedCurrency})</p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Compound Monthly Growth</p>
          <p className="text-2xl font-extrabold text-emerald-500">{avgGrowth}%</p>
          <p className="text-xs text-slate-400 mt-1">Projected average monthly expansion</p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Confidence Interval Margin</p>
          <p className="text-2xl font-extrabold text-indigo-500">+/- 15%</p>
          <p className="text-xs text-slate-400 mt-1">Prophet upper/lower boundary noise</p>
        </div>
      </div>

      {/* Area Chart displaying boundaries */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
        <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-6 flex items-center justify-between">
          <span>Revenue Confidence Intervals ({selectedCurrency})</span>
          <TrendingUp className="h-5 w-5 text-sky-500" />
        </h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={convertedForecast}>
              <defs>
                <linearGradient id="colorUv" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.2}/>
                  <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} />
              <YAxis 
                tick={{ fontSize: 11 }} 
                tickFormatter={(val) => {
                  const sym = getSymbol();
                  if (selectedCurrency === 'INR') {
                    return val >= 10000000 ? `${sym}${(val/10000000).toFixed(1)}Cr` : (val >= 100000 ? `${sym}${(val/100000).toFixed(0)}L` : `${sym}${(val/1000).toFixed(0)}k`);
                  }
                  return val >= 1000000 ? `${sym}${(val/1000000).toFixed(1)}M` : (val >= 1000 ? `${sym}${(val/1000).toFixed(0)}k` : `${sym}${val}`);
                }}
              />
              <Tooltip 
                formatter={(val) => [formatCurrency(val / (convert(1) || 1)), `Revenue (${selectedCurrency})`]}
              />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Area type="monotone" dataKey="convertedUpper" name={`Optimistic Cap (${getSymbol()})`} stroke="none" fill="#e0f2fe" fillOpacity={0.15} />
              <Area type="monotone" dataKey="convertedRevenue" name={`Expected Target (${getSymbol()})`} stroke="#0ea5e9" strokeWidth={2.5} fillOpacity={1} fill="url(#colorUv)" />
              <Area type="monotone" dataKey="convertedLower" name={`Conservative Floor (${getSymbol()})`} stroke="none" fill="#fef2f2" fillOpacity={0.15} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
