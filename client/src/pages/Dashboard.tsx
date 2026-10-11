import React, { useEffect, useState } from 'react';
import {
  Star,
  TrendingDown,
  AlertOctagon,
  Calendar,
  Layers,
  ArrowUpRight,
  Filter,
  Sparkles,
  Car,
  Clock,
  Compass,
  BellRing,
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  BarChart,
  Bar,
  Cell,
  PieChart,
  Pie,
} from 'recharts';
import { pulseApi } from '../api/client';
import { IDashboardSummary, IRatingTrendItem, ICategoryDistributionItem, ISentimentTrendItem } from '../types';
import { MetricCard } from '../components/common/MetricCard';
import { Badge } from '../components/common/Badge';

export const Dashboard: React.FC = () => {
  const [summary, setSummary] = useState<IDashboardSummary | null>(null);
  const [ratingTrend, setRatingTrend] = useState<IRatingTrendItem[]>([]);
  const [categories, setCategories] = useState<ICategoryDistributionItem[]>([]);
  const [sentimentTrend, setSentimentTrend] = useState<ISentimentTrendItem[]>([]);
  const [platform, setPlatform] = useState<string>('all');
  const [loading, setLoading] = useState<boolean>(true);

  const loadData = async () => {
    setLoading(true);
    try {
      const p = platform === 'all' ? undefined : platform;
      const [sum, trend, cats, sent] = await Promise.all([
        pulseApi.getSummary({ platform: p }),
        pulseApi.getRatingTrend({ platform: p }),
        pulseApi.getCategoryDistribution({ platform: p }),
        pulseApi.getSentimentTrend({ platform: p }),
      ]);
      setSummary(sum);
      setRatingTrend(trend);
      setCategories(cats);
      setSentimentTrend(sent);
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [platform]);

  const categoryColorPalette = [
    '#6366f1', // Indigo - Booking
    '#06b6d4', // Cyan - GPS/ETA
    '#f59e0b', // Amber - Notifications
    '#ec4899', // Pink - Pickup timing
    '#8b5cf6', // Purple - Routing
    '#ef4444', // Red - Check-in / No-show
    '#10b981', // Emerald - General positive
    '#64748b', // Slate - Usability/Other
  ];

  if (loading && !summary) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin"></div>
          <p className="text-sm text-slate-400">Loading Commute Intelligence Dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12">
      {/* Top Banner & Control Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
            Executive Summary & Rating Health
          </h2>
          <p className="text-sm text-slate-400">
            Real-time synthesis of employee sentiment, shift commute friction, and Play Store ratings
          </p>
        </div>

        {/* Platform filter tabs */}
        <div className="flex items-center gap-2 p-1 bg-slate-900/90 rounded-xl border border-slate-800 text-xs self-start md:self-auto">
          <span className="text-slate-400 px-2 flex items-center gap-1 font-medium">
            <Filter className="w-3.5 h-3.5" /> Platform:
          </span>
          {['all', 'google_play', 'app_store'].map((p) => (
            <button
              key={p}
              onClick={() => setPlatform(p)}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                platform === p
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              {p === 'all' ? 'All Platforms' : p === 'google_play' ? 'Google Play' : 'App Store'}
            </button>
          ))}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Average App Rating"
          value={summary ? `${summary.averageRating} / 5.0` : '—'}
          subtitle="Based on verified app store reviews"
          icon={Star}
          glowColor={summary && summary.averageRating < 3 ? 'rose' : 'amber'}
          trend={{ value: summary && summary.averageRating < 3 ? 'Critical Alert' : 'Normal', isPositive: false }}
        />

        <MetricCard
          title="Negative Review Ratio"
          value={summary ? `${summary.negativePercentage}%` : '—'}
          subtitle="1-star and 2-star ratings combined"
          icon={TrendingDown}
          glowColor="rose"
          trend={{ value: `${summary?.totalReviews || 0} reviews analyzed`, isNeutral: true }}
        />

        <MetricCard
          title="Top Friction: Booking"
          value={summary ? `${summary.bookingComplaintShare}%` : '—'}
          subtitle="Share of complaints regarding shift bookings"
          icon={Calendar}
          glowColor="indigo"
          trend={{ value: 'Highest volume impact', isPositive: false }}
        />

        <MetricCard
          title="Critical Issues Backlog"
          value={summary ? `${summary.openHighPriorityIssues}` : '—'}
          subtitle="High & critical severity bottlenecks"
          icon={AlertOctagon}
          glowColor="amber"
          trend={{ value: 'P0/P1 Actions Required', isPositive: false }}
        />
      </div>

      {/* Primary Analytics Section: Trends & Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Rating Trend Chart */}
        <div className="lg:col-span-8 glass-card rounded-2xl p-6 border border-slate-800">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <span>App Store Rating Trajectory</span>
                <span className="text-xs font-normal text-slate-400">(Monthly Average)</span>
              </h3>
              <p className="text-xs text-slate-400">Identifies release regressions and stability dips</p>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <span className="w-3 h-3 rounded-full bg-indigo-500"></span>
              <span className="text-slate-300">Avg Rating</span>
            </div>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={ratingTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis dataKey="month" stroke="#64748b" fontSize={11} tickLine={false} />
                <YAxis domain={[1, 5]} stroke="#64748b" fontSize={11} tickLine={false} tickCount={5} />
                <Tooltip
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload as IRatingTrendItem;
                      return (
                        <div className="p-3 bg-slate-900/95 border border-slate-800 rounded-xl shadow-xl text-xs space-y-1">
                          <p className="font-bold text-white">{label}</p>
                          <p className="text-indigo-400 font-semibold">Average: ⭐ {data.averageRating}</p>
                          <p className="text-slate-400">Total Reviews: {data.totalReviews}</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="averageRating"
                  stroke="#6366f1"
                  strokeWidth={3}
                  dot={{ r: 4, fill: '#6366f1', stroke: '#1e1b4b', strokeWidth: 2 }}
                  activeDot={{ r: 6, fill: '#818cf8' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Sentiment Breakdown */}
        <div className="lg:col-span-4 glass-card rounded-2xl p-6 border border-slate-800 flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-white mb-1">Sentiment Balance</h3>
            <p className="text-xs text-slate-400 mb-6">User emotional breakdown across reviews</p>

            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-xs mb-1 font-medium">
                  <span className="text-rose-400 flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span> Negative
                  </span>
                  <span className="text-slate-300 font-bold">{summary?.negativePercentage}%</span>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-rose-500 h-full rounded-full transition-all duration-500"
                    style={{ width: `${summary?.negativePercentage || 0}%` }}
                  ></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1 font-medium">
                  <span className="text-amber-400 flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span> Neutral
                  </span>
                  <span className="text-slate-300 font-bold">{summary?.neutralPercentage}%</span>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-amber-500 h-full rounded-full transition-all duration-500"
                    style={{ width: `${summary?.neutralPercentage || 0}%` }}
                  ></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1 font-medium">
                  <span className="text-emerald-400 flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> Positive
                  </span>
                  <span className="text-slate-300 font-bold">{summary?.positivePercentage}%</span>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                    style={{ width: `${summary?.positivePercentage || 0}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-800 text-xs text-slate-400">
            <span className="text-amber-400 font-semibold">Diagnosis: </span>
            Negative feedback predominates due to shift-critical commute failures (booking errors & GPS inaccuracies).
          </div>
        </div>
      </div>

      {/* Category Breakdown & Problem Heatmap */}
      <div className="glass-card rounded-2xl p-6 border border-slate-800">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-base font-bold text-white">Root Cause Category Distribution</h3>
            <p className="text-xs text-slate-400">Volume and impact of complaints classified by commute domain</p>
          </div>
          <span className="text-xs text-slate-400 bg-slate-900 px-3 py-1 rounded-lg border border-slate-800">
            {categories.length} Categories Tracked
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map((cat, idx) => {
            const isCritical = ['booking', 'gps_eta', 'check_in_no_show'].includes(cat.category);
            return (
              <div
                key={cat.category}
                className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-indigo-500/30 transition-all"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-3 h-3 rounded-md"
                      style={{ backgroundColor: categoryColorPalette[idx % categoryColorPalette.length] }}
                    ></span>
                    <h4 className="text-sm font-bold text-white capitalize">
                      {cat.category.replace(/_/g, ' ')}
                    </h4>
                  </div>
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                      cat.averageRating <= 2.2
                        ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                        : 'bg-slate-800 text-slate-300'
                    }`}
                  >
                    ⭐ {cat.averageRating}
                  </span>
                </div>

                <div className="mt-3 flex items-baseline justify-between text-xs">
                  <span className="text-slate-400">{cat.count} total mentions</span>
                  <span className="text-rose-400 font-medium">{cat.negativeCount} negative</span>
                </div>

                <div className="mt-2 w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${cat.percentage}%`,
                      backgroundColor: categoryColorPalette[idx % categoryColorPalette.length],
                    }}
                  ></div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recent Reviews Ticker */}
      <div className="glass-card rounded-2xl p-6 border border-slate-800">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-white">Recent Feedback Stream</h3>
            <p className="text-xs text-slate-400">Live feed of employee reviews with automated categorization</p>
          </div>
          <a
            href="/reviews"
            className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 font-semibold"
          >
            Explore all reviews <ArrowUpRight className="w-3.5 h-3.5" />
          </a>
        </div>

        <div className="divide-y divide-slate-800/80">
          {(summary?.recentReviews || []).slice(0, 5).map((rev) => (
            <div key={rev.reviewId} className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="space-y-1 max-w-2xl">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-amber-400">{'★'.repeat(rev.rating)}</span>
                  <span className="text-xs text-slate-400">({rev.platform})</span>
                  <Badge variant="category" label={rev.primaryCategory.replace(/_/g, ' ')} size="sm" />
                  <Badge variant="severity" value={rev.severity} size="sm" />
                </div>
                <p className="text-xs text-slate-300 line-clamp-1 italic">"{rev.reviewText}"</p>
              </div>

              <span className="text-[11px] text-slate-400 flex-shrink-0">
                {new Date(rev.reviewDate).toLocaleDateString()}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
