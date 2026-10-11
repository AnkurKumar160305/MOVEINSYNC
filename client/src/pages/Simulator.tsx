import React, { useEffect, useState } from 'react';
import {
  Sliders,
  Sparkles,
  TrendingUp,
  CheckCircle2,
  FlaskConical,
  Zap,
  ArrowUpRight,
  ShieldCheck,
  Target,
} from 'lucide-react';
import { pulseApi } from '../api/client';
import { IExperiment } from '../types';
import { Badge } from '../components/common/Badge';

export const Simulator: React.FC = () => {
  const [experiments, setExperiments] = useState<IExperiment[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Simulator Toggle States
  const [solutions, setSolutions] = useState([
    {
      id: 'sol-booking',
      title: 'Fix Overnight Shift Booking Timezone & Date Normalizer',
      category: 'booking',
      impact: 0.38,
      complaintDrop: 32,
      enabled: true,
      description: 'Resolves date offset bugs for shifts spanning midnight; clarifies booking confirmation modal.',
    },
    {
      id: 'sol-gps',
      title: 'Real-Time GPS Staleness Detector & Dynamic Traffic ETA',
      category: 'gps_eta',
      impact: 0.45,
      complaintDrop: 41,
      enabled: true,
      description: 'Flags vehicles with >30s GPS lag and displays honest buffer to employees.',
    },
    {
      id: 'sol-geofence',
      title: 'Geofenced Grace Period for Boarding (Eliminate False No-Shows)',
      category: 'check_in_no_show',
      impact: 0.32,
      complaintDrop: 28,
      enabled: false,
      description: 'Prevents drivers from marking no-show if employee GPS coordinates are within 150m radius.',
    },
    {
      id: 'sol-push',
      title: 'High-Priority FCM Notification Delivery with SMS Fallback',
      category: 'notifications',
      impact: 0.29,
      complaintDrop: 24,
      enabled: false,
      description: 'Guarantees cab arrival alert delivery even when aggressive Android battery optimizations kick in.',
    },
  ]);

  const baseRating = 2.42;

  const currentImpact = solutions
    .filter((s) => s.enabled)
    .reduce((acc, curr) => acc + curr.impact, 0);

  const projectedRating = Math.min(5.0, Math.round((baseRating + currentImpact) * 100) / 100);

  const totalComplaintDrop = Math.min(
    78,
    solutions
      .filter((s) => s.enabled)
      .reduce((acc, curr) => acc + curr.complaintDrop, 0)
  );

  const fetchExperiments = async () => {
    setLoading(true);
    try {
      const data = await pulseApi.getExperiments();
      setExperiments(data);
    } catch (err) {
      console.error('Failed to load experiments:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExperiments();
  }, []);

  const toggleSolution = (id: string) => {
    setSolutions((prev) =>
      prev.map((s) => (s.id === id ? { ...s, enabled: !s.enabled } : s))
    );
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Page Header */}
      <div>
        <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
          Commute Solution Simulator & Experiments
        </h2>
        <p className="text-xs sm:text-sm text-slate-400">
          Model expected Play Store rating lift and SLA recoveries prior to committing engineering resources
        </p>
      </div>

      {/* Simulator Interactive Cockpit */}
      <div className="glass-card rounded-2xl p-4 sm:p-6 border border-slate-800 bg-gradient-to-br from-slate-900 via-indigo-950/20 to-slate-950">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-5 sm:gap-6 pb-6 border-b border-slate-800">
          <div className="space-y-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-400 flex items-center gap-1.5">
              <Zap className="w-4 h-4" /> Interactive Rating Lift Engine
            </span>
            <h3 className="text-base sm:text-lg font-bold text-white">
              Simulate Cumulative Impact of Proposed Architectural Fixes
            </h3>
            <p className="text-xs text-slate-400">
              Toggle specific engineering fixes below to calculate compound Play Store rating recovery
            </p>
          </div>

          {/* Impact Comparison Cards (Responsive on Mobile) */}
          <div className="flex flex-wrap sm:flex-nowrap items-center justify-center sm:justify-start gap-2 sm:gap-4">
            <div className="p-3 sm:p-4 rounded-xl bg-slate-900/90 border border-slate-800 text-center flex-1 sm:flex-initial min-w-[95px] sm:min-w-[120px]">
              <span className="text-[9px] sm:text-[10px] text-slate-400 uppercase tracking-wider font-semibold block">
                Current Rating
              </span>
              <span className="text-xl sm:text-2xl font-black text-rose-400">⭐ {baseRating}</span>
              <span className="text-[9px] sm:text-[10px] text-slate-500 block">Baseline</span>
            </div>

            <div className="text-indigo-400 font-bold text-base sm:text-lg hidden sm:block">→</div>

            <div className="p-3 sm:p-4 rounded-xl bg-gradient-to-br from-indigo-950/80 to-slate-900 border border-indigo-500/40 text-center flex-1 sm:flex-initial min-w-[110px] sm:min-w-[140px] shadow-lg shadow-indigo-600/20">
              <span className="text-[9px] sm:text-[10px] text-indigo-300 uppercase tracking-wider font-bold block">
                Projected Rating
              </span>
              <span className="text-xl sm:text-2xl font-black text-emerald-400">⭐ {projectedRating}</span>
              <span className="text-[9px] sm:text-[10px] text-emerald-400 font-semibold block">
                +{Math.round(currentImpact * 100) / 100} Stars Lift
              </span>
            </div>

            <div className="p-3 sm:p-4 rounded-xl bg-slate-900/90 border border-slate-800 text-center flex-1 sm:flex-initial min-w-[95px] sm:min-w-[120px]">
              <span className="text-[9px] sm:text-[10px] text-slate-400 uppercase tracking-wider font-semibold block">
                Complaints
              </span>
              <span className="text-xl sm:text-2xl font-black text-cyan-400">-{totalComplaintDrop}%</span>
              <span className="text-[9px] sm:text-[10px] text-slate-400 block">Reduction</span>
            </div>
          </div>
        </div>

        {/* Toggles */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          {solutions.map((sol) => (
            <div
              key={sol.id}
              onClick={() => toggleSolution(sol.id)}
              className={`p-4 rounded-xl border transition-all cursor-pointer flex items-start gap-4 ${
                sol.enabled
                  ? 'bg-indigo-950/30 border-indigo-500/50 shadow-sm'
                  : 'bg-slate-900/40 border-slate-800/80 hover:border-slate-700 opacity-60'
              }`}
            >
              <input
                type="checkbox"
                checked={sol.enabled}
                onChange={() => {}}
                className="mt-1 w-4 h-4 rounded text-indigo-600 focus:ring-0 cursor-pointer"
              />

              <div className="space-y-1.5 flex-1">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-white">{sol.title}</h4>
                  <span className="text-xs font-bold text-emerald-400">+{sol.impact} ★</span>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">{sol.description}</p>
                <div className="flex items-center gap-2 pt-1 text-[10px]">
                  <Badge variant="category" label={sol.category.replace(/_/g, ' ')} size="sm" />
                  <span className="text-cyan-400 font-semibold">
                    ~{sol.complaintDrop}% complaint reduction in category
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Planned & Active Experiments Pipeline */}
      <div className="glass-card rounded-2xl p-6 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <FlaskConical className="w-5 h-5 text-indigo-400" />
              <span>A/B Experiment Verification Matrix</span>
            </h3>
            <p className="text-xs text-slate-400">
              Controlled field experiments measuring impact before wide enterprise rollout
            </p>
          </div>
        </div>

        {loading ? (
          <div className="p-8 text-center text-xs text-slate-400">Loading experiments...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {experiments.map((exp) => (
              <div
                key={exp.experimentId}
                className="p-5 rounded-xl bg-slate-900/70 border border-slate-800 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-semibold text-slate-400">
                    {exp.experimentId}
                  </span>
                  <Badge variant="status" value={exp.status} size="sm" />
                </div>

                <h4 className="text-sm font-bold text-white leading-snug">{exp.title}</h4>

                <p className="text-xs text-slate-300 leading-relaxed italic">
                  "{exp.hypothesis}"
                </p>

                <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800/80 space-y-1 text-xs">
                  <div className="flex justify-between text-slate-400">
                    <span>Target Metric:</span>
                    <span className="text-white font-medium">{exp.metricTarget}</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Baseline → Target:</span>
                    <span className="text-emerald-400 font-bold">
                      {exp.baseline} → {exp.target}
                    </span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Sample Cohort:</span>
                    <span className="text-slate-300">{exp.sampleSize}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1 text-xs">
                  <span className="text-slate-400">Projected Rating Lift</span>
                  <span className="text-emerald-400 font-bold">+{exp.projectedRatingImpact} Stars</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
