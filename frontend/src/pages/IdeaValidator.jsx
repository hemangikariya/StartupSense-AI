import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_URL } from '../context/AuthContext';
import { Sparkles, Loader2, PlayCircle, Info } from 'lucide-react';

export const IdeaValidator = () => {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [industry, setIndustry] = useState('AI SaaS');
  const [businessModel, setBusinessModel] = useState('B2B SaaS');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    "Querying real-time search for market competitors...",
    "Extracting technologies and keywords using spaCy & KeyBERT...",
    "Running XGBoost success probability classifiers...",
    "Assembling strategic SWOT & target persona datasets...",
    "Predicting execution risks and recommended funding stages...",
    "Generating Prophet revenue & industry growth curves...",
    "Compiling business plan and final PDF report..."
  ];

  // Increment step for loader visual effect
  useEffect(() => {
    let interval;
    if (loading) {
      interval = setInterval(() => {
        setCurrentStep((prev) => {
          if (prev < steps.length - 1) {
            return prev + 1;
          }
          return prev;
        });
      }, 7000); // Progress step every 7 seconds
    } else {
      setCurrentStep(0);
    }
    return () => clearInterval(interval);
  }, [loading]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // 1. Create the startup idea record
      const ideaRes = await axios.post(`${API_URL}/ideas`, {
        title,
        description,
        industry,
        category: 'Software',
        subcategory: 'Intelligence',
        business_model: businessModel
      });

      const newIdeaId = ideaRes.data.id.toString();
      localStorage.setItem('activeIdeaId', newIdeaId);
      
      // Dispatch event so Navbar switches immediately
      window.dispatchEvent(new Event('ideaAdded'));

      // 2. Run the full validation analysis pipeline
      await axios.post(`${API_URL}/analysis/validate/${newIdeaId}`);

      // Dispatch event to refresh Navbar and all dashboards
      window.dispatchEvent(new Event('activeIdeaChanged'));

      // Redirect to Dashboard on completion
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.detail || 'An error occurred during verification. Please check your credentials or API keys.');
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight flex items-center gap-2">
          New Idea Validation <Sparkles className="h-6 w-6 text-sky-500" />
        </h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
          Submit your startup concept description. Our pipeline uses AI + NLP + ML to build your custom business intelligence report.
        </p>
      </div>

      {loading ? (
        // Advanced Analytical Loading State
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 shadow-xl text-center space-y-8">
          <div className="flex justify-center">
            <Loader2 className="h-14 w-14 text-sky-500 animate-spin" />
          </div>
          <div className="space-y-2 max-w-md mx-auto">
            <h3 className="text-xl font-bold">Generating Analysis Report</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Running deep structural queries. This process takes 30-40 seconds.
            </p>
          </div>

          {/* Stepper Status list */}
          <div className="max-w-md mx-auto text-left border border-slate-100 dark:border-slate-800/80 rounded-xl p-6 bg-slate-50 dark:bg-slate-950/20 space-y-4">
            {steps.map((step, idx) => (
              <div key={idx} className="flex items-center gap-3">
                <div className={`h-2 w-2 rounded-full ${
                  idx < currentStep 
                    ? 'bg-emerald-500' 
                    : idx === currentStep 
                      ? 'bg-sky-500 animate-ping' 
                      : 'bg-slate-300 dark:bg-slate-800'
                }`} />
                <span className={`text-xs font-semibold ${
                  idx < currentStep 
                    ? 'text-slate-400 line-through' 
                    : idx === currentStep 
                      ? 'text-sky-500 font-bold' 
                      : 'text-slate-500 dark:text-slate-400'
                }`}>
                  {step}
                </span>
              </div>
            ))}
          </div>
        </div>
      ) : (
        // Form Configuration
        <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-6">
          {error && (
            <div className="p-4 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-xl text-sm font-semibold">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Startup Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                placeholder="e.g. SmartPlant Monitor"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Sector Industry</label>
              <select
                value={industry}
                onChange={(e) => setIndustry(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 text-slate-700 dark:text-slate-200"
              >
                <option value="AI SaaS">AI SaaS</option>
                <option value="FinTech">FinTech</option>
                <option value="HealthTech">HealthTech</option>
                <option value="EdTech">EdTech</option>
                <option value="E-Commerce">E-Commerce</option>
                <option value="Web3">Web3</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Business Model Target</label>
            <select
              value={businessModel}
              onChange={(e) => setBusinessModel(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 text-slate-700 dark:text-slate-200"
            >
              <option value="B2B SaaS">B2B SaaS / Subscription</option>
              <option value="Marketplace">Marketplace Platform</option>
              <option value="B2C Freemium">B2C Freemium</option>
              <option value="Transaction Fee">Transaction Fee Split</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Detailed Idea Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              rows={6}
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
              placeholder="Detail the problem you are solving, how you solve it, who the target audience is, and what technologies you intend to use."
            />
            <div className="flex items-start gap-2 text-xs text-slate-400 mt-2">
              <Info className="h-4 w-4 shrink-0 text-sky-500" />
              <span>Provide at least 3 sentences. Clear and detailed ideas yield highly accurate competitor matching and revenue forecasts.</span>
            </div>
          </div>

          <button
            type="submit"
            className="w-full flex items-center justify-center gap-2 py-3.5 bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold rounded-xl transition shadow-lg shadow-sky-500/20"
          >
            Launch Validation Pipeline <PlayCircle className="h-5 w-5" />
          </button>
        </form>
      )}
    </div>
  );
};
