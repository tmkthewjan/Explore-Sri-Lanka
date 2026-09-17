const { query } = require('../config/database');
const { samplePlaces } = require('../data/samplePlaces');

// In-memory fallback favorites storage for offline mode
const fallbackFavorites = [];

class FavoriteService {
  /**
   * Add a place to user's favorites
   */
  static async addFavorite(userId, placeId) {
    try {
      // 1. Check if place exists (by UUID or slug)
      const placeCheck = await query(
        'SELECT id, title, slug FROM places WHERE id = $1 OR slug = $1 LIMIT 1',
        [placeId]
      );

      let actualPlaceId = placeCheck.rows[0]?.id;

      if (!actualPlaceId) {
        const fallbackPlace = samplePlaces.find(
          (p) => p.id === placeId || p.slug === placeId
        );
        if (fallbackPlace) {
          actualPlaceId = fallbackPlace.id;
        }
      }

      if (!actualPlaceId) {
        const error = new Error('Place not found.');
        error.status = 404;
        throw error;
      }

      // 2. Insert into favorites table
      const insertSql = `
        INSERT INTO favorites (user_id, place_id)
        VALUES ($1, $2)
        ON CONFLICT (user_id, place_id) DO NOTHING
        RETURNING id, user_id, place_id, created_at;
      `;

      const result = await query(insertSql, [userId, actualPlaceId]);

      return {
        isFavorite: true,
        place_id: actualPlaceId,
        already_favorited: result.rows.length === 0,
      };
    } catch (err) {
      if (err.status) throw err;

      console.warn('⚠️ [PostgreSQL Offline]: Managing favorites in fallback memory.');
      const resolvedPlace = samplePlaces.find(
        (p) => p.id === placeId || p.slug === placeId
      );

      if (!resolvedPlace) {
        const error = new Error('Place not found.');
        error.status = 404;
        throw error;
      }

      const existingIndex = fallbackFavorites.findIndex(
        (f) => f.user_id === userId && f.place_id === resolvedPlace.id
      );

      if (existingIndex === -1) {
        fallbackFavorites.push({
          id: `fav-${Date.now()}`,
          user_id: userId,
          place_id: resolvedPlace.id,
          created_at: new Date().toISOString(),
        });
      }

      return {
        isFavorite: true,
        place_id: resolvedPlace.id,
        already_favorited: existingIndex !== -1,
      };
    }
  }

  /**
   * Remove a place from user's favorites
   */
  static async removeFavorite(userId, placeId) {
    try {
      const deleteSql = `
        DELETE FROM favorites 
        WHERE user_id = $1 
          AND (place_id = $2 OR place_id IN (SELECT id FROM places WHERE slug = $2))
        RETURNING id, place_id;
      `;

      const result = await query(deleteSql, [userId, placeId]);

      return {
        isFavorite: false,
        deleted: result.rows.length > 0,
      };
    } catch (err) {
      console.warn('⚠️ [PostgreSQL Offline]: Removing favorite in fallback memory.');
      const resolvedPlace = samplePlaces.find(
        (p) => p.id === placeId || p.slug === placeId
      );
      const targetId = resolvedPlace ? resolvedPlace.id : placeId;

      const initialLength = fallbackFavorites.length;
      const index = fallbackFavorites.findIndex(
        (f) => f.user_id === userId && f.place_id === targetId
      );

      if (index !== -1) {
        fallbackFavorites.splice(index, 1);
      }

      return {
        isFavorite: false,
        deleted: fallbackFavorites.length < initialLength,
      };
    }
  }

  /**
   * Get all favorites for a user with joined place details
   */
  static async getUserFavorites(userId) {
    try {
      const sql = `
        SELECT 
          p.id,
          p.title,
          p.slug,
          p.description,
          p.cover_image,
          p.category,
          p.activity,
          p.travel_style,
          p.district,
          p.province,
          p.latitude,
          p.longitude,
          f.id AS favorite_id,
          f.created_at AS favorited_at
        FROM favorites f
        JOIN places p ON f.place_id = p.id
        WHERE f.user_id = $1
        ORDER BY f.created_at DESC;
      `;

      const result = await query(sql, [userId]);
      return result.rows;
    } catch (err) {
      console.warn('⚠️ [PostgreSQL Offline]: Fetching favorites from fallback memory.');
      const userFavs = fallbackFavorites.filter((f) => f.user_id === userId);

      return userFavs
        .map((f) => {
          const place = samplePlaces.find((p) => p.id === f.place_id);
          if (!place) return null;
          return {
            ...place,
            favorite_id: f.id,
            favorited_at: f.created_at,
          };
        })
        .filter(Boolean);
    }
  }

  /**
   * Check if a specific place is favorited by the user
   */
  static async checkFavorite(userId, placeId) {
    if (!userId) return { isFavorite: false };

    try {
      const sql = `
        SELECT id FROM favorites 
        WHERE user_id = $1 
          AND (place_id = $2 OR place_id IN (SELECT id FROM places WHERE slug = $2))
        LIMIT 1;
      `;

      const result = await query(sql, [userId, placeId]);
      return { isFavorite: result.rows.length > 0 };
    } catch (err) {
      const resolvedPlace = samplePlaces.find(
        (p) => p.id === placeId || p.slug === placeId
      );
      const targetId = resolvedPlace ? resolvedPlace.id : placeId;

      const exists = fallbackFavorites.some(
        (f) => f.user_id === userId && f.place_id === targetId
      );
      return { isFavorite: exists };
    }
  }
}

module.exports = FavoriteService;
