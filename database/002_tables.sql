-- ============================================================================
-- 002_tables.sql
-- Explore Sri Lanka - Places Table Schema
-- Description: Creates the core 'places' table with PostGIS spatial geography column
-- ============================================================================

-- Drop table if already exists (useful for clean reinstalls)
DROP TABLE IF EXISTS places CASCADE;

CREATE TABLE places (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL UNIQUE,
    description TEXT NOT NULL,
    cover_image TEXT NOT NULL,
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    location geography(Point, 4326) NOT NULL,
    district VARCHAR(100) NOT NULL,
    province VARCHAR(100) NOT NULL,
    category VARCHAR(100) NOT NULL,
    activity VARCHAR(100) NOT NULL,
    travel_style VARCHAR(100) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Trigger function to automatically keep 'location' in sync with lat/lng
-- and update 'updated_at' timestamp automatically
CREATE OR REPLACE FUNCTION set_places_location_and_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    -- Automatically compute PostGIS Point geography from longitude and latitude
    -- Note: PostGIS ST_MakePoint takes (longitude, latitude) order (X, Y)
    NEW.location := ST_SetSRID(ST_MakePoint(NEW.longitude, NEW.latitude), 4326)::geography;
    NEW.updated_at := CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_places_before_insert_or_update
BEFORE INSERT OR UPDATE OF latitude, longitude, updated_at ON places
FOR EACH ROW
EXECUTE FUNCTION set_places_location_and_timestamp();
