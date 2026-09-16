const express = require('express');
const router = express.Router();
const PlaceController = require('../controllers/placeController');

// 1. Nearby Search (PostGIS radius query) - Must precede /:id
router.get('/nearby', PlaceController.getNearbyPlaces);

// 2. Keyword Search across title, tags, description - Must precede /:id
router.get('/search', PlaceController.searchPlaces);

// 3. Metadata for UI filters (categories, districts) - Must precede /:id
router.get('/metadata', PlaceController.getMetadata);

// 4. List all places with query filtering & pagination
router.get('/', PlaceController.getAllPlaces);

// 5. Get single place by UUID or slug (with optional distance calculation)
router.get('/:id', PlaceController.getPlaceByIdOrSlug);

module.exports = router;
