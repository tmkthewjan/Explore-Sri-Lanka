"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Compass, Mail, Lock, LogIn, AlertCircle, ArrowRight } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await login(email, password);
      router.push("/profile");
    } catch (err: any) {
      setError(err.message || "Failed to sign in. Please check your credentials.");
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
            Welcome back
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            Sign in to access your Sri Lanka travel wishlist, saved reviews, and customized journeys.
          </p>
        </div>

        {/* Error message */}
        {error && (
          <div className="rounded-2xl bg-red-50 border border-red-200/80 p-4 text-sm text-red-700 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Login Form */}
        <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
              Email Address
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

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                Password
              </label>
              <Link
                href="/forgot-password"
                className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 transition-colors"
              >
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Lock className="w-4 h-4" />
              </div>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
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
                <LogIn className="w-4 h-4" />
                Sign In
              </>
            )}
          </button>
        </form>

        {/* Demo Credentials Box */}
        <div className="rounded-2xl bg-emerald-50/60 border border-emerald-200/60 p-3.5 text-xs text-emerald-800">
          <p className="font-semibold text-emerald-900 mb-1">💡 Quick Demo Access:</p>
          <p>Email: <code className="font-mono bg-emerald-100/80 px-1 py-0.5 rounded text-emerald-950">demo@exploresrilanka.com</code></p>
          <p className="mt-0.5">Password: <code className="font-mono bg-emerald-100/80 px-1 py-0.5 rounded text-emerald-950">Password123!</code></p>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-slate-500">
          Don&apos;t have an account?{" "}
          <Link
            href="/register"
            className="font-semibold text-emerald-600 hover:text-emerald-700 inline-flex items-center gap-1"
          >
            Create account <ArrowRight className="w-3 h-3" />
          </Link>
        </p>
      </div>
    </div>
  );
}
