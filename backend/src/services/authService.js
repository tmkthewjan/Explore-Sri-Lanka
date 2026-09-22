const crypto = require('crypto');
const { query } = require('../config/database');

// Try optional packages if installed; otherwise use native Node.js crypto
let bcrypt = null;
try {
  bcrypt = require('bcryptjs');
} catch (e) {
  // Native fallback active
}

let jwt = null;
try {
  jwt = require('jsonwebtoken');
} catch (e) {
  // Native fallback active
}

// In-memory fallback cache with default seeded accounts
const fallbackUsers = [];

/**
 * Universal password hasher (uses bcrypt if available, else native crypto scrypt/pbkdf2)
 */
async function hashPassword(password) {
  if (bcrypt) {
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(password, salt);
  }
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
  return `${salt}:${hash}`;
}

// Seed default accounts
(async () => {
  try {
    const demoPassHash = await hashPassword('Password123!');
    const adminPassHash = await hashPassword('Admin123!');

    fallbackUsers.push(
      {
        id: 'mock-user-demo-001',
        full_name: 'Demo Traveler',
        email: 'demo@exploresrilanka.com',
        role: 'user',
        is_active: true,
        last_login_at: new Date().toISOString(),
        password_hash: demoPassHash,
        profile_image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
        created_at: new Date().toISOString(),
      },
      {
        id: 'mock-user-admin-001',
        full_name: 'System Admin',
        email: 'admin@exploresrilanka.com',
        role: 'admin',
        is_active: true,
        last_login_at: new Date().toISOString(),
        password_hash: adminPassHash,
        profile_image: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=400&q=80',
        created_at: new Date().toISOString(),
      }
    );

    // If PostgreSQL is available, ensure schema columns and seeded users exist in DB
    setTimeout(async () => {
      try {
        // Ensure columns exist
        await query(`
          ALTER TABLE users ADD COLUMN IF NOT EXISTS role VARCHAR(20) DEFAULT 'user';
          ALTER TABLE users ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE;
          ALTER TABLE users ADD COLUMN IF NOT EXISTS last_login_at TIMESTAMP WITH TIME ZONE;
          
          CREATE TABLE IF NOT EXISTS search_history (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            user_id UUID REFERENCES users(id) ON DELETE SET NULL,
            search_query VARCHAR(255) NOT NULL,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
          );

          CREATE TABLE IF NOT EXISTS location_queries (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            latitude DOUBLE PRECISION NOT NULL,
            longitude DOUBLE PRECISION NOT NULL,
            radius_km DOUBLE PRECISION NOT NULL,
            category VARCHAR(100),
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
          );
        `);

        // Upsert default users with roles
        await query(
          `INSERT INTO users (full_name, email, password_hash, profile_image, role, is_active, last_login_at)
           VALUES 
            ($1, $2, $3, $4, $5, TRUE, NOW()),
            ($6, $7, $8, $9, $10, TRUE, NOW())
           ON CONFLICT (email) DO UPDATE 
           SET role = EXCLUDED.role,
               password_hash = EXCLUDED.password_hash;`,
          [
            'Demo Traveler', 'demo@exploresrilanka.com', demoPassHash, 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80', 'user',
            'System Admin', 'admin@exploresrilanka.com', adminPassHash, 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=400&q=80', 'admin'
          ]
        );
      } catch (e) {
        // Ignored if DB table not yet created or DB offline
      }
    }, 1000);
  } catch (err) {
    console.warn('Error seeding default auth users:', err);
  }
})();

/**
 * Universal password verifier
 */
async function verifyPassword(password, storedHash) {
  if (!storedHash) return false;

  if (storedHash.startsWith('$2a$') || storedHash.startsWith('$2b$')) {
    if (bcrypt) return bcrypt.compare(password, storedHash);
    return false;
  }

  if (storedHash.includes(':')) {
    const [salt, hash] = storedHash.split(':');
    const verifyHash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
    return hash === verifyHash;
  }

  return false;
}

class AuthService {
  /**
   * Helper: Signs a JSON Web Token
   */
  static generateToken(user) {
    const secret = process.env.JWT_SECRET || 'super_secret_jwt_key_explore_sri_lanka_2026';
    const expiresIn = process.env.JWT_EXPIRES_IN || '7d';

    if (jwt) {
      return jwt.sign(
        {
          id: user.id,
          email: user.email,
          full_name: user.full_name,
          role: user.role || 'user',
        },
        secret,
        { expiresIn }
      );
    }

    // Native standard HMAC-SHA256 JWT Token
    const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
    const expTime = Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60; // 7 days
    const payload = Buffer.from(
      JSON.stringify({
        id: user.id,
        email: user.email,
        full_name: user.full_name,
        role: user.role || 'user',
        exp: expTime,
      })
    ).toString('base64url');

    const signature = crypto
      .createHmac('sha256', secret)
      .update(`${header}.${payload}`)
      .digest('base64url');

    return `${header}.${payload}.${signature}`;
  }

  /**
   * Register a new user
   */
  static async register({ full_name, email, password }) {
    const normalizedEmail = email.trim().toLowerCase();
    const cleanName = full_name.trim();

    const passwordHash = await hashPassword(password);

    try {
      const existing = await query(
        'SELECT id FROM users WHERE email = $1 LIMIT 1',
        [normalizedEmail]
      );

      if (existing.rows.length > 0) {
        const error = new Error('An account with this email address already exists.');
        error.status = 409;
        throw error;
      }

      const insertSql = `
        INSERT INTO users (full_name, email, password_hash, role, is_active, last_login_at)
        VALUES ($1, $2, $3, 'user', TRUE, NOW())
        RETURNING id, full_name, email, role, is_active, profile_image, created_at;
      `;

      const result = await query(insertSql, [cleanName, normalizedEmail, passwordHash]);
      return result.rows[0];
    } catch (dbError) {
      if (dbError.status === 409 || dbError.code === '23505') {
        const error = new Error('An account with this email address already exists.');
        error.status = 409;
        throw error;
      }

      console.warn('⚠️ [PostgreSQL Offline]: Registering user in fallback local cache.');
      const existsInCache = fallbackUsers.find((u) => u.email === normalizedEmail);
      if (existsInCache) {
        const error = new Error('An account with this email address already exists.');
        error.status = 409;
        throw error;
      }

      const fallbackUser = {
        id: `mock-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        full_name: cleanName,
        email: normalizedEmail,
        role: 'user',
        is_active: true,
        last_login_at: new Date().toISOString(),
        password_hash: passwordHash,
        profile_image: null,
        created_at: new Date().toISOString(),
      };

      fallbackUsers.push(fallbackUser);
      const { password_hash, ...userWithoutPassword } = fallbackUser;
      return userWithoutPassword;
    }
  }

  /**
   * Login user & return JWT token + user profile
   */
  static async login({ email, password }) {
    const normalizedEmail = email.trim().toLowerCase();

    try {
      const result = await query(
        `SELECT id, full_name, email, password_hash, role, is_active, profile_image, last_login_at
         FROM users 
         WHERE email = $1 
         LIMIT 1`,
        [normalizedEmail]
      );

      let user = result.rows[0];

      if (!user) {
        user = fallbackUsers.find((u) => u.email === normalizedEmail);
      }

      if (!user) {
        const error = new Error('Invalid email or password.');
        error.status = 401;
        throw error;
      }

      // Check active status
      if (user.is_active === false) {
        const error = new Error('This account has been deactivated. Please contact support.');
        error.status = 403;
        throw error;
      }

      // Verify password
      const isMatch = await verifyPassword(password, user.password_hash);
      if (!isMatch) {
        const error = new Error('Invalid email or password.');
        error.status = 401;
        throw error;
      }

      // Update last_login_at in database
      try {
        await query('UPDATE users SET last_login_at = NOW() WHERE id = $1', [user.id]);
      } catch (e) {
        user.last_login_at = new Date().toISOString();
      }

      // Generate JWT
      const token = this.generateToken(user);

      return {
        token,
        user: {
          id: user.id,
          full_name: user.full_name,
          email: user.email,
          role: user.role || 'user',
          is_active: user.is_active !== false,
          last_login_at: user.last_login_at,
          profile_image: user.profile_image || null,
        },
      };
    } catch (error) {
      if (error.status === 401 || error.status === 403) {
        throw error;
      }

      const cachedUser = fallbackUsers.find((u) => u.email === normalizedEmail);
      if (cachedUser) {
        if (cachedUser.is_active === false) {
          const deactErr = new Error('This account has been deactivated. Please contact support.');
          deactErr.status = 403;
          throw deactErr;
        }

        const isMatch = await verifyPassword(password, cachedUser.password_hash);
        if (isMatch) {
          cachedUser.last_login_at = new Date().toISOString();
          const token = this.generateToken(cachedUser);
          return {
            token,
            user: {
              id: cachedUser.id,
              full_name: cachedUser.full_name,
              email: cachedUser.email,
              role: cachedUser.role || 'user',
              is_active: cachedUser.is_active !== false,
              last_login_at: cachedUser.last_login_at,
              profile_image: cachedUser.profile_image || null,
            },
          };
        }
      }

      const authError = new Error('Invalid email or password.');
      authError.status = 401;
      throw authError;
    }
  }


  /**
   * Generate password reset token
   */
  static async forgotPassword({ email }) {
    const normalizedEmail = email.trim().toLowerCase();
    const resetToken = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour validity

    try {
      const updateResult = await query(
        `UPDATE users 
         SET reset_password_token = $1, reset_password_expires = $2 
         WHERE email = $3 
         RETURNING id, full_name, email`,
        [resetToken, expiresAt, normalizedEmail]
      );

      if (updateResult.rows.length > 0) {
        console.log(`\n======================================================`);
        console.log(`🔑 [DEV PASSWORD RESET LINK]:`);
        console.log(`   http://localhost:3000/reset-password?token=${resetToken}`);
        console.log(`======================================================\n`);
      }
    } catch (err) {
      console.warn('⚠️ [PostgreSQL Offline]: Simulating password reset token generation.');
      const cachedUser = fallbackUsers.find((u) => u.email === normalizedEmail);
      if (cachedUser) {
        cachedUser.reset_password_token = resetToken;
        cachedUser.reset_password_expires = expiresAt;
        console.log(`\n🔑 [DEV PASSWORD RESET LINK]: http://localhost:3000/reset-password?token=${resetToken}\n`);
      }
    }

    return {
      message: 'If the email exists, a password reset link has been sent.',
      ...(process.env.NODE_ENV === 'development' && { dev_reset_token: resetToken }),
    };
  }

  /**
   * Reset password using token
   */
  static async resetPassword({ token, new_password }) {
    const cleanToken = token.trim();
    const newHash = await hashPassword(new_password);

    try {
      const result = await query(
        `UPDATE users 
         SET password_hash = $1, reset_password_token = NULL, reset_password_expires = NULL, updated_at = NOW() 
         WHERE reset_password_token = $2 AND reset_password_expires > NOW() 
         RETURNING id, email`,
        [newHash, cleanToken]
      );

      if (result.rows.length === 0) {
        const error = new Error('Password reset token is invalid or has expired.');
        error.status = 400;
        throw error;
      }

      return {
        message: 'Password reset successful. You can now log in with your new password.',
      };
    } catch (err) {
      if (err.status === 400) throw err;

      const cachedUser = fallbackUsers.find(
        (u) => u.reset_password_token === cleanToken && new Date(u.reset_password_expires) > new Date()
      );

      if (!cachedUser) {
        const error = new Error('Password reset token is invalid or has expired.');
        error.status = 400;
        throw error;
      }

      cachedUser.password_hash = newHash;
      cachedUser.reset_password_token = null;
      cachedUser.reset_password_expires = null;

      return {
        message: 'Password reset successful. You can now log in with your new password.',
      };
    }
  }
}

module.exports = {
  AuthService,
  fallbackUsers,
  hashPassword,
  verifyPassword,
};
