"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Heart, LogIn, X } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { checkFavoriteApi, addFavoriteApi, removeFavoriteApi } from "@/lib/api";

interface FavoriteButtonProps {
  placeId: string;
  placeTitle?: string;
  variant?: "card" | "detail";
  onToggle?: (isFavorited: boolean) => void;
}

export default function FavoriteButton({
  placeId,
  placeTitle = "this destination",
  variant = "card",
  onToggle,
}: FavoriteButtonProps) {
  const { user, token } = useAuth();
  const [isFavorited, setIsFavorited] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function loadStatus() {
      if (!placeId) return;
      try {
        const favorited = await checkFavoriteApi(placeId, token);
        if (isMounted) {
          setIsFavorited(favorited);
        }
      } catch {
        // Guest mode fallback
      }
    }

    loadStatus();

    return () => {
      isMounted = false;
    };
  }, [placeId, token]);

  const handleToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user || !token) {
      setShowLoginModal(true);
      return;
    }

    if (loading) return;

    const previousState = isFavorited;
    const nextState = !isFavorited;

    // Optimistic UI update
    setIsFavorited(nextState);
    setLoading(true);

    try {
      if (nextState) {
        await addFavoriteApi(token, placeId);
      } else {
        await removeFavoriteApi(token, placeId);
      }
      onToggle?.(nextState);
    } catch (err) {
      // Revert if API failed
      setIsFavorited(previousState);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={handleToggle}
        aria-label={isFavorited ? "Remove from wishlist" : "Save to wishlist"}
        title={isFavorited ? "Remove from favorites" : "Save to favorites"}
        className={`group/fav transition-all duration-200 flex items-center justify-center ${
          variant === "card"
            ? "w-9 h-9 rounded-full bg-white/90 backdrop-blur-md shadow-md hover:bg-white hover:scale-110 active:scale-95"
            : "px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-rose-50 hover:border-rose-200 text-slate-700 shadow-sm gap-2 text-xs font-semibold"
        }`}
      >
        <Heart
          className={`transition-all duration-300 ${
            variant === "card" ? "w-4 h-4" : "w-4 h-4"
          } ${
            isFavorited
              ? "text-rose-500 fill-rose-500 scale-110"
              : "text-slate-600 hover:text-rose-500 fill-transparent"
          }`}
        />
        {variant === "detail" && (
          <span className={isFavorited ? "text-rose-600" : "text-slate-700"}>
            {isFavorited ? "Saved to Wishlist" : "Save to Wishlist"}
          </span>
        )}
      </button>

      {/* Login Prompt Modal */}
      {showLoginModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={(e) => {
            e.stopPropagation();
            setShowLoginModal(false);
          }}
        >
          <div
            className="bg-white rounded-3xl p-6 sm:p-7 max-w-sm w-full border border-slate-200 shadow-2xl relative space-y-4 text-center"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowLoginModal(false)}
              className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-100 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-500 flex items-center justify-center mx-auto shadow-inner">
              <Heart className="w-6 h-6 fill-rose-500/30" />
            </div>

            <div>
              <h3 className="text-lg font-bold text-slate-900">Save to Wishlist</h3>
              <p className="text-xs text-slate-500 mt-1">
                Please sign in to save <span className="font-semibold text-slate-800">{placeTitle}</span> to your personal travel wishlist.
              </p>
            </div>

            <div className="flex gap-2.5 pt-1">
              <Link
                href="/login"
                className="flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-md transition-all"
              >
                <LogIn className="w-3.5 h-3.5" />
                Sign In
              </Link>
              <Link
                href="/register"
                className="flex-1 flex items-center justify-center py-2.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs transition-all"
              >
                Sign Up
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
