"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  User as UserIcon,
  Mail,
  Calendar,
  Clock,
  Heart,
  MessageSquare,
  Star,
  Shield,
  ShieldCheck,
  UserX,
  UserCheck,
  Trash2,
  ExternalLink,
  MapPin,
  RefreshCw,
  CheckCircle2,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import {
  getAdminUserDetails,
  updateAdminUserStatus,
  updateAdminUserRole,
  deleteAdminUser,
} from "@/lib/api";
import { UserDetailsData } from "@/types/admin";

interface UserDetailPageProps {
  params: Promise<{ id: string }>;
}

export default function UserDetailPage({ params }: UserDetailPageProps) {
  const resolvedParams = use(params);
  const userId = resolvedParams.id;
  const router = useRouter();

  const { token, user: currentUser } = useAuth();
  const [data, setData] = useState<UserDetailsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchDetails = async () => {
    if (!token || !userId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await getAdminUserDetails(token, userId);
      setData(res);
    } catch (err: any) {
      setError(err.message || "Failed to load user profile");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetails();
  }, [userId, token]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleToggleStatus = async () => {
    if (!token || !data?.user) return;
    const newStatus = !data.user.is_active;
    setActionLoading(true);
    try {
      await updateAdminUserStatus(token, data.user.id, newStatus);
      showToast(`User status set to ${newStatus ? "Active" : "Deactivated"}`);
      fetchDetails();
    } catch (err: any) {
      setError(err.message || "Failed to update status");
    } finally {
      setActionLoading(false);
    }
  };

  const handleChangeRole = async (newRole: "user" | "admin") => {
    if (!token || !data?.user) return;
    setActionLoading(true);
    try {
      await updateAdminUserRole(token, data.user.id, newRole);
      showToast(`User role updated to ${newRole}`);
      fetchDetails();
    } catch (err: any) {
      setError(err.message || "Failed to update role");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteUser = async () => {
    if (!token || !data?.user) return;
    if (!confirm(`Are you sure you want to permanently delete ${data.user.full_name}?`)) {
      return;
    }
    setActionLoading(true);
    try {
      await deleteAdminUser(token, data.user.id);
      router.push("/admin/users");
    } catch (err: any) {
      setError(err.message || "Failed to delete user");
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="py-24 text-center text-slate-500">
        <RefreshCw className="w-8 h-8 animate-spin mx-auto text-emerald-400 mb-3" />
        <p className="text-xs">Loading user profile and history...</p>
      </div>
    );
  }

  if (error || !data?.user) {
    return (
      <div className="p-8 rounded-3xl bg-slate-900 border border-slate-800 text-center space-y-4">
        <h3 className="text-lg font-bold text-white">User Not Found</h3>
        <p className="text-xs text-slate-400">{error || "Could not retrieve user data"}</p>
        <Link
          href="/admin/users"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-emerald-600 text-white"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Users Directory
        </Link>
      </div>
    );
  }

  const u = data.user;
  const isCurrentAdmin = currentUser?.id === u.id;

  return (
    <div className="space-y-8">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 p-4 rounded-2xl bg-emerald-600 text-white shadow-xl shadow-emerald-950/50 flex items-center gap-3 text-sm">
          <CheckCircle2 className="w-5 h-5" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Back button */}
      <Link
        href="/admin/users"
        className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back to User Directory
      </Link>

      {/* Main Profile Card */}
      <div className="p-6 sm:p-8 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl shadow-slate-950/50 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-5">
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white font-black text-2xl flex items-center justify-center shadow-lg shadow-emerald-900/40 shrink-0">
            {u.full_name?.charAt(0) || "U"}
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <h2 className="text-2xl font-black text-white tracking-tight">{u.full_name}</h2>
              <span
                className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                  u.role === "admin"
                    ? "bg-purple-500/20 text-purple-300 border border-purple-500/30"
                    : "bg-slate-800 text-slate-300 border border-slate-700"
                }`}
              >
                {u.role === "admin" ? "Administrator" : "Standard User"}
              </span>
              <span
                className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full ${
                  u.is_active !== false
                    ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                    : "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                }`}
              >
                {u.is_active !== false ? "Active Account" : "Deactivated"}
              </span>
            </div>

            <p className="text-xs text-slate-400 font-mono flex items-center gap-2">
              <Mail className="w-3.5 h-3.5 text-slate-500" /> {u.email}
            </p>

            <div className="flex flex-wrap items-center gap-4 text-[11px] text-slate-500 font-mono pt-1">
              <span className="flex items-center gap-1">
                <Calendar className="w-3 h-3 text-slate-500" /> Registered:{" "}
                {u.created_at ? new Date(u.created_at).toLocaleDateString() : "–"}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3 text-slate-500" /> Last Active:{" "}
                {u.last_login_at ? new Date(u.last_login_at).toLocaleString() : "Never"}
              </span>
            </div>
          </div>
        </div>

        {/* Administrative Action Controls */}
        {!isCurrentAdmin && (
          <div className="flex flex-wrap items-center gap-2.5 self-start md:self-auto border-t md:border-t-0 border-slate-800 pt-4 md:pt-0">
            <button
              disabled={actionLoading}
              onClick={() => handleChangeRole(u.role === "admin" ? "user" : "admin")}
              className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-purple-300 border border-slate-700 transition-all"
            >
              Set Role: {u.role === "admin" ? "Standard User" : "Admin"}
            </button>

            <button
              disabled={actionLoading}
              onClick={handleToggleStatus}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all border ${
                u.is_active !== false
                  ? "bg-slate-800 hover:bg-red-500/20 text-red-400 border-slate-700"
                  : "bg-slate-800 hover:bg-emerald-500/20 text-emerald-400 border-slate-700"
              }`}
            >
              {u.is_active !== false ? "Deactivate Account" : "Activate Account"}
            </button>

            <button
              disabled={actionLoading}
              onClick={handleDeleteUser}
              className="p-2 rounded-xl text-xs font-semibold bg-red-600/20 hover:bg-red-600 text-red-300 hover:text-white border border-red-500/30 transition-all"
              title="Delete Account"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Stats Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 uppercase font-bold tracking-wider">Wishlist Items</span>
            <p className="text-2xl font-black text-white font-mono mt-1">{data.favorites.length}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-400 flex items-center justify-center">
            <Heart className="w-5 h-5" />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 uppercase font-bold tracking-wider">Reviews Posted</span>
            <p className="text-2xl font-black text-white font-mono mt-1">{data.reviews.length}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
            <MessageSquare className="w-5 h-5" />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 uppercase font-bold tracking-wider">Avg Given Rating</span>
            <p className="text-2xl font-black text-amber-300 font-mono mt-1">
              {u.average_review_rating > 0 ? `${u.average_review_rating} ★` : "N/A"}
            </p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
            <Star className="w-5 h-5 fill-amber-400" />
          </div>
        </div>
      </div>

      {/* User's Favorites Grid & Reviews Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Saved Wishlist */}
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Heart className="w-4 h-4 text-rose-400" /> Wishlist Destinations ({data.favorites.length})
            </h3>
          </div>

          <div className="space-y-3">
            {data.favorites.length > 0 ? (
              data.favorites.map((fav) => (
                <div
                  key={fav.favorite_id}
                  className="p-3 rounded-2xl bg-slate-800/50 border border-slate-800 flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <img
                      src={fav.cover_image}
                      alt={fav.title}
                      className="w-12 h-12 rounded-xl object-cover shrink-0"
                    />
                    <div className="min-w-0">
                      <p className="font-bold text-xs text-white truncate">{fav.title}</p>
                      <p className="text-[11px] text-slate-400 flex items-center gap-1 font-mono">
                        <MapPin className="w-3 h-3 text-emerald-400" /> {fav.district} • {fav.category}
                      </p>
                    </div>
                  </div>

                  <Link
                    href={`/places/${fav.slug}`}
                    target="_blank"
                    className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors shrink-0"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </Link>
                </div>
              ))
            ) : (
              <div className="py-12 text-center text-xs text-slate-500">
                User has not added any destinations to their wishlist yet.
              </div>
            )}
          </div>
        </div>

        {/* User Reviews */}
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-amber-400" /> User Travel Feedback ({data.reviews.length})
            </h3>
          </div>

          <div className="space-y-3">
            {data.reviews.length > 0 ? (
              data.reviews.map((rev) => (
                <div
                  key={rev.id}
                  className="p-3.5 rounded-2xl bg-slate-800/50 border border-slate-800 space-y-2"
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-200">{rev.place_title}</span>
                    <span className="text-amber-400 font-bold font-mono">
                      {"★".repeat(rev.rating)}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 italic line-clamp-2">
                    &ldquo;{rev.comment}&rdquo;
                  </p>
                  <span className="text-[10px] text-slate-500 font-mono block">
                    Posted on: {new Date(rev.created_at).toLocaleDateString()}
                  </span>
                </div>
              ))
            ) : (
              <div className="py-12 text-center text-xs text-slate-500">
                User has not submitted any place reviews yet.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
