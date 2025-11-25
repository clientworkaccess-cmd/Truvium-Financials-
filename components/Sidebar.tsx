import React from 'react';
import { MOCK_CURRENT_USER, TRUVIUM_AGENT } from '../constants';
import { Settings, ShieldCheck, Activity } from 'lucide-react';

export const Sidebar: React.FC = () => {
  return (
    <aside className="hidden md:flex flex-col w-80 h-full border-r border-white/40 bg-white/30 backdrop-blur-xl">
      <div className="p-8 border-b border-white/40">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-600 to-purple-800 flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-purple-500/30">
            T
          </div>
          <div>
            <h1 className="text-2xl font-bold text-truvium-dark tracking-tight">TRUVIUM</h1>
            <p className="text-xs text-truvium-slate uppercase tracking-wider font-medium">Financial Connect</p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-8">
        
        <div className="p-5 rounded-2xl bg-gradient-to-br from-violet-100/80 to-white/50 border border-white/60 shadow-sm">
          <div className="flex items-center gap-3 mb-3">
             <div className="relative">
                <img src={TRUVIUM_AGENT.avatar} alt="Truvium" className="w-12 h-12 rounded-full shadow-md" />
                <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white bg-green-500"></span>
             </div>
             <div>
               <h3 className="font-bold text-truvium-dark">Truvium Assistant</h3>
               <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700 border border-green-200 font-medium">Online</span>
             </div>
          </div>
          <p className="text-sm text-slate-600 leading-relaxed">
            I am ready to assist with corporate inquiries, financial data analysis, and internal communications.
          </p>
        </div>

        <div>
           <h3 className="text-xs font-bold text-truvium-slate uppercase tracking-widest mb-4 px-1">System Status</h3>
           <div className="space-y-3">
             <div className="flex items-center gap-3 text-sm text-slate-600 bg-white/40 p-3 rounded-xl border border-white/50">
                <ShieldCheck className="text-violet-600" size={18} />
                <span>End-to-End Encrypted</span>
             </div>
             <div className="flex items-center gap-3 text-sm text-slate-600 bg-white/40 p-3 rounded-xl border border-white/50">
                <Activity className="text-violet-600" size={18} />
                <span>All Systems Operational</span>
             </div>
           </div>
        </div>
        
      </div>

      <div className="p-6 border-t border-white/40 bg-white/40">
        <div className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/60 cursor-pointer transition-colors border border-transparent hover:border-white/50">
            <img src={MOCK_CURRENT_USER.avatar} alt="Me" className="w-10 h-10 rounded-full ring-2 ring-white shadow-sm" />
            <div className="flex-1">
              <h4 className="text-sm font-bold text-truvium-dark">{MOCK_CURRENT_USER.name}</h4>
              <p className="text-xs text-slate-500">{MOCK_CURRENT_USER.role}</p>
            </div>
            <Settings size={18} className="text-slate-400 hover:text-truvium-primary transition-colors" />
        </div>
      </div>
    </aside>
  );
};