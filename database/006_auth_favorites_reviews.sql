-- ============================================================================
-- 006_auth_favorites_reviews.sql
-- Explore Sri Lanka - Authentication, Favorites, and Reviews Tables
-- Description: Creates the 'users', 'favorites', and 'reviews' tables
--              with cascading foreign keys and uniqueness constraints.
-- ============================================================================

-- 1. USERS TABLE
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    profile_image VARCHAR(500),
    reset_password_token VARCHAR(255),
    reset_password_expires TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. FAVORITES TABLE (Wishlist)
CREATE TABLE IF NOT EXISTS favorites (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    place_id UUID NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    CONSTRAINT fk_favorite_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_favorite_place
        FOREIGN KEY (place_id)
        REFERENCES places(id)
        ON DELETE CASCADE,

    CONSTRAINT unique_user_favorite
        UNIQUE (user_id, place_id)
);

-- 3. REVIEWS TABLE (Ratings 1-5 & Comments)
CREATE TABLE IF NOT EXISTS reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    place_id UUID NOT NULL,
    rating INTEGER NOT NULL,
    comment TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    CONSTRAINT fk_review_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_review_place
        FOREIGN KEY (place_id)
        REFERENCES places(id)
        ON DELETE CASCADE,

    CONSTRAINT rating_range
        CHECK (rating >= 1 AND rating <= 5),

    CONSTRAINT unique_user_place_review
        UNIQUE (user_id, place_id)
);

-- 4. PERFORMANCE INDEXES
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_favorites_user_id ON favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_favorites_place_id ON favorites(place_id);
CREATE INDEX IF NOT EXISTS idx_reviews_place_id ON reviews(place_id);
CREATE INDEX IF NOT EXISTS idx_reviews_user_id ON reviews(user_id);
