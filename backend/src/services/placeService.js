const { query } = require('../config/database');
const { samplePlaces, calculateDistanceKm } = require('../data/samplePlaces');

/**
 * Service layer handling database queries with graceful fallback
 */
class PlaceService {
  /**
   * Get all places with optional filtering and pagination
   */
  static async getAllPlaces(filters = {}) {
    const {
      category,
      district,
      province,
      activity,
      travel_style,
      page = 1,
      limit = 50,
      sort = 'title_asc',
    } = filters;

    const parsedLimit = Math.min(Math.max(parseInt(limit, 10) || 20, 1), 100);
    const parsedPage = Math.max(parseInt(page, 10) || 1, 1);
    const offset = (parsedPage - 1) * parsedLimit;

    try {
      const conditions = [];
      const values = [];
      let paramIndex = 1;

      if (category) {
        conditions.push(`category ILIKE $${paramIndex++}`);
        values.push(category);
      }
      if (district) {
        conditions.push(`district ILIKE $${paramIndex++}`);
        values.push(district);
      }
      if (province) {
        conditions.push(`province ILIKE $${paramIndex++}`);
        values.push(province);
      }
      if (activity) {
        conditions.push(`activity ILIKE $${paramIndex++}`);
        values.push(activity);
      }
      if (travel_style) {
        conditions.push(`travel_style ILIKE $${paramIndex++}`);
        values.push(travel_style);
      }

      const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

      let orderBy = 'ORDER BY title ASC';
      if (sort === 'created_desc') orderBy = 'ORDER BY created_at DESC';
      if (sort === 'title_desc') orderBy = 'ORDER BY title DESC';

      const countSql = `SELECT COUNT(*) AS total FROM places ${whereClause}`;
      const countRes = await query(countSql, values);
      const totalCount = parseInt(countRes.rows[0].total, 10);

      const dataSql = `
        SELECT 
          id, title, slug, description, cover_image,
          latitude, longitude, district, province,
          category, activity, travel_style,
          created_at, updated_at
        FROM places
        ${whereClause}
        ${orderBy}
        LIMIT $${paramIndex++} OFFSET $${paramIndex++}
      `;

      values.push(parsedLimit, offset);
      const result = await query(dataSql, values);

      return {
        places: result.rows,
        pagination: {
          page: parsedPage,
          limit: parsedLimit,
          total_items: totalCount,
          total_pages: Math.ceil(totalCount / parsedLimit),
          has_more: offset + result.rows.length < totalCount,
        },
      };
    } catch (dbError) {
      console.warn(`⚠️ [PostgreSQL Offline/Refused]: Serving ${samplePlaces.length} places from resilient cache.`);

      let filtered = [...samplePlaces];
      if (category) {
        filtered = filtered.filter((p) => p.category.toLowerCase() === category.toLowerCase());
      }
      if (district) {
        filtered = filtered.filter((p) => p.district.toLowerCase() === district.toLowerCase());
      }
      if (province) {
        filtered = filtered.filter((p) => p.province.toLowerCase() === province.toLowerCase());
      }
      if (activity) {
        filtered = filtered.filter((p) => p.activity.toLowerCase() === activity.toLowerCase());
      }
      if (travel_style) {
        filtered = filtered.filter((p) => p.travel_style.toLowerCase() === travel_style.toLowerCase());
      }

      const paginated = filtered.slice(offset, offset + parsedLimit);
      return {
        places: paginated,
        pagination: {
          page: parsedPage,
          limit: parsedLimit,
          total_items: filtered.length,
          total_pages: Math.ceil(filtered.length / parsedLimit),
          has_more: offset + paginated.length < filtered.length,
        },
      };
    }
  }

  /**
   * Get single place by UUID or slug
   */
  static async getPlaceByIdOrSlug(identifier, userLat = null, userLng = null) {
    try {
      const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(identifier);

      let distanceSelect = '';
      const params = [identifier];

      if (userLat !== null && userLng !== null) {
        params.push(parseFloat(userLng), parseFloat(userLat));
        distanceSelect = `, ROUND((ST_Distance(location, ST_SetSRID(ST_MakePoint($2, $3), 4326)::geography) / 1000.0)::numeric, 2) AS distance_km`;
      }

      const sql = `
        SELECT 
          id, title, slug, description, cover_image,
          latitude, longitude, district, province,
          category, activity, travel_style,
          created_at, updated_at
          ${distanceSelect}
        FROM places
        WHERE ${isUuid ? 'id = $1' : 'slug = $1'}
        LIMIT 1
      `;

      const result = await query(sql, params);
      if (result.rows.length > 0) {
        return result.rows[0];
      }
    } catch (err) {
      console.warn('⚠️ [PostgreSQL Offline]: Looking up place from fallback dataset.');
    }

    // Fallback search
    const place = samplePlaces.find(
      (p) => p.slug === identifier || p.id === identifier
    );

    if (!place) return null;

    const copy = { ...place };
    if (userLat !== null && userLng !== null) {
      copy.distance_km = calculateDistanceKm(userLat, userLng, copy.latitude, copy.longitude);
    }
    return copy;
  }

  /**
   * Search nearby places using PostGIS get_nearby_places() with Haversine fallback
   */
  static async getNearbyPlaces({ lat, lng, radius = 25, category = null, limit = 50 }) {
    const parsedLat = parseFloat(lat);
    const parsedLng = parseFloat(lng);
    const parsedRadius = parseFloat(radius);
    const parsedLimit = Math.min(Math.max(parseInt(limit, 10) || 50, 1), 100);

    try {
      const sql = `
        SELECT 
          id, title, slug, description, cover_image,
          latitude, longitude, district, province,
          category, activity, travel_style,
          distance_km
        FROM get_nearby_places($1, $2, $3, $4)
        LIMIT $5
      `;

      const result = await query(sql, [
        parsedLat,
        parsedLng,
        parsedRadius,
        category || null,
        parsedLimit,
      ]);

      return result.rows;
    } catch (err) {
      console.warn('⚠️ [PostgreSQL Offline]: Computing spatial nearby places using Haversine algorithm.');

      let filtered = samplePlaces.map((p) => {
        const dist = calculateDistanceKm(parsedLat, parsedLng, p.latitude, p.longitude);
        return { ...p, distance_km: dist };
      });

      if (category) {
        filtered = filtered.filter((p) => p.category.toLowerCase() === category.toLowerCase());
      }

      filtered = filtered.filter((p) => p.distance_km <= parsedRadius);
      filtered.sort((a, b) => a.distance_km - b.distance_km);

      return filtered.slice(0, parsedLimit);
    }
  }

  /**
   * Full-text / keyword search
   */
  static async searchPlaces(searchTerm, limit = 20) {
    const term = `%${searchTerm.trim()}%`;
    const parsedLimit = Math.min(Math.max(parseInt(limit, 10) || 20, 1), 50);

    try {
      const sql = `
        SELECT 
          id, title, slug, description, cover_image,
          latitude, longitude, district, province,
          category, activity, travel_style
        FROM places
        WHERE 
          title ILIKE $1 
          OR description ILIKE $1 
          OR district ILIKE $1 
          OR category ILIKE $1 
          OR activity ILIKE $1 
          OR province ILIKE $1
        ORDER BY 
          CASE 
            WHEN title ILIKE $1 THEN 1
            WHEN category ILIKE $1 THEN 2
            WHEN district ILIKE $1 THEN 3
            ELSE 4
          END,
          title ASC
        LIMIT $2
      `;

      const result = await query(sql, [term, parsedLimit]);
      return result.rows;
    } catch (err) {
      const q = searchTerm.toLowerCase();
      const matched = samplePlaces.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.district.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          p.activity.toLowerCase().includes(q)
      );
      return matched.slice(0, parsedLimit);
    }
  }

  /**
   * Returns distinct categories and districts with item counts
   */
  static async getMetadata() {
    try {
      const categoriesRes = await query(`
        SELECT category, COUNT(*) AS count 
        FROM places 
        GROUP BY category 
        ORDER BY count DESC;
      `);

      const districtsRes = await query(`
        SELECT district, province, COUNT(*) AS count 
        FROM places 
        GROUP BY district, province 
        ORDER BY district ASC;
      `);

      const travelStylesRes = await query(`
        SELECT travel_style, COUNT(*) AS count 
        FROM places 
        GROUP BY travel_style 
        ORDER BY count DESC;
      `);

      return {
        categories: categoriesRes.rows,
        districts: districtsRes.rows,
        travel_styles: travelStylesRes.rows,
      };
    } catch (err) {
      // Calculate counts from samplePlaces
      const catCounts = {};
      const distCounts = {};
      const styleCounts = {};

      samplePlaces.forEach((p) => {
        catCounts[p.category] = (catCounts[p.category] || 0) + 1;
        distCounts[p.district] = {
          count: ((distCounts[p.district]?.count) || 0) + 1,
          province: p.province,
        };
        styleCounts[p.travel_style] = (styleCounts[p.travel_style] || 0) + 1;
      });

      return {
        categories: Object.entries(catCounts).map(([category, count]) => ({
          category,
          count,
        })),
        districts: Object.entries(distCounts).map(([district, data]) => ({
          district,
          province: data.province,
          count: data.count,
        })),
        travel_styles: Object.entries(styleCounts).map(([travel_style, count]) => ({
          travel_style,
          count,
        })),
      };
    }
  }
}

module.exports = PlaceService;
