"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Heart,
  TrendingUp,
  MapPin,
  ExternalLink,
  RefreshCw,
  Clock,
  User,
  Sparkles,
  Award,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { getAdminFavoritesAnalytics } from "@/lib/api";
import { FavoritesAnalyticsData } from "@/types/admin";
import { BarRankChart } from "@/components/admin/AdminCharts";

export default function AdminFavoritesPage() {
  const { token } = useAuth();
  const [data, setData] = useState<FavoritesAnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalytics = async () => {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const res = await getAdminFavoritesAnalytics(token);
      setData(res);
    } catch (err: any) {
      setError(err.message || "Failed to load favorites analytics");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [token]);

  const totalFavoritesCount = data?.topFavorites?.reduce(
    (acc, cur) => acc + Number(cur.favorites_count || 0),
    0
  ) || 0;

  const barChartItems = (data?.topFavorites || []).map((f) => ({
    label: f.title,
    count: Number(f.favorites_count || 0),
    subLabel: `${f.district} • ${f.category}`,
  }));

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-white tracking-tight flex items-center gap-2.5">
            <Heart className="w-6 h-6 text-rose-400 fill-rose-400" /> Wishlist & Favorites Analytics
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Tracking tourist wishlist demand, popularity leaderboards, and recent saves
          </p>
        </div>

        <button
          onClick={fetchAnalytics}
          className="self-start sm:self-auto flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 hover:text-white transition-all border border-slate-700"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Refresh Analytics
        </button>
      </div>

      {/* KPI Highlight Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 uppercase font-bold tracking-wider">
              Top 10 Wishlist Volume
            </span>
            <p className="text-3xl font-black text-white font-mono mt-1">
              {loading ? "..." : totalFavoritesCount.toLocaleString()}
            </p>
            <span className="text-[11px] text-slate-500 mt-1 block">Accumulated across top spots</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-rose-500/10 text-rose-400 flex items-center justify-center">
            <Award className="w-6 h-6" />
          </div>
        </div>

        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 uppercase font-bold tracking-wider">
              #1 Wishlisted Spot
            </span>
            <p className="text-lg font-bold text-rose-300 truncate mt-1">
              {loading ? "..." : data?.topFavorites[0]?.title || "N/A"}
            </p>
            <span className="text-[11px] text-slate-500 font-mono block">
              {data?.topFavorites[0]?.favorites_count || 0} explorers saved
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-rose-500/20 text-rose-300 flex items-center justify-center">
            <Heart className="w-6 h-6 fill-rose-300" />
          </div>
        </div>

        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 uppercase font-bold tracking-wider">
              Recent Save Velocity
            </span>
            <p className="text-3xl font-black text-emerald-400 font-mono mt-1">
              {loading ? "..." : `${data?.recentActivity?.length || 0} active`}
            </p>
            <span className="text-[11px] text-slate-500 mt-1 block">Live wishlist events tracked</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
            <TrendingUp className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Main Grid: Leaderboard & Recent Activity Stream */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Leaderboard Chart */}
        <div className="lg:col-span-7 p-6 sm:p-8 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div>
              <h3 className="text-base font-bold text-white">Most Favorited Destinations</h3>
              <p className="text-xs text-slate-400">Ranked by total user saves</p>
            </div>
            <span className="text-xs font-mono text-emerald-400 font-bold">Top 10 Rankings</span>
          </div>

          {loading ? (
            <div className="py-16 text-center text-slate-500 text-xs">
              <RefreshCw className="w-6 h-6 animate-spin mx-auto text-emerald-400 mb-2" />
              Loading wishlist analytics...
            </div>
          ) : (
            <BarRankChart items={barChartItems} color="bg-rose-500" maxItems={10} />
          )}
        </div>

        {/* Live Recent Saves Activity Feed */}
        <div className="lg:col-span-5 p-6 sm:p-8 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Clock className="w-4 h-4 text-emerald-400" /> Recent Wishlist Saves
            </h3>
            <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded-full font-mono">Live</span>
          </div>

          <div className="space-y-3">
            {loading ? (
              <div className="py-12 text-center text-slate-500 text-xs">Loading activity stream...</div>
            ) : data?.recentActivity && data.recentActivity.length > 0 ? (
              data.recentActivity.map((act) => (
                <div
                  key={act.id}
                  className="p-3 rounded-2xl bg-slate-800/40 border border-slate-800 flex items-center justify-between text-xs gap-3"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-xl bg-rose-500/10 text-rose-400 flex items-center justify-center shrink-0">
                      <Heart className="w-4 h-4 fill-rose-400" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-bold text-slate-200 truncate">{act.place_title}</p>
                      <p className="text-[11px] text-slate-400 truncate">Saved by {act.user_name}</p>
                    </div>
                  </div>

                  <span className="text-[10px] text-slate-500 font-mono shrink-0">
                    {new Date(act.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </span>
                </div>
              ))
            ) : (
              <div className="py-12 text-center text-slate-500 text-xs">
                No recent favorite events recorded.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
