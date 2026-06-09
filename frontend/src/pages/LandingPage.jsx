import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, ArrowRight, ShieldCheck, TrendingUp, BarChart2, Bot, Layers, CheckCircle } from 'lucide-react';

export const LandingPage = () => {
  return (
    <div className="relative min-h-screen bg-slate-950 text-slate-100 overflow-hidden font-sans">
      {/* Background Orbs */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-sky-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[450px] h-[450px] bg-indigo-500/10 rounded-full blur-[160px] pointer-events-none" />

      {/* Header */}
      <header className="relative z-10 flex h-20 items-center justify-between px-6 max-w-7xl mx-auto">
        <div className="flex items-center gap-2 font-bold text-xl">
          <Sparkles className="h-6 w-6 text-sky-400" />
          <span className="bg-gradient-to-r from-white via-slate-200 to-sky-400 bg-clip-text text-transparent font-extrabold tracking-tight">
            StartupSense AI
          </span>
        </div>
        <div className="flex items-center gap-4">
          <Link to="/login" className="text-sm font-semibold text-slate-400 hover:text-white transition">
            Sign In
          </Link>
          <Link
            to="/register"
            className="flex items-center gap-1.5 px-4 py-2 text-sm font-semibold bg-sky-500 hover:bg-sky-400 text-slate-950 rounded-full transition shadow-lg shadow-sky-500/20"
          >
            Get Started <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </header>

      {/* Hero */}
      <main className="relative z-10 max-w-6xl mx-auto px-6 pt-16 pb-24 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900 border border-slate-800 text-xs font-semibold text-sky-400 mb-8">
          <Sparkles className="h-4 w-4" /> Powered by Gemini API & XGBoost Models
        </div>
        <h1 className="text-4xl sm:text-6xl font-extrabold leading-tight tracking-tight mb-6">
          Validate Your Startup Idea <br />
          <span className="bg-gradient-to-r from-sky-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent">
            With High-Fidelity AI & ML Projections
          </span>
        </h1>
        <p className="text-lg text-slate-400 max-w-3xl mx-auto mb-10 leading-relaxed">
          Stop building blind. StartupSense AI leverages real-time competitor search, advanced machine learning scoring, and Prophet forecasting engines to generate production-ready SWOTs, MVPs, pitch decks, and financial forecasts in 60 seconds.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
          <Link
            to="/register"
            className="w-full sm:w-auto px-8 py-4 font-bold text-slate-950 bg-sky-500 hover:bg-sky-400 rounded-xl transition shadow-xl shadow-sky-500/25 flex items-center justify-center gap-2"
          >
            Validate Your Idea Now <ArrowRight className="h-5 w-5" />
          </Link>
          <a
            href="#features"
            className="w-full sm:w-auto px-8 py-4 font-bold text-slate-300 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-xl transition flex items-center justify-center"
          >
            Explore Features
          </a>
        </div>

        {/* Mock Interface Preview */}
        <div className="relative rounded-2xl border border-slate-800 bg-slate-900/60 p-2 shadow-2xl">
          <div className="rounded-xl border border-slate-800 bg-slate-950/80 p-6 text-left">
            <div className="flex items-center justify-between border-b border-slate-900 pb-4 mb-6">
              <div className="flex items-center gap-2">
                <span className="h-3.5 w-3.5 rounded-full bg-rose-500/20 text-rose-500 flex items-center justify-center font-bold text-[8px]">●</span>
                <span className="h-3.5 w-3.5 rounded-full bg-amber-500/20 text-amber-500 flex items-center justify-center font-bold text-[8px]">●</span>
                <span className="h-3.5 w-3.5 rounded-full bg-emerald-500/20 text-emerald-500 flex items-center justify-center font-bold text-[8px]">●</span>
                <span className="text-xs font-semibold text-slate-500 ml-2">startupsense-dashboard_preview.json</span>
              </div>
              <span className="text-xs font-bold text-sky-400 bg-sky-500/10 px-2.5 py-0.5 rounded-full">ACTIVE DEMO</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-5 rounded-xl border border-slate-800 bg-slate-900/40">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Startup Score</p>
                <p className="text-3xl font-extrabold text-sky-400">89%</p>
                <div className="h-1.5 w-full bg-slate-800 rounded-full mt-3 overflow-hidden">
                  <div className="h-full bg-sky-400 rounded-full" style={{ width: '89%' }} />
                </div>
              </div>
              <div className="p-5 rounded-xl border border-slate-800 bg-slate-900/40">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Success Prediction</p>
                <p className="text-3xl font-extrabold text-emerald-400">78% Success</p>
                <p className="text-xs text-slate-400 mt-2">Confidence level: High (85%)</p>
              </div>
              <div className="p-5 rounded-xl border border-slate-800 bg-slate-900/40">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Funding Stage</p>
                <p className="text-3xl font-extrabold text-indigo-400">Pre-Seed / Seed</p>
                <p className="text-xs text-slate-400 mt-2">Score: 82/100 (High Potential)</p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Feature Grid */}
      <section id="features" className="relative z-10 max-w-6xl mx-auto px-6 py-24 border-t border-slate-900">
        <h2 className="text-3xl font-bold text-center mb-16">
          Everything You Need to Design, Validate & Pitch
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="p-6 rounded-xl border border-slate-900 bg-slate-900/20 hover:border-slate-800 transition">
            <Bot className="h-10 w-10 text-sky-400 mb-4" />
            <h3 className="text-lg font-semibold mb-2">Real-Time Competitor Insights</h3>
            <p className="text-sm text-slate-400">
              Never use hardcoded data. We run active web indexing to fetch live competitor prices, reviews, and sentiment.
            </p>
          </div>
          <div className="p-6 rounded-xl border border-slate-900 bg-slate-900/20 hover:border-slate-800 transition">
            <TrendingUp className="h-10 w-10 text-emerald-400 mb-4" />
            <h3 className="text-lg font-semibold mb-2">Time-Series Growth Projections</h3>
            <p className="text-sm text-slate-400">
              Utilize Prophet forecasting models to output monthly revenue curves and 2026-2028 market expansion trajectories.
            </p>
          </div>
          <div className="p-6 rounded-xl border border-slate-900 bg-slate-900/20 hover:border-slate-800 transition">
            <ShieldCheck className="h-10 w-10 text-indigo-400 mb-4" />
            <h3 className="text-lg font-semibold mb-2">XGBoost Success Prediction</h3>
            <p className="text-sm text-slate-400">
              Evaluate startup risk, executive friction, and investor interest score using trained scikit-learn classifiers.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};
