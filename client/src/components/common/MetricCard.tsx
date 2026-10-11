import React from 'react';
import { LucideIcon } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: {
    value: string;
    isPositive?: boolean;
    isNeutral?: boolean;
  };
  glowColor?: 'indigo' | 'emerald' | 'amber' | 'rose';
  onClick?: () => void;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  glowColor = 'indigo',
  onClick,
}) => {
  const glowMap = {
    indigo: 'from-indigo-500/10 to-transparent border-indigo-500/20 text-indigo-400',
    emerald: 'from-emerald-500/10 to-transparent border-emerald-500/20 text-emerald-400',
    amber: 'from-amber-500/10 to-transparent border-amber-500/20 text-amber-400',
    rose: 'from-rose-500/10 to-transparent border-rose-500/20 text-rose-400',
  };

  return (
    <div
      onClick={onClick}
      className={`glass-card glass-card-hover rounded-2xl p-5 relative overflow-hidden transition-all duration-300 border border-slate-800/80 bg-gradient-to-b ${
        onClick ? 'cursor-pointer' : ''
      }`}
    >
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-slate-400">{title}</p>
        <div className={`p-2.5 rounded-xl bg-slate-900/80 border ${glowMap[glowColor]}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>

      <div className="mt-4 flex items-baseline gap-2">
        <h3 className="text-3xl font-extrabold tracking-tight text-white">{value}</h3>
        {trend && (
          <span
            className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
              trend.isNeutral
                ? 'bg-slate-800 text-slate-400'
                : trend.isPositive
                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
            }`}
          >
            {trend.value}
          </span>
        )}
      </div>

      {subtitle && <p className="mt-2 text-xs text-slate-400 flex items-center gap-1.5">{subtitle}</p>}
    </div>
  );
};
