-- ============================================================================
-- 003_indexes.sql
-- Explore Sri Lanka - Spatial and Query Optimization Indexes
-- Description: Creates GiST index on location and B-tree indexes on filter fields
-- ============================================================================

-- 1. GiST Spatial Index on 'location' column (Crucial for high-speed ST_DWithin queries)
CREATE INDEX IF NOT EXISTS places_location_idx
ON places
USING GIST (location);

-- 2. Unique Index on 'slug' for ultra-fast place details lookup (/places/:slug)
CREATE INDEX IF NOT EXISTS places_slug_idx
ON places (slug);

-- 3. Filter Indexes for Category, District, Province, Activity, and Travel Style
CREATE INDEX IF NOT EXISTS places_category_idx
ON places (category);

CREATE INDEX IF NOT EXISTS places_district_idx
ON places (district);

CREATE INDEX IF NOT EXISTS places_province_idx
ON places (province);

CREATE INDEX IF NOT EXISTS places_activity_idx
ON places (activity);

CREATE INDEX IF NOT EXISTS places_travel_style_idx
ON places (travel_style);
