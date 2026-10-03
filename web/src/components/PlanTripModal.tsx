"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Calendar,
  Clock,
  MapPin,
  Bell,
  X,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Compass,
  FileText,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { createTrip, getPlaces } from "@/lib/api";
import { Place } from "@/types/place";
import { PlannedTrip } from "@/types/trip";

interface PlanTripModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTripCreated?: (trip: PlannedTrip) => void;
  initialPlace?: {
    id: string;
    title: string;
    cover_image?: string;
    district?: string;
  };
}

export default function PlanTripModal({
  isOpen,
  onClose,
  onTripCreated,
  initialPlace,
}: PlanTripModalProps) {
  const { user, token } = useAuth();
  
  const [selectedPlaceId, setSelectedPlaceId] = useState(initialPlace?.id || "");
  const [travelDate, setTravelDate] = useState("");
  const [notes, setNotes] = useState("");
  const [reminderEnabled, setReminderEnabled] = useState(true);

  const [availablePlaces, setAvailablePlaces] = useState<Place[]>([]);
  const [loadingPlaces, setLoadingPlaces] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Sync initial place if provided
  useEffect(() => {
    if (initialPlace?.id) {
      setSelectedPlaceId(initialPlace.id);
    }
  }, [initialPlace]);

  // If no initial place, fetch places list for selection
  useEffect(() => {
    if (isOpen && !initialPlace) {
      let isMounted = true;
      setLoadingPlaces(true);
      getPlaces({ limit: 100 })
        .then((res) => {
          if (isMounted) {
            setAvailablePlaces(res.places);
            if (res.places.length > 0 && !selectedPlaceId) {
              setSelectedPlaceId(res.places[0].id);
            }
          }
        })
        .catch(() => {})
        .finally(() => {
          if (isMounted) setLoadingPlaces(false);
        });

      return () => {
        isMounted = false;
      };
    }
  }, [isOpen, initialPlace, selectedPlaceId]);

  // Calculate minimum datetime (now + 1 hour)
  const getMinDateTime = () => {
    const d = new Date();
    d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
    return d.toISOString().slice(0, 16);
  };

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!user || !token) {
      setErrorMsg("Please sign in to plan and save your trip.");
      return;
    }

    if (!selectedPlaceId) {
      setErrorMsg("Please select a destination.");
      return;
    }

    if (!travelDate) {
      setErrorMsg("Please select your travel date and time.");
      return;
    }

    const parsedDate = new Date(travelDate);
    if (parsedDate.getTime() <= Date.now()) {
      setErrorMsg("Travel date must be in the future.");
      return;
    }

    setSubmitting(true);

    try {
      const newTrip = await createTrip(token, {
        place_id: selectedPlaceId,
        travel_date: new Date(travelDate).toISOString(),
        notes: notes.trim() || undefined,
        reminder_enabled: reminderEnabled,
      });

      setSuccessMsg("Your trip has been planned successfully!");
      if (onTripCreated) onTripCreated(newTrip);

      setTimeout(() => {
        setSuccessMsg(null);
        onClose();
        // Reset form
        setTravelDate("");
        setNotes("");
      }, 1200);
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to schedule trip. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200/80 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-700 via-teal-700 to-slate-900 text-white p-6 sm:p-7 relative">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-2 mb-2">
            <span className="p-1.5 rounded-xl bg-white/10 backdrop-blur-md text-emerald-300">
              <Calendar className="w-5 h-5" />
            </span>
            <span className="text-xs uppercase tracking-widest font-bold text-emerald-300">
              Trip Itinerary Planner
            </span>
          </div>

          <h2 className="text-2xl font-black tracking-tight">
            {initialPlace ? `Plan Trip to ${initialPlace.title}` : "Plan Your Next Sri Lankan Journey"}
          </h2>
          <p className="text-xs text-emerald-100/80 mt-1">
            Set your departure schedule and receive automated 24h email travel alerts.
          </p>
        </div>

        {/* Content */}
        <div className="p-6 sm:p-7 max-h-[75vh] overflow-y-auto">
          {!user ? (
            <div className="text-center py-6 space-y-4">
              <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto">
                <Compass className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Sign In to Plan Trips</h3>
              <p className="text-sm text-slate-500 max-w-sm mx-auto">
                You need an Explore Sri Lanka traveler account to save planned journeys and get departure reminders.
              </p>
              <div className="flex gap-3 pt-2 justify-center">
                <Link
                  href="/login"
                  className="py-2.5 px-6 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold shadow-md transition-all"
                >
                  Sign In
                </Link>
                <Link
                  href="/register"
                  className="py-2.5 px-6 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-semibold transition-all"
                >
                  Create Account
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              {errorMsg && (
                <div className="p-3.5 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {successMsg && (
                <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>{successMsg}</span>
                </div>
              )}

              {/* Destination Selection */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Destination
                </label>
                {initialPlace ? (
                  <div className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50 border border-slate-200">
                    {initialPlace.cover_image && (
                      <img
                        src={initialPlace.cover_image}
                        alt={initialPlace.title}
                        className="w-12 h-12 rounded-xl object-cover"
                      />
                    )}
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">{initialPlace.title}</h4>
                      {initialPlace.district && (
                        <p className="text-xs text-slate-500 flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-emerald-600" />
                          {initialPlace.district} District
                        </p>
                      )}
                    </div>
                  </div>
                ) : (
                  <select
                    value={selectedPlaceId}
                    onChange={(e) => setSelectedPlaceId(e.target.value)}
                    disabled={loadingPlaces}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all font-medium"
                  >
                    {loadingPlaces ? (
                      <option>Loading destinations...</option>
                    ) : (
                      availablePlaces.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.title} ({p.district} - {p.category})
                        </option>
                      ))
                    )}
                  </select>
                )}
              </div>

              {/* Travel Date & Time */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-emerald-600" />
                  Travel Date & Time
                </label>
                <input
                  type="datetime-local"
                  required
                  min={getMinDateTime()}
                  value={travelDate}
                  onChange={(e) => setTravelDate(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all font-medium"
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  Scheduled in Sri Lanka Standard Time (Asia/Colombo).
                </p>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5 flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-emerald-600" />
                  Trip Notes / Itinerary Highlights (Optional)
                </label>
                <textarea
                  rows={3}
                  maxLength={1000}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Early morning hike at sunrise, rent a tuk-tuk, remember water bottle & camera..."
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all placeholder:text-slate-400 resize-none"
                />
              </div>

              {/* 24-Hour Email Reminder Toggle */}
              <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200/80 flex items-start gap-3">
                <div className="pt-0.5">
                  <input
                    type="checkbox"
                    id="reminder_enabled"
                    checked={reminderEnabled}
                    onChange={(e) => setReminderEnabled(e.target.checked)}
                    className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-slate-300 cursor-pointer"
                  />
                </div>
                <label htmlFor="reminder_enabled" className="text-xs text-slate-700 cursor-pointer">
                  <span className="font-bold text-emerald-900 block flex items-center gap-1">
                    <Bell className="w-3.5 h-3.5 text-emerald-600" />
                    Send me an Email Reminder (24 hours prior)
                  </span>
                  We will automatically dispatch your trip summary and destination details to{" "}
                  <strong className="text-emerald-800">{user.email}</strong>.
                </label>
              </div>

              {/* Buttons */}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-3 px-4 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-sm font-semibold transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-sm font-bold shadow-lg shadow-emerald-600/25 transition-all disabled:opacity-60 flex items-center justify-center gap-2"
                >
                  {submitting ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      Confirm & Plan Trip
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
