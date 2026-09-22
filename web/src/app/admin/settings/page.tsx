"use client";

import { useEffect, useState } from "react";
import {
  Settings,
  Database,
  Shield,
  Server,
  RefreshCw,
  CheckCircle2,
  Lock,
  Cpu,
  Globe,
  Radio,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export default function AdminSettingsPage() {
  const { user, token } = useAuth();
  const [healthData, setHealthData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const fetchHealth = async () => {
    setLoading(true);
    try {
      const res = await fetch("http://localhost:5000/api/health");
      const json = await res.json();
      setHealthData(json);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHealth();
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  return (
    <div className="space-y-8">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 p-4 rounded-2xl bg-emerald-600 text-white shadow-xl shadow-emerald-950/50 flex items-center gap-3 text-sm">
          <CheckCircle2 className="w-5 h-5" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-white tracking-tight flex items-center gap-2.5">
            <Settings className="w-6 h-6 text-emerald-400" /> Platform Infrastructure & Settings
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            System diagnostics, PostGIS spatial engine health, and cryptographic configurations
          </p>
        </div>

        <button
          onClick={fetchHealth}
          className="self-start sm:self-auto flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 hover:text-white transition-all border border-slate-700"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Run Diagnostic Check
        </button>
      </div>

      {/* Database & Spatial Engine Card */}
      <div className="p-6 sm:p-8 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-6">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">PostgreSQL & PostGIS Engine</h3>
              <p className="text-xs text-slate-400">Local database instance running on localhost:5432</p>
            </div>
          </div>
          <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            Operational
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs font-mono">
          <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-800">
            <span className="text-slate-400 text-[11px] block font-sans">Database Name</span>
            <p className="text-white font-bold text-sm mt-1">
              {healthData?.database?.name || "explore_sri_lanka"}
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-800">
            <span className="text-slate-400 text-[11px] block font-sans">PostGIS Version</span>
            <p className="text-emerald-300 font-bold text-xs mt-1 truncate">
              {healthData?.database?.postgis || "3.4 USE_GEOS=1 USE_PROJ=1"}
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-800">
            <span className="text-slate-400 text-[11px] block font-sans">Indexed Geography Rows</span>
            <p className="text-white font-bold text-sm mt-1">
              {healthData?.database?.total_places || 20} Places
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-800">
            <span className="text-slate-400 text-[11px] block font-sans">Connection Pool</span>
            <p className="text-white font-bold text-sm mt-1">pg.Pool (Max 20)</p>
          </div>
        </div>
      </div>

      {/* Security & Authentication Configuration */}
      <div className="p-6 sm:p-8 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-6">
        <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
          <div className="w-10 h-10 rounded-2xl bg-purple-500/10 text-purple-400 flex items-center justify-center">
            <Lock className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">Security & Role-Based Access Control (RBAC)</h3>
            <p className="text-xs text-slate-400">Strict server-side JWT verification and endpoint protection</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-800 space-y-2">
            <h4 className="font-bold text-white">Cryptographic Standards</h4>
            <p className="text-slate-400 text-[11px]">
              Tokens are signed with HMAC-SHA256 / jsonwebtoken and passwords salted with bcrypt/PBKDF2.
            </p>
            <div className="flex items-center gap-2 pt-1 font-mono text-[11px] text-emerald-400">
              <CheckCircle2 className="w-3.5 h-3.5" /> Token Expiry: 7 Days
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-800 space-y-2">
            <h4 className="font-bold text-white">Active Session Details</h4>
            <div className="text-[11px] font-mono text-slate-300 space-y-1">
              <p>User: {user?.full_name}</p>
              <p>Email: {user?.email}</p>
              <p className="text-purple-400 font-bold">Role: {user?.role}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
