import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, FilePlus2, History, Layers, ShieldCheck } from 'lucide-react';

const Sidebar = () => {
  const links = [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/apply', label: 'New Application', icon: FilePlus2 },
    { to: '/history', label: 'Decision History', icon: History },
  ];

  return (
    <aside className="w-64 bg-[#0b1120] border-r border-slate-800 flex flex-col h-screen fixed left-0 top-0 text-slate-300 z-30">
      <div className="p-6 border-b border-slate-800 flex items-center space-x-3">
        <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
          <ShieldCheck className="w-5 h-5" />
        </div>
        <div>
          <h1 className="font-bold text-base text-white tracking-tight">LoanLens</h1>
          <p className="text-[11px] text-slate-500">XAI Credit Protocol</p>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-1.5">
        {links.map((link) => {
          const Icon = link.icon;
          return (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                `flex items-center space-x-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-sm shadow-emerald-950'
                    : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
                }`
              }
            >
              <Icon className="w-4 h-4" />
              <span>{link.label}</span>
            </NavLink>
          );
        })}
      </nav>

      <div className="p-4 border-t border-slate-800 bg-slate-950/40 m-3 rounded-xl border">
        <div className="text-[10px] uppercase font-bold text-slate-500 tracking-wider mb-1">Inference Engine</div>
        <div className="text-xs text-slate-300 font-medium">XGBoost + SHAP</div>
        <div className="text-[11px] text-emerald-400 font-mono mt-0.5">TreeExplainer v0.44</div>
      </div>
    </aside>
  );
};

export default Sidebar;