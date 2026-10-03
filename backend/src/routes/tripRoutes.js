const express = require('express');
const router = express.Router();
const TripController = require('../controllers/tripController');
const { protect } = require('../middleware/authMiddleware');

// All trip routes require a valid JWT token
router.use(protect);

// 1. Get all trips for the authenticated user
router.get('/', TripController.getUserTrips);

// 2. Create a new planned trip
router.post('/', TripController.createTrip);

// 3. Get single trip details
router.get('/:id', TripController.getTripById);

// 4. Update an existing trip
router.put('/:id', TripController.updateTrip);

// 5. Delete a trip
router.delete('/:id', TripController.deleteTrip);

module.exports = router;
