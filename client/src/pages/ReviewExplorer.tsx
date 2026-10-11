import React, { useEffect, useState } from 'react';
import {
  Search,
  Filter,
  Download,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Edit3,
  CheckCircle,
  X,
  Star,
} from 'lucide-react';
import { pulseApi } from '../api/client';
import { IReview } from '../types';
import { Badge } from '../components/common/Badge';

export const ReviewExplorer: React.FC = () => {
  const [reviews, setReviews] = useState<IReview[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(true);

  // Filters
  const [search, setSearch] = useState<string>('');
  const [rating, setRating] = useState<string>('');
  const [category, setCategory] = useState<string>('');
  const [sentiment, setSentiment] = useState<string>('');
  const [severity, setSeverity] = useState<string>('');
  const [platform, setPlatform] = useState<string>('all');

  // Selected Review for Modal
  const [selectedReview, setSelectedReview] = useState<IReview | null>(null);
  const [classifyingId, setClassifyingId] = useState<string | null>(null);
  const [overrideCategory, setOverrideCategory] = useState<string>('');
  const [overrideSuccess, setOverrideSuccess] = useState<boolean>(false);

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const data = await pulseApi.getReviews({
        page,
        limit: 15,
        search: search || undefined,
        rating: rating || undefined,
        category: category || undefined,
        sentiment: sentiment || undefined,
        severity: severity || undefined,
        platform: platform === 'all' ? undefined : platform,
      });
      setReviews(data.reviews);
      setTotal(data.pagination.total);
      setTotalPages(data.pagination.totalPages);
    } catch (err) {
      console.error('Failed to fetch reviews:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [page, rating, category, sentiment, severity, platform]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchReviews();
  };

  const handleClassify = async (id: string) => {
    setClassifyingId(id);
    try {
      const res = await pulseApi.classifyReview(id);
      if (res.review) {
        setReviews((prev) => prev.map((r) => (r.reviewId === id ? { ...r, ...res.review } : r)));
        if (selectedReview?.reviewId === id) {
          setSelectedReview({ ...selectedReview, ...res.review });
        }
      }
    } catch (err) {
      console.error('Classification error:', err);
    } finally {
      setClassifyingId(null);
    }
  };

  const handleManualOverride = async () => {
    if (!selectedReview || !overrideCategory) return;
    try {
      await pulseApi.updateReviewClassification(selectedReview.reviewId, {
        primaryCategory: overrideCategory,
      });
      const updated = { ...selectedReview, primaryCategory: overrideCategory };
      setSelectedReview(updated);
      setReviews((prev) =>
        prev.map((r) => (r.reviewId === selectedReview.reviewId ? updated : r))
      );
      setOverrideSuccess(true);
      setTimeout(() => setOverrideSuccess(false), 2500);
    } catch (err) {
      console.error('Override error:', err);
    }
  };

  const categoriesList = [
    'booking',
    'gps_eta',
    'notifications',
    'pickup_timing',
    'routing',
    'check_in_no_show',
    'support',
    'usability',
    'safety',
    'performance',
    'general_positive',
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
            Review Explorer & Intelligence
          </h2>
          <p className="text-xs sm:text-sm text-slate-400">
            Search, filter, and inspect verified user reviews with automated commute domain classifications
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <a
            href={pulseApi.getExportReviewsUrl()}
            className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 text-xs font-semibold transition-all shadow-sm"
          >
            <Download className="w-3.5 h-3.5 text-indigo-400" />
            <span>Download CSV</span>
          </a>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="glass-card rounded-2xl p-4 border border-slate-800 space-y-4">
        <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-2.5 sm:gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search reviews by keyword (e.g., 'night shift', 'driver late', 'OTP')..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-900/90 border border-slate-800 rounded-xl text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-indigo-600/30 flex-shrink-0"
          >
            Search
          </button>
        </form>

        {/* Dropdown Filters (Responsive Grid on Mobile) */}
        <div className="grid grid-cols-2 sm:flex sm:flex-wrap items-center gap-2.5 sm:gap-3 text-xs">
          {/* Rating */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-1.5">
            <span className="text-slate-400 text-[11px] sm:text-xs">Rating:</span>
            <select
              value={rating}
              onChange={(e) => {
                setRating(e.target.value);
                setPage(1);
              }}
              className="bg-slate-900 border border-slate-800 text-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-indigo-500 text-xs w-full sm:w-auto"
            >
              <option value="">All Ratings</option>
              <option value="1">⭐ 1 Star</option>
              <option value="2">⭐⭐ 2 Stars</option>
              <option value="3">⭐⭐⭐ 3 Stars</option>
              <option value="4">⭐⭐⭐⭐ 4 Stars</option>
              <option value="5">⭐⭐⭐⭐⭐ 5 Stars</option>
            </select>
          </div>

          {/* Category */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-1.5">
            <span className="text-slate-400 text-[11px] sm:text-xs">Category:</span>
            <select
              value={category}
              onChange={(e) => {
                setCategory(e.target.value);
                setPage(1);
              }}
              className="bg-slate-900 border border-slate-800 text-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-indigo-500 capitalize text-xs w-full sm:w-auto"
            >
              <option value="">All Categories</option>
              {categoriesList.map((c) => (
                <option key={c} value={c}>
                  {c.replace(/_/g, ' ')}
                </option>
              ))}
            </select>
          </div>

          {/* Severity */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-1.5">
            <span className="text-slate-400 text-[11px] sm:text-xs">Severity:</span>
            <select
              value={severity}
              onChange={(e) => {
                setSeverity(e.target.value);
                setPage(1);
              }}
              className="bg-slate-900 border border-slate-800 text-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-indigo-500 text-xs w-full sm:w-auto"
            >
              <option value="">All Severities</option>
              <option value="critical">Critical</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>

          {/* Sentiment */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-1.5">
            <span className="text-slate-400 text-[11px] sm:text-xs">Sentiment:</span>
            <select
              value={sentiment}
              onChange={(e) => {
                setSentiment(e.target.value);
                setPage(1);
              }}
              className="bg-slate-900 border border-slate-800 text-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-indigo-500 text-xs w-full sm:w-auto"
            >
              <option value="">All Sentiments</option>
              <option value="negative">Negative</option>
              <option value="neutral">Neutral</option>
              <option value="positive">Positive</option>
            </select>
          </div>

          {/* Platform */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-1.5">
            <span className="text-slate-400 text-[11px] sm:text-xs">Platform:</span>
            <select
              value={platform}
              onChange={(e) => {
                setPlatform(e.target.value);
                setPage(1);
              }}
              className="bg-slate-900 border border-slate-800 text-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-indigo-500 text-xs w-full sm:w-auto"
            >
              <option value="all">All</option>
              <option value="google_play">Google Play</option>
              <option value="app_store">App Store</option>
            </select>
          </div>

          {/* Reset Filters */}
          {(rating || category || sentiment || severity || platform !== 'all' || search) && (
            <button
              onClick={() => {
                setRating('');
                setCategory('');
                setSentiment('');
                setSeverity('');
                setPlatform('all');
                setSearch('');
                setPage(1);
              }}
              className="col-span-2 sm:col-span-1 text-xs text-indigo-400 hover:text-indigo-300 sm:ml-auto font-medium text-left sm:text-right"
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Review Count Info */}
      <div className="flex items-center justify-between text-xs text-slate-400 px-1">
        <span>
          Showing <span className="text-white font-semibold">{reviews.length}</span> of{' '}
          <span className="text-white font-semibold">{total}</span> reviews
        </span>
        <span>
          Page {page} of {totalPages}
        </span>
      </div>

      {/* Reviews Display: Mobile Card View + Desktop Table View */}
      <div className="glass-card rounded-2xl border border-slate-800 overflow-hidden">
        {loading ? (
          <div className="p-12 flex flex-col items-center justify-center gap-2">
            <div className="w-8 h-8 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin"></div>
            <p className="text-xs text-slate-400">Loading reviews...</p>
          </div>
        ) : reviews.length === 0 ? (
          <div className="p-12 text-center text-slate-400 space-y-2">
            <p className="text-base font-semibold text-slate-300">No reviews match your filters</p>
            <p className="text-xs">Try clearing some filter criteria to see more records.</p>
          </div>
        ) : (
          <>
            {/* Mobile Cards (visible on Android & iPhone screens < md) */}
            <div className="block md:hidden divide-y divide-slate-800/80">
              {reviews.map((r) => (
                <div
                  key={r.reviewId}
                  onClick={() => {
                    setSelectedReview(r);
                    setOverrideCategory(r.primaryCategory);
                  }}
                  className="p-4 space-y-2.5 active:bg-slate-900/60 transition-colors cursor-pointer"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-amber-400 text-sm">{r.rating}★</span>
                      <Badge variant="sentiment" value={r.sentiment} size="sm" />
                      <Badge variant="severity" value={r.severity} size="sm" />
                    </div>
                    <span className="text-[10px] text-slate-400">
                      {new Date(r.reviewDate).toLocaleDateString()}
                    </span>
                  </div>

                  <p className="text-xs text-slate-200 line-clamp-3 leading-relaxed">
                    {r.reviewText}
                  </p>

                  <div className="flex items-center justify-between pt-1">
                    <div className="flex items-center gap-1.5">
                      <Badge variant="category" label={r.primaryCategory.replace(/_/g, ' ')} size="sm" />
                      <span className="text-[10px] text-slate-400">{r.platform}</span>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleClassify(r.reviewId);
                      }}
                      disabled={classifyingId === r.reviewId}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-500/10 active:bg-indigo-500/30 text-indigo-300 border border-indigo-500/30 font-medium text-[11px]"
                    >
                      <Sparkles className={`w-3 h-3 ${classifyingId === r.reviewId ? 'animate-spin' : ''}`} />
                      <span>Classify</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop Table (visible on md+) */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-900/80 border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider text-[11px]">
                    <th className="py-3 px-4">Rating</th>
                    <th className="py-3 px-4">Review Text</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4">Severity</th>
                    <th className="py-3 px-4">Platform & Date</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {reviews.map((r) => (
                    <tr
                      key={r.reviewId}
                      className="hover:bg-slate-900/40 transition-colors cursor-pointer"
                      onClick={() => {
                        setSelectedReview(r);
                        setOverrideCategory(r.primaryCategory);
                      }}
                    >
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-amber-400 text-sm">{r.rating}★</span>
                          <Badge variant="sentiment" value={r.sentiment} size="sm" />
                        </div>
                      </td>
                      <td className="py-3.5 px-4 max-w-md">
                        <p className="text-slate-200 line-clamp-2 leading-relaxed">{r.reviewText}</p>
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <Badge variant="category" label={r.primaryCategory.replace(/_/g, ' ')} size="sm" />
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <Badge variant="severity" value={r.severity} size="sm" />
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap text-slate-400">
                        <div className="space-y-0.5">
                          <Badge variant="platform" value={r.platform} size="sm" />
                          <p className="text-[10px] text-slate-400">{new Date(r.reviewDate).toLocaleDateString()}</p>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleClassify(r.reviewId);
                          }}
                          disabled={classifyingId === r.reviewId}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-medium transition-all"
                          title="Run AI / rule classification"
                        >
                          <Sparkles className={`w-3 h-3 ${classifyingId === r.reviewId ? 'animate-spin' : ''}`} />
                          <span>Classify</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* Pagination Bar */}
        <div className="p-4 bg-slate-900/80 border-t border-slate-800 flex items-center justify-between">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed text-xs font-semibold"
          >
            <ChevronLeft className="w-4 h-4" /> Previous
          </button>

          <span className="text-xs text-slate-400">
            Page <span className="font-bold text-white">{page}</span> of {totalPages}
          </span>

          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed text-xs font-semibold"
          >
            Next <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Review Detail Modal */}
      {selectedReview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-2xl glass-panel rounded-2xl border border-slate-700 shadow-2xl p-5 sm:p-6 relative max-h-[92vh] overflow-y-auto">
            <button
              onClick={() => setSelectedReview(null)}
              className="absolute top-4 right-4 sm:top-5 sm:right-5 p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-4 pt-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xl font-black text-amber-400">{selectedReview.rating} ★</span>
                <span className="text-xs text-slate-400 font-mono">ID: {selectedReview.reviewId}</span>
                <Badge variant="platform" value={selectedReview.platform} size="sm" />
                <Badge variant="sentiment" value={selectedReview.sentiment} size="sm" />
              </div>

              {/* Full Review Text */}
              <div className="p-3.5 sm:p-4 rounded-xl bg-slate-900 border border-slate-800">
                <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-normal">
                  "{selectedReview.reviewText}"
                </p>
              </div>

              {/* Metadata details */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3 text-xs">
                <div className="p-2.5 sm:p-3 rounded-lg bg-slate-900/60 border border-slate-800">
                  <span className="text-slate-400 block mb-0.5 text-[11px]">Date</span>
                  <span className="font-semibold text-white">
                    {new Date(selectedReview.reviewDate).toLocaleDateString()}
                  </span>
                </div>
                <div className="p-2.5 sm:p-3 rounded-lg bg-slate-900/60 border border-slate-800">
                  <span className="text-slate-400 block mb-0.5 text-[11px]">App Version</span>
                  <span className="font-semibold text-white">{selectedReview.appVersion}</span>
                </div>
                <div className="p-2.5 sm:p-3 rounded-lg bg-slate-900/60 border border-slate-800">
                  <span className="text-slate-400 block mb-0.5 text-[11px]">Severity</span>
                  <Badge variant="severity" value={selectedReview.severity} size="sm" />
                </div>
                <div className="p-2.5 sm:p-3 rounded-lg bg-slate-900/60 border border-slate-800">
                  <span className="text-slate-400 block mb-0.5 text-[11px]">Confidence</span>
                  <span className="font-semibold text-emerald-400">
                    {Math.round((selectedReview.confidence || 0.85) * 100)}%
                  </span>
                </div>
              </div>

              {/* Human-in-the-loop manual override section */}
              <div className="mt-5 pt-4 border-t border-slate-800 space-y-3">
                <div>
                  <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                    <Edit3 className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Reviewer Override / Manual Reclassification</span>
                  </h4>
                  <p className="text-[11px] text-slate-400">
                    Adjust classification if edge-case context demands
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 sm:gap-3">
                  <select
                    value={overrideCategory}
                    onChange={(e) => setOverrideCategory(e.target.value)}
                    className="flex-1 bg-slate-900 border border-slate-700 text-slate-200 rounded-xl px-3 py-2 text-xs capitalize focus:outline-none focus:border-indigo-500"
                  >
                    {categoriesList.map((c) => (
                      <option key={c} value={c}>
                        {c.replace(/_/g, ' ')}
                      </option>
                    ))}
                  </select>

                  <button
                    onClick={handleManualOverride}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center justify-center gap-1.5"
                  >
                    <CheckCircle className="w-3.5 h-3.5" />
                    <span>Apply Override</span>
                  </button>
                </div>

                {overrideSuccess && (
                  <p className="text-xs text-emerald-400 flex items-center gap-1.5 animate-in fade-in">
                    <CheckCircle className="w-3.5 h-3.5" />
                    <span>Classification successfully updated!</span>
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
