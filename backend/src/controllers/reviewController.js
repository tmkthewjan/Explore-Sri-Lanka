const ReviewService = require('../services/reviewService');

class ReviewController {
  /**
   * POST /api/reviews
   * Body: { place_id, rating, comment }
   */
  static async addReview(req, res, next) {
    try {
      const placeId = req.body.place_id || req.body.placeId;
      const { rating, comment } = req.body;

      if (!placeId) {
        return res.status(400).json({
          success: false,
          message: 'place_id is required.',
        });
      }

      const numRating = parseInt(rating, 10);
      if (isNaN(numRating) || numRating < 1 || numRating > 5) {
        return res.status(400).json({
          success: false,
          message: 'Rating must be an integer between 1 and 5.',
        });
      }

      if (!comment || typeof comment !== 'string' || comment.trim().length < 3) {
        return res.status(400).json({
          success: false,
          message: 'Review comment must be at least 3 characters long.',
        });
      }

      if (comment.length > 2000) {
        return res.status(400).json({
          success: false,
          message: 'Review comment cannot exceed 2000 characters.',
        });
      }

      const review = await ReviewService.addReview({
        userId: req.user.id,
        placeId,
        rating: numRating,
        comment,
      });

      return res.status(201).json({
        success: true,
        message: 'Review submitted successfully.',
        data: review,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * PUT /api/reviews/:reviewId
   * Body: { rating, comment }
   */
  static async updateReview(req, res, next) {
    try {
      const { reviewId } = req.params;
      const { rating, comment } = req.body;

      const numRating = parseInt(rating, 10);
      if (isNaN(numRating) || numRating < 1 || numRating > 5) {
        return res.status(400).json({
          success: false,
          message: 'Rating must be an integer between 1 and 5.',
        });
      }

      if (!comment || typeof comment !== 'string' || comment.trim().length < 3) {
        return res.status(400).json({
          success: false,
          message: 'Review comment must be at least 3 characters long.',
        });
      }

      const updatedReview = await ReviewService.updateReview({
        reviewId,
        userId: req.user.id,
        rating: numRating,
        comment,
      });

      return res.status(200).json({
        success: true,
        message: 'Review updated successfully.',
        data: updatedReview,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * DELETE /api/reviews/:reviewId
   */
  static async deleteReview(req, res, next) {
    try {
      const { reviewId } = req.params;

      const result = await ReviewService.deleteReview({
        reviewId,
        userId: req.user.id,
      });

      return res.status(200).json({
        success: true,
        ...result,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/reviews/place/:placeId
   */
  static async getPlaceReviews(req, res, next) {
    try {
      const { placeId } = req.params;
      const limit = parseInt(req.query.limit, 10) || 50;

      const reviews = await ReviewService.getPlaceReviews(placeId, limit);

      return res.status(200).json({
        success: true,
        count: reviews.length,
        data: reviews,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/reviews/place/:placeId/summary
   */
  static async getPlaceReviewSummary(req, res, next) {
    try {
      const { placeId } = req.params;

      const summary = await ReviewService.getPlaceReviewSummary(placeId);

      return res.status(200).json({
        success: true,
        data: summary,
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = ReviewController;
