-- ============================================================================
-- 008_user_profile_and_trips.sql
-- Explore Sri Lanka - User Profile Enhancements & Planned Trips Schema
-- Description: Adds profile customization columns to users table and
--              creates the planned_trips table for trip planning and reminders.
-- ============================================================================

-- 1. ALTER USERS TABLE WITH PROFILE ENHANCEMENTS
ALTER TABLE users
ADD COLUMN IF NOT EXISTS phone_number VARCHAR(30);

ALTER TABLE users
ADD COLUMN IF NOT EXISTS preferred_language VARCHAR(30) DEFAULT 'English';

ALTER TABLE users
ADD COLUMN IF NOT EXISTS preferred_region VARCHAR(100);

ALTER TABLE users
ADD COLUMN IF NOT EXISTS travel_preferences JSONB DEFAULT '[]'::jsonb;

-- 2. CREATE PLANNED TRIPS TABLE
CREATE TABLE IF NOT EXISTS planned_trips (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    place_id UUID NOT NULL,
    travel_date TIMESTAMP WITH TIME ZONE NOT NULL,
    notes TEXT,
    reminder_enabled BOOLEAN DEFAULT TRUE,
    reminder_sent BOOLEAN DEFAULT FALSE,
    reminder_sent_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    CONSTRAINT fk_planned_trip_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_planned_trip_place
        FOREIGN KEY (place_id)
        REFERENCES places(id)
        ON DELETE CASCADE
);

-- 3. PERFORMANCE INDEXES
CREATE INDEX IF NOT EXISTS idx_planned_trips_user_id ON planned_trips(user_id);
CREATE INDEX IF NOT EXISTS idx_planned_trips_place_id ON planned_trips(place_id);
CREATE INDEX IF NOT EXISTS idx_planned_trips_travel_date ON planned_trips(travel_date);
CREATE INDEX IF NOT EXISTS idx_planned_trips_reminder ON planned_trips(reminder_enabled, reminder_sent, travel_date);
