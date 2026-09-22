"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import dynamic from "next/dynamic";
import {
  Search,
  MapPin,
  Compass,
  RefreshCw,
  Loader2,
  X,
} from "lucide-react";
import { Place, MetadataResponse } from "@/types/place";
import { getPlaces, getNearbyPlaces, getMetadata } from "@/lib/api";
import PlaceCard from "@/components/PlaceCard";

// Dynamic SSR-disabled import of Mapbox to prevent window is not defined in Next.js SSR
const MapboxMap = dynamic(() => import("@/components/MapboxMap"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full min-h-[500px] flex flex-col items-center justify-center bg-slate-100 rounded-3xl text-slate-500 gap-2">
      <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
      <span className="text-xs font-semibold">Loading Mapbox spatial canvas...</span>
    </div>
  ),
});

const RADIUS_OPTIONS = [5, 10, 25, 50];

const PRESETS = [
  { name: "Ella", lat: 6.8667, lng: 81.0466 },
  { name: "Galle", lat: 6.0329, lng: 80.2168 },
  { name: "Colombo", lat: 6.9271, lng: 79.8612 },
  { name: "Sigiriya", lat: 7.9570, lng: 80.7603 },
];

function MapContent() {
  const searchParams = useSearchParams();
  const initialCategory = searchParams.get("category") || "";

  const [places, setPlaces] = useState<Place[]>([]);
  const [metadata, setMetadata] = useState<MetadataResponse>({
    categories: [],
    districts: [],
    travel_styles: [],
  });
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null);

  // Filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [selectedDistrict, setSelectedDistrict] = useState("");
  const [selectedRadius, setSelectedRadius] = useState<number | "all">(25);

  // Geolocation
  const [userCoords, setUserCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [gpsLoading, setGpsLoading] = useState(false);
  const [loading, setLoading] = useState(true);

  // Fetch initial metadata
  useEffect(() => {
    getMetadata().then(setMetadata).catch(console.error);
  }, []);

  // Detect GPS
  const detectLocation = () => {
    if (!navigator.geolocation) return;
    setGpsLoading(true);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setGpsLoading(false);
      },
      () => {
        // GPS unavailable (permission denied or insecure origin) — fall back to Ella
        setUserCoords({ lat: 6.8667, lng: 81.0466 });
        setGpsLoading(false);
      },
      { timeout: 8000, enableHighAccuracy: true }
    );
  };

  useEffect(() => {
    detectLocation();
  }, []);

  // Fetch places based on filters and location
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        if (selectedRadius !== "all" && userCoords) {
          // PostGIS nearby radius query
          const results = await getNearbyPlaces(
            userCoords.lat,
            userCoords.lng,
            selectedRadius,
            selectedCategory || undefined
          );
          setPlaces(results);
        } else {
          // Standard filtered query
          const { places: allPlaces } = await getPlaces({
            category: selectedCategory || undefined,
            district: selectedDistrict || undefined,
            limit: 50,
          });

          // Calculate distance locally if coordinates available
          if (userCoords) {
            allPlaces.forEach((p) => {
              const R = 6371; // km
              const dLat = ((p.latitude - userCoords.lat) * Math.PI) / 180;
              const dLon = ((p.longitude - userCoords.lng) * Math.PI) / 180;
              const a =
                Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                Math.cos((userCoords.lat * Math.PI) / 180) *
                  Math.cos((p.latitude * Math.PI) / 180) *
                  Math.sin(dLon / 2) *
                  Math.sin(dLon / 2);
              const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
              p.distance_km = (R * c).toFixed(2);
            });
            allPlaces.sort((a, b) => Number(a.distance_km) - Number(b.distance_km));
          }

          setPlaces(allPlaces);
        }
      } catch (err) {
        console.error("Error loading places:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [userCoords, selectedRadius, selectedCategory, selectedDistrict]);

  // Client-side search filtering
  const filteredPlaces = places.filter((place) => {
    if (!searchTerm.trim()) return true;
    const query = searchTerm.toLowerCase();
    return (
      place.title.toLowerCase().includes(query) ||
      place.description.toLowerCase().includes(query) ||
      place.district.toLowerCase().includes(query) ||
      place.category.toLowerCase().includes(query) ||
      place.activity.toLowerCase().includes(query)
    );
  });

  return (
    <div className="container mx-auto px-4 sm:px-6 py-8">
      {/* Top Filter & Search Bar */}
      <div className="mb-6 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              <MapPin className="w-7 h-7 text-emerald-600" />
              Interactive Map Explorer
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Explore destinations visually with PostGIS spatial proximity and live Mapbox markers.
            </p>
          </div>

          {/* Preset Buttons & GPS */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="text-slate-400 font-medium">Quick Presets:</span>
            {PRESETS.map((p) => (
              <button
                key={p.name}
                onClick={() => setUserCoords({ lat: p.lat, lng: p.lng })}
                className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-slate-700 font-medium hover:border-emerald-500 hover:text-emerald-700 transition-all shadow-sm"
              >
                {p.name}
              </button>
            ))}
            <button
              onClick={detectLocation}
              disabled={gpsLoading}
              className="flex items-center gap-1 px-3 py-1 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 font-semibold hover:bg-emerald-100 transition-all shadow-sm"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${gpsLoading ? "animate-spin" : ""}`} />
              {gpsLoading ? "Locating..." : "My GPS"}
            </button>
          </div>
        </div>

        {/* Search & Filter Controls */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-sm grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Keyword Search */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search Ella, Galle, Beach..."
              className="w-full pl-9 pr-8 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Category Dropdown */}
          <div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full py-2 px-3 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 bg-white"
            >
              <option value="">All Categories</option>
              {metadata.categories.map((c) => (
                <option key={c.category} value={c.category}>
                  {c.category} ({c.count})
                </option>
              ))}
            </select>
          </div>

          {/* District Dropdown */}
          <div>
            <select
              value={selectedDistrict}
              onChange={(e) => setSelectedDistrict(e.target.value)}
              disabled={selectedRadius !== "all"}
              className="w-full py-2 px-3 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 bg-white disabled:opacity-50"
            >
              <option value="">All Districts</option>
              {metadata.districts.map((d) => (
                <option key={d.district} value={d.district}>
                  {d.district} ({d.count})
                </option>
              ))}
            </select>
          </div>

          {/* Radius Selector */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl">
            <span className="text-xs font-semibold text-slate-400 px-2">Radius:</span>
            {RADIUS_OPTIONS.map((r) => (
              <button
                key={r}
                onClick={() => setSelectedRadius(r)}
                className={`flex-1 py-1 rounded-lg text-xs font-bold transition-all ${
                  selectedRadius === r
                    ? "bg-emerald-600 text-white shadow-sm"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                {r}k
              </button>
            ))}
            <button
              onClick={() => setSelectedRadius("all")}
              className={`flex-1 py-1 rounded-lg text-xs font-bold transition-all ${
                selectedRadius === "all"
                  ? "bg-emerald-600 text-white shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              All
            </button>
          </div>
        </div>
      </div>

      {/* Main Grid: Left Places List, Right Map */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Place Cards List */}
        <div className="lg:col-span-5 flex flex-col gap-4 max-h-[820px] overflow-y-auto pr-1">
          <div className="flex items-center justify-between text-xs font-bold text-slate-500 px-1">
            <span>SHOWING {filteredPlaces.length} DESTINATIONS</span>
            {userCoords && (
              <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                GPS Active
              </span>
            )}
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 text-slate-400 gap-2">
              <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
              <p className="text-xs font-medium">Querying PostGIS coordinates...</p>
            </div>
          ) : filteredPlaces.length === 0 ? (
            <div className="p-12 text-center bg-white rounded-2xl border border-dashed border-slate-200">
              <Compass className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <p className="text-sm font-bold text-slate-700">No destinations found</p>
              <p className="text-xs text-slate-400 mt-1">
                Try widening your search radius or clearing category filters.
              </p>
            </div>
          ) : (
            filteredPlaces.map((place) => (
              <div
                key={place.id}
                onClick={() => setSelectedPlace(place)}
                className={`cursor-pointer transition-all ${
                  selectedPlace?.id === place.id ? "ring-2 ring-emerald-500 rounded-2xl scale-[1.01]" : ""
                }`}
              >
                <PlaceCard
                  place={place}
                  userLat={userCoords?.lat}
                  userLng={userCoords?.lng}
                />
              </div>
            ))
          )}
        </div>

        {/* Right Column: Sticky Interactive Map */}
        <div className="lg:col-span-7 h-[600px] lg:h-[820px] sticky top-20">
          <MapboxMap
            places={filteredPlaces}
            userCoords={userCoords}
            selectedPlace={selectedPlace}
            onSelectPlace={(place) => setSelectedPlace(place)}
            radiusKm={selectedRadius === "all" ? undefined : selectedRadius}
          />
        </div>
      </div>
    </div>
  );
}

export default function MapPage() {
  return (
    <Suspense
      fallback={
        <div className="container mx-auto px-4 py-20 flex flex-col items-center justify-center gap-3 text-slate-500">
          <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
          <p className="text-sm font-semibold">Loading Explore Sri Lanka Map...</p>
        </div>
      }
    >
      <MapContent />
    </Suspense>
  );
}
