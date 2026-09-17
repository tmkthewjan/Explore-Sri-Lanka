const { AuthService } = require('../services/authService');

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

class AuthController {
  /**
   * POST /api/auth/register
   */
  static async register(req, res, next) {
    try {
      const { full_name, email, password } = req.body;

      if (!full_name || typeof full_name !== 'string' || !full_name.trim()) {
        return res.status(400).json({
          success: false,
          message: 'Full name is required.',
        });
      }

      if (!email || typeof email !== 'string' || !EMAIL_REGEX.test(email.trim())) {
        return res.status(400).json({
          success: false,
          message: 'A valid email address is required.',
        });
      }

      if (!password || typeof password !== 'string') {
        return res.status(400).json({
          success: false,
          message: 'Password is required.',
        });
      }

      if (password.length < 8) {
        return res.status(400).json({
          success: false,
          message: 'Password must be at least 8 characters long.',
        });
      }

      const user = await AuthService.register({
        full_name,
        email,
        password,
      });

      return res.status(201).json({
        success: true,
        message: 'Registration successful',
        user: {
          id: user.id,
          full_name: user.full_name,
          email: user.email,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/auth/login
   */
  static async login(req, res, next) {
    try {
      const { email, password } = req.body;

      if (!email || typeof email !== 'string') {
        return res.status(400).json({
          success: false,
          message: 'Email is required.',
        });
      }

      if (!password || typeof password !== 'string') {
        return res.status(400).json({
          success: false,
          message: 'Password is required.',
        });
      }

      const result = await AuthService.login({ email, password });

      return res.status(200).json({
        success: true,
        message: 'Login successful',
        token: result.token,
        user: result.user,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/auth/forgot-password
   */
  static async forgotPassword(req, res, next) {
    try {
      const { email } = req.body;

      if (!email || typeof email !== 'string' || !EMAIL_REGEX.test(email.trim())) {
        return res.status(400).json({
          success: false,
          message: 'A valid email address is required.',
        });
      }

      const response = await AuthService.forgotPassword({ email });

      return res.status(200).json({
        success: true,
        ...response,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/auth/reset-password
   */
  static async resetPassword(req, res, next) {
    try {
      const { token, new_password } = req.body;

      if (!token || typeof token !== 'string') {
        return res.status(400).json({
          success: false,
          message: 'Password reset token is required.',
        });
      }

      if (!new_password || typeof new_password !== 'string' || new_password.length < 8) {
        return res.status(400).json({
          success: false,
          message: 'New password must be at least 8 characters long.',
        });
      }

      const response = await AuthService.resetPassword({
        token,
        new_password,
      });

      return res.status(200).json({
        success: true,
        ...response,
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = AuthController;
