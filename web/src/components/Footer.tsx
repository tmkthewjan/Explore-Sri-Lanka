import Link from "next/link";
import { Compass, Heart, MapPin, Navigation, Database } from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t border-slate-200/80 bg-white/70 backdrop-blur-md text-slate-600 mt-20">
      <div className="container mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white">
                <Compass className="w-5 h-5" />
              </div>
              <span className="text-lg font-black tracking-tight text-slate-900">
                Explore Sri Lanka 🇱🇰
              </span>
            </div>
            <p className="text-sm text-slate-500 max-w-sm leading-relaxed">
              Discover pristine beaches, misty hill country summits, UNESCO heritage sites, and wildlife national parks with real-time PostGIS geolocation.
            </p>
            <div className="flex items-center gap-4 text-xs font-semibold text-slate-500">
              <span className="flex items-center gap-1 text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">
                <Database className="w-3.5 h-3.5" /> Local PostgreSQL + PostGIS
              </span>
              <span className="flex items-center gap-1 text-sky-700 bg-sky-50 px-2.5 py-1 rounded-md border border-sky-200">
                <MapPin className="w-3.5 h-3.5" /> Mapbox GL
              </span>
            </div>
          </div>

          {/* Quick links */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-3">
              Explore
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/map" className="hover:text-emerald-600 transition-colors">
                  Interactive Map
                </Link>
              </li>
              <li>
                <Link href="/#destinations" className="hover:text-emerald-600 transition-colors">
                  Popular Destinations
                </Link>
              </li>
              <li>
                <Link href="/#categories" className="hover:text-emerald-600 transition-colors">
                  Browse by Category
                </Link>
              </li>
            </ul>
          </div>

          {/* Popular Categories */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-3">
              Top Experiences
            </h4>
            <ul className="space-y-2 text-sm text-slate-500">
              <li>🏖 Tropical Beaches (Mirissa, Bentota)</li>
              <li>🏛 Ancient Heritage (Sigiriya, Galle)</li>
              <li>🏔 Highland Trails (Ella, Knuckles)</li>
              <li>🐘 Wildlife Safaris (Yala, Udawalawe)</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-200/80 mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-3">
          <p>© {new Date().getFullYear()} Explore Sri Lanka Platform. All rights reserved.</p>
          <p className="flex items-center gap-1">
            Built with <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" /> Next.js 15, PostGIS & Mapbox
          </p>
        </div>
      </div>
    </footer>
  );
}
