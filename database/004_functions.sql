-- ============================================================================
-- 004_functions.sql
-- Explore Sri Lanka - Spatial Search Functions
-- Description: Creates get_nearby_places() function using PostGIS spatial operators
-- ============================================================================

-- Drop existing function if needed
DROP FUNCTION IF EXISTS get_nearby_places(DOUBLE PRECISION, DOUBLE PRECISION, DOUBLE PRECISION, VARCHAR);
DROP FUNCTION IF EXISTS get_nearby_places(DOUBLE PRECISION, DOUBLE PRECISION, DOUBLE PRECISION);

CREATE OR REPLACE FUNCTION get_nearby_places(
    user_lat DOUBLE PRECISION,
    user_lng DOUBLE PRECISION,
    radius_km DOUBLE PRECISION DEFAULT 25.0,
    category_filter VARCHAR DEFAULT NULL
)
RETURNS TABLE (
    id UUID,
    title VARCHAR,
    slug VARCHAR,
    description TEXT,
    cover_image TEXT,
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    district VARCHAR,
    province VARCHAR,
    category VARCHAR,
    activity VARCHAR,
    travel_style VARCHAR,
    distance_km NUMERIC
) AS $$
DECLARE
    -- Convert user latitude and longitude into a PostGIS geography point (WGS 84 SRID 4326)
    -- ST_MakePoint takes (longitude, latitude)
    user_point geography := ST_SetSRID(ST_MakePoint(user_lng, user_lat), 4326)::geography;
BEGIN
    RETURN QUERY
    SELECT 
        p.id,
        p.title,
        p.slug,
        p.description,
        p.cover_image,
        p.latitude,
        p.longitude,
        p.district,
        p.province,
        p.category,
        p.activity,
        p.travel_style,
        -- ST_Distance on geography returns distance in meters; divide by 1000 for km
        ROUND((ST_Distance(p.location, user_point) / 1000.0)::numeric, 2) AS distance_km
    FROM 
        places p
    WHERE 
        -- ST_DWithin on geography uses meters and leverages the GiST spatial index
        ST_DWithin(p.location, user_point, radius_km * 1000.0)
        -- Optional category filter support
        AND (category_filter IS NULL OR p.category ILIKE category_filter)
    ORDER BY 
        ST_Distance(p.location, user_point) ASC;
END;
$$ LANGUAGE plpgsql STABLE;
