"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Users,
  UserCheck,
  UserPlus,
  MapPin,
  MessageSquare,
  Heart,
  Star,
  RefreshCw,
  ArrowRight,
  TrendingUp,
  ShieldCheck,
  PlusCircle,
  ExternalLink,
  Clock,
  Sparkles,
  AlertCircle,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { getAdminDashboardStats } from "@/lib/api";
import { DashboardData } from "@/types/admin";
import { formatDistance } from "@/lib/utils";

const PERIOD_OPTIONS = [
  { label: "Today (24h)", value: "today" },
  { label: "Last 7 Days", value: "7d" },
  { label: "Last 30 Days", value: "30d" },
  { label: "Last 90 Days", value: "90d" },
];

export default function AdminDashboardPage() {
  const { token } = useAuth();
  const [data, setData] = useState<DashboardData | null>(null);
  const [period, setPeriod] = useState<string>("30d");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = async (selectedPeriod: string, isManualRefresh = false) => {
    if (!token) return;
    if (isManualRefresh) setRefreshing(true);
    else setLoading(true);
    setError(null);

    try {
      const res = await getAdminDashboardStats(token, selectedPeriod);
      setData(res);
    } catch (err: any) {
      setError(err.message || "Failed to load dashboard metrics");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchStats(period);
  }, [period, token]);

  const stats = data?.stats;

  return (
    <div className="space-y-8">
      {/* Top Banner & Time Filter */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-3xl bg-gradient-to-r from-emerald-950/70 via-slate-900 to-slate-900 border border-emerald-500/20 shadow-xl shadow-emerald-950/20">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              Live Operations
            </span>
            <span className="text-xs text-slate-400">Database Engine: PostgreSQL 16 + PostGIS</span>
          </div>
          <h2 className="text-2xl font-black text-white tracking-tight">
            Platform Pulse & Performance
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Monitoring active explorers, curated destinations, spatial queries, and community reviews.
          </p>
        </div>

        {/* Period Selector & Refresh */}
        <div className="flex items-center gap-2 self-start md:self-auto">
          <div className="flex items-center bg-slate-800/80 p-1 rounded-2xl border border-slate-700/80">
            {PERIOD_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setPeriod(opt.value)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  period === opt.value
                    ? "bg-emerald-600 text-white shadow-md shadow-emerald-900/40"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>

          <button
            onClick={() => fetchStats(period, true)}
            disabled={refreshing || loading}
            title="Refresh Data"
            className="p-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 hover:text-white transition-all disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin text-emerald-400" : ""}`} />
          </button>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 flex items-center justify-between text-sm">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>{error}</span>
          </div>
          <button
            onClick={() => fetchStats(period)}
            className="text-xs font-bold underline hover:text-white"
          >
            Retry
          </button>
        </div>
      )}

      {/* Primary KPI Grid (7 Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {/* Card 1: Total Users */}
        <div className="p-5 rounded-3xl bg-slate-900/90 border border-slate-800/80 hover:border-slate-700 transition-all shadow-lg shadow-slate-950/40 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Users</span>
            <div className="w-10 h-10 rounded-2xl bg-blue-500/10 text-blue-400 border border-blue-500/20 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-black text-white font-mono tracking-tight">
              {loading ? (
                <div className="w-16 h-8 bg-slate-800 rounded-lg animate-pulse" />
              ) : (
                stats?.totalUsers.toLocaleString()
              )}
            </div>
            <p className="text-xs text-slate-400 mt-1">All registered accounts in PostgreSQL</p>
          </div>
        </div>

        {/* Card 2: Active Users (Period Filtered) */}
        <div className="p-5 rounded-3xl bg-gradient-to-br from-emerald-950/30 to-slate-900 border border-emerald-500/30 shadow-lg shadow-emerald-950/30 flex flex-col justify-between relative overflow-hidden">
          <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">Active Users</span>
              <span className="text-[10px] text-emerald-500/80 block font-mono">({period})</span>
            </div>
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center justify-center shadow-md shadow-emerald-500/20">
              <UserCheck className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-black text-emerald-300 font-mono tracking-tight">
              {loading ? (
                <div className="w-16 h-8 bg-slate-800 rounded-lg animate-pulse" />
              ) : (
                stats?.activeUsers.toLocaleString()
              )}
            </div>
            <p className="text-xs text-slate-400 mt-1">Logged in or active within selected window</p>
          </div>
        </div>

        {/* Card 3: New Users */}
        <div className="p-5 rounded-3xl bg-slate-900/90 border border-slate-800/80 hover:border-slate-700 transition-all shadow-lg shadow-slate-950/40 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">New Signups</span>
            <div className="w-10 h-10 rounded-2xl bg-teal-500/10 text-teal-400 border border-teal-500/20 flex items-center justify-center">
              <UserPlus className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-black text-white font-mono tracking-tight">
              {loading ? (
                <div className="w-16 h-8 bg-slate-800 rounded-lg animate-pulse" />
              ) : (
                stats?.newUsers.toLocaleString()
              )}
            </div>
            <p className="text-xs text-slate-400 mt-1">Newly onboarded within {period}</p>
          </div>
        </div>

        {/* Card 4: Total Places (Spatial DB) */}
        <div className="p-5 rounded-3xl bg-slate-900/90 border border-slate-800/80 hover:border-slate-700 transition-all shadow-lg shadow-slate-950/40 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Destinations</span>
            <div className="w-10 h-10 rounded-2xl bg-purple-500/10 text-purple-400 border border-purple-500/20 flex items-center justify-center">
              <MapPin className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-black text-white font-mono tracking-tight">
              {loading ? (
                <div className="w-16 h-8 bg-slate-800 rounded-lg animate-pulse" />
              ) : (
                stats?.totalPlaces.toLocaleString()
              )}
            </div>
            <p className="text-xs text-slate-400 mt-1">Indexed with PostGIS geography point</p>
          </div>
        </div>

        {/* Card 5: Total Reviews */}
        <div className="p-5 rounded-3xl bg-slate-900/90 border border-slate-800/80 hover:border-slate-700 transition-all shadow-lg shadow-slate-950/40 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Reviews</span>
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center justify-center">
              <MessageSquare className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-black text-white font-mono tracking-tight">
              {loading ? (
                <div className="w-16 h-8 bg-slate-800 rounded-lg animate-pulse" />
              ) : (
                stats?.totalReviews.toLocaleString()
              )}
            </div>
            <p className="text-xs text-slate-400 mt-1">Ratings 1-5 & verified travel comments</p>
          </div>
        </div>

        {/* Card 6: Total Favorites */}
        <div className="p-5 rounded-3xl bg-slate-900/90 border border-slate-800/80 hover:border-slate-700 transition-all shadow-lg shadow-slate-950/40 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Favorites (Wishlist)</span>
            <div className="w-10 h-10 rounded-2xl bg-rose-500/10 text-rose-400 border border-rose-500/20 flex items-center justify-center">
              <Heart className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-black text-white font-mono tracking-tight">
              {loading ? (
                <div className="w-16 h-8 bg-slate-800 rounded-lg animate-pulse" />
              ) : (
                stats?.totalFavorites.toLocaleString()
              )}
            </div>
            <p className="text-xs text-slate-400 mt-1">Saved places in user travel wishlists</p>
          </div>
        </div>

        {/* Card 7: Average Rating */}
        <div className="sm:col-span-2 p-5 rounded-3xl bg-gradient-to-r from-slate-900 to-amber-950/30 border border-amber-500/20 shadow-lg shadow-slate-950/40 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-400">Average Platform Rating</span>
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center justify-center shadow-md shadow-amber-500/20">
              <Star className="w-5 h-5 fill-amber-300" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-3">
            <div className="text-3xl font-black text-amber-300 font-mono tracking-tight">
              {loading ? (
                <div className="w-16 h-8 bg-slate-800 rounded-lg animate-pulse" />
              ) : (
                `${stats?.averageRating.toFixed(1)} / 5.0`
              )}
            </div>
            <div className="flex items-center text-amber-400 text-xs">
              {"★".repeat(Math.round(stats?.averageRating || 5))}
            </div>
          </div>
          <p className="text-xs text-slate-400 mt-1">Weighted aggregation across all tourist destinations</p>
        </div>
      </div>

      {/* Quick Admin Actions Row */}
      <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white">Administrative Shortcuts</h4>
            <p className="text-xs text-slate-400">Fast action triggers for common operational tasks</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Link
            href="/admin/places?action=add"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 transition-all shadow-md shadow-emerald-900/30"
          >
            <PlusCircle className="w-4 h-4" /> Add Destination
          </Link>
          <Link
            href="/admin/users"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 transition-all border border-slate-700"
          >
            <Users className="w-4 h-4" /> Manage Users
          </Link>
          <Link
            href="/admin/reviews"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 transition-all border border-slate-700"
          >
            <MessageSquare className="w-4 h-4" /> Moderate Reviews
          </Link>
          <Link
            href="/admin/analytics"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 transition-all border border-slate-700"
          >
            <TrendingUp className="w-4 h-4" /> Full Analytics
          </Link>
        </div>
      </div>

      {/* Lower Grids: Recent Reviews & Recent Signups */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Feedback Moderation Feed */}
        <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800/80 shadow-xl shadow-slate-950/40 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <MessageSquare className="w-4 h-4 text-emerald-400" />
                <h3 className="text-base font-bold text-white tracking-tight">Recent Traveler Feedback</h3>
              </div>
              <Link
                href="/admin/reviews"
                className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 inline-flex items-center gap-1"
              >
                View all <ArrowRight className="w-3 h-3" />
              </Link>
            </div>

            <div className="mt-4 space-y-3.5">
              {data?.recentReviews && data.recentReviews.length > 0 ? (
                data.recentReviews.map((rev) => (
                  <div
                    key={rev.id}
                    className="p-3.5 rounded-2xl bg-slate-800/50 border border-slate-800 hover:border-slate-700 transition-all"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-200 truncate">{rev.place_title}</span>
                      <div className="flex items-center text-amber-400 font-mono text-[11px] font-bold">
                        {"★".repeat(rev.rating)}
                        <span className="ml-1 text-slate-400">({rev.rating}/5)</span>
                      </div>
                    </div>
                    <p className="text-xs text-slate-400 mt-1.5 line-clamp-2 italic">
                      &ldquo;{rev.comment}&rdquo;
                    </p>
                    <div className="flex items-center justify-between text-[11px] text-slate-500 mt-2 font-mono">
                      <span>By: {rev.user_name || rev.user_email}</span>
                      <span>{new Date(rev.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-12 text-center text-xs text-slate-500">
                  No reviews submitted yet.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Recent Registered Users Feed */}
        <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800/80 shadow-xl shadow-slate-950/40 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <Users className="w-4 h-4 text-emerald-400" />
                <h3 className="text-base font-bold text-white tracking-tight">Recent Registered Explorers</h3>
              </div>
              <Link
                href="/admin/users"
                className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 inline-flex items-center gap-1"
              >
                View all <ArrowRight className="w-3 h-3" />
              </Link>
            </div>

            <div className="mt-4 space-y-3">
              {data?.recentUsers && data.recentUsers.length > 0 ? (
                data.recentUsers.map((u) => (
                  <div
                    key={u.id}
                    className="p-3 rounded-2xl bg-slate-800/50 border border-slate-800 flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-8 h-8 rounded-xl bg-slate-700 text-white font-bold flex items-center justify-center text-xs shrink-0">
                        {u.full_name?.charAt(0) || "U"}
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-slate-200 truncate">{u.full_name}</p>
                        <p className="text-[11px] text-slate-400 font-mono truncate">{u.email}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span
                        className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                          u.role === "admin"
                            ? "bg-purple-500/20 text-purple-300 border border-purple-500/30"
                            : "bg-slate-700 text-slate-300"
                        }`}
                      >
                        {u.role || "user"}
                      </span>
                      <span
                        className={`w-2 h-2 rounded-full ${
                          u.is_active !== false ? "bg-emerald-400" : "bg-red-400"
                        }`}
                        title={u.is_active !== false ? "Active" : "Inactive"}
                      />
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-12 text-center text-xs text-slate-500">
                  No users registered yet.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
