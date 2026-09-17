"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import {
  getPlaceReviewsApi,
  getPlaceReviewSummaryApi,
  addReviewApi,
  updateReviewApi,
  deleteReviewApi,
} from "@/lib/api";
import { Review, ReviewSummary } from "@/types/review";
import StarRating from "@/components/StarRating";
import {
  Star,
  MessageSquare,
  Edit2,
  Trash2,
  CheckCircle2,
  AlertCircle,
  X,
  LogIn,
  Send,
  Sparkles,
} from "lucide-react";

interface ReviewSectionProps {
  placeId: string;
  placeTitle: string;
}

export default function ReviewSection({ placeId, placeTitle }: ReviewSectionProps) {
  const { user, token } = useAuth();

  const [reviews, setReviews] = useState<Review[]>([]);
  const [summary, setSummary] = useState<ReviewSummary>({
    average_rating: 0,
    review_count: 0,
    rating_distribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
  });
  const [loading, setLoading] = useState(true);

  // Modal / Form state
  const [modalOpen, setModalOpen] = useState(false);
  const [loginPromptOpen, setLoginPromptOpen] = useState(false);
  const [editingReviewId, setEditingReviewId] = useState<string | null>(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      const [sum, revList] = await Promise.all([
        getPlaceReviewSummaryApi(placeId),
        getPlaceReviewsApi(placeId),
      ]);
      setSummary(sum);
      setReviews(revList);
    } catch (err) {
      console.error("Failed to load reviews:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (placeId) {
      loadData();
    }
  }, [placeId]);

  const userReview = user ? reviews.find((r) => r.user_id === user.id) : null;

  const handleOpenModal = (reviewToEdit?: Review) => {
    if (!user || !token) {
      setLoginPromptOpen(true);
      return;
    }

    if (reviewToEdit) {
      setEditingReviewId(reviewToEdit.id);
      setRating(reviewToEdit.rating);
      setComment(reviewToEdit.comment);
    } else if (userReview) {
      setEditingReviewId(userReview.id);
      setRating(userReview.rating);
      setComment(userReview.comment);
    } else {
      setEditingReviewId(null);
      setRating(5);
      setComment("");
    }

    setFormError(null);
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    if (!comment.trim() || comment.trim().length < 3) {
      setFormError("Please write at least 3 characters in your review.");
      return;
    }

    setSubmitting(true);
    setFormError(null);

    try {
      if (editingReviewId) {
        await updateReviewApi(token, editingReviewId, { rating, comment });
      } else {
        await addReviewApi(token, { place_id: placeId, rating, comment });
      }
      setModalOpen(false);
      await loadData();
    } catch (err: any) {
      setFormError(err.message || "Failed to submit review.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (reviewId: string) => {
    if (!token) return;
    if (!window.confirm("Are you sure you want to delete your review?")) return;

    try {
      await deleteReviewApi(token, reviewId);
      await loadData();
    } catch (err: any) {
      alert(err.message || "Failed to delete review.");
    }
  };

  // Helper for distribution progress bar
  const totalCount = summary.review_count || 0;
  const getPercentage = (count: number) => {
    if (!totalCount) return 0;
    return Math.round((count / totalCount) * 100);
  };

  return (
    <section className="mt-12 pt-10 border-t border-slate-200">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-emerald-600 uppercase tracking-widest mb-1">
            <MessageSquare className="w-4 h-4" />
            Traveler Community
          </div>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900">
            Ratings & Reviews
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Verified traveler experiences for {placeTitle}
          </p>
        </div>

        <button
          onClick={() => handleOpenModal(userReview || undefined)}
          className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-semibold text-xs sm:text-sm shadow-md shadow-emerald-600/20 transition-all hover:shadow-lg active:scale-98 self-start sm:self-auto"
        >
          {userReview ? (
            <>
              <Edit2 className="w-4 h-4" />
              Edit Your Review
            </>
          ) : (
            <>
              <Star className="w-4 h-4 fill-amber-300 text-amber-300" />
              Write a Review
            </>
          )}
        </button>
      </div>

      {/* Overview Card */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-sm mb-8 grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
        {/* Overall Score */}
        <div className="md:col-span-4 text-center md:border-r border-slate-100 md:pr-8">
          <div className="text-5xl sm:text-6xl font-black text-slate-900 tracking-tight">
            {summary.average_rating > 0 ? summary.average_rating.toFixed(1) : "5.0"}
          </div>
          <div className="my-2.5 flex justify-center">
            <StarRating
              value={summary.average_rating > 0 ? Math.round(summary.average_rating) : 5}
              readOnly
              size="md"
            />
          </div>
          <p className="text-xs text-slate-500 font-medium">
            Based on {summary.review_count} {summary.review_count === 1 ? "review" : "reviews"}
          </p>
        </div>

        {/* Rating Breakdown Bars */}
        <div className="md:col-span-8 space-y-2.5">
          {[5, 4, 3, 2, 1].map((star) => {
            const count = summary.rating_distribution[star] || 0;
            const percentage = getPercentage(count);

            return (
              <div key={star} className="flex items-center gap-3 text-xs">
                <span className="w-12 font-medium text-slate-700 flex items-center gap-1 shrink-0">
                  {star} <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                </span>
                <div className="flex-1 h-2.5 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-amber-400 rounded-full transition-all duration-500"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <span className="w-10 text-right text-slate-400 font-medium shrink-0">
                  {count}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Review List */}
      <div className="space-y-4">
        {reviews.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-3xl border border-slate-200/80 p-8 space-y-3">
            <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
              <Sparkles className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900">No reviews yet</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Have you visited {placeTitle}? Be the first explorer to share your feedback and help fellow travelers!
            </p>
            <button
              onClick={() => handleOpenModal()}
              className="mt-2 text-xs font-semibold text-emerald-600 hover:text-emerald-700 underline"
            >
              Share your experience
            </button>
          </div>
        ) : (
          reviews.map((rev) => {
            const isOwner = user && rev.user_id === user.id;

            return (
              <div
                key={rev.id}
                className={`p-5 sm:p-6 rounded-3xl border transition-all ${
                  isOwner
                    ? "bg-emerald-50/40 border-emerald-200/80 shadow-sm"
                    : "bg-white border-slate-200/80 shadow-sm"
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  {/* Reviewer Details */}
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-emerald-600 to-teal-500 text-white font-bold text-sm flex items-center justify-center uppercase shadow-sm shrink-0 overflow-hidden">
                      {rev.profile_image ? (
                        <img
                          src={rev.profile_image}
                          alt={rev.user_name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span>{rev.user_name?.charAt(0) || "T"}</span>
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-slate-900">
                          {rev.user_name}
                        </span>
                        {isOwner && (
                          <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                            You
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-400">
                        {new Date(rev.created_at).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </p>
                    </div>
                  </div>

                  {/* Review Actions for Author */}
                  {isOwner && (
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleOpenModal(rev)}
                        title="Edit Review"
                        className="p-1.5 text-slate-400 hover:text-emerald-600 rounded-lg hover:bg-white transition-colors"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(rev.id)}
                        title="Delete Review"
                        className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-white transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>

                <div className="mt-3">
                  <StarRating value={rev.rating} readOnly size="sm" />
                </div>

                <p className="mt-2.5 text-xs sm:text-sm text-slate-700 leading-relaxed">
                  {rev.comment}
                </p>
              </div>
            );
          })
        )}
      </div>

      {/* Review Composer Modal */}
      {modalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => setModalOpen(false)}
        >
          <div
            className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full border border-slate-200 shadow-2xl relative space-y-5"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-900">
                {editingReviewId ? "Edit Your Review" : `Review ${placeTitle}`}
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-100 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {formError && (
              <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Star Rating Selection */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-2">
                  Your Overall Rating
                </label>
                <div className="flex items-center gap-3">
                  <StarRating value={rating} onChange={setRating} size="lg" />
                  <span className="text-xs font-bold text-amber-600 bg-amber-50 px-2.5 py-1 rounded-lg">
                    {rating} {rating === 1 ? "Star" : "Stars"}
                  </span>
                </div>
              </div>

              {/* Review Text */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                  Your Travel Review & Tips
                </label>
                <textarea
                  rows={4}
                  required
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Share what you liked, best time to visit, ticket tips, scenic view spots, etc..."
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-900 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all placeholder:text-slate-400 resize-none"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="flex-1 py-3 px-4 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-md shadow-emerald-600/20 transition-all disabled:opacity-60"
                >
                  {submitting ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      {editingReviewId ? "Save Changes" : "Post Review"}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Login Prompt Modal for Guests */}
      {loginPromptOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => setLoginPromptOpen(false)}
        >
          <div
            className="bg-white rounded-3xl p-6 sm:p-7 max-w-sm w-full border border-slate-200 shadow-2xl relative space-y-4 text-center"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setLoginPromptOpen(false)}
              className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-100 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
              <Star className="w-6 h-6 fill-amber-400 text-amber-400" />
            </div>

            <div>
              <h3 className="text-lg font-bold text-slate-900">Sign In to Review</h3>
              <p className="text-xs text-slate-500 mt-1">
                You must be signed in to leave ratings and share reviews for {placeTitle}.
              </p>
            </div>

            <div className="flex gap-2.5 pt-1">
              <Link
                href="/login"
                className="flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-md transition-all"
              >
                <LogIn className="w-3.5 h-3.5" />
                Sign In
              </Link>
              <Link
                href="/register"
                className="flex-1 flex items-center justify-center py-2.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs transition-all"
              >
                Sign Up
              </Link>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
