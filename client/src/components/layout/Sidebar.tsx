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
  ChevronRight,
  TrendingUp,
} from 'lucide-react';

export const Sidebar: React.FC = () => {
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

  return (
    <aside className="w-64 flex-shrink-0 min-h-[calc(100vh-4rem)] glass-panel border-r border-slate-800/80 p-4 flex flex-col justify-between">
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
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${item.badgeColor || 'bg-slate-800 text-slate-300'}`}>
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
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${item.badgeColor || 'bg-slate-800 text-slate-300'}`}>
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
      <div className="mt-6 p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 text-xs">
        <div className="flex items-center gap-2 text-indigo-400 font-semibold mb-1">
          <TrendingUp className="w-4 h-4" />
          <span>FDE Objective</span>
        </div>
        <p className="text-slate-400 leading-relaxed text-[11px]">
          Diagnosing negative Play Store ratings across booking, GPS, and pickup stages to deliver prioritized engineering action items.
        </p>
      </div>
    </aside>
  );
};
