export interface User {
  id: string;
  full_name: string;
  email: string;
  profile_image?: string | null;
  bio?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  token?: string;
  user?: User;
}

export interface FavoriteItem {
  id: string;
  place_id: string;
  user_id: string;
  created_at: string;
  name: string;
  slug: string;
  category: string;
  province: string;
  district: string;
  city: string;
  cover_image: string;
  rating: number;
  review_count: number;
  latitude: number;
  longitude: number;
}
