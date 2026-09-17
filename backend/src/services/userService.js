const { query } = require('../config/database');
const { fallbackUsers, hashPassword, verifyPassword } = require('./authService');

class UserService {
  /**
   * Fetch user profile by ID
   */
  static async getProfile(userId) {
    try {
      const result = await query(
        `SELECT id, full_name, email, profile_image, created_at, updated_at 
         FROM users 
         WHERE id = $1 
         LIMIT 1`,
        [userId]
      );

      if (result.rows.length > 0) {
        return result.rows[0];
      }
    } catch (err) {
      console.warn('⚠️ [PostgreSQL Offline]: Looking up user profile in fallback cache.');
    }

    const cachedUser = fallbackUsers.find((u) => u.id === userId);
    if (!cachedUser) {
      const error = new Error('User not found.');
      error.status = 404;
      throw error;
    }

    const { password_hash, ...profile } = cachedUser;
    return profile;
  }

  /**
   * Update full_name and profile_image
   */
  static async updateProfile(userId, { full_name, profile_image }) {
    const fields = [];
    const values = [];
    let paramIdx = 1;

    if (full_name !== undefined && full_name.trim()) {
      fields.push(`full_name = $${paramIdx++}`);
      values.push(full_name.trim());
    }

    if (profile_image !== undefined) {
      fields.push(`profile_image = $${paramIdx++}`);
      values.push(profile_image ? profile_image.trim() : null);
    }

    fields.push(`updated_at = NOW()`);
    values.push(userId);

    const updateSql = `
      UPDATE users 
      SET ${fields.join(', ')} 
      WHERE id = $${paramIdx} 
      RETURNING id, full_name, email, profile_image, updated_at;
    `;

    try {
      const result = await query(updateSql, values);
      if (result.rows.length > 0) {
        return result.rows[0];
      }
    } catch (err) {
      console.warn('⚠️ [PostgreSQL Offline]: Updating user profile in fallback cache.');
    }

    const cachedUser = fallbackUsers.find((u) => u.id === userId);
    if (!cachedUser) {
      const error = new Error('User not found.');
      error.status = 404;
      throw error;
    }

    if (full_name !== undefined) cachedUser.full_name = full_name.trim();
    if (profile_image !== undefined) cachedUser.profile_image = profile_image ? profile_image.trim() : null;
    cachedUser.updated_at = new Date().toISOString();

    const { password_hash, ...profile } = cachedUser;
    return profile;
  }

  /**
   * Change account password after verifying current password
   */
  static async changePassword(userId, { current_password, new_password }) {
    try {
      const result = await query(
        `SELECT password_hash FROM users WHERE id = $1 LIMIT 1`,
        [userId]
      );

      let currentHash = result.rows[0]?.password_hash;

      if (!currentHash) {
        const cached = fallbackUsers.find((u) => u.id === userId);
        currentHash = cached?.password_hash;
      }

      if (!currentHash) {
        const error = new Error('User not found.');
        error.status = 404;
        throw error;
      }

      const isMatch = await verifyPassword(current_password, currentHash);
      if (!isMatch) {
        const error = new Error('Current password is incorrect.');
        error.status = 400;
        throw error;
      }

      const newHash = await hashPassword(new_password);

      await query(
        `UPDATE users SET password_hash = $1, updated_at = NOW() WHERE id = $2`,
        [newHash, userId]
      );

      return { message: 'Password changed successfully.' };
    } catch (err) {
      if (err.status) throw err;

      const cached = fallbackUsers.find((u) => u.id === userId);
      if (cached) {
        const isMatch = await verifyPassword(current_password, cached.password_hash);
        if (!isMatch) {
          const error = new Error('Current password is incorrect.');
          error.status = 400;
          throw error;
        }

        cached.password_hash = await hashPassword(new_password);
        return { message: 'Password changed successfully.' };
      }

      throw err;
    }
  }
}

module.exports = UserService;
