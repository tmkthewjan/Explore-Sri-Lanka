const express = require('express');
const router = express.Router();
const AdminController = require('../controllers/adminController');
const { protect } = require('../middleware/authMiddleware');
const { requireAdmin } = require('../middleware/adminMiddleware');

// Enforce authentication & admin role across all routes in this router
router.use(protect);
router.use(requireAdmin);

// ==========================================
// 1. DASHBOARD & ANALYTICS
// ==========================================
router.get('/dashboard', AdminController.getDashboard);
router.get('/analytics/users', AdminController.getUserAnalytics);
router.get('/analytics/places', AdminController.getPlaceAnalytics);
router.get('/analytics/reviews', AdminController.getReviewAnalytics);
router.get('/analytics/favorites', AdminController.getFavoritesAnalytics);
router.get('/analytics/searches', AdminController.getSearchAnalytics);
router.get('/analytics/locations', AdminController.getLocationAnalytics);

// ==========================================
// 2. USER MANAGEMENT
// ==========================================
router.get('/users', AdminController.getUsers);
router.get('/users/:id', AdminController.getUserDetails);
router.put('/users/:id/status', AdminController.updateUserStatus);
router.put('/users/:id/role', AdminController.updateUserRole);
router.delete('/users/:id', AdminController.deleteUser);

// ==========================================
// 3. PLACES MANAGEMENT
// ==========================================
router.get('/places', AdminController.getPlaces);
router.post('/places', AdminController.createPlace);
router.put('/places/:id', AdminController.updatePlace);
router.delete('/places/:id', AdminController.deletePlace);

// ==========================================
// 4. REVIEWS MANAGEMENT
// ==========================================
router.get('/reviews', AdminController.getReviews);
router.delete('/reviews/:id', AdminController.deleteReview);

module.exports = router;
