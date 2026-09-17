import { Place, MetadataResponse, PlaceFilters } from "@/types/place";
import { User, AuthResponse, FavoriteItem } from "@/types/auth";
import { Review, ReviewSummary } from "@/types/review";

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

/* =========================================================================
   USER AUTHENTICATION CLIENT APIs
   ========================================================================= */

/**
 * Register a new user account
 */
export async function registerApi(data: {
  full_name: string;
  email: string;
  password: string;
}): Promise<AuthResponse> {
  const res = await fetch(`${API_BASE_URL}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || "Registration failed");
  return json;
}

/**
 * Log in with email and password
 */
export async function loginApi(data: {
  email: string;
  password: string;
}): Promise<AuthResponse> {
  const res = await fetch(`${API_BASE_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || "Login failed");
  return json;
}

/**
 * Request password reset email
 */
export async function forgotPasswordApi(email: string): Promise<{ success: boolean; message: string }> {
  const res = await fetch(`${API_BASE_URL}/auth/forgot-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || "Failed to request password reset");
  return json;
}

/**
 * Reset password with token
 */
export async function resetPasswordApi(
  token: string,
  password: string
): Promise<{ success: boolean; message: string }> {
  const res = await fetch(`${API_BASE_URL}/auth/reset-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token, password }),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || "Failed to reset password");
  return json;
}

/* =========================================================================
   USER PROFILE APIs
   ========================================================================= */

/**
 * Fetch authenticated user profile
 */
export async function getProfileApi(token: string): Promise<User> {
  const res = await fetch(`${API_BASE_URL}/users/profile`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || "Failed to load profile");
  return json.data;
}

/**
 * Update user profile (name, bio, avatar)
 */
export async function updateProfileApi(
  token: string,
  data: { full_name?: string; bio?: string; profile_image?: string | null }
): Promise<User> {
  const res = await fetch(`${API_BASE_URL}/users/profile`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || "Failed to update profile");
  return json.data;
}

/**
 * Change user password
 */
export async function changePasswordApi(
  token: string,
  data: { current_password: string; new_password: string }
): Promise<{ success: boolean; message: string }> {
  const res = await fetch(`${API_BASE_URL}/users/change-password`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || "Failed to update password");
  return json;
}

/* =========================================================================
   FAVORITES / WISHLIST APIs
   ========================================================================= */

/**
 * Check if a place is in the user's favorites
 */
export async function checkFavoriteApi(
  placeId: string,
  token?: string | null
): Promise<boolean> {
  try {
    const headers: Record<string, string> = {};
    if (token) headers["Authorization"] = `Bearer ${token}`;

    const res = await fetch(`${API_BASE_URL}/favorites/check/${placeId}`, {
      headers,
      cache: "no-store",
    });
    if (!res.ok) return false;
    const json = await res.json();
    return !!json.isFavorite;
  } catch {
    return false;
  }
}

/**
 * Add a place to favorites
 */
export async function addFavoriteApi(
  token: string,
  placeId: string
): Promise<void> {
  const res = await fetch(`${API_BASE_URL}/favorites`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ place_id: placeId }),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || "Failed to add favorite");
}

/**
 * Remove a place from favorites
 */
export async function removeFavoriteApi(
  token: string,
  placeId: string
): Promise<void> {
  const res = await fetch(`${API_BASE_URL}/favorites/${placeId}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || "Failed to remove favorite");
}

/**
 * Get all places saved by user
 */
export async function getUserFavoritesApi(token: string): Promise<FavoriteItem[]> {
  const res = await fetch(`${API_BASE_URL}/favorites`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || "Failed to load favorites");
  return json.data || [];
}

/* =========================================================================
   RATINGS & REVIEWS APIs
   ========================================================================= */

/**
 * Get aggregated ratings summary for a place
 */
export async function getPlaceReviewSummaryApi(placeIdOrSlug: string): Promise<ReviewSummary> {
  const res = await fetch(`${API_BASE_URL}/reviews/place/${placeIdOrSlug}/summary`, {
    cache: "no-store",
  });
  if (!res.ok) {
    return {
      average_rating: 0,
      review_count: 0,
      rating_distribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
    };
  }
  const json = await res.json();
  return json.data;
}

/**
 * Get all reviews for a place
 */
export async function getPlaceReviewsApi(
  placeIdOrSlug: string,
  limit: number = 50
): Promise<Review[]> {
  const res = await fetch(`${API_BASE_URL}/reviews/place/${placeIdOrSlug}?limit=${limit}`, {
    cache: "no-store",
  });
  if (!res.ok) return [];
  const json = await res.json();
  return json.data || [];
}

/**
 * Submit a new review
 */
export async function addReviewApi(
  token: string,
  data: { place_id: string; rating: number; comment: string }
): Promise<Review> {
  const res = await fetch(`${API_BASE_URL}/reviews`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || "Failed to submit review");
  return json.data;
}

/**
 * Update an existing review
 */
export async function updateReviewApi(
  token: string,
  reviewId: string,
  data: { rating: number; comment: string }
): Promise<Review> {
  const res = await fetch(`${API_BASE_URL}/reviews/${reviewId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || "Failed to update review");
  return json.data;
}

/**
 * Delete an existing review
 */
export async function deleteReviewApi(token: string, reviewId: string): Promise<void> {
  const res = await fetch(`${API_BASE_URL}/reviews/${reviewId}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || "Failed to delete review");
}

