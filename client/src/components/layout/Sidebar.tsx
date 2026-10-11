import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  MessageSquareText,
  AlertTriangle,
  Kanban,
  Sliders,
  Bot,
  Database,
  FileText,
  TrendingUp,
  X,
  Activity,
} from 'lucide-react';

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen = false, onClose }) => {
  const navItems = [
    {
      to: '/',
      label: 'Executive Dashboard',
      icon: LayoutDashboard,
      badge: 'Live',
      badgeColor: 'bg-emerald-500/20 text-emerald-300',
    },
    {
      to: '/reviews',
      label: 'Review Explorer',
      icon: MessageSquareText,
      badge: '500+',
      badgeColor: 'bg-indigo-500/20 text-indigo-300',
    },
    {
      to: '/issues',
      label: 'Prioritized Issues',
      icon: AlertTriangle,
      badge: 'Root Causes',
      badgeColor: 'bg-rose-500/20 text-rose-300',
    },
    {
      to: '/tasks',
      label: 'FDE Task Board',
      icon: Kanban,
      badge: 'Engineering',
      badgeColor: 'bg-amber-500/20 text-amber-300',
    },
    {
      to: '/simulator',
      label: 'Solution Simulator',
      icon: Sliders,
      badge: 'Impact',
      badgeColor: 'bg-purple-500/20 text-purple-300',
    },
    {
      to: '/ask',
      label: 'Ask Pulse AI',
      icon: Bot,
      badge: 'Intelligence',
      badgeColor: 'bg-cyan-500/20 text-cyan-300',
    },
    {
      to: '/data',
      label: 'Data Engine & Import',
      icon: Database,
    },
    {
      to: '/report',
      label: 'Executive Report',
      icon: FileText,
      badge: 'Briefing',
      badgeColor: 'bg-blue-500/20 text-blue-300',
    },
  ];

  const handleLinkClick = () => {
    if (onClose) onClose();
  };

  const navContent = (
    <div className="flex flex-col justify-between h-full space-y-6">
      <div className="space-y-6">
        {/* Navigation Category: Intelligence */}
        <div>
          <p className="px-3 text-[11px] font-semibold tracking-wider uppercase text-slate-400 mb-2">
            Commute Intelligence
          </p>
          <nav className="space-y-1">
            {navItems.slice(0, 4).map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={handleLinkClick}
                  className={({ isActive }) =>
                    `group flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                      isActive
                        ? 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white shadow-md shadow-indigo-600/30'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                    }`
                  }
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-4 h-4 transition-transform group-hover:scale-110" />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                        item.badgeColor || 'bg-slate-800 text-slate-300'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Navigation Category: Advanced Operations */}
        <div>
          <p className="px-3 text-[11px] font-semibold tracking-wider uppercase text-slate-400 mb-2">
            Operations & AI
          </p>
          <nav className="space-y-1">
            {navItems.slice(4).map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={handleLinkClick}
                  className={({ isActive }) =>
                    `group flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                      isActive
                        ? 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white shadow-md shadow-indigo-600/30'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                    }`
                  }
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-4 h-4 transition-transform group-hover:scale-110" />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                        item.badgeColor || 'bg-slate-800 text-slate-300'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </NavLink>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Candidate Assignment Context Card */}
      <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 text-xs">
        <div className="flex items-center gap-2 text-indigo-400 font-semibold mb-1">
          <TrendingUp className="w-4 h-4" />
          <span>FDE Objective</span>
        </div>
        <p className="text-slate-400 leading-relaxed text-[11px]">
          Diagnosing negative Play Store ratings across booking, GPS, and pickup stages to deliver prioritized engineering action items.
        </p>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar (hidden on mobile, visible on md+) */}
      <aside className="hidden md:flex w-64 flex-shrink-0 min-h-[calc(100vh-4rem)] glass-panel border-r border-slate-800/80 p-4 flex-col justify-between">
        {navContent}
      </aside>

      {/* Mobile Drawer Slide-over (visible on small devices when isOpen is true) */}
      {isOpen && (
        <div className="fixed inset-0 z-50 md:hidden animate-in fade-in duration-200">
          {/* Backdrop blur */}
          <div
            onClick={onClose}
            className="fixed inset-0 bg-black/75 backdrop-blur-sm transition-opacity"
          />

          {/* Drawer Panel */}
          <div className="fixed top-0 bottom-0 left-0 z-50 w-72 max-w-[85vw] bg-slate-950 border-r border-slate-800 p-4 flex flex-col justify-between overflow-y-auto shadow-2xl animate-in slide-in-from-left duration-300">
            {/* Header with Close Button */}
            <div className="flex items-center justify-between pb-3 mb-2 border-b border-slate-800/80">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-cyan-400 flex items-center justify-center">
                  <Activity className="w-4 h-4 text-white" />
                </div>
                <span className="font-bold text-white text-sm">MoveInSync Pulse</span>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg bg-slate-900 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {navContent}
          </div>
        </div>
      )}
    </>
  );
};
