import React, { useEffect, useState } from 'react';
import { Activity, ShieldCheck, Database, RefreshCw, Sparkles, Download } from 'lucide-react';
import { pulseApi } from '../../api/client';

interface NavbarProps {
  onRefresh?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onRefresh }) => {
  const [health, setHealth] = useState<{ database: string; mode: string } | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchHealth = async () => {
    try {
      const data = await pulseApi.getHealth();
      setHealth(data);
    } catch {
      setHealth({ database: 'in-memory', mode: 'in-memory' });
    }
  };

  useEffect(() => {
    fetchHealth();
  }, []);

  const handleRefresh = async () => {
    setLoading(true);
    if (onRefresh) await onRefresh();
    await fetchHealth();
    setTimeout(() => setLoading(false), 500);
  };

  return (
    <header className="sticky top-0 z-30 h-16 w-full glass-panel border-b border-slate-800/80 px-6 flex items-center justify-between">
      {/* Brand & Subtitle */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-indigo-500/20">
          <Activity className="w-5 h-5 text-white" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
              MoveInSync <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">Pulse</span>
            </h1>
            <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              FDE Assignment
            </span>
          </div>
          <p className="text-xs text-slate-400 hidden sm:block">AI-Powered Review Intelligence & Commute Reliability</p>
        </div>
      </div>

      {/* Right Actions & Status Badges */}
      <div className="flex items-center gap-3">
        {/* Dataset Status Banner */}
        <div className="hidden md:flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900/80 border border-slate-800 text-xs">
          <Database className="w-3.5 h-3.5 text-cyan-400" />
          <span className="text-slate-300">Data Engine:</span>
          <span className="font-semibold text-cyan-400 capitalize">
            {health?.mode === 'persistent' ? 'MongoDB Persistent' : 'In-Memory Synthetic (Full Demo)'}
          </span>
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
        </div>

        {/* Quick Export CSV */}
        <a
          href={pulseApi.getExportReviewsUrl()}
          download="reviews-export.csv"
          className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 text-xs font-medium transition-all"
          title="Export Raw Reviews CSV"
        >
          <Download className="w-3.5 h-3.5 text-indigo-400" />
          <span>Export CSV</span>
        </a>

        {/* Refresh Button */}
        <button
          onClick={handleRefresh}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 text-xs font-medium transition-all"
          title="Sync & Refresh Data"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span className="hidden sm:inline">Refresh</span>
        </button>

        {/* Candidate tag */}
        <div className="flex items-center gap-2 pl-3 border-l border-slate-800">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center font-bold text-xs text-white">
            FD
          </div>
        </div>
      </div>
    </header>
  );
};
