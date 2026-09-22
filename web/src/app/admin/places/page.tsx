"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  MapPin,
  Search,
  Filter,
  Plus,
  Edit2,
  Trash2,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  X,
  AlertCircle,
  CheckCircle2,
  RefreshCw,
  Compass,
  Sparkles,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import {
  getAdminPlaces,
  createAdminPlace,
  updateAdminPlace,
  deleteAdminPlace,
} from "@/lib/api";
import { Place } from "@/types/place";

interface AdminPlaceItem extends Place {
  favorites_count: number;
  reviews_count: number;
  average_rating: number;
}

const CATEGORIES = [
  "All",
  "Heritage",
  "Historical",
  "Beaches",
  "Nature & Wildlife",
  "Waterfalls",
  "Adventure",
  "Scenic & Mountain",
  "Culture & Temples",
];

const PROVINCES = [
  "All",
  "Central",
  "Southern",
  "Western",
  "Uva",
  "Eastern",
  "North Western",
  "North Central",
  "Northern",
  "Sabaragamuwa",
];

const DEFAULT_FORM_STATE = {
  title: "",
  slug: "",
  description: "",
  cover_image: "",
  latitude: 7.8731,
  longitude: 80.7718,
  district: "Matale",
  province: "Central",
  category: "Heritage",
  activity: "Sightseeing",
  travel_style: "Culture",
};

export default function AdminPlacesPage() {
  const { token } = useAuth();
  const searchParams = useSearchParams();

  const [places, setPlaces] = useState<AdminPlaceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters & Pagination
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [province, setProvince] = useState("All");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPlace, setEditingPlace] = useState<AdminPlaceItem | null>(null);
  const [formData, setFormData] = useState(DEFAULT_FORM_STATE);
  const [formSaving, setFormSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Delete State
  const [deletePlaceTarget, setDeletePlaceTarget] = useState<AdminPlaceItem | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Check URL query action=add
  useEffect(() => {
    if (searchParams.get("action") === "add") {
      openAddModal();
    }
  }, [searchParams]);

  const fetchPlaces = async () => {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const res = await getAdminPlaces(token, {
        search,
        category: category === "All" ? undefined : category,
        province: province === "All" ? undefined : province,
        page,
        limit: 10,
      });
      setPlaces(res.places as AdminPlaceItem[]);
      setTotalPages(res.pagination.totalPages);
      setTotalCount(res.pagination.total);
    } catch (err: any) {
      setError(err.message || "Failed to load places");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlaces();
  }, [search, category, province, page, token]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const openAddModal = () => {
    setEditingPlace(null);
    setFormData(DEFAULT_FORM_STATE);
    setFormError(null);
    setIsModalOpen(true);
  };

  const openEditModal = (p: AdminPlaceItem) => {
    setEditingPlace(p);
    setFormData({
      title: p.title,
      slug: p.slug,
      description: p.description,
      cover_image: p.cover_image,
      latitude: p.latitude,
      longitude: p.longitude,
      district: p.district,
      province: p.province,
      category: p.category,
      activity: p.activity,
      travel_style: p.travel_style,
    });
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleTitleChange = (val: string) => {
    const generatedSlug = val.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
    setFormData((prev) => ({
      ...prev,
      title: val,
      slug: editingPlace ? prev.slug : generatedSlug,
    }));
  };

  const handleSavePlace = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    setFormSaving(true);
    setFormError(null);

    try {
      if (editingPlace) {
        await updateAdminPlace(token, editingPlace.id, formData);
        showToast(`Destination "${formData.title}" updated successfully.`);
      } else {
        await createAdminPlace(token, formData);
        showToast(`Destination "${formData.title}" created successfully.`);
      }
      setIsModalOpen(false);
      fetchPlaces();
    } catch (err: any) {
      setFormError(err.message || "Failed to save destination.");
    } finally {
      setFormSaving(false);
    }
  };

  const handleDeletePlace = async () => {
    if (!token || !deletePlaceTarget) return;
    try {
      await deleteAdminPlace(token, deletePlaceTarget.id);
      showToast(`Destination "${deletePlaceTarget.title}" deleted.`);
      setDeletePlaceTarget(null);
      fetchPlaces();
    } catch (err: any) {
      setError(err.message || "Failed to delete place");
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 p-4 rounded-2xl bg-emerald-600 text-white shadow-xl shadow-emerald-950/50 flex items-center gap-3 text-sm">
          <CheckCircle2 className="w-5 h-5" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-white tracking-tight flex items-center gap-2.5">
            <MapPin className="w-6 h-6 text-emerald-400" /> PostGIS Spatial Destination Catalog
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Managing <span className="text-white font-bold">{totalCount}</span> tourism spots indexed with PostGIS coordinates
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchPlaces}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 hover:text-white transition-all border border-slate-700"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Refresh
          </button>
          <button
            onClick={openAddModal}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-xs font-bold text-white transition-all shadow-md shadow-emerald-900/30"
          >
            <Plus className="w-4 h-4" /> Add Destination
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Search */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by title, description or slug..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-800/80 border border-slate-700 text-slate-100 placeholder:text-slate-500 text-xs focus:outline-none focus:border-emerald-500 transition-colors"
          />
        </div>

        {/* Category Filter */}
        <div className="flex items-center gap-2 bg-slate-800/80 border border-slate-700 rounded-xl px-3 py-1.5">
          <Filter className="w-4 h-4 text-slate-400 shrink-0" />
          <select
            value={category}
            onChange={(e) => {
              setCategory(e.target.value);
              setPage(1);
            }}
            className="w-full bg-transparent text-xs text-slate-200 focus:outline-none"
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c} className="bg-slate-800">
                {c === "All" ? "All Categories" : c}
              </option>
            ))}
          </select>
        </div>

        {/* Province Filter */}
        <div className="flex items-center gap-2 bg-slate-800/80 border border-slate-700 rounded-xl px-3 py-1.5">
          <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
          <select
            value={province}
            onChange={(e) => {
              setProvince(e.target.value);
              setPage(1);
            }}
            className="w-full bg-transparent text-xs text-slate-200 focus:outline-none"
          >
            {PROVINCES.map((p) => (
              <option key={p} value={p} className="bg-slate-800">
                {p === "All" ? "All Provinces" : `${p} Province`}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Places Table */}
      <div className="rounded-3xl bg-slate-900 border border-slate-800 overflow-hidden shadow-xl shadow-slate-950/40">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-800/80 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800 text-[11px]">
              <tr>
                <th className="py-4 px-6">Destination</th>
                <th className="py-4 px-6">Category</th>
                <th className="py-4 px-6">District / Province</th>
                <th className="py-4 px-6">Coordinates (PostGIS)</th>
                <th className="py-4 px-6">Community Stats</th>
                <th className="py-4 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-500">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto text-emerald-400 mb-2" />
                    Loading destinations...
                  </td>
                </tr>
              ) : places.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-500">
                    No destinations found matching your filters.
                  </td>
                </tr>
              ) : (
                places.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-800/40 transition-colors">
                    {/* Destination */}
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <img
                          src={p.cover_image}
                          alt={p.title}
                          className="w-12 h-12 rounded-xl object-cover border border-slate-700 shrink-0"
                        />
                        <div className="min-w-0">
                          <p className="font-bold text-slate-100 truncate">{p.title}</p>
                          <span className="text-[10px] text-slate-500 font-mono block truncate">
                            /{p.slug}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Category */}
                    <td className="py-4 px-6">
                      <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                        {p.category}
                      </span>
                    </td>

                    {/* District & Province */}
                    <td className="py-4 px-6 font-mono text-slate-300">
                      <p className="font-semibold text-slate-200">{p.district}</p>
                      <span className="text-[10px] text-slate-500">{p.province} Province</span>
                    </td>

                    {/* Coordinates */}
                    <td className="py-4 px-6 font-mono text-[11px] text-slate-400">
                      <span>Lat: {Number(p.latitude).toFixed(4)}</span>
                      <br />
                      <span>Lng: {Number(p.longitude).toFixed(4)}</span>
                    </td>

                    {/* Stats */}
                    <td className="py-4 px-6">
                      <div className="space-y-0.5 text-[11px] font-mono">
                        <span className="text-rose-400 font-bold">{p.favorites_count || 0} saves</span>
                        <span className="text-slate-500"> • </span>
                        <span className="text-amber-400 font-bold">{p.average_rating || "5.0"} ★</span>
                        <p className="text-[10px] text-slate-500">({p.reviews_count || 0} reviews)</p>
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Link
                          href={`/places/${p.slug}`}
                          target="_blank"
                          title="Open Live Destination Page"
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </Link>

                        <button
                          onClick={() => openEditModal(p)}
                          title="Edit Destination"
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-emerald-500/20 text-slate-400 hover:text-emerald-400 transition-colors"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => setDeletePlaceTarget(p)}
                          title="Delete Destination"
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-red-500/20 text-slate-400 hover:text-red-400 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="p-4 bg-slate-900 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <span>
            Showing page <strong className="text-white">{page}</strong> of <strong className="text-white">{totalPages}</strong>
          </span>

          <div className="flex items-center gap-2">
            <button
              disabled={page <= 1 || loading}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed text-white transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              disabled={page >= totalPages || loading}
              onClick={() => setPage((p) => p + 1)}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed text-white transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Add / Edit Destination Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="max-w-2xl w-full bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 my-8">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                  <Compass className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">
                    {editingPlace ? "Edit Tourist Destination" : "Add New Tourist Destination"}
                  </h3>
                  <p className="text-xs text-slate-400">PostGIS Geometry Point will be generated automatically</p>
                </div>
              </div>

              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-xs text-red-400 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleSavePlace} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold uppercase text-slate-400 mb-1">
                    Destination Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => handleTitleChange(e.target.value)}
                    placeholder="e.g. Ella Rock Cliff"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase text-slate-400 mb-1">
                    URL Slug *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    placeholder="e.g. ella-rock-cliff"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 font-mono text-emerald-400 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase text-slate-400 mb-1">
                  Description *
                </label>
                <textarea
                  rows={3}
                  required
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Detailed background, historical significance, and travel guidance..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase text-slate-400 mb-1">
                  Cover Image URL (HD Landscape) *
                </label>
                <input
                  type="url"
                  required
                  value={formData.cover_image}
                  onChange={(e) => setFormData({ ...formData, cover_image: e.target.value })}
                  placeholder="https://images.unsplash.com/photo-..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-emerald-500 font-mono"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold uppercase text-slate-400 mb-1">
                    Latitude (PostGIS Y) *
                  </label>
                  <input
                    type="number"
                    step="any"
                    required
                    value={formData.latitude}
                    onChange={(e) => setFormData({ ...formData, latitude: parseFloat(e.target.value) })}
                    placeholder="e.g. 6.8667"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white font-mono focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase text-slate-400 mb-1">
                    Longitude (PostGIS X) *
                  </label>
                  <input
                    type="number"
                    step="any"
                    required
                    value={formData.longitude}
                    onChange={(e) => setFormData({ ...formData, longitude: parseFloat(e.target.value) })}
                    placeholder="e.g. 81.0466"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white font-mono focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-bold uppercase text-slate-400 mb-1">
                    District *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.district}
                    onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                    placeholder="e.g. Badulla"
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase text-slate-400 mb-1">
                    Province *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.province}
                    onChange={(e) => setFormData({ ...formData, province: e.target.value })}
                    placeholder="e.g. Uva"
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase text-slate-400 mb-1">
                    Category *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    placeholder="e.g. Adventure"
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div>
                  <label className="block text-[11px] font-bold uppercase text-slate-400 mb-1">
                    Primary Activity
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.activity}
                    onChange={(e) => setFormData({ ...formData, activity: e.target.value })}
                    placeholder="e.g. Hiking"
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase text-slate-400 mb-1">
                    Travel Style
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.travel_style}
                    onChange={(e) => setFormData({ ...formData, travel_style: e.target.value })}
                    placeholder="e.g. Adventure"
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formSaving}
                  className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 transition-all shadow-md shadow-emerald-900/40"
                >
                  {formSaving ? "Saving Destination..." : editingPlace ? "Save Changes" : "Create Destination"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletePlaceTarget && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-slate-900 border border-red-500/30 rounded-3xl p-6 shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-white">Delete Destination</h3>
            <p className="text-xs text-slate-400">
              Are you sure you want to permanently delete <strong className="text-white">{deletePlaceTarget.title}</strong>?
              This will remove all associated user favorites and reviews.
            </p>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setDeletePlaceTarget(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white bg-slate-800"
              >
                Cancel
              </button>
              <button
                onClick={handleDeletePlace}
                className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-red-600 hover:bg-red-500 shadow-md shadow-red-950"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
