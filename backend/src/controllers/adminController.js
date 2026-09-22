const AdminService = require('../services/adminService');

class AdminController {
  /**
   * GET /api/admin/dashboard
   */
  static async getDashboard(req, res, next) {
    try {
      const { period = '30d' } = req.query;
      const data = await AdminService.getDashboardStats(period);
      res.status(200).json({
        success: true,
        data,
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /api/admin/analytics/users
   */
  static async getUserAnalytics(req, res, next) {
    try {
      const { period = '30d' } = req.query;
      const data = await AdminService.getUserAnalytics(period);
      res.status(200).json({
        success: true,
        data,
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /api/admin/analytics/places
   */
  static async getPlaceAnalytics(req, res, next) {
    try {
      const data = await AdminService.getPlaceAnalytics();
      res.status(200).json({
        success: true,
        data,
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /api/admin/analytics/reviews
   */
  static async getReviewAnalytics(req, res, next) {
    try {
      const data = await AdminService.getReviewAnalytics();
      res.status(200).json({
        success: true,
        data,
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /api/admin/analytics/favorites
   */
  static async getFavoritesAnalytics(req, res, next) {
    try {
      const data = await AdminService.getFavoritesAnalytics();
      res.status(200).json({
        success: true,
        data,
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /api/admin/analytics/searches
   */
  static async getSearchAnalytics(req, res, next) {
    try {
      const data = await AdminService.getSearchAnalytics();
      res.status(200).json({
        success: true,
        data,
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /api/admin/analytics/locations
   */
  static async getLocationAnalytics(req, res, next) {
    try {
      const data = await AdminService.getLocationAnalytics();
      res.status(200).json({
        success: true,
        data,
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /api/admin/users
   */
  static async getUsers(req, res, next) {
    try {
      const { search, role, status, page, limit, sort } = req.query;
      const data = await AdminService.getUsers({
        search,
        role,
        status,
        page,
        limit,
        sort,
      });
      res.status(200).json({
        success: true,
        ...data,
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /api/admin/users/:id
   */
  static async getUserDetails(req, res, next) {
    try {
      const { id } = req.params;
      const data = await AdminService.getUserDetails(id);
      res.status(200).json({
        success: true,
        data,
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * PUT /api/admin/users/:id/status
   */
  static async updateUserStatus(req, res, next) {
    try {
      const { id } = req.params;
      const { is_active } = req.body;
      if (is_active === undefined) {
        return res.status(400).json({
          success: false,
          message: 'is_active field (boolean) is required.',
        });
      }
      const updatedUser = await AdminService.updateUserStatus(id, is_active);
      res.status(200).json({
        success: true,
        message: `User status successfully updated to ${is_active ? 'active' : 'inactive'}.`,
        user: updatedUser,
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * PUT /api/admin/users/:id/role
   */
  static async updateUserRole(req, res, next) {
    try {
      const { id } = req.params;
      const { role } = req.body;
      if (!role || !['user', 'admin'].includes(role)) {
        return res.status(400).json({
          success: false,
          message: 'Valid role (user or admin) is required.',
        });
      }
      const updatedUser = await AdminService.updateUserRole(id, role);
      res.status(200).json({
        success: true,
        message: `User role updated to ${role}.`,
        user: updatedUser,
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * DELETE /api/admin/users/:id
   */
  static async deleteUser(req, res, next) {
    try {
      const { id } = req.params;
      // Prevent admin from deleting own account
      if (req.user && req.user.id === id) {
        return res.status(400).json({
          success: false,
          message: 'You cannot delete your own active administrator account.',
        });
      }
      const result = await AdminService.deleteUser(id);
      res.status(200).json(result);
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /api/admin/places
   */
  static async getPlaces(req, res, next) {
    try {
      const { search, category, district, province, activity, page, limit } = req.query;
      const data = await AdminService.getPlaces({
        search,
        category,
        district,
        province,
        activity,
        page,
        limit,
      });
      res.status(200).json({
        success: true,
        ...data,
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * POST /api/admin/places
   */
  static async createPlace(req, res, next) {
    try {
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
      } = req.body;

      if (!title || !description || !cover_image || latitude === undefined || longitude === undefined || !district || !province || !category || !activity || !travel_style) {
        return res.status(400).json({
          success: false,
          message: 'All place fields (title, description, cover_image, latitude, longitude, district, province, category, activity, travel_style) are required.',
        });
      }

      const newPlace = await AdminService.createPlace(req.body);
      res.status(201).json({
        success: true,
        message: 'Place created successfully',
        data: newPlace,
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * PUT /api/admin/places/:id
   */
  static async updatePlace(req, res, next) {
    try {
      const { id } = req.params;
      const updatedPlace = await AdminService.updatePlace(id, req.body);
      res.status(200).json({
        success: true,
        message: 'Place updated successfully',
        data: updatedPlace,
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * DELETE /api/admin/places/:id
   */
  static async deletePlace(req, res, next) {
    try {
      const { id } = req.params;
      const result = await AdminService.deletePlace(id);
      res.status(200).json(result);
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /api/admin/reviews
   */
  static async getReviews(req, res, next) {
    try {
      const { search, rating, placeId, page, limit } = req.query;
      const data = await AdminService.getReviews({
        search,
        rating,
        placeId,
        page,
        limit,
      });
      res.status(200).json({
        success: true,
        ...data,
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * DELETE /api/admin/reviews/:id
   */
  static async deleteReview(req, res, next) {
    try {
      const { id } = req.params;
      const result = await AdminService.deleteReview(id);
      res.status(200).json(result);
    } catch (err) {
      next(err);
    }
  }
}

module.exports = AdminController;
