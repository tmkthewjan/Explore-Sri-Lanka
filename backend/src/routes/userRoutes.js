const express = require('express');
const router = express.Router();
const UserController = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');

// All user routes require a valid JWT token
router.use(protect);

// 1. Get profile
router.get('/profile', UserController.getProfile);

// 2. Update full_name and/or profile_image
router.put('/profile', UserController.updateProfile);

// 3. Change password
router.put('/change-password', UserController.changePassword);

module.exports = router;
