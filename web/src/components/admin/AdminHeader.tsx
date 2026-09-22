"use client";

import { usePathname } from "next/navigation";
import { Menu, Database, ShieldCheck, Clock } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useEffect, useState } from "react";

interface AdminHeaderProps {
  onOpenMobileMenu: () => void;
}

export default function AdminHeader({ onOpenMobileMenu }: AdminHeaderProps) {
  const pathname = usePathname();
  const { user } = useAuth();
  const [timeStr, setTimeStr] = useState("");

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeStr(
        now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })
      );
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  const getPageTitle = () => {
    if (pathname.includes("/admin/dashboard")) return "System Overview & KPIs";
    if (pathname.includes("/admin/users/")) return "User Profile & Activity";
    if (pathname.includes("/admin/users")) return "User Management";
    if (pathname.includes("/admin/places")) return "Places & Spatial Catalog";
    if (pathname.includes("/admin/reviews")) return "Customer Reviews & Moderation";
    if (pathname.includes("/admin/favorites")) return "Wishlist & Favorites Analytics";
    if (pathname.includes("/admin/analytics")) return "Platform Analytics & Insights";
    if (pathname.includes("/admin/settings")) return "Platform Diagnostics & Settings";
    return "Admin Portal";
  };

  return (
    <header className="h-20 bg-slate-900/80 backdrop-blur-xl border-b border-slate-800/80 sticky top-0 z-30 px-4 sm:px-8 flex items-center justify-between">
      {/* Left Title & Mobile Menu Button */}
      <div className="flex items-center gap-4">
        <button
          onClick={onOpenMobileMenu}
          className="lg:hidden p-2.5 rounded-xl bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition-colors"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div>
          <h1 className="text-lg sm:text-xl font-black text-white tracking-tight">
            {getPageTitle()}
          </h1>
          <p className="text-xs text-slate-400 hidden sm:block">
            Explore Sri Lanka Enterprise Management Suite
          </p>
        </div>
      </div>

      {/* Right Actions & Diagnostics Badges */}
      <div className="flex items-center gap-3">
        {/* Live Clock */}
        <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800/60 border border-slate-700/60 text-xs font-mono text-slate-300">
          <Clock className="w-3.5 h-3.5 text-emerald-400" />
          <span>{timeStr || "00:00:00"}</span>
        </div>

        {/* Database Status Pill */}
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs font-medium text-emerald-400">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <Database className="w-3.5 h-3.5" />
          <span>Local PostgreSQL (PostGIS)</span>
        </div>

        {/* Admin Badge */}
        <div className="flex items-center gap-2 pl-2 sm:pl-3 border-l border-slate-800">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white font-bold text-xs shadow-md shadow-emerald-500/20">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div className="hidden md:block text-left">
            <p className="text-xs font-bold text-white leading-tight">{user?.full_name || "Admin"}</p>
            <span className="text-[10px] text-emerald-400 font-semibold uppercase tracking-wider">Superadmin</span>
          </div>
        </div>
      </div>
    </header>
  );
}
