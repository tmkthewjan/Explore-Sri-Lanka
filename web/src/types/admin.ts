import { User } from './auth';
import { Place } from './place';

export interface DashboardStats {
  totalUsers: number;
  activeUsers: number;
  newUsers: number;
  totalPlaces: number;
  totalReviews: number;
  totalFavorites: number;
  averageRating: number;
}

export interface RecentReview {
  id: string;
  rating: number;
  comment: string;
  user_name: string;
  user_email: string;
  place_title: string;
  place_slug: string;
  created_at: string;
}

export interface DashboardData {
  period: string;
  stats: DashboardStats;
  recentReviews: RecentReview[];
  recentUsers: User[];
}

export interface AdminUserListItem extends User {
  favorites_count: number;
  reviews_count: number;
}

export interface AdminUsersResponse {
  success: boolean;
  users: AdminUserListItem[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface UserDetailsData {
  user: AdminUserListItem & { average_review_rating: number };
  favorites: Array<{
    favorite_id: string;
    created_at: string;
    id: string;
    title: string;
    slug: string;
    cover_image: string;
    category: string;
    district: string;
  }>;
  reviews: Array<{
    id: string;
    rating: number;
    comment: string;
    created_at: string;
    place_id: string;
    place_title: string;
    place_slug: string;
  }>;
}

export interface AdminPlacesResponse {
  success: boolean;
  places: Array<Place & {
    favorites_count: number;
    reviews_count: number;
    average_rating: number;
  }>;
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface AdminReviewItem {
  id: string;
  rating: number;
  comment: string;
  created_at: string;
  updated_at: string;
  user_id: string;
  user_name: string;
  user_email: string;
  user_avatar?: string;
  place_id: string;
  place_title: string;
  place_slug: string;
  place_image: string;
}

export interface AdminReviewsResponse {
  success: boolean;
  reviews: AdminReviewItem[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface UserGrowthTrend {
  date: string;
  count: number;
}

export interface UserAnalyticsData {
  period: string;
  registrationTrends: UserGrowthTrend[];
  userStatus: {
    active_count: number;
    inactive_count: number;
    admin_count: number;
    user_count: number;
  };
}

export interface PlaceAnalyticsData {
  topPlaces: Array<{
    id: string;
    title: string;
    slug: string;
    category: string;
    district: string;
    province: string;
    cover_image: string;
    favorites_count: number;
    reviews_count: number;
    average_rating: number;
  }>;
  categoryBreakdown: Array<{
    category: string;
    count: number;
  }>;
  districtBreakdown: Array<{
    district: string;
    count: number;
  }>;
}

export interface ReviewAnalyticsData {
  distribution: Array<{
    rating: number;
    count: number;
  }>;
  totalReviews: number;
  averageRating: number;
}

export interface FavoritesAnalyticsData {
  topFavorites: Array<{
    id: string;
    title: string;
    slug: string;
    cover_image: string;
    category: string;
    district: string;
    favorites_count: number;
  }>;
  recentActivity: Array<{
    id: string;
    user_name: string;
    user_email: string;
    place_title: string;
    place_slug: string;
    created_at: string;
  }>;
}

export interface SearchAnalyticsData {
  topSearches: Array<{
    search_query: string;
    count: number;
    last_searched: string;
  }>;
  recentSearches: Array<{
    id: string;
    search_query: string;
    created_at: string;
  }>;
}

export interface LocationAnalyticsData {
  radiusBreakdown: Array<{
    radius_range: string;
    count: number;
  }>;
}
