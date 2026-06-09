import React from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_URL } from '../context/AuthContext';
import { HelpCircle, Sparkles, Loader2, ArrowRight } from 'lucide-react';

export const EmptyState = ({ type, activeIdeaId, onValidateComplete }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState('');

  const handleRunValidation = async () => {
    if (!activeIdeaId) return;
    setLoading(true);
    setError('');
    try {
      await axios.post(`${API_URL}/analysis/validate/${activeIdeaId}`);
      if (onValidateComplete) {
        onValidateComplete();
      }
      // Trigger global active idea change to force reloading
      window.dispatchEvent(new Event('activeIdeaChanged'));
    } catch (err) {
      setError(err.response?.data?.detail || 'Validation failed. Please verify API configuration.');
    } finally {
      setLoading(false);
    }
  };

  if (type === 'NO_STARTUPS') {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl max-w-lg mx-auto mt-12">
        <div className="h-16 w-16 bg-sky-500/10 text-sky-500 rounded-full flex items-center justify-center mb-6">
          <Sparkles className="h-8 w-8 animate-pulse" />
        </div>
        <h3 className="text-xl font-bold mb-2">No Active Startup Found</h3>
        <p className="text-slate-500 dark:text-slate-400 text-sm max-w-sm mb-8 leading-relaxed">
          Create your first startup concept outline to unlock detailed dashboards, SWOT grids, competitor tracking, and growth curves.
        </p>
        <button
          onClick={() => navigate('/new-analysis')}
          className="flex items-center gap-1.5 px-6 py-3 bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold rounded-xl transition shadow-lg shadow-sky-500/20"
        >
          Create New Analysis <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center p-12 text-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl max-w-lg mx-auto mt-12">
      <div className="h-16 w-16 bg-amber-500/10 text-amber-500 rounded-full flex items-center justify-center mb-6">
        <HelpCircle className="h-8 w-8" />
      </div>
      <h3 className="text-xl font-bold mb-2">Validation Pending</h3>
      <p className="text-slate-500 dark:text-slate-400 text-sm max-w-sm mb-8 leading-relaxed">
        This startup idea has not been validated yet. Run the validation engine to generate competitor lists, SWOT analysis, and forecasting.
      </p>

      {error && (
        <div className="mb-6 p-4 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-xl text-xs font-semibold">
          {error}
        </div>
      )}

      <button
        onClick={handleRunValidation}
        disabled={loading}
        className="flex items-center gap-2 px-6 py-3 bg-sky-500 hover:bg-sky-400 disabled:bg-slate-800 disabled:text-slate-500 text-slate-950 font-bold rounded-xl transition shadow-lg shadow-sky-500/20"
      >
        {loading ? (
          <>
            <Loader2 className="h-4.5 w-4.5 animate-spin" /> Analyzing Idea (60s)...
          </>
        ) : (
          <>
            Run AI/ML Engine <Sparkles className="h-4 w-4" />
          </>
        )}
      </button>
    </div>
  );
};
