const FavoriteService = require('../services/favoriteService');

class FavoriteController {
  /**
   * POST /api/favorites
   * Body: { place_id }
   */
  static async addFavorite(req, res, next) {
    try {
      const { place_id } = req.body;

      if (!place_id || typeof place_id !== 'string') {
        return res.status(400).json({
          success: false,
          message: 'place_id is required.',
        });
      }

      const result = await FavoriteService.addFavorite(req.user.id, place_id);

      return res.status(200).json({
        success: true,
        message: result.already_favorited ? 'Already in favorites' : 'Added to favorites',
        ...result,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * DELETE /api/favorites/:placeId
   */
  static async removeFavorite(req, res, next) {
    try {
      const { placeId } = req.params;

      const result = await FavoriteService.removeFavorite(req.user.id, placeId);

      return res.status(200).json({
        success: true,
        message: 'Removed from favorites',
        ...result,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/favorites
   */
  static async getUserFavorites(req, res, next) {
    try {
      const favorites = await FavoriteService.getUserFavorites(req.user.id);

      return res.status(200).json({
        success: true,
        count: favorites.length,
        data: favorites,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/favorites/check/:placeId
   */
  static async checkFavorite(req, res, next) {
    try {
      const { placeId } = req.params;
      const userId = req.user?.id || null;

      const result = await FavoriteService.checkFavorite(userId, placeId);

      return res.status(200).json({
        success: true,
        ...result,
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = FavoriteController;
