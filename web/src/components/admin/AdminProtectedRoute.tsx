"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { ShieldAlert, Loader2, ArrowLeft } from "lucide-react";
import Link from "next/link";

interface AdminProtectedRouteProps {
  children: React.ReactNode;
}

export default function AdminProtectedRoute({ children }: AdminProtectedRouteProps) {
  const { user, token, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [authorized, setAuthorized] = useState<boolean | null>(null);

  useEffect(() => {
    if (isLoading) return;

    if (!token || !user) {
      setAuthorized(false);
      router.push(`/login?redirect=${encodeURIComponent(pathname)}`);
      return;
    }

    if (user.role !== "admin") {
      setAuthorized(false);
      return;
    }

    setAuthorized(true);
  }, [user, token, isLoading, pathname, router]);

  if (isLoading || authorized === null) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-slate-300">
        <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-4 animate-pulse">
          <Loader2 className="w-8 h-8 animate-spin" />
        </div>
        <h2 className="text-lg font-bold text-white tracking-tight">Verifying Administrator Access</h2>
        <p className="text-xs text-slate-500 mt-1">Checking cryptographic session and role authorization...</p>
      </div>
    );
  }

  if (authorized === false) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-slate-900/90 border border-red-500/30 rounded-3xl p-8 text-center backdrop-blur-xl shadow-2xl shadow-red-950/50">
          <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 flex items-center justify-center mx-auto mb-5">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">403 – Access Forbidden</h1>
          <p className="text-sm text-slate-400 mt-2">
            You are signed in as <span className="text-slate-200 font-semibold">{user?.email || "standard user"}</span>, which does not have administrative privileges.
          </p>
          <div className="mt-6 flex flex-col gap-2.5">
            <Link
              href="/"
              className="inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-500 transition-all shadow-lg shadow-emerald-900/40"
            >
              <ArrowLeft className="w-4 h-4" /> Return to Homepage
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center justify-center py-2.5 px-4 rounded-xl text-xs font-semibold text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 transition-all"
            >
              Sign in with an Admin Account
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
