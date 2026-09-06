import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ShieldCheck, Zap, LineChart, BrainCircuit } from 'lucide-react';

const Landing = () => {
  return (
    <div className="min-h-screen bg-[#030712] text-white flex flex-col justify-between">
      <header className="px-8 py-6 flex items-center justify-between border-b border-slate-800/80 max-w-7xl mx-auto w-full">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <span className="font-bold text-lg tracking-tight">LoanLens</span>
        </div>
        <Link
          to="/dashboard"
          className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold px-4 py-2 rounded-lg border border-slate-700 transition-colors"
        >
          Enter Platform
        </Link>
      </header>

      <main className="max-w-5xl mx-auto px-8 py-20 text-center space-y-8">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
          <BrainCircuit className="w-3.5 h-3.5" />
          <span>Explainable AI Risk Engine (SHAP + XGBoost)</span>
        </div>

        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight leading-tight">
          Next-Gen Explainable <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-300">
            Credit Decision Intelligence
          </span>
        </h1>

        <p className="text-slate-400 text-base md:text-lg max-w-2xl mx-auto">
          Audit loan approvals in real time. Gain full feature attribution breakdown with TreeExplainer SHAP and conversational Gemini what-if scenario simulations.
        </p>

        <div className="flex items-center justify-center gap-4 pt-4">
          <Link
            to="/dashboard"
            className="bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold px-6 py-3 rounded-xl flex items-center space-x-2 transition-all shadow-lg shadow-emerald-950"
          >
            <span>Launch Dashboard</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            to="/apply"
            className="bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 font-semibold px-6 py-3 rounded-xl transition-all"
          >
            New Application
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-16 text-left">
          <div className="bg-[#0b1120] border border-slate-800 p-6 rounded-2xl space-y-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400">
              <Zap className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-sm text-white">Sub-100ms Inference</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Optimized XGBoost pipeline executing on FastAPI yields instant credit approval decisions.
            </p>
          </div>

          <div className="bg-[#0b1120] border border-slate-800 p-6 rounded-2xl space-y-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400">
              <LineChart className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-sm text-white">Granular SHAP Attribution</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Eliminate black-box decisions with waterfall-style positive and negative feature weights.
            </p>
          </div>

          <div className="bg-[#0b1120] border border-slate-800 p-6 rounded-2xl space-y-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400">
              <BrainCircuit className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-sm text-white">Conversational Agent</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Integrated LLM assistant answers applicant questions and performs what-if adjustments.
            </p>
          </div>
        </div>
      </main>

      <footer className="py-6 text-center text-xs text-slate-600 border-t border-slate-900">
        LoanLens Explainable AI System © 2026. B.Tech Capstone Platform.
      </footer>
    </div>
  );
};

export default Landing;