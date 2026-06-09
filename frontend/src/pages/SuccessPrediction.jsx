import React from 'react';
import { useActiveAnalysis } from '../hooks/useActiveAnalysis';
import { EmptyState } from '../components/EmptyState';
import { CheckCircle, BrainCircuit } from 'lucide-react';

export const SuccessPrediction = () => {
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

  const success = analysis.success_prediction.success_probability;
  const failure = analysis.success_prediction.failure_probability;
  const confidence = analysis.success_prediction.confidence_score;

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-8">
      {/* Title */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight">Startup Success Predictor</h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
          Predictive machine learning models trained on startup attributes.
        </p>
      </div>

      {/* Probability Gauge Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Success Score */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm flex flex-col items-center justify-center text-center">
          <div className="relative flex items-center justify-center h-32 w-32 mb-4">
            <svg className="w-full h-full transform -rotate-90">
              <circle cx="64" cy="64" r="56" className="stroke-slate-100 dark:stroke-slate-800 fill-none" strokeWidth="10" />
              <circle
                cx="64"
                cy="64"
                r="56"
                className="stroke-sky-500 fill-none"
                strokeWidth="10"
                strokeDasharray={2 * Math.PI * 56}
                strokeDashoffset={2 * Math.PI * 56 * (1 - success / 100)}
                strokeLinecap="round"
              />
            </svg>
            <span className="absolute text-3xl font-extrabold">{success}%</span>
          </div>
          <h3 className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Success Probability</h3>
          <p className="text-xs text-emerald-500 font-semibold mt-1 flex items-center gap-1">
            <CheckCircle className="h-3.5 w-3.5" /> High Viability Rating
          </p>
        </div>

        {/* Failure Probability */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Failure Risk</h3>
            <p className="text-4xl font-extrabold text-rose-500">{failure}%</p>
            <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
              <div className="h-full bg-rose-500 rounded-full" style={{ width: `${failure}%` }} />
            </div>
          </div>
          <p className="text-xs text-slate-400 mt-4 leading-relaxed">
            Measures baseline failure rates in early product life cycles based on competitive congestion.
          </p>
        </div>

        {/* Model Confidence */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Model Confidence</h3>
            <p className="text-4xl font-extrabold text-indigo-500">{confidence}%</p>
            <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
              <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${confidence}%` }} />
            </div>
          </div>
          <p className="text-xs text-slate-400 mt-4 leading-relaxed">
            Confidence calculation based on word count completeness and structural input specificity.
          </p>
        </div>
      </div>

      {/* Model Reasoning */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
        <h3 className="text-lg font-bold flex items-center gap-2">
          <BrainCircuit className="h-5 w-5 text-sky-500" /> Model Reasoning & Analysis
        </h3>
        <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
          {analysis.success_prediction.reasoning}
        </p>
        <div className="pt-4 border-t border-slate-100 dark:border-slate-800/80 flex flex-col sm:flex-row justify-between text-xs text-slate-400 gap-2">
          <span>Classifier Algorithm: XGBoost Classifier + Random Forest Ensemble</span>
          <span>Attributes Processed: Industry, Description Weight, Team Size, Category</span>
        </div>
      </div>
    </div>
  );
};
