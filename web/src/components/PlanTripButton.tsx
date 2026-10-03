"use client";

import { useState } from "react";
import { Calendar, Sparkles } from "lucide-react";
import PlanTripModal from "./PlanTripModal";

interface PlanTripButtonProps {
  placeId: string;
  placeTitle: string;
  placeCoverImage?: string;
  placeDistrict?: string;
  className?: string;
  variant?: "primary" | "secondary" | "icon";
}

export default function PlanTripButton({
  placeId,
  placeTitle,
  placeCoverImage,
  placeDistrict,
  className = "",
  variant = "primary",
}: PlanTripButtonProps) {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <>
      {variant === "primary" ? (
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setModalOpen(true);
          }}
          className={`flex items-center justify-center gap-2 py-3 px-5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-sm shadow-md shadow-emerald-600/20 transition-all hover:-translate-y-0.5 active:translate-y-0 ${className}`}
        >
          <Calendar className="w-4 h-4" />
          Plan a Trip
        </button>
      ) : variant === "secondary" ? (
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setModalOpen(true);
          }}
          className={`flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border border-emerald-200 bg-emerald-50/70 hover:bg-emerald-100/70 text-emerald-800 font-semibold text-xs transition-all ${className}`}
        >
          <Calendar className="w-3.5 h-3.5 text-emerald-600" />
          Plan Trip
        </button>
      ) : (
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setModalOpen(true);
          }}
          title="Plan a trip here"
          className={`p-2 rounded-xl border border-slate-200 bg-white/90 hover:bg-emerald-50 hover:border-emerald-200 text-slate-700 hover:text-emerald-700 transition-all shadow-sm ${className}`}
        >
          <Calendar className="w-4 h-4" />
        </button>
      )}

      <PlanTripModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        initialPlace={{
          id: placeId,
          title: placeTitle,
          cover_image: placeCoverImage,
          district: placeDistrict,
        }}
      />
    </>
  );
}
