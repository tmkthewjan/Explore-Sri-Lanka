const UserService = require('../services/userService');

class UserController {
  /**
   * GET /api/users/profile
   * Returns current authenticated user profile
   */
  static async getProfile(req, res, next) {
    try {
      const user = await UserService.getProfile(req.user.id);
      return res.status(200).json({
        success: true,
        data: user,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * PUT /api/users/profile
   * Updates full_name and/or profile_image
   */
  static async updateProfile(req, res, next) {
    try {
      const { full_name, profile_image } = req.body;

      if (full_name !== undefined && !full_name.trim()) {
        return res.status(400).json({
          success: false,
          message: 'Full name cannot be empty.',
        });
      }

      const updatedUser = await UserService.updateProfile(req.user.id, {
        full_name,
        profile_image,
      });

      return res.status(200).json({
        success: true,
        message: 'Profile updated successfully',
        data: updatedUser,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * PUT /api/users/change-password
   * Verifies current password and updates to new password
   */
  static async changePassword(req, res, next) {
    try {
      const { current_password, new_password } = req.body;

      if (!current_password) {
        return res.status(400).json({
          success: false,
          message: 'Current password is required.',
        });
      }

      if (!new_password || new_password.length < 8) {
        return res.status(400).json({
          success: false,
          message: 'New password must be at least 8 characters long.',
        });
      }

      const result = await UserService.changePassword(req.user.id, {
        current_password,
        new_password,
      });

      return res.status(200).json({
        success: true,
        message: result.message,
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = UserController;
