export interface Review {
  id: string;
  user_id: string;
  place_id: string;
  rating: number;
  comment: string;
  created_at: string;
  updated_at: string;
  user_name: string;
  profile_image?: string | null;
}

export interface ReviewSummary {
  average_rating: number;
  review_count: number;
  rating_distribution: {
    1: number;
    2: number;
    3: number;
    4: number;
    5: number;
    [key: number]: number;
  };
}
