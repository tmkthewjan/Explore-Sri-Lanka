"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  MessageSquare,
  Search,
  Filter,
  Star,
  Trash2,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  ShieldAlert,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { getAdminReviews, deleteAdminReview, getAdminReviewAnalytics } from "@/lib/api";
import { AdminReviewItem, ReviewAnalyticsData } from "@/types/admin";
import { RatingDistributionChart } from "@/components/admin/AdminCharts";

export default function AdminReviewsPage() {
  const { token } = useAuth();
  const [reviews, setReviews] = useState<AdminReviewItem[]>([]);
  const [analytics, setAnalytics] = useState<ReviewAnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters & Pagination
  const [search, setSearch] = useState("");
  const [rating, setRating] = useState("all");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Actions
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [deleteTargetReview, setDeleteTargetReview] = useState<AdminReviewItem | null>(null);

  const fetchData = async () => {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const [revRes, analRes] = await Promise.all([
        getAdminReviews(token, {
          search,
          rating: rating === "all" ? undefined : rating,
          page,
          limit: 10,
        }),
        getAdminReviewAnalytics(token),
      ]);
      setReviews(revRes.reviews);
      setTotalPages(revRes.pagination.totalPages);
      setTotalCount(revRes.pagination.total);
      setAnalytics(analRes);
    } catch (err: any) {
      setError(err.message || "Failed to load reviews");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [search, rating, page, token]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleDeleteReview = async () => {
    if (!token || !deleteTargetReview) return;
    setActionLoadingId(deleteTargetReview.id);
    try {
      await deleteAdminReview(token, deleteTargetReview.id);
      showToast("Review removed successfully.");
      setDeleteTargetReview(null);
      fetchData();
    } catch (err: any) {
      setError(err.message || "Failed to delete review");
    } finally {
      setActionLoadingId(null);
    }
  };

  return (
    <div className="space-y-8">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 p-4 rounded-2xl bg-emerald-600 text-white shadow-xl shadow-emerald-950/50 flex items-center gap-3 text-sm">
          <CheckCircle2 className="w-5 h-5" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-white tracking-tight flex items-center gap-2.5">
            <MessageSquare className="w-6 h-6 text-emerald-400" /> Customer Feedback & Review Moderation
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Auditing and moderating verified travel impressions, ratings, and feedback
          </p>
        </div>

        <button
          onClick={fetchData}
          className="self-start sm:self-auto flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 hover:text-white transition-all border border-slate-700"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Refresh Reviews
        </button>
      </div>

      {/* Rating Summary Card */}
      {analytics && (
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl shadow-slate-950/40">
          <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider mb-4">
            Aggregated Sentiment & Rating Breakdown
          </h3>
          <RatingDistributionChart
            distribution={analytics.distribution}
            totalReviews={analytics.totalReviews}
            averageRating={analytics.averageRating}
          />
        </div>
      )}

      {/* Search & Rating Filter Bar */}
      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* Search */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by comment keyword, user name, or destination..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-800/80 border border-slate-700 text-slate-100 placeholder:text-slate-500 text-xs focus:outline-none focus:border-emerald-500 transition-colors"
          />
        </div>

        {/* Rating Filter */}
        <div className="flex items-center gap-2 bg-slate-800/80 border border-slate-700 rounded-xl px-3 py-1.5">
          <Star className="w-4 h-4 text-amber-400 shrink-0" />
          <select
            value={rating}
            onChange={(e) => {
              setRating(e.target.value);
              setPage(1);
            }}
            className="w-full bg-transparent text-xs text-slate-200 focus:outline-none"
          >
            <option value="all" className="bg-slate-800">All Star Ratings</option>
            <option value="5" className="bg-slate-800">5 Stars Only</option>
            <option value="4" className="bg-slate-800">4 Stars Only</option>
            <option value="3" className="bg-slate-800">3 Stars Only</option>
            <option value="2" className="bg-slate-800">2 Stars Only</option>
            <option value="1" className="bg-slate-800">1 Star Only</option>
          </select>
        </div>
      </div>

      {/* Reviews Table */}
      <div className="rounded-3xl bg-slate-900 border border-slate-800 overflow-hidden shadow-xl shadow-slate-950/40">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-800/80 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800 text-[11px]">
              <tr>
                <th className="py-4 px-6">Destination</th>
                <th className="py-4 px-6">Traveler</th>
                <th className="py-4 px-6">Rating</th>
                <th className="py-4 px-6">Review & Comment</th>
                <th className="py-4 px-6">Submitted Date</th>
                <th className="py-4 px-6 text-right">Moderation Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-500">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto text-emerald-400 mb-2" />
                    Loading customer feedback...
                  </td>
                </tr>
              ) : reviews.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-500">
                    No reviews found matching your filter criteria.
                  </td>
                </tr>
              ) : (
                reviews.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-800/40 transition-colors">
                    {/* Destination */}
                    <td className="py-4 px-6 font-semibold text-white">
                      <div className="flex items-center gap-3">
                        <img
                          src={r.place_image}
                          alt={r.place_title}
                          className="w-10 h-10 rounded-xl object-cover border border-slate-700 shrink-0"
                        />
                        <div className="min-w-0">
                          <p className="font-bold text-slate-200 truncate">{r.place_title}</p>
                          <Link
                            href={`/places/${r.place_slug}`}
                            target="_blank"
                            className="text-[10px] text-emerald-400 hover:underline flex items-center gap-0.5"
                          >
                            View Place <ExternalLink className="w-2.5 h-2.5" />
                          </Link>
                        </div>
                      </div>
                    </td>

                    {/* Traveler */}
                    <td className="py-4 px-6 font-medium text-slate-300">
                      <p className="font-bold text-white">{r.user_name}</p>
                      <span className="text-[10px] text-slate-500 font-mono">{r.user_email}</span>
                    </td>

                    {/* Star Rating */}
                    <td className="py-4 px-6">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-500/10 text-amber-300 border border-amber-500/20 font-mono">
                        {r.rating} ★
                      </span>
                    </td>

                    {/* Comment */}
                    <td className="py-4 px-6 text-slate-300 max-w-xs">
                      <p className="line-clamp-2 italic text-xs">&ldquo;{r.comment}&rdquo;</p>
                    </td>

                    {/* Date */}
                    <td className="py-4 px-6 text-slate-400 font-mono text-[11px]">
                      {new Date(r.created_at).toLocaleDateString()}
                    </td>

                    {/* Actions */}
                    <td className="py-4 px-6 text-right">
                      <button
                        onClick={() => setDeleteTargetReview(r)}
                        title="Delete Inappropriate Review"
                        className="p-2 rounded-xl bg-slate-800 hover:bg-red-500/20 text-slate-400 hover:text-red-400 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="p-4 bg-slate-900 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <span>
            Showing page <strong className="text-white">{page}</strong> of <strong className="text-white">{totalPages}</strong> ({totalCount} total reviews)
          </span>

          <div className="flex items-center gap-2">
            <button
              disabled={page <= 1 || loading}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed text-white transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              disabled={page >= totalPages || loading}
              onClick={() => setPage((p) => p + 1)}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed text-white transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteTargetReview && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-slate-900 border border-red-500/30 rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-red-500/10 text-red-400 flex items-center justify-center">
              <ShieldAlert className="w-6 h-6" />
            </div>

            <div>
              <h3 className="text-lg font-bold text-white">Moderate & Delete Review</h3>
              <p className="text-xs text-slate-400 mt-1">
                Are you sure you want to delete the review for{" "}
                <span className="text-white font-semibold">{deleteTargetReview.place_title}</span> by{" "}
                <span className="text-white font-semibold">{deleteTargetReview.user_name}</span>?
              </p>
              <p className="mt-2 p-3 rounded-xl bg-slate-800/80 text-xs italic text-slate-300 line-clamp-3">
                &ldquo;{deleteTargetReview.comment}&rdquo;
              </p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setDeleteTargetReview(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white bg-slate-800"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteReview}
                className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-red-600 hover:bg-red-500 shadow-md shadow-red-950"
              >
                Confirm Removal
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
