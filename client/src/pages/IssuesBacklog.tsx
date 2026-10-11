import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  ListTodo,
  Sparkles,
  Layers,
  Activity,
  Flame,
  ShieldAlert,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { pulseApi } from '../api/client';
import { IIssue, ITask } from '../types';
import { Badge } from '../components/common/Badge';

export const IssuesBacklog: React.FC = () => {
  const navigate = useNavigate();
  const [issues, setIssues] = useState<IIssue[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [expandedIssueId, setExpandedIssueId] = useState<string | null>(null);
  const [generatingTaskId, setGeneratingTaskId] = useState<string | null>(null);
  const [createdTaskInfo, setCreatedTaskInfo] = useState<{ [issueId: string]: string }>({});

  const fetchIssues = async () => {
    setLoading(true);
    try {
      const data = await pulseApi.getIssues();
      // Sort by priorityScore descending
      data.sort((a, b) => b.priorityScore - a.priorityScore);
      setIssues(data);
    } catch (err) {
      console.error('Failed to load issues:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIssues();
  }, []);

  const handleGenerateTask = async (issueId: string) => {
    setGeneratingTaskId(issueId);
    try {
      const task = await pulseApi.generateTaskFromIssue(issueId);
      setCreatedTaskInfo((prev) => ({ ...prev, [issueId]: task.taskId }));
    } catch (err) {
      console.error('Error generating task:', err);
    } finally {
      setGeneratingTaskId(null);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-rose-400 bg-rose-500/10 border-rose-500/30';
    if (score >= 60) return 'text-amber-400 bg-amber-500/10 border-amber-500/30';
    return 'text-indigo-400 bg-indigo-500/10 border-indigo-500/30';
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
            Prioritized Problem Space & Issues
          </h2>
          <p className="text-sm text-slate-400">
            Ranked root causes derived from Play Store feedback with composite scoring model
          </p>
        </div>

        <button
          onClick={() => navigate('/tasks')}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-md shadow-indigo-600/30 self-start sm:self-auto"
        >
          <ListTodo className="w-4 h-4" />
          <span>View Engineering Task Board</span>
        </button>
      </div>

      {/* Priority Scoring Methodology Explainer */}
      <div className="glass-card rounded-2xl p-5 border border-slate-800 bg-gradient-to-r from-slate-900 via-indigo-950/20 to-slate-900">
        <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-400 mb-2 flex items-center gap-1.5">
          <Activity className="w-4 h-4" />
          <span>Weighted FDE Priority Scoring Formula (0 - 100)</span>
        </h4>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-xs">
          <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800/80">
            <span className="text-slate-400 block text-[11px]">Severity Impact</span>
            <span className="font-bold text-rose-400">30% Weight</span>
          </div>
          <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800/80">
            <span className="text-slate-400 block text-[11px]">Complaint Frequency</span>
            <span className="font-bold text-amber-400">25% Weight</span>
          </div>
          <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800/80">
            <span className="text-slate-400 block text-[11px]">Commute SLA Risk</span>
            <span className="font-bold text-cyan-400">20% Weight</span>
          </div>
          <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800/80">
            <span className="text-slate-400 block text-[11px]">Recent Trend Velocity</span>
            <span className="font-bold text-purple-400">15% Weight</span>
          </div>
          <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800/80">
            <span className="text-slate-400 block text-[11px]">Data Confidence</span>
            <span className="font-bold text-emerald-400">10% Weight</span>
          </div>
        </div>
      </div>

      {/* Issues List */}
      {loading ? (
        <div className="p-16 flex flex-col items-center justify-center gap-3">
          <div className="w-8 h-8 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin"></div>
          <p className="text-xs text-slate-400">Calculating issue rankings...</p>
        </div>
      ) : (
        <div className="space-y-4">
          {issues.map((issue, idx) => {
            const isExpanded = expandedIssueId === issue.issueId;
            const hasLinkedTask = createdTaskInfo[issue.issueId] || issue.linkedTaskId;

            return (
              <div
                key={issue.issueId}
                className="glass-card rounded-2xl border border-slate-800 hover:border-slate-700 transition-all overflow-hidden"
              >
                {/* Header row */}
                <div
                  className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer"
                  onClick={() => setExpandedIssueId(isExpanded ? null : issue.issueId)}
                >
                  <div className="flex items-start gap-4">
                    {/* Score badge */}
                    <div
                      className={`flex flex-col items-center justify-center w-14 h-14 rounded-2xl border flex-shrink-0 font-extrabold ${getScoreColor(
                        issue.priorityScore
                      )}`}
                    >
                      <span className="text-lg leading-none">{issue.priorityScore}</span>
                      <span className="text-[9px] uppercase tracking-wider font-semibold opacity-80 mt-0.5">
                        Score
                      </span>
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xs font-mono text-slate-400 font-semibold">{issue.issueId}</span>
                        <Badge variant="severity" value={issue.severity} size="sm" />
                        <Badge variant="category" label={issue.category.replace(/_/g, ' ')} size="sm" />
                        <Badge variant="status" value={issue.status} size="sm" />
                        {issue.userJourneyStage && (
                          <span className="text-[10px] text-cyan-300 bg-cyan-950/40 border border-cyan-800/40 px-2 py-0.5 rounded-full font-medium">
                            Journey: {issue.userJourneyStage}
                          </span>
                        )}
                      </div>

                      <h3 className="text-base font-bold text-white hover:text-indigo-300 transition-colors">
                        {issue.title}
                      </h3>

                      <p className="text-xs text-slate-400 line-clamp-2 max-w-3xl">
                        {issue.description}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 self-end sm:self-center">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setExpandedIssueId(isExpanded ? null : issue.issueId);
                      }}
                      className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white"
                    >
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Expanded Details View */}
                {isExpanded && (
                  <div className="px-5 pb-6 pt-2 border-t border-slate-800/80 bg-slate-950/40 space-y-5 animate-in fade-in duration-150">
                    {/* Root cause hypotheses */}
                    {issue.rootCauseHypotheses && issue.rootCauseHypotheses.length > 0 && (
                      <div>
                        <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400 mb-2 flex items-center gap-1.5">
                          <Flame className="w-3.5 h-3.5" />
                          <span>Engineering Root Cause Hypotheses</span>
                        </h4>
                        <ul className="space-y-1.5">
                          {issue.rootCauseHypotheses.map((hypo, hIdx) => (
                            <li
                              key={hIdx}
                              className="text-xs text-slate-300 flex items-start gap-2 bg-slate-900/60 p-2.5 rounded-xl border border-slate-800/60"
                            >
                              <span className="text-amber-400 font-bold">•</span>
                              <span>{hypo}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Recommended fix */}
                    {issue.recommendedFix && (
                      <div>
                        <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400 mb-1.5">
                          Recommended Architecture / Solution
                        </h4>
                        <p className="text-xs text-slate-200 bg-emerald-950/20 border border-emerald-900/40 p-3 rounded-xl leading-relaxed">
                          {issue.recommendedFix}
                        </p>
                      </div>
                    )}

                    {/* Acceptance criteria & Observability */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {issue.acceptanceCriteria && issue.acceptanceCriteria.length > 0 && (
                        <div>
                          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
                            <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400" />
                            <span>Acceptance Criteria</span>
                          </h4>
                          <ul className="space-y-1">
                            {issue.acceptanceCriteria.map((ac, acIdx) => (
                              <li key={acIdx} className="text-xs text-slate-300 flex items-start gap-2">
                                <span className="text-indigo-400">✓</span>
                                <span>{ac}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {issue.monitoringMetrics && issue.monitoringMetrics.length > 0 && (
                        <div>
                          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
                            <Activity className="w-3.5 h-3.5 text-cyan-400" />
                            <span>Observability & Telemetry Metrics</span>
                          </h4>
                          <div className="flex flex-wrap gap-1.5">
                            {issue.monitoringMetrics.map((met, mIdx) => (
                              <span
                                key={mIdx}
                                className="text-[11px] font-mono px-2 py-1 rounded bg-slate-900 border border-slate-800 text-cyan-300"
                              >
                                {met}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* FDE Action Button: Convert to Task */}
                    <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between">
                      <span className="text-xs text-slate-400">
                        Convert this analyzed root cause into an executable sprint ticket.
                      </span>

                      {hasLinkedTask ? (
                        <button
                          onClick={() => navigate('/tasks')}
                          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 text-xs font-bold hover:bg-emerald-500/20 transition-all"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Task Generated ({hasLinkedTask}) → View Board</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => handleGenerateTask(issue.issueId)}
                          disabled={generatingTaskId === issue.issueId}
                          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-md shadow-indigo-600/30"
                        >
                          <Sparkles
                            className={`w-4 h-4 ${generatingTaskId === issue.issueId ? 'animate-spin' : ''}`}
                          />
                          <span>Generate Engineering Ticket</span>
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
