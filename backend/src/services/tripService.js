const { query } = require('../config/database');

// In-memory fallback trips store if database is offline
const fallbackTrips = [];

class TripService {
  /**
   * Helper to categorize trip status based on travel_date vs now in Asia/Colombo
   */
  static categorizeTrip(travelDate) {
    const tripTime = new Date(travelDate).getTime();
    const now = new Date();
    
    // Start of today in local date
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const todayEnd = todayStart + 24 * 60 * 60 * 1000;

    if (tripTime >= todayStart && tripTime < todayEnd) {
      return 'today';
    } else if (tripTime >= todayEnd) {
      return 'upcoming';
    } else {
      return 'past';
    }
  }

  /**
   * Get all trips for the authenticated user with place details
   */
  static async getUserTrips(userId) {
    try {
      const sql = `
        SELECT 
          t.id,
          t.user_id,
          t.place_id,
          t.travel_date,
          t.notes,
          t.reminder_enabled,
          t.reminder_sent,
          t.reminder_sent_at,
          t.created_at,
          t.updated_at,
          p.title AS place_title,
          p.slug AS place_slug,
          p.cover_image AS place_cover_image,
          p.district AS place_district,
          p.province AS place_province,
          p.category AS place_category,
          p.latitude AS place_latitude,
          p.longitude AS place_longitude
        FROM planned_trips t
        JOIN places p ON t.place_id = p.id
        WHERE t.user_id = $1
        ORDER BY t.travel_date ASC;
      `;

      const result = await query(sql, [userId]);
      return result.rows.map((row) => ({
        ...row,
        status: TripService.categorizeTrip(row.travel_date),
      }));
    } catch (err) {
      console.warn('⚠️ [PostgreSQL Offline]: Fetching trips from fallback cache.');
      const userTrips = fallbackTrips.filter((t) => t.user_id === userId);
      return userTrips.map((row) => ({
        ...row,
        status: TripService.categorizeTrip(row.travel_date),
      }));
    }
  }

  /**
   * Get a single trip by ID for the authenticated user
   */
  static async getTripById(tripId, userId) {
    try {
      const sql = `
        SELECT 
          t.id,
          t.user_id,
          t.place_id,
          t.travel_date,
          t.notes,
          t.reminder_enabled,
          t.reminder_sent,
          t.reminder_sent_at,
          t.created_at,
          t.updated_at,
          p.title AS place_title,
          p.slug AS place_slug,
          p.cover_image AS place_cover_image,
          p.district AS place_district,
          p.province AS place_province,
          p.category AS place_category,
          p.latitude AS place_latitude,
          p.longitude AS place_longitude
        FROM planned_trips t
        JOIN places p ON t.place_id = p.id
        WHERE t.id = $1 AND t.user_id = $2
        LIMIT 1;
      `;

      const result = await query(sql, [tripId, userId]);
      if (result.rows.length === 0) {
        const error = new Error('Trip not found or unauthorized.');
        error.status = 404;
        throw error;
      }

      const trip = result.rows[0];
      return {
        ...trip,
        status: TripService.categorizeTrip(trip.travel_date),
      };
    } catch (err) {
      if (err.status) throw err;
      const trip = fallbackTrips.find((t) => t.id === tripId && t.user_id === userId);
      if (!trip) {
        const error = new Error('Trip not found or unauthorized.');
        error.status = 404;
        throw error;
      }
      return {
        ...trip,
        status: TripService.categorizeTrip(trip.travel_date),
      };
    }
  }

  /**
   * Create a new planned trip
   */
  static async createTrip(userId, { place_id, travel_date, notes, reminder_enabled = true }) {
    // 1. Verify place exists
    let place = null;
    try {
      const placeRes = await query(
        `SELECT id, title, slug, cover_image, district, province, category, latitude, longitude 
         FROM places 
         WHERE id = $1 
         LIMIT 1`,
        [place_id]
      );
      if (placeRes.rows.length === 0) {
        const error = new Error('Selected destination does not exist.');
        error.status = 404;
        throw error;
      }
      place = placeRes.rows[0];
    } catch (err) {
      if (err.status) throw err;
      // Fallback place search
      const { samplePlaces } = require('../data/samplePlaces');
      place = samplePlaces.find((p) => p.id === place_id);
      if (!place) {
        const error = new Error('Selected destination does not exist.');
        error.status = 404;
        throw error;
      }
    }

    // 2. Validate travel date
    const parsedDate = new Date(travel_date);
    if (isNaN(parsedDate.getTime())) {
      const error = new Error('Invalid travel date provided.');
      error.status = 400;
      throw error;
    }

    try {
      const insertSql = `
        INSERT INTO planned_trips (
          user_id, place_id, travel_date, notes, reminder_enabled, reminder_sent
        ) VALUES (
          $1, $2, $3, $4, $5, FALSE
        )
        RETURNING *;
      `;

      const result = await query(insertSql, [
        userId,
        place_id,
        parsedDate.toISOString(),
        notes ? notes.trim() : null,
        Boolean(reminder_enabled),
      ]);

      const trip = result.rows[0];
      return {
        ...trip,
        place_title: place.title,
        place_slug: place.slug,
        place_cover_image: place.cover_image,
        place_district: place.district,
        place_province: place.province,
        place_category: place.category,
        place_latitude: place.latitude,
        place_longitude: place.longitude,
        status: TripService.categorizeTrip(trip.travel_date),
      };
    } catch (err) {
      console.warn('⚠️ [PostgreSQL Offline]: Creating trip in fallback cache.');
      const fallbackTrip = {
        id: `mock-trip-${Date.now()}`,
        user_id: userId,
        place_id,
        travel_date: parsedDate.toISOString(),
        notes: notes ? notes.trim() : null,
        reminder_enabled: Boolean(reminder_enabled),
        reminder_sent: false,
        reminder_sent_at: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        place_title: place.title,
        place_slug: place.slug,
        place_cover_image: place.cover_image,
        place_district: place.district,
        place_province: place.province,
        place_category: place.category,
        place_latitude: place.latitude,
        place_longitude: place.longitude,
        status: TripService.categorizeTrip(parsedDate.toISOString()),
      };

      fallbackTrips.push(fallbackTrip);
      return fallbackTrip;
    }
  }

  /**
   * Update an existing planned trip
   */
  static async updateTrip(tripId, userId, { travel_date, notes, reminder_enabled }) {
    // Check if trip exists and belongs to user
    await TripService.getTripById(tripId, userId);

    const fields = [];
    const values = [];
    let paramIdx = 1;

    if (travel_date !== undefined) {
      const parsedDate = new Date(travel_date);
      if (isNaN(parsedDate.getTime())) {
        const error = new Error('Invalid travel date provided.');
        error.status = 400;
        throw error;
      }
      fields.push(`travel_date = $${paramIdx++}`);
      values.push(parsedDate.toISOString());

      // If new future date, reset reminder_sent so user receives notification
      fields.push(`reminder_sent = FALSE`);
      fields.push(`reminder_sent_at = NULL`);
    }

    if (notes !== undefined) {
      fields.push(`notes = $${paramIdx++}`);
      values.push(notes ? notes.trim() : null);
    }

    if (reminder_enabled !== undefined) {
      fields.push(`reminder_enabled = $${paramIdx++}`);
      values.push(Boolean(reminder_enabled));
    }

    fields.push(`updated_at = NOW()`);
    values.push(tripId);
    values.push(userId);

    try {
      const updateSql = `
        UPDATE planned_trips
        SET ${fields.join(', ')}
        WHERE id = $${paramIdx++} AND user_id = $${paramIdx++}
        RETURNING *;
      `;

      await query(updateSql, values);
      return TripService.getTripById(tripId, userId);
    } catch (err) {
      console.warn('⚠️ [PostgreSQL Offline]: Updating trip in fallback cache.');
      const trip = fallbackTrips.find((t) => t.id === tripId && t.user_id === userId);
      if (trip) {
        if (travel_date !== undefined) {
          trip.travel_date = new Date(travel_date).toISOString();
          trip.reminder_sent = false;
        }
        if (notes !== undefined) trip.notes = notes ? notes.trim() : null;
        if (reminder_enabled !== undefined) trip.reminder_enabled = Boolean(reminder_enabled);
        trip.updated_at = new Date().toISOString();
        trip.status = TripService.categorizeTrip(trip.travel_date);
        return trip;
      }
      throw err;
    }
  }

  /**
   * Delete a planned trip
   */
  static async deleteTrip(tripId, userId) {
    try {
      const deleteSql = `
        DELETE FROM planned_trips 
        WHERE id = $1 AND user_id = $2
        RETURNING id;
      `;

      const result = await query(deleteSql, [tripId, userId]);
      if (result.rows.length === 0) {
        const error = new Error('Trip not found or unauthorized.');
        error.status = 404;
        throw error;
      }

      return { success: true, message: 'Trip deleted successfully.' };
    } catch (err) {
      if (err.status) throw err;
      const idx = fallbackTrips.findIndex((t) => t.id === tripId && t.user_id === userId);
      if (idx !== -1) {
        fallbackTrips.splice(idx, 1);
        return { success: true, message: 'Trip deleted successfully.' };
      }
      const error = new Error('Trip not found or unauthorized.');
      error.status = 404;
      throw error;
    }
  }
}

module.exports = TripService;
