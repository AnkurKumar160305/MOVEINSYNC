import React, { useEffect, useState } from 'react';
import {
  FileText,
  Printer,
  Download,
  CheckCircle2,
  AlertTriangle,
  Award,
  Layers,
  ArrowRight,
} from 'lucide-react';
import { pulseApi } from '../api/client';
import { IExecutiveReport } from '../types';
import { Badge } from '../components/common/Badge';

export const ExecutiveReport: React.FC = () => {
  const [report, setReport] = useState<IExecutiveReport | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchReport = async () => {
    setLoading(true);
    try {
      const data = await pulseApi.getExecutiveReport();
      setReport(data);
    } catch (err) {
      console.error('Failed to load report:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, []);

  const handlePrint = () => {
    window.print();
  };

  if (loading && !report) {
    return (
      <div className="p-16 text-center text-xs text-slate-400">
        Generating Executive Briefing Report...
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-16 max-w-4xl mx-auto">
      {/* Action Header */}
      <div className="flex items-center justify-between no-print">
        <div>
          <h2 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
            Executive Briefing Report
          </h2>
          <p className="text-sm text-slate-400">
            Candidate assignment synthesis prepared for MoveInSync Product & Engineering Leadership
          </p>
        </div>

        <button
          onClick={handlePrint}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-md"
        >
          <Printer className="w-4 h-4" />
          <span>Print / Save as PDF</span>
        </button>
      </div>

      {/* Printable Report Document Card */}
      <div className="glass-panel rounded-3xl p-8 sm:p-12 border border-slate-700/80 space-y-8 bg-slate-950/80 shadow-2xl print:bg-white print:text-black print:border-none print:shadow-none print:p-0">
        {/* Document Title Header */}
        <div className="border-b border-slate-800 pb-6 print:border-black/20">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-xs uppercase font-extrabold tracking-widest text-indigo-400 print:text-indigo-700 block mb-1">
                MoveInSync Pulse • Forward Deployed Engineering Assignment
              </span>
              <h1 className="text-3xl font-black text-white print:text-black tracking-tight">
                Play Store Rating Root-Cause Investigation & Reliability Roadmap
              </h1>
            </div>
            <div className="text-right text-xs text-slate-400 print:text-slate-600">
              <p>Generated: {new Date().toLocaleDateString()}</p>
              <p className="font-semibold text-slate-300 print:text-slate-900">Confidential / Internal</p>
            </div>
          </div>
        </div>

        {/* Executive Summary Section */}
        <div className="space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400 print:text-slate-600">
            1. Executive Summary
          </h2>
          <p className="text-sm text-slate-200 print:text-slate-800 leading-relaxed">
            MoveInSync's mobile employee application operates in a mission-critical domain: getting employees to their shifts safely and on time. Analysis of customer ratings reveals an average rating of{' '}
            <strong className="text-rose-400 print:text-rose-700 font-bold">
              {report?.summary.averageRating} / 5.0
            </strong>
            , driven primarily by high user anxiety during the critical 15 minutes before pickup. Over{' '}
            <strong className="text-white print:text-black">
              {report?.summary.negativePercentage}%
            </strong>{' '}
            of feedback expresses extreme frustration with GPS staleness, booking confirmations on cross-midnight shifts, and false no-show penalties.
          </p>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
            <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 print:bg-slate-100 print:border-slate-300">
              <span className="text-[11px] text-slate-400 print:text-slate-600 block">Avg Rating</span>
              <span className="text-xl font-black text-rose-400 print:text-rose-700">
                {report?.summary.averageRating} ★
              </span>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 print:bg-slate-100 print:border-slate-300">
              <span className="text-[11px] text-slate-400 print:text-slate-600 block">Negative Reviews</span>
              <span className="text-xl font-black text-rose-400 print:text-rose-700">
                {report?.summary.negativePercentage}%
              </span>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 print:bg-slate-100 print:border-slate-300">
              <span className="text-[11px] text-slate-400 print:text-slate-600 block">Total Analyzed</span>
              <span className="text-xl font-black text-white print:text-black">
                {report?.summary.totalReviews}
              </span>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 print:bg-slate-100 print:border-slate-300">
              <span className="text-[11px] text-slate-400 print:text-slate-600 block">Critical Issues</span>
              <span className="text-xl font-black text-amber-400 print:text-amber-700">
                {report?.summary.criticalIssues}
              </span>
            </div>
          </div>
        </div>

        {/* Top 5 Prioritized Issues */}
        <div className="space-y-4 pt-4 border-t border-slate-800 print:border-black/20">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400 print:text-slate-600">
            2. Ranked Root Cause Priorities (Composite Scoring Model)
          </h2>

          <div className="space-y-3">
            {(report?.topIssues || []).map((issue, idx) => (
              <div
                key={issue.issueId}
                className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 print:bg-slate-50 print:border-slate-300 space-y-2"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-indigo-400 print:text-indigo-700">
                      #{idx + 1} [{issue.issueId}]
                    </span>
                    <h3 className="text-sm font-bold text-white print:text-black">{issue.title}</h3>
                  </div>
                  <span className="text-xs font-extrabold px-2 py-0.5 rounded bg-rose-500/10 text-rose-400 print:text-rose-700 border border-rose-500/20">
                    Score: {issue.priorityScore}/100
                  </span>
                </div>

                <p className="text-xs text-slate-300 print:text-slate-700 leading-relaxed">
                  {issue.description}
                </p>

                {issue.recommendedFix && (
                  <div className="p-2.5 rounded-lg bg-slate-950/70 border border-slate-800/80 print:bg-slate-100 print:border-slate-200 text-xs">
                    <strong className="text-indigo-400 print:text-indigo-700">Proposed Engineering Fix: </strong>
                    <span className="text-slate-300 print:text-slate-800">{issue.recommendedFix}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Forward Deployed Engineer Action Plan */}
        <div className="space-y-4 pt-4 border-t border-slate-800 print:border-black/20">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400 print:text-slate-600">
            3. Forward Deployed Engineering (FDE) 90-Day Execution Roadmap
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            {/* Sprint 1 */}
            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 print:bg-slate-50 print:border-slate-300 space-y-2">
              <h4 className="font-bold text-indigo-400 print:text-indigo-700 uppercase tracking-wider">
                Phase 1: Immediate Hotfixes (Days 1–14)
              </h4>
              <ul className="space-y-1.5 text-slate-300 print:text-slate-700">
                <li>• Deploy client-side date normalizer for overnight bookings spanning 00:00.</li>
                <li>• Add stale GPS ping visual indicator on tracking map when telemetry &gt; 30s old.</li>
                <li>• Implement 3-minute geofenced driver lockout before no-show can be submitted.</li>
              </ul>
            </div>

            {/* Sprint 2 */}
            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 print:bg-slate-50 print:border-slate-300 space-y-2">
              <h4 className="font-bold text-cyan-400 print:text-cyan-700 uppercase tracking-wider">
                Phase 2: Architectural Buffers (Days 15–45)
              </h4>
              <ul className="space-y-1.5 text-slate-300 print:text-slate-700">
                <li>• Introduce dynamic traffic ETA buffer with Google Maps / MapMyIndia API telemetry.</li>
                <li>• FCM high-priority channel overhaul with fallback SMS dispatch.</li>
                <li>• Canary rollout to 10% highest-churn enterprise routes.</li>
              </ul>
            </div>

            {/* Sprint 3 */}
            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 print:bg-slate-50 print:border-slate-300 space-y-2">
              <h4 className="font-bold text-emerald-400 print:text-emerald-700 uppercase tracking-wider">
                Phase 3: Observability & Scale (Days 46–90)
              </h4>
              <ul className="space-y-1.5 text-slate-300 print:text-slate-700">
                <li>• Automated Play Store review ingestion and daily regression alerts.</li>
                <li>• Real-time driver-commuter SLA deviation dashboard.</li>
                <li>• Model validation projecting Play Store recovery to 4.2+ ★.</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Signoff / Methodology */}
        <div className="pt-6 border-t border-slate-800 print:border-black/20 text-xs text-slate-400 print:text-slate-600 flex justify-between items-center">
          <div>
            <p>Candidate: Forward Deployed Engineer Candidate</p>
            <p>Platform: MoveInSync Pulse Intelligence System</p>
          </div>
          <div className="text-right">
            <span className="font-semibold text-emerald-400 print:text-emerald-700">
              Status: Ready for Evaluation
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
