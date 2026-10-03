"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Calendar,
  Clock,
  MapPin,
  Bell,
  BellOff,
  Navigation,
  Trash2,
  Edit3,
  Plus,
  Compass,
  AlertCircle,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  Luggage,
  X,
  Save,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { getUserTrips, deleteTrip, updateTrip, getGoogleMapsNavigationUrl } from "@/lib/api";
import { PlannedTrip } from "@/types/trip";
import PlanTripModal from "@/components/PlanTripModal";

export default function TripsPage() {
  const router = useRouter();
  const { user, token, isLoading: authLoading } = useAuth();

  const [trips, setTrips] = useState<PlannedTrip[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"all" | "upcoming" | "today" | "past">("all");

  // Plan New Trip Modal State
  const [createModalOpen, setCreateModalOpen] = useState(false);

  // Edit Trip Modal State
  const [editingTrip, setEditingTrip] = useState<PlannedTrip | null>(null);
  const [editTravelDate, setEditTravelDate] = useState("");
  const [editNotes, setEditNotes] = useState("");
  const [editReminder, setEditReminder] = useState(true);
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);

  // Action status message
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  const fetchTrips = async () => {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const data = await getUserTrips(token);
      setTrips(data);
    } catch (err: any) {
      setError(err.message || "Failed to load planned trips.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading) {
      if (token) {
        fetchTrips();
      } else {
        setLoading(false);
      }
    }
  }, [token, authLoading]);

  // Open Edit Modal
  const handleOpenEdit = (trip: PlannedTrip) => {
    setEditingTrip(trip);
    // Format date for datetime-local
    const d = new Date(trip.travel_date);
    d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
    setEditTravelDate(d.toISOString().slice(0, 16));
    setEditNotes(trip.notes || "");
    setEditReminder(trip.reminder_enabled);
    setEditError(null);
  };

  // Submit Edit Trip
  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !editingTrip) return;

    if (!editTravelDate) {
      setEditError("Please select a travel date.");
      return;
    }

    setEditLoading(true);
    setEditError(null);

    try {
      const updated = await updateTrip(token, editingTrip.id, {
        travel_date: new Date(editTravelDate).toISOString(),
        notes: editNotes.trim() || undefined,
        reminder_enabled: editReminder,
      });

      setTrips((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
      setActionSuccess("Trip details updated successfully.");
      setEditingTrip(null);
      setTimeout(() => setActionSuccess(null), 3000);
    } catch (err: any) {
      setEditError(err.message || "Failed to update trip.");
    } finally {
      setEditLoading(false);
    }
  };

  // Delete Trip
  const handleDeleteTrip = async (tripId: string, placeTitle: string) => {
    if (!token) return;
    const confirmDelete = window.confirm(`Are you sure you want to cancel your trip to ${placeTitle}?`);
    if (!confirmDelete) return;

    try {
      await deleteTrip(token, tripId);
      setTrips((prev) => prev.filter((t) => t.id !== tripId));
      setActionSuccess(`Trip to ${placeTitle} cancelled.`);
      setTimeout(() => setActionSuccess(null), 3000);
    } catch (err: any) {
      alert(err.message || "Failed to delete trip.");
    }
  };

  // Quick Toggle Reminder
  const handleToggleReminder = async (trip: PlannedTrip) => {
    if (!token) return;
    const nextVal = !trip.reminder_enabled;
    try {
      const updated = await updateTrip(token, trip.id, {
        reminder_enabled: nextVal,
      });
      setTrips((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
    } catch (err) {
      // Revert if error
    }
  };

  // Filter trips based on active tab
  const filteredTrips = trips.filter((t) => {
    if (activeTab === "all") return true;
    return t.status === activeTab;
  });

  const upcomingCount = trips.filter((t) => t.status === "upcoming").length;
  const todayCount = trips.filter((t) => t.status === "today").length;
  const pastCount = trips.filter((t) => t.status === "past").length;

  if (authLoading) {
    return (
      <div className="min-h-[75vh] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-medium text-slate-500">Loading your itineraries...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-[75vh] flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white p-8 rounded-3xl border border-slate-200/80 shadow-xl text-center space-y-4">
          <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto">
            <Luggage className="w-7 h-7" />
          </div>
          <h2 className="text-xl font-bold text-slate-900">Sign In to View Trips</h2>
          <p className="text-sm text-slate-500">
            Keep track of upcoming Sri Lankan excursions, travel dates, and automated email reminders in your personal travel planner.
          </p>
          <div className="pt-2 flex gap-3">
            <Link
              href="/login"
              className="flex-1 py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm rounded-xl shadow-md transition-all"
            >
              Sign In
            </Link>
            <Link
              href="/register"
              className="flex-1 py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-sm rounded-xl transition-all"
            >
              Create Account
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 py-10 max-w-6xl">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-emerald-800 via-teal-800 to-slate-900 rounded-3xl p-6 sm:p-10 text-white shadow-xl relative overflow-hidden mb-8">
        <div className="absolute right-0 top-0 w-96 h-96 bg-white/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-xl bg-white/10 backdrop-blur-md text-emerald-300">
                <Luggage className="w-5 h-5" />
              </span>
              <span className="text-xs uppercase tracking-widest font-bold text-emerald-300">
                Travel Planner & Reminders
              </span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-black tracking-tight">
              My Planned Sri Lankan Trips
            </h1>
            <p className="text-xs sm:text-sm text-emerald-100/80 max-w-xl">
              Organize your upcoming visits to iconic destinations, set departure alerts, and navigate straight to coordinates.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setCreateModalOpen(true)}
              className="flex items-center gap-2 py-3 px-5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm shadow-lg shadow-emerald-950/20 transition-all hover:scale-105 active:scale-95"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              Plan a New Trip
            </button>
            <Link
              href="/map"
              className="flex items-center gap-2 py-3 px-4 rounded-2xl bg-white/15 hover:bg-white/25 text-white font-semibold text-sm backdrop-blur-md border border-white/20 transition-all"
            >
              <Compass className="w-4 h-4 text-emerald-300" />
              Find Places
            </Link>
          </div>
        </div>
      </div>

      {/* Success Notification */}
      {actionSuccess && (
        <div className="mb-6 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2 shadow-sm animate-in fade-in duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{actionSuccess}</span>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8 border-b border-slate-200/80 pb-4">
        <div className="flex items-center gap-2 p-1 bg-slate-100/80 rounded-2xl">
          <button
            onClick={() => setActiveTab("all")}
            className={`py-2 px-4 rounded-xl text-xs font-bold transition-all ${
              activeTab === "all"
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            All Trips ({trips.length})
          </button>
          <button
            onClick={() => setActiveTab("today")}
            className={`py-2 px-4 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === "today"
                ? "bg-emerald-600 text-white shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Today ({todayCount})
          </button>
          <button
            onClick={() => setActiveTab("upcoming")}
            className={`py-2 px-4 rounded-xl text-xs font-bold transition-all ${
              activeTab === "upcoming"
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Upcoming ({upcomingCount})
          </button>
          <button
            onClick={() => setActiveTab("past")}
            className={`py-2 px-4 rounded-xl text-xs font-bold transition-all ${
              activeTab === "past"
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Past ({pastCount})
          </button>
        </div>

        <span className="text-xs text-slate-400 font-medium">
          Showing {filteredTrips.length} itinerary {filteredTrips.length === 1 ? "item" : "items"}
        </span>
      </div>

      {/* Trips Content */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center gap-3">
          <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs text-slate-400">Loading your itineraries...</p>
        </div>
      ) : error ? (
        <div className="p-8 rounded-3xl bg-red-50 border border-red-200 text-center space-y-3">
          <AlertCircle className="w-8 h-8 text-red-500 mx-auto" />
          <h3 className="text-base font-bold text-red-900">{error}</h3>
          <button
            onClick={fetchTrips}
            className="py-2 px-5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl shadow transition-all"
          >
            Try Again
          </button>
        </div>
      ) : filteredTrips.length === 0 ? (
        /* Empty State */
        <div className="bg-white rounded-3xl p-10 sm:p-16 border border-slate-200/80 text-center space-y-5 shadow-sm">
          <div className="w-16 h-16 rounded-3xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
            <Luggage className="w-8 h-8" />
          </div>

          <div className="space-y-2 max-w-md mx-auto">
            <h3 className="text-xl font-bold text-slate-900">
              {activeTab === "all"
                ? "No Planned Trips Yet"
                : `No ${activeTab} trips found`}
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
              Explore Sri Lanka’s UNESCO world heritage ruins, tropical beaches, tea hill stations, and plan your excursion now!
            </p>
          </div>

          <div className="flex flex-wrap gap-3 justify-center pt-2">
            <button
              onClick={() => setCreateModalOpen(true)}
              className="py-3 px-6 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-600/20 transition-all"
            >
              Plan Your First Trip
            </button>
            <Link
              href="/#destinations"
              className="py-3 px-6 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-all"
            >
              Browse Destinations
            </Link>
          </div>
        </div>
      ) : (
        /* Trips List Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredTrips.map((trip) => {
            const tripDate = new Date(trip.travel_date);
            const dateStr = tripDate.toLocaleDateString("en-US", {
              weekday: "short",
              month: "short",
              day: "numeric",
              year: "numeric",
            });
            const timeStr = tripDate.toLocaleTimeString("en-US", {
              hour: "2-digit",
              minute: "2-digit",
            });

            // Google Maps URL
            const gmapsUrl =
              trip.place_latitude && trip.place_longitude
                ? getGoogleMapsNavigationUrl(trip.place_latitude, trip.place_longitude)
                : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                    trip.place_title + ", Sri Lanka"
                  )}`;

            return (
              <div
                key={trip.id}
                className="bg-white rounded-3xl border border-slate-200/80 shadow-sm hover:shadow-md transition-all overflow-hidden flex flex-col justify-between"
              >
                <div>
                  {/* Top Image & Badge Header */}
                  <div className="relative h-48 w-full bg-slate-900 overflow-hidden">
                    <img
                      src={trip.place_cover_image || "/images/placeholder.jpg"}
                      alt={trip.place_title}
                      className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />

                    {/* Status Badge */}
                    <div className="absolute top-4 left-4">
                      {trip.status === "today" ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-emerald-500 text-white shadow-lg animate-pulse">
                          <Sparkles className="w-3.5 h-3.5" />
                          Today&apos;s Excursion!
                        </span>
                      ) : trip.status === "upcoming" ? (
                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-teal-600 text-white shadow-md">
                          <Calendar className="w-3 h-3" />
                          Upcoming Journey
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-slate-800/80 backdrop-blur-md text-slate-300">
                          Completed Journey
                        </span>
                      )}
                    </div>

                    {/* Category & District badge */}
                    <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between text-white">
                      <div>
                        <h3 className="text-xl font-black tracking-tight leading-snug">
                          {trip.place_title}
                        </h3>
                        <p className="text-xs text-slate-300 flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-emerald-400" />
                          {trip.place_district} District
                          {trip.place_category && ` • ${trip.place_category}`}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-5 space-y-4">
                    {/* Schedule block */}
                    <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
                          <Clock className="w-5 h-5 text-emerald-600" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-slate-900">{dateStr}</p>
                          <p className="text-[11px] text-slate-500">{timeStr} (Asia/Colombo)</p>
                        </div>
                      </div>

                      {/* Reminder status badge */}
                      <button
                        onClick={() => handleToggleReminder(trip)}
                        title={
                          trip.reminder_enabled
                            ? "Email reminder active (click to disable)"
                            : "Email reminder disabled (click to enable)"
                        }
                        className={`p-2 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-all ${
                          trip.reminder_enabled
                            ? "bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100"
                            : "bg-slate-100 border-slate-200 text-slate-400 hover:bg-slate-200"
                        }`}
                      >
                        {trip.reminder_enabled ? (
                          <>
                            <Bell className="w-3.5 h-3.5 text-emerald-600 fill-emerald-600/20" />
                            <span className="hidden sm:inline">24h Alert On</span>
                          </>
                        ) : (
                          <>
                            <BellOff className="w-3.5 h-3.5 text-slate-400" />
                            <span className="hidden sm:inline">Alert Off</span>
                          </>
                        )}
                      </button>
                    </div>

                    {/* Notes if any */}
                    {trip.notes && (
                      <div className="p-3 rounded-xl bg-amber-50/60 border border-amber-200/60 text-xs text-amber-900">
                        <span className="font-bold block text-[10px] uppercase tracking-wider text-amber-700 mb-0.5">
                          Trip Notes:
                        </span>
                        &ldquo;{trip.notes}&rdquo;
                      </div>
                    )}
                  </div>
                </div>

                {/* Footer Actions */}
                <div className="p-5 pt-0 border-t border-slate-100 mt-4 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    <a
                      href={gmapsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2.5 rounded-xl bg-slate-100 hover:bg-emerald-50 text-slate-700 hover:text-emerald-700 transition-colors flex items-center gap-1 text-xs font-semibold"
                      title="Navigate in Google Maps"
                    >
                      <Navigation className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="hidden sm:inline">Directions</span>
                    </a>

                    <Link
                      href={`/places/${trip.place_slug}`}
                      className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors flex items-center gap-1 text-xs font-semibold"
                    >
                      <span>Details</span>
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenEdit(trip)}
                      className="p-2.5 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                      title="Edit trip"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteTrip(trip.id, trip.place_title)}
                      className="p-2.5 rounded-xl text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                      title="Cancel trip"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Plan New Trip Modal */}
      <PlanTripModal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onTripCreated={(newTrip) => {
          setTrips((prev) => [newTrip, ...prev]);
          setActionSuccess(`Trip to ${newTrip.place_title} planned successfully!`);
          setTimeout(() => setActionSuccess(null), 3000);
        }}
      />

      {/* Edit Trip Modal */}
      {editingTrip && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="bg-slate-900 text-white p-6 relative">
              <button
                onClick={() => setEditingTrip(null)}
                className="absolute top-5 right-5 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
              <h3 className="text-xl font-black">Edit Trip to {editingTrip.place_title}</h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Update departure schedule or traveler notes.
              </p>
            </div>

            <form onSubmit={handleSaveEdit} className="p-6 space-y-4">
              {editError && (
                <div className="p-3 rounded-xl bg-red-50 text-red-700 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{editError}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Travel Date & Time
                </label>
                <input
                  type="datetime-local"
                  required
                  value={editTravelDate}
                  onChange={(e) => setEditTravelDate(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-medium focus:ring-2 focus:ring-emerald-500/30 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Trip Notes (Optional)
                </label>
                <textarea
                  rows={3}
                  maxLength={1000}
                  value={editNotes}
                  onChange={(e) => setEditNotes(e.target.value)}
                  placeholder="Itinerary highlights, transport booking..."
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-emerald-500/30 focus:outline-none resize-none"
                />
              </div>

              <div className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-200">
                <input
                  type="checkbox"
                  id="edit_reminder_enabled"
                  checked={editReminder}
                  onChange={(e) => setEditReminder(e.target.checked)}
                  className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-slate-300"
                />
                <label htmlFor="edit_reminder_enabled" className="text-xs text-slate-700 cursor-pointer font-medium">
                  Send email reminder 24 hours prior
                </label>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingTrip(null)}
                  className="flex-1 py-2.5 px-4 rounded-xl border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-50 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={editLoading}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md transition-all flex items-center justify-center gap-1.5"
                >
                  {editLoading ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <Save className="w-3.5 h-3.5" />
                      Save Changes
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
