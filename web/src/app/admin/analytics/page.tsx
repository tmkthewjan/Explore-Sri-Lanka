"use client";

import { useEffect, useState } from "react";
import {
  BarChart3,
  TrendingUp,
  Users,
  MapPin,
  Search,
  Compass,
  Star,
  RefreshCw,
  Navigation,
  Globe,
  PieChart,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import {
  getAdminUserAnalytics,
  getAdminPlaceAnalytics,
  getAdminReviewAnalytics,
  getAdminSearchAnalytics,
  getAdminLocationAnalytics,
} from "@/lib/api";
import {
  UserAnalyticsData,
  PlaceAnalyticsData,
  ReviewAnalyticsData,
  SearchAnalyticsData,
  LocationAnalyticsData,
} from "@/types/admin";
import {
  AreaTrendChart,
  BarRankChart,
  RatingDistributionChart,
} from "@/components/admin/AdminCharts";

export default function AdminAnalyticsPage() {
  const { token } = useAuth();
  const [period, setPeriod] = useState<string>("30d");
  const [loading, setLoading] = useState(true);

  // Analytics states
  const [userData, setUserData] = useState<UserAnalyticsData | null>(null);
  const [placeData, setPlaceData] = useState<PlaceAnalyticsData | null>(null);
  const [reviewData, setReviewData] = useState<ReviewAnalyticsData | null>(null);
  const [searchData, setSearchData] = useState<SearchAnalyticsData | null>(null);
  const [locationData, setLocationData] = useState<LocationAnalyticsData | null>(null);

  const fetchAllAnalytics = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const [u, p, r, s, l] = await Promise.all([
        getAdminUserAnalytics(token, period),
        getAdminPlaceAnalytics(token),
        getAdminReviewAnalytics(token),
        getAdminSearchAnalytics(token),
        getAdminLocationAnalytics(token),
      ]);
      setUserData(u);
      setPlaceData(p);
      setReviewData(r);
      setSearchData(s);
      setLocationData(l);
    } catch (err) {
      console.error("Failed to load platform analytics", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllAnalytics();
  }, [period, token]);

  // Format trend data for Area Chart
  const growthPoints = (userData?.registrationTrends || []).map((t) => ({
    label: t.date.slice(5), // MM-DD
    value: Number(t.count || 0),
  }));

  // Categories rank items
  const categoryRankItems = (placeData?.categoryBreakdown || []).map((c) => ({
    label: c.category,
    count: Number(c.count || 0),
  }));

  // Districts rank items
  const districtRankItems = (placeData?.districtBreakdown || []).map((d) => ({
    label: d.district,
    count: Number(d.count || 0),
  }));

  // Radius rank items
  const radiusRankItems = (locationData?.radiusBreakdown || []).map((r) => ({
    label: r.radius_range,
    count: Number(r.count || 0),
  }));

  // Search rank items
  const searchRankItems = (searchData?.topSearches || []).map((s) => ({
    label: s.search_query,
    count: Number(s.count || 0),
    badge: `Searched ${s.count}x`,
  }));

  return (
    <div className="space-y-8">
      {/* Header & Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-white tracking-tight flex items-center gap-2.5">
            <BarChart3 className="w-6 h-6 text-emerald-400" /> Platform Intelligence & Analytics
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Data insights on user growth, destination demand, search trends, and spatial radius queries
          </p>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs font-semibold text-slate-200 focus:outline-none"
          >
            <option value="today">Today (24h)</option>
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="90d">Last 90 Days</option>
          </select>

          <button
            onClick={fetchAllAnalytics}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-all"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Section 1: User Growth Area Chart */}
      <div className="p-6 sm:p-8 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-4">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-400" /> Explorer Growth & Signups Trend
            </h3>
            <p className="text-xs text-slate-400">Daily registration activity across selected window ({period})</p>
          </div>
          <div className="flex items-center gap-4 text-xs font-mono">
            <span className="text-slate-400">
              Active: <strong className="text-emerald-400">{userData?.userStatus?.active_count || 0}</strong>
            </span>
            <span className="text-slate-400">
              Admins: <strong className="text-purple-400">{userData?.userStatus?.admin_count || 1}</strong>
            </span>
          </div>
        </div>

        <div className="pt-4">
          {loading ? (
            <div className="h-48 flex items-center justify-center text-xs text-slate-500">
              <RefreshCw className="w-6 h-6 animate-spin mx-auto text-emerald-400 mb-2" />
            </div>
          ) : (
            <AreaTrendChart data={growthPoints} color="#10b981" height={220} valueLabel="signups" />
          )}
        </div>
      </div>

      {/* Section 2: Popular Categories & Popular Districts (2 Cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Category Breakdown */}
        <div className="p-6 sm:p-8 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Globe className="w-4 h-4 text-teal-400" /> Popular Travel Categories
            </h3>
            <span className="text-xs text-slate-500 font-mono">By Destination Count</span>
          </div>

          <div className="pt-2">
            <BarRankChart items={categoryRankItems} color="bg-teal-500" maxItems={6} />
          </div>
        </div>

        {/* District Breakdown */}
        <div className="p-6 sm:p-8 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <MapPin className="w-4 h-4 text-purple-400" /> Top Tourism Districts
            </h3>
            <span className="text-xs text-slate-500 font-mono">Geographic Distribution</span>
          </div>

          <div className="pt-2">
            <BarRankChart items={districtRankItems} color="bg-purple-500" maxItems={6} />
          </div>
        </div>
      </div>

      {/* Section 3: Rating Distribution Breakdown */}
      {reviewData && (
        <div className="p-6 sm:p-8 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Star className="w-4 h-4 text-amber-400 fill-amber-400" /> Rating & Sentiment Breakdown
            </h3>
            <span className="text-xs text-slate-400 font-mono">
              Total Verified Feedback: <strong className="text-white">{reviewData.totalReviews}</strong>
            </span>
          </div>

          <div className="pt-2">
            <RatingDistributionChart
              distribution={reviewData.distribution}
              totalReviews={reviewData.totalReviews}
              averageRating={reviewData.averageRating}
            />
          </div>
        </div>
      )}

      {/* Section 4: Search Analytics & Spatial Location Radius Queries (2 Cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Search Analytics */}
        <div className="p-6 sm:p-8 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Search className="w-4 h-4 text-blue-400" /> Search Keyword Analytics
              </h3>
              <p className="text-xs text-slate-400">Most queried terms in destination search</p>
            </div>
          </div>

          <div className="pt-2">
            <BarRankChart items={searchRankItems} color="bg-blue-500" maxItems={6} />
          </div>
        </div>

        {/* Location Analytics (PostGIS Radius) */}
        <div className="p-6 sm:p-8 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Navigation className="w-4 h-4 text-emerald-400" /> GPS Nearby Search Radius Demand
              </h3>
              <p className="text-xs text-slate-400">Aggregated proximity query distance distributions</p>
            </div>
          </div>

          <div className="pt-2">
            <BarRankChart items={radiusRankItems} color="bg-emerald-500" maxItems={6} />
          </div>
        </div>
      </div>
    </div>
  );
}
