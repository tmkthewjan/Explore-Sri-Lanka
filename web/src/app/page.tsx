import Link from "next/link";
import { Compass, MapPin, Navigation, Sparkles, Waves, Mountain, Landmark, Trees, Eye, Footprints } from "lucide-react";
import { getPlaces, getMetadata } from "@/lib/api";
import PlaceCard from "@/components/PlaceCard";
import NearbySection from "@/components/NearbySection";

export const dynamic = "force-dynamic";

const CATEGORY_ICONS: Record<string, any> = {
  Beach: Waves,
  Mountain: Mountain,
  Waterfall: Waves,
  Heritage: Landmark,
  Wildlife: Trees,
  Viewpoint: Eye,
  Temple: Landmark,
  Historical: Landmark,
};

export default async function HomePage() {
  let places: any[] = [];
  let metadata: any = { categories: [], districts: [] };

  try {
    const [placesRes, metaRes] = await Promise.all([
      getPlaces({ limit: 8, sort: "created_desc" }),
      getMetadata(),
    ]);
    places = placesRes.places;
    metadata = metaRes;
  } catch (err) {
    console.error("Failed to load home page data from backend:", err);
  }

  return (
    <div className="flex flex-col gap-16 pb-20">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-emerald-950 via-slate-900 to-slate-950 text-white pt-24 pb-32 px-4 sm:px-6">
        {/* Decorative background glow */}
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-emerald-500/20 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute top-1/2 -right-40 w-[500px] h-[400px] bg-amber-500/10 blur-[100px] rounded-full pointer-events-none" />

        <div className="container mx-auto max-w-5xl relative z-10 text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs sm:text-sm font-semibold backdrop-blur-md">
            <Sparkles className="w-4 h-4 text-emerald-400" />
            <span>Discover The Wonder of Asia &bull; PostGIS Geolocation</span>
          </div>

          <h1 className="text-4xl sm:text-6xl md:text-7xl font-black tracking-tight leading-[1.1] max-w-4xl mx-auto">
            Explore Sri Lanka <span className="inline-block hover:rotate-12 transition-transform">🇱🇰</span>
          </h1>

          <p className="text-lg sm:text-xl text-slate-300 max-w-2xl mx-auto font-light leading-relaxed">
            Discover amazing places, hidden gems, misty peaks, pristine beaches, and unforgettable experiences with real-time GPS proximity.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link
              href="/map"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-bold text-base shadow-xl shadow-emerald-500/25 transition-all hover:shadow-2xl hover:-translate-y-0.5 active:translate-y-0"
            >
              <Navigation className="w-5 h-5" />
              Explore Nearby Places
            </Link>

            <Link
              href="/map"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/20 font-semibold text-base backdrop-blur-md transition-all hover:-translate-y-0.5"
            >
              <MapPin className="w-5 h-5 text-emerald-400" />
              View Interactive Map
            </Link>
          </div>

          {/* Quick Stats Banner */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-12 max-w-3xl mx-auto">
            <div className="p-4 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm">
              <div className="text-2xl sm:text-3xl font-black text-emerald-400">20+</div>
              <div className="text-xs text-slate-400 font-medium mt-1">Curated Destinations</div>
            </div>
            <div className="p-4 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm">
              <div className="text-2xl sm:text-3xl font-black text-amber-400">100%</div>
              <div className="text-xs text-slate-400 font-medium mt-1">Local PostGIS Spatial</div>
            </div>
            <div className="p-4 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm">
              <div className="text-2xl sm:text-3xl font-black text-sky-400">4326</div>
              <div className="text-xs text-slate-400 font-medium mt-1">WGS 84 Precision</div>
            </div>
            <div className="p-4 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm">
              <div className="text-2xl sm:text-3xl font-black text-rose-400">GPS</div>
              <div className="text-xs text-slate-400 font-medium mt-1">Real-time Proximity</div>
            </div>
          </div>
        </div>
      </section>

      {/* Real-time Nearby Places Client Section (GPS Enabled) */}
      <section className="container mx-auto px-4 sm:px-6">
        <NearbySection />
      </section>

      {/* Explore by Category Section */}
      <section id="categories" className="container mx-auto px-4 sm:px-6 scroll-mt-24">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
          <div>
            <span className="text-xs uppercase font-bold tracking-widest text-emerald-600 block mb-1">
              Curated Collections
            </span>
            <h2 className="text-3xl font-black tracking-tight text-slate-900">
              Explore by Category
            </h2>
          </div>
          <Link
            href="/map"
            className="text-sm font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-1 group"
          >
            Browse all filters
            <span className="group-hover:translate-x-1 transition-transform">&rarr;</span>
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
          {[
            { label: "Beaches", category: "Beach", emoji: "🏖️", icon: Waves, color: "from-sky-500 to-cyan-500" },
            { label: "Mountains", category: "Mountain", emoji: "🏔️", icon: Mountain, color: "from-emerald-500 to-teal-600" },
            { label: "Waterfalls", category: "Waterfall", emoji: "💧", icon: Waves, color: "from-blue-500 to-indigo-600" },
            { label: "Heritage", category: "Heritage", emoji: "🏛️", icon: Landmark, color: "from-amber-500 to-orange-600" },
            { label: "Wildlife", category: "Wildlife", emoji: "🐘", icon: Trees, color: "from-lime-600 to-emerald-700" },
            { label: "Viewpoints", category: "Viewpoint", emoji: "🌅", icon: Eye, color: "from-purple-500 to-pink-600" },
          ].map((cat) => {
            const Icon = cat.icon;
            return (
              <Link
                key={cat.category}
                href={`/map?category=${cat.category}`}
                className="group relative flex flex-col items-center justify-center p-6 rounded-2xl bg-white border border-slate-200/80 shadow-sm hover:shadow-xl hover:border-emerald-300 transition-all text-center hover:-translate-y-1"
              >
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-tr ${cat.color} flex items-center justify-center text-white text-2xl shadow-md mb-3 group-hover:scale-110 transition-transform`}>
                  <span>{cat.emoji}</span>
                </div>
                <h3 className="text-sm font-bold text-slate-800 group-hover:text-emerald-600 transition-colors">
                  {cat.label}
                </h3>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Popular Destinations Section */}
      <section id="destinations" className="container mx-auto px-4 sm:px-6 scroll-mt-24">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
          <div>
            <span className="text-xs uppercase font-bold tracking-widest text-emerald-600 block mb-1">
              Top Rated Locations
            </span>
            <h2 className="text-3xl font-black tracking-tight text-slate-900">
              Popular Destinations
            </h2>
          </div>
          <Link
            href="/map"
            className="text-sm font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-1 group"
          >
            Explore all on Map
            <span className="group-hover:translate-x-1 transition-transform">&rarr;</span>
          </Link>
        </div>

        {places.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {places.map((place) => (
              <PlaceCard key={place.id} place={place} />
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-slate-300 p-12 text-center">
            <Compass className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-slate-700">Connecting to Database...</h3>
            <p className="text-sm text-slate-500 mt-1">
              Ensure the Express backend is running on port 5000 and PostgreSQL has executed the seed script.
            </p>
          </div>
        )}
      </section>
    </div>
  );
}
