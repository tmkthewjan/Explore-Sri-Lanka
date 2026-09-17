"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { changePasswordApi } from "@/lib/api";
import {
  User,
  Mail,
  Calendar,
  Lock,
  Heart,
  Save,
  CheckCircle2,
  AlertCircle,
  LogOut,
  Sparkles,
  ShieldCheck,
  Compass,
} from "lucide-react";

export default function ProfilePage() {
  const router = useRouter();
  const { user, token, isLoading, updateUserProfile, logout } = useAuth();

  // Profile Edit State
  const [fullName, setFullName] = useState("");
  const [bio, setBio] = useState("");
  const [profileImage, setProfileImage] = useState("");
  const [profileMsg, setProfileMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [profileLoading, setProfileLoading] = useState(false);

  // Password Change State
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [pwdMsg, setPwdMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [pwdLoading, setPwdLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setFullName(user.full_name || "");
      setBio(user.bio || "");
      setProfileImage(user.profile_image || "");
    }
  }, [user]);

  if (isLoading) {
    return (
      <div className="min-h-[75vh] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-medium text-slate-500">Loading your profile...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-[75vh] flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white p-8 rounded-3xl border border-slate-200/80 shadow-xl text-center space-y-4">
          <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto">
            <User className="w-7 h-7" />
          </div>
          <h2 className="text-xl font-bold text-slate-900">Sign In Required</h2>
          <p className="text-sm text-slate-500">
            Please log in to your Explore Sri Lanka account to manage your profile and view saved destinations.
          </p>
          <div className="pt-2 flex gap-3">
            <Link
              href="/login"
              className="flex-1 py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm rounded-xl shadow-md transition-all"
            >
              Sign In
            </Link>
            <Link
              href="/register"
              className="flex-1 py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-sm rounded-xl transition-all"
            >
              Create Account
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileMsg(null);
    setProfileLoading(true);

    try {
      await updateUserProfile({
        full_name: fullName,
        bio: bio,
        profile_image: profileImage || null,
      });
      setProfileMsg({ type: "success", text: "Profile details updated successfully!" });
    } catch (err: any) {
      setProfileMsg({ type: "error", text: err.message || "Failed to update profile." });
    } finally {
      setProfileLoading(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwdMsg(null);

    if (newPassword !== confirmPassword) {
      setPwdMsg({ type: "error", text: "New passwords do not match." });
      return;
    }

    if (newPassword.length < 6) {
      setPwdMsg({ type: "error", text: "New password must be at least 6 characters long." });
      return;
    }

    if (!token) return;
    setPwdLoading(true);

    try {
      const res = await changePasswordApi(token, {
        current_password: currentPassword,
        new_password: newPassword,
      });
      setPwdMsg({ type: "success", text: res.message || "Password changed successfully." });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      setPwdMsg({ type: "error", text: err.message || "Failed to update password." });
    } finally {
      setPwdLoading(false);
    }
  };

  const formattedDate = user.created_at
    ? new Date(user.created_at).toLocaleDateString("en-US", {
        month: "long",
        year: "numeric",
      })
    : "Recently";

  return (
    <div className="container mx-auto px-4 sm:px-6 py-10 max-w-5xl">
      {/* Profile Header Card */}
      <div className="bg-gradient-to-r from-emerald-700 via-teal-700 to-slate-900 rounded-3xl p-6 sm:p-10 text-white shadow-xl relative overflow-hidden mb-8">
        <div className="absolute right-0 top-0 w-96 h-96 bg-white/5 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 relative z-10">
          {/* Avatar */}
          <div className="w-24 h-24 sm:w-28 sm:sm-h-28 rounded-2xl bg-gradient-to-tr from-emerald-400 to-teal-300 text-slate-950 font-black text-3xl sm:text-4xl flex items-center justify-center uppercase shadow-2xl shrink-0 overflow-hidden border-4 border-white/20">
            {user.profile_image ? (
              <img
                src={user.profile_image}
                alt={user.full_name}
                className="w-full h-full object-cover"
              />
            ) : (
              <span>{user.full_name ? user.full_name.charAt(0) : "U"}</span>
            )}
          </div>

          {/* User Details */}
          <div className="flex-1 text-center sm:text-left space-y-2">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight">{user.full_name}</h1>
              <span className="inline-flex items-center gap-1 text-[11px] font-bold bg-emerald-500/30 border border-emerald-400/40 text-emerald-200 px-2.5 py-0.5 rounded-full w-fit mx-auto sm:mx-0">
                <ShieldCheck className="w-3 h-3" /> Verified Explorer
              </span>
            </div>
            <p className="text-sm text-emerald-100/80 flex items-center justify-center sm:justify-start gap-2">
              <Mail className="w-3.5 h-3.5 text-emerald-300" />
              {user.email}
            </p>
            <p className="text-xs text-emerald-200/60 flex items-center justify-center sm:justify-start gap-2">
              <Calendar className="w-3.5 h-3.5" />
              Member since {formattedDate}
            </p>
            {user.bio && (
              <p className="text-xs text-white/80 max-w-xl italic pt-1">
                &ldquo;{user.bio}&rdquo;
              </p>
            )}
          </div>

          {/* Actions */}
          <div className="flex sm:flex-col gap-2 shrink-0">
            <Link
              href="/favorites"
              className="flex items-center gap-2 bg-white/15 hover:bg-white/25 text-white text-xs font-semibold px-4 py-2.5 rounded-xl backdrop-blur-sm border border-white/20 transition-all shadow-sm"
            >
              <Heart className="w-4 h-4 text-rose-400 fill-rose-400/30" />
              My Wishlist
            </Link>
            <button
              onClick={logout}
              className="flex items-center gap-2 bg-red-500/20 hover:bg-red-500/30 text-red-200 text-xs font-semibold px-4 py-2.5 rounded-xl border border-red-400/30 transition-all"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Card 1: Edit Profile Details */}
        <div className="bg-white/90 backdrop-blur-sm p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-2.5 mb-6">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">Personal Information</h2>
              <p className="text-xs text-slate-500">Update your public traveler persona</p>
            </div>
          </div>

          {profileMsg && (
            <div
              className={`p-4 rounded-2xl mb-6 text-xs flex items-center gap-2.5 border ${
                profileMsg.type === "success"
                  ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                  : "bg-red-50 border-red-200 text-red-700"
              }`}
            >
              {profileMsg.type === "success" ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
              )}
              <span>{profileMsg.text}</span>
            </div>
          )}

          <form onSubmit={handleUpdateProfile} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                Full Name
              </label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                Email Address (Read-only)
              </label>
              <input
                type="email"
                disabled
                value={user.email}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-100 text-slate-500 text-sm cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                Profile Avatar URL (Optional)
              </label>
              <input
                type="url"
                value={profileImage}
                onChange={(e) => setProfileImage(e.target.value)}
                placeholder="https://images.unsplash.com/photo-..."
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all placeholder:text-slate-400"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                Traveler Bio
              </label>
              <textarea
                rows={3}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Share your passion for Sri Lankan wildlife, ancient ruins, and surfing..."
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all placeholder:text-slate-400 resize-none"
              />
            </div>

            <button
              type="submit"
              disabled={profileLoading}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 shadow-md shadow-emerald-600/20 transition-all disabled:opacity-60"
            >
              {profileLoading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Save Changes
                </>
              )}
            </button>
          </form>
        </div>

        {/* Card 2: Security & Change Password */}
        <div className="bg-white/90 backdrop-blur-sm p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-2.5 mb-6">
            <div className="w-9 h-9 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">Security & Password</h2>
              <p className="text-xs text-slate-500">Update your account credentials safely</p>
            </div>
          </div>

          {pwdMsg && (
            <div
              className={`p-4 rounded-2xl mb-6 text-xs flex items-center gap-2.5 border ${
                pwdMsg.type === "success"
                  ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                  : "bg-red-50 border-red-200 text-red-700"
              }`}
            >
              {pwdMsg.type === "success" ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
              )}
              <span>{pwdMsg.text}</span>
            </div>
          )}

          <form onSubmit={handleChangePassword} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                Current Password
              </label>
              <input
                type="password"
                required
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 transition-all placeholder:text-slate-400"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                New Password
              </label>
              <input
                type="password"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="At least 6 characters"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 transition-all placeholder:text-slate-400"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                Confirm New Password
              </label>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repeat new password"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 transition-all placeholder:text-slate-400"
              />
            </div>

            <button
              type="submit"
              disabled={pwdLoading}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-semibold text-white bg-slate-900 hover:bg-slate-800 shadow-md transition-all disabled:opacity-60"
            >
              {pwdLoading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <Lock className="w-4 h-4" />
                  Update Password
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
