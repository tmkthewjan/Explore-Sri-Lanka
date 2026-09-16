"use client";

import Link from "next/link";
import { useState } from "react";
import { Compass, MapPin, Navigation, Menu, X, Sparkles } from "lucide-react";

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full glass-nav transition-all">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-md shadow-emerald-500/20 group-hover:scale-105 transition-transform">
            <Compass className="w-6 h-6 animate-[spin_10s_linear_infinite]" />
          </div>
          <div>
            <span className="text-xl font-black tracking-tight text-slate-900 flex items-center gap-1.5">
              Explore Sri Lanka <span className="text-sm">🇱🇰</span>
            </span>
            <span className="block text-[10px] uppercase font-bold tracking-widest text-emerald-600">
              PostGIS Geolocation Guide
            </span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-slate-600">
          <Link
            href="/"
            className="hover:text-emerald-600 transition-colors py-1"
          >
            Home
          </Link>
          <Link
            href="/#destinations"
            className="hover:text-emerald-600 transition-colors py-1"
          >
            Popular Places
          </Link>
          <Link
            href="/#categories"
            className="hover:text-emerald-600 transition-colors py-1"
          >
            Categories
          </Link>
          <Link
            href="/map"
            className="flex items-center gap-1.5 text-emerald-600 font-semibold bg-emerald-50 px-3.5 py-1.5 rounded-full border border-emerald-200/80 hover:bg-emerald-100 transition-all shadow-sm"
          >
            <MapPin className="w-4 h-4 text-emerald-600" />
            Interactive Map
          </Link>
        </nav>

        {/* Action Button */}
        <div className="hidden md:flex items-center gap-3">
          <Link
            href="/map"
            className="flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-sm font-semibold px-4 py-2 rounded-xl shadow-md shadow-emerald-600/25 transition-all hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0"
          >
            <Navigation className="w-4 h-4" />
            Find Places Near Me
          </Link>
        </div>

        {/* Mobile menu trigger */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2 text-slate-700 hover:text-emerald-600 transition-colors"
          aria-label="Toggle Menu"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-slate-200 bg-white/95 backdrop-blur-md px-4 pt-2 pb-6 space-y-3">
          <Link
            href="/"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 text-base font-medium text-slate-700 hover:text-emerald-600 hover:bg-slate-50 rounded-lg"
          >
            Home
          </Link>
          <Link
            href="/#destinations"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 text-base font-medium text-slate-700 hover:text-emerald-600 hover:bg-slate-50 rounded-lg"
          >
            Popular Places
          </Link>
          <Link
            href="/#categories"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 text-base font-medium text-slate-700 hover:text-emerald-600 hover:bg-slate-50 rounded-lg"
          >
            Categories
          </Link>
          <Link
            href="/map"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-2 px-3 py-2.5 text-base font-semibold text-white bg-emerald-600 rounded-xl"
          >
            <MapPin className="w-5 h-5" />
            Interactive Map & Nearby
          </Link>
        </div>
      )}
    </header>
  );
}
