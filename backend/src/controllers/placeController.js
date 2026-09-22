const PlaceService = require('../services/placeService');

/**
 * Controller handling HTTP requests for places
 */
class PlaceController {
  /**
   * GET /api/places
   * Get all places with optional filters (category, district, province, activity, travel_style)
   */
  static async getAllPlaces(req, res, next) {
    try {
      const {
        category,
        district,
        province,
        activity,
        travel_style,
        page,
        limit,
        sort,
      } = req.query;

      const result = await PlaceService.getAllPlaces({
        category,
        district,
        province,
        activity,
        travel_style,
        page,
        limit,
        sort,
      });

      res.status(200).json({
        success: true,
        data: result.places,
        pagination: result.pagination,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/places/nearby?lat=6.9271&lng=79.8612&radius=25&category=Beach
   * Get places within radius km sorted from nearest to farthest
   */
  static async getNearbyPlaces(req, res, next) {
    try {
      const { lat, lng, radius = 25, category, limit = 50 } = req.query;

      // Validate coordinates
      if (lat === undefined || lng === undefined) {
        return res.status(400).json({
          success: false,
          message: 'Query parameters "lat" and "lng" are required for nearby search.',
        });
      }

      const parsedLat = parseFloat(lat);
      const parsedLng = parseFloat(lng);
      const parsedRadius = parseFloat(radius);

      if (isNaN(parsedLat) || parsedLat < -90 || parsedLat > 90) {
        return res.status(400).json({
          success: false,
          message: 'Invalid latitude. Must be a decimal number between -90 and 90.',
        });
      }

      if (isNaN(parsedLng) || parsedLng < -180 || parsedLng > 180) {
        return res.status(400).json({
          success: false,
          message: 'Invalid longitude. Must be a decimal number between -180 and 180.',
        });
      }

      if (isNaN(parsedRadius) || parsedRadius <= 0) {
        return res.status(400).json({
          success: false,
          message: 'Invalid radius. Must be a positive number in kilometers.',
        });
      }

      const places = await PlaceService.getNearbyPlaces({
        lat: parsedLat,
        lng: parsedLng,
        radius: parsedRadius,
        category,
        limit,
      });

      // Asynchronously log anonymized nearby query
      try {
        const { query } = require('../config/database');
        query(
          'INSERT INTO location_queries (latitude, longitude, radius_km, category) VALUES ($1, $2, $3, $4)',
          [parsedLat, parsedLng, parsedRadius, category || null]
        ).catch(() => {});
      } catch (e) {}

      res.status(200).json({
        success: true,
        count: places.length,
        user_location: {
          latitude: parsedLat,
          longitude: parsedLng,
        },
        radius_km: parsedRadius,
        data: places,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/places/search?q=Ella
   * Keyword search across multiple fields
   */
  static async searchPlaces(req, res, next) {
    try {
      const { q, limit = 20 } = req.query;

      if (!q || !q.trim()) {
        return res.status(400).json({
          success: false,
          message: 'Query parameter "q" is required for search.',
        });
      }

      const places = await PlaceService.searchPlaces(q, limit);

      // Asynchronously log search keyword
      try {
        const { query } = require('../config/database');
        const userId = req.user ? req.user.id : null;
        query('INSERT INTO search_history (user_id, search_query) VALUES ($1, $2)', [userId, q.trim()]).catch(() => {});
      } catch (e) {}

      res.status(200).json({
        success: true,
        query: q,
        count: places.length,
        data: places,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/places/metadata
   * Returns categories, districts, and travel styles with counts
   */
  static async getMetadata(req, res, next) {
    try {
      const metadata = await PlaceService.getMetadata();
      res.status(200).json({
        success: true,
        data: metadata,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/places/:id
   * Get single place by UUID or slug, with optional distance calculation if user lat/lng provided
   */
  static async getPlaceByIdOrSlug(req, res, next) {
    try {
      const { id } = req.params;
      const { lat, lng } = req.query;

      const userLat = lat ? parseFloat(lat) : null;
      const userLng = lng ? parseFloat(lng) : null;

      const place = await PlaceService.getPlaceByIdOrSlug(id, userLat, userLng);

      if (!place) {
        return res.status(404).json({
          success: false,
          message: `Place with identifier '${id}' was not found.`,
        });
      }

      res.status(200).json({
        success: true,
        data: place,
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = PlaceController;
