const express = require('express');
const router = express.Router();
const FavoriteController = require('../controllers/favoriteController');
const { protect, optionalAuth } = require('../middleware/authMiddleware');

// 1. Check favorite status for a place (Guests receive { isFavorite: false })
router.get('/check/:placeId', optionalAuth, FavoriteController.checkFavorite);

// Protected routes below
router.use(protect);

// 2. Add place to favorites
router.post('/', FavoriteController.addFavorite);

// 3. Get all user's favorite places
router.get('/', FavoriteController.getUserFavorites);

// 4. Remove place from favorites
router.delete('/:placeId', FavoriteController.removeFavorite);

module.exports = router;
