import React from 'react';
import { Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';

const Navbar = () => {
  return (
    <header className="h-16 border-b border-slate-800 bg-[#0b1120]/80 backdrop-blur-md px-8 flex items-center justify-between sticky top-0 z-20">
      <div className="flex items-center space-x-2">
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
        <span className="text-xs text-slate-400 font-medium">Production Node: Active (Local Atlas)</span>
      </div>

      <div className="flex items-center space-x-4">
        <Link
          to="/apply"
          className="text-xs bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold px-3.5 py-2 rounded-lg flex items-center space-x-1.5 transition-all shadow-sm"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Quick Decision</span>
        </Link>
      </div>
    </header>
  );
};

export default Navbar;