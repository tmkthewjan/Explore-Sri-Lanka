import { notFound } from "next/navigation";
import Link from "next/link";
import {
  MapPin,
  Navigation,
  ArrowLeft,
  Compass,
  Globe,
  Share2,
  Calendar,
  Sparkles,
  Tag,
  Footprints,
  HeartHandshake,
} from "lucide-react";
import { getPlaceBySlug, getNearbyPlaces, getGoogleMapsNavigationUrl } from "@/lib/api";
import PlaceCard from "@/components/PlaceCard";
import FavoriteButton from "@/components/FavoriteButton";
import ReviewSection from "@/components/ReviewSection";
import MapboxMapClient from "@/components/MapboxMapClient";

interface PlaceDetailsProps {
  params: Promise<{ slug: string }>;
}

export const dynamic = "force-dynamic";

export default async function PlaceDetailsPage({ params }: PlaceDetailsProps) {
  const { slug } = await params;

  let place;
  try {
    place = await getPlaceBySlug(slug);
  } catch (err) {
    notFound();
  }

  if (!place) {
    notFound();
  }

  // Fetch neighboring attractions within 35 km of this place
  let nearbyAttractions: any[] = [];
  try {
    const nearby = await getNearbyPlaces(place.latitude, place.longitude, 35);
    nearbyAttractions = nearby.filter((p) => p.id !== place.id).slice(0, 4);
  } catch (err) {
    console.warn("Could not fetch nearby places for details page:", err);
  }

  const googleMapsUrl = getGoogleMapsNavigationUrl(place.latitude, place.longitude);

  return (
    <div className="pb-24">
      {/* Top Banner & Breadcrumb */}
      <div className="bg-slate-900 text-white py-4 px-4 sm:px-6">
        <div className="container mx-auto flex items-center justify-between">
          <Link
            href="/map"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-300 hover:text-emerald-400 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Map Explorer
          </Link>
          <span className="text-xs text-slate-400">
            {place.district}, {place.province} Province
          </span>
        </div>
      </div>

      {/* Hero Panoramic Image */}
      <div className="relative h-[420px] sm:h-[520px] w-full bg-slate-900">
        <img
          src={place.cover_image}
          alt={place.title}
          className="w-full h-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />

        <div className="container mx-auto px-4 sm:px-6 absolute bottom-8 left-0 right-0 z-10 text-white">
          <div className="max-w-4xl space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500 text-white shadow-md">
                {place.category}
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-white/20 backdrop-blur-md text-white">
                {place.activity}
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/90 text-white">
                {place.travel_style}
              </span>
            </div>

            <h1 className="text-3xl sm:text-5xl md:text-6xl font-black tracking-tight leading-tight">
              {place.title}
            </h1>

            <p className="flex items-center gap-2 text-sm sm:text-base text-slate-300 font-medium">
              <MapPin className="w-4 h-4 text-emerald-400 shrink-0" />
              {place.district} District, {place.province} Province, Sri Lanka
            </p>
          </div>
        </div>
      </div>

      {/* Main Content & Sidebar */}
      <div className="container mx-auto px-4 sm:px-6 pt-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Main Content Column */}
          <div className="lg:col-span-8 space-y-10">
            {/* About & Description */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm space-y-6">
              <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-emerald-600" />
                About this Destination
              </h2>
              <p className="text-base text-slate-600 leading-relaxed sm:text-lg">
                {place.description}
              </p>

              {/* Highlights grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-slate-100">
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-1">
                    Primary Activity
                  </span>
                  <p className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                    <Footprints className="w-4 h-4 text-emerald-600" />
                    {place.activity}
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-1">
                    Travel Style
                  </span>
                  <p className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                    <HeartHandshake className="w-4 h-4 text-amber-500" />
                    {place.travel_style}
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-1">
                    PostGIS Precision
                  </span>
                  <p className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                    <Globe className="w-4 h-4 text-sky-600" />
                    SRID 4326 Point
                  </p>
                </div>
              </div>
            </div>

            {/* Embedded Interactive Map focused on Place */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-emerald-600" />
                  Location on Map
                </h2>
                <span className="text-xs text-slate-400 font-mono">
                  {place.latitude.toFixed(4)}° N, {place.longitude.toFixed(4)}° E
                </span>
              </div>

              <div className="h-[420px] w-full rounded-2xl overflow-hidden">
                <MapboxMapClient places={[place]} selectedPlace={place} />
              </div>
            </div>
          </div>

          {/* Sidebar / Navigation Card */}
          <div className="lg:col-span-4 space-y-6">
            <div className="sticky top-20 bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-lg space-y-6">
              <div>
                <span className="text-xs uppercase font-bold tracking-widest text-emerald-600 block mb-1">
                  Ready to visit?
                </span>
                <h3 className="text-xl font-black text-slate-900">
                  Get Turn-by-Turn Directions
                </h3>
              </div>

              {/* Coordinates block */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
                <div className="flex justify-between text-xs text-slate-500">
                  <span>Latitude:</span>
                  <span className="font-mono font-bold text-slate-800">{place.latitude}</span>
                </div>
                <div className="flex justify-between text-xs text-slate-500">
                  <span>Longitude:</span>
                  <span className="font-mono font-bold text-slate-800">{place.longitude}</span>
                </div>
                <div className="flex justify-between text-xs text-slate-500">
                  <span>Spatial SRID:</span>
                  <span className="font-mono font-bold text-emerald-600">4326 (WGS 84)</span>
                </div>
              </div>

              {/* Big Google Maps Navigation Button */}
              <a
                href={googleMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-2 py-4 px-6 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-base shadow-xl shadow-emerald-600/25 transition-all hover:shadow-2xl hover:-translate-y-0.5 active:translate-y-0"
              >
                <Navigation className="w-5 h-5" />
                Navigate with Google Maps
              </a>

              <p className="text-xs text-center text-slate-400 leading-relaxed">
                Launches Google Maps with driving directions calculated directly to this destination’s GPS coordinates.
              </p>
            </div>
          </div>
        </div>

        {/* Nearby Attractions Carousel / Grid */}
        {nearbyAttractions.length > 0 && (
          <div className="mt-20 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs uppercase font-bold tracking-widest text-emerald-600 block mb-1">
                  Nearby Experiences
                </span>
                <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                  Other Places within 35 km
                </h2>
              </div>
              <Link
                href={`/map?district=${place.district}`}
                className="text-xs font-semibold text-emerald-600 hover:underline"
              >
                View all in {place.district} &rarr;
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {nearbyAttractions.map((attraction) => (
                <PlaceCard key={attraction.id} place={attraction} />
              ))}
            </div>
          </div>
        )}

        {/* Customer Feedback & Reviews Section */}
        <ReviewSection placeId={place.id} placeTitle={place.title} />

      </div>
    </div>
  );
}

