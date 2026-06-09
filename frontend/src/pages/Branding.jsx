import React from 'react';
import { useActiveAnalysis } from '../hooks/useActiveAnalysis';
import { EmptyState } from '../components/EmptyState';
import { Compass, Sparkles, Globe, Copy, Check } from 'lucide-react';

export const Branding = () => {
  const { analysis, loading, error, activeIdeaId, reload } = useActiveAnalysis();
  const [copied, setCopied] = React.useState(false);

  if (loading) {
    return <div className="p-8"><div className="h-6 w-32 bg-slate-200 dark:bg-slate-800 rounded animate-pulse" /></div>;
  }
  if (error === 'NOT_ANALYZED') {
    return <EmptyState type="NOT_ANALYZED" activeIdeaId={activeIdeaId} onValidateComplete={reload} />;
  }
  if (!activeIdeaId || !analysis) {
    return <EmptyState type="NO_STARTUPS" />;
  }

  const { startup_names, domain_suggestions, logo_prompt } = analysis.branding;

  const handleCopyLogoPrompt = () => {
    navigator.clipboard.writeText(logo_prompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-8">
      {/* Title */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight flex items-center gap-2">
          Startup Branding suggestions <Compass className="h-7 w-7 text-sky-500" />
        </h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
          Nomenclature and logo prompts created dynamically by the branding module.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Startup Names */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles className="h-4 w-4 text-sky-500" /> Startup Name Ideas
          </h3>
          <ul className="space-y-3">
            {startup_names.map((name) => (
              <li
                key={name}
                className="font-bold text-sm bg-slate-50 dark:bg-slate-950/20 p-3 rounded-xl border border-slate-100 dark:border-slate-800/60"
              >
                {name}
              </li>
            ))}
          </ul>
        </div>

        {/* Domains */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
            <Globe className="h-4 w-4 text-sky-500" /> Domain Recommendations
          </h3>
          <ul className="space-y-3">
            {domain_suggestions.map((dom) => (
              <li
                key={dom}
                className="font-medium text-xs bg-slate-50 dark:bg-slate-950/20 p-3 rounded-xl border border-slate-100 dark:border-slate-800/60 flex justify-between items-center"
              >
                <span>{dom}</span>
                <span className="text-[10px] font-bold text-emerald-500 uppercase">Available</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Logo Generation Prompt */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
        <div className="flex justify-between items-center border-b pb-4">
          <h3 className="text-lg font-bold">Midjourney / Imagen Logo Prompt</h3>
          <button
            onClick={handleCopyLogoPrompt}
            className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-sky-500 transition border border-slate-200 dark:border-slate-800 px-3 py-1.5 rounded-lg"
          >
            {copied ? (
              <>
                <Check className="h-4 w-4 text-emerald-500" /> Copied!
              </>
            ) : (
              <>
                <Copy className="h-4 w-4" /> Copy Prompt
              </>
            )}
          </button>
        </div>
        <div className="bg-slate-50 dark:bg-slate-950/25 p-4 rounded-xl border border-slate-100 dark:border-slate-800/60">
          <p className="text-sm text-slate-600 dark:text-slate-300 italic leading-relaxed">
            {logo_prompt}
          </p>
        </div>
      </div>
    </div>
  );
};
