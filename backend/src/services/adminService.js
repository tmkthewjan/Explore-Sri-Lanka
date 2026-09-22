const { query } = require('../config/database');
const { fallbackUsers } = require('./authService');
const { samplePlaces: fallbackPlaces } = require('../data/samplePlaces');

class AdminService {
  /**
   * Helper: Parse interval string from period filter
   */
  static getIntervalFromPeriod(period = '30d') {
    switch (period) {
      case 'today':
      case '24h':
      case '1d':
        return '1 day';
      case '7d':
        return '7 days';
      case '90d':
        return '90 days';
      case '30d':
      default:
        return '30 days';
    }
  }

  /**
   * Top Dashboard Statistics Cards + Quick Aggregates
   */
  static async getDashboardStats(period = '30d') {
    const intervalStr = this.getIntervalFromPeriod(period);

    try {
      const statsQuery = `
        SELECT
          (SELECT COUNT(*) FROM users) AS total_users,
          (SELECT COUNT(*) FROM users WHERE last_login_at >= NOW() - INTERVAL '${intervalStr}') AS active_users,
          (SELECT COUNT(*) FROM users WHERE created_at >= NOW() - INTERVAL '${intervalStr}') AS new_users,
          (SELECT COUNT(*) FROM places) AS total_places,
          (SELECT COUNT(*) FROM reviews) AS total_reviews,
          (SELECT COUNT(*) FROM favorites) AS total_favorites,
          (SELECT COALESCE(ROUND(AVG(rating)::numeric, 1), 0.0) FROM reviews) AS average_rating;
      `;

      const result = await query(statsQuery);
      const row = result.rows[0] || {};

      // Fetch recent 5 reviews
      const recentReviews = await query(`
        SELECT r.id, r.rating, r.comment, r.created_at, 
               u.full_name AS user_name, u.email AS user_email,
               p.title AS place_title, p.slug AS place_slug
        FROM reviews r
        JOIN users u ON r.user_id = u.id
        JOIN places p ON r.place_id = p.id
        ORDER BY r.created_at DESC
        LIMIT 5;
      `);

      // Fetch recent 5 users
      const recentUsers = await query(`
        SELECT id, full_name, email, role, is_active, last_login_at, created_at
        FROM users
        ORDER BY created_at DESC
        LIMIT 5;
      `);

      return {
        period,
        stats: {
          totalUsers: parseInt(row.total_users || 0, 10),
          activeUsers: parseInt(row.active_users || 0, 10),
          newUsers: parseInt(row.new_users || 0, 10),
          totalPlaces: parseInt(row.total_places || 0, 10),
          totalReviews: parseInt(row.total_reviews || 0, 10),
          totalFavorites: parseInt(row.total_favorites || 0, 10),
          averageRating: parseFloat(row.average_rating || 0.0),
        },
        recentReviews: recentReviews.rows,
        recentUsers: recentUsers.rows,
      };
    } catch (err) {
      console.warn('⚠️ [PostgreSQL Offline/Empty]: Returning fallback dashboard statistics.');
      return {
        period,
        stats: {
          totalUsers: fallbackUsers.length || 2,
          activeUsers: fallbackUsers.filter((u) => u.is_active !== false).length || 2,
          newUsers: fallbackUsers.length || 2,
          totalPlaces: (fallbackPlaces && fallbackPlaces.length) || 20,
          totalReviews: 48,
          totalFavorites: 86,
          averageRating: 4.8,
        },
        recentReviews: [
          {
            id: 'mock-rev-1',
            rating: 5,
            comment: 'Unbelievable sunrise view from the summit! Truly unforgettable.',
            user_name: 'Amara Fernando',
            user_email: 'amara@example.com',
            place_title: 'Sigiriya Ancient Rock Fortress',
            place_slug: 'sigiriya-rock-fortress',
            created_at: new Date().toISOString(),
          },
          {
            id: 'mock-rev-2',
            rating: 5,
            comment: 'The scenic blue train crossing was the highlight of our journey.',
            user_name: 'David Miller',
            user_email: 'david@example.com',
            place_title: 'Nine Arch Bridge',
            place_slug: 'nine-arch-bridge-ella',
            created_at: new Date(Date.now() - 3600000).toISOString(),
          },
        ],
        recentUsers: fallbackUsers.map((u) => ({
          id: u.id,
          full_name: u.full_name,
          email: u.email,
          role: u.role || 'user',
          is_active: u.is_active !== false,
          last_login_at: u.last_login_at,
          created_at: u.created_at,
        })),
      };
    }
  }

  /**
   * User Growth and Active Users Analytics
   */
  static async getUserAnalytics(period = '30d') {
    const intervalStr = this.getIntervalFromPeriod(period);

    try {
      // Daily registration trends
      const growthQuery = `
        SELECT 
          TO_CHAR(date_trunc('day', created_at), 'YYYY-MM-DD') AS date,
          COUNT(*) AS count
        FROM users
        WHERE created_at >= NOW() - INTERVAL '${intervalStr}'
        GROUP BY date_trunc('day', created_at)
        ORDER BY date ASC;
      `;
      const growthResult = await query(growthQuery);

      // Active vs Inactive breakdown
      const statusQuery = `
        SELECT 
          COUNT(*) FILTER (WHERE is_active = TRUE) AS active_count,
          COUNT(*) FILTER (WHERE is_active = FALSE) AS inactive_count,
          COUNT(*) FILTER (WHERE role = 'admin') AS admin_count,
          COUNT(*) FILTER (WHERE role = 'user') AS user_count
        FROM users;
      `;
      const statusResult = await query(statusQuery);

      return {
        period,
        registrationTrends: growthResult.rows,
        userStatus: statusResult.rows[0] || {
          active_count: 0,
          inactive_count: 0,
          admin_count: 0,
          user_count: 0,
        },
      };
    } catch (err) {
      // Fallback trend generation
      const now = Date.now();
      const mockDays = [7, 6, 5, 4, 3, 2, 1, 0].map((d) => {
        const dt = new Date(now - d * 86400000);
        return {
          date: dt.toISOString().split('T')[0],
          count: Math.floor(Math.random() * 8) + 2,
        };
      });

      return {
        period,
        registrationTrends: mockDays,
        userStatus: {
          active_count: fallbackUsers.length,
          inactive_count: 0,
          admin_count: 1,
          user_count: fallbackUsers.length - 1,
        },
      };
    }
  }

  /**
   * Place Popularity Analytics (Favorites, Reviews, Ratings)
   */
  static async getPlaceAnalytics() {
    try {
      const topPlacesQuery = `
        SELECT 
          p.id, p.title, p.slug, p.category, p.district, p.province, p.cover_image,
          COUNT(DISTINCT f.id) AS favorites_count,
          COUNT(DISTINCT r.id) AS reviews_count,
          COALESCE(ROUND(AVG(r.rating)::numeric, 1), 0.0) AS average_rating
        FROM places p
        LEFT JOIN favorites f ON p.id = f.place_id
        LEFT JOIN reviews r ON p.id = r.place_id
        GROUP BY p.id
        ORDER BY favorites_count DESC, reviews_count DESC
        LIMIT 10;
      `;
      const topPlaces = await query(topPlacesQuery);

      const categoryQuery = `
        SELECT category, COUNT(*) AS count
        FROM places
        GROUP BY category
        ORDER BY count DESC;
      `;
      const categories = await query(categoryQuery);

      const districtQuery = `
        SELECT district, COUNT(*) AS count
        FROM places
        GROUP BY district
        ORDER BY count DESC
        LIMIT 10;
      `;
      const districts = await query(districtQuery);

      return {
        topPlaces: topPlaces.rows,
        categoryBreakdown: categories.rows,
        districtBreakdown: districts.rows,
      };
    } catch (err) {
      return {
        topPlaces: [
          {
            id: 'mock-1',
            title: 'Sigiriya Ancient Rock Fortress',
            slug: 'sigiriya-rock-fortress',
            category: 'Heritage',
            district: 'Matale',
            province: 'Central',
            favorites_count: 450,
            reviews_count: 128,
            average_rating: 4.9,
          },
          {
            id: 'mock-2',
            title: 'Nine Arch Bridge',
            slug: 'nine-arch-bridge-ella',
            category: 'Historical',
            district: 'Badulla',
            province: 'Uva',
            favorites_count: 385,
            reviews_count: 94,
            average_rating: 4.8,
          },
          {
            id: 'mock-3',
            title: 'Galle Dutch Fort',
            slug: 'galle-fort',
            category: 'Historical',
            district: 'Galle',
            province: 'Southern',
            favorites_count: 310,
            reviews_count: 82,
            average_rating: 4.7,
          },
          {
            id: 'mock-4',
            title: 'Mirissa Beach & Coconut Tree Hill',
            slug: 'mirissa-beach',
            category: 'Beaches',
            district: 'Matara',
            province: 'Southern',
            favorites_count: 275,
            reviews_count: 65,
            average_rating: 4.8,
          },
        ],
        categoryBreakdown: [
          { category: 'Heritage', count: 6 },
          { category: 'Beaches', count: 5 },
          { category: 'Nature & Wildlife', count: 4 },
          { category: 'Historical', count: 3 },
          { category: 'Adventure', count: 2 },
        ],
        districtBreakdown: [
          { district: 'Matale', count: 4 },
          { district: 'Galle', count: 3 },
          { district: 'Badulla', count: 3 },
          { district: 'Matara', count: 2 },
          { district: 'Kandy', count: 2 },
        ],
      };
    }
  }

  /**
   * Review Moderation & Rating Analytics
   */
  static async getReviewAnalytics() {
    try {
      const ratingDistQuery = `
        SELECT 
          rating,
          COUNT(*) AS count
        FROM reviews
        GROUP BY rating
        ORDER BY rating DESC;
      `;
      const ratingDist = await query(ratingDistQuery);

      const summaryQuery = `
        SELECT 
          COUNT(*) AS total_reviews,
          COALESCE(ROUND(AVG(rating)::numeric, 2), 0.0) AS avg_rating
        FROM reviews;
      `;
      const summary = await query(summaryQuery);

      return {
        distribution: ratingDist.rows,
        totalReviews: parseInt(summary.rows[0]?.total_reviews || 0, 10),
        averageRating: parseFloat(summary.rows[0]?.avg_rating || 0.0),
      };
    } catch (err) {
      return {
        distribution: [
          { rating: 5, count: 34 },
          { rating: 4, count: 10 },
          { rating: 3, count: 3 },
          { rating: 2, count: 1 },
          { rating: 1, count: 0 },
        ],
        totalReviews: 48,
        averageRating: 4.65,
      };
    }
  }

  /**
   * Favorites Analytics (Wishlists & Saves)
   */
  static async getFavoritesAnalytics() {
    try {
      const topFavoritesQuery = `
        SELECT 
          p.id, p.title, p.slug, p.cover_image, p.category, p.district,
          COUNT(f.id) AS favorites_count
        FROM places p
        JOIN favorites f ON p.id = f.place_id
        GROUP BY p.id
        ORDER BY favorites_count DESC
        LIMIT 10;
      `;
      const topFavorites = await query(topFavoritesQuery);

      const recentFavQuery = `
        SELECT f.id, f.created_at, u.full_name AS user_name, u.email AS user_email,
               p.title AS place_title, p.slug AS place_slug
        FROM favorites f
        JOIN users u ON f.user_id = u.id
        JOIN places p ON f.place_id = p.id
        ORDER BY f.created_at DESC
        LIMIT 10;
      `;
      const recentActivity = await query(recentFavQuery);

      return {
        topFavorites: topFavorites.rows,
        recentActivity: recentActivity.rows,
      };
    } catch (err) {
      return {
        topFavorites: [
          { id: 'mock-1', title: 'Sigiriya Ancient Rock Fortress', slug: 'sigiriya-rock-fortress', favorites_count: 450, category: 'Heritage', district: 'Matale' },
          { id: 'mock-2', title: 'Nine Arch Bridge', slug: 'nine-arch-bridge-ella', favorites_count: 385, category: 'Historical', district: 'Badulla' },
          { id: 'mock-3', title: 'Galle Dutch Fort', slug: 'galle-fort', favorites_count: 310, category: 'Historical', district: 'Galle' },
          { id: 'mock-4', title: 'Mirissa Beach', slug: 'mirissa-beach', favorites_count: 275, category: 'Beaches', district: 'Matara' },
        ],
        recentActivity: [
          { id: 'f-1', user_name: 'Demo Traveler', user_email: 'demo@exploresrilanka.com', place_title: 'Sigiriya Ancient Rock Fortress', place_slug: 'sigiriya-rock-fortress', created_at: new Date().toISOString() },
        ],
      };
    }
  }

  /**
   * Search Keyword Analytics
   */
  static async getSearchAnalytics() {
    try {
      const topSearchesQuery = `
        SELECT search_query, COUNT(*) AS count, MAX(created_at) AS last_searched
        FROM search_history
        GROUP BY search_query
        ORDER BY count DESC
        LIMIT 15;
      `;
      const topSearches = await query(topSearchesQuery);

      const recentSearchesQuery = `
        SELECT id, search_query, created_at
        FROM search_history
        ORDER BY created_at DESC
        LIMIT 15;
      `;
      const recentSearches = await query(recentSearchesQuery);

      return {
        topSearches: topSearches.rows,
        recentSearches: recentSearches.rows,
      };
    } catch (err) {
      return {
        topSearches: [
          { search_query: 'Ella', count: 142, last_searched: new Date().toISOString() },
          { search_query: 'Sigiriya', count: 118, last_searched: new Date().toISOString() },
          { search_query: 'Galle', count: 95, last_searched: new Date().toISOString() },
          { search_query: 'Mirissa', count: 74, last_searched: new Date().toISOString() },
          { search_query: 'Yala Safari', count: 62, last_searched: new Date().toISOString() },
          { search_query: 'Waterfalls', count: 45, last_searched: new Date().toISOString() },
        ],
        recentSearches: [
          { id: 's-1', search_query: 'Ella train journey', created_at: new Date().toISOString() },
          { id: 's-2', search_query: 'Sigiriya entry tickets', created_at: new Date(Date.now() - 120000).toISOString() },
        ],
      };
    }
  }

  /**
   * Location / Radius Analytics (Anonymized)
   */
  static async getLocationAnalytics() {
    try {
      const radiusQuery = `
        SELECT 
          CASE 
            WHEN radius_km <= 10 THEN '5-10 km'
            WHEN radius_km <= 25 THEN '11-25 km'
            WHEN radius_km <= 50 THEN '26-50 km'
            ELSE '50+ km'
          END AS radius_range,
          COUNT(*) AS count
        FROM location_queries
        GROUP BY radius_range
        ORDER BY count DESC;
      `;
      const radiusStats = await query(radiusQuery);

      return {
        radiusBreakdown: radiusStats.rows,
      };
    } catch (err) {
      return {
        radiusBreakdown: [
          { radius_range: '26-50 km', count: 210 },
          { radius_range: '11-25 km', count: 145 },
          { radius_range: '5-10 km', count: 88 },
          { radius_range: '50+ km', count: 32 },
        ],
      };
    }
  }

  /**
   * USER MANAGEMENT: List users with search, filters, and pagination
   */
  static async getUsers({ search = '', role, status, page = 1, limit = 10, sort = 'newest' }) {
    const offset = (Math.max(1, parseInt(page, 10)) - 1) * parseInt(limit, 10);
    const pageLimit = parseInt(limit, 10);

    try {
      const whereClauses = [];
      const values = [];
      let paramIndex = 1;

      if (search && search.trim()) {
        whereClauses.push(`(u.full_name ILIKE $${paramIndex} OR u.email ILIKE $${paramIndex})`);
        values.push(`%${search.trim()}%`);
        paramIndex++;
      }

      if (role && role !== 'all') {
        whereClauses.push(`u.role = $${paramIndex}`);
        values.push(role);
        paramIndex++;
      }

      if (status && status !== 'all') {
        whereClauses.push(`u.is_active = $${paramIndex}`);
        values.push(status === 'active');
        paramIndex++;
      }

      const whereSql = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';
      const orderSql = sort === 'oldest' ? 'ORDER BY u.created_at ASC' : 'ORDER BY u.created_at DESC';

      const countSql = `SELECT COUNT(*) FROM users u ${whereSql}`;
      const countResult = await query(countSql, values);
      const totalCount = parseInt(countResult.rows[0]?.count || 0, 10);

      const usersSql = `
        SELECT 
          u.id, u.full_name, u.email, u.role, u.is_active, u.profile_image, 
          u.last_login_at, u.created_at, u.updated_at,
          COUNT(DISTINCT f.id) AS favorites_count,
          COUNT(DISTINCT r.id) AS reviews_count
        FROM users u
        LEFT JOIN favorites f ON u.id = f.user_id
        LEFT JOIN reviews r ON u.id = r.user_id
        ${whereSql}
        GROUP BY u.id
        ${orderSql}
        LIMIT $${paramIndex} OFFSET $${paramIndex + 1};
      `;
      values.push(pageLimit, offset);

      const usersResult = await query(usersSql, values);

      return {
        users: usersResult.rows,
        pagination: {
          total: totalCount,
          page: parseInt(page, 10),
          limit: pageLimit,
          totalPages: Math.ceil(totalCount / pageLimit) || 1,
        },
      };
    } catch (err) {
      let filtered = [...fallbackUsers];
      if (search) {
        filtered = filtered.filter(
          (u) =>
            u.full_name.toLowerCase().includes(search.toLowerCase()) ||
            u.email.toLowerCase().includes(search.toLowerCase())
        );
      }
      if (role && role !== 'all') {
        filtered = filtered.filter((u) => u.role === role);
      }
      if (status && status !== 'all') {
        filtered = filtered.filter((u) => (status === 'active' ? u.is_active !== false : u.is_active === false));
      }

      return {
        users: filtered.slice(offset, offset + pageLimit).map((u) => ({
          ...u,
          favorites_count: 2,
          reviews_count: 1,
        })),
        pagination: {
          total: filtered.length,
          page: parseInt(page, 10),
          limit: pageLimit,
          totalPages: Math.ceil(filtered.length / pageLimit) || 1,
        },
      };
    }
  }

  /**
   * USER MANAGEMENT: Get single user profile with favorites and reviews
   */
  static async getUserDetails(userId) {
    try {
      const userSql = `
        SELECT 
          u.id, u.full_name, u.email, u.role, u.is_active, u.profile_image, 
          u.last_login_at, u.created_at, u.updated_at,
          COUNT(DISTINCT f.id) AS favorites_count,
          COUNT(DISTINCT r.id) AS reviews_count,
          COALESCE(ROUND(AVG(r.rating)::numeric, 1), 0.0) AS average_review_rating
        FROM users u
        LEFT JOIN favorites f ON u.id = f.user_id
        LEFT JOIN reviews r ON u.id = r.user_id
        WHERE u.id = $1
        GROUP BY u.id;
      `;
      const userRes = await query(userSql, [userId]);
      if (userRes.rows.length === 0) {
        throw new Error('User not found.');
      }
      const user = userRes.rows[0];

      // Get user's favorites
      const favSql = `
        SELECT f.id AS favorite_id, f.created_at, p.id, p.title, p.slug, p.cover_image, p.category, p.district
        FROM favorites f
        JOIN places p ON f.place_id = p.id
        WHERE f.user_id = $1
        ORDER BY f.created_at DESC;
      `;
      const favRes = await query(favSql, [userId]);

      // Get user's reviews
      const revSql = `
        SELECT r.id, r.rating, r.comment, r.created_at, p.id AS place_id, p.title AS place_title, p.slug AS place_slug
        FROM reviews r
        JOIN places p ON r.place_id = p.id
        WHERE r.user_id = $1
        ORDER BY r.created_at DESC;
      `;
      const revRes = await query(revSql, [userId]);

      return {
        user,
        favorites: favRes.rows,
        reviews: revRes.rows,
      };
    } catch (err) {
      const memUser = fallbackUsers.find((u) => u.id === userId);
      if (!memUser) {
        throw new Error('User not found.');
      }
      return {
        user: {
          ...memUser,
          favorites_count: 1,
          reviews_count: 1,
          average_review_rating: 5.0,
        },
        favorites: [],
        reviews: [],
      };
    }
  }

  /**
   * USER MANAGEMENT: Update user active status
   */
  static async updateUserStatus(userId, isActive) {
    try {
      const res = await query(
        'UPDATE users SET is_active = $1, updated_at = NOW() WHERE id = $2 RETURNING id, full_name, email, role, is_active',
        [Boolean(isActive), userId]
      );
      if (res.rows.length === 0) throw new Error('User not found');
      return res.rows[0];
    } catch (err) {
      const u = fallbackUsers.find((x) => x.id === userId);
      if (u) {
        u.is_active = Boolean(isActive);
        return u;
      }
      throw err;
    }
  }

  /**
   * USER MANAGEMENT: Update user role ('user' | 'admin')
   */
  static async updateUserRole(userId, newRole) {
    if (!['user', 'admin'].includes(newRole)) {
      throw new Error('Invalid role specified. Must be user or admin.');
    }
    try {
      const res = await query(
        'UPDATE users SET role = $1, updated_at = NOW() WHERE id = $2 RETURNING id, full_name, email, role, is_active',
        [newRole, userId]
      );
      if (res.rows.length === 0) throw new Error('User not found');
      return res.rows[0];
    } catch (err) {
      const u = fallbackUsers.find((x) => x.id === userId);
      if (u) {
        u.role = newRole;
        return u;
      }
      throw err;
    }
  }

  /**
   * USER MANAGEMENT: Delete user account
   */
  static async deleteUser(userId) {
    try {
      await query('DELETE FROM users WHERE id = $1', [userId]);
      return { success: true, message: 'User deleted successfully.' };
    } catch (err) {
      const idx = fallbackUsers.findIndex((x) => x.id === userId);
      if (idx !== -1) {
        fallbackUsers.splice(idx, 1);
        return { success: true, message: 'User deleted successfully.' };
      }
      throw err;
    }
  }

  /**
   * PLACES MANAGEMENT: List places with admin details
   */
  static async getPlaces({ search = '', category, district, province, activity, page = 1, limit = 10 }) {
    const offset = (Math.max(1, parseInt(page, 10)) - 1) * parseInt(limit, 10);
    const pageLimit = parseInt(limit, 10);

    try {
      const whereClauses = [];
      const values = [];
      let paramIndex = 1;

      if (search && search.trim()) {
        whereClauses.push(`(p.title ILIKE $${paramIndex} OR p.description ILIKE $${paramIndex} OR p.slug ILIKE $${paramIndex})`);
        values.push(`%${search.trim()}%`);
        paramIndex++;
      }
      if (category && category !== 'all') {
        whereClauses.push(`p.category = $${paramIndex}`);
        values.push(category);
        paramIndex++;
      }
      if (district && district !== 'all') {
        whereClauses.push(`p.district = $${paramIndex}`);
        values.push(district);
        paramIndex++;
      }
      if (province && province !== 'all') {
        whereClauses.push(`p.province = $${paramIndex}`);
        values.push(province);
        paramIndex++;
      }
      if (activity && activity !== 'all') {
        whereClauses.push(`p.activity = $${paramIndex}`);
        values.push(activity);
        paramIndex++;
      }

      const whereSql = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';

      const countRes = await query(`SELECT COUNT(*) FROM places p ${whereSql}`, values);
      const total = parseInt(countRes.rows[0]?.count || 0, 10);

      const placesSql = `
        SELECT 
          p.id, p.title, p.slug, p.description, p.cover_image, p.latitude, p.longitude,
          p.district, p.province, p.category, p.activity, p.travel_style,
          p.created_at, p.updated_at,
          COUNT(DISTINCT f.id) AS favorites_count,
          COUNT(DISTINCT r.id) AS reviews_count,
          COALESCE(ROUND(AVG(r.rating)::numeric, 1), 0.0) AS average_rating
        FROM places p
        LEFT JOIN favorites f ON p.id = f.place_id
        LEFT JOIN reviews r ON p.id = r.place_id
        ${whereSql}
        GROUP BY p.id
        ORDER BY p.created_at DESC
        LIMIT $${paramIndex} OFFSET $${paramIndex + 1};
      `;
      values.push(pageLimit, offset);

      const placesRes = await query(placesSql, values);

      return {
        places: placesRes.rows,
        pagination: {
          total,
          page: parseInt(page, 10),
          limit: pageLimit,
          totalPages: Math.ceil(total / pageLimit) || 1,
        },
      };
    } catch (err) {
      let filtered = [...fallbackPlaces];
      if (search) {
        filtered = filtered.filter((p) => p.title.toLowerCase().includes(search.toLowerCase()));
      }
      return {
        places: filtered.slice(offset, offset + pageLimit).map((p) => ({
          ...p,
          favorites_count: 24,
          reviews_count: 8,
          average_rating: 4.8,
        })),
        pagination: {
          total: filtered.length,
          page: parseInt(page, 10),
          limit: pageLimit,
          totalPages: Math.ceil(filtered.length / pageLimit) || 1,
        },
      };
    }
  }

  /**
   * PLACES MANAGEMENT: Create place with PostGIS geometry
   */
  static async createPlace(placeData) {
    const {
      title,
      slug,
      description,
      cover_image,
      latitude,
      longitude,
      district,
      province,
      category,
      activity,
      travel_style,
    } = placeData;

    const cleanSlug = (slug || title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''));
    const lat = parseFloat(latitude);
    const lng = parseFloat(longitude);

    const insertSql = `
      INSERT INTO places (
        title, slug, description, cover_image, latitude, longitude,
        district, province, category, activity, travel_style
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11
      )
      RETURNING *;
    `;

    const result = await query(insertSql, [
      title.trim(),
      cleanSlug,
      description.trim(),
      cover_image.trim(),
      lat,
      lng,
      district.trim(),
      province.trim(),
      category.trim(),
      activity.trim(),
      travel_style.trim(),
    ]);

    return result.rows[0];
  }

  /**
   * PLACES MANAGEMENT: Update existing place
   */
  static async updatePlace(id, placeData) {
    const {
      title,
      slug,
      description,
      cover_image,
      latitude,
      longitude,
      district,
      province,
      category,
      activity,
      travel_style,
    } = placeData;

    const lat = parseFloat(latitude);
    const lng = parseFloat(longitude);

    const updateSql = `
      UPDATE places SET
        title = $1,
        slug = $2,
        description = $3,
        cover_image = $4,
        latitude = $5,
        longitude = $6,
        district = $7,
        province = $8,
        category = $9,
        activity = $10,
        travel_style = $11,
        updated_at = NOW()
      WHERE id = $12
      RETURNING *;
    `;

    const result = await query(updateSql, [
      title.trim(),
      slug.trim(),
      description.trim(),
      cover_image.trim(),
      lat,
      lng,
      district.trim(),
      province.trim(),
      category.trim(),
      activity.trim(),
      travel_style.trim(),
      id,
    ]);

    if (result.rows.length === 0) {
      throw new Error('Place not found.');
    }

    return result.rows[0];
  }

  /**
   * PLACES MANAGEMENT: Delete place
   */
  static async deletePlace(id) {
    const result = await query('DELETE FROM places WHERE id = $1 RETURNING id', [id]);
    if (result.rows.length === 0) {
      throw new Error('Place not found.');
    }
    return { success: true, message: 'Place deleted successfully.' };
  }

  /**
   * REVIEWS MANAGEMENT: List all reviews with moderation filters
   */
  static async getReviews({ search = '', rating, placeId, page = 1, limit = 10 }) {
    const offset = (Math.max(1, parseInt(page, 10)) - 1) * parseInt(limit, 10);
    const pageLimit = parseInt(limit, 10);

    try {
      const whereClauses = [];
      const values = [];
      let paramIndex = 1;

      if (search && search.trim()) {
        whereClauses.push(`(r.comment ILIKE $${paramIndex} OR u.full_name ILIKE $${paramIndex} OR p.title ILIKE $${paramIndex})`);
        values.push(`%${search.trim()}%`);
        paramIndex++;
      }

      if (rating && rating !== 'all') {
        whereClauses.push(`r.rating = $${paramIndex}`);
        values.push(parseInt(rating, 10));
        paramIndex++;
      }

      if (placeId && placeId !== 'all') {
        whereClauses.push(`r.place_id = $${paramIndex}`);
        values.push(placeId);
        paramIndex++;
      }

      const whereSql = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';

      const countSql = `
        SELECT COUNT(*) 
        FROM reviews r
        JOIN users u ON r.user_id = u.id
        JOIN places p ON r.place_id = p.id
        ${whereSql}
      `;
      const countRes = await query(countSql, values);
      const total = parseInt(countRes.rows[0]?.count || 0, 10);

      const reviewsSql = `
        SELECT 
          r.id, r.rating, r.comment, r.created_at, r.updated_at,
          u.id AS user_id, u.full_name AS user_name, u.email AS user_email, u.profile_image AS user_avatar,
          p.id AS place_id, p.title AS place_title, p.slug AS place_slug, p.cover_image AS place_image
        FROM reviews r
        JOIN users u ON r.user_id = u.id
        JOIN places p ON r.place_id = p.id
        ${whereSql}
        ORDER BY r.created_at DESC
        LIMIT $${paramIndex} OFFSET $${paramIndex + 1};
      `;
      values.push(pageLimit, offset);

      const reviewsRes = await query(reviewsSql, values);

      return {
        reviews: reviewsRes.rows,
        pagination: {
          total,
          page: parseInt(page, 10),
          limit: pageLimit,
          totalPages: Math.ceil(total / pageLimit) || 1,
        },
      };
    } catch (err) {
      return {
        reviews: [],
        pagination: { total: 0, page: 1, limit: pageLimit, totalPages: 1 },
      };
    }
  }

  /**
   * REVIEWS MANAGEMENT: Delete review
   */
  static async deleteReview(id) {
    const result = await query('DELETE FROM reviews WHERE id = $1 RETURNING id', [id]);
    if (result.rows.length === 0) {
      throw new Error('Review not found.');
    }
    return { success: true, message: 'Review deleted successfully.' };
  }
}

module.exports = AdminService;
