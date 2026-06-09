import React, { useState } from 'react';
import { useActiveAnalysis } from '../hooks/useActiveAnalysis';
import { EmptyState } from '../components/EmptyState';
import { FileText, Layers, Compass, BarChart, FileCheck } from 'lucide-react';

export const BusinessPlanGenerator = () => {
  const { analysis, loading, error, activeIdeaId, reload } = useActiveAnalysis();
  const [activeTab, setActiveTab] = useState('exec');

  if (loading) {
    return <div className="p-8"><div className="h-6 w-32 bg-slate-200 dark:bg-slate-800 rounded animate-pulse" /></div>;
  }
  if (error === 'NOT_ANALYZED') {
    return <EmptyState type="NOT_ANALYZED" activeIdeaId={activeIdeaId} onValidateComplete={reload} />;
  }
  if (!activeIdeaId || !analysis) {
    return <EmptyState type="NO_STARTUPS" />;
  }

  const bp = analysis.business_plan;

  const tabs = [
    { id: 'exec', label: 'Executive Summary', icon: FileCheck, content: bp.executive_summary },
    { id: 'ops', label: 'Operations Plan', icon: Layers, content: bp.operations_plan },
    { id: 'market', label: 'Marketing Strategy', icon: Compass, content: bp.marketing_strategy },
    { id: 'finance', label: 'Financial Strategy', icon: BarChart, content: bp.financial_strategy }
  ];

  const activeContent = tabs.find((t) => t.id === activeTab)?.content || '';

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-8">
      {/* Title */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight flex items-center gap-2">
          Business Plan Outline <FileText className="h-7 w-7 text-sky-500" />
        </h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
          Structured operations and strategic guidelines generated dynamically.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap border-b border-slate-200 dark:border-slate-800 gap-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = tab.id === activeTab;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold transition-all border-b-2 -mb-[2px] ${
                isActive
                  ? 'border-sky-500 text-sky-500 font-bold'
                  : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <Icon className="h-4.5 w-4.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Plan Document Panel */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 shadow-sm max-w-3xl mx-auto">
        <div className="prose dark:prose-invert max-w-none">
          <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-sm whitespace-pre-wrap">
            {activeContent}
          </p>
        </div>
      </div>
    </div>
  );
};
