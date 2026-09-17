"use client";

import { useState } from "react";
import Link from "next/link";
import { forgotPasswordApi } from "@/lib/api";
import { Compass, Mail, KeyRound, AlertCircle, ArrowLeft, CheckCircle2 } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);
    setLoading(true);

    try {
      const res = await forgotPasswordApi(email);
      setSuccessMessage(
        res.message ||
          "If an account with this email exists, a password reset link has been dispatched."
      );
    } catch (err: any) {
      setError(err.message || "Failed to process request. Please check your email.");
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
            Forgot Password?
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            Enter your registered email and we will generate a password reset authorization for your account.
          </p>
        </div>

        {/* Success Alert */}
        {successMessage ? (
          <div className="space-y-4">
            <div className="rounded-2xl bg-emerald-50 border border-emerald-200 p-5 text-sm text-emerald-800 flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-emerald-950">Reset Instructions Sent!</p>
                <p className="mt-1 text-emerald-800">{successMessage}</p>
              </div>
            </div>
            <Link
              href="/reset-password"
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 shadow-md shadow-emerald-600/20 transition-all"
            >
              Enter Reset Token & New Password
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

            {/* Form */}
            <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                  Your Account Email
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 bg-white/50 text-slate-900 placeholder:text-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 shadow-md shadow-emerald-600/25 transition-all hover:shadow-lg disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <KeyRound className="w-4 h-4" />
                    Request Password Reset
                  </>
                )}
              </button>
            </form>
          </>
        )}

        {/* Footer link */}
        <p className="text-center text-xs text-slate-500">
          <Link
            href="/login"
            className="font-semibold text-emerald-600 hover:text-emerald-700 inline-flex items-center gap-1.5"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}
