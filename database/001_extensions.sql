-- ============================================================================
-- 001_extensions.sql
-- Explore Sri Lanka - Spatial Database Setup
-- Description: Enables PostGIS extension for geolocation and spatial queries.
-- ============================================================================

-- Ensure PostGIS is enabled
CREATE EXTENSION IF NOT EXISTS postgis;

-- Verify PostGIS installation and version
SELECT PostGIS_Full_Version();
