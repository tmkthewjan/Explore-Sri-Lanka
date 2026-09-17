"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { resetPasswordApi } from "@/lib/api";
import { Compass, Lock, Key, AlertCircle, ArrowRight, CheckCircle2 } from "lucide-react";

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const tokenParam = searchParams.get("token") || "";

  const [token, setToken] = useState(tokenParam);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!token.trim()) {
      setError("Please enter the reset token.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (password.length < 6) {
      setError("New password must be at least 6 characters long.");
      return;
    }

    setLoading(true);

    try {
      await resetPasswordApi(token, password);
      setSuccess(true);
    } catch (err: any) {
      setError(err.message || "Failed to reset password. Token may be invalid or expired.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white/80 backdrop-blur-xl p-8 sm:p-10 rounded-3xl border border-slate-200/80 shadow-xl shadow-slate-900/5">
        {/* Header */}
        <div className="text-center">
          <Link href="/" className="inline-flex items-center gap-2 group mb-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-md shadow-emerald-500/20 group-hover:scale-105 transition-transform">
              <Compass className="w-7 h-7 animate-[spin_12s_linear_infinite]" />
            </div>
          </Link>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900">
            Set New Password
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            Enter your reset token and your secure new password.
          </p>
        </div>

        {success ? (
          <div className="space-y-5 text-center">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">Password Reset Complete!</h2>
              <p className="mt-1 text-sm text-slate-600">
                Your password has been successfully updated. You can now sign in with your new password.
              </p>
            </div>
            <Link
              href="/login"
              className="w-full inline-flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 shadow-md shadow-emerald-600/25 transition-all"
            >
              Sign In Now <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          <>
            {error && (
              <div className="rounded-2xl bg-red-50 border border-red-200/80 p-4 text-sm text-red-700 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                  Reset Token
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Key className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    required
                    value={token}
                    onChange={(e) => setToken(e.target.value)}
                    placeholder="Paste reset token here"
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 bg-white/50 text-slate-900 placeholder:text-slate-400 font-mono text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                  New Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="At least 6 characters"
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 bg-white/50 text-slate-900 placeholder:text-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                  Confirm New Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter new password"
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 bg-white/50 text-slate-900 placeholder:text-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 shadow-md shadow-emerald-600/25 transition-all hover:shadow-lg disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  "Reset Password"
                )}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[80vh] flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <ResetPasswordForm />
    </Suspense>
  );
}
