import React, { useEffect, useState } from 'react';
import { Activity, Database, RefreshCw, Download, Menu, X } from 'lucide-react';
import { pulseApi } from '../../api/client';

interface NavbarProps {
  onRefresh?: () => void;
  mobileMenuOpen?: boolean;
  onToggleMobileMenu?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onRefresh,
  mobileMenuOpen = false,
  onToggleMobileMenu,
}) => {
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
    <header className="sticky top-0 z-30 h-16 w-full glass-panel border-b border-slate-800/80 px-4 sm:px-6 flex items-center justify-between">
      {/* Brand & Hamburger Button */}
      <div className="flex items-center gap-2.5 sm:gap-3">
        {onToggleMobileMenu && (
          <button
            onClick={onToggleMobileMenu}
            className="md:hidden p-2 rounded-xl bg-slate-900/90 border border-slate-800 text-slate-300 hover:text-white transition-all focus:outline-none"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        )}

        <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-indigo-500/20 flex-shrink-0">
          <Activity className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
        </div>

        <div>
          <div className="flex items-center gap-1.5 sm:gap-2">
            <h1 className="text-sm sm:text-base font-bold text-white tracking-tight flex items-center gap-1.5">
              MoveInSync{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">
                Pulse
              </span>
            </h1>
            <span className="hidden xs:inline-block text-[9px] sm:text-[10px] font-semibold uppercase tracking-wider px-1.5 sm:px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              FDE
            </span>
          </div>
          <p className="text-[11px] text-slate-400 hidden sm:block">
            AI Review Intelligence & Commute Reliability
          </p>
        </div>
      </div>

      {/* Right Actions & Status Badges */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Dataset Status Banner */}
        <div className="hidden lg:flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900/80 border border-slate-800 text-xs">
          <Database className="w-3.5 h-3.5 text-cyan-400" />
          <span className="text-slate-300">Engine:</span>
          <span className="font-semibold text-cyan-400 capitalize">
            {health?.mode === 'persistent' ? 'Persistent' : 'Synthetic Demo'}
          </span>
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
        </div>

        {/* Quick Export CSV */}
        <a
          href={pulseApi.getExportReviewsUrl()}
          download="reviews-export.csv"
          className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 text-xs font-medium transition-all"
          title="Export Raw Reviews CSV"
        >
          <Download className="w-3.5 h-3.5 text-indigo-400" />
          <span className="hidden md:inline">Export CSV</span>
        </a>

        {/* Refresh Button */}
        <button
          onClick={handleRefresh}
          className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 text-xs font-medium transition-all"
          title="Sync & Refresh Data"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span className="hidden sm:inline">Refresh</span>
        </button>

        {/* Candidate tag */}
        <div className="flex items-center gap-2 pl-2 sm:pl-3 border-l border-slate-800">
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center font-bold text-xs text-white">
            FD
          </div>
        </div>
      </div>
    </header>
  );
};
