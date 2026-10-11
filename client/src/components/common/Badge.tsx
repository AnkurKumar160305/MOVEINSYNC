import React from 'react';
import { SentimentType, SeverityType, PriorityLevel, TaskStatus, IssueStatus } from '../../types';

interface BadgeProps {
  label?: string;
  children?: React.ReactNode;
  variant?: 'sentiment' | 'severity' | 'priority' | 'status' | 'category' | 'platform' | 'outline';
  value?: string;
  size?: 'sm' | 'md';
}

export const Badge: React.FC<BadgeProps> = ({
  label,
  children,
  variant = 'outline',
  value,
  size = 'md',
}) => {
  const content = children || label || value;
  const val = (value || label || '').toLowerCase();
  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs font-medium';

  let colorClasses = 'bg-slate-800 text-slate-300 border border-slate-700/60';

  if (variant === 'sentiment') {
    if (val === 'positive') colorClasses = 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30';
    else if (val === 'negative') colorClasses = 'bg-rose-500/10 text-rose-400 border border-rose-500/30';
    else colorClasses = 'bg-amber-500/10 text-amber-400 border border-amber-500/30';
  } else if (variant === 'severity') {
    if (val === 'critical') colorClasses = 'bg-red-500/15 text-red-400 border border-red-500/40 font-semibold';
    else if (val === 'high') colorClasses = 'bg-orange-500/15 text-orange-400 border border-orange-500/30';
    else if (val === 'medium') colorClasses = 'bg-amber-500/15 text-amber-400 border border-amber-500/30';
    else colorClasses = 'bg-slate-700/30 text-slate-400 border border-slate-700/50';
  } else if (variant === 'priority') {
    if (val === 'p0') colorClasses = 'bg-rose-500/20 text-rose-300 border border-rose-500/50 font-bold';
    else if (val === 'p1') colorClasses = 'bg-amber-500/20 text-amber-300 border border-amber-500/40 font-semibold';
    else colorClasses = 'bg-blue-500/20 text-blue-300 border border-blue-500/40';
  } else if (variant === 'status') {
    if (val === 'open' || val === 'backlog') colorClasses = 'bg-indigo-500/15 text-indigo-300 border border-indigo-500/30';
    else if (val === 'in_progress' || val === 'investigating') colorClasses = 'bg-amber-500/15 text-amber-300 border border-amber-500/30';
    else if (val === 'verification' || val === 'fix_in_progress') colorClasses = 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30';
    else if (val === 'done' || val === 'resolved') colorClasses = 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30';
  } else if (variant === 'category') {
    colorClasses = 'bg-indigo-950/40 text-indigo-300 border border-indigo-700/40';
  } else if (variant === 'platform') {
    if (val === 'google_play') colorClasses = 'bg-teal-500/10 text-teal-300 border border-teal-500/30';
    else colorClasses = 'bg-sky-500/10 text-sky-300 border border-sky-500/30';
  }

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full capitalize transition-colors ${sizeClasses} ${colorClasses}`}>
      {content}
    </span>
  );
};
