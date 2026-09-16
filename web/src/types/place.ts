export interface Place {
  id: string;
  title: string;
  slug: string;
  description: string;
  cover_image: string;
  latitude: number;
  longitude: number;
  district: string;
  province: string;
  category: string;
  activity: string;
  travel_style: string;
  distance_km?: number | string;
  created_at?: string;
  updated_at?: string;
}

export interface MetadataCountItem {
  count: string | number;
}

export interface CategoryItem extends MetadataCountItem {
  category: string;
}

export interface DistrictItem extends MetadataCountItem {
  district: string;
  province: string;
}

export interface TravelStyleItem extends MetadataCountItem {
  travel_style: string;
}

export interface MetadataResponse {
  categories: CategoryItem[];
  districts: DistrictItem[];
  travel_styles: TravelStyleItem[];
}

export interface UserCoordinates {
  latitude: number;
  longitude: number;
}

export interface PlaceFilters {
  category?: string;
  district?: string;
  province?: string;
  activity?: string;
  travel_style?: string;
  radius?: number;
  search?: string;
  sort?: string;
  page?: number;
  limit?: number;
}
