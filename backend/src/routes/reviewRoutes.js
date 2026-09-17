const express = require('express');
const router = express.Router();
const ReviewController = require('../controllers/reviewController');
const { protect } = require('../middleware/authMiddleware');

// 1. Public endpoints to get reviews and summary for a place
router.get('/place/:placeId/summary', ReviewController.getPlaceReviewSummary);
router.get('/place/:placeId', ReviewController.getPlaceReviews);

// 2. Protected endpoints requiring authentication
router.post('/', protect, ReviewController.addReview);
router.put('/:reviewId', protect, ReviewController.updateReview);
router.delete('/:reviewId', protect, ReviewController.deleteReview);

module.exports = router;
