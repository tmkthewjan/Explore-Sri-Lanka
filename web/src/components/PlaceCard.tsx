import Image from "next/image";
import Link from "next/link";
import { MapPin, Navigation, ArrowUpRight, Compass } from "lucide-react";
import { Place } from "@/types/place";
import { formatDistance } from "@/lib/utils";
import { getGoogleMapsNavigationUrl } from "@/lib/api";

interface PlaceCardProps {
  place: Place;
  userLat?: number | null;
  userLng?: number | null;
}

export default function PlaceCard({ place, userLat, userLng }: PlaceCardProps) {
  const navUrl = getGoogleMapsNavigationUrl(
    place.latitude,
    place.longitude,
    userLat,
    userLng
  );

  return (
    <div className="group relative flex flex-col rounded-2xl bg-white border border-slate-200/80 shadow-sm hover:shadow-xl hover:border-emerald-200 transition-all duration-300 overflow-hidden">
      {/* Cover Image Container */}
      <div className="relative h-56 w-full overflow-hidden bg-slate-100">
        <img
          src={place.cover_image}
          alt={place.title}
          className="h-full w-full object-cover object-center group-hover:scale-105 transition-transform duration-500 ease-out"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />

        {/* Top Badges */}
        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5 z-10">
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-white/95 text-slate-800 backdrop-blur-md shadow-sm">
            {place.category}
          </span>
          <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-600/90 text-white backdrop-blur-md">
            {place.activity}
          </span>
        </div>

        {/* Distance Badge (if distance calculated) */}
        {place.distance_km !== undefined && (
          <div className="absolute bottom-3 left-3 z-10 flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500 text-white shadow-md shadow-emerald-900/30">
            <Navigation className="w-3.5 h-3.5" />
            {formatDistance(place.distance_km)}
          </div>
        )}

        {/* District badge */}
        <div className="absolute bottom-3 right-3 z-10 text-xs font-medium text-white/90 flex items-center gap-1 drop-shadow">
          <MapPin className="w-3.5 h-3.5 text-amber-400" />
          {place.district}, {place.province}
        </div>
      </div>

      {/* Card Body */}
      <div className="flex flex-col flex-1 p-5">
        <Link href={`/places/${place.slug}`} className="group-hover:text-emerald-600 transition-colors">
          <h3 className="text-lg font-bold text-slate-900 line-clamp-1 mb-2">
            {place.title}
          </h3>
        </Link>

        <p className="text-sm text-slate-500 line-clamp-2 leading-relaxed mb-4 flex-1">
          {place.description}
        </p>

        {/* Travel Style Tag */}
        <div className="flex items-center gap-2 mb-4 text-xs text-slate-500">
          <span className="font-medium text-slate-400">Travel Style:</span>
          <span className="px-2 py-0.5 rounded bg-slate-100 font-medium text-slate-700">
            {place.travel_style}
          </span>
        </div>

        {/* Action Buttons */}
        <div className="pt-3 border-t border-slate-100 grid grid-cols-2 gap-2 mt-auto">
          <Link
            href={`/places/${place.slug}`}
            className="flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-semibold rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
          >
            View Details
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>

          <a
            href={navUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-semibold rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200/80 transition-colors"
          >
            <Navigation className="w-3.5 h-3.5 text-emerald-600" />
            Navigate
          </a>
        </div>
      </div>
    </div>
  );
}
