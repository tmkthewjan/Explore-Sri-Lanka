const { query } = require('../config/database');
const { sendTripReminderEmail } = require('../config/mailer');

let cron = null;
try {
  cron = require('node-cron');
} catch (e) {
  // Graceful fallback active
}

class ReminderService {
  /**
   * Scans database for trips occurring in the next 24 hours needing email reminders
   */
  static async checkAndSendReminders() {
    try {
      const pendingTripsSql = `
        SELECT 
          t.id AS trip_id,
          t.travel_date,
          t.notes,
          u.id AS user_id,
          u.full_name AS user_name,
          u.email AS user_email,
          p.title AS place_title,
          p.district AS place_district
        FROM planned_trips t
        JOIN users u ON t.user_id = u.id
        JOIN places p ON t.place_id = p.id
        WHERE 
          t.reminder_enabled = TRUE
          AND t.reminder_sent = FALSE
          AND t.travel_date >= NOW()
          AND t.travel_date <= NOW() + INTERVAL '24 hours';
      `;

      const result = await query(pendingTripsSql);
      const pendingTrips = result.rows;

      if (pendingTrips.length === 0) return;

      console.log(`⏰ [ReminderService]: Found ${pendingTrips.length} upcoming trip reminder(s) to send.`);

      for (const trip of pendingTrips) {
        try {
          const tripDate = new Date(trip.travel_date);
          const travelDateStr = tripDate.toLocaleDateString('en-US', {
            timeZone: 'Asia/Colombo',
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          });

          const travelTimeStr = tripDate.toLocaleTimeString('en-US', {
            timeZone: 'Asia/Colombo',
            hour: '2-digit',
            minute: '2-digit',
          });

          // Dispatch email
          await sendTripReminderEmail({
            to: trip.user_email,
            userName: trip.user_name,
            placeTitle: trip.place_title,
            travelDateStr,
            travelTimeStr,
            notes: trip.notes,
          });

          // Only mark as sent if email succeeded
          await query(
            `UPDATE planned_trips 
             SET reminder_sent = TRUE, reminder_sent_at = NOW(), updated_at = NOW() 
             WHERE id = $1`,
            [trip.trip_id]
          );

          console.log(`✅ [ReminderService]: Reminder successfully sent for trip ${trip.trip_id} (${trip.place_title}) to ${trip.user_email}`);
        } catch (tripError) {
          console.error(`❌ [ReminderService]: Failed to process reminder for trip ${trip.trip_id}:`, tripError.message);
        }
      }
    } catch (err) {
      // Ignored if DB table does not exist or DB is offline
    }
  }

  /**
   * Initializes the recurring reminder cron job (every 15 minutes)
   */
  static initReminderScheduler() {
    if (cron) {
      // Run every 15 minutes
      cron.schedule('*/15 * * * *', () => {
        ReminderService.checkAndSendReminders();
      });
      console.log('⏰ [ReminderService]: node-cron scheduled to check trip reminders every 15 minutes.');
    } else {
      // Interval fallback if node-cron package not installed
      setInterval(() => {
        ReminderService.checkAndSendReminders();
      }, 15 * 60 * 1000);
      console.log('⏰ [ReminderService]: Native timer scheduled to check trip reminders every 15 minutes.');
    }

    // Run initial scan after short delay on server startup
    setTimeout(() => {
      ReminderService.checkAndSendReminders();
    }, 5000);
  }
}

module.exports = ReminderService;
