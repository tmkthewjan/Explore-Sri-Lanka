"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { getUserFavoritesApi, removeFavoriteApi } from "@/lib/api";
import { FavoriteItem } from "@/types/auth";
import {
  Heart,
  MapPin,
  Compass,
  ArrowRight,
  Trash2,
  Sparkles,
  Star,
  ExternalLink,
} from "lucide-react";

export default function FavoritesPage() {
  const { user, token, isLoading: authLoading } = useAuth();
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function fetchFavorites() {
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const data = await getUserFavoritesApi(token);
        if (isMounted) {
          setFavorites(data);
        }
      } catch (err: any) {
        if (isMounted) {
          setError(err.message || "Failed to load your wishlist.");
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    if (!authLoading) {
      fetchFavorites();
    }

    return () => {
      isMounted = false;
    };
  }, [token, authLoading]);

  const handleRemove = async (placeId: string) => {
    if (!token) return;
    try {
      // Optimistic removal
      setFavorites((prev) => prev.filter((item) => item.place_id !== placeId));
      await removeFavoriteApi(token, placeId);
    } catch {
      // Refresh if error
      const fresh = await getUserFavoritesApi(token);
      setFavorites(fresh);
    }
  };

  if (authLoading || (loading && token)) {
    return (
      <div className="min-h-[75vh] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-rose-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-medium text-slate-500">Loading your saved destinations...</p>
        </div>
      </div>
    );
  }

  // Guest State
  if (!user) {
    return (
      <div className="min-h-[75vh] flex items-center justify-center px-4 py-12">
        <div className="max-w-md w-full bg-white p-8 sm:p-10 rounded-3xl border border-slate-200/80 shadow-xl text-center space-y-5">
          <div className="w-16 h-16 bg-rose-50 text-rose-500 rounded-2xl flex items-center justify-center mx-auto shadow-inner">
            <Heart className="w-8 h-8 fill-rose-500/20" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Your Travel Wishlist</h2>
            <p className="text-sm text-slate-500 mt-2">
              Sign in to keep track of places you want to visit across Sri Lanka and access them on any device.
            </p>
          </div>
          <div className="pt-2 flex flex-col sm:flex-row gap-3">
            <Link
              href="/login"
              className="flex-1 py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm rounded-xl shadow-md transition-all text-center"
            >
              Sign In
            </Link>
            <Link
              href="/register"
              className="flex-1 py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-sm rounded-xl transition-all text-center"
            >
              Create Free Account
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 py-10 max-w-6xl">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-8 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-rose-600 uppercase tracking-widest mb-1">
            <Heart className="w-4 h-4 fill-rose-500" />
            Saved Bucket List
          </div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900">
            My Travel Wishlist
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            {favorites.length} {favorites.length === 1 ? "destination" : "destinations"} saved for your upcoming adventure.
          </p>
        </div>

        <Link
          href="/map"
          className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-md shadow-emerald-600/20 transition-all self-start sm:self-auto"
        >
          <Compass className="w-4 h-4" />
          Explore More Places
        </Link>
      </div>

      {error && (
        <div className="my-6 p-4 rounded-2xl bg-red-50 border border-red-200 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Empty State */}
      {favorites.length === 0 && !error ? (
        <div className="py-20 text-center space-y-4">
          <div className="w-20 h-20 bg-rose-50 rounded-full flex items-center justify-center text-rose-400 mx-auto">
            <Heart className="w-10 h-10 stroke-[1.5]" />
          </div>
          <h2 className="text-xl font-bold text-slate-800">Your wishlist is currently empty</h2>
          <p className="text-sm text-slate-500 max-w-md mx-auto">
            Browse our curated collection of ancient citadels, national parks, and tropical beaches. Click the heart icon on any destination to save it here!
          </p>
          <div className="pt-3">
            <Link
              href="/"
              className="inline-flex items-center gap-2 py-3 px-6 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm shadow-md transition-all"
            >
              Start Discovering <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      ) : (
        /* Grid of Saved Places */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pt-8">
          {favorites.map((item) => (
            <div
              key={item.id || item.place_id}
              className="group relative flex flex-col rounded-3xl bg-white border border-slate-200/80 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden"
            >
              {/* Image Banner */}
              <div className="relative h-48 w-full bg-slate-100 overflow-hidden">
                <img
                  src={item.cover_image}
                  alt={item.name}
                  className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                {/* Category Badge */}
                <div className="absolute top-3 left-3">
                  <span className="px-3 py-1 rounded-full text-xs font-semibold bg-white/95 text-slate-800 shadow-sm backdrop-blur-md">
                    {item.category}
                  </span>
                </div>

                {/* Remove from wishlist button */}
                <button
                  onClick={() => handleRemove(item.place_id)}
                  title="Remove from favorites"
                  className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/90 hover:bg-red-50 text-slate-500 hover:text-red-600 flex items-center justify-center shadow-md transition-all"
                >
                  <Trash2 className="w-4 h-4" />
                </button>

                {/* Location */}
                <div className="absolute bottom-3 left-3 text-xs font-medium text-white/90 flex items-center gap-1 drop-shadow">
                  <MapPin className="w-3.5 h-3.5 text-amber-400" />
                  {item.district || item.city}, {item.province}
                </div>
              </div>

              {/* Card Body */}
              <div className="p-5 flex flex-col flex-1">
                <Link
                  href={`/places/${item.slug}`}
                  className="group-hover:text-emerald-600 transition-colors"
                >
                  <h3 className="text-lg font-bold text-slate-900 line-clamp-1 mb-1.5">
                    {item.name}
                  </h3>
                </Link>

                <div className="flex items-center gap-1.5 text-xs text-amber-500 mb-4">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  <span className="font-bold text-slate-800">{item.rating || 5.0}</span>
                  <span className="text-slate-400">({item.review_count || 0} reviews)</span>
                </div>

                {/* Card Action */}
                <div className="mt-auto pt-3 border-t border-slate-100 flex items-center justify-between">
                  <Link
                    href={`/places/${item.slug}`}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-600 hover:text-emerald-700 transition-colors"
                  >
                    View Destination Details <ExternalLink className="w-3 h-3" />
                  </Link>

                  <button
                    onClick={() => handleRemove(item.place_id)}
                    className="text-xs text-slate-400 hover:text-red-500 transition-colors"
                  >
                    Remove
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
