export interface PlannedTrip {
  id: string;
  user_id: string;
  place_id: string;
  travel_date: string;
  notes?: string | null;
  reminder_enabled: boolean;
  reminder_sent: boolean;
  reminder_sent_at?: string | null;
  created_at: string;
  updated_at: string;
  place_title: string;
  place_slug: string;
  place_cover_image?: string;
  place_district?: string;
  place_province?: string;
  place_category?: string;
  place_latitude?: number;
  place_longitude?: number;
  status: 'today' | 'upcoming' | 'past';
}

export interface CreateTripInput {
  place_id: string;
  travel_date: string;
  notes?: string;
  reminder_enabled?: boolean;
}

export interface UpdateTripInput {
  travel_date?: string;
  notes?: string;
  reminder_enabled?: boolean;
}

export interface TripResponse {
  success: boolean;
  message?: string;
  data?: PlannedTrip;
}

export interface TripsListResponse {
  success: boolean;
  count: number;
  data: PlannedTrip[];
}
