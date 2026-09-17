const { query } = require('../config/database');
const { samplePlaces } = require('../data/samplePlaces');
const { fallbackUsers } = require('./authService');

// In-memory fallback reviews
const fallbackReviews = [
  {
    id: "rev-sigiriya-1",
    user_id: "user-demo-1",
    place_id: "e4f8b912-32a1-4328-8671-6387d3dfa241", // Sigiriya
    rating: 5,
    comment: "Climbing Sigiriya at sunrise was the highlight of our Sri Lanka trip! The frescoes and summit ruins are mind-blowing.",
    created_at: new Date(Date.now() - 2 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 2 * 86400000).toISOString(),
    user_name: "Kamal Perera",
    profile_image: null,
  },
  {
    id: "rev-sigiriya-2",
    user_id: "user-demo-2",
    place_id: "e4f8b912-32a1-4328-8671-6387d3dfa241",
    rating: 5,
    comment: "Incredible ancient architecture and water gardens. Make sure to visit early morning to avoid the heat.",
    created_at: new Date(Date.now() - 5 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 5 * 86400000).toISOString(),
    user_name: "Sarah Jenkins",
    profile_image: null,
  },
  {
    id: "rev-galle-1",
    user_id: "user-demo-1",
    place_id: "a1b2c3d4-e5f6-7890-abcd-ef1234567890", // Galle Fort
    rating: 5,
    comment: "Walk along the ramparts for an unforgettable sunset. Beautiful cafes and cobblestone architecture.",
    created_at: new Date(Date.now() - 3 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 3 * 86400000).toISOString(),
    user_name: "Kamal Perera",
    profile_image: null,
  },
];

class ReviewService {
  /**
   * Helper to resolve place UUID from either ID or Slug
   */
  static async resolvePlaceId(placeIdOrSlug) {
    try {
      const res = await query(
        'SELECT id FROM places WHERE id = $1 OR slug = $1 LIMIT 1',
        [placeIdOrSlug]
      );
      if (res.rows[0]) return res.rows[0].id;
    } catch (e) {}

    const place = samplePlaces.find(
      (p) => p.id === placeIdOrSlug || p.slug === placeIdOrSlug
    );
    return place ? place.id : placeIdOrSlug;
  }

  /**
   * Add a new review
   */
  static async addReview({ userId, placeId, rating, comment }) {
    const resolvedPlaceId = await this.resolvePlaceId(placeId);

    try {
      // 1. Check if user already reviewed this place
      const existing = await query(
        'SELECT id FROM reviews WHERE user_id = $1 AND place_id = $2 LIMIT 1',
        [userId, resolvedPlaceId]
      );

      if (existing.rows.length > 0) {
        const error = new Error('You have already reviewed this place. You can edit your existing review.');
        error.status = 409;
        throw error;
      }

      // 2. Insert review
      const insertSql = `
        INSERT INTO reviews (user_id, place_id, rating, comment)
        VALUES ($1, $2, $3, $4)
        RETURNING id, user_id, place_id, rating, comment, created_at, updated_at;
      `;

      const result = await query(insertSql, [
        userId,
        resolvedPlaceId,
        parseInt(rating, 10),
        comment.trim(),
      ]);

      const review = result.rows[0];

      // Fetch user name
      const userRes = await query(
        'SELECT full_name, profile_image FROM users WHERE id = $1',
        [userId]
      );
      review.user_name = userRes.rows[0]?.full_name || 'Anonymous User';
      review.profile_image = userRes.rows[0]?.profile_image || null;

      return review;
    } catch (err) {
      if (err.status === 409 || err.code === '23505') {
        const error = new Error('You have already reviewed this place. You can edit your existing review.');
        error.status = 409;
        throw error;
      }

      console.warn('⚠️ [PostgreSQL Offline]: Saving review in fallback memory.');
      const existingIndex = fallbackReviews.findIndex(
        (r) => r.user_id === userId && r.place_id === resolvedPlaceId
      );

      if (existingIndex !== -1) {
        const error = new Error('You have already reviewed this place. You can edit your existing review.');
        error.status = 409;
        throw error;
      }

      const user = fallbackUsers.find((u) => u.id === userId);
      const newReview = {
        id: `rev-${Date.now()}`,
        user_id: userId,
        place_id: resolvedPlaceId,
        rating: parseInt(rating, 10),
        comment: comment.trim(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        user_name: user?.full_name || 'Traveler',
        profile_image: user?.profile_image || null,
      };

      fallbackReviews.unshift(newReview);
      return newReview;
    }
  }

  /**
   * Update an existing review (only review owner)
   */
  static async updateReview({ reviewId, userId, rating, comment }) {
    try {
      // 1. Verify existence and ownership
      const checkSql = 'SELECT id, user_id FROM reviews WHERE id = $1';
      const check = await query(checkSql, [reviewId]);

      if (check.rows.length === 0) {
        const error = new Error('Review not found.');
        error.status = 404;
        throw error;
      }

      if (check.rows[0].user_id !== userId) {
        const error = new Error('You are not authorized to edit this review.');
        error.status = 403;
        throw error;
      }

      // 2. Update review
      const updateSql = `
        UPDATE reviews 
        SET rating = $1, comment = $2, updated_at = NOW() 
        WHERE id = $3 
        RETURNING id, user_id, place_id, rating, comment, created_at, updated_at;
      `;

      const result = await query(updateSql, [
        parseInt(rating, 10),
        comment.trim(),
        reviewId,
      ]);

      return result.rows[0];
    } catch (err) {
      if (err.status) throw err;

      const review = fallbackReviews.find((r) => r.id === reviewId);
      if (!review) {
        const error = new Error('Review not found.');
        error.status = 404;
        throw error;
      }

      if (review.user_id !== userId) {
        const error = new Error('You are not authorized to edit this review.');
        error.status = 403;
        throw error;
      }

      review.rating = parseInt(rating, 10);
      review.comment = comment.trim();
      review.updated_at = new Date().toISOString();

      return review;
    }
  }

  /**
   * Delete review (only review owner)
   */
  static async deleteReview({ reviewId, userId }) {
    try {
      const checkSql = 'SELECT id, user_id FROM reviews WHERE id = $1';
      const check = await query(checkSql, [reviewId]);

      if (check.rows.length === 0) {
        const error = new Error('Review not found.');
        error.status = 404;
        throw error;
      }

      if (check.rows[0].user_id !== userId) {
        const error = new Error('You are not authorized to delete this review.');
        error.status = 403;
        throw error;
      }

      await query('DELETE FROM reviews WHERE id = $1', [reviewId]);
      return { message: 'Review deleted successfully.' };
    } catch (err) {
      if (err.status) throw err;

      const idx = fallbackReviews.findIndex((r) => r.id === reviewId);
      if (idx === -1) {
        const error = new Error('Review not found.');
        error.status = 404;
        throw error;
      }

      if (fallbackReviews[idx].user_id !== userId) {
        const error = new Error('You are not authorized to delete this review.');
        error.status = 403;
        throw error;
      }

      fallbackReviews.splice(idx, 1);
      return { message: 'Review deleted successfully.' };
    }
  }

  /**
   * Get all reviews for a destination
   */
  static async getPlaceReviews(placeIdOrSlug, limit = 50) {
    const resolvedPlaceId = await this.resolvePlaceId(placeIdOrSlug);

    try {
      const sql = `
        SELECT 
          r.id,
          r.rating,
          r.comment,
          r.created_at,
          r.updated_at,
          r.user_id,
          u.full_name AS user_name,
          u.profile_image
        FROM reviews r
        JOIN users u ON r.user_id = u.id
        WHERE r.place_id = $1
        ORDER BY r.created_at DESC
        LIMIT $2;
      `;

      const result = await query(sql, [resolvedPlaceId, Math.min(limit, 100)]);
      return result.rows;
    } catch (err) {
      console.warn('⚠️ [PostgreSQL Offline]: Fetching reviews from fallback memory.');
      return fallbackReviews
        .filter((r) => r.place_id === resolvedPlaceId)
        .slice(0, limit);
    }
  }

  /**
   * Get aggregated rating summary & distribution
   */
  static async getPlaceReviewSummary(placeIdOrSlug) {
    const resolvedPlaceId = await this.resolvePlaceId(placeIdOrSlug);

    try {
      const sql = `
        SELECT 
          COALESCE(ROUND(AVG(rating)::numeric, 1), 0.0) AS average_rating,
          COUNT(*)::int AS review_count,
          COUNT(*) FILTER (WHERE rating = 5)::int AS rating_5,
          COUNT(*) FILTER (WHERE rating = 4)::int AS rating_4,
          COUNT(*) FILTER (WHERE rating = 3)::int AS rating_3,
          COUNT(*) FILTER (WHERE rating = 2)::int AS rating_2,
          COUNT(*) FILTER (WHERE rating = 1)::int AS rating_1
        FROM reviews
        WHERE place_id = $1;
      `;

      const result = await query(sql, [resolvedPlaceId]);
      const row = result.rows[0];

      return {
        average_rating: parseFloat(row.average_rating) || 0,
        review_count: parseInt(row.review_count, 10) || 0,
        rating_distribution: {
          5: parseInt(row.rating_5, 10) || 0,
          4: parseInt(row.rating_4, 10) || 0,
          3: parseInt(row.rating_3, 10) || 0,
          2: parseInt(row.rating_2, 10) || 0,
          1: parseInt(row.rating_1, 10) || 0,
        },
      };
    } catch (err) {
      const matches = fallbackReviews.filter((r) => r.place_id === resolvedPlaceId);
      const total = matches.length;

      if (total === 0) {
        return {
          average_rating: 0,
          review_count: 0,
          rating_distribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
        };
      }

      const sum = matches.reduce((acc, r) => acc + r.rating, 0);
      const avg = parseFloat((sum / total).toFixed(1));

      const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
      matches.forEach((r) => {
        if (distribution[r.rating] !== undefined) distribution[r.rating]++;
      });

      return {
        average_rating: avg,
        review_count: total,
        rating_distribution: distribution,
      };
    }
  }
}

module.exports = ReviewService;
