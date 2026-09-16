import { Place, MetadataResponse, PlaceFilters } from "@/types/place";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

/**
 * Fetch all places with optional filters
 */
export async function getPlaces(filters: PlaceFilters = {}): Promise<{ places: Place[]; total: number }> {
  const params = new URLSearchParams();

  if (filters.category) params.append("category", filters.category);
  if (filters.district) params.append("district", filters.district);
  if (filters.province) params.append("province", filters.province);
  if (filters.activity) params.append("activity", filters.activity);
  if (filters.travel_style) params.append("travel_style", filters.travel_style);
  if (filters.page) params.append("page", String(filters.page));
  if (filters.limit) params.append("limit", String(filters.limit));
  if (filters.sort) params.append("sort", filters.sort);

  const res = await fetch(`${API_BASE_URL}/places?${params.toString()}`, {
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch places: ${res.statusText}`);
  }

  const json = await res.json();
  return {
    places: json.data || [],
    total: json.pagination?.total_items || 0,
  };
}

/**
 * Fetch single place by UUID or slug
 */
export async function getPlaceBySlug(slug: string, userLat?: number, userLng?: number): Promise<Place> {
  const params = new URLSearchParams();
  if (userLat !== undefined && userLng !== undefined) {
    params.append("lat", String(userLat));
    params.append("lng", String(userLng));
  }

  const url = `${API_BASE_URL}/places/${slug}${params.toString() ? `?${params.toString()}` : ""}`;
  const res = await fetch(url, { cache: "no-store" });

  if (!res.ok) {
    throw new Error(`Place '${slug}' not found`);
  }

  const json = await res.json();
  return json.data;
}

/**
 * Fetch nearby places using PostGIS coordinates
 */
export async function getNearbyPlaces(
  lat: number,
  lng: number,
  radius: number = 25,
  category?: string
): Promise<Place[]> {
  const params = new URLSearchParams({
    lat: String(lat),
    lng: String(lng),
    radius: String(radius),
  });

  if (category) {
    params.append("category", category);
  }

  const res = await fetch(`${API_BASE_URL}/places/nearby?${params.toString()}`, {
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch nearby places`);
  }

  const json = await res.json();
  return json.data || [];
}

/**
 * Search places by query term
 */
export async function searchPlaces(query: string): Promise<Place[]> {
  if (!query.trim()) return [];

  const res = await fetch(`${API_BASE_URL}/places/search?q=${encodeURIComponent(query)}`, {
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(`Failed to search places`);
  }

  const json = await res.json();
  return json.data || [];
}

/**
 * Fetch filter metadata (categories, districts, travel styles)
 */
export async function getMetadata(): Promise<MetadataResponse> {
  const res = await fetch(`${API_BASE_URL}/places/metadata`, {
    next: { revalidate: 3600 },
  });

  if (!res.ok) {
    return { categories: [], districts: [], travel_styles: [] };
  }

  const json = await res.json();
  return json.data;
}

/**
 * Generates Google Maps directions navigation URL from origin to destination
 */
export function getGoogleMapsNavigationUrl(
  destLat: number,
  destLng: number,
  originLat?: number | null,
  originLng?: number | null
): string {
  if (originLat && originLng) {
    return `https://www.google.com/maps/dir/?api=1&origin=${originLat},${originLng}&destination=${destLat},${destLng}&travelmode=driving`;
  }
  return `https://www.google.com/maps/dir/?api=1&destination=${destLat},${destLng}&travelmode=driving`;
}
