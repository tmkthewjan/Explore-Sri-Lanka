let nodemailer = null;
try {
  nodemailer = require('nodemailer');
} catch (e) {
  // Graceful fallback active if nodemailer is not installed
}

/**
 * Configure Nodemailer Transport
 */
let transporter = null;

if (nodemailer && process.env.MAIL_HOST && process.env.MAIL_USER) {
  transporter = nodemailer.createTransport({
    host: process.env.MAIL_HOST,
    port: parseInt(process.env.MAIL_PORT || '587', 10),
    secure: process.env.MAIL_PORT === '465', // true for 465, false for other ports
    auth: {
      user: process.env.MAIL_USER,
      pass: process.env.MAIL_PASSWORD,
    },
  });
}

/**
 * Sends a trip reminder email
 * @param {Object} options
 * @param {string} options.to - Recipient email address
 * @param {string} options.userName - User's full name
 * @param {string} options.placeTitle - Destination name
 * @param {string} options.travelDateStr - Formatted travel date string
 * @param {string} options.travelTimeStr - Formatted travel time string
 * @param {string} options.notes - User's trip notes
 */
async function sendTripReminderEmail({
  to,
  userName,
  placeTitle,
  travelDateStr,
  travelTimeStr,
  notes,
}) {
  const mailFrom = process.env.MAIL_FROM || '"Explore Sri Lanka" <no-reply@exploresrilanka.com>';
  const subject = `Explore Sri Lanka – Trip Reminder: ${placeTitle} 🇱🇰`;

  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f8fafc; margin: 0; padding: 24px; color: #1e293b; }
          .card { background-color: #ffffff; max-width: 580px; margin: 0 auto; border-radius: 20px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.06); border: 1px solid #e2e8f0; }
          .header { background: linear-gradient(135deg, #059669, #0d9488); padding: 32px 24px; text-align: center; color: #ffffff; }
          .header h1 { margin: 0; font-size: 24px; font-weight: 800; letter-spacing: -0.5px; }
          .header p { margin: 6px 0 0 0; font-size: 13px; opacity: 0.9; }
          .content { padding: 32px 28px; }
          .greeting { font-size: 16px; font-weight: 600; color: #0f172a; margin-bottom: 12px; }
          .details-box { background-color: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 14px; padding: 20px; margin: 20px 0; }
          .detail-row { display: flex; margin-bottom: 8px; font-size: 14px; }
          .detail-label { font-weight: 700; color: #166534; width: 120px; shrink: 0; }
          .detail-val { color: #1e293b; font-weight: 500; }
          .notes-box { background-color: #f8fafc; border-left: 4px solid #10b981; padding: 12px 16px; margin: 16px 0; font-style: italic; font-size: 13px; color: #475569; }
          .footer { background-color: #f8fafc; padding: 20px 24px; text-align: center; font-size: 12px; color: #64748b; border-top: 1px solid #f1f5f9; }
        </style>
      </head>
      <body>
        <div class="card">
          <div class="header">
            <h1>Explore Sri Lanka 🇱🇰</h1>
            <p>Upcoming Trip Reminder</p>
          </div>
          <div class="content">
            <div class="greeting">Ayubowan, ${userName}! 👋</div>
            <p style="font-size: 14px; line-height: 1.6; color: #475569; margin: 0 0 16px 0;">
              Your planned journey to <strong style="color: #059669;">${placeTitle}</strong> is coming up within the next 24 hours. Here are your trip details:
            </p>

            <div class="details-box">
              <div class="detail-row">
                <span class="detail-label">📍 Destination:</span>
                <span class="detail-val">${placeTitle}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">📅 Date:</span>
                <span class="detail-val">${travelDateStr}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">⏰ Departure:</span>
                <span class="detail-val">${travelTimeStr} (Asia/Colombo)</span>
              </div>
            </div>

            ${
              notes
                ? `<p style="font-size: 13px; font-weight: 600; margin: 0 0 4px 0; color: #334155;">Trip Notes:</p>
                   <div class="notes-box">&ldquo;${notes}&rdquo;</div>`
                : ''
            }

            <p style="font-size: 14px; line-height: 1.6; color: #475569; margin: 20px 0 0 0;">
              Have a safe and wonderful exploration across Sri Lanka!
            </p>
          </div>
          <div class="footer">
            Explore Sri Lanka Tourism Platform • Geolocation & Travel System<br>
            Automated trip notification based on your reminder preferences.
          </div>
        </div>
      </body>
    </html>
  `;

  if (transporter) {
    return transporter.sendMail({
      from: mailFrom,
      to,
      subject,
      html: htmlContent,
    });
  }

  // Fallback logger for development environment
  console.log(`\n======================================================`);
  console.log(`📧 [DEV EMAIL TRIP REMINDER DISPATCHED]:`);
  console.log(`   To          : ${to} (${userName})`);
  console.log(`   Destination : ${placeTitle}`);
  console.log(`   Travel Date : ${travelDateStr} at ${travelTimeStr} (Asia/Colombo)`);
  if (notes) console.log(`   Notes       : ${notes}`);
  console.log(`======================================================\n`);

  return { messageId: `mock-mail-${Date.now()}` };
}

module.exports = {
  sendTripReminderEmail,
};
