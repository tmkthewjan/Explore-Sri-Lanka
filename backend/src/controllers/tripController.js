const TripService = require('../services/tripService');

class TripController {
  /**
   * GET /api/trips
   * Returns all trips for the authenticated user
   */
  static async getUserTrips(req, res, next) {
    try {
      const trips = await TripService.getUserTrips(req.user.id);
      return res.status(200).json({
        success: true,
        count: trips.length,
        data: trips,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/trips/:id
   * Returns a single trip (must belong to authenticated user)
   */
  static async getTripById(req, res, next) {
    try {
      const { id } = req.params;
      const trip = await TripService.getTripById(id, req.user.id);
      return res.status(200).json({
        success: true,
        data: trip,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/trips
   * Creates a new planned trip for the authenticated user
   */
  static async createTrip(req, res, next) {
    try {
      const { place_id, travel_date, notes, reminder_enabled } = req.body;

      if (!place_id) {
        return res.status(400).json({
          success: false,
          message: 'place_id (destination) is required.',
        });
      }

      if (!travel_date) {
        return res.status(400).json({
          success: false,
          message: 'travel_date is required.',
        });
      }

      const parsedDate = new Date(travel_date);
      if (isNaN(parsedDate.getTime())) {
        return res.status(400).json({
          success: false,
          message: 'Invalid travel_date format.',
        });
      }

      if (parsedDate.getTime() <= Date.now()) {
        return res.status(400).json({
          success: false,
          message: 'Travel date must be in the future.',
        });
      }

      if (notes && notes.length > 1000) {
        return res.status(400).json({
          success: false,
          message: 'Trip notes cannot exceed 1000 characters.',
        });
      }

      const trip = await TripService.createTrip(req.user.id, {
        place_id,
        travel_date,
        notes,
        reminder_enabled,
      });

      return res.status(201).json({
        success: true,
        message: 'Trip planned successfully.',
        data: trip,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * PUT /api/trips/:id
   * Updates the authenticated user's trip
   */
  static async updateTrip(req, res, next) {
    try {
      const { id } = req.params;
      const { travel_date, notes, reminder_enabled } = req.body;

      if (travel_date !== undefined) {
        const parsedDate = new Date(travel_date);
        if (isNaN(parsedDate.getTime())) {
          return res.status(400).json({
            success: false,
            message: 'Invalid travel_date format.',
          });
        }
      }

      if (notes !== undefined && notes !== null && notes.length > 1000) {
        return res.status(400).json({
          success: false,
          message: 'Trip notes cannot exceed 1000 characters.',
        });
      }

      const trip = await TripService.updateTrip(id, req.user.id, {
        travel_date,
        notes,
        reminder_enabled,
      });

      return res.status(200).json({
        success: true,
        message: 'Trip updated successfully.',
        data: trip,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * DELETE /api/trips/:id
   * Deletes the authenticated user's trip
   */
  static async deleteTrip(req, res, next) {
    try {
      const { id } = req.params;
      const result = await TripService.deleteTrip(id, req.user.id);
      return res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = TripController;
