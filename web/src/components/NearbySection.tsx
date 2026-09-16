"use client";

import { useState, useEffect } from "react";
import { Navigation, MapPin, Loader2, AlertCircle, RefreshCw, Compass } from "lucide-react";
import { Place } from "@/types/place";
import { getNearbyPlaces } from "@/lib/api";
import PlaceCard from "./PlaceCard";

const RADIUS_OPTIONS = [5, 10, 25, 50];

// Famous test coordinates across Sri Lanka
const DEMO_PRESETS = [
  { name: "Ella Town", lat: 6.8667, lng: 81.0466 },
  { name: "Galle Fort", lat: 6.0329, lng: 80.2168 },
  { name: "Colombo", lat: 6.9271, lng: 79.8612 },
  { name: "Kandy", lat: 7.2936, lng: 80.6413 },
  { name: "Sigiriya", lat: 7.9570, lng: 80.7603 },
];

export default function NearbySection() {
  const [userCoords, setUserCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [locationName, setLocationName] = useState<string>("Current GPS");
  const [radius, setRadius] = useState<number>(25);
  const [places, setPlaces] = useState<Place[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [gpsLoading, setGpsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Trigger GPS detection
  const detectLocation = () => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser.");
      return;
    }

    setGpsLoading(true);
    setError(null);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setUserCoords({ lat: latitude, lng: longitude });
        setLocationName("Your GPS Location");
        setGpsLoading(false);
      },
      (err) => {
        console.warn("GPS access denied or unavailable, using Ella as default demo:", err.message);
        setError("Location permission denied. You can select a quick Sri Lankan location below:");
        // Default to Ella for instant gratification
        setUserCoords({ lat: 6.8667, lng: 81.0466 });
        setLocationName("Ella (Preset Demo)");
        setGpsLoading(false);
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  // Fetch nearby places whenever userCoords or radius change
  useEffect(() => {
    if (!userCoords) {
      // Auto trigger GPS on initial mount
      detectLocation();
      return;
    }

    const fetchNearby = async () => {
      setLoading(true);
      setError(null);
      try {
        const results = await getNearbyPlaces(userCoords.lat, userCoords.lng, radius);
        setPlaces(results);
      } catch (err: any) {
        console.error("Error fetching nearby places:", err);
        setError("Unable to connect to Express backend or database. Ensure backend is running.");
      } finally {
        setLoading(false);
      }
    };

    fetchNearby();
  }, [userCoords, radius]);

  return (
    <div className="rounded-3xl bg-gradient-to-br from-emerald-900/5 via-teal-900/5 to-transparent border border-emerald-100 p-6 sm:p-8">
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-slate-200/80">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
            </span>
            <span className="text-xs uppercase font-bold tracking-wider text-emerald-700">
              Live PostGIS Geolocation
            </span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 flex items-center gap-2">
            📍 Places Near You
            {userCoords && (
              <span className="text-xs font-normal text-slate-500 bg-white border border-slate-200 px-2.5 py-1 rounded-full">
                {locationName} ({userCoords.lat.toFixed(4)}°, {userCoords.lng.toFixed(4)}°)
              </span>
            )}
          </h2>
        </div>

        {/* Radius selector & GPS refresh */}
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={detectLocation}
            disabled={gpsLoading}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-xl bg-white border border-slate-200 shadow-sm hover:bg-slate-50 text-slate-700 transition-all disabled:opacity-60"
            title="Re-detect GPS Location"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-emerald-600 ${gpsLoading ? "animate-spin" : ""}`} />
            {gpsLoading ? "Detecting GPS..." : "Re-detect GPS"}
          </button>

          {/* Radius options */}
          <div className="flex items-center bg-white border border-slate-200 rounded-xl p-1 shadow-sm">
            <span className="text-xs font-medium text-slate-400 px-2">Radius:</span>
            {RADIUS_OPTIONS.map((r) => (
              <button
                key={r}
                onClick={() => setRadius(r)}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                  radius === r
                    ? "bg-emerald-600 text-white shadow-sm"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                }`}
              >
                {r} km
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Demo Quick Presets */}
      <div className="flex flex-wrap items-center gap-2 pt-4 pb-2 text-xs">
        <span className="text-slate-400 font-medium">Quick Test Locations:</span>
        {DEMO_PRESETS.map((preset) => (
          <button
            key={preset.name}
            onClick={() => {
              setUserCoords({ lat: preset.lat, lng: preset.lng });
              setLocationName(preset.name);
            }}
            className="px-2.5 py-1 rounded-lg bg-white/80 hover:bg-white border border-slate-200/80 text-slate-700 font-medium hover:border-emerald-400 transition-all"
          >
            {preset.name}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="pt-6">
        {loading || gpsLoading ? (
          <div className="flex flex-col items-center justify-center py-16 text-slate-500 gap-3">
            <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
            <p className="text-sm font-medium">
              {gpsLoading ? "Acquiring GPS coordinates..." : `Calculating PostGIS distances within ${radius} km...`}
            </p>
          </div>
        ) : error && places.length === 0 ? (
          <div className="rounded-2xl bg-amber-50 border border-amber-200 p-6 text-amber-800 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="font-semibold">{error}</p>
              <p className="text-xs text-amber-700 mt-1">
                Make sure PostgreSQL is running and backend is accessible at <code>http://localhost:5000</code>.
              </p>
            </div>
          </div>
        ) : places.length === 0 ? (
          <div className="text-center py-12 bg-white/60 rounded-2xl border border-slate-200/60 p-6">
            <Compass className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <p className="text-base font-bold text-slate-700">No destinations found within {radius} km</p>
            <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
              Try increasing the search radius to 50 km or choose one of the preset locations above.
            </p>
            <button
              onClick={() => setRadius(50)}
              className="mt-4 px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-700 transition-all"
            >
              Expand to 50 km
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {places.map((place) => (
              <PlaceCard
                key={place.id}
                place={place}
                userLat={userCoords?.lat}
                userLng={userCoords?.lng}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
